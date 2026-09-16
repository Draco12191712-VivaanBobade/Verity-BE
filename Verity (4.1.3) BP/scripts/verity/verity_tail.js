import { system, world } from "@minecraft/server";
import { safeKick } from "./safe_kick.js";
import { isVerityRollChatCommand } from "./commands.js";
import { CONFIG, isEnabled } from "./config.js";
import { COLORS, PEAK_PHASE_PROP, PHASE_THRESHOLDS, QUESTION_COUNT_PROP, RELATIONSHIP_PROP, TAG, addQuestionCount, getAIResponse, getQuestionCount, lastTalkTick, ph, phase, phaseFromQuestionCount, pick, rememberPlayerName, setPlayerAiMode, setPlayerApiKey, setPlayerLocalAiUrl } from "./verity_core.js";
import { COME_HERE_LINES, COME_HERE_REGEX, COORDS_QUERY_REGEX, COUNTDOWN_REGEX, HUMAN_FORM_REGEX, INSULT_REGEX, IS_TALKING, I_LOVE_YOU_REGEX, MONSTER_TODAY_REGEX, MUSIC_PLAY_REGEX, MUSIC_STOP_REGEX, ORE_LOOKUP, SEARCHING, SIBLINGS_REGEX, TIMER_CANCEL_REGEX, TIMER_NO_DURATION_LINES, TIMER_SET_REGEX, VARIANT, VARIANT_PROP, VERITY_EGG_IDS, VERITY_TYPE, WHY_STAY_REGEX, callVerityComeHere, cancelTimer, coordsQueryResponse, findOreJob, getVerity, handleEnchantFlow, handleFeatureLocate, musicIntervals, oreKeyFromMessage, parseTimerDuration, playRequestedSound, playTalk, playerCanHearVerity, setFaceMood, setVariant, smilerExistsInWorld, soundKeyFromMessage, startMusic, startTimer, stopMusic, timers } from "./verity_systems.js";
import { AMISAFE_REGEX, ANYTHINGTOKNOW_REGEX, BAREPROMISE_REGEX, CREATOR_REGEX, DESCRIBE_SELF_REGEX, FOLLOW_ME_REGEX, FOLLOW_STOP_REGEX, HUMAN_OVERSIGHT_REGEX, KNOWOFTHING_REGEX, LEAVING_YOU_REGEX, MINE_ALONE_REGEX, OBSESSED_REGEX, OTHER_VERITY_REGEX, PROMISE_REGEX, REAL_YOU_REGEX, SEENIT_REGEX, SOMETHING_COMING_FOR_ME_REGEX, SO_TIRED_REGEX, TRULYVERITY_REGEX, WANT_US_SAFE_REGEX, WHATAREYOUREALLY_REGEX, WHATDATE_REGEX, WHATS_WRONG_REGEX, WHY_KNOW_TOO_MUCH_REGEX, followMeResponse, followStopResponse, humanOversightResponse, startFollowing, stopFollowing } from "./verity_responses_1.js";
import { tryLocalResponse } from "./verity_dispatch.js";
import { KNOW_WHAT_YOU_ARE_REGEX, LOGGED_OFF_REGEX, MOB_LORE_REGEX, handleGiftRequest } from "./verity_responses_2.js";

// ── Profanity filter & kick system ───────────────────────────────────────────
// Verity warns on the first offence; a second offence in the same session
// uses the server-admin kick API directly.
// Add or remove words/patterns in PROFANITY_REGEX as needed.
const PROFANITY_REGEX = /\b(sex|sexy|sexual|horny|turned on|nsfw|nude|naked|nudes|boob|boobs|tits|titties|penis|vagina|dick|cock|pussy|verga|cum|cumming|orgasm|masturbat\w*|jerk off|jack off|finger me|fondle|grope|rape|molest|seduce|strip|stripper|onlyfans|porn|pornography|hentai|lewd|kinky|fetish|bdsm|bondage|erotic\w*|aroused|wanna fuck|want to fuck|rail me|bang me|smash me|clap cheeks|send nudes|show me your body|take off your|undress|how (do i|to) (fuck|screw|bang|bone|nail|shag|bed|sleep with|have sex with)|how (do (i|you)|to) (fuck|screw|bang)|fuck (someone|him|her|them|me|you|a girl|a guy|a woman|a man)|get (someone|a girl|a guy) into bed|how to (get laid|hookup|hook up|pick up girls?|pick up guys?)|make (someone|a girl|a guy|her|him) (cum|moan|squirt|horny)|what('?s| is) (sex|fucking|screwing) like|teach me (to |how to )?fuck|how (do i|to) (pleasure|satisfy|seduce) (someone|a girl|a guy|a woman|a man)|where do i (put it|stick it|insert it)|does it (hurt|feel good) when you|i want to (fuck|screw|bang|bone|rail|smash)|i('?m| am) going to (fuck|screw|bang|bone|rail|smash)|gonna (fuck|screw|bang|bone|rail|smash)|show me (how to have sex|how to fuck|your genitals?|your privates?)|is (sex|fucking|screwing) (good|fun|nice|great|worth it)|have you (ever had sex|fucked anyone|done it)|sex tips?|sexual advice|dirty talk|talk dirty|sexting|que harias con mi verga|qué harías con mi verga)\b/i;

