import { ItemStack, system, world } from "@minecraft/server";
import { VERITY_TYPE } from "./verity_systems.js";
import { adjustRelationship } from "./verity_tail.js";
import {
  startVerityRollFollow,
  stopVerityRollFollow,
} from "./rollverity.js";
import { LAST_LOCATION_PROP } from "./verity_place.js";

const VARIANT_PROP = "verity:variant";
const TAG_THROWN = "verity:thrown";
const THROW_POWER = 2.1;
const THROW_UP_BOOST = 0.12;
const BASE_RESTITUTION = 0.9;
const HORIZONTAL_RETENTION = 0.9;
const AIR_HORIZONTAL_RETENTION = 0.998;
const MIN_BOUNCE_UP = 0.06;
const MAX_BOUNCE_UP = 1.4;
const MAX_BOUNCES = 8;
const BOUNCE_COOLDOWN_TICKS = 2;
const SETTLE_TICKS = 12;
const LANDING_WATCH_TIMEOUT = 400;

const VARIANT_ITEMS = [
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
];
const ITEM_VARIANTS = new Map(
  VARIANT_ITEMS.map((itemId, variant) => [itemId, variant])
);

/** playerId -> whether rolling should resume after this held Verity is thrown */
const resumeRolling = new Map();
/** playerId -> last completed throw tick */
const lastThrowTicks = new Map();
/** playerId -> tick through which a block-placement interaction suppresses throwing */
const placementLocks = new Map();

function consumeCreativePlacement(player, expectedItemId) {
  if (player?.typeId !== "minecraft:player") return;
  if (player.getGameMode() !== "Creative") return;

  // Entity placement resolves at the end of the current event. Remove the
  // Creative copy on the following tick so placing Verity cannot duplicate him.
  system.run(() => {
    const container = selectedContainer(player);
    const item = container?.getItem(player.selectedSlotIndex);
    if (!container || item?.typeId !== expectedItemId) return;

    if (item.amount > 1) {
      item.amount -= 1;
      container.setItem(player.selectedSlotIndex, item);
    } else {
      container.setItem(player.selectedSlotIndex, undefined);
    }
  });
}

function selectedContainer(player) {
  return player.getComponent("minecraft:inventory")?.container;
}

function selectedItem(player) {
  return selectedContainer(player)?.getItem(player.selectedSlotIndex);
}

function isVerityItem(item) {
  return !!item && ITEM_VARIANTS.has(item.typeId);
}

function rememberPickupLocation(player, verity) {
  try {
    const location = verity.location;
    player.setDynamicProperty(LAST_LOCATION_PROP, JSON.stringify({
      x: location.x,
      y: location.y,
      z: location.z,
      dimensionId: verity.dimension.id,
    }));
  } catch (error) {
    console.warn(`[Verity] Failed to remember pickup location: ${error}`);
  }
}

function putVerityInHand(player, verity) {
  const container = selectedContainer(player);
  if (!container || !verity?.isValid) return;

  let variant = 0;
  try { variant = verity.getProperty(VARIANT_PROP) ?? 0; } catch {}
  const itemId = VARIANT_ITEMS[variant] ?? VARIANT_ITEMS[0];
  let slot = player.selectedSlotIndex;
  if (container.getItem(slot)) {
    slot = -1;
    for (let hotbarSlot = 0; hotbarSlot < 9; hotbarSlot++) {
      if (!container.getItem(hotbarSlot)) {
        slot = hotbarSlot;
        break;
      }
    }
  }
  if (slot < 0) {
    try {
      player.onScreenDisplay.setActionBar("Free one hotbar slot before holding Verity.");
    } catch {}
    return;
  }

  rememberPickupLocation(player, verity);
  resumeRolling.set(player.id, stopVerityRollFollow(player));
  container.setItem(slot, new ItemStack(itemId, 1));
  player.selectedSlotIndex = slot;
  verity.remove();
  try {
    player.onScreenDisplay.setActionBar("Press Throw to throw Verity.");
  } catch {}
}

function findSweptCollision(entity, from, to) {
  if (!from) return undefined;
  const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  if (distance < 0.01) return undefined;
  const steps = Math.max(1, Math.ceil(distance / 0.15));
  for (let index = 1; index <= steps; index++) {
    const amount = index / steps;
    const sample = {
      x: from.x + (to.x - from.x) * amount,
      y: from.y + (to.y - from.y) * amount,
      z: from.z + (to.z - from.z) * amount,
    };
    try {
      const block = entity.dimension.getBlock(sample);
      if (!block?.isSolid) continue;
      const blockTop = block.location.y + 1;
      const crossedTop =
        to.y < from.y - 0.01 &&
        from.y >= blockTop - 0.03 &&
        sample.y <= blockTop;
      return { block, sample, kind: crossedTop ? "floor" : "wall" };
    } catch {}
  }
  return undefined;
}

