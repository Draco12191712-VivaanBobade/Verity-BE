import { HOSTILE_TYPES, VERITY_TYPE, getBiomeName, getVerity, playerHasVerityItem, timeOfDayLine, weatherName } from "./verity_systems.js";

import {
  world,
  system,
  TicksPerSecond,
  WeatherType,
  ItemStack,
  Player,
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
} from "@minecraft/server";
import { HivemindAPI } from "./api"; // HiveMind API — https://github.com/TrayePlays/Hive-Mind-Api-Public
import { FR, DE, PT } from "./lang.js"; // French/German/Portuguese local responses
import {
  startVerityRollFollow as startSmoothFollow,
  stopVerityRollFollow as stopSmoothFollow,
} from "./rollverity.js";
import { isVerityRollChatCommand } from "./commands.js";
import { CONFIG, isEnabled } from "./config.js";
import { FUN_FACTS, JOKES } from "./Knowledge/minecraft_facts.js";
import { buildSystemPrompt } from "./Knowledge/system_prompt.js";
import { speakLocal } from "./verity_tts_local.js";
import { isTtsEnabled } from "./verity_tts.js";

// ── AI mode slash commands ──────────────────────────────────────────────────
// Same behavior as the "verity ai local"/"verity ai key <key>" chat phrases
// (see the chatSend dispatcher, ~line 10230), exposed as proper custom
// commands so they show up in autocomplete and don't require Verity to be
// listening in chat. Both require @minecraft/server 2.0.0-beta in the
// behavior pack manifest (see validation notes).
system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerCommand(
    {
      name: "verity:ai_local",
      description: "Switch your Verity AI responses to a local LLM server (e.g. Ollama).",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      optionalParameters: [{ name: "url", type: CustomCommandParamType.String }],
    },
    (origin, url) => {
      const player = origin.sourceEntity;
      if (!(player instanceof Player)) {
        return { status: CustomCommandStatus.Failure, error: "Must be run by a player." };
      }
      if (url) {
        if (!/^https?:\/\//i.test(url)) {
          system.run(() => {
            world.sendMessage(
              `${TAG}: That doesn't look like a URL. Try something like /verity:ai_local http://192.168.1.42:11434/api/chat`
            );
          });
          return { status: CustomCommandStatus.Failure, error: "Invalid URL." };
        }
        setPlayerLocalAiUrl(player, url);
      }
      setPlayerAiMode(player, "local");
      system.run(() => {
        const note = url ? "Using your own local AI address." : "Switched to local AI.";
        world.sendMessage(`${TAG}: ${note} Use /verity:ai_worker or /verity:ai_key to change it back.`);
      });
      return { status: CustomCommandStatus.Success };
    }
  );

  init.customCommandRegistry.registerCommand(
    {
      name: "verity:ai_key",
      description: "Switch your Verity AI responses to your own OpenAI-compatible API key.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [{ name: "key", type: CustomCommandParamType.String }],
    },
    (origin, key) => {
      const player = origin.sourceEntity;
      if (!(player instanceof Player)) {
        return { status: CustomCommandStatus.Failure, error: "Must be run by a player." };
      }
      setPlayerApiKey(player, key);
      setPlayerAiMode(player, "custom");
      system.run(() => {
        // Never echo the key back into chat — just confirm the switch.
        world.sendMessage(`${TAG}: Got it. I'll use your key from now on. Use /verity:ai_worker any time to switch back.`);
      });
      return { status: CustomCommandStatus.Success };
    }
  );
});

// ── Verity ───────────────────────────────────────────────────────────────────
// AI-powered via Cloudflare Worker relay (no API keys in this file).
// Special systems (ore scan, enchants, come here, biome, math, health) run
// locally. Everything else falls through to the live AI, shaped by Verity's
// current phase personality.
//
// Setup:
//   1. Deploy verity-worker.js to Cloudflare Workers.
//   2. Set GROQ_API_KEY, GEMINI_API_KEY, POLLINATIONS_API_KEY, VERITY_SECRET
//      in the Worker's environment variables (CF dashboard → Settings → Variables).
//   3. Paste your Worker URL and matching secret below.
//
// Per-player AI source (see "AI mode selection" below, ~line 411):
//   Each player can switch away from the Worker relay, in chat, at any time:
//     "verity ai local"        — use a local LLM server (e.g. Ollama) running
//                                 on the host machine; set CONFIG.ai.localUrl
//                                 / CONFIG.ai.localModel to point at it.
//     "verity ai key <KEY>"    — use their own OpenAI-compatible API key,
//                                 called directly, bypassing the Worker.
//     "verity ai worker"       — switch back to the default relay.
//
// ── Architecture ───────────────────────────────────────────────────────────

