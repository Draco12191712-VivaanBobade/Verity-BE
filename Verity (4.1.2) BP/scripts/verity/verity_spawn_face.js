import { world, system } from "@minecraft/server";
import { VARIANT, setVariant, getVariant } from "./verity_systems.js";
import { phase } from "./verity_core.js";

const FALL_FACE_START_TICKS = 30; // 1.5s
const FALL_FACE_END_TICKS   = 100; // 5s

const SPAWN_FALL_EVENT = "verity:trigger_spawn_fall";

function runSpawnFallFace(verity) {
  if (!verity) return;

  world.getDimension(verity.dimension.id).runCommand(`playsound falling @a`);

  system.runTimeout(() => {
    if (!verity.isValid) return;
    setVariant(verity, VARIANT.HURT);
  }, FALL_FACE_START_TICKS);

  system.runTimeout(() => {
    if (!verity.isValid) return;
    setVariant(verity, getVariant(phase(), false));
  }, FALL_FACE_END_TICKS);
}

world.afterEvents.dataDrivenEntityTrigger.subscribe((ev) => {
  if (ev.eventId !== SPAWN_FALL_EVENT) return;
  runSpawnFallFace(ev.entity);
});

export { runSpawnFallFace };