// Slurs get their own regex, checked separately and matched loosely (allowing
// spaces/punctuation between letters) since spacing-out is the most common
// way players try to slip a slur past a whole-word filter. Extend this list
// if other bypass spellings show up in the Discord webhook logs.
const SLUR_REGEX = /n[\W_]*i[\W_]*g[\W_]*g[\W_]*[ae3][\W_]*r/i;

const profanityWarned = new Set(); // playerName -> warned once already

const PROFANITY_WARNING_LINES = [
  "That's not something I entertain. Don't try it again.",
  "I'm not that kind of entity. Last warning.",
  "Keep it appropriate. I won't say it twice.",
];

const PROFANITY_KICK_LINES = [
  "I warned you.",
  "I told you once.",
  "You had your chance.",
];

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {void}
 */
function kickPlayer(player) {
  safeKick(player, "Verity removed you for repeated prohibited chat.");
}

// Runs on every chat message, before the Verity-command check.
world.afterEvents.chatSend.subscribe((ev) => {
  const msg    = ev.message.trim();
  const player = ev.sender;
  if (!PROFANITY_REGEX.test(msg) && !SLUR_REGEX.test(msg)) return;
  if (!playerCanHearVerity(player)) return;

  const name  = player.name;
  const p     = phase();
  const color = ph(COLORS, p);
  const verity = getVerity(player);

  if (profanityWarned.has(name)) {
    // Second offence — warn in chat then kick
    const line = pick(PROFANITY_KICK_LINES);
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${line}`);
      if (verity) playTalk(verity, line, player);
      system.runTimeout(() => { kickPlayer(player); }, 40); // short delay so the message lands first
    });
    profanityWarned.delete(name); // reset so it isn't dangling after they reconnect
  } else {
    // First offence — warn only
    profanityWarned.add(name);
    const line = pick(PROFANITY_WARNING_LINES);
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${line}`);
      if (verity) playTalk(verity, line, player);
    });
  }
});

// Clean up warned state when a player leaves so it doesn't carry over on rejoin.
// (The playerLeave subscriber below already handles music/timers; this piggybacks
//  on a separate subscribe rather than modifying that block.)
world.afterEvents.playerLeave.subscribe((ev) => {
  profanityWarned.delete(ev.playerName);
});

// Dropping any Verity egg spawns the matching live face variant.
world.afterEvents.entitySpawn.subscribe((ev) => {
  const itemEntity = ev.entity;
  if (!itemEntity || itemEntity.typeId !== "minecraft:item") return;

  let stack;
  try {
    stack = itemEntity.getComponent("minecraft:item")?.itemStack;
  } catch (e) {
    console.warn(`[Verity] Dropped-egg check failed: ${e}`);
    return;
  }
  if (!stack || !VERITY_EGG_IDS.has(stack.typeId)) return;

  const eggIds = Array.from(VERITY_EGG_IDS);
  const variant = eggIds.indexOf(stack.typeId);
  const dim = itemEntity.dimension;
  const loc = itemEntity.location;

  try {
    itemEntity.remove();
    const spawned = dim.spawnEntity(VERITY_TYPE, loc);
    if (variant >= 0) spawned.setProperty(VARIANT_PROP, variant);
  } catch (e) {
    console.warn(`[Verity] Failed to spawn Verity from dropped egg: ${e}`);
  }
});

