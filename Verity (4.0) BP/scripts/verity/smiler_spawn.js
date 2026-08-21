import { world, system, TimeOfDay } from "@minecraft/server";
import { phase, currentDay } from "./verity_core.js";

const SMILER_PHASE = 2;
const SPAWN_WINDOW_START = TimeOfDay.Midnight - 200; // 17800
const SPAWN_WINDOW_END = TimeOfDay.Midnight + 200;   // 18200
const LAST_SPAWN_DAY_FLAG = "verity:smiler_last_spawn_day";
const MIN_RADIUS = 21;
const MAX_RADIUS = 36;

system.runInterval(() => {
  if (phase() !== SMILER_PHASE) return;

  const time = world.getTimeOfDay();
  if (time < SPAWN_WINDOW_START || time > SPAWN_WINDOW_END) return;

  const day = currentDay();
  const lastSpawnDay = world.getDynamicProperty(LAST_SPAWN_DAY_FLAG) ?? -1;
  if (lastSpawnDay === day) return;

  const players = world.getAllPlayers();
  if (players.length === 0) return;

  const player = players[Math.floor(Math.random() * players.length)];
  const dimension = player.dimension;

  const angle = Math.random() * Math.PI * 2;
  const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
  const spawnPos = {
    x: player.location.x + Math.cos(angle) * radius,
    y: player.location.y,
    z: player.location.z + Math.sin(angle) * radius,
  };

  try {
    dimension.spawnEntity("verity:smiler", spawnPos);
    world.setDynamicProperty(LAST_SPAWN_DAY_FLAG, day);
  } catch (e) {
    console.warn("Failed to spawn verity:smiler: " + e);
  }
}, 40);
