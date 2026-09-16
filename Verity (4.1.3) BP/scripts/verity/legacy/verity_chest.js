import { world, system, ItemStack } from "@minecraft/server";

/**
 * verity_chest.js
 *
 * Behavior summary:
 * - Periodically (5-20 min) scans loaded chunks near Verity for an
 *   unprotected chest. If found, moves the chest's contents into a
 *   newly placed verity:chest entity at that location and removes the
 *   original chest block (so its contents stop being eligible for
 *   chunk/entity item-cleanup).
 * - While idle as verity:chest, it "peeks": after the player looks away,
 *   wait a random 1-3s, then transition to "peeking". If the player looks
 *   back at it, it plays the close animation and returns to "closed".
 * - Player interact (right-click) on verity:chest -> "open" state.
 *   While open: Verity stops normal local-response/chat behavior,
 *   listens to chat and stores it to memory, and the original chest
 *   block is replaced, with its inventory restored, in place of the
 *   verity:chest entity (i.e. you get the chest back).
 *
 * Dynamic properties used (per-entity):
 *   verity_chest:savedItems   -> JSON string of serialized ItemStacks
 *   verity_chest:lookAwayTick -> tick when player last looked away (peek timer)
 *   verity_chest:peekDelay    -> ticks to wait before peeking (40-60)
 *
 * World dynamic property:
 *   verity_chest:lastScanTick -> tick of last chest-scan attempt
 */

const TICKS_PER_SECOND = 20;
const SCAN_RADIUS = 12; // blocks, around each verity entity (kept small - runs at most every 5 min)
const SCAN_VERTICAL_RANGE = 2; // blocks up/down from entity's Y

const CHEST_TYPES = ["minecraft:chest", "minecraft:trapped_chest"];

/** In-memory state for entities currently "holding" a swapped chest. */
const heldChestData = new Map(); // entityId -> { typeId, location, dimensionId, items: [{slot, item}] }

/** Per-entity peek bookkeeping that doesn't need to survive a restart. */
const peekState = new Map(); // entityId -> { lookingAway: boolean, peekAtTick: number }

function ticksFromMinutesRange(minMin, maxMin) {
  const minTicks = minMin * 60 * TICKS_PER_SECOND;
  const maxTicks = maxMin * 60 * TICKS_PER_SECOND;
  return Math.floor(minTicks + Math.random() * (maxTicks - minTicks));
}

/** Schedules the next scan by storing an absolute tick on the world. */
function scheduleNextScan() {
  const next = system.currentTick + ticksFromMinutesRange(5, 20);
  world.setDynamicProperty("verity_chest:nextScanTick", next);
}

/**
 * Returns true if `target` is roughly within the player's forward view cone.
 * Computed manually since the API has no "isLookingAt" helper -
 * dot product of normalized view direction and direction-to-target.
 */
function isPlayerLookingAt(player, target, fovDegrees = 40) {
  const eye = player.getHeadLocation();
  const toTarget = {
    x: target.location.x - eye.x,
    y: (target.location.y + 0.5) - eye.y,
    z: target.location.z - eye.z,
  };
  const dist = Math.sqrt(toTarget.x ** 2 + toTarget.y ** 2 + toTarget.z ** 2);
  if (dist < 0.01) return true;
  const norm = { x: toTarget.x / dist, y: toTarget.y / dist, z: toTarget.z / dist };

  const view = player.getViewDirection();
  const dot = view.x * norm.x + view.y * norm.y + view.z * norm.z;
  const angle = Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI);
  return angle <= fovDegrees;
}

function anyPlayerLookingAt(dimension, target, maxDistance = 16) {
  for (const player of dimension.getPlayers()) {
    const dx = player.location.x - target.location.x;
    const dy = player.location.y - target.location.y;
    const dz = player.location.z - target.location.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq > maxDistance * maxDistance) continue;
    if (isPlayerLookingAt(player, target)) return true;
  }
  return false;
}

/** Serializes a container's contents to a plain array for dynamic-property storage. */
function serializeContainer(container) {
  const out = [];
  for (let slot = 0; slot < container.size; slot++) {
    const item = container.getItem(slot);
    if (!item) continue;
    out.push({
      slot,
      typeId: item.typeId,
      amount: item.amount,
      nameTag: item.nameTag,
    });
  }
  return out;
}

function applySerializedItems(container, serialized) {
  for (const entry of serialized) {
    const stack = itemStackSafe(entry.typeId, entry.amount, entry.nameTag);
    if (stack) container.setItem(entry.slot, stack);
  }
}