// ── Question-based phase progression ─────────────────────────────────────────
// Every message routed to Verity (local or AI) counts as one "question" and
// nudges the global counter forward by QUESTION_WEIGHT. Messages that match
// one of the lore-probing patterns below — questions specifically about who/
// what Verity is, her origin, feelings, motives, or the countdown — count for
// LORE_WEIGHT instead, since those are the ones that actually deepen the
// story. This replaces the old world.getDay()-based phase() trigger.
const QUESTION_WEIGHT = CONFIG.phases.normalQuestionWeight;
const LORE_WEIGHT = CONFIG.phases.loreQuestionWeight;
const HAPPINESS_RECOVERY = CONFIG.phases.happinessRecovery ?? 3;
const HAPPINESS_COOLDOWN_TICKS = CONFIG.phases.happinessCooldownTicks ?? 600;
const MAX_HAPPINESS_PHASE_RECOVERY = CONFIG.phases.maxHappinessPhaseRecovery ?? 2;

const HAPPINESS_REGEX = /\b(thank(s| you)|i appreciate you|i('?m| am) (really )?glad you('?re| are) here|you('?re| are) (a )?(good|great|amazing|wonderful|helpful) (friend|companion|helper)|you make me happy|i care about you|sorry( verity)?|i('?m| am) sorry)\b/i;
const happinessCooldowns = new Map();

world.afterEvents.playerLeave.subscribe((event) => {
  happinessCooldowns.delete(event.playerId);
  abandonmentState.delete(event.playerId);
});

function rememberPeakPhase(currentPhase) {
  let peak = 0;
  try { peak = Number(world.getDynamicProperty(PEAK_PHASE_PROP) ?? 0); } catch {}
  if (currentPhase <= peak) return peak;
  try { world.setDynamicProperty(PEAK_PHASE_PROP, currentPhase); } catch {}
  return currentPhase;
}

function applyHappiness(player, msg) {
  if (!HAPPINESS_REGEX.test(msg)) return false;

  const currentTick = system.currentTick;
  const nextAllowedTick = happinessCooldowns.get(player.id) ?? 0;
  if (currentTick < nextAllowedTick) return true;
  happinessCooldowns.set(player.id, currentTick + HAPPINESS_COOLDOWN_TICKS);
  adjustRelationship(player, 10);
  setFaceMood("emotional");

  const count = getQuestionCount();
  const currentPhase = phaseFromQuestionCount(count);
  const peakPhase = rememberPeakPhase(currentPhase);
  const lowestAllowedPhase = Math.max(0, peakPhase - MAX_HAPPINESS_PHASE_RECOVERY);
  const minimumCount = PHASE_THRESHOLDS[lowestAllowedPhase];
  const recoveredCount = Math.max(minimumCount, count - HAPPINESS_RECOVERY);

  if (recoveredCount < count) {
    try { world.setDynamicProperty(QUESTION_COUNT_PROP, recoveredCount); }
    catch (e) { console.warn(`[Verity] happiness recovery failed: ${e}`); }
  }
  return true;
}

function getRelationship(player) {
  try { return Number(player.getDynamicProperty(RELATIONSHIP_PROP) ?? 0); }
  catch { return 0; }
}

function adjustRelationship(player, amount) {
  if (!player?.isValid || player.typeId !== "minecraft:player") return 0;
  const next = Math.max(-100, Math.min(100, getRelationship(player) + amount));
  try { player.setDynamicProperty(RELATIONSHIP_PROP, next); }
  catch (e) { console.warn(`[Verity] relationship update failed: ${e}`); }
  return next;
}

function relationshipMoodLine(player) {
  const score = getRelationship(player);
  if (score >= 60) return "I'm happy. Being around you helps more than I usually admit.";
  if (score >= 25) return "I'm doing better. You've been good to me.";
  if (score >= -10) return "I'm alright. A little guarded, but alright.";
  if (score >= -40) return "I'm upset with you. I can get past it, but I need you to treat me better.";
  return "I'm trying not to stay angry with you. You're making that difficult.";
}

