// ─────────────────────────────────────────────────────────────────────────────
// verity_invincible.js — Verity cannot die. Period.
// Handles all damage sources + /kill command + void / despawn.
// ─────────────────────────────────────────────────────────────────────────────

import { world, system, EntityDamageCause } from "@minecraft/server";
import { VERITY_TYPE } from "./verity_systems.js";

// ── Layer 1: Prevent death from all damage ───────────────────────────────────
// Every time Verity takes damage, instantly heal her to full.
// This catches: lava, fire, explosions, suffocation, fall damage, mob attacks,
// player attacks, drowning, magic, wither, etc.

const ALL_CAUSES = Object.values(EntityDamageCause);

world.afterEvents.entityHurt.subscribe((ev) => {
  const entity = ev.hurtEntity;
  if (entity.typeId !== VERITY_TYPE) return;

  // Heal immediately — before the death tick can process
  const health = entity.getComponent("minecraft:health");
  if (health) {
    health.setCurrentValue(health.effectiveMax);
  }
});

// ── Layer 2: Aggressive tick-based heal (catches rapid multi-hit) ───────────
// If something hits Verity multiple times in one tick (e.g. command block spam),
// entityHurt might not fire fast enough. This ensures health is always max.

system.runInterval(() => {
  for (const dim of ["overworld", "nether", "the_end"]) {
    try {
      const dimension = world.getDimension(dim);
      for (const entity of dimension.getEntities({ type: VERITY_TYPE })) {
        const health = entity.getComponent("minecraft:health");
        if (health && health.currentValue < health.effectiveMax) {
          health.setCurrentValue(health.effectiveMax);
        }
      }
    } catch (e) {
      // Dimension not loaded, skip
    }
  }
}, 1); // Every tick

// ── Layer 3: Respawn on /kill (or any other instant-death) ──────────────────
// /kill bypasses damage and health entirely. When Verity dies, we respawn her
// at the exact same spot within 1 tick. Players will barely notice a flicker.

world.afterEvents.entityDie.subscribe((ev) => {
  const dead = ev.deadEntity;
  if (dead.typeId !== VERITY_TYPE) return;

  // Capture state before the entity is fully gone
  const loc = { x: dead.location.x, y: dead.location.y, z: dead.location.z };
  const dim = dead.dimension;
  const rot = dead.getRotation();

  // Some variants have custom properties — try to preserve them
  let variant = "default";
  try {
    variant = dead.getProperty("verity:variant") ?? "default";
  } catch (e) {
    // Property doesn't exist on this variant
  }

  // Respawn next tick (entity is fully removed by then)
  system.runTimeout(() => {
    try {
      const newVerity = dim.spawnEntity(VERITY_TYPE, loc);
      newVerity.setRotation(rot);

      // Restore variant property if applicable
      try {
        newVerity.setProperty("verity:variant", variant);
      } catch (e) {
        // Variant property not valid on this entity type
      }

      // Optional: play a subtle particle or sound to mask the respawn
      // dim.runCommandAsync(`particle verity:respawn_flash ${loc.x} ${loc.y} ${loc.z}`);
    } catch (e) {
      console.warn(`[Verity Invincible] Respawn failed: ${e}`);
    }
  }, 1);
});

// ── Layer 4: Prevent void death (falling below the world) ───────────────────
// If Verity somehow falls into the void (e.g. broken bedrock), teleport her up.

system.runInterval(() => {
  for (const dim of ["overworld", "nether", "the_end"]) {
    try {
      const dimension = world.getDimension(dim);
      for (const entity of dimension.getEntities({ type: VERITY_TYPE })) {
        if (entity.location.y < -64) {
          entity.teleport({
            x: entity.location.x,
            y: -60, // Just above void
            z: entity.location.z,
          });
        }
      }
    } catch (e) {}
  }
}, 5); // Check every 5 ticks

console.log("[Verity] Invincibility system loaded. Verity cannot die.");