function watchLanding(entity) {
  let previousVelocity = null;
  let previousLocation = { ...entity.location };
  let airCarry = { x: 0, z: 0 };
  try {
    const launchVelocity = entity.getVelocity();
    airCarry = { x: launchVelocity.x, z: launchVelocity.z };
  } catch {}
  let bounceCount = 0;
  let settleTicks = 0;
  let lastBounceTick = -BOUNCE_COOLDOWN_TICKS;

  const intervalId = system.runInterval(() => {
    if (!entity?.isValid) {
      system.clearRun(intervalId);
      return;
    }
    if (!entity.hasTag(TAG_THROWN)) {
      system.clearRun(intervalId);
      return;
    }

    let velocity;
    try { velocity = entity.getVelocity(); }
    catch {
      system.clearRun(intervalId);
      return;
    }

    const location = { ...entity.location };
    const sweptCollision = findSweptCollision(entity, previousLocation, location);
    const crossedFloor =
      sweptCollision?.kind === "floor" ? sweptCollision : undefined;
    const crossedWall =
      sweptCollision?.kind === "wall" ? sweptCollision : undefined;

    if (crossedWall && previousVelocity) {
      try {
        entity.clearVelocity();
        entity.teleport(previousLocation);
        const wallBounce = {
          x: -previousVelocity.x * 0.55,
          y: previousVelocity.y,
          z: -previousVelocity.z * 0.55,
        };
        airCarry = { x: wallBounce.x, z: wallBounce.z };
        entity.applyImpulse(wallBounce);
        velocity = entity.getVelocity();
      } catch (error) {
        console.warn(`[Verity] Wall collision recovery failed: ${error}`);
      }
    }

    // Bedrock heavily damps mob velocity during long falls. Preserve most of
    // the throw's sideways momentum so a cliff throw keeps its arc instead of
    // eventually dropping straight down.
    airCarry.x *= AIR_HORIZONTAL_RETENTION;
    airCarry.z *= AIR_HORIZONTAL_RETENTION;
    const horizontalTravel = Math.hypot(
      location.x - previousLocation.x,
      location.z - previousLocation.z
    );
    const carriedSpeed = Math.hypot(airCarry.x, airCarry.z);
    const currentSpeed = Math.hypot(velocity.x, velocity.z);
    const airborne =
      Math.abs(velocity.y) > 0.05 && !crossedFloor && !crossedWall;
    if (airborne && carriedSpeed > 0.025) {
      if (horizontalTravel < 0.004 && currentSpeed < carriedSpeed * 0.2) {
        // A wall stopped the throw; do not keep pushing Verity into it.
        airCarry = { x: velocity.x, z: velocity.z };
      } else if (currentSpeed < carriedSpeed * 0.97) {
        try {
          entity.applyImpulse({
            x: airCarry.x - velocity.x,
            y: 0,
            z: airCarry.z - velocity.z,
          });
          velocity = entity.getVelocity();
        } catch {}
      }
    }

    if (crossedFloor && previousVelocity?.y < -0.08) {
      const impactSpeed = -previousVelocity.y;
      const bounceUp = Math.min(MAX_BOUNCE_UP, impactSpeed * BASE_RESTITUTION);
      try {
        entity.clearVelocity();
        entity.teleport({
          x: crossedFloor.sample.x,
          y: crossedFloor.block.location.y + 1.01,
          z: crossedFloor.sample.z,
        });
        if (bounceCount < MAX_BOUNCES && bounceUp >= MIN_BOUNCE_UP) {
          bounceCount++;
          lastBounceTick = system.currentTick;
          airCarry = {
            x: previousVelocity.x * HORIZONTAL_RETENTION,
            z: previousVelocity.z * HORIZONTAL_RETENTION,
          };
          entity.applyImpulse({
            x: previousVelocity.x * HORIZONTAL_RETENTION,
            y: bounceUp,
            z: previousVelocity.z * HORIZONTAL_RETENTION,
          });
        }
        velocity = entity.getVelocity();
      } catch (error) {
        console.warn(`[Verity] Floor collision recovery failed: ${error}`);
      }
    }

    const downwardImpact =
      !crossedFloor &&
      previousVelocity !== null &&
      previousVelocity.y < -0.06 &&
      Math.abs(velocity.y) < 0.045 &&
      location.y <= previousLocation.y + 0.035 &&
      system.currentTick - lastBounceTick >= BOUNCE_COOLDOWN_TICKS;
    if (downwardImpact) {
      const bounceUp = Math.min(
        MAX_BOUNCE_UP,
        -previousVelocity.y * BASE_RESTITUTION
      );
      if (bounceCount < MAX_BOUNCES && bounceUp >= MIN_BOUNCE_UP) {
        bounceCount++;
        lastBounceTick = system.currentTick;
        try {
          entity.clearVelocity();
          airCarry = {
            x: previousVelocity.x * HORIZONTAL_RETENTION,
            z: previousVelocity.z * HORIZONTAL_RETENTION,
          };
          entity.applyImpulse({
            x: previousVelocity.x * HORIZONTAL_RETENTION,
            y: bounceUp,
            z: previousVelocity.z * HORIZONTAL_RETENTION,
          });
          velocity = entity.getVelocity();
        } catch {}
      }
    }

    if (Math.abs(velocity.y) < 0.04 && Math.hypot(velocity.x, velocity.z) < 0.035) {
      settleTicks++;
      if (settleTicks >= SETTLE_TICKS) {
        system.clearRun(intervalId);
        try { entity.removeTag(TAG_THROWN); } catch {}
        return;
      }
    } else {
      settleTicks = 0;
    }

    previousVelocity = velocity;
    previousLocation = { ...entity.location };
  }, 1);

  system.runTimeout(() => {
    try {
      system.clearRun(intervalId);
      if (entity?.isValid) entity.removeTag(TAG_THROWN);
    } catch {}
  }, LANDING_WATCH_TIMEOUT);
}