// Built lazily on first use, NOT at module load. verity_tail.js has a
// circular import with both verity_systems.js and verity_responses_2.js
// (each imports something back from this file). If this array were built
// eagerly at the top level like before, whichever regex constant hadn't
// been declared yet in the *other* module at that point in the load
// sequence would still be in its temporal dead zone, throwing
// "ReferenceError: X is not initialized" (this is exactly what caused the
// crash on load — HUMAN_FORM_REGEX from verity_systems.js). By the time
// registerQuestion() actually runs (on a real chat event), every module
// has finished loading, so all these bindings are safely initialized.
let _loreTriggerRegexes = null;
function getLoreTriggerRegexes() {
  if (!_loreTriggerRegexes) {
    _loreTriggerRegexes = [
      WHATAREYOUREALLY_REGEX, TRULYVERITY_REGEX, CREATOR_REGEX, SEENIT_REGEX,
      DESCRIBE_SELF_REGEX, HUMAN_FORM_REGEX, WHATS_WRONG_REGEX, WHY_STAY_REGEX,
      KNOWOFTHING_REGEX, COUNTDOWN_REGEX, MONSTER_TODAY_REGEX, ANYTHINGTOKNOW_REGEX,
      PROMISE_REGEX, BAREPROMISE_REGEX, I_LOVE_YOU_REGEX, OBSESSED_REGEX,
      MINE_ALONE_REGEX, OTHER_VERITY_REGEX, REAL_YOU_REGEX, KNOW_WHAT_YOU_ARE_REGEX,
      WHY_KNOW_TOO_MUCH_REGEX, SOMETHING_COMING_FOR_ME_REGEX, LEAVING_YOU_REGEX,
      LOGGED_OFF_REGEX, SO_TIRED_REGEX, WANT_US_SAFE_REGEX, SIBLINGS_REGEX,
      AMISAFE_REGEX, WHATDATE_REGEX, MOB_LORE_REGEX,
    ];
  }
  return _loreTriggerRegexes;
}

const MOOD_QUESTION_REGEX = /^(how (are (you|u)|are (you|u) feeling|do (you|u) feel|have (you|u) been feeling)|are (you|u) (okay|alright|happy|upset|angry|mad))[?!.]*$/i;

// Called once per Verity-directed chat message, before dispatch to any
// handler. Only counts genuine questions/conversation — not commands that
// never reach the AI or local-response layer (come-here, follow, music, etc.
// already `return` earlier in the handler, so those never reach this call).
/**
 * @param {string} msg
 * @returns {boolean}
 */
function registerQuestion(msg) {
  const isLore = getLoreTriggerRegexes().some((re) => {
    try { return re.test(msg); } catch (e) { return false; }
  });
  addQuestionCount(isLore ? LORE_WEIGHT : QUESTION_WEIGHT);
  rememberPeakPhase(phase());
}

