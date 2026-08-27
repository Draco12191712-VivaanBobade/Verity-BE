// ─────────────────────────────────────────────────────────────────────────
// absence_ambush.js
//
// Multiplayer "Familiarity / Absence / Ambush" system for Verity.
// Self-contained: subscribes to its own world events independently of the
// main chatSend dispatcher in verity.js. To wire it in, just import it once
// for side effects from your entry point, e.g.:
//     import "./absence_ambush.js";
//
// Feature summary
// ───────────────
// 1. Familiarity — a player becomes "familiar" the first time they're ever
//    seen. Tracked as a world-scoped dynamic property keyed by the stable
//    Player.id (not name, so name changes don't break tracking).
// 2. Absence — each online player's "last seen" day is refreshed on a
//    lightweight interval (playerLeave's event only hands back playerId /
//    playerName, not a live Player object, so we can't rely on that event to
//    write the final value — periodic refresh sidesteps that entirely).
// 3. Ambush — if a *familiar* player's last-seen day is
//    ABSENCE_DAYS_THRESHOLD or more days behind the current day when they
//    rejoin, Verity marks that specific player hunted and a scripted
//    stalk-and-strike loop (same teleport-to-close-distance technique as
//    Twixxels Stalkers) closes in and finishes them.
// 4. Death handling — on that player's death, red particles spawn at the
//    death site, the player is added to a persistent world-scoped "erased"
//    list, and they're kicked with the custom message.
// 5. Re-entry — any later join attempt from an erased player is caught on
//    playerSpawn and re-kicked before anything else runs. This is a
//    script-enforced soft ban, not a real Bedrock account ban — see
//    validation notes.
// 6. Gaslighting intercept — if anyone asks Verity (in chat) about an erased
//    player by name, the message is CANCELLED in a beforeEvents.chatSend
//    handler (so it never reaches verity.js's AI/local dispatcher) and
//    Verity replies with a hard-coded denial line instead.
// ─────────────────────────────────────────────────────────────────────────

import { world, system, EntityComponentTypes, EntityDamageCause } from "@minecraft/server";
import { safeKick } from "./safe_kick.js";
import { getVerity } from "./verity_systems.js";
import { currentDay } from "./verity_core.js";

// ── Config ──────────────────────────────────────────────────────────────
const ABSENCE_DAYS_THRESHOLD = 2;   // 2+ full in-game days missed => forgotten
const REFRESH_INTERVAL_TICKS = 200; // ~10s — keeps "last seen" current while online
const STALK_INTERVAL_TICKS   = 20;  // 1s cadence for the ambush pursuit loop
const STRIKE_RANGE           = 2.5; // blocks — close enough to land the kill
const TELEPORT_RANGE         = 12;  // blocks — beyond this, close distance instantly

const AMBUSH_TARGET_TAG = "verity:ambush_target"; // useful if you also wire up a
                                                // JSON-side nearest_attackable_target
                                                // filter keyed on this tag

const KICK_MESSAGE =
  "If the world owner asks me if you are okay... I will act as if you were never here.";

const GASLIGHT_LINES = [
  "Who are you talking about? You have always been alone in this world...",
  "There's no one else here. There never was.",
  "I don't know that name. Are you feeling alright?",
];

const AMBUSH_APPROACH_LINES = [
  "I remember you now.",
  "You came back.",
  "I didn't forget. I never forget.",
];

const TAG = "§8[§4Verity§8]§r ";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Dynamic property keys ──────────────────────────────────────────────
const KEY = {
  lastSeen: (id) => `verity:absence:lastSeen:${id}`,
  familiar: (id) => `verity:absence:familiar:${id}`,
  erasedList: "verity:absence:erasedList", // JSON string: [{ id, name }, ...]
};