function consumeSelectedVerity(player, expectedItemId) {
  const container = selectedContainer(player);
  const item = container?.getItem(player.selectedSlotIndex);
  if (!container || item?.typeId !== expectedItemId) return false;
  container.setItem(player.selectedSlotIndex, undefined);
  return true;
}

function completeItemThrow(player, item) {
  if (!player?.isValid || !isVerityItem(item)) return;
  if ((lastThrowTicks.get(player.id) ?? -100) + 3 > system.currentTick) return;

  if (!consumeSelectedVerity(player, item.typeId)) return;
  lastThrowTicks.set(player.id, system.currentTick);

  const direction = player.getViewDirection();
  const head = player.getHeadLocation();
  const spawnLocation = {
    x: head.x + direction.x * 0.8,
    y: head.y - 0.35 + direction.y * 0.35,
    z: head.z + direction.z * 0.8,
  };

  let verity;
  try {
    verity = player.dimension.spawnEntity(VERITY_TYPE, spawnLocation);
    verity.setProperty(VARIANT_PROP, ITEM_VARIANTS.get(item.typeId) ?? 0);
    verity.addTag(TAG_THROWN);
    verity.applyImpulse({
      x: direction.x * THROW_POWER,
      y: direction.y * THROW_POWER + THROW_UP_BOOST,
      z: direction.z * THROW_POWER,
    });
  } catch (error) {
    console.warn(`[Verity] Inventory throw failed: ${error}`);
    selectedContainer(player)?.setItem(
      player.selectedSlotIndex,
      new ItemStack(item.typeId, 1)
    );
    try { verity?.remove(); } catch {}
    return;
  }

  adjustRelationship(player, -2);
  if (resumeRolling.get(player.id)) {
    startVerityRollFollow(player, verity);
  }
  resumeRolling.delete(player.id);
  watchLanding(verity);
}

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (!target?.isValid || target.typeId !== VERITY_TYPE) return;
  if (target.hasTag("verity:crashout")) {
    try {
      player.onScreenDisplay.setActionBar("You can't hold Verity while he is crashing out.");
    } catch {}
    return;
  }
  system.run(() => putVerityInHand(player, target));
});

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (!isVerityItem(itemStack)) return;

  // Throw immediately on every platform.
  system.run(() => {
    if ((placementLocks.get(source.id) ?? -1) >= system.currentTick) return;
    completeItemThrow(source, itemStack);
  });
});

world.afterEvents.playerInteractWithBlock.subscribe(({ player, itemStack }) => {
  if (!isVerityItem(itemStack)) return;
  placementLocks.set(player.id, system.currentTick + 1);
  consumeCreativePlacement(player, itemStack.typeId);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  resumeRolling.delete(playerId);
  lastThrowTicks.delete(playerId);
  placementLocks.delete(playerId);
});