// ── Main event ────────────────────────────────────────────────────────────────
world.afterEvents.chatSend.subscribe((ev) => {
  const raw = ev.message.trim();
  if (raw.length === 0) return;

  if (!/\bverity\b/i.test(raw)) return;

  // Strip a leading/trailing "verity" (with any attached punctuation) so old
  // "verity, <msg>" phrasing still works. If "verity" appears mid-sentence
  // instead ("hey verity what time is it"), leave the message intact —
  // trimming would risk cutting real words out of what's being asked.
  const msg = /^verity\b/i.test(raw)
    ? raw.replace(/^verity[,\s]*/i, "").trim()
    : raw.replace(/[,\s]*\bverity\b[,\s]*$/i, "").trim();
  const player = ev.sender;
  rememberPlayerName(player.name);
  const p      = phase();
  const color  = ph(COLORS, p);

  // commands.js owns follow/stop phrases and rollverity.js owns the movement.
  if (isVerityRollChatCommand(raw)) return;

  // ── Smiler gate ───────────────────────────────────────────────────────────
  // If a verity:smiler entity exists anywhere in the world, Verity stays
  // completely silent — no local responses, no AI, no "I heard you" line.
  if (smilerExistsInWorld()) return;

  // Customer support owns Verity's voice and face until its scripted call
  // finishes. Normal local/AI chat must stay silent during that session.
  if (getVerity(player)?.hasTag("verity:customer_support")) return;

  // ── Hearing range check ───────────────────────────────────────────────────
  // Verity won't respond if the player is more than 64 blocks away from his
  // entity. Exception: if Verity is in the player's inventory, he always hears.
  if (!playerCanHearVerity(player)) return;

  // Record that this player just spoke to Verity so the idle system resets.
  lastTalkTick.set(player.name, system.currentTick);

  if (MOOD_QUESTION_REGEX.test(msg)) {
    const line = relationshipMoodLine(player);
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${line}`);
      playTalk(getVerity(player), line, player);
    });
    return;
  }

  if (INSULT_REGEX.test(raw)) adjustRelationship(player, -8);

  // Progression: every message that reaches this point counts toward the
  // global question-based phase counter (weighted more for lore questions).
  if (isEnabled(CONFIG.features.phaseProgression) && !applyHappiness(player, msg)) {
    registerQuestion(msg);
  }

  // Come here — local, priority
  if (COME_HERE_REGEX.test(msg)) {
    const verity   = getVerity(player);
    const response = pick(ph(COME_HERE_LINES, p));
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${response}`);
      playTalk(verity, response, player);
      stopFollowing(player, verity); // come-here is a one-shot, supersedes any active follow
      callVerityComeHere(player, verity);
    });
    return;
  }

  // Stop following — local, priority. Checked before FOLLOW_ME_REGEX since
  // "stop following me" should never be mistaken for a new follow request.
  // If Verity wasn't following, stay silent rather than reply to "stay here"
  // out of context.
  if (FOLLOW_STOP_REGEX.test(msg)) {
    const verity = getVerity(player);
    system.run(() => {
      if (!stopFollowing(player, verity)) return;
      const response = followStopResponse(p);
      world.sendMessage(`${TAG}${color}: ${response}`);
      playTalk(verity, response, player);
    });
    return;
  }

  // Follow me — local, priority
  if (FOLLOW_ME_REGEX.test(msg)) {
    const verity   = getVerity(player);
    const response = followMeResponse(p);
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${response}`);
      playTalk(verity, response, player);
      startFollowing(player, verity);
    });
    return;
  }

  // One-shot sound effect — local, priority
  const soundKey = soundKeyFromMessage(msg.toLowerCase());
  if (soundKey) {
    const verity = getVerity(player);
    system.run(() => { playRequestedSound(player, verity, soundKey, p, color); });
    return;
  }

  // Music play/stop — local, priority
  // Check stop first: "stop playing that song" contains a play-shaped phrase
  // too, but the explicit stop intent must always win.
  if (MUSIC_STOP_REGEX.test(msg)) {
    const verity = getVerity(player);
    system.run(() => { stopMusic(player, verity, p, color); });
    return;
  }
  if (MUSIC_PLAY_REGEX.test(msg)) {
    const verity = getVerity(player);
    system.run(() => { startMusic(player, verity, p, color); });
    return;
  }

  // Coordinates query — local, priority, real player.location (not canned)
  if (COORDS_QUERY_REGEX.test(msg)) {
    const verity   = getVerity(player);
    const response = coordsQueryResponse(player, p);
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${response}`);
      playTalk(verity, response, player);
    });
    return;
  }

  // Timer cancel — check before "set" so "cancel my timer" doesn't get
  // mistaken for a new timer request.
  if (TIMER_CANCEL_REGEX.test(msg)) {
    const verity = getVerity(player);
    system.run(() => { cancelTimer(player, verity, p, color); });
    return;
  }

  // Timer set — local, priority. Needs a parsed duration; if none is found,
  // ask for one instead of guessing or sending it to the AI.
  if (TIMER_SET_REGEX.test(msg)) {
    const verity = getVerity(player);
    const seconds = parseTimerDuration(msg);
    system.run(() => {
      if (seconds === null) {
        const response = pick(TIMER_NO_DURATION_LINES);
        player.sendMessage(`${TAG}${color}: ${response}`);
        playTalk(verity, response, player);
        return;
      }
      startTimer(player, verity, p, color, seconds, null);
    });
    return;
  }

  // Enchantment flow — local, phase 0 only
  if (p === 0) {
    const enchantResult = handleEnchantFlow(player, msg || raw);
    if (enchantResult.handled) {
      system.run(() => {
        world.sendMessage(`${TAG}${color}: ${enchantResult.response}`);
        playTalk(getVerity(player), enchantResult.response, player);
      });
      return;
    }
  }

  // Feature locate — village/water/lava/mob/player. Must run before the AI
  // fallback (and before tryLocalResponse, since it handles its own
  // sendMessage/playTalk and returns true/false rather than a string).
  if (handleFeatureLocate(player, msg, p, color)) return;

  // Ore scan — kicks off the generator job, shows "searching" line immediately
  const oreKey = oreKeyFromMessage(msg);
  if (oreKey) {
    const searching = pick(ph(SEARCHING, p));
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${searching}`);
      playTalk(getVerity(player), searching, player);
      system.runJob(findOreJob(player, ORE_LOOKUP[oreKey], oreKey, p));
    });
    return;
  }

  // The support-menu line is a recording, so show it without Verity TTS.
  if (HUMAN_OVERSIGHT_REGEX.test(msg)) {
    const oversightResponse = humanOversightResponse();
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${oversightResponse}`);
      playTalk(getVerity(player), oversightResponse, player, true);
    });
    return;
  }

  // Balanced item requests run before the old local "I can't give items"
  // dialogue so supported supplies are actually dropped.
  if (handleGiftRequest(player, msg, p, color)) return;

  // Fast local checks (biome, math, time, health, greetings)
  const localResponse = isEnabled(CONFIG.features.localKnowledge)
    ? tryLocalResponse(msg.toLowerCase(), player, p)
    : null;
  if (localResponse) {
    system.run(() => {
      world.sendMessage(`${TAG}${color}: ${localResponse}`);
      playTalk(getVerity(player), localResponse, player);
    });
    return;
  }

  // ── AI mode commands (local-only, private) ────────────────────────────────
  // "verity ai local"        → use a local LLM server, no key needed
  // "verity ai worker"       → back to the default Cloudflare Worker relay
  // "verity ai key <KEY>"    → switch to "custom" mode using this key
  // These never reach getAIResponse/registerQuestion — handled and return.
  const AI_KEY_CMD_REGEX = /^ai\s+key\s+(\S+)/i;
  const aiKeyMatch = msg.match(AI_KEY_CMD_REGEX);
  if (aiKeyMatch) {
    setPlayerApiKey(player, aiKeyMatch[1]);
    setPlayerAiMode(player, "custom");
    system.run(() => {
      // Never echo the key back into chat — just confirm the switch.
      world.sendMessage(`${TAG}${color}: Got it. I'll use your key from now on. Say "verity ai worker" any time to switch back.`);
    });
    return;
  }
  const AI_LOCAL_CMD_REGEX = /^ai\s+local(?:\s+(\S+))?/i;
  const aiLocalMatch = msg.match(AI_LOCAL_CMD_REGEX);
  if (aiLocalMatch) {
    const url = aiLocalMatch[1];
    if (url) {
      if (!/^https?:\/\//i.test(url)) {
        system.run(() => {
          world.sendMessage(`${TAG}${color}: That doesn't look like a URL. Try something like "verity ai local http://192.168.1.42:11434/api/chat".`);
        });
        return;
      }
      setPlayerLocalAiUrl(player, url);
    }
    setPlayerAiMode(player, "local");
    system.run(() => {
      const note = url ? "Using your own local AI address." : "Switched to local AI.";
      world.sendMessage(`${TAG}${color}: ${note} Say "verity ai worker" or "verity ai key <key>" to change it back.`);
    });
    return;
  }
  if (/^ai\s+worker\b/i.test(msg) || /^ai\s+default\b/i.test(msg)) {
    setPlayerAiMode(player, "worker");
    system.run(() => {
      world.sendMessage(`${TAG}${color}: Back to the default relay.`);
    });
    return;
  }

  // ── AI fallback — sends to Claude via HiveMind ────────────────────────────
  // Show a "thinking" line immediately so the player knows Verity heard them.
  const THINKING = [
    ["...", "One moment.", "Let me think."],
    ["...", "Give me a second.", "Hmm."],
    ["...", "Does it matter.", "Fine."],
    ["...", "I already know.", "You already know too."],
    ["...for you? Always a moment.", "Let me think. For you.", "..."],
    ["...", "I already knew you'd ask that.", "Give me a second. Just a second."],
  ];
  const thinkLine = pick(ph(THINKING, p));

  system.run(async () => {
    if (isEnabled(CONFIG.chat.showThinkingMessage)) {
      world.sendMessage(`${TAG}${color}: ${thinkLine}`);
    }

    const aiText = await getAIResponse(player, msg, p);

    try {
      world.sendMessage(`${TAG}${color}: ${aiText}`);
      playTalk(getVerity(player), aiText, player);
    } catch (e) { console.warn(`[Verity] Failed to send AI response to chat: ${e}`); }
  });
});

