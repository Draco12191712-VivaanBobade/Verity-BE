import { world, system } from "@minecraft/server";

const SMILER_TYPE = "verity:smiler";
const STARE_SECONDS_REQUIRED = 5;
const STUN_ANIMATION_SECONDS = 4;
const STARE_MAX_DISTANCE = 64;
const AGGRO_DISTANCE = 20; // proximity aggro radius — bypasses the stare timer entirely
const SPAWN_SOUND = "my_gal_smiler";

// Dynamic property keys stored per-Smiler entity.
const KEY_STARE_TICKS = "verity:stareTicks";
const KEY_PHASE = "verity:phase"; // "idle" | "stunned" | "chasing"
const KEY_STUN_END_TICK = "verity:stunEndTick";

const TICKS_PER_SECOND = 20;
const STARE_TICKS_REQUIRED = STARE_SECONDS_REQUIRED * TICKS_PER_SECOND;
const STUN_TICKS = STUN_ANIMATION_SECONDS * TICKS_PER_SECOND;

/**
 * Returns true if `player` currently has `smiler` in their direct view,
 * within STARE_MAX_DISTANCE, via a head raycast.
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} smiler
 */
function isPlayerLookingAtSmiler(player, smiler) {
  const hits = player.getEntitiesFromViewDirection({
    maxDistance: STARE_MAX_DISTANCE
  });
  for (const hit of hits) {
    if (hit.entity?.id === smiler.id) {
      return true;
    }
  }
  return false;
}

function getPhase(smiler) {
  return smiler.getDynamicProperty(KEY_PHASE) ?? "idle";
}

function setPhase(smiler, phase) {
  smiler.setDynamicProperty(KEY_PHASE, phase);
}

function enterStunned(smiler) {
  setPhase(smiler, "stunned");
  smiler.setDynamicProperty(KEY_STARE_TICKS, 0);
  smiler.setDynamicProperty(KEY_STUN_END_TICK, system.currentTick + STUN_TICKS);
  smiler.triggerEvent("verity:to_stunned");
  smiler.playAnimation("animation.verity_smiler.stunned", {
    blendOutTime: 0.2
  });
}

function enterChasing(smiler) {
  setPhase(smiler, "chasing");
  smiler.setDynamicProperty(KEY_STARE_TICKS, 0);
  smiler.triggerEvent("verity:to_chasing");
}

function enterIdle(smiler) {
  setPhase(smiler, "idle");
  smiler.setDynamicProperty(KEY_STARE_TICKS, 0);
  smiler.triggerEvent("verity:to_idle");
}

system.runInterval(() => {
  for (const dimension of [
    world.getDimension("overworld"),
    world.getDimension("nether"),
    world.getDimension("the_end")
  ]) {
    const smilers = dimension.getEntities({ type: SMILER_TYPE });

    for (const smiler of smilers) {
      if (!smiler.isValid) continue;

      const phase = getPhase(smiler);

      if (phase === "stunned") {
        const stunEndTick = smiler.getDynamicProperty(KEY_STUN_END_TICK) ?? 0;
        if (system.currentTick >= stunEndTick) {
          enterChasing(smiler);
        }
        continue;
      }

      if (phase === "chasing") {
        // Once chasing, the Smiler stays aggressive. If you want it to be able
        // to return to idle (e.g. after losing the player for a long time),
        // add that logic here using smiler.target / a "lost player" timer.
        continue;
      }

      // phase === "idle": check proximity aggro first, then fall back to the stare timer.
      const nearbyPlayers = dimension.getPlayers({
        location: smiler.location,
        maxDistance: STARE_MAX_DISTANCE
      });

      let proximityAggro = false;
      let beingStaredAt = false;

      for (const player of nearbyPlayers) {
        const dx = player.location.x - smiler.location.x;
        const dy = player.location.y - smiler.location.y;
        const dz = player.location.z - smiler.location.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq <= AGGRO_DISTANCE * AGGRO_DISTANCE) {
          proximityAggro = true;
          console.warn(`Smiler aggro fired at ${Math.sqrt(distSq).toFixed(1)} blocks`);
          break;
        }

        if (!beingStaredAt && isPlayerLookingAtSmiler(player, smiler)) {
          beingStaredAt = true;
        }
      }

      if (proximityAggro) {
        // Proximity aggro skips the stare/stun sequence entirely and goes straight to chasing.
        enterChasing(smiler);
        continue;
      }

      const currentStareTicks = smiler.getDynamicProperty(KEY_STARE_TICKS) ?? 0;

      if (beingStaredAt) {
        const newStareTicks = currentStareTicks + 4; // this interval's tick step
        smiler.setDynamicProperty(KEY_STARE_TICKS, newStareTicks);

        if (newStareTicks >= STARE_TICKS_REQUIRED) {
          enterStunned(smiler);
        }
      } else if (currentStareTicks > 0) {
        // Stare broken before reaching the threshold: decay back down
        // rather than hard-resetting, so brief glances away don't fully reset progress.
        smiler.setDynamicProperty(KEY_STARE_TICKS, Math.max(0, currentStareTicks - 8));
      }
    }
  }
}, 4); // runs every 4 ticks (5 times/sec) — frequent enough for a 5s stare check, cheap enough to scale

// Ensure every newly spawned Smiler starts from a clean state and announces itself.
world.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity.typeId !== SMILER_TYPE) return;
  enterIdle(entity);

  try {
    entity.dimension.playSound(SPAWN_SOUND, entity.location);
  } catch (e) {
    console.warn("Failed to play Smiler spawn sound: " + e);
  }
});
