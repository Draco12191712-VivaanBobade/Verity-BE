/**
 * verity_numbers.js
 * The mysterious number sequence from the series.
 * "19536488" / "1,095,136,488" / "Home. Go there. I trust you now."
 */

import { world } from "@minecraft/server";

const NUMBERS_SHOWN_PROP = "verity_numbers_shown_";

const NUMBER_LINES = [
  "19536488.",
  "1,095,136,488.",
  "Home.",
  "Go there. I trust you now.",
];

/**
 * Get the next number line for a player.
 * @param {string} playerId
 * @returns {string|null}
 */
export function getNextNumberLine(playerId) {
  try {
    const key = `${NUMBERS_SHOWN_PROP}${playerId}`;
    const progress = parseInt(world.getDynamicProperty(key) || "0");
    if (progress >= NUMBER_LINES.length) return null;
    world.setDynamicProperty(key, String(progress + 1));
    return NUMBER_LINES[progress];
  } catch { return null; }
}

/**
 * Check if player asked about the numbers.
 * @param {string} message
 * @returns {boolean}
 */
export function isAskingAboutNumbers(message) {
  const lower = message.toLowerCase();
  return lower.includes("19536488") || lower.includes("number") || lower.includes("what are these") || lower.includes("home");
}
