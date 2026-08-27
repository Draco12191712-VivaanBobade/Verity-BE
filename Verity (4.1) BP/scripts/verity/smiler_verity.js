import { world, system } from "@minecraft/server";
import { VARIANT, setVariant, getVerity, VERITY_TYPE } from "./verity_systems.js";
import { LAST_LOCATION_PROP } from "./verity_place.js";

const SMILER_TYPE = "verity:smiler";
const SMILER_DETECT_RADIUS = 16;
const CHECK_INTERVAL_TICKS = 20; // once per second


const EGG_ITEM_IDS = new Set([
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

// Tracks whether a given player was near a smiler on the last check, so we
// only act on enter/exit transitions rather than every tick.
const smilerStateByPlayerId = new Map();

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (!player.isValid) continue;

    let nearbySmiler;
    try {
      nearbySmiler = player.dimension.getEntities({
        location: player.location,
        maxDistance: SMILER_DETECT_RADIUS,
        type: SMILER_TYPE,
      })[0];
    } catch (e) {
      console.warn(`[Verity] Smiler scan failed: ${e}`);
      continue;
    }

    const wasNear = smilerStateByPlayerId.get(player.id) ?? false;
    const isNear = nearbySmiler !== undefined;

    if (isNear && !wasNear) {
      onSmilerEnter(player);
    } else if (!isNear && wasNear) {
      onSmilerExit(player);
    }

    smilerStateByPlayerId.set(player.id, isNear);
  }
}, CHECK_INTERVAL_TICKS);

function onSmilerEnter(player) {
  const removed = removeEggFromInventory(player);
  if (!removed) return; // player wasn't carrying Verity — nothing to do

  const lastLocRaw = player.getDynamicProperty(LAST_LOCATION_PROP);
  if (typeof lastLocRaw !== "string") {
    console.warn("[Verity] No stored last location for player; cannot respawn Verity.");
    return;
  }

  let lastLoc;
  try {
    lastLoc = JSON.parse(lastLocRaw);
  } catch (e) {
    console.warn(`[Verity] Failed to parse stored last location: ${e}`);
    return;
  }

  let dimension;
  try {
    dimension = world.getDimension(lastLoc.dimensionId);
  } catch (e) {
    console.warn(`[Verity] Invalid stored dimension '${lastLoc.dimensionId}': ${e}`);
    return;
  }

  let verity;
  try {
    verity = dimension.spawnEntity(VERITY_TYPE, { x: lastLoc.x, y: lastLoc.y, z: lastLoc.z });
  } catch (e) {
    console.warn(`[Verity] Failed to respawn Verity near smiler: ${e}`);
    return;
  }

  // Smiler is already nearby, so go straight to NOFACE.
  system.runTimeout(() => {
    if (verity.isValid) setVariant(verity, VARIANT.NOFACE);
  }, 1);
}

function onSmilerExit(player) {

}

function removeEggFromInventory(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;

  for (let i = 0; i < inv.size; i++) {
    const stack = inv.getItem(i);
    if (stack && EGG_ITEM_IDS.has(stack.typeId)) {
      inv.setItem(i, undefined);
      return true;
    }
  }
  return false;
}