// The file has three broad regions:
//   1. Lines ~87–1520   Core systems: phase state, AI routing, locators,
//                       weather, timers, animation/face locks. See the TOC
//                       below — each has its own "// ── Name ──" header.
//   2. Lines ~1522–7642 The local response library: one function (or one
//                       phase-indexed array) per recognized player message
//                       pattern, each preceded by a comment naming the
//                       trigger phrase(s) it answers. This region is dense
//                       by nature (~250 handlers) — to find a specific one,
//                       search for its *_REGEX name or a distinctive word
//                       from the trigger phrase in its header comment.
//   3. Lines ~7643–end  Event wiring: profanity filter, phase progression,
//                       the main chatSend dispatcher (tryLocalResponse →
//                       AI fallback), and idle/join/leave handlers.
//
// Every phase-indexed response array (via the `ph(arr, p)` helper, ~line 168)
// covers all 6 phases (0 fresh-install → 5 "true self"). `ph()` clamps to the
// last defined phase if an array is ever short, so a missing phase degrades
// gracefully rather than crashing — but there should be none currently.
//
// ── Table of contents (core systems only; see region 2 above for the
//    response library) ───────────────────────────────────────────────────
//   Worker config .............................................. line 87
//   Startup config check ....................................... line 139
//   HiveMind API init .......................................... line 154
//   Per-player AI conversation history ......................... line 161
//   Idle conversation tracking ................................. line 167
//   Phase system ................................................ line 186
//   Text color per phase ........................................ line 242
//   Phase system prompt for the AI .............................. line 245
//   Deterministic provider rotation ............................. line 312
//   Async AI response (Cloudflare relay) ........................ line 325
//   Enchantment conversation state ............................... line 385
//   Live biome detection .......................................... line 500
//   Simple math .................................................... line 518
//   Health check .................................................... line 544
//   Time of day ...................................................... line 553
//   Ore locator ....................................................... line 565
//   Feature locator (water/lava/village/mob) .......................... line 640
//   World info .......................................................... line 810
//   Weather forecasting (Verity runs the cycle) ......................... line 885
//   Come here .............................................................. line 1008
//   Music system .............................................................. line 1054
//   Coordinates query ............................................................ line 1119
//   Timer ......................................................................... line 1144
//   Talk animation .................................................................. line 1340
//   Smiler presence gate .............................................................. line 1344
//   Face ownership lock .................................................................. line 1394
//   Hearing range ........................................................................... line 1456
//   [ local response library — ~250 message-pattern handlers — starts ~1522 ]
//   Profanity filter & kick system ............................................................. line 7643
//   Question-based phase progression .............................................................. line 7720
//   Main event: chatSend dispatcher (tryLocalResponse → AI fallback) ................................. line 7752
//   Music cleanup on player leave ...................................................................... line 7940
//   Phase → idle face mapping .............................................................................. line 7954
//   Idle face refresh .......................................................................................... line 7966
//   Friend greeting on join ...................................................................................... line 7986
//   Idle conversation — Verity starts talking first ............................................................... line 8031


const TAG = CONFIG.chat.tag;

// ── Worker config (only safe values here — no keys) ───────────────────────────
const WORKER_URL = CONFIG.ai.workerUrl;
const WORKER_SECRET = CONFIG.ai.workerToken;

// Sent as "clientVersion" with every Worker request. The Worker rejects
// requests below its MIN_CLIENT_VERSION with 426 before doing any work, so
// this number must be bumped here whenever a breaking change ships, to match
// whatever MIN_CLIENT_VERSION is set to in verity-worker.js.
const CLIENT_VERSION = CONFIG.ai.clientVersion;

// Provider names the Worker recognises. The pack never holds a key.
// Players spread deterministically across these; if one fails/rate-limits,
// the next in their rotation is tried automatically.
// Remove any name from this list to disable that provider.
const PROVIDER_NAMES = CONFIG.ai.providers;

