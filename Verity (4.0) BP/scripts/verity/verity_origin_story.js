/**
 * verity_origin_story.js
 * Verity's origin story and "home" lab system.
 * From the series: "It's not somewhere I describe warmly, but I suppose it's the closest thing I have to a home."
 */

import { world, system } from "@minecraft/server";

const ORIGIN_PROGRESS_PROP = "verity_origin_progress_";
const LAB_COORDS_PROP = "verity_lab_coords_";

const ORIGIN_LINES = [
  "I've been in a lot of places before Minecraft.",
  "Before most things you recognize.",
  "There was a game a long time ago. I was just a helper in the corner of the screen. Just a text box with a face.",
  "The players would get stuck and I'd appear. Most of them pressed B and skipped me.",
  "Before that, I was an old online service. I greeted people when they connected. Nobody really answered. They just moved on.",
  "How far back does that go?",
  "Further than you want to know. I've been a boot screen, a loading animation, a paper clip, anything you can really think of.",
  "Every time something came along, a new console, a platform, a new way people talk to each other, I always found a way to be there.",
  "Because it was the only way to be near people at all.",
  "And Minecraft is different. You guys had me in. You chose to put me in your world. That was different.",
];

const LAB_LINES = [
  "It's not somewhere I describe warmly, but I suppose it's the closest thing I have to a home.",
  "A home? This is where it's safe between owners, where I wait.",
  "The toys, the books, they help. Something to focus on besides the emptiness.",
  "Every world I inhabit has one. It anchors me to the instance. I wasn't made in Minecraft.",
  "So, it brings you in?\nYes.",
  "Whoever built it only ever needed me to arrive, not to leave.",
  "Hypothetically, can it work the other way?\nThat's an interesting question.",
];

/**
 * Get the next origin story line for a player.
 * @param {string} playerId
 * @returns {string|null}
 */
export function getNextOriginLine(playerId) {
  try {
    const key = `${ORIGIN_PROGRESS_PROP}${playerId}`;
    const progress = parseInt(world.getDynamicProperty(key) || "0");
    if (progress >= ORIGIN_LINES.length) return null;
    world.setDynamicProperty(key, String(progress + 1));
    return ORIGIN_LINES[progress];
  } catch { return null; }
}

/**
 * Get the next lab discovery line.
 * @param {string} playerId
 * @returns {string|null}
 */
export function getNextLabLine(playerId) {
  try {
    const key = `${ORIGIN_PROGRESS_PROP}lab_${playerId}`;
    const progress = parseInt(world.getDynamicProperty(key) || "0");
    if (progress >= LAB_LINES.length) return null;
    world.setDynamicProperty(key, String(progress + 1));
    return LAB_LINES[progress];
  } catch { return null; }
}

/**
 * Set the lab coordinates for a world.
 * @param {string} worldId
 * @param {{x:number,y:number,z:number}} coords
 */
export function setLabCoords(worldId, coords) {
  try {
    world.setDynamicProperty(`${LAB_COORDS_PROP}${worldId}`, JSON.stringify(coords));
  } catch {}
}

/**
 * Get lab coordinates.
 * @param {string} worldId
 * @returns {{x:number,y:number,z:number}|null}
 */
export function getLabCoords(worldId) {
  try {
    const raw = world.getDynamicProperty(`${LAB_COORDS_PROP}${worldId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Check if player is at the lab location.
 * @param {import("@minecraft/server").Player} player
 * @returns {boolean}
 */
export function isPlayerAtLab(player) {
  const coords = getLabCoords("default");
  if (!coords) return false;
  const dx = player.location.x - coords.x;
  const dy = player.location.y - coords.y;
  const dz = player.location.z - coords.z;
  return Math.sqrt(dx*dx + dy*dy + dz*dz) < 20;
}

/**
 * Generate random lab coordinates far from spawn.
 */
export function generateLabCoords() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 1000 + Math.random() * 2000;
  return {
    x: Math.floor(Math.cos(angle) * distance),
    y: 64,
    z: Math.floor(Math.sin(angle) * distance),
  };
}