/** Wrapper to avoid throwing on bad typeIds (e.g. removed item). */
function itemStackSafe(typeId, amount, nameTag) {
  try {
    const stack = new ItemStack(typeId, amount);
    if (nameTag) stack.nameTag = nameTag;
    return stack;
  } catch {
    return undefined;
  }
}

/**
 * Scans around each verity-family entity for a nearby chest, swaps it
 * for a verity:chest entity, and stores the original chest data on the
 * new entity so it can be restored later.
 */
function scanForChests() {
  for (const dimension of [
    world.getDimension("overworld"),
    world.getDimension("nether"),
    world.getDimension("the_end"),
  ]) {
    const carriers = dimension.getEntities({ families: ["verity"] });
    for (const carrier of carriers) {
      if (!carrier.isValid) continue;
      // Don't re-trigger if this carrier is already a verity:chest.
      if (carrier.typeId === "verity:chest") continue;

      const origin = carrier.location;
      const found = findNearbyChest(dimension, origin, SCAN_RADIUS);
      if (!found) continue;

      swapChestForEntity(dimension, found);
      // Only do one swap per scan cycle per carrier to keep cost low.
      break;
    }
  }
}

function findNearbyChest(dimension, origin, radius) {
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dz = -radius; dz <= radius; dz += 1) {
      for (let dy = -SCAN_VERTICAL_RANGE; dy <= SCAN_VERTICAL_RANGE; dy += 1) {
        const pos = { x: Math.floor(origin.x + dx), y: Math.floor(origin.y + dy), z: Math.floor(origin.z + dz) };
        let block;
        try {
          block = dimension.getBlock(pos);
        } catch {
          continue;
        }
        if (!block || !CHEST_TYPES.includes(block.typeId)) continue;
        return { block, location: pos };
      }
    }
    // Cheap early-out: only scan a thin shell per call would be ideal,
    // but for a 5-20 min cadence a full bounded scan is acceptable.
  }
  return undefined;
}

function swapChestForEntity(dimension, found) {
  const { block, location } = found;
  const inventory = block.getComponent("minecraft:inventory");
  if (!inventory || !inventory.container) return;

  const serializedItems = serializeContainer(inventory.container);
  const originalTypeId = block.typeId;

  // Remove the chest block so its loot can't be cleared with the chunk.
  block.setType("minecraft:air");

  const spawnLoc = { x: location.x + 0.5, y: location.y, z: location.z + 0.5 };
  const entity = dimension.spawnEntity("verity:chest", spawnLoc);

  entity.setDynamicProperty("verity_chest:savedItems", JSON.stringify(serializedItems));
  entity.setDynamicProperty("verity_chest:originalType", originalTypeId);
  entity.setDynamicProperty("verity_chest:originalLoc", JSON.stringify(location));
  entity.setProperty("verity:state", "closed");
}

/** Restores the original chest block + its contents, removes the entity. */
function restoreChestFromEntity(entity) {
  const dimension = entity.dimension;
  const originalType = entity.getDynamicProperty("verity_chest:originalType") ?? "minecraft:chest";
  const locRaw = entity.getDynamicProperty("verity_chest:originalLoc");
  const itemsRaw = entity.getDynamicProperty("verity_chest:savedItems");

  let location = entity.location;
  if (typeof locRaw === "string") {
    try {
      location = JSON.parse(locRaw);
    } catch {
      /* fall back to entity.location */
    }
  }

  const block = dimension.getBlock(location);
  if (block) {
    block.setType(originalType);
    const inv = block.getComponent("minecraft:inventory");
    if (inv && inv.container && typeof itemsRaw === "string") {
      try {
        const items = JSON.parse(itemsRaw);
        applySerializedItems(inv.container, items);
      } catch {
        /* corrupted data, skip restore of items */
      }
    }
  }

  entity.remove();
}

/** Per-tick peek behavior for every active verity:chest entity. */
function tickPeekBehavior() {
  for (const dimension of [
    world.getDimension("overworld"),
    world.getDimension("nether"),
    world.getDimension("the_end"),
  ]) {
    for (const entity of dimension.getEntities({ type: "verity:chest" })) {
      if (!entity.isValid) continue;

      const state = entity.getProperty("verity:state");
      if (state === "open") continue; // no peeking while actively open

      const looked = anyPlayerLookingAt(dimension, entity);
      const id = entity.id;
      let pState = peekState.get(id);
      if (!pState) {
        pState = { lookingAway: !looked, peekAtTick: -1 };
        peekState.set(id, pState);
      }

      if (looked) {
        // Player sees it: close immediately if peeking, reset timer.
        pState.lookingAway = false;
        pState.peekAtTick = -1;
        if (state === "peeking") {
          entity.setProperty("verity:state", "closed");
        }
        continue;
      }

      // Player is not looking at it.
      if (!pState.lookingAway) {
        pState.lookingAway = true;
        const delayTicks = Math.floor((1 + Math.random() * 2) * TICKS_PER_SECOND); // 1-3s
        pState.peekAtTick = system.currentTick + delayTicks;
      } else if (pState.peekAtTick > 0 && system.currentTick >= pState.peekAtTick && state === "closed") {
        entity.setProperty("verity:state", "peeking");
        pState.peekAtTick = -1;
      }
    }
  }
}