// ── Startup config check ──────────────────────────────────────────────────────
(function validateWorkerConfig() {
  if (!WORKER_URL || WORKER_URL.includes("YOUR_WORKER")) {
    console.warn("[Verity] WARNING: WORKER_URL not set. AI fallback is disabled. Paste your Cloudflare Worker URL.");
  }
  if (!WORKER_SECRET || WORKER_SECRET.startsWith("PASTE_")) {
    console.warn("[Verity] WARNING: WORKER_SECRET not set. Requests will be rejected by the Worker.");
  }
  if (WORKER_URL && !WORKER_URL.includes("YOUR_WORKER")) {
    console.warn(`[Verity] INFO: Worker relay configured. Providers: ${PROVIDER_NAMES.join(", ")}.`);
  }
})();



// ── HiveMind API init ─────────────────────────────────────────────────────────
// scriptEvent: false → uses Custom Commands (works on BDS, dedicated servers).
// Set scriptEvent: true if you're using the websocket/script-event path instead.
const hivemind = new HivemindAPI("Verity", { scriptEvent: true, logFailures: false });

/**
 * @param {string[]} arr
 * @returns {*}
 */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Per-player AI conversation history ───────────────────────────────────────
// Keeps context across messages in the same session so Verity "remembers"
// what was said earlier in the conversation.
const conversationHistory = new Map(); // playerName -> [{role, content}]
const MAX_HISTORY = CONFIG.ai.maxHistoryMessages;
const KNOWN_PLAYERS_PROP = "verity:known_players";
const MAX_AI_REPLY_CHARS = 220;

// ── Idle conversation tracking ────────────────────────────────────────────────
// Tracks the last time each player successfully spoke to Verity (in ticks).
// Used by the idle-conversation system below to decide when to reach out first.
const lastTalkTick = new Map(); // playerName -> tick count

/**
 * @param {string} playerName
 * @returns {*}
 */
function getHistory(playerName) {
  if (!conversationHistory.has(playerName)) {
    conversationHistory.set(playerName, []);
  }
  return conversationHistory.get(playerName);
}

/**
 * @param {string} playerName
 * @param {*} role
 * @param {*} content
 * @returns {void}
 */
function pushHistory(playerName, role, content) {
  const hist = getHistory(playerName);
  hist.push({ role, content });
  // Trim to MAX_HISTORY messages
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
}

function getRememberedPlayerNames() {
  try {
    const saved = world.getDynamicProperty(KNOWN_PLAYERS_PROP);
    if (typeof saved !== "string" || !saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(name => typeof name === "string") : [];
  } catch {
    return [];
  }
}

function rememberPlayerName(playerName) {
  if (!playerName) return;
  const names = getRememberedPlayerNames();
  if (names.includes(playerName)) return;
  names.push(playerName);
  try {
    world.setDynamicProperty(KNOWN_PLAYERS_PROP, JSON.stringify(names.slice(-100)));
  } catch (e) {
    console.warn(`[Verity] Failed to remember player name: ${e}`);
  }
}

function conciseReply(text, maximumLength = MAX_AI_REPLY_CHARS) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "...";

  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [clean];
  let result = sentences.slice(0, 2).join(" ").trim();
  if (result.length <= maximumLength) return result;

  result = result.slice(0, maximumLength - 1);
  const lastSpace = result.lastIndexOf(" ");
  if (lastSpace > maximumLength * 0.65) result = result.slice(0, lastSpace);
  return `${result.trimEnd()}…`;
}