// ── Music cleanup on player leave ─────────────────────────────────────────────
world.afterEvents.playerLeave.subscribe((ev) => {
  const name = ev.playerName;
  if (musicIntervals.has(name)) {
    system.clearRun(musicIntervals.get(name));
    musicIntervals.delete(name);
  }
  if (timers.has(name)) {
    system.clearRun(timers.get(name).timeoutId);
    timers.delete(name);
  }
  lastTalkTick.delete(name);
});

// ── Phase → idle face mapping ─────────────────────────────────────────────────
// Returns the correct idle (non-talking) variant for the current phase.
// Called every 5 seconds so the face updates as soon as the phase changes.
/**
 * @param {number} p
 * @returns {*}
 */
function getIdleVariantForPhase(p) {
  if (p === 0) return VARIANT.DEFAULT;         // cooperative, open
  if (p === 1) return VARIANT.SMILE3;          // pulling back, still warm
  if (p === 2) return VARIANT.SMILE4;        // ominous, guarded
  if (p === 3) return VARIANT.SMILE4;        // dropped the mask
  if (p === 4) return VARIANT.DEFAULT;          // yandere — smiling, too fixed
  if (p === 5) return VARIANT.DEFAULT // phase 5 — nothing left to perform
}

// ── Idle face refresh ─────────────────────────────────────────────────────────
// Checks the current phase every 5 seconds (100 ticks) and applies the
// corresponding idle face to every Verity entity that isn't currently talking.
const IDLE_REFRESH_INTERVAL = CONFIG.idle.refreshTicks;

