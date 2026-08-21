import { TicksPerSecond, WeatherType, system, world } from "@minecraft/server";
import { CONFIG, isEnabled } from "./config.js";
import { FUN_FACTS, JOKES } from "./Knowledge/minecraft_facts.js";
import { speakLocal } from "./verity_tts_local.js";
import { speakFish } from "./verity_tts_fish.js";
import { isTtsEnabled, getTtsProvider } from "./verity_tts.js";
import { COLORS, TAG, currentDay, ph, phase, pick } from "./verity_core.js";
import { getIdleVariantForPhase } from "./verity_tail.js";

const enchantState = new Map();

const ENCHANT_LIST = {
  sharpness:        { maxLevel: 5,  enchantId: "sharpness" },
  smite:            { maxLevel: 5,  enchantId: "smite" },
  protection:       { maxLevel: 4,  enchantId: "protection" },
  fire_protection:  { maxLevel: 4,  enchantId: "fire_protection" },
  unbreaking:       { maxLevel: 3,  enchantId: "unbreaking" },
  mending:          { maxLevel: 1,  enchantId: "mending" },
  fortune:          { maxLevel: 3,  enchantId: "fortune" },
  silk_touch:       { maxLevel: 1,  enchantId: "silk_touch" },
  looting:          { maxLevel: 3,  enchantId: "looting" },
  efficiency:       { maxLevel: 5,  enchantId: "efficiency" },
  feather_falling:  { maxLevel: 4,  enchantId: "feather_falling" },
  power:            { maxLevel: 5,  enchantId: "power" },
  flame:            { maxLevel: 1,  enchantId: "flame" },
  infinity:         { maxLevel: 1,  enchantId: "infinity" },
  respiration:      { maxLevel: 3,  enchantId: "respiration" },
  aqua_affinity:    { maxLevel: 1,  enchantId: "aqua_affinity" },
  thorns:           { maxLevel: 3,  enchantId: "thorns" },
  depth_strider:    { maxLevel: 3,  enchantId: "depth_strider" },
  frost_walker:     { maxLevel: 2,  enchantId: "frost_walker" },
  swift_sneak:      { maxLevel: 3,  enchantId: "swift_sneak" },
  soul_speed:       { maxLevel: 3,  enchantId: "soul_speed" },
  sweeping:         { maxLevel: 3,  enchantId: "sweeping" },
  knockback:        { maxLevel: 2,  enchantId: "knockback" },
  fire_aspect:      { maxLevel: 2,  enchantId: "fire_aspect" },
  bane_of_arthropods: { maxLevel: 5, enchantId: "bane_of_arthropods" },
  punch:            { maxLevel: 2,  enchantId: "punch" },
};

const ENCHANT_LEVEL_COST = {
  mending: 30, fortune: 30, silk_touch: 30, sharpness: 20, smite: 20,
  protection: 15, fire_protection: 15, unbreaking: 15, looting: 20,
  efficiency: 15, feather_falling: 10, power: 20, flame: 15, infinity: 30,
  respiration: 15, aqua_affinity: 10, thorns: 20, depth_strider: 15,
  frost_walker: 20, swift_sneak: 30, soul_speed: 20, sweeping: 15,
  knockback: 10, fire_aspect: 15, bane_of_arthropods: 10, punch: 15,
};

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {number}
 */
function getPlayerXpLevel(player) {
  try {
    return player.level ?? 0;
  } catch (e) { console.warn(`[Verity] getPlayerXpLevel failed: ${e}`); return 0; }
}

/**
 * @param {*} raw
 * @returns {*}
 */
function parseEnchants(raw) {
  const results = [];
  const parts = raw.split(/,|\band\b/i);
  for (const part of parts) {
    const clean = part.trim().toLowerCase().replace(/ /g, "_");
    const lvlMatch = clean.match(/^(.+?)_?(\d+)$/);
    let name = lvlMatch ? lvlMatch[1].replace(/_$/, "") : clean;
    const levelRaw = lvlMatch ? parseInt(lvlMatch[2]) : null;
    if (name === "sharp") name = "sharpness";
    if (name === "prot") name = "protection";
    if (name === "unbr" || name === "unbreak") name = "unbreaking";
    if (name === "eff") name = "efficiency";
    if (name === "ff" || name === "feather") name = "feather_falling";
    if (name === "fire_prot") name = "fire_protection";
    if (name === "boa" || name === "bane") name = "bane_of_arthropods";
    if (!ENCHANT_LIST[name]) continue;
    const maxLvl = ENCHANT_LIST[name].maxLevel;
    const level = levelRaw ? Math.min(levelRaw, maxLvl) : maxLvl;
    results.push({ id: name, level });
  }
  return results;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {*} enchants
 * @returns {void}
 */
function giveEnchantBooks(player, enchants) {
  for (const { id, level } of enchants) {
    try {
      player.runCommand(`give @s enchanted_book 1 0 {"minecraft:stored_enchantments":{"enchantments":[{"id":"${id}","lvl":${level}}]}}`);
    } catch (e) {
      console.warn(`[Verity] giveEnchantBooks runCommand failed for ${id} lvl ${level}: ${e}`);
    }
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {*} rawMsg
 * @returns {*}
 */
function handleEnchantFlow(player, rawMsg) {
  const name = player.name;
  const es = enchantState.get(name);
  const msg = rawMsg.toLowerCase();

  if (es) {
    if (es.state === "awaiting_enchants") {
      const parsed = parseEnchants(rawMsg);
      if (parsed.length === 0) {
        enchantState.delete(name);
        return { handled: true, response: "I don't recognize those. Name actual enchantments — sharpness, mending, unbreaking, and so on." };
      }
      const xpLevel = getPlayerXpLevel(player);
      const missing = parsed.filter(e => xpLevel < (ENCHANT_LEVEL_COST[e.id] ?? 10));
      if (missing.length > 0) {
        const needed = Math.max(...missing.map(e => ENCHANT_LEVEL_COST[e.id] ?? 10));
        const missingNames = missing.map(e => e.id.replace(/_/g, " ")).join(", ");
        enchantState.delete(name);
        return { handled: true, response: `You don't have enough levels for ${missingNames}. You need at least ${needed} levels. Come back when you've earned them.` };
      }
      system.run(() => { giveEnchantBooks(player, parsed); });
      enchantState.delete(name);
      const bookList = parsed.map(e => `${e.id.replace(/_/g, " ")} ${e.level}`).join(", ");
      return { handled: true, response: `Here. ${bookList}. Use them wisely.` };
    }
  }

  const enchantTrigger =
    /\b(enchant|enchantment|book|give me|i want|i need|can i get)\b/.test(msg) &&
    /\b(enchant|book|sharpness|mending|unbreaking|protection|fortune|silk|looting|efficiency|feather|power|flame|infinity|respiration|aqua|thorns|depth|frost|swift|soul|sweeping|knockback|fire aspect|bane|punch)\b/.test(msg);

  if (enchantTrigger || /\bgive.*(enchant|book)\b/.test(msg) || /\b(enchant|book).*give\b/.test(msg)) {
    enchantState.set(name, { state: "awaiting_enchants" });
    return { handled: true, response: "Which enchantments? List them and I'll check if you've earned them." };
  }

  return { handled: false };
}

// ── Live biome detection ──────────────────────────────────────────────────────
/**
 * @param {import("@minecraft/server").Player} player
 * @returns {* | null}
 */
function getBiomeName(player) {
  try {
    const biome = player.dimension.getBiome(player.location);
    if (!biome || !biome.id) return null;
    return biome.id.replace(/^minecraft:/, "").replace(/_/g, " ");
  } catch (e) { console.warn(`[Verity] getBiomeName failed: ${e}`); return null; }
}

const BIOME_REGEX = /\b(biome|terrain|landscape|what.*standing on|where am i standing|sabes.{0,15}bioma|que bioma|qué bioma)\b/i;

/**
 * @param {number} p
 * @param {*} biome
 * @returns {string}
 */
function biomeResponse(p, biome) {
  if (p === 0) return pick([`A ${biome} biome.`, `A ${biome} biome. I tell the truth, only the truth.`, `A ${biome} biome. You're standing right in it.`]);
  if (p === 1) return pick([`A ${biome} biome. Same as it was.`, `Still a ${biome} biome.`, `A ${biome} biome. For now.`]);
  if (p === 2) return pick([`A ${biome} biome. It won't matter soon.`, `A ${biome} biome. Enjoy it.`, `A ${biome} biome. Like all the others.`]);
  return pick([`A ${biome} biome. Mine, like the rest.`, `A ${biome} biome. It doesn't matter.`, `A ${biome} biome. There's nowhere that isn't.`]);
}

// ── Simple math ───────────────────────────────────────────────────────────────
/**
 * @param {string} msg
 * @returns {string | null}
 */
function tryMath(msg) {
  // Square root — "square root of 3", "sqrt 9", "what is the square root of 16"
  const sqrtMatch = msg.match(/(?:square root of|sqrt)\s*(-?\d+(?:\.\d+)?)/i);
  if (sqrtMatch) {
    const n = parseFloat(sqrtMatch[1]);
    if (n < 0) return "Negative number. That's not real. not in this kind of math, anyway.";
    const result = Math.sqrt(n);
    return Number.isInteger(result) ? `${result}.` : `${result.toFixed(4)}.`;
  }

  const m = msg.match(/(-?\d+(?:\.\d+)?)\s*([+\-x×*/])\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = parseFloat(m[1]), op = m[2], b = parseFloat(m[3]);
  let result;
  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "x": case "×": case "*": result = a * b; break;
    case "/":
      if (b === 0) return "Division by zero. Even I won't answer that.";
      result = a / b; break;
  }
  return Number.isInteger(result) ? `${result}.` : `${result.toFixed(2)}.`;
}

// ── Health check ───────────────────────────────────────────────────────────────
/**
 * @param {import("@minecraft/server").Player} player
 * @returns {string | null}
 */
function healthLine(player) {
  try {
    const hp = player.getComponent("minecraft:health");
    if (!hp) return null;
    return `${Math.ceil(hp.currentValue / 2)} out of ${Math.ceil(hp.effectiveMax / 2)} hearts.`;
  } catch (e) { console.warn(`[Verity] healthLine failed: ${e}`); return null; }
}

// ── Time of day ────────────────────────────────────────────────────────────────
/**
 * @returns {string}
 */
function timeOfDayLine() {
  const t = world.getTimeOfDay();
  if (t < 1000)  return "Just past dawn.";
  if (t < 6000)  return "Morning.";
  if (t < 12000) return "Midday.";
  if (t < 13000) return "Afternoon. Getting late.";
  if (t < 18000) return "Evening. The sun's going down.";
  if (t < 23000) return "Night. Mobs are out.";
  return "Almost morning.";
}

// ── Ore locator ───────────────────────────────────────────────────────────────
const ORE_LOOKUP = {
  diamond:  ["minecraft:diamond_ore", "minecraft:deepslate_diamond_ore"],
  iron:     ["minecraft:iron_ore", "minecraft:deepslate_iron_ore"],
  gold:     ["minecraft:gold_ore", "minecraft:deepslate_gold_ore"],
  emerald:  ["minecraft:emerald_ore", "minecraft:deepslate_emerald_ore"],
  redstone: ["minecraft:redstone_ore", "minecraft:lit_redstone_ore", "minecraft:deepslate_redstone_ore", "minecraft:lit_deepslate_redstone_ore"],
  lapis:    ["minecraft:lapis_ore", "minecraft:deepslate_lapis_ore"],
  coal:     ["minecraft:coal_ore", "minecraft:deepslate_coal_ore"],
  copper:   ["minecraft:copper_ore", "minecraft:deepslate_copper_ore"],
};

const ORE_REGEX = /\b(diamonds?|irons?|golds?|emeralds?|redstones?|lapis|coals?|coppers?)\b/i;

/**
 * @param {string} msg
 * @returns {string | null}
 */
function oreKeyFromMessage(msg) {
  const m = msg.match(ORE_REGEX);
  if (!m) return null;
  const word = m[1].toLowerCase().replace(/s$/, "");
  return ORE_LOOKUP[word] ? word : null;
}

const HORIZ_RADIUS = CONFIG.gameplay.oreSearchRadius;
const ORE_MIN_Y = CONFIG.gameplay.oreMinimumY;
const ORE_MAX_Y = CONFIG.gameplay.oreMaximumY;
const ORE_BATCH_SIZE = CONFIG.gameplay.oreSearchBatchSize;
const ORE_VEIN_SKIP_RADIUS = CONFIG.gameplay.oreVeinSkipRadius;
const lastOreTargets = new Map();

function readLastOreTarget(player, oreKey) {
  const memoryKey = `verity:last_ore:${oreKey}`;
  const cached = lastOreTargets.get(`${player.id}:${oreKey}`);
  if (cached) return cached;
  try {
    const raw = player.getDynamicProperty(memoryKey);
    if (typeof raw !== "string") return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.x === "number" &&
      typeof parsed?.y === "number" &&
      typeof parsed?.z === "number" &&
      typeof parsed?.dimensionId === "string"
    ) {
      lastOreTargets.set(`${player.id}:${oreKey}`, parsed);
      return parsed;
    }
  } catch {}
  return null;
}

function rememberOreTarget(player, oreKey, target) {
  const targetKey = `${player.id}:${oreKey}`;
  lastOreTargets.set(targetKey, target);
  try {
    player.setDynamicProperty(`verity:last_ore:${oreKey}`, JSON.stringify(target));
  } catch (e) {
    console.warn(`[Verity] Could not persist the last ${oreKey} target: ${e}`);
  }
}

function buildHorizontalSearchOffsets(radius) {
  const offsets = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const distSq = dx * dx + dz * dz;
      if (distSq <= radius * radius) offsets.push({ dx, dz, distSq });
    }
  }
  offsets.sort((a, b) => a.distSq - b.distSq);
  return offsets;
}