function liveWorldContext(player) {
  if (!player?.isValid) return "Player entity unavailable.";
  const parts = [];
  const location = player.location;
  const px = Math.floor(location.x), py = Math.floor(location.y), pz = Math.floor(location.z);
  parts.push(`player position ${px}, ${py}, ${pz}`);
  parts.push(`player dimension ${player.dimension.id.replace("minecraft:", "")}`);

  const verity = getVerity(player);
  if (verity?.isValid) {
    const vl = verity.location;
    const distance = Math.sqrt(
      (vl.x - location.x) ** 2 + (vl.y - location.y) ** 2 + (vl.z - location.z) ** 2
    );
    parts.push(
      `Verity position ${Math.floor(vl.x)}, ${Math.floor(vl.y)}, ${Math.floor(vl.z)} ` +
      `in ${verity.dimension.id.replace("minecraft:", "")}, ${Math.round(distance)} blocks from player`
    );
  } else if (playerHasVerityItem(player)) {
    parts.push("Verity is currently in the player's inventory");
  } else {
    parts.push("no loaded Verity entity found");
  }

  const biome = getBiomeName(player);
  if (biome) parts.push(`biome ${biome}`);

  try {
    const health = player.getComponent("minecraft:health");
    if (health) parts.push(`health ${Math.ceil(health.currentValue)}/${Math.ceil(health.effectiveMax ?? health.defaultValue ?? 20)}`);
  } catch {}

  try {
    const held = player.getComponent("minecraft:inventory")?.container?.getItem(player.selectedSlotIndex);
    parts.push(`held item ${held?.typeId?.replace("minecraft:", "") ?? "empty hand"}`);
  } catch {}

  try {
    parts.push(`weather ${weatherName(player.dimension.getWeather()).toLowerCase()}`);
  } catch {}
  parts.push(`day ${currentDay()}`);
  parts.push(`time ${world.getTimeOfDay()} ticks (${timeOfDayLine()})`);

  try {
    const feet = player.dimension.getBlock({ x: px, y: py, z: pz });
    const below = player.dimension.getBlock({ x: px, y: py - 1, z: pz });
    if (feet) parts.push(`block at player ${feet.typeId.replace("minecraft:", "")}`);
    if (below) parts.push(`block below player ${below.typeId.replace("minecraft:", "")}`);
  } catch {}

  try {
    const nearby = player.dimension.getEntities({
      location,
      maxDistance: CONFIG.gameplay.worldAwarenessRadius,
      excludeTypes: ["minecraft:player", VERITY_TYPE],
    });
    const counts = new Map();
    let nearestHostile = null;
    let nearestHostileDist = Infinity;
    for (const entity of nearby.slice(0, 80)) {
      const name = entity.typeId.replace("minecraft:", "");
      counts.set(name, (counts.get(name) ?? 0) + 1);
      if (HOSTILE_TYPES.includes(entity.typeId)) {
        const el = entity.location;
        const dist = Math.sqrt((el.x - location.x) ** 2 + (el.y - location.y) ** 2 + (el.z - location.z) ** 2);
        if (dist < nearestHostileDist) {
          nearestHostileDist = dist;
          nearestHostile = entity;
        }
      }
    }
    const summary = [...counts.entries()].slice(0, 10).map(([name, count]) => `${count} ${name}`).join(", ");
    if (summary) parts.push(`nearby entities ${summary}`);
    if (nearestHostile) {
      const hl = nearestHostile.location;
      parts.push(
        `nearest hostile ${nearestHostile.typeId.replace("minecraft:", "")} at ` +
        `${Math.floor(hl.x)}, ${Math.floor(hl.y)}, ${Math.floor(hl.z)}, ${Math.round(nearestHostileDist)} blocks away`
      );
    }
  } catch {}

  const onlineNames = world.getAllPlayers().map(current => {
    const suffix = current.dimension.id === player.dimension.id
      ? ` at ${Math.floor(current.location.x)}, ${Math.floor(current.location.y)}, ${Math.floor(current.location.z)}`
      : ` in ${current.dimension.id.replace("minecraft:", "")}`;
    return `${current.name}${suffix}`;
  });
  if (onlineNames.length) parts.push(`online players ${onlineNames.join(", ")}`);
  const remembered = getRememberedPlayerNames().filter(name => !onlineNames.includes(name));
  if (remembered.length) parts.push(`previously met players ${remembered.slice(-8).join(", ")}`);
  return parts.join("; ");
}

// ── Phase system ──────────────────────────────────────────────────────────────
// Progression is no longer tied to in-world days. Verity has one shared
// (global, all-players) counter of questions asked to her. Plain Minecraft
// questions nudge it forward a little; questions that dig into who/what she
// actually is ("lore" questions) push it forward a lot. currentDay() is kept
// around purely for flavor text (the in-world date) — it no longer drives phase.
const DAY_OFFSET = 0;

/**
 * @returns {*}
 */
function currentDay() { return world.getDay() + DAY_OFFSET + 1; }

const QUESTION_COUNT_PROP = "verity:qcount";
const PEAK_PHASE_PROP = "verity:peak_phase";
const RELATIONSHIP_PROP = "verity:relationship";

