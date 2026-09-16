// ─────────────────────────────────────────────────────────────────────────────
// verity_structures.js — Structure locator for Verity
// Requires cheats enabled. Uses /locate structure under the hood.
// ─────────────────────────────────────────────────────────────────────────────

import { world, system } from "@minecraft/server";
import { ph, pick, TAG, COLORS } from "./verity_core.js";
import { getVerity, playTalk, playerCanHearVerity } from "./verity_systems.js";

// ── Structure name aliases (player-friendly → /locate ID) ────────────────────
const STRUCTURE_ALIASES = {
  // General
  village: "village",
  stronghold: "stronghold",
  fortress: "fortress",
  "nether fortress": "fortress",
  "end city": "end_city",
  endcity: "end_city",
  mansion: "mansion",
  "woodland mansion": "mansion",
  monument: "monument",
  "ocean monument": "monument",
  "pillager outpost": "pillager_outpost",
  outpost: "pillager_outpost",
  "ancient city": "ancient_city",
  ancientcity: "ancient_city",
  "trial chambers": "trial_chambers",
  trialchambers: "trial_chambers",
  bastion: "bastion_remnant",
  "bastion remnant": "bastion_remnant",
  pyramid: "desert_pyramid",
  "desert pyramid": "desert_pyramid",
  "jungle temple": "jungle_pyramid",
  "jungle pyramid": "jungle_pyramid",
  igloo: "igloo",
  "swamp hut": "swamp_hut",
  witchhut: "swamp_hut",
  "buried treasure": "buried_treasure",
  treasure: "buried_treasure",
  mineshaft: "mineshaft",
  "badlands mineshaft": "mineshaft_mesa",
  "mesa mineshaft": "mineshaft_mesa",
  "ruined portal": "ruined_portal",
  portal: "ruined_portal",
  shipwreck: "shipwreck",
  "beached shipwreck": "shipwreck_beached",
  "trail ruins": "trail_ruins",
  trailruins: "trail_ruins",
  // Village variants
  "desert village": "village_desert",
  "plains village": "village_plains",
  "savanna village": "village_savanna",
  "snowy village": "village_snowy",
  "taiga village": "village_taiga",
  // Ocean ruin variants
  "cold ocean ruin": "ocean_ruin_cold",
  "warm ocean ruin": "ocean_ruin_warm",
};

// ── Regex: matches "find the stronghold", "where is the village", etc. ───────
const FIND_STRUCTURE_REGEX = /\b(find|locate|where is|where's|where are|show me|search for|look for|nearest)\b.*?\b(village|stronghold|fortress|nether fortress|end city|endcity|mansion|woodland mansion|monument|ocean monument|pillager outpost|outpost|ancient city|ancientcity|trial chambers|trialchambers|bastion|bastion remnant|pyramid|desert pyramid|jungle temple|jungle pyramid|igloo|swamp hut|witchhut|buried treasure|treasure|mineshaft|badlands mineshaft|mesa mineshaft|ruined portal|shipwreck|beached shipwreck|trail ruins|trailruins|desert village|plains village|savanna village|snowy village|taiga village|cold ocean ruin|warm ocean ruin)\b/i;

// ── Parse /locate structure output ───────────────────────────────────────────
// Bedrock format: "The nearest <name> is at [<x>, ~, <z>] (<n> blocks away)"
function parseLocateOutput(raw) {
  const text = typeof raw === "string" ? raw : raw?.statusMessage || "";
  const m = text.match(/\[(-?\d+),\s*~,\s*(-?\d+)\]\s*\(([\d,]+)/);
  if (!m) return null;
  return {
    x: parseInt(m[1], 10),
    z: parseInt(m[2], 10),
    distance: parseInt(m[3].replace(/,/g, ""), 10),
  };
}

// ── Core locate function ─────────────────────────────────────────────────────
async function locateStructure(player, structureName) {
  const id = STRUCTURE_ALIASES[structureName.toLowerCase().trim()];
  if (!id) return null;

  try {
    const raw = await player.runCommandAsync(`locate structure ${id}`);
    const loc = parseLocateOutput(raw);
    if (!loc) return null;

    return {
      ...loc,
      y: Math.floor(player.location.y),
      id,
      name: structureName,
    };
  } catch (e) {
    return null;
  }
}

// ── Response handler ─────────────────────────────────────────────────────────
function findStructureResponse(player, msg, p) {
  const match = msg.match(FIND_STRUCTURE_REGEX);
  if (!match) return null;

  const structureWord = match[2]?.toLowerCase().trim();
  if (!structureWord) return null;

  const color = ph(COLORS, p);
  const verity = getVerity(player);

  system.run(async () => {
    const loc = await locateStructure(player, structureWord);
    if (!loc) {
      const failLines = [
        `I can't find a ${structureWord} nearby. Might be too far, or it doesn't exist in this dimension.`,
        `No ${structureWord} in range. Try another dimension, or it hasn't generated.`,
        `Searched for ${structureWord}. Nothing close enough.`,
      ];
      world.sendMessage(`${TAG}${color}: ${pick(failLines)}`);
      return;
    }

    const lines = [
      `Nearest ${loc.name} is at ${loc.x}, ${loc.y}, ${loc.z}. About ${loc.distance} blocks away.`,
      `Found one. ${loc.x}, ${loc.y}, ${loc.z}. ${loc.distance} blocks from you.`,
      `${loc.name} — ${loc.x}, ${loc.y}, ${loc.z}. Roughly ${loc.distance} blocks.`,
    ];
    const reply = pick(lines);
    world.sendMessage(`${TAG}${color}: ${reply}`);
    playTalk(verity, reply, player);
  });

  return true;
}

// ── Export ───────────────────────────────────────────────────────────────────
export { FIND_STRUCTURE_REGEX, findStructureResponse, locateStructure, STRUCTURE_ALIASES };