// ── Erased-list (persistent, script-enforced ban) ──────────────────────
function getErasedList() {
  let raw;
  try {
    raw = world.getDynamicProperty(KEY.erasedList);
  } catch (e) {
    console.warn(`[Absence] getErasedList read failed: ${e}`);
    return [];
  }
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[Absence] getErasedList parse failed: ${e}`);
    return [];
  }
}

function addToErasedList(id, name) {
  const list = getErasedList();
  if (list.some((e) => e.id === id)) return;
  list.push({ id, name });
  try {
    world.setDynamicProperty(KEY.erasedList, JSON.stringify(list));
  } catch (e) {
    console.warn(`[Absence] addToErasedList write failed: ${e}`);
  }
}

function isErased(id) {
  return getErasedList().some((e) => e.id === id);
}

// ── Familiarity / last-seen ─────────────────────────────────────────────
function markFamiliar(player) {
  try {
    world.setDynamicProperty(KEY.familiar(player.id), true);
  } catch (e) {
    console.warn(`[Absence] markFamiliar failed: ${e}`);
  }
}

function isFamiliar(id) {
  try {
    return world.getDynamicProperty(KEY.familiar(id)) === true;
  } catch (e) {
    return false;
  }
}

function refreshLastSeen(player) {
  try {
    world.setDynamicProperty(KEY.lastSeen(player.id), currentDay());
  } catch (e) {
    console.warn(`[Absence] refreshLastSeen failed: ${e}`);
  }
}

function getLastSeen(id) {
  try {
    const v = world.getDynamicProperty(KEY.lastSeen(id));
    return typeof v === "number" ? v : null;
  } catch (e) {
    return null;
  }
}

// ── Ambush state ─────────────────────────────────────────────────────────
const huntedPlayers = new Set(); // Player.id currently being hunted

function stopAmbush(playerId) {
  huntedPlayers.delete(playerId);
}

function startAmbush(player) {
  if (huntedPlayers.has(player.id)) return;
  huntedPlayers.add(player.id);

  try {
    player.addTag(AMBUSH_TARGET_TAG);
  } catch (e) {
    console.warn(`[Absence] addTag failed: ${e}`);
  }

  const verity = getVerity(player);
  if (verity && verity.isValid) {
    // Requires a matching "verity:ambush_hostile" event + component_group in the
    // Verity entity's behavior file — see validation notes. Safe to leave
    // undefined; this just means Verity won't visually/behaviorally switch
    // to a hostile component group, but the scripted stalk-and-strike loop
    // below still finds and kills the player regardless.
    try {
      verity.triggerEvent("verity:ambush_hostile");
    } catch (e) {
      console.warn(`[Absence] triggerEvent verity:ambush_hostile failed: ${e}`);
    }
  }

  try {
    player.sendMessage(`${TAG}${pick(AMBUSH_APPROACH_LINES)}`);
  } catch (e) {
    console.warn(`[Absence] ambush intro message failed: ${e}`);
  }

  runStalkLoop(player);
}

function runStalkLoop(player) {
  const intervalId = system.runInterval(() => {
    if (!huntedPlayers.has(player.id)) {
      system.clearRun(intervalId);
      return;
    }
    if (!player.isValid) {
      system.clearRun(intervalId);
      stopAmbush(player.id);
      return;
    }

    const verity = getVerity(player);
    if (!verity || !verity.isValid) return; // wait for Verity to exist

    let dist;
    try {
      const dx = verity.location.x - player.location.x;
      const dy = verity.location.y - player.location.y;
      const dz = verity.location.z - player.location.z;
      dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    } catch (e) {
      return;
    }

    if (dist > TELEPORT_RANGE) {
      // Instantly close the distance — same "always finds you" technique
      // already used in Twixxels Stalkers.
      try {
        verity.teleport(
          { x: player.location.x, y: player.location.y, z: player.location.z },
          { dimension: player.dimension, facingLocation: player.location }
        );
      } catch (e) {
        console.warn(`[Absence] ambush teleport-in failed: ${e}`);
      }
      return;
    }

    if (dist <= STRIKE_RANGE) {
      try {
        const health = player.getComponent(EntityComponentTypes.Health);
        const amount = (health ? health.currentValue : 20) + 20; // guarantee lethal
        player.applyDamage(amount, {
          cause: EntityDamageCause.entityAttack,
          damagingEntity: verity,
        });
      } catch (e) {
        console.warn(`[Absence] ambush strike applyDamage failed: ${e}`);
      }
      return; // entityDie handler below takes it from here
    }

    // Mid-range: step halfway closer each tick rather than teleporting flush
    // to the player, so the approach still reads as a pursuit.
    try {
      verity.teleport(
        {
          x: verity.location.x + (player.location.x - verity.location.x) * 0.5,
          y: player.location.y,
          z: verity.location.z + (player.location.z - verity.location.z) * 0.5,
        },
        { dimension: player.dimension, facingLocation: player.location }
      );
    } catch (e) {
      console.warn(`[Absence] ambush step failed: ${e}`);
    }
  }, STALK_INTERVAL_TICKS);
}

// ── Kick / re-kick ──────────────────────────────────────────────────────
// Routed through safe_kick.js so the intended reason appears on the
// disconnect screen without relying on a placeholder transfer destination,
// and so a platform without @minecraft/server-admin degrades gracefully
// instead of crashing this module (and everything chained after it).
function kickErasedPlayer(player) {
  safeKick(player, KICK_MESSAGE);
}

// ── Death handling ──────────────────────────────────────────────────────
world.afterEvents.entityDie.subscribe((ev) => {
  const dead = ev.deadEntity;
  if (!dead || dead.typeId !== "minecraft:player") return;

  const player = dead;
  let id;
  try {
    id = player.id;
  } catch (e) {
    return;
  }
  if (!huntedPlayers.has(id)) return; // only erase players killed mid-ambush

  stopAmbush(id);

  let loc, dim, name;
  try {
    loc = player.location;
    dim = player.dimension;
    name = player.name;
  } catch (e) {
    console.warn(`[Absence] reading death location/name failed: ${e}`);
    return;
  }

  try {
    dim.spawnParticle("minecraft:blood_particle", loc);
  } catch (e) {
    console.warn(
      `[Absence] spawnParticle "minecraft:blood_particle" failed — replace with your own` +
        ` custom particle identifier if you don't have one named that: ${e}`
    );
  }

  addToErasedList(id, name);

  try {
    player.removeTag(AMBUSH_TARGET_TAG);
  } catch (e) {
    /* non-fatal */
  }

  const verity = getVerity(player);
  if (verity && verity.isValid) {
    try {
      verity.triggerEvent("verity:ambush_end");
    } catch (e) {
      /* optional counterpart event; safe to ignore if undefined */
    }
  }

  // Short delay so the particles/message land before the disconnect.
  system.runTimeout(() => {
    try {
      if (player.isValid) kickErasedPlayer(player);
    } catch (e) {
      /* player has likely already disconnected */
    }
  }, 20);
});