// Cumulative question-count needed to reach each phase. Tune freely — these
// are just reasonable defaults for a 6-phase arc (0-3 existing, 4 = yandere,
// 5 = final/true-self, per "Something Won't Let You Leave").
const PHASE_THRESHOLDS = CONFIG.phases.thresholds;

/**
 * @returns {number}
 */
function getQuestionCount() {
  try {
    return world.getDynamicProperty(QUESTION_COUNT_PROP) ?? 0;
  } catch (e) {
    console.warn(`[Verity] getQuestionCount failed: ${e}`);
    return 0;
  }
}

// weight: 1 for an ordinary question, higher (default 4) for a "lore"
// question that specifically digs into Verity's nature/origin/feelings.
// registerQuestion() (defined near LORE_TRIGGER_REGEXES, below the regex
// declarations it depends on) is what actually calls this.
/**
 * @param {*} weight
 * @returns {void}
 */
function addQuestionCount(weight) {
  const current = getQuestionCount();
  try {
    world.setDynamicProperty(QUESTION_COUNT_PROP, Math.max(0, current + weight));
  } catch (e) {
    console.warn(`[Verity] addQuestionCount failed: ${e}`);
  }
}

function phaseFromQuestionCount(count) {
  for (let i = PHASE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= PHASE_THRESHOLDS[i]) return i;
  }
  return 0;
}

/**
 * @returns {number}
 */
function phase() {
  return phaseFromQuestionCount(getQuestionCount());
}

// Safe accessor for the many phase-indexed response arrays throughout this
// file. If an array hasn't been explicitly written for phase 4/5 yet, this
// clamps to its last defined phase instead of returning undefined (which
// would crash pick()). Explicitly-extended arrays (COLORS, buildSystemPrompt,
// IDLE_LINES, etc.) just use their own phase-5 entry normally.
/**
 * @param {string[]} arr
 * @param {number} p
 * @returns {*}
 */
function ph(arr, p) {
  return arr[Math.min(p, arr.length - 1)];
}

// ── Text color per phase ──────────────────────────────────────────────────────
const COLORS = CONFIG.phases.colors;

// ── Deterministic provider rotation ──────────────────────────────────────────
/**
 * @param {*} s
 * @returns {*}
 */
function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * @param {string} playerName
 * @returns {*}
 */
function providerOrderForPlayer(playerName) {
  if (PROVIDER_NAMES.length === 0) return [];
  const start = hashString(playerName) % PROVIDER_NAMES.length;
  return [...PROVIDER_NAMES.slice(start), ...PROVIDER_NAMES.slice(0, start)];
}