/** Hook point: external local-response router should call this and skip
 *  normal dialogue routing while it returns true. */
export function isVerityChestSuppressingDialogue(entity) {
  return entity.getProperty?.("verity:state") === "open";
}

function registerInteractionHandling() {
  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!target?.isValid || target.typeId !== "verity:chest") return;

    const state = target.getProperty("verity:state");
    if (state === "open") return; // already open, ignore extra clicks

    target.setProperty("verity:state", "open");

    heldChestData.set(target.id, { openedBy: player.id, openedAtTick: system.currentTick });
  });

  // Listening while "in the chest": route chat to memory storage and
  // suppress Verity's normal chat response for the duration.
  world.beforeEvents.chatSend.subscribe((event) => {
    const openEntities = [];
    for (const dimension of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
      for (const e of dimension.getEntities({ type: "verity:chest" })) {
        if (e.getProperty("verity:state") === "open") openEntities.push(e);
      }
    }
    if (openEntities.length === 0) return; // not in chest-state, normal routing applies elsewhere

    // Don't cancel the chat message itself — just record it as a memory
    // entry against the nearest open verity:chest to this sender.
    const sender = event.sender;
    let nearest;
    let nearestDistSq = Infinity;
    for (const e of openEntities) {
      const dx = e.location.x - sender.location.x;
      const dy = e.location.y - sender.location.y;
      const dz = e.location.z - sender.location.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < nearestDistSq) {
        nearestDistSq = d;
        nearest = e;
      }
    }
    if (!nearest) return;

    appendChestMemory(nearest, sender, event.message);
    // Intentionally do NOT cancel: this only marks the message for
    // memory storage. Suppression of Verity's spoken/local response is
    // handled by isVerityChestSuppressingDialogue() in the dialogue
    // router (tryLocalResponse chain) checking state === "open" first.
  });

  // Close the chest (restore) when the player presses verity:chest again
  // while it is open.
  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { target } = event;
    if (!target?.isValid || target.typeId !== "verity:chest") return;
    if (target.getProperty("verity:state") !== "open") return;

    restoreChestFromEntity(target);
    heldChestData.delete(target.id);
    peekState.delete(target.id);
  });
}

function appendChestMemory(chestEntity, sender, rawMessage) {
  // Mirrors existing Verity memory convention: store as a dynamic
  // property list on the entity (capped) so the main memory subsystem
  // can pick it up on next merge pass. Adjust the key/format here if
  // your HiveMind/memory module expects a different shape.
  const key = "verity_chest:memoryLog";
  const existingRaw = chestEntity.getDynamicProperty(key);
  let log = [];
  if (typeof existingRaw === "string") {
    try {
      log = JSON.parse(existingRaw);
    } catch {
      log = [];
    }
  }
  log.push({ from: sender.name, text: rawMessage, tick: system.currentTick });
  if (log.length > 50) log = log.slice(-50);
  chestEntity.setDynamicProperty(key, JSON.stringify(log));
}

function registerCleanupOnRemove() {
  world.beforeEvents.entityRemove.subscribe((event) => {
    const entity = event.removedEntity;
    if (entity?.typeId === "verity:chest") {
      peekState.delete(entity.id);
      heldChestData.delete(entity.id);
    }
  });
}

function mainTick() {
  tickPeekBehavior();

  const nextScan = world.getDynamicProperty("verity_chest:nextScanTick");
  if (typeof nextScan !== "number" || system.currentTick >= nextScan) {
    scanForChests();
    scheduleNextScan();
  }
}

export function initVerityChest() {
  if (typeof world.getDynamicProperty("verity_chest:nextScanTick") !== "number") {
    scheduleNextScan();
  }
  registerInteractionHandling();
  registerCleanupOnRemove();
  system.runInterval(mainTick, 5); // every 5 ticks (0.25s) for responsive peeking
}