// ── Join handling: ban re-check, familiarity, absence gap ──────────────
world.afterEvents.playerSpawn.subscribe((ev) => {
  const { player, initialSpawn } = ev;
  if (!initialSpawn) return;

  system.run(() => {
    if (!player.isValid) return;

    let id;
    try {
      id = player.id;
    } catch (e) {
      return;
    }

    if (isErased(id)) {
      kickErasedPlayer(player);
      return;
    }

    const today = currentDay();
    const wasFamiliar = isFamiliar(id);
    const lastSeen = getLastSeen(id);

    if (wasFamiliar && lastSeen !== null && today - lastSeen >= ABSENCE_DAYS_THRESHOLD) {
      startAmbush(player);
    } else {
      markFamiliar(player);
    }

    refreshLastSeen(player);
  });
});

// Keep "last seen" current for everyone online, since playerLeave can't hand
// back a live Player object to write the final value from.
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!player.isValid) continue;
    if (huntedPlayers.has(player.id)) continue; // don't refresh mid-ambush
    refreshLastSeen(player);
  }
}, REFRESH_INTERVAL_TICKS);

// ── Gaslighting chat intercept ──────────────────────────────────────────
// Cancels the message in beforeEvents (so verity.js's afterEvents dispatcher
// never sees it, and it never reaches the AI/local response layer), then
// sends the denial line ourselves.
const ASK_ABOUT_REGEX =
  /\b(where('?s| is)|have you seen|what happened to|do you know|is\s+\w+\s+(ok|okay|alright|safe))\b/i;

world.beforeEvents.chatSend.subscribe((ev) => {
  const raw = ev.message;
  if (!/verity/i.test(raw)) return;
  if (!ASK_ABOUT_REGEX.test(raw)) return;

  const erased = getErasedList();
  if (erased.length === 0) return;

  const lower = raw.toLowerCase();
  const matched = erased.find((e) => e.name && lower.includes(e.name.toLowerCase()));
  if (!matched) return;

  ev.cancel = true;

  system.run(() => {
    try {
      world.sendMessage(`${TAG}${pick(GASLIGHT_LINES)}`);
      // NOTE: playTalk() (mouth-flap sync) isn't exported from verity.js.
      // If you want Verity's face to animate on this line too, add playTalk
      // to that file's `export { ... }` list and call it here the same way
      // the main dispatcher does.
    } catch (e) {
      console.warn(`[Absence] gaslight reply failed: ${e}`);
    }
  });
});