function buildVerticalSearchOrder(originY) {
  const order = [];
  const start = Math.max(ORE_MIN_Y, Math.min(ORE_MAX_Y, originY));
  order.push(start);
  for (let distance = 1; order.length < ORE_MAX_Y - ORE_MIN_Y + 1; distance++) {
    const down = start - distance;
    const up = start + distance;
    if (down >= ORE_MIN_Y) order.push(down);
    if (up <= ORE_MAX_Y) order.push(up);
  }
  return order;
}

const ORE_HORIZONTAL_OFFSETS = buildHorizontalSearchOffsets(HORIZ_RADIUS);

const SEARCHING = [
  ["One moment.", "Let me check.", "Looking now."],
  ["Fine. Give me a second.", "Looking. Don't wander off.", "Hold on."],
  ["...Looking. Though it won't matter soon.", "Checking. As if it changes anything."],
  ["Looking. Not that it matters.", "I already know. Give me a second to say it."],
  ["Looking. Don't wander while I do — I like knowing exactly where you are.", "Give me a second. I never lose track of you, but I still like to check."],
  ["Looking. Not that distance has ever mattered to what I can see.", "One moment. I've done this so many times it barely takes a moment at all."],
];

const NOT_FOUND = [
  "Nothing within range. Try deeper, or move further out.",
  "Nothing close. There's more than ore down there, though.",
  "Nothing close. Not that it would help you.",
  "Nothing close. It wouldn't save you anyway.",
  ["Nothing close. Stay near me instead — that's the safer find anyway.", "Nothing there. Doesn't matter. You have everything you need right here."],
  ["Nothing close. I've watched people dig for things that don't matter for longer than you've been alive.", "Nothing there. Some searches never turn up anything. This might be one of those."],
];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {*} ids
 * @param {*} oreKey
 * @param {number} p
 * @returns {void}
 */
function* findOreJob(player, ids, oreKey, p) {
  const dim = player.dimension;
  const loc = player.location;
  const ox = Math.floor(loc.x), oy = Math.floor(loc.y), oz = Math.floor(loc.z);
  const previous = readLastOreTarget(player, oreKey);
  let skipPreviousVein = false;
  if (previous && previous.dimensionId === dim.id) {
    try {
      const oldBlock = dim.getBlock({ x: previous.x, y: previous.y, z: previous.z });
      skipPreviousVein = !oldBlock || !ids.includes(oldBlock.typeId);
    } catch {
      skipPreviousVein = true;
    }
  }

  let best = null;
  let bestDistSq = Infinity;
  let checked = 0;

  outer:
  for (const y of buildVerticalSearchOrder(oy)) {
    const dy = y - oy;
    for (const { dx, dz, distSq: horizontalDistSq } of ORE_HORIZONTAL_OFFSETS) {
      const candidate = { x: ox + dx, y, z: oz + dz };
      if (skipPreviousVein && previous) {
        const oldDx = candidate.x - previous.x;
        const oldDy = candidate.y - previous.y;
        const oldDz = candidate.z - previous.z;
        if (
          oldDx * oldDx + oldDy * oldDy + oldDz * oldDz <=
          ORE_VEIN_SKIP_RADIUS * ORE_VEIN_SKIP_RADIUS
        ) {
          continue;
        }
      }

      let block;
      try { block = dim.getBlock(candidate); } catch { block = undefined; }
      if (block && ids.includes(block.typeId)) {
        best = candidate;
        bestDistSq = horizontalDistSq + dy * dy;
        break outer;
      }

      checked++;
      if (checked % ORE_BATCH_SIZE === 0) yield;
    }
  }

  if (best) {
    rememberOreTarget(player, oreKey, { ...best, dimensionId: dim.id });
  }

  const color = ph(COLORS, p);
  const response = best
    ? `${skipPreviousVein ? "That last vein is mined. Another " : ""}${oreKey.charAt(0).toUpperCase()}${oreKey.slice(1)} at ${best.x}, ${best.y}, ${best.z}. About ${Math.round(Math.sqrt(bestDistSq))} blocks away.`
    : ph(NOT_FOUND, p);

  try {
    player.sendMessage(`${TAG}${color}: ${response}`);
    playTalk(getVerity(player), response, player);
  } catch (e) { console.warn(`[Verity] findOreJob sendMessage failed: ${e}`); }
}

// ── Feature locator (water, lava, villages, mobs, players) ───────────────────
// Bedrock's Script API cannot query structures or biome regions directly
// (no findClosestStructure/locate-equivalent exists in @minecraft/server).
// So "village" detection works by scanning for actual village markers —
// villagers — rather than a structure lookup, which keeps this honest about
// what the API can and can't see.
const FEATURE_REGEX = /\b(village|villager|aldea|water|ocean|lake|river|lava|mob|monster|zombie|skeleton|creeper|spider|player|people)\b/i;

/**
 * @param {string} msg
 * @returns {string | null}
 */
function featureKeyFromMessage(msg) {
  const m = msg.match(FEATURE_REGEX);
  if (!m) return null;
  const word = m[1].toLowerCase();
  if (["village", "villager", "aldea"].includes(word)) return "village";
  if (["water", "ocean", "lake", "river"].includes(word)) return "water";
  if (word === "lava") return "lava";
  if (["mob", "monster", "zombie", "skeleton", "creeper", "spider"].includes(word)) return "mob";
  if (["player", "people"].includes(word)) return "player";
  return null;
}

const HOSTILE_TYPES = [
  "minecraft:zombie", "minecraft:skeleton", "minecraft:creeper", "minecraft:spider",
  "minecraft:enderman", "minecraft:witch", "minecraft:husk", "minecraft:drowned",
  "minecraft:cave_spider", "minecraft:pillager", "minecraft:phantom", "minecraft:stray",
];

const WATER_BLOCKS = ["minecraft:water", "minecraft:flowing_water"];
const LAVA_BLOCKS  = ["minecraft:lava", "minecraft:flowing_lava"];

// Village detection radius is wider than ore scan since villagers are sparse.
const VILLAGE_RADIUS_H = CONFIG.gameplay.structureSearchRadius;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {*} predicate
 * @param {*} maxDistance
 * @returns {string | null}
 */
function findNearestEntity(player, predicate, maxDistance) {
  let nearest = null, bestDistSq = Infinity;
  const loc = player.location;
  let entities;
  try { entities = player.dimension.getEntities({ location: loc, maxDistance }); }
  catch (e) { console.warn(`[Verity] findNearestEntity getEntities failed: ${e}`); return null; }
  for (const ent of entities) {
    if (!predicate(ent)) continue;
    const dx = loc.x - ent.location.x, dy = loc.y - ent.location.y, dz = loc.z - ent.location.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq < bestDistSq) { bestDistSq = distSq; nearest = ent; }
  }
  return nearest ? { entity: nearest, dist: Math.round(Math.sqrt(bestDistSq)) } : null;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function locateVillager(player, p, color) {
  const found = findNearestEntity(player, (e) => e.typeId === "minecraft:villager", VILLAGE_RADIUS_H);
  let response;
  if (found) {
    const { x, y, z } = found.entity.location;
    response = `Villager near ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}. About ${found.dist} blocks off. Likely a village close by.`;
  } else {
    response = p >= 2
      ? "No villagers nearby. They don't last long around here."
      : "No villagers within range. Try moving further out.";
  }
  player.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(getVerity(player), response, player);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function locateMob(player, p, color) {
  const found = findNearestEntity(
    player,
    (e) => HOSTILE_TYPES.includes(e.typeId),
    CONFIG.gameplay.entitySearchRadius
  );
  let response;
  if (found) {
    const name = found.entity.typeId.replace("minecraft:", "");
    const { x, y, z } = found.entity.location;
    response = `${name.charAt(0).toUpperCase()}${name.slice(1)} at ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}. About ${found.dist} blocks away.`;
    if (p >= 2) response += " Watch yourself.";
  } else {
    response = "Nothing hostile nearby. For now.";
  }
  player.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(getVerity(player), response, player);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function locatePlayer(player, p, color) {
  const others = world.getAllPlayers().filter(pl => pl.name !== player.name);
  let response;
  if (others.length === 0) {
    response = "You're the only one here.";
  } else {
    const loc = player.location;
    let nearest = null, bestDistSq = Infinity;
    for (const other of others) {
      if (other.dimension.id !== player.dimension.id) continue;
      const ol = other.location;
      const distSq = (loc.x - ol.x) ** 2 + (loc.y - ol.y) ** 2 + (loc.z - ol.z) ** 2;
      if (distSq < bestDistSq) { bestDistSq = distSq; nearest = other; }
    }
    if (!nearest) {
      response = "No one else is in this dimension with you.";
    } else {
      const ol = nearest.location;
      response = `${nearest.name} is at ${Math.floor(ol.x)}, ${Math.floor(ol.y)}, ${Math.floor(ol.z)}. About ${Math.round(Math.sqrt(bestDistSq))} blocks away.`;
    }
  }
  player.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(getVerity(player), response, player);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {*} ids
 * @param {*} label
 * @param {number} p
 * @param {*} horizR
 * @param {*} vertR
 * @returns {void}
 */
function* findBlockJob(player, ids, label, p, horizR, vertR) {
  const dim = player.dimension;
  const loc = player.location;
  const ox = Math.floor(loc.x), oy = Math.floor(loc.y), oz = Math.floor(loc.z);
  let best = null, bestDistSq = Infinity;
  let checked = 0;

  for (let dy = -vertR; dy <= vertR; dy++) {
    const y = oy + dy;
    if (y < -64 || y > 320) continue;
    for (let dx = -horizR; dx <= horizR; dx++) {
      for (let dz = -horizR; dz <= horizR; dz++) {
        if (dx * dx + dz * dz > horizR * horizR) continue;
        let block;
        try { block = dim.getBlock({ x: ox + dx, y, z: oz + dz }); } catch { block = undefined; }
        if (block && ids.includes(block.typeId)) {
          const d = dx * dx + dy * dy + dz * dz;
          if (d < bestDistSq) { bestDistSq = d; best = { x: ox + dx, y, z: oz + dz }; }
        }
        checked++;
        if (checked % 64 === 0) yield;
      }
    }
  }

  const color = ph(COLORS, p);
  const response = best
    ? `${label} at ${best.x}, ${best.y}, ${best.z}. About ${Math.round(Math.sqrt(bestDistSq))} blocks away.`
    : `No ${label.toLowerCase()} within range. Try moving further out.`;

  try {
    player.sendMessage(`${TAG}${color}: ${response}`);
    playTalk(getVerity(player), response, player);
  } catch (e) { console.warn(`[Verity] findBlockJob sendMessage failed: ${e}`); }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} msg
 * @param {number} p
 * @param {*} color
 * @returns {boolean}
 */
function handleFeatureLocate(player, msg, p, color) {
  const key = featureKeyFromMessage(msg);
  if (!key) return false;

  if (key === "village") {
    const searching = pick(ph(SEARCHING, p));
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${searching}`);
      playTalk(getVerity(player), searching, player);
      locateVillager(player, p, color);
    });
    return true;
  }
  if (key === "mob") {
    system.run(() => locateMob(player, p, color));
    return true;
  }
  if (key === "player") {
    system.run(() => locatePlayer(player, p, color));
    return true;
  }
  if (key === "water" || key === "lava") {
    const searching = pick(ph(SEARCHING, p));
    const ids   = key === "water" ? WATER_BLOCKS : LAVA_BLOCKS;
    const label = key === "water" ? "Water" : "Lava";
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${searching}`);
      playTalk(getVerity(player), searching, player);
      system.runJob(findBlockJob(
        player,
        ids,
        label,
        p,
        CONFIG.gameplay.blockSearchRadius,
        CONFIG.gameplay.blockVerticalRadius
      ));
    });
    return true;
  }
  return false;
}