// ── Word-pool fallback — used when every AI provider fails or returns an
// unparseable response. Instead of a generic filler line, this scans the
// player's message for topic keywords and stitches together a phrase from a
// pool that's actually relevant to what was asked, so it still reads like
// Verity heard the question even though the real AI call never came back.
// Categories are intentionally broad fragments (not full sentences on their
// own) so they can be combined into a natural-sounding reply.
const FALLBACK_WORD_POOL = {
  danger: {
    keywords: ["scared", "afraid", "danger", "kill", "hurt", "die", "death", "monster", "attack", "safe"],
    openers:  ["That's not something I can just wave off —", "I won't pretend that's nothing —", "Careful with that —"],
    middles:  ["there's real risk in what you're describing", "I've seen worse turn out fine, and I've seen it not", "it's the kind of thing worth being cautious about"],
    closers:  ["stay sharp.", "don't go in alone.", "I'd rather you be careful than sorry."],
  },
  mobs: {
    keywords: ["zombie", "skeleton", "creeper", "spider", "enderman", "mob", "mobs", "wither", "piglin"],
    openers:  ["Mobs are unpredictable —", "That crowd doesn't play fair —", "Out there, things like that —"],
    middles:  ["they don't care what time it is if you give them the chance", "they'll take an opening the second you leave one", "they're worth respecting more than most people give them credit for"],
    closers:  ["keep your guard up.", "don't underestimate them.", "watch your back out there."],
  },
  building: {
    keywords: ["build", "house", "base", "shelter", "wall", "roof", "design", "structure"],
    openers:  ["Building well takes patience —", "A good base isn't built in a rush —", "Whatever you're putting together —"],
    middles:  ["think about what it needs to keep out, not just how it looks", "the foundation matters more than people give it credit for", "it's worth doing right the first time"],
    closers:  ["take your time with it.", "I'd rather you build it solid.", "make it somewhere you'd actually feel safe."],
  },
  mining: {
    keywords: ["mine", "mining", "cave", "ore", "diamond", "dig", "tunnel", "depth"],
    openers:  ["Down there —", "That deep —", "Mining that far —"],
    middles:  ["it's easy to lose track of where you are", "the risk goes up the further you push", "there's always something worth finding if you're patient"],
    closers:  ["bring torches.", "don't dig straight down.", "watch your footing."],
  },
  weather: {
    keywords: ["rain", "storm", "thunder", "weather", "sunny", "snow", "night", "day"],
    openers:  ["The sky's been doing its own thing —", "Weather like that —", "It changes fast out here —"],
    middles:  ["it doesn't last as long as it feels like it does", "it's worth planning around either way", "I notice it more than you'd think"],
    closers:  ["it'll pass.", "wait it out if you can.", "I'll let you know if it turns."],
  },
  personal: {
    keywords: ["you", "verity", "feel", "feeling", "who", "what", "real", "alone", "tired"],
    openers:  ["That's a harder question than it sounds —", "I don't have a simple answer for that —", "Ask me that again sometime —"],
    middles:  ["some of it I haven't worked out myself", "there's more to it than I can put into words right now", "it's not something I brush off, even if I can't answer it fully"],
    closers:  ["I'm still here, though.", "that hasn't changed.", "I'll tell you when I can."],
  },
  friend: {
    keywords: ["friend", "trust", "help", "thanks", "thank", "sorry", "love", "care"],
    openers:  ["That means something —", "I hear you —", "Noted —"],
    middles:  ["I don't take that lightly", "it's not something I forget", "that goes both ways with me"],
    closers:  ["I've got you.", "I mean that.", "thank you for saying it."],
  },
};

/**
 * Scans the message for keywords from FALLBACK_WORD_POOL, picks whichever
 * category scored the most matches, and assembles a short reply from that
 * category's fragments. Returns null if nothing in the message matched
 * anything, so the caller can fall back to the old generic fillers.
 * @param {string} userMessage
 * @returns {string | null}
 */