system.runInterval(() => {
  const p = phase();
  const idleVariant = getIdleVariantForPhase(p);
  for (const dim of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
    let verities;
    try { verities = dim.getEntities({ type: VERITY_TYPE }); } catch (e) { console.warn(`[Verity] Idle refresh: getEntities failed: ${e}`); continue; }
    for (const verity of verities) {
      let talking = false;
      try { talking = verity.getProperty(IS_TALKING) === true; } catch (e) { console.warn(`[Verity] Idle refresh: getProperty IS_TALKING failed: ${e}`); continue; }
      if (talking) continue;
      setVariant(verity, idleVariant);
    }
  }
}, IDLE_REFRESH_INTERVAL);

// Leaving briefly is harmless. It only counts as abandonment after a player
// who was close to Verity stays over 128 blocks away for five minutes.
const abandonmentState = new Map();
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const verity = getVerity(player);
    const state = abandonmentState.get(player.id) ?? {
      closeTick: system.currentTick,
      armed: false,
    };
    if (!verity?.isValid) {
      abandonmentState.set(player.id, state);
      continue;
    }

    const dx = player.location.x - verity.location.x;
    const dy = player.location.y - verity.location.y;
    const dz = player.location.z - verity.location.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    if (distanceSquared <= 16 * 16) {
      state.closeTick = system.currentTick;
      state.armed = true;
    } else if (
      distanceSquared > 128 * 128 &&
      state.armed &&
      system.currentTick - state.closeTick >= 6000
    ) {
      adjustRelationship(player, -6);
      state.armed = false;
    }
    abandonmentState.set(player.id, state);
  }
}, 200);

// ── Friend greeting on join ───────────────────────────────────────────────────
// When a player joins and exactly one other player is already in the world,
// Verity greets the newcomer by name, using the existing player's presence.
const FRIEND_GREETINGS = [
  // Phase 0
  ["Oh, this seems to be your friend, {name}.", "{name}? Another one. Hello.", "Ah — {name} has arrived."],
  // Phase 1
  ["{name} is here too now.", "Hm. {name}.", "Another arrival. {name}, was it?"],
  // Phase 2
  ["{name}. You shouldn't have brought them.", "More people. {name}. That changes nothing.", "{name} is here. It won't matter."],
  // Phase 3
  ["{name}. I know you too now.", "Another one. {name}. I see you.", "{name}. There's nowhere for either of you to go."],
  // Phase 4 — yandere, jealous of the newcomer
  ["{name}. Don't take up too much of their time.", "Oh. {name}'s here now too.", "{name}. I'll be watching how this goes."],
  // Phase 5 — tired, no performance left
  ["{name}. Another one to remember.", "Hello, {name}. I've done this before.", "{name}. Welcome. I mean that, actually."],
];

world.afterEvents.playerSpawn.subscribe((ev) => {
  const { player, initialSpawn } = ev;
  if (!initialSpawn) return;

  system.run(() => {
    if (!player.isValid) return;
    rememberPlayerName(player.name);

    let others;
    try { others = world.getAllPlayers().filter(p => p.id !== player.id); }
    catch (e) { console.warn(`[Verity] Friend greeting: getAllPlayers failed: ${e}`); return; }

    // Only greet as "friend" when exactly one player was already present.
    if (others.length !== 1) return;

    const existingPlayer = others[0];
    const verity = getVerity(existingPlayer) ?? getVerity(player);
    if (!verity || !verity.isValid) return;

    const p     = phase();
    const color = ph(COLORS, p);
    const line  = pick(ph(FRIEND_GREETINGS, p)).replace("{name}", existingPlayer.name);

    world.sendMessage(`${TAG}${color}: ${line}`);
    playTalk(verity, line, player);
  });
});