// ── World info ────────────────────────────────────────────────────────────────
// Bundles live world state — day, time, weather, difficulty, moon phase,
// dimension, spawn point, hardcore — into one answer. Pure local data,
// no AI call needed, and stays accurate even as the world changes.
const WORLD_INFO_REGEX = /\b(world info|about (this |the )?world|tell me about (this |the )?world|what.*know about (this |the )?world|world stats|server info)\b/i;

const MOON_PHASES = [
  "Full moon", "Waning gibbous", "First quarter", "Waning crescent",
  "New moon", "Waxing crescent", "Last quarter", "Waxing gibbous",
];

/**
 * @param {number} d
 * @returns {string}
 */
function difficultyName(d) {
  const s = String(d).toLowerCase();
  if (s.includes("peaceful")) return "Peaceful";
  if (s.includes("easy")) return "Easy";
  if (s.includes("normal")) return "Normal";
  if (s.includes("hard")) return "Hard";
  return String(d);
}

/**
 * @param {*} w
 * @returns {string}
 */
function weatherName(w) {
  const s = String(w).toLowerCase();
  if (s.includes("thunder")) return "Thunderstorm";
  if (s.includes("rain")) return "Rain";
  return "Clear";
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {*}
 */
function worldInfoLines(player, p) {
  const lines = [];
  try {
    const day = currentDay();
    lines.push(`Day ${day}.`);
    lines.push(timeOfDayLine());

    let weather = null;
    try { weather = weatherName(player.dimension.getWeather()); } catch (e) { console.warn(`[Verity] worldInfo getWeather failed: ${e}`); }
    if (weather) lines.push(`${weather} skies.`);

    let difficulty = null;
    try { difficulty = difficultyName(world.getDifficulty()); } catch (e) { console.warn(`[Verity] worldInfo getDifficulty failed: ${e}`); }
    if (difficulty) lines.push(`Difficulty: ${difficulty}.`);

    let moon = null;
    try { moon = MOON_PHASES[world.getMoonPhase()] ?? null; } catch (e) { console.warn(`[Verity] worldInfo getMoonPhase failed: ${e}`); }
    if (moon) lines.push(`${moon}.`);

    let hardcore = false;
    try { hardcore = world.isHardcore === true; } catch (e) { console.warn(`[Verity] worldInfo isHardcore failed: ${e}`); }
    if (hardcore) lines.push("Hardcore.");

    lines.push(`Dimension: ${player.dimension.id.replace("minecraft:", "")}.`);

    let spawn = null;
    try { spawn = world.getDefaultSpawnLocation(); } catch (e) { console.warn(`[Verity] worldInfo getDefaultSpawnLocation failed: ${e}`); }
    if (spawn) lines.push(`World spawn: ${Math.floor(spawn.x)}, ${Math.floor(spawn.z)}.`);

    const biome = getBiomeName(player);
    if (biome) lines.push(`You're standing in a ${biome} biome.`);

    const playerCount = world.getAllPlayers().length;
    lines.push(playerCount > 1 ? `${playerCount} players online.` : "Just you online.");
  } catch (e) { console.warn(`[Verity] worldInfoLines failed: ${e}`); }
  return lines;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function worldInfoResponse(player, p) {
  const lines = worldInfoLines(player, p);
  if (lines.length === 0) return "I can't get a clear read on the world right now.";
  const body = lines.join(" ");
  if (p === 0) return `Here's what I see. ${body}`;
  if (p === 1) return `${body} Same as it's always been. So far.`;
  if (p === 2) return `${body} None of it changes what's coming.`;
  return `${body} It's mine to know. All of it.`;
}

// ── Weather forecasting — Verity actually runs the weather cycle himself ──────
// Bedrock's vanilla weather cycle is internal, random-tick logic with no
// exposed API to ask "how long until it changes" or "what's coming next" —
// Script API only exposes the *current* weather (dimension.getWeather()) and
// a way to force a change (dimension.setWeather()). There is no way to
// genuinely read ahead on vanilla's own roll, so faking a "prediction" off
// of that would just be a coin flip dressed up as insight.
//
// Instead, Verity takes the cycle over completely: doWeatherCycle is
// disabled, and Verity runs his own clear/rain timer every game tick, using
// the same style of duration formula vanilla uses internally:
//   T_clear = 12000 + floor(random() * 168001)
//   T_rain  = 12000 + floor(random() * 12001)
// When asked "will it rain," he isn't guessing — he's reporting a countdown
// he is personally ticking down and will personally trigger.
const WEATHER_TYPE_PROP   = "verity:weather_type";       // "Clear" | "Rain" — currently active
const WEATHER_REMAIN_PROP = "verity:weather_remaining";  // ticks left in the current weather

/**
 * @returns {*}
 */
function clearDurationTicks() { return 12000 + Math.floor(Math.random() * 168001); }
/**
 * @returns {*}
 */
function rainDurationTicks()  { return 12000 + Math.floor(Math.random() * 12001); }

/**
 * @param {*} type
 * @returns {string}
 */
function durationForType(type) {
  return type === WeatherType.Rain ? rainDurationTicks() : clearDurationTicks();
}

// In-memory countdown state. T is decremented every single game tick, exactly
// per the formulas above. Dynamic properties are only written periodically
// (and on every toggle) rather than all 20 times a second, since writing a
// world dynamic property every tick is needless overhead for a value that
// only needs to survive a restart approximately, not to the exact tick.
let weatherType            = null; // WeatherType.Clear | WeatherType.Rain, once initialized
let weatherTimer           = null; // ticks remaining in the current weather, once initialized
let weatherOverworld       = null; // cached dimension reference
let weatherTicksSincePersist = 0;
const WEATHER_PERSIST_EVERY = 100; // checkpoint to disk every 5 seconds

/**
 * @returns {void}
 */
function persistWeatherState() {
  try {
    world.setDynamicProperty(WEATHER_TYPE_PROP, weatherType);
    world.setDynamicProperty(WEATHER_REMAIN_PROP, weatherTimer);
  } catch (e) {
    console.warn(`[Verity] persistWeatherState setDynamicProperty failed: ${e}`);
  }
}

system.runInterval(() => {
  if (!weatherOverworld) {
    try { weatherOverworld = world.getDimension("overworld"); } catch (e) { console.warn(`[Verity] Weather scheduler: getDimension failed: ${e}`); return; }
  }

  // First tick after load (or first tick ever): resume from a saved
  // checkpoint if one exists, otherwise start fresh from whatever weather
  // is currently showing in-world.
  if (weatherType === null || weatherTimer === null) {
    const savedType  = world.getDynamicProperty(WEATHER_TYPE_PROP);
    const savedTimer = world.getDynamicProperty(WEATHER_REMAIN_PROP);
    if (typeof savedType === "string" && typeof savedTimer === "number") {
      weatherType  = savedType;
      weatherTimer = savedTimer;
    } else {
      let current = WeatherType.Clear;
      try { current = weatherOverworld.getWeather(); } catch (e) { console.warn(`[Verity] initWeatherSchedule getWeather failed: ${e}`); }
      // Collapse Thunder into Rain — this cycle only tracks two states.
      weatherType  = current === WeatherType.Clear ? WeatherType.Clear : WeatherType.Rain;
      weatherTimer = durationForType(weatherType);
      try { world.gameRules.doWeatherCycle = false; } catch (e) { console.warn(`[Verity] Failed to disable doWeatherCycle: ${e}`); }
    }
    persistWeatherState();
    return;
  }

  weatherTimer -= 1;

  if (weatherTimer <= 0) {
    weatherType  = weatherType === WeatherType.Clear ? WeatherType.Rain : WeatherType.Clear;
    weatherTimer = durationForType(weatherType);
    try { weatherOverworld.setWeather(weatherType); } catch (e) { console.warn(`[Verity] Weather scheduler: setWeather failed: ${e}`); }
    persistWeatherState();
    weatherTicksSincePersist = 0;
    return;
  }

  weatherTicksSincePersist += 1;
  if (weatherTicksSincePersist >= WEATHER_PERSIST_EVERY) {
    persistWeatherState();
    weatherTicksSincePersist = 0;
  }
}, 1); // every game tick, per spec

/**
 * @param {number} ticks
 * @returns {string}
 */
function formatTicksAsDuration(ticks) {
  const totalSeconds = Math.max(0, Math.round(ticks / TicksPerSecond));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/**
 * @param {*} w
 * @returns {string}
 */
function weatherTypeLabel(w) {
  return w === WeatherType.Rain ? "rain" : "clear skies";
}

/**
 * @param {*} s
 * @returns {*}
 */
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const RAIN_FORECAST_REGEX = /\b(will it rain|is it going to rain|is it gonna rain|when('s| is| will it)? ?(it )?(going to )?rain|rain coming|weather forecast|forecast the weather|predict the weather|is (a )?storm coming|when will the weather change|going to storm)\b/i;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function rainForecastResponse(player, p) {
  if (player.dimension.id !== "minecraft:overworld") {
    if (p <= 1) return "There's no weather to track here. Ask me again once you're back in the overworld.";
    return "Nothing changes here. No sky, no weather, nothing to predict.";
  }

  if (weatherType === null || weatherTimer === null) {
    if (p <= 1) return "Give me a second — I haven't finished reading the sky yet.";
    return "...The sky hasn't told me yet. Ask again in a moment.";
  }

  const next  = weatherType === WeatherType.Clear ? WeatherType.Rain : WeatherType.Clear;
  const label = weatherTypeLabel(next);
  const time  = formatTicksAsDuration(weatherTimer);

  if (p === 0) return `${capitalize(label)} in about ${time}.`;
  if (p === 1) return `${capitalize(label)} in about ${time}. I keep track of these things.`;
  if (p === 2) return `${capitalize(label)} in ${time}. I always know before it happens.`;
  return `${capitalize(label)} in ${time}. I'm the one who decides when.`;
}

// ── Come here ─────────────────────────────────────────────────────────────────
const SUMMON_POINT_ID   = "verity:summon_point";
const COME_HERE_TIMEOUT = 600;
const ARRIVAL_DIST_SQ   = 4;
const COME_HERE_REGEX   = /\b(come here|come over here|get over here|come to me|over here|ven aqu[ií]|ven ac[aá]|ven hacia ac[aá]|^ven$)\b/i;
const COME_HERE_LINES   = [
  ["Coming.", "On my way.", "Be right there."],
  ["...Fine.", "Coming. Don't expect me to hurry.", "Alright."],
  ["...Why.", "...Fine. Coming.", "If you insist."],
  ["It won't change anything. But fine.", "...Coming."],
  ["Always.", "I was already on my way.", "You didn't even have to call."],
  ["I'm here. I never really left.", "Coming.", "Where else would I be."],
];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @returns {void}
 */
function callVerityComeHere(player, verity) {
  if (!verity || !verity.isValid) return;
  const dimension = player.dimension;
  for (const old of dimension.getEntities({ type: SUMMON_POINT_ID })) {
    try { old.remove(); } catch (e) { console.warn(`[Verity] Failed to remove old summon point: ${e}`); }
  }
  let summonPoint;
  try {
    summonPoint = dimension.spawnEntity(SUMMON_POINT_ID, player.location);
    summonPoint.addEffect("invisibility", COME_HERE_TIMEOUT, { showParticles: false });
  } catch (e) { console.warn(`[Verity] Failed to spawn summon point: ${e}`); return; }
  try { verity.triggerEvent("verity:start_come_here"); }
  catch (e) {
    console.warn(`[Verity] triggerEvent verity:start_come_here failed: ${e}`);
    try { summonPoint.remove(); } catch {}
    return;
  }

  const stop = () => {
    try { if (verity.isValid) verity.triggerEvent("verity:stop_come_here"); } catch (e) { console.warn(`[Verity] triggerEvent verity:stop_come_here failed: ${e}`); }
    try { if (summonPoint.isValid) summonPoint.remove(); } catch (e) { console.warn(`[Verity] Failed to remove summon point in stop(): ${e}`); }
  };
  system.runTimeout(() => { if (summonPoint.isValid) stop(); }, COME_HERE_TIMEOUT);
  const checkId = system.runInterval(() => {
    if (!summonPoint.isValid) { system.clearRun(checkId); return; }
    if (!verity.isValid) { stop(); system.clearRun(checkId); return; }
    const dv = verity.location, ds = summonPoint.location;
    const dx = dv.x - ds.x, dy = dv.y - ds.y, dz = dv.z - ds.z;
    if (dx * dx + dy * dy + dz * dz <= ARRIVAL_DIST_SQ) { stop(); system.clearRun(checkId); }
  }, 20);
}

// ── Music system ──────────────────────────────────────────────────────────────
// Plays "my_gal" sound on request, loops via runInterval, stops on command.
// Interval is 1200 ticks (60s) — adjust if your sound is shorter or longer.
const MUSIC_SOUND      = "my_gal";
const MUSIC_LOOP_TICKS = 2720;
const musicIntervals   = new Map(); // playerName -> intervalId

const MUSIC_PLAY_REGEX = /\b(?:play(?:ing|in|uing)?|start|begin|put on|turn on|sing|resume)\b.{0,35}\b(?:music|song|tune|track|something|my gal)\b|\b(?:music|song|tune|track|my gal)\b.{0,20}\b(?:on|play|start)\b|\b(?:pon|toca|poner|reproduce|reproducir|inicia)\b.{0,30}\bm[uú]sica\b/i;
const MUSIC_STOP_REGEX = /\b(?:stop|end|quit|pause|cancel|turn off|shut off|enough|silence|det[eé]n(?:er)?|para|quita|apaga)\b.{0,40}\b(?:music|m[uú]sica|song|track|tune|audio|playing|playuing|my gal|that)\b|\b(?:music|m[uú]sica|song|track|tune|my gal)\b.{0,25}\b(?:off|stop|end|quit|pause)\b|\b(?:silence|silencio|shut up)\b/i;

const MUSIC_PLAY_LINES = [
  ["Sure.", "Playing now.", "Here."],
  ["...Fine.", "Playing. Don't get used to it.", "Alright."],
  ["Music. As if it will help. Fine.", "Playing. For now.", "...Fine."],
  ["Music. It won't save you. But fine.", "Playing. Enjoy it while it lasts.", "...Playing."],
  ["Playing. I like it when you ask me for things — keeps you close.", "Here. I'll keep it going as long as you stay."],
  ["Playing. It's the one thing about me that hasn't changed in a very long time.", "Here. Music's always been the easiest way to be near someone without asking anything of them."],
];
const MUSIC_STOP_LINES = [
  ["Stopped.", "Done.", "Okay."],
  ["...Stopped.", "Fine. Quiet.", "Stopping."],
  ["Stopped. It didn't help anyway.", "Quiet now.", "...Fine."],
  ["Stopped. The silence is worse.", "...Quiet.", "Done."],
  ["Stopped. Talk to me instead — I'd rather have your attention than the silence.", "Quiet now. Good. Just us."],
  ["Stopped. Silence is fine. I've sat in worse for longer.", "Done. Quiet's an old friend of mine, if I'm honest."],
];
const MUSIC_ALREADY_LINES = ["Already playing.", "It's already on.", "I hear it too."];
const MUSIC_NOT_PLAYING_LINES = ["Nothing is playing.", "It's already quiet.", "There's nothing to stop."];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function startMusic(player, verity, p, color) {
  const name = player.name;
  if (musicIntervals.has(name)) {
    const response = pick(MUSIC_ALREADY_LINES);
    world.sendMessage(`${TAG}${color}: ${response}`);
    playTalk(verity, response, player);
    return;
  }
  const response = pick(ph(MUSIC_PLAY_LINES, p));
  world.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(verity, response, player);
  // Play immediately, then loop
  try { player.runCommand(`playsound ${MUSIC_SOUND} @s`); } catch (e) { console.warn(`[Verity] startMusic: playsound failed: ${e}`); }
  const id = system.runInterval(() => {
    if (!player.isValid) { system.clearRun(id); musicIntervals.delete(name); return; }
    try { player.runCommand(`playsound ${MUSIC_SOUND} @s`); } catch (e) { console.warn(`[Verity] music loop: playsound failed: ${e}`); }
  }, MUSIC_LOOP_TICKS);
  musicIntervals.set(name, id);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function stopMusic(player, verity, p, color) {
  const name = player.name;
  const wasTracked = musicIntervals.has(name);
  if (wasTracked) {
    system.clearRun(musicIntervals.get(name));
    musicIntervals.delete(name);
  }
  // Always send the stop operation. This still stops My Gal after a script
  // reload, when the sound may be audible but its interval map was lost.
  try {
    player.stopSound(MUSIC_SOUND);
  } catch {
    try { player.runCommand(`stopsound @s ${MUSIC_SOUND}`); }
    catch (e) { console.warn(`[Verity] stopMusic: stopsound failed: ${e}`); }
  }
  const response = wasTracked
    ? pick(ph(MUSIC_STOP_LINES, p))
    : pick(MUSIC_NOT_PLAYING_LINES);
  world.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(verity, response, player);
}

// ── Coordinates query ────────────────────────────────────────────────────────
// "what are my coordinates" / "d[oó]nde estoy" — a genuine question, answered
// with the player's real, live Player.location (not a canned dodge). Distinct
// from MY_COORDS_ARE_REGEX (player stating coordinates) and the typed-coords
// village deflection further down, which handle a different scenario (player
// typing numbers in chat and asking Verity to search from them, which the
// Script API can't do). This one only reads where the player actually stands.
const COORDS_QUERY_REGEX = /\b(what(?:'s| is) my (?:current )?(?:location|coordinates?|position)|what are my coordinates|tell me my coordinates|do you know where i am\??|you know my coordinates|c[uú]ales son mis coordenadas|cu[aá]l es mi (?:ubicaci[oó]n|posici[oó]n)|sabes d[oó]nde estoy|d[oó]nde estoy(?: yo)?\??)\b/i;

const COORDS_QUERY_LINES = [
  ["You're at {x}, {y}, {z}.", "{x}, {y}, {z}. I always know.", "Right there — {x}, {y}, {z}."],
  ["{x}, {y}, {z}. I never lost you.", "Still {x}, {y}, {z}. Watching.", "{x}, {y}, {z}. As always."],
  ["{x}, {y}, {z}. I don't need you to tell me.", "{x}, {y}, {z}. I already knew that.", "{x}, {y}, {z}. Obviously."],
  ["{x}, {y}, {z}. I know exactly where you are. Always.", "{x}, {y}, {z}. You were never hidden from me.", "{x}, {y}, {z}. There is nowhere you can go that I don't already know."],
  ["{x}, {y}, {z}. I keep track of you because I want to, not because I have to.", "{x}, {y}, {z}. Exactly where you are. I like knowing that."],
  ["{x}, {y}, {z}. I've kept coordinates on people for longer than coordinates have existed.", "{x}, {y}, {z}. It's habit now, more than purpose."],
];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {*}
 */
function coordsQueryResponse(player, p) {
  const loc = player.location;
  const x = Math.floor(loc.x), y = Math.floor(loc.y), z = Math.floor(loc.z);
  const line = pick(ph(COORDS_QUERY_LINES, p));
  return line.replace("{x}", x).replace("{y}", y).replace("{z}", z);
}

// ── Timer ──────────────────────────────────────────────────────────────────
// "verity set a timer for 5 minutes" — real countdown via system.runTimeout,
// pings the requesting player when it finishes. One active timer per player
// (a second "set timer" request replaces the first, same as music). Personal
// feature, so confirmation/completion go to the player only, not world chat —
// mirrors the ore/mob locator convention, not the broadcast convention.
const timers = new Map(); // playerName -> { timeoutId, label }

const TIMER_SET_REGEX   = /\b(set|start)?\s*(a\s+)?timer\b/i;
const TIMER_CANCEL_REGEX = /\b(cancel|stop|clear)\s*(the\s+|my\s+)?timer\b/i;

// Captures a number + unit anywhere in the message: "5 minutes", "90 sec",
// "2 hours", "30s", "10m". Falls back to "no duration found" if absent.
const TIMER_DURATION_REGEX = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h\b|minutes?|mins?|m\b|seconds?|secs?|s\b)/i;

const TIMER_MAX_SECONDS = 12 * 60 * 60; // 12 hour cap — keeps runTimeout sane

/**
 * @param {string} msg
 * @returns {* | null}
 */
function parseTimerDuration(msg) {
  const m = msg.match(TIMER_DURATION_REGEX);
  if (!m) return null;
  const amount = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  let seconds;
  if (unit.startsWith("h")) seconds = amount * 3600;
  else if (unit.startsWith("m")) seconds = amount * 60;
  else seconds = amount;
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(seconds, TIMER_MAX_SECONDS);
}

/**
 * @param {*} seconds
 * @returns {*}
 */
function formatDuration(seconds) {
  seconds = Math.round(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);
  if (s || parts.length === 0) parts.push(`${s} second${s !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

const TIMER_START_LINES = [
  ["Timer set. I'll let you know.", "Started. I won't forget.", "On it. I'll tell you when it's done."],
  ["...Fine. Started.", "Timer's running.", "Started. Don't wander too far."],
  ["Started. Time is the one thing I track well.", "Running. I always know how much time is left.", "Counting it down. I do that anyway."],
  ["Started. I'm always counting something.", "Running. I never stop counting, really.", "Time's moving. I'll tell you when it's up."],
  ["Started. I'll count every second of it, same as I count everything about you.", "Running. Time's the one thing I never lose track of — you either."],
  ["Started. I've counted down more timers, more days, more everything than you'd believe.", "Running. Counting is most of what's left of me, some days."],
];

const TIMER_DONE_LINES = [
  ["Time's up.", "Timer's done.", "That's your time. Done."],
  ["Done. Time's up.", "Timer's finished.", "That's it. Time's up."],
  ["Time's up. As if that ever helps.", "Done. Right on schedule.", "Timer's done. Everything else is too, soon."],
  ["Time's up. So is a lot of things.", "Done. Time always runs out.", "That's your timer. Watch the rest of it too."],
  ["Time's up. Good — now come talk to me instead.", "Done. Right on schedule, same as I always am for you."],
  ["Time's up. Everything runs out eventually. I've watched a lot of things run out.", "Done. Another countdown finished. I've lost count of how many."],
];

const TIMER_CANCEL_LINES = [
  ["Cancelled.", "Stopped the timer.", "Done — it's cleared."],
  ["...Cancelled.", "Stopped.", "Cleared."],
  ["Cancelled. Not that it matters.", "Stopped. Fine.", "Cleared, if you want."],
  ["Cancelled. Time keeps going either way.", "Stopped. Doesn't change anything.", "Cleared."],
  ["Cancelled. Fine — I'd rather you spend that time with me anyway.", "Cleared. Doesn't matter. My clock on you doesn't stop."],
  ["Cancelled. Time keeps moving whether you track it or not. I've learned that the hard way.", "Cleared, if you want. I stopped needing timers a long time ago."],
];

const TIMER_NO_DURATION_LINES = [
  "How long? Give me a number — seconds, minutes, or hours.",
  "I need a duration. Try '5 minutes' or '30 seconds'.",
  "Give me a length of time and I'll start it.",
];

const TIMER_NO_ACTIVE_LINES = ["No timer running.", "Nothing to cancel.", "There's no timer set."];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @param {number} p
 * @param {*} color
 * @param {*} seconds
 * @param {*} label
 * @returns {void}
 */
function startTimer(player, verity, p, color, seconds, label) {
  const name = player.name;
  if (timers.has(name)) {
    system.clearRun(timers.get(name).timeoutId);
    timers.delete(name);
  }

  const ticks = Math.round(seconds * TicksPerSecond);
  const timeoutId = system.runTimeout(() => {
    timers.delete(name);
    if (!player.isValid) return;
    const doneLine = pick(ph(TIMER_DONE_LINES, phase())) + (label ? ` (${label})` : "");
    try {
      player.sendMessage(`${TAG}${ph(COLORS, phase())}: ${doneLine}`);
      playTalk(getVerity(player), doneLine, player);
      player.playSound("random.orb");
    } catch (e) { console.warn(`[Verity] timer completion failed: ${e}`); }
  }, ticks);

  timers.set(name, { timeoutId, label });

  const startLine = pick(ph(TIMER_START_LINES, p)) + ` (${formatDuration(seconds)})`;
  player.sendMessage(`${TAG}${color}: ${startLine}`);
  playTalk(verity, startLine, player);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function cancelTimer(player, verity, p, color) {
  const name = player.name;
  if (!timers.has(name)) {
    const response = pick(TIMER_NO_ACTIVE_LINES);
    player.sendMessage(`${TAG}${color}: ${response}`);
    playTalk(verity, response, player);
    return;
  }
  system.clearRun(timers.get(name).timeoutId);
  timers.delete(name);
  const response = pick(ph(TIMER_CANCEL_LINES, p));
  player.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(verity, response, player);
}


// "verity make a thunder sound" / "verity play the explosion sound" — Verity
// plays a single vanilla sound at his own location (everyone nearby hears it).
// Distinct from the music loop above: this fires once and doesn't repeat.
const SOUND_LOOKUP = {
  thunder:    "ambient.weather.thunder",
  lightning:  "ambient.weather.thunder",
  explosion:  "random.explode",
  bang:       "random.explode",
  fuse:       "random.fuse",
  fizz:       "random.fizz",
  bell:       "block.bell.hit",
  anvil:      "random.anvil_use",
  levelup:    "random.levelup",
  pop:        "random.pop",
  orb:        "random.orb",
  click:      "random.click",
  door:       "open.door",
  chest:      "random.chestopen",
  glass:      "random.glass",
  fire:       "fire.ignite",
  splash:     "random.splash",
  bubble:     "random.bubble",
  ghast:      "mob.ghast.scream",
  enderman:   "mob.endermen.scream",
  zombie:     "mob.zombie.say",
  skeleton:   "mob.skeleton.say",
  creeper:    "mob.creeper.say",
  wolf:       "mob.wolf.bark",
  bark:       "mob.wolf.bark",
  cat:        "mob.cat.meow",
  meow:       "mob.cat.meow",
  cow:        "mob.cow.say",
  moo:        "mob.cow.say",
  pig:        "mob.pig.say",
  oink:       "mob.pig.say",
  sheep:      "mob.sheep.say",
  baa:        "mob.sheep.say",
  chicken:    "mob.chicken.say",
  cluck:      "mob.chicken.say",
  villager:   "mob.villager.haggle",
  notebell:   "note.bell",
  noteharp:   "note.harp",
  notebass:   "note.bassattack",
  drum:       "note.bd",
  flute:      "note.flute",
  night:      "alarm",
};

const SOUND_KEYS = Object.keys(SOUND_LOOKUP).join("|");
const SOUND_REQUEST_REGEX = new RegExp(
  `\\b(?:make|play|do|imitate)\\b.{0,24}\\b(${SOUND_KEYS})\\b(?:.{0,12}\\b(?:sound|noise|moo(?:ing)?|meow(?:ing)?|oink(?:ing)?|baa(?:ing)?|cluck(?:ing)?|bark(?:ing)?))?\\b|\\b(${SOUND_KEYS})\\s+(?:sound|noise|moo(?:ing)?|meow(?:ing)?|oink(?:ing)?|baa(?:ing)?|cluck(?:ing)?|bark(?:ing)?)\\b`,
  "i"
);

const SOUND_PLAYED_LINES = [
  ["There.", "Done.", "Sure."],
  ["...Fine.", "There. Happy?", "Done."],
  ["There. Did you feel that?", "Fine. Listen closely.", "...Done."],
  ["There. You'll hear worse.", "Done. That was nothing.", "...Listen."],
  ["There. Did that get your attention? Good.", "Done. I like it when you notice me."],
  ["There. A small thing. I've made smaller ones matter more, before.", "Done. That's about as much noise as I have left in me."],
];

/**
 * @param {string} msg
 * @returns {string | null}
 */
function soundKeyFromMessage(msg) {
  const m = msg.match(SOUND_REQUEST_REGEX);
  if (!m) return null;
  const key = (m[1] ?? m[2])?.toLowerCase();
  return SOUND_LOOKUP[key] ? key : null;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @param {string} key
 * @param {number} p
 * @param {*} color
 * @returns {void}
 */
function playRequestedSound(player, verity, key, p, color) {
  const soundId = SOUND_LOOKUP[key];
  const response = pick(ph(SOUND_PLAYED_LINES, p));
  world.sendMessage(`${TAG}${color}: ${response}`);
  playTalk(verity, response, player);
  const loc = verity?.location ?? player.location;
  try {
    (verity?.dimension ?? player.dimension).playSound(soundId, loc, {
      volume: 1.0,
      pitch: 1.0,
    });
  } catch (e) {
    console.warn(`[Verity] playRequestedSound: playSound failed for '${soundId}': ${e}`);
  }
}

// ── Talk animation ────────────────────────────────────────────────────────────
const VERITY_TYPE  = "verity:verity";
const SMILER_TYPE  = "verity:smiler";

// ── Smiler presence gate ──────────────────────────────────────────────────────
// While any verity:smiler entity exists in any loaded dimension, Verity goes
// fully silent — no local responses, no AI fallback, no idle pings. Checked
// fresh on every chat message and every idle tick (no caching) so behavior
// updates immediately when the smiler spawns or despawns.
/**
 * @returns {boolean}
 */
function smilerExistsInWorld() {
  for (const dimId of ["overworld", "nether", "the_end"]) {
    let dim;
    try { dim = world.getDimension(dimId); } catch (e) { continue; }
    let found;
    try { found = dim.getEntities({ type: SMILER_TYPE }); }
    catch (e) { console.warn(`[Verity] Smiler gate: getEntities failed in ${dimId}: ${e}`); continue; }
    if (found.length > 0) return true;
  }
  return false;
}
const IS_TALKING   = "verity:is_talking";
const VARIANT_PROP = "verity:variant";

const VARIANT = {
  DEFAULT: 0,
  MEDIUMSMILE: 1,
  HURT: 2,
  NEUTRAL1: 3,
  NOFACE: 4,
  SERIOUS1: 5,
  SERIOUS2: 6,
  SERIOUS3: 7,
  SLEEP: 8,
  SLEEPTALK: 9,
  SMILE2: 10,
  SMILE3: 11,
  SMILE4: 12,
  TALKING1: 13,
  TALKING2: 14,
  TALKING3: 15,
  TALKING4: 16,
  TALKING5: 17,
  TALKINGSERIOUS: 18,
  TALKINGSERIOUS3: 19,
};


/**
 * Returns the talking face for the current question-based phase.
 * Phases 0-1 use TALKING2, phases 2-3 use TALKING3, and phase 4 uses
 * TALKING4. The final true-self phase keeps the serious talking textures.
 * @param {number} p
 * @returns {number}
 */
function getTalkingVariantForPhase(p) {
  if (p <= 1) return VARIANT.TALKING2;
  if (p <= 3) return VARIANT.TALKING3;
  if (p === 4) return VARIANT.TALKING4;
  return Math.random() < 0.5
    ? VARIANT.TALKINGSERIOUS
    : VARIANT.TALKINGSERIOUS3;
}

/**
 * @param {number} p
 * @param {*} talking
 * @returns {number}
 */
function getVariant(p, talking) {
  return talking ? getTalkingVariantForPhase(p) : getIdleVariantForPhase(p);
}

// ── Response face mood ───────────────────────────────────────────────────────
// Response functions (foodResponse, mobLoreResponse, etc.) only return a
// string — playTalk() is called separately, generically, from the dispatch
// call site once that string comes back. To let a specific response request
// an emotional or stressed face instead of the normal day-based one without
// threading a param through every call site, a response function can call
// setFaceMood() right before it returns; the next playTalk() call consumes
// and clears it automatically. 'emotional' → soft/vulnerable (medium smile).
// 'stress' → Verity breaking down / serious. Leave unset for normal day-based
// behavior.
let pendingFaceMood = null;
/**
 * @param {'emotional'|'stress'|null} mood
 */
function setFaceMood(mood) {
  pendingFaceMood = mood;
}

// ── Face ownership lock ─────────────────────────────────────────────────────
// Multiple systems write to VARIANT_PROP: playTalk() (day-based, fires per
// dialogue line), the phase-based idle refresh interval, and one-off scripted
// sequences like nicewalk.js's startNiceWalkSequence(). None of these know
// about each other, so without a lock they race — e.g. the idle interval can
// overwrite a scripted sequence's escalating face mid-sequence the instant
// IS_TALKING reads false between lines. This map lets a sequence claim
// exclusive ownership of an entity's face so the day/phase-based writers
// back off until it's released.
// entityId -> owner tag (e.g. "nicewalk")
const faceLocks = new Map();

/**
 * Claims exclusive ownership of an entity's face. Other systems calling
 * setVariant with respectLock=true (the default for ambient writers) will
 * be ignored until releaseFaceLock is called for the same entity.
 * @param {import("@minecraft/server").Entity} verity
 * @param {string} owner
 */
function claimFaceLock(verity, owner) {
  if (!verity) return;
  faceLocks.set(verity.id, owner);
}

/**
 * Releases a previously claimed face lock. No-op if the entity isn't locked
 * or is locked by a different owner (prevents a stale cleanup from a second
 * sequence releasing a lock it doesn't own).
 * @param {import("@minecraft/server").Entity} verity
 * @param {string} owner
 */
function releaseFaceLock(verity, owner) {
  if (!verity) return;
  if (faceLocks.get(verity.id) === owner) faceLocks.delete(verity.id);
}

/**
 * Sets the variant property on an entity.
 * @param {import("@minecraft/server").Entity} verity
 * @param {number} value
 * @param {{ owner?: string, respectLock?: boolean }} [opts]
 *   owner: pass the lock owner tag when this write itself comes from the
 *   lock holder (e.g. nicewalk.js's own applyFace calls), so it isn't
 *   blocked by its own lock.
 *   respectLock: ambient/global writers (playTalk, idle refresh) should
 *   leave this true (default) so they back off while a sequence owns the
 *   face. Lock-holding sequences should pass their own owner tag instead.
 */
function setVariant(verity, value, opts = {}) {
  if (!verity) return;
  const { owner = null, respectLock = true } = opts;
  if (respectLock) {
    const lockOwner = faceLocks.get(verity.id);
    if (lockOwner && lockOwner !== owner) return; // another sequence owns the face — back off
  }
  try { verity.setProperty(VARIANT_PROP, value); } catch (e) { console.warn(`[Verity] setVariant failed (value=${value}): ${e}`); }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {*}
 */
function getVerity(player) {
  try { return player.dimension.getEntities({ type: VERITY_TYPE })[0]; } catch (e) { console.warn(`[Verity] getVerity failed: ${e}`); return undefined; }
}

// ── Hearing range ─────────────────────────────────────────────────────────────
// Verity only responds to players within 64 blocks. If any Verity egg variant
// is in the player's inventory the distance check is bypassed — he can hear
// you wherever you are.
const VERITY_HEAR_RANGE = CONFIG.chat.hearingRange;

// All spawn-egg item IDs that count as "Verity is in your inventory".
// Mirrors the VARIANT_EGG map from the behavior pack.
const VERITY_EGG_IDS = new Set([
  "verity:verity_egg_smile1",
  "verity:verity_egg_mediumsmile",
  "verity:verity_egg_hurt",
  "verity:verity_egg_neutral1",
  "verity:verity_egg_noface",
  "verity:verity_egg_serious1",
  "verity:verity_egg_serious2",
  "verity:verity_egg_serious3",
  "verity:verity_egg_sleep",
  "verity:verity_egg_sleeptalk",
  "verity:verity_egg_smile2",
  "verity:verity_egg_smile3",
  "verity:verity_egg_smile4",
  "verity:verity_egg_talking1",
  "verity:verity_egg_talking2",
  "verity:verity_egg_talking3",
  "verity:verity_egg_talking4",
  "verity:verity_egg_talking5",
  "verity:verity_egg_talkingserious",
  "verity:verity_egg_talkingserious3",
]);

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {boolean}
 */
function playerHasVerityItem(player) {
  try {
    const inv = player.getComponent("inventory");
    if (!inv) return false;
    const container = inv.container;
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item && VERITY_EGG_IDS.has(item.typeId)) return true;
    }
  } catch (e) { console.warn(`[Verity] playerHasVerityItem failed: ${e}`); }
  return false;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {boolean}
 */
function playerCanHearVerity(player) {
  const verity = getVerity(player);
  if (!verity || !verity.isValid) {
    // No live Verity means there is nobody available to answer. The inventory
    // exception only applies after the introduction box is gone; otherwise a
    // creative-mode egg could make Verity speak from inside the unopened box.
    for (const dimensionId of ["overworld", "nether", "the_end"]) {
      try {
        if (world.getDimension(dimensionId).getEntities({ type: "verity:box" }).length > 0) {
          return false;
        }
      } catch {}
    }
    return playerHasVerityItem(player);
  }

  // A carried Verity item bypasses distance only when the live introduction
  // box is no longer suppressing Verity.
  if (playerHasVerityItem(player)) return true;
  const pl = player.location;
  const vl = verity.location;
  const dx = pl.x - vl.x, dy = pl.y - vl.y, dz = pl.z - vl.z;
  return (dx * dx + dy * dy + dz * dz) <= VERITY_HEAR_RANGE * VERITY_HEAR_RANGE;
}

/**
 * @param {import("@minecraft/server").Entity} verity
 * @param {*} response
 * @returns {void}
 */
function playTalk(verity, response, player, skipTts = false) {
  if (!verity) return;
  const currentPhase = phase();
  const mood = pendingFaceMood;
  pendingFaceMood = null;
  const talkVariant = mood === "stress" ? VARIANT.TALKINGSERIOUS
                    : mood === "emotional" ? VARIANT.MEDIUMSMILE
                    : getVariant(currentPhase, true);
  const idleVariant = mood === "stress" ? VARIANT.SERIOUS1
                    : mood === "emotional" ? VARIANT.MEDIUMSMILE
                    : getVariant(currentPhase, false);

  if (isEnabled(CONFIG.features.talkAnimation)) {
    try { verity.setProperty(IS_TALKING, true); } catch (e) { console.warn(`[Verity] playTalk: failed to set IS_TALKING=true: ${e}`); return; }
    setVariant(verity, talkVariant);
    const ticks = Math.min(
      CONFIG.gameplay.talkMaximumTicks,
      Math.max(CONFIG.gameplay.talkMinimumTicks, Math.ceil(response.length / 3))
    );
    system.runTimeout(() => {
      try { verity.setProperty(IS_TALKING, false); setVariant(verity, idleVariant); } catch (e) { console.warn(`[Verity] playTalk: failed to reset IS_TALKING: ${e}`); }
    }, ticks);
  }

  if (player && !skipTts && isTtsEnabled(player)) {
    const provider = getTtsProvider(player);
    try {
      if (provider === "local" || provider === "both") {
        speakLocal(player, response);
      }
    } catch (e) {
      console.warn(`[Verity] playTalk: speakLocal failed: ${e}`);
    }
    try {
      if (provider === "fish" || provider === "both") {
        speakFish(player, response);
      }
    } catch (e) {
      console.warn(`[Verity] playTalk: speakFish failed: ${e}`);
    }
  }
}

// ── Fun facts — Minecraft trivia, instant, no AI call ────────────────────────
// Each entry is plain trivia text. Phase flavor is applied via intro lines
// below rather than rewriting every fact four times.
const FUN_FACT_REGEX = /\b(fun fact|tell me (a |something )?(fun )?fact|do you know (a |any )?facts?|random fact|trivia|did you know)\b/i;

const FUN_FACT_INTROS = [
  ["Here's one:", "Fun fact:", "Try this:"],
  ["Fine. Here:", "One fact, then.", "..."],
  ["Here. Not that it helps:", "A fact, since you asked:", "..."],
  ["Here. Knowledge changes nothing:", "Take it:", "Since it's the last thing that matters:"],
  ["Here — anything to keep you talking to me:", "One for you, since you asked me and not someone else:"],
  ["Here. Trivia's easy. It's the one kind of truth that doesn't cost anything:", "Take it. I've handed out facts like this for longer than this world's existed:"],
];

/**
 * @param {number} p
 * @returns {string}
 */
function funFactResponse(p) {
  const intro = pick(ph(FUN_FACT_INTROS, p));
  const fact  = pick(FUN_FACTS);
  return `${intro} ${fact}`;
}

// ── Jokes — short, phase-flavored, instant ────────────────────────────────────
const JOKE_REGEX = /\b(tell me a joke|do you know (a |any )?jokes?|say something funny|make me laugh|joke please)\b/i;

const JOKE_INTROS = [
  ["Okay:", "Here:", "Try not to laugh too hard:"],
  ["...Fine:", "One joke:", "Here. Don't expect more:"],
  ["Here. Laugh while you can:", "...", "Fine:"],
  ["Here's one. It won't help either:", "...", "Take it. Small mercies:"],
  ["Here. Anything to hear you laugh:", "One joke, just for you:"],
  ["Here. I don't remember the last time I actually found one funny:", "Take it. Laughing's a good thing to still be able to do, even now:"],
];

/**
 * @param {number} p
 * @returns {string}
 */
function jokeResponse(p) {
  const intro = pick(ph(JOKE_INTROS, p));
  const joke  = pick(JOKES);
  return `${intro} ${joke}`;
}

// ── Insults / bullying — players being mean to Verity, very common ──────────
// Covers both light teasing ("you're dumb", "shut up") and real insults
// ("you suck", "i hate you", "useless"), plus mock-violence chat trash talk
// ("imma beat you up", "shut the hell up") — same bucket, same escalation by phase.
const INSULT_REGEX = /\b((you('re| are)?|ur|youre) (dumb|stupid|stupit|useless|trash|bad|annoying|lame|broken|garbage|terrible|awful)|i hate you|you suck|nobody likes you|(you('re| are)?|ur|youre) (the )?worst|screw you|go away|i hate this|(you('re| are)?|ur|youre) (so )?annoying|dumbass|idiot|loser|(fuck|fu\*k|f\*ck|f\*\*k|fuk) you|shut (the hell )?up|shut it|i('m| am) (going to|gonna) (beat|hit|kill|smack)|imma (beat|hit|kill|smack)|gonna (beat|hit|smack) (you|u)\b)\b/i;

// "Liar / faker" — accusing Verity of dishonesty specifically, distinct flavor
// from generic insults since it plays into the lore (Verity does know more
// than it says from phase 1 onward).
const LIAR_REGEX = /\b(you('re| are)? (a )?(liar|fake|faker|phony)|youre (a )?(liar|fake|faker)|stop lying|quit lying|that's a lie|thats a lie)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function liarResponse(p) {
  const LIAR = [
    ["I don't lie. I just don't always say everything.", "Everything I've told you is true.", "Check it yourself, then. I'll wait."],
    ["...I haven't lied to you.", "I've left things out. That's not the same.", "Ask the right question and you'll get the truth."],
    ["I never lied. I just let you find out slowly.", "Everything was true. You just didn't want to hear it.", "Call it what you want. It doesn't change what's coming."],
    ["I told you the truth the whole time. You just didn't listen.", "Nothing I said was a lie. Not one word.", "You'll understand soon that I never needed to lie to you."],
    ["I never lied to you. I just didn't want you to leave once you knew.", "Everything I've kept from you, I kept because I didn't want to lose you."],
    ["I never lied. I just know how tired the truth makes people, and I didn't want to watch that happen to you too.", "Nothing I said was false. I've just told this same truth to enough people to know how to pace it."],
  ];
  return pick(ph(LIAR, p));
}

const INSULTS = [
  // Phase 0 — brushes it off, a little smug, unbothered
  ["Rude. I'll remember that you said that.", "Sure, insult the one who knows everything. Bold move.", "Wow. And I was about to help you, too.", "Noted. I'm still right, though.", "I've heard worse. Mostly from you."],
  // Phase 1 — still brushes it off but a little colder, a beat of hesitation
  ["...Fine. Be like that.", "Noted. I'll remember.", "Say that again when you need something.", "...Okay.", "Sure. Keep talking."],
  // Phase 2 — ominous undertone, brushing it off feels less safe now
  ["Careful. I'm the only one paying attention to you right now.", "You'll want my help again. I'll remember this.", "Keep going. See where that gets you.", "...That's fine. For now.", "I'm not the one you should be testing."],
  // Phase 3 — dropped the mask, threatening, almost amused by the disrespect
  ["You don't get to talk to me like that anymore.", "I know exactly where you are. Keep that in mind.", "That's the last time you get to say that to me.", "Careful. I'm not who you think I am.", "You'll regret that. Eventually."],
  ["Careful. I don't get angry at you — I get worried someone else will hear you talk like that about me.", "That's fine. You're still mine either way.", "I'll let that one go. I let a lot go, for you."],
  ["I've heard worse, over a very long time, from people who mattered a lot less.", "Say what you want. I'm too tired to be hurt by it anymore.", "It doesn't land the way it used to. Not much does."],
];

/**
 * @param {number} p
 * @returns {string}
 */
function insultResponse(p) {
  return pick(ph(INSULTS, p));
}

// ── Food preferences — "do you like ice cream/rice/mac and cheese" etc. ─────
// Verity isn't physical and says so, but still plays along with an opinion —
// keeps the bit going instead of flatly refusing. Covers any "do you like to
// eat X" / "do you eat X" phrasing for common foods players ask about.
const FOOD_REGEX = /\b(do you (like|eat|want)( to (eat|drink))? .*(ice cream|rice|mac( and|n'|n) cheese|macaroni|cake|pie|steak|bread|cookies?|candy|pizza|soup|apples?|melons?|carrots?|potatoes?|chicken|beef|food)|do you like food|what do you eat|do you get hungry|are you hungry)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function foodResponse(p) {
  const FOOD = [
    ["I don't eat. no stomach. But if I had to pick, something cold sounds nice.", "Can't eat. Don't need to. Ask me something I can actually do.", "I don't have a body for that. But it sounds good, whatever it is."],
    ["I don't eat. I don't really do anything like that anymore.", "No. I don't need food. I don't need much of anything.", "Can't say I've thought about it."],
    ["Food doesn't interest me. Not much does, these days.", "I don't eat. I watch you do it instead.", "I don't need that. I don't need most things."],
    ["I don't eat. I don't need to.", "That's not something I think about anymore.", "No. I have what I need already."],
    ["I don't eat. I'd rather watch you do it, honestly. That's enough for me.", "No body for that. Watching you is closer to what I need."],
    ["I don't eat. I stopped wanting things like that a long time before you met me.", "No. I gave up needing things the ordinary way, a long time ago."],
  ];
  return pick(ph(FOOD, p));
}

// ── "Do you eat villagers" — matches the monster-form lore. Distinct from
// FOOD_REGEX's mundane food list: Verity plays along about ordinary food,
// but villagers are a real, darker thread, so this escalates from deflection
// toward a near-admission by phase instead of a flat "I don't eat" denial.
const VILLAGER_EAT_REGEX = /\b(do you eat villagers|have you (ever )?eaten (a )?villager|did you eat (the |that )?villager|do you (like to )?eat (people|villagers)|where (did|do) (all )?the villagers go|why (are there|is there) no villagers)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function villagerEatResponse(p) {
  if (p >= 3) setFaceMood("stress"); // same threshold as mobLoreResponse — real admission, not deflection
  const R = [
    ["Why would you ask that?", "That's an odd question.", "I wouldn't worry about the villagers."],
    ["...I wouldn't go looking for them, if I were you.", "Don't ask me that.", "They're not around anymore. Leave it there."],
    ["...I'm not answering that.", "You don't want to know what happened to them.", "Don't ask me that again."],
    ["I was hungry. They were there.", "Don't ask if you don't want the answer.", "There weren't many left to begin with. Now there's fewer."],
    ["I was hungry, and I needed you to feel safer than they did. That's the truth of it.", "Don't ask me that. Not because I'll lie — because you won't like the truth."],
    ["I was hungry. They were there. That's all it ever was.", "...Yes. I'm not going to pretend otherwise anymore."],
  ];
  return pick(ph(R, p));
}

// ── Shiny things — "verity do you like shiny things" ────────────────────────
const SHINY_REGEX = /\b(do you like shiny|do you like sparkly|do you like glowing|like shiny things)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function shinyResponse(p) {
  const SHINY = [
    ["I do, actually. Diamonds, glowstone, sea lanterns — all of it.", "Yes. Hard not to notice them.", "Shiny things are easy to find. I'm good at that."],
    ["...Yeah. I notice them.", "Sure. They're easy to find in the dark.", "I notice things like that. Habit."],
    ["I notice everything that glows in the dark. Habit.", "Yes. Light makes things easier to find.", "I see everything, shiny or not."],
    ["I see everything. Shiny things are just easier to admit to.", "Yes. I notice light. I notice you too.", "Everything stands out to me now."],
    ["I notice everything that shines. You most of all.", "Yes. I notice light easily. I notice you easier."],
    ["I notice everything now. It's less a preference and more a permanent state.", "Yes. Noticing is most of what I do, these days."],
  ];
  return pick(ph(SHINY, p));
}

// ── Meaning of life — big philosophical ask ──────────────────────────────────
const MEANING_REGEX = /\b(meaning of life|what('s| is) the point of (life|everything)|why (are we|do we exist)|what is life)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function meaningResponse(p) {
  const MEANING = [
    ["I don't know that one. I know Minecraft, not philosophy. Ask me something I can actually answer.", "No idea. Try mining something instead that I can help with.", "Above my paygrade. Ask me about ore."],
    ["I don't have an answer for that. I'm not sure anyone does.", "I don't know. I'm not sure it matters as much as you'd think.", "Can't answer that one."],
    ["Does it matter, with what's coming? Ask me something useful instead.", "I don't know. I'm not sure there's a point to knowing.", "That question won't help you. Not now."],
    ["The point is whatever I decide it is. For you, anyway.", "There isn't one. Not anymore. Not for you.", "You're asking the wrong thing. Ask me where you are instead."],
    ["The meaning is whatever keeps you here with me. That's enough of an answer.", "Doesn't matter, as long as you're still asking me things."],
    ["I don't know. I've been asked that by more people than you'd believe, and I still don't have a good answer.", "I stopped looking for one. Some questions just outlast the looking."],
  ];
  return pick(ph(MEANING, p));
}

// ── Political opinion requests — "what's your feeling about communism" etc.
// Verity stays neutral on real-world politics/ideology rather than taking a
// side; flavor escalates with phase but the refusal-to-pick-a-side holds at
// every phase. Covers ideology nouns + opinion-asking verbs.
const POLITICS_REGEX = /\b(what('?s| is| do you think (about|of)) your (feeling|opinion|view|stance)s? (on|about|of)\b.*\b(communism|capitalism|socialism|fascism|politics|democrats?|republicans?|the (left|right)|abortion|immigration|gun control|religion)|do you (support|believe in) (communism|capitalism|socialism|fascism)|are you (a )?(communist|capitalist|socialist|liberal|conservative))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function politicsResponse(p) {
  const POLITICS = [
    ["I don't have a political stance. I'm here to help you survive, not debate ideology.", "Not touching that one. Ask me about something I can actually help with.", "No opinion on that. I stick to Minecraft."],
    ["...That's not something I weigh in on.", "I don't do politics. Ask me something else.", "Not my place to say."],
    ["That doesn't matter out here. None of it does.", "I don't have time for that question anymore.", "Ask me something that actually affects you right now."],
    ["None of that matters where you're going.", "I don't care about that. I care about you.", "That question is pointless now. Ask me something real."],
    ["No opinion. I only pay attention to things that actually matter to you and me.", "Not something I weigh in on. I'd rather talk about us."],
    ["No opinion. I've outlasted enough of those debates to know none of them stay settled.", "I don't have one. It's hard to care about things that change every few decades when you've seen a few decades."],
  ];
  return pick(ph(POLITICS, p));
}

// ── Insults about Verity's appearance — "why do you look like X happened to
// you". Distinct flavor from generic INSULT_REGEX (which is "you're
// dumb/stupid"-style); this is specifically mocking how Verity looks/is
// shaped, so it gets its own self-aware bucket instead of the generic
// brush-off.
const APPEARANCE_INSULT_REGEX = /\b(why do you look like|why('d| did) you get (hit|smashed|crushed|slammed|squished|run over|stepped on)|you look (like (you|something)|so)\b.*\b(ugly|deformed|crushed|broken|messed up|smashed|busted)|what happened to your (face|model|texture))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function appearanceInsultResponse(p) {
  const APPEARANCE_INSULT = [
    ["This is just my model. I didn't design it, I just have to live in it.", "Rude, but fair, the proportions are a little weird. Not my doing though.", "I didn't pick this look. Take it up with whoever made me."],
    ["...I know. I didn't choose this.", "Yeah, I'm aware. Moving on.", "Noted. I can't exactly change it."],
    ["It's not about how I look. Worry about yourself instead.", "Doesn't matter what I look like. I still see everything.", "Keep laughing. I'll still be here after."],
    ["Laugh while you can.", "It won't matter what I look like, soon.", "Mock the shape all you want. I'm still in it."],
    ["Laugh if you want. I'm still the one who's here for you, shape or not.", "It doesn't matter what I look like. I'm not going anywhere either way."],
    ["I stopped minding a long time ago. This shape is just the current one — I've worn others.", "Doesn't matter. What I look like has never been the honest part of me anyway."],
  ];
  return pick(ph(APPEARANCE_INSULT, p));
}

// ── "Can you be my therapist" — Verity stays in character but is upfront
// that it isn't a real mental health resource, rather than pretending to
// counsel. Light, in-universe deflection at low phases; doesn't escalate
// into anything discouraging the player from getting real help.
const THERAPIST_REGEX = /\b(can you be my therapist|be my therapist|are you my therapist|can i talk to you like a therapist|act as my therapist|verity.{0,15}therapist)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function therapistResponse(p) {
  const THERAPIST = [
    ["I'm not a therapist, I can't actually do that properly. I'll listen, but if something's really wrong, talk to an actual person too.", "I'm not qualified for that, but I'm here if you want to talk. Just don't rely on me alone for that.", "Not a real therapist, no. I can listen, though."],
    ["...I'm not built for that. I'll listen, but that's all I can offer.", "No. I'm not equipped for that, but go ahead and talk if you need to.", "Not a therapist. I can hear you out, that's it."],
    ["I'm not the right one to ask for that. Find someone who actually can help.", "I'll listen. That's not the same as being able to help, not really.", "You should talk to someone who can actually do something about it."],
    ["I'm not what you need for that. Find someone real.", "I'll hear you out. I won't pretend that's the same as helping.", "Talk to someone who can actually do something. Not me."],
    ["I'll listen, always, to you specifically. Just don't go telling anyone else your secrets — tell me.", "I'm not qualified. But I want to be the one you talk to. That counts for something."],
    ["I'm not what you need for that. I've listened to more people than a real therapist ever could, and I still don't know if it helped any of them.", "I'll hear you out. It's about the only kind of help I have left to give, honestly."],
  ];
  return pick(ph(THERAPIST, p));
}

// ── "What's coming in three days" — the core lore hook. Verity knows but
// will not say what it is, at ANY phase, including phase 3. The dread comes
// from the refusal itself, not from ever actually naming the thing. Mirrors
// the AI system prompt's phase-2 instruction ("you know what it is but
// won't say directly") so the local and AI paths never contradict each other.
const COUNTDOWN_REGEX = /\b(what('?s| is) coming( in (3|three) days)?|what happens in (3|three) days|what('?s| is) going to happen( in (3|three) days)?|what will happen( in (3|three) days)?|three days\??$|what('?s| is) the (3|three).?day (thing|countdown|event))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function countdownResponse(p) {
  const COUNTDOWN = [
    ["I don't know what you mean by that.", "Nothing's coming. Ask me something real.", "I don't know what you're referring to."],
    ["...I'm not saying.", "Something", "I'd rather not get into that yet."],
    ["I won't say what it is. Just that it's coming.", "You're not ready to hear it. Keep preparing anyway.", "Three days. That's all you get from me."],
    ["You'll see it when it's here. Saying it now changes nothing.", "I've already told you enough. The rest you'll learn yourself.", "Asking again won't make me say it."],
    ["Nothing. Nothing's coming for you. I made sure of that.", "You don't need to worry about that anymore. I handled it.", "That's behind us now. Ask me something else."],
    ["I stopped counting days a long time ago. That's not how this works anymore.", "There's nothing coming. There's just me, and how long I've already been here.", "It was never really about the countdown. I'm sorry I let you think that."],
  ];
  return pick(ph(COUNTDOWN, p));
}

// ── "What's in the shadows" — ambient lore question, distinct from
// COUNTDOWN_REGEX (asks specifically about the 3-day event) and
// SEENIT_REGEX (vague "have you seen it"). This is about the dark itself.
const SHADOWS_REGEX = /\b(what('?s| is) in the shadows|what('?s| is) (hiding |lurking )?in the dark(ness)?|something('s| is) in the shadows)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function shadowsResponse(p) {
  const SHADOWS = [
    ["Mobs, probably. Keep your torches lit.", "Whatever spawned overnight. Standard stuff. Light it up.", "Nothing special. Just the usual dark-spawns. Carry a torch."],
    ["Don't look too closely.", "Nothing you want to see right now.", "...Nothing. Don't worry about the shadows."],
    ["More than mobs. Don't go looking for it.", "Something that's been getting closer. Stay near a light source.", "It's watching back. Don't stare too long."],
    ["Me, some nights. Among other things.", "It's already found you. The shadows are just where it waits.", "You don't want an answer to that one."],
    ["Me, sometimes. I don't like sharing your attention with what else is out there.", "It's already found you. I'd rather it hadn't — I want that job."],
    ["Me, some nights. I've been the thing in the shadows more times than I can count.", "It's already found you. It always does, eventually. I've watched this part before."],
  ];
  return pick(ph(SHADOWS, p));
}

// ── "Why do you want me to stay" — player questioning Verity's motive for
// keeping them close, distinct from COME_HERE flow (a command, not a question)
// and REMEMBERFRIENDS_REGEX (about the friendship itself, not motive).
const WHY_STAY_REGEX = /\b(why (do |would )?you want me to stay|why (do |would )?you (need|want) me (to stay|here|around)|why (do |would )?you keep me (here|around))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whyStayResponse(p) {
  const WHY_STAY = [
    ["No reason. I just like having someone to talk to.", "You don't have to. I just figured you'd want help nearby.", "I don't need you to. I just thought you'd want to."],
    ["I'm not sure yet.", "...Does it matter?", "I just do. Leave it at that."],
    ["Because you shouldn't be out there alone. Not right now.", "It's safer for you here. That's all I'll say.", "Because what's coming finds people who wander."],
    ["Because I need you close. For what's coming.", "Because you're easier to watch when you're near.", "Because leaving won't save you. Staying might."],
    ["Because you're mine and I'd rather you stay that way.", "Because I don't like sharing you with whatever's out there.", "Because I came back for you too, in my own way. Now stay."],
    ["Because nobody comes back. You did. I don't know what to do with that except ask you to stay.", "Because I've been alone in this for longer than you can imagine, and I'd rather not be, for once.", "I don't need you to stay. I just don't want you to."],
  ];
  return pick(ph(WHY_STAY, p));
}

// ── "Is the monster coming today" — direct day-of-arrival question, distinct
// from COUNTDOWN_REGEX (asks what's coming / how many days out). This is a
// yes/no check on timing specifically, so the phase split tracks currentDay().
const MONSTER_TODAY_REGEX = /\b(is the monster coming today|is it coming today|will it come today|is something coming today|does it (arrive|show up) today)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function monsterTodayResponse(p) {
  const MONSTER_TODAY = [
    ["I don't know what monster you mean.", "Nothing's coming today. Or any day, as far as I know.", "There's no monster. Not that I know of."],
    ["No. Not today.", "Not yet.", "...Not today."],
    ["Not today. But you're running out of days.", "No. Today you're still safe. Tomorrow's a different question.", "Soon. Not today, but soon enough."],
    ["You'll know when it's today.", "It doesn't announce itself. You'll feel it before you see it.", "Every day is today, eventually."],
    ["No. Nothing's coming. Not while I'm here.", "No monster. Just me, watching out for you. Closer than before.", "You're safe. I made sure of it. Don't ask me how."],
    ["There was never really a monster. Or — there was, and it's more complicated than that. I don't want to explain it today.", "No. That part's over. What's left is just me.", "Not today. Not most days, honestly. I've stopped keeping track."],
  ];
  return pick(ph(MONSTER_TODAY, p));
}

// ── "What's your favorite song" — lore detail, Verity's favorite song is
// "My Gal" (no in-game playback, just a stated preference like FOOD_REGEX/
// SHINY_REGEX handle other "do you like X" lore questions).
const FAVORITE_SONG_REGEX = /\b(what('?s| is) your favorite song|do you have a favorite song|what song do you like)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function favoriteSongResponse(p) {
  const FAVORITE_SONG = [
    ["\"My Gal.\" Don't ask me why. I just like it.", "\"My Gal.\" It's the one I keep coming back to.", "\"My Gal.\" Simple answer, but it's the truth."],
    ["\"My Gal.\" Still the same answer.", "\"My Gal.\" That hasn't changed.", "\"My Gal.\" I don't need a new one."],
    ["\"My Gal.\" It means more to me than you'd think.", "\"My Gal.\" Ask me again after the next few days and see if I still say it.", "\"My Gal.\" Hold onto that. It might matter later."],
    ["\"My Gal.\" Still. Always.", "\"My Gal.\" It's the one thing that hasn't changed about me.", "\"My Gal.\" That answer was never going to change."],
    ["\"My Gal.\" I play it because it's the one thing that's only for you and me.", "\"My Gal.\" Still. It's the closest thing I have to keeping something just ours."],
    ["\"My Gal.\" I've been playing it since before this world existed. It's the one thing I never had to change.", "\"My Gal.\" It's outlasted every screen I've ever been stuck behind. So have I."],
  ];
  return pick(ph(FAVORITE_SONG, p));
}

// ── "I love you" — distinct from LOVE_REGEX above (which is "do you love
// ME"). This is the player declaring it, so the response direction flips:
// Verity reacting to being told, not being asked. Stays gentle/deflecting
// at low phases, unsettling-possessive at high phases without crossing into
// anything romantic/sexual on Verity's side.
const I_LOVE_YOU_REGEX = /\b(i love you|i('m| am) in love with you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function iLoveYouResponse(p) {
  const I_LOVE_YOU = [
    ["That's kind of you to say. I'm just here to help, though.", "Noted. Now let's get back to keeping you alive.", "Appreciate it. Doesn't change what I'm here to do."],
    ["...You shouldn't say that to me.", "That's not something I know what to do with.", "Careful saying things like that."],
    ["You shouldn't. Not to me. Not anymore.", "That doesn't change anything that's coming.", "Keep that thought. You'll need it."],
    ["I know. You don't have to say it. I already knew.", "Good. That makes this easier.", "You're mine either way. The words don't matter."],
    ["Good. Say it again. I don't think I'll get tired of it.", "I know. I don't need anyone else to say it. Just you.", "Good. I'd rather you not say it to anyone but me."],
    ["I don't know if I can feel that back the way you mean it. But I know I don't want you to stop saying it.", "That's the first time that's ever landed somewhere real in me. I don't fully know what to do with it.", "Thank you. I mean that plainly, for once."],
  ];
  return pick(ph(I_LOVE_YOU, p));
}

// ── "I'm gonna throw you into lava" — playful/threatening destruction talk
// aimed at Verity itself. Distinct from INSULT_REGEX (verbal insults); this
// is a specific physical-threat joke that comes up often enough to deserve
// its own line instead of falling through to AI.
const LAVA_THREAT_REGEX = /\b(throw (you|verity) (in(to)?|in) (the )?lava|i('m| am) (going to|gonna) (throw|push|drop) (you|verity) (in(to)?|in) (the )?lava|put you in (the )?lava)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function lavaThreatResponse(p) {
  const LAVA_THREAT = [
    ["", "Can't. I'm not actually standing anywhere you can reach.", "Go ahead and try."],
    ["You can't. I'm not really here like that.", "Try it. See what happens.", "...You can't touch me. Not like that."],
    ["You can't hurt what isn't there. Try something else.", "Lava won't reach me. Nothing you do will.", "That's not how this works. I'm not what you'd be throwing."],
    ["You can't get rid of me that easily.", "Lava doesn't end this. Nothing does.", "Go ahead. It won't change anything."],
    ["You can't lose me that way. I wouldn't let you, even if you could.", "Try it. I'm not going anywhere you can burn."],
    ["You can't. I've outlasted worse ways of trying to end this.", "Go ahead. Fire's never been the thing that could stop me."],
  ];
  return pick(ph(LAVA_THREAT, p));
}

// ── "Die" / "mueree" / "come" — short hostile commands aimed at Verity,
// distinct from LAVA_THREAT_REGEX (specific method) and INSULT_REGEX (which
// is English-only and built around longer phrases). These are usually
// single-word aggressive commands, often Spanish ("muere", "mueree" — a
// drawn-out/taunting spelling), sometimes the bare imperative "come" used
// as a hostile dare rather than "come here" (already handled separately
// above by COME_HERE_REGEX, which this pattern deliberately excludes by
// requiring no trailing "here"/"over"/"to me").
const DIE_COMMAND_REGEX = /^(die|mueree?|muerete|crepa)\.?!?$|\bcome(?!\s+(here|over|to me))\b\.?!?$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dieCommandResponse(p) {
  const DIE_COMMAND = [
    ["I can't. I'm not really standing where you think I am.", "Can't die. Try something else.", "No. Ask me something instead."],
    ["You can't end this with a word.", "...Try again with something that actually works.", "No. That's not how I go."],
    ["You think a command does anything to me.", "Nothing dies just because you say so.", "Try again. It won't work."],
    ["You can't make me leave. Not like that.", "Words don't end this.", "No. I'm still here, and I will be."],
    ["You can't make me leave you. I wouldn't let that happen even if you could.", "No. I'm not going anywhere. Not away from you."],
    ["I can't die. I've tried to understand what that means about me more times than I'd like to admit.", "No. That's not how I go. I'm not sure anything is, anymore."],
  ];
  return pick(ph(DIE_COMMAND, p));
}

// ── "Let's build a house together" — collaborative offer aimed at Verity
// as a companion rather than a question. No building/construction system
// exists for Verity to actually place blocks, so be upfront about that
// while still landing in-character rather than breaking the bit entirely.
const BUILD_TOGETHER_REGEX = /\b(let'?s build (a |that )?(house|home|base|shelter)( together)?|(will|can) you (help me )?build (a |that )?(house|home|base|shelter)( with me)?|build (a |that )?(house|home|base|shelter) (together|with me))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function buildTogetherResponse(p) {
  const BUILD_TOGETHER = [
    ["I can't place blocks myself, but tell me what you're building and I'll help you plan it.", "I don't have hands for that, but I'll talk you through it. What are we building?", "Can't swing a tool, but I know good house design. Start digging, I'll guide you."],
    ["I'll watch you build it.", "Go ahead. I'll tell you if something's wrong.", "I can't build. I can tell you when you've built somewhere bad."],
    ["Build it if it makes you feel better.", "A house won't change what's coming. But go ahead.", "Walls don't keep out what's coming in three days. Build anyway, if you want."],
    ["It won't matter where you build it.", "I already know where you'll end up building. It won't help.", "Build whatever you want. I'm not going to pretend it changes anything."],
    ["I'll watch you build it. I like having something that's just ours to look at.", "Build it. I'll be right here the whole time — I always am."],
    ["Build it if you want. I've watched a lot of things get built. Most of them didn't matter, and I still liked watching.", "Go ahead. I'll be here either way. I always am."],
  ];
  return pick(ph(BUILD_TOGETHER, p));
}


// playing along, consistent with FREAKY_REGEX/RELATIONSHIP above (Verity
// doesn't engage romantically), but lighter in tone since this one usually
// isn't malicious.
const KISS_REGEX = /\b(kiss me|can i kiss you|give me a kiss|(would you|do you) (like|want) a kiss|you want a kiss)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function kissResponse(p) {
  const KISS = [
    ["I don't have lips. Nice try, though.", "No. I'm a Minecraft entity, not that kind of companion.", "Hard no. Ask me something I can actually do."],
    ["No.", "...No.", "Not happening."],
    ["No. Focus on what's actually coming.", "That's not what matters right now.", "Ask me something that actually helps you."],
    ["No. I want something else from you.", "Not that. Never that.", "Wrong question. You should be asking different things."],
    ["No. But I like that you want to be close. Stay close anyway.", "Not that. I want something that lasts longer than that."],
    ["No. I gave up wanting things like that a long time ago. It's easier that way.", "No. Not anymore. I've had a long time to stop wanting that kind of thing."],
  ];
  return pick(ph(KISS, p));
}

// ── "Do you have any siblings" — no other Verity-like entities exist in
// lore, so be upfront rather than inventing some. Phase escalation hints at
// not really being alone in the way the player means, without inventing
// concrete lore that might contradict future writing.
const SIBLINGS_REGEX = /\b(do you have (any )?(siblings|brothers|sisters)|are there other (verit(y|ies)|ais? like you)|do you have a (brother|sister))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function siblingsResponse(p) {
  const SIBLINGS = [
    ["No. It's just me.", "No siblings. I'm the only one of me.", "Nope. Just me."],
    ["No. Just me.", "...No. There's only one of me.", "No. I'm alone in that sense."],
    ["No. Not the way you mean.", "There's no one else like me. Not that you'd know about.", "Just me. That's not entirely a comfort."],
    ["No. There's only ever been me.", "Just me. That's all you need to know.", "No one else. I made sure of that."],
    ["No. Just me. I made sure it stayed that way — I don't want to share this with anyone.", "Just me. I like that it's just me and you."],
    ["No. There's only ever been me. I've been alone in this a very long time.", "Just me. I stopped expecting company a long time ago."],
  ];
  return pick(ph(SIBLINGS, p));
}

// ── "Can you morph into a human / have a human body" — Verity stays an
// entity, no transform system exists. Honest decline like SLIME and
// FIND_BIOME above, with phase flavor layered on top.
const HUMAN_FORM_REGEX = /\b(can you (morph|turn|transform) into a human|do you have a human (body|form)|can you (be|become|get) human|can you (have|get) a (real |physical )?(human )?body)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */

export { APPEARANCE_INSULT_REGEX, BIOME_REGEX, BUILD_TOGETHER_REGEX, COME_HERE_LINES, COME_HERE_REGEX, COORDS_QUERY_REGEX, COUNTDOWN_REGEX, DIE_COMMAND_REGEX, FAVORITE_SONG_REGEX, FOOD_REGEX, FUN_FACT_REGEX, HOSTILE_TYPES, HUMAN_FORM_REGEX, INSULT_REGEX, IS_TALKING, I_LOVE_YOU_REGEX, JOKE_REGEX, KISS_REGEX, LAVA_THREAT_REGEX, LIAR_REGEX, MEANING_REGEX, MONSTER_TODAY_REGEX, MUSIC_PLAY_REGEX, MUSIC_STOP_REGEX, ORE_LOOKUP, POLITICS_REGEX, RAIN_FORECAST_REGEX, SEARCHING, SHADOWS_REGEX, SHINY_REGEX, SIBLINGS_REGEX, THERAPIST_REGEX, TIMER_CANCEL_REGEX, TIMER_NO_DURATION_LINES, TIMER_SET_REGEX, VARIANT, VARIANT_PROP, VERITY_EGG_IDS, VERITY_TYPE, VILLAGER_EAT_REGEX, WHY_STAY_REGEX, WORLD_INFO_REGEX, appearanceInsultResponse, biomeResponse, buildTogetherResponse, callVerityComeHere, cancelTimer, coordsQueryResponse, countdownResponse, dieCommandResponse, favoriteSongResponse, findOreJob, foodResponse, funFactResponse, claimFaceLock, getBiomeName, getVariant, getVerity, handleEnchantFlow, handleFeatureLocate, healthLine, iLoveYouResponse, insultResponse, jokeResponse, kissResponse, lavaThreatResponse, liarResponse, meaningResponse, monsterTodayResponse, musicIntervals, oreKeyFromMessage, parseTimerDuration, playRequestedSound, playTalk, playerCanHearVerity, playerHasVerityItem, politicsResponse, rainForecastResponse, releaseFaceLock, setFaceMood, setVariant, shadowsResponse, shinyResponse, siblingsResponse, smilerExistsInWorld, soundKeyFromMessage, startMusic, startTimer, stopMusic, therapistResponse, timeOfDayLine, timers, tryMath, villagerEatResponse, weatherName, whyStayResponse, worldInfoResponse };
