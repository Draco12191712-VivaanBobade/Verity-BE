import { world, system } from "@minecraft/server";

const STARE_THRESHOLD_TICKS = 140; // 7 seconds * 20 ticks
const AGGRO_RADIUS = 10;
const LOOK_DISTANCE = 12;
const LOOK_DOT_THRESHOLD = 0.97; // ~14 degree cone

const GLASS_BLOCKS = new Set([
  "minecraft:glass",
  "minecraft:glass_pane",
  "minecraft:white_stained_glass",
  "minecraft:white_stained_glass_pane",
  "minecraft:tinted_glass"
]);

const stareTimers = new Map(); // entity.id -> tick count

function getEyeLocation(entity, eyeHeight) {
  const loc = entity.location;
  return { x: loc.x, y: loc.y + eyeHeight, z: loc.z };
}

function isPlayerLookingAtEntity(player, target) {
  const viewDir = player.getViewDirection();
  const eye = getEyeLocation(player, 1.62);
  const targetPos = getEyeLocation(target, 0.9);

  const dx = targetPos.x - eye.x;
  const dy = targetPos.y - eye.y;
  const dz = targetPos.z - eye.z;

  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist === 0) return false;

  const dot = (viewDir.x * dx + viewDir.y * dy + viewDir.z * dz) / dist;
  return dot >= LOOK_DOT_THRESHOLD;
}

function startChasing(verity) {
  if (verity.getProperty("verity:state") === "chasing") return;
  verity.setProperty("verity:state", "chasing");
  stareTimers.delete(verity.id);
  verity.triggerEvent("verity:to_chasing");
}

function tryBreakWindow(verity) {
  const dim = verity.dimension;
  const viewDir = verity.getViewDirection();
  const eye = getEyeLocation(verity, 1.5);

  for (let d = 1; d <= 2; d++) {
    const checkLoc = {
      x: Math.floor(eye.x + viewDir.x * d),
      y: Math.floor(eye.y + viewDir.y * d),
      z: Math.floor(eye.z + viewDir.z * d)
    };

    let block;
    try {
      block = dim.getBlock(checkLoc);
    } catch {
      continue;
    }
    if (!block) continue;

    if (GLASS_BLOCKS.has(block.typeId)) {
      try {
        dim.setBlockType(checkLoc, "minecraft:air");
        dim.playSound("dig.glass", checkLoc);
      } catch {
        // ignore failures from unloaded chunks
      }
      break;
    }
  }
}

system.runInterval(() => {
  for (const dim of [
    world.getDimension("overworld"),
    world.getDimension("nether"),
    world.getDimension("the_end")
  ]) {
    const verities = dim.getEntities({ type: "verity:smiler" });

    for (const verity of verities) {
      if (!verity.isValid) continue;

      const state = verity.getProperty("verity:state");

      // Instant aggro if a player is within 10 blocks, regardless of current state
      if (state !== "chasing") {
        const closePlayers = dim.getPlayers({
          location: verity.location,
          maxDistance: AGGRO_RADIUS
        });
        if (closePlayers.length > 0) {
          startChasing(verity);
          continue;
        }
      }

      if (state === "idle") {
        const players = dim.getPlayers({
          location: verity.location,
          maxDistance: LOOK_DISTANCE
        });

        let staredAtThisTick = false;

        for (const player of players) {
          if (isPlayerLookingAtEntity(player, verity)) {
            staredAtThisTick = true;
            const ticks = (stareTimers.get(verity.id) ?? 0) + 1;
            stareTimers.set(verity.id, ticks);

            if (ticks >= STARE_THRESHOLD_TICKS) {
              verity.setProperty("verity:state", "staring");
              stareTimers.delete(verity.id);

              // Give the stare animation time to play before chasing
              system.runTimeout(() => {
                if (verity.isValid) startChasing(verity);
              }, 40); // ~2 seconds, adjust to match your stare animation length
            }
            break;
          }
        }

        if (!staredAtThisTick) {
          stareTimers.delete(verity.id);
        }
      }

      if (state === "chasing") {
        tryBreakWindow(verity);
      }
    }
  }
}, 1);

// Instakill on contact with the player
world.afterEvents.entityHitEntity.subscribe((event) => {
  const { damagingEntity, hitEntity } = event;
  if (!damagingEntity || !hitEntity) return;

  if (damagingEntity.typeId === "verity:smiler" && hitEntity.typeId === "minecraft:player") {
    hitEntity.kill();
  }
});
