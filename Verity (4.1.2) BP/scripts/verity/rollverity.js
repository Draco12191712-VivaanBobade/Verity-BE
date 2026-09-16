import { system, world } from "@minecraft/server";
import { CONFIG } from "./config.js";

const activeFollowers = new Map();
const VARIANT_PROP = "verity:variant";
const ROLLING_VARIANT = 14; // talking2.png

function keyForPlayer(player) {
  return player.id;
}

function isOpenBlock(block) {
  if (!block) return false;
  // Tall grass, flowers, crops, and similar plants are non-air blocks but
  // have no solid collision. Treat them as open so Verity does not teleport
  // upward and appear to fly whenever one is in front of him.
  return block.isAir || block.isLiquid || block.isSolid === false;
}

function stepOntoBlock(verity, directionX, directionZ) {
  const feetY = Math.floor(verity.location.y + 0.05);
  const ahead = {
    x: verity.location.x + directionX * 0.55,
    y: feetY,
    z: verity.location.z + directionZ * 0.55,
  };

  try {
    const blockAhead = verity.dimension.getBlock(ahead);
    const spaceAbove = verity.dimension.getBlock({
      x: ahead.x,
      y: feetY + 1,
      z: ahead.z,
    });
    if (isOpenBlock(blockAhead) || !isOpenBlock(spaceAbove)) return false;

    // Raise only Y. Preserve the exact X/Z so stepping never snaps sideways.
    verity.clearVelocity();
    verity.teleport({
      x: verity.location.x,
      y: feetY + 1,
      z: verity.location.z,
    });
    return true;
  } catch {
    return false;
  }
}

function faceMovementDirection(verity, directionX, directionZ) {
  const yaw = Math.atan2(-directionX, directionZ) * (180 / Math.PI);
  try {
    verity.setRotation({ x: 0, y: yaw });
  } catch {}
}

export function findPlacedVerity(player, maximumDistance = 64) {
  const entities = player.dimension.getEntities({
    type: "verity:verity",
    location: player.location,
    maxDistance: maximumDistance,
    closest: 1,
  });
  return entities[0];
}

export function stopVerityRollFollow(player) {
  const key = keyForPlayer(player);
  const active = activeFollowers.get(key);
  if (!active) return false;

  system.clearRun(active.runId);
  activeFollowers.delete(key);

  try {
    if (active.verity?.isValid) {
      active.verity.clearVelocity();
      active.verity.setProperty(VARIANT_PROP, active.previousVariant);
    }
  } catch {}

  return true;
}

export function startVerityRollFollow(player, verity, options = {}) {
  if (!player?.isValid || !verity?.isValid) return undefined;

  stopVerityRollFollow(player);

  const followDistance =
    options.followDistance ?? CONFIG.gameplay.followDistance ?? 2;
  const intervalTicks = options.interval ?? 1;
  const maximumSpeed = options.maximumSpeed ?? 0.24;
  const acceleration = options.acceleration ?? 0.085;
  const teleportDistance = options.teleportDistance ?? 48;
  const key = keyForPlayer(player);
  let previousVariant = 0;
  try {
    previousVariant = verity.getProperty(VARIANT_PROP) ?? 0;
    verity.setProperty(VARIANT_PROP, ROLLING_VARIANT);
  } catch {}

  const runId = system.runInterval(() => {
    if (!player.isValid || !verity.isValid) {
      const active = activeFollowers.get(key);
      if (active) system.clearRun(active.runId);
      activeFollowers.delete(key);
      return;
    }

    // The throw/hold system owns position while Verity is in a player's hand.
    // This also covers mobile and multiplayer grabs where the grabber may not
    // be the same player who originally started rolling follow.
    try {
      if (
        verity.hasTag("verity:held") ||
        verity.hasTag("verity:thrown") ||
        verity.getProperty("verity:is_held") === true
      ) {
        verity.clearVelocity();
        return;
      }
    } catch {}

    try {
      verity.setProperty(VARIANT_PROP, ROLLING_VARIANT);
    } catch {}

    if (player.dimension.id !== verity.dimension.id) {
      try {
        verity.teleport(
          {
            x: player.location.x - 2,
            y: player.location.y,
            z: player.location.z - 2,
          },
          { dimension: player.dimension }
        );
      } catch {}
      return;
    }

    const dx = player.location.x - verity.location.x;
    const dz = player.location.z - verity.location.z;
    const horizontalDistance = Math.hypot(dx, dz);

    if (horizontalDistance > teleportDistance) {
      try {
        verity.teleport({
          x: player.location.x - 2,
          y: player.location.y,
          z: player.location.z - 2,
        });
      } catch {}
      return;
    }

    if (horizontalDistance <= followDistance) {
      try {
        verity.clearVelocity();
      } catch {}
      return;
    }

    try {
      const directionX = dx / horizontalDistance;
      const directionZ = dz / horizontalDistance;
      const steppedUp = stepOntoBlock(verity, directionX, directionZ);

      faceMovementDirection(verity, directionX, directionZ);
      if (steppedUp) return;

      const currentVelocity = verity.getVelocity();
      const targetSpeed = Math.min(
        maximumSpeed,
        0.08 + (horizontalDistance - followDistance) * 0.025
      );
      const desiredX = directionX * targetSpeed;
      const desiredZ = directionZ * targetSpeed;
      verity.applyImpulse({
        x: Math.max(-acceleration, Math.min(acceleration, desiredX - currentVelocity.x)),
        y: 0,
        z: Math.max(-acceleration, Math.min(acceleration, desiredZ - currentVelocity.z)),
      });
    } catch (error) {
      console.warn(`[Verity] Roll follow failed: ${error}`);
    }
  }, intervalTicks);

  activeFollowers.set(key, {
    runId,
    verity,
    playerName: player.name,
    previousVariant,
  });
  return runId;
}

world.afterEvents.playerLeave.subscribe((event) => {
  for (const [key, active] of activeFollowers) {
    if (active.playerName !== event.playerName) continue;
    system.clearRun(active.runId);
    activeFollowers.delete(key);
  }
});