function buildWordPoolFallback(userMessage) {
  const msg = (userMessage || "").toLowerCase();
  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(FALLBACK_WORD_POOL)) {
    const { keywords } = FALLBACK_WORD_POOL[key];
    let score = 0;
    for (const kw of keywords) {
      if (msg.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  if (!bestKey || bestScore === 0) return null;

  const pool = FALLBACK_WORD_POOL[bestKey];
  return `${pick(pool.openers)} ${pick(pool.middles)}. ${pick(pool.closers)}`;
}

// ── AI mode selection (per player) ────────────────────────────────────────────
// Each player independently picks how their messages get answered:
//   "worker" (default) — Cloudflare Worker relay, exactly as before.
//   "local"            — a local LLM server (e.g. Ollama) running on the same
//                         machine as the dedicated server. No key needed.
//   "custom"           — the player supplies their own API key and Verity
//                         calls that provider directly, bypassing the Worker.
// Mode and key are stored as per-player dynamic properties, so they persist
// across sessions and stay scoped to that player only.
const AI_MODE_PROP   = "verity:ai_mode";
const AI_KEY_PROP    = "verity:ai_key";
const AI_LOCAL_URL_PROP = "verity:ai_local_url";
const VALID_AI_MODES = ["worker", "local", "custom"];

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {"worker" | "local" | "custom"}
 */
function getPlayerAiMode(player) {
  try {
    const mode = player.getDynamicProperty(AI_MODE_PROP);
    return VALID_AI_MODES.includes(mode) ? mode : "worker";
  } catch (e) {
    console.warn(`[Verity] getPlayerAiMode failed: ${e}`);
    return "worker";
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {"worker" | "local" | "custom"} mode
 * @returns {void}
 */
function setPlayerAiMode(player, mode) {
  try {
    player.setDynamicProperty(AI_MODE_PROP, mode);
  } catch (e) {
    console.warn(`[Verity] setPlayerAiMode failed: ${e}`);
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {string}
 */
function getPlayerApiKey(player) {
  try {
    return player.getDynamicProperty(AI_KEY_PROP) ?? "";
  } catch (e) {
    console.warn(`[Verity] getPlayerApiKey failed: ${e}`);
    return "";
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} key
 * @returns {void}
 */
function setPlayerApiKey(player, key) {
  try {
    player.setDynamicProperty(AI_KEY_PROP, key);
  } catch (e) {
    console.warn(`[Verity] setPlayerApiKey failed: ${e}`);
  }
}

/**
 * Returns this player's own local-AI URL if they've set one (e.g. their own
 * phone's Termux/Ollama address), otherwise the shared LOCAL_AI_URL default.
 * @param {import("@minecraft/server").Player} player
 * @returns {string}
 */
function getPlayerLocalAiUrl(player) {
  try {
    return player.getDynamicProperty(AI_LOCAL_URL_PROP) || LOCAL_AI_URL;
  } catch (e) {
    console.warn(`[Verity] getPlayerLocalAiUrl failed: ${e}`);
    return LOCAL_AI_URL;
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} url
 * @returns {void}
 */
function setPlayerLocalAiUrl(player, url) {
  try {
    player.setDynamicProperty(AI_LOCAL_URL_PROP, url);
  } catch (e) {
    console.warn(`[Verity] setPlayerLocalAiUrl failed: ${e}`);
  }
}

// ── Local AI + custom-key endpoint config ────────────────────────────────────
// Local: an Ollama-style chat endpoint reachable from the host machine. Falls
// back to sensible defaults if config.js hasn't been extended with these
// fields yet — add CONFIG.ai.localUrl / CONFIG.ai.localModel there to change.
const LOCAL_AI_URL   = CONFIG.ai.localUrl   ?? "http://localhost:11434/api/chat";
const LOCAL_AI_MODEL = CONFIG.ai.localModel ?? "llama3";

// Custom: an OpenAI-compatible chat-completions endpoint. The player's key is
// sent only in this one request header and is never logged or forwarded to
// the Worker. Add CONFIG.ai.customEndpoint / CONFIG.ai.customModel to
// config.js to point this at a different provider (must be OpenAI-schema
// compatible: { choices: [{ message: { content } }] }).
const CUSTOM_AI_URL   = CONFIG.ai.customEndpoint ?? "https://api.openai.com/v1/chat/completions";
const CUSTOM_AI_MODEL = CONFIG.ai.customModel    ?? "gpt-4o-mini";

/**
 * Builds the OpenAI-style messages array shared by the local and custom
 * request bodies (system prompt + rolling history + the new user message).
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Array<{role: string, content: string}>}
 */
function buildChatMessages(systemPrompt, history, userMessage) {
  return [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];
}

/**
 * @param {string} playerName
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Promise<string | null>}
 */
async function getWorkerAIResponse(playerName, systemPrompt, history, userMessage) {
  if (!WORKER_URL || WORKER_URL.includes("YOUR_WORKER")) return null;
  
  try {
    const result = await hivemind.sendHttpRequest(WORKER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: WORKER_SECRET,
        clientVersion: CLIENT_VERSION,
        playerName,
        systemPrompt,
        history,
        userMessage,
        // NO "provider" field — Worker decides
      }),
    }, CONFIG.ai.timeoutTicks);
    
    let parsed = typeof result?.getData === "function"
      ? result.getData()
      : result?.data ?? result;
      
    for (let depth = 0; depth < 4; depth += 1) {
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
        continue;
      }
      if (parsed && typeof parsed === "object" && !parsed.text && parsed.body !== undefined) {
        parsed = parsed.body;
        continue;
      }
      if (parsed && typeof parsed === "object" && !parsed.text && parsed.data !== undefined) {
        parsed = parsed.data;
        continue;
      }
      break;
    }
    
    if (parsed?.error) {
      console.warn(`[Verity] Worker error: ${parsed.error}`);
      return null;
    }
    
    const rawText = parsed?.text?.trim();
    if (!rawText) {
      console.warn("[Verity] Worker returned empty text.");
      return null;
    }
    return rawText;
    
  } catch (e) {
    console.warn(`[Verity] Worker request failed: ${e}`);
    return null;
  }
}

/**
 * Calls a local, Ollama-style chat endpoint. No secret is sent. `url`
 * defaults to the shared LOCAL_AI_URL but a player may override it with
 * their own address (e.g. their own phone's Termux/Ollama IP) via
 * "verity ai local <url>".
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @param {string} [url]
 * @returns {Promise<string | null>}
 */
async function getLocalAIResponse(systemPrompt, history, userMessage, url = LOCAL_AI_URL) {
  let result;
  try {
    result = await hivemind.sendHttpRequest(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: LOCAL_AI_MODEL,
        messages: buildChatMessages(systemPrompt, history, userMessage),
        stream: false,
      }),
    }, CONFIG.ai.timeoutTicks);
  } catch (e) {
    console.warn(`[Verity] Local AI request failed: ${e}`);
    return null;
  }

  let parsed;
  try {
    parsed = typeof result?.getData === "function" ? result.getData() : result?.data ?? result;
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch (e) {
    console.warn(`[Verity] Local AI returned unparseable response: ${e}`);
    return null;
  }

  // Ollama's /api/chat shape: { message: { content } }. Some local servers
  // instead mimic the OpenAI schema, so both are checked.
  const rawText = (parsed?.message?.content ?? parsed?.choices?.[0]?.message?.content ?? "").trim();
  if (!rawText) {
    console.warn("[Verity] Local AI returned empty text.");
    return null;
  }
  return rawText;
}

/**
 * Calls an OpenAI-compatible endpoint directly with the player's own key.
 * @param {string} apiKey
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {Promise<string | null>}
 */
async function getCustomAIResponse(apiKey, systemPrompt, history, userMessage) {
  let result;
  try {
    result = await hivemind.sendHttpRequest(CUSTOM_AI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CUSTOM_AI_MODEL,
        messages: buildChatMessages(systemPrompt, history, userMessage),
      }),
    }, CONFIG.ai.timeoutTicks);
  } catch (e) {
    console.warn(`[Verity] Custom-key AI request failed: ${e}`);
    return null;
  }

  let parsed;
  try {
    parsed = typeof result?.getData === "function" ? result.getData() : result?.data ?? result;
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch (e) {
    console.warn(`[Verity] Custom-key AI returned unparseable response: ${e}`);
    return null;
  }

  if (parsed?.error) {
    console.warn(`[Verity] Custom-key AI error: ${parsed.error?.message ?? parsed.error}`);
    return null;
  }

  const rawText = (parsed?.choices?.[0]?.message?.content ?? "").trim();
  if (!rawText) {
    console.warn("[Verity] Custom-key AI returned empty text.");
    return null;
  }
  return rawText;
}