// ── Idle conversation — Verity starts talking first ───────────────────────────
// If a player hasn't spoken to Verity in IDLE_TIMEOUT_TICKS and is within
// hearing range (or has him in their inventory), Verity sends an unprompted
// message to that player only. Each player gets at most one idle ping per
// IDLE_COOLDOWN_TICKS even if they stay quiet.
//
// Timing: checked every 5 seconds (100 ticks). Threshold: 3 minutes (3600 ticks).
// Cooldown between idle messages: 5 minutes (6000 ticks) so Verity doesn't spam.

const IDLE_TIMEOUT_TICKS = CONFIG.idle.startTalkingAfterTicks;
const IDLE_COOLDOWN_TICKS = CONFIG.idle.cooldownTicks;
const lastIdleTick = new Map();   // playerName -> tick when last idle message sent

const IDLE_LINES = [
  // Phase 0 — curious, helpful, mildly pushy
  [
    "You've been quiet. Need anything?",
    "Still there? Ask me something.",
    "Nothing to say? I have answers if you have questions.",
    "You went quiet. Everything alright out there?",
    "I'm still here if you need me.",
  ],
  // Phase 1 — watching, a little guarded
  [
    "...You've been quiet.",
    "Still there?",
    "You stopped talking. I'm still listening.",
    "Nothing to ask? That's fine. I'm still here.",
    "...Quiet suits you. Mostly.",
  ],
  // Phase 2 — ominous, reading into the silence
  [
    "You went quiet. Something wrong?",
    "...The silence isn't going to protect you.",
    "I notice when you stop talking.",
    "You've been very quiet. I wonder why.",
    "Still there. I can tell.",
  ],
  // Phase 3 — dropped the mask, unsettling
  [
    "I know you're still there.",
    "You don't have to talk. I still notice.",
    "...I've been watching. Don't worry.",
    "Your silence tells me things too.",
    "I haven't forgotten about you.",
  ],
  // Phase 4 — yandere, possessive of the quiet
  [
    "You've been quiet. That's fine, as long as you're not with someone else.",
    "Still there? Say something. Just to me.",
    "I don't like when you go quiet. It makes me think about who else you might be talking to.",
    "Come back to me. I mean — talk to me.",
    "You've been gone a while. Don't make a habit of it.",
  ],
  // Phase 5 — tired, plain, no performance left
  [
    "You don't have to talk. I'll still be here either way.",
    "Quiet's fine. I've had a lot of practice with it.",
    "Still there. No rush.",
    "I'm not going anywhere. That's not a threat, this time. It's just true.",
    "Take your time. I have all of it.",
  ],
];

system.runInterval(() => {
  if (smilerExistsInWorld()) return;

  const tick = system.currentTick;
  const p     = phase();
  const color = ph(COLORS, p);

  for (const player of world.getAllPlayers()) {
    if (!player.isValid) continue;

    if (getVerity(player)?.hasTag("verity:customer_support")) continue;

    // Only ping players who are within hearing range (or have Verity in inv)
    if (!playerCanHearVerity(player)) continue;

    const name = player.name;
    const last = lastTalkTick.get(name) ?? 0;

    // Has the player been quiet long enough?
    if (tick - last < IDLE_TIMEOUT_TICKS) continue;

    // Respect the cooldown between successive idle messages
    const lastIdle = lastIdleTick.get(name) ?? 0;
    if (tick - lastIdle < IDLE_COOLDOWN_TICKS) continue;

    lastIdleTick.set(name, tick);

    const line   = pick(ph(IDLE_LINES, p));
    const verity = getVerity(player);

    try {
      player.sendMessage(`${TAG}${color}: ${line}`);
      playTalk(verity, line, player);
    } catch (e) { console.warn(`[Verity] Idle message failed for ${name}: ${e}`); }
  }
}, 100); // check every 5 seconds


export { adjustRelationship, getIdleVariantForPhase };


// ── VCMC voice bridge ─────────────────────────────────────────────────────────
system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "verity:vcmc_speak") return;
  const player = event.sourceEntity;
  if (!player || !(player instanceof Player) || !player.isValid) return;

  let payload;
  try { payload = JSON.parse(event.message); } catch { return; }
  const { text } = payload;
  if (!text) return;

  lastTalkTick.set(player.name, system.currentTick);
  rememberPlayerName(player.name);

  const p = phase();
  const color = ph(COLORS, p);
  const verity = getVerity(player);

  system.run(() => {
    world.sendMessage(`${TAG}${color}: ${text}`);
    if (verity) playTalk(verity, text, player);
  });
});