// ── Async AI response — routes to Worker, local AI, or the player's own key ──
/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} userMessage
 * @param {number} p
 * @returns {Promise<string>}
 */
async function getAIResponse(player, userMessage, p) {
  const playerName   = player.name;
  const history      = getHistory(playerName);
  const systemPrompt = buildSystemPrompt(p, playerName, liveWorldContext(player));

  const fallbacks = ["...", "Ask me again.", "I heard you.", "Give me a moment."];
  const wordPoolFallback = buildWordPoolFallback(userMessage);

  if (!isEnabled(CONFIG.features.ai)) return wordPoolFallback ?? pick(fallbacks);

  const mode = getPlayerAiMode(player);
  let rawText = null;

  if (mode === "local") {
    rawText = await getLocalAIResponse(systemPrompt, history, userMessage, getPlayerLocalAiUrl(player));
  } else if (mode === "custom") {
    const key = getPlayerApiKey(player);
    if (!key) {
      return 'You haven\'t set an API key yet. Say "verity ai key <your key>" to set one, or "verity ai worker" to switch back.';
    }
    rawText = await getCustomAIResponse(key, systemPrompt, history, userMessage);
  } else {
    rawText = await getWorkerAIResponse(playerName, systemPrompt, history, userMessage);
  }

  if (!rawText) return wordPoolFallback ?? pick(fallbacks);

  const text = conciseReply(rawText);
  pushHistory(playerName, "user", userMessage);
  pushHistory(playerName, "assistant", text);
  return text;
}

// ── Enchantment conversation state ────────────────────────────────────────────

export { COLORS, PEAK_PHASE_PROP, PHASE_THRESHOLDS, QUESTION_COUNT_PROP, RELATIONSHIP_PROP, TAG, addQuestionCount, currentDay, getAIResponse, getQuestionCount, lastTalkTick, ph, phase, phaseFromQuestionCount, pick, rememberPlayerName, setPlayerAiMode, setPlayerApiKey, setPlayerLocalAiUrl };
