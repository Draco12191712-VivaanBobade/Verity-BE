import { system } from "@minecraft/server";
import { textToPhonemeSequence } from "./verity_phonemes.js";

// Duration (ms) per phoneme clip. Script API has no "sound finished" event,
// so these are hardcoded and must match the ACTUAL trimmed clip length or
// playback will overlap (too short) or leave gaps (too long).
//
// PLACEHOLDER VALUES — measured from the raw untrimmed Fish Audio exports
// (full carrier words, not isolated phonemes). Re-measure with ffprobe
// after trimming each .ogg down to just the target sound and replace
// every value below before shipping.
const PHONEME_DURATIONS_MS = {
    p:569, b:595, t:465, d:595, k:517, g:569,
    f:465, v:648, th:412, dh:648,
    s:177, z:244, sh:517, zh:648, ch:230, jh:569,
    m:778, n:830, ng:648, l:517, r:517, w:648, y:648, h:778,
    aa:595, ae:648, ah:517, ao:648, eh:465, er:465, ey:595,
    ih:569, iy:569, ow:595, uw:517, uh:465, ay:517, aw:465, oy:648
};

// Duration (ms) per DIPHONE clip, keyed by the same id used in DIPHONES
// in verity_phonemes.js (e.g. "p-aa"). Measure with ffprobe after trimming
// each diphone clip at its steady-state cut points — do not guess these.
// A diphone entry with no duration here falls back to DEFAULT_DUR_MS,
// which will almost certainly be wrong, so keep this in sync with
// verity_phonemes.js's DIPHONES map as you add clips.
const DIPHONE_DURATIONS_MS = {
    "aa-r": 477,
    "ae-k": 409,
    "ae-l": 375,
    "ae-m": 720,
    "ae-n": 720,
    "ae-s": 720,
    "ae-t": 580,
    "ah-n": 382,
    "ao-m": 459,
    "ao-n": 697,
    "ao-r": 534,
    "ao-s": 476,
    "ao-t": 244,
    "b-eh": 906,
    "d-ao": 766,
    "d-eh": 355,
    "d-ih": 411,
    "eh-d": 459,
    "eh-k": 458,
    "eh-l": 377,
    "eh-n": 409,
    "eh-s": 464,
    "er-eh": 477,
    "f-ao": 291,
    "h-ae": 580,
    "ih-k": 520,
    "ih-l": 369,
    "ih-m": 405,
    "ih-n": 720,
    "ih-ng": 233,
    "ih-s": 580,
    "ih-t": 348,
    "iy-d": 477,
    "k-ae": 377,
    "k-ao": 369,
    "k-eh": 520,
    "k-w": 345,
    "l-ao": 506,
    "l-eh": 377,
    "l-ih": 459,
    "l-l": 308,
    "l-ay": 510,
    "m-ae": 509,
    "m-ao": 509,
    "m-eh": 697,
    "n-ao": 534,
    "n-d": 375,
    "n-eh": 383,
    "n-ow": 766,
    "n-t": 283,
    "r-ae": 373,
    "r-eh": 358,
    "r-iy": 475,
    "s-ae": 474,
    "s-ao": 720,
    "s-eh": 410,
    "s-t": 306,
    "t-ae": 344,
    "t-ao": 627,
    "t-eh": 357,
    "t-ih": 377,
    "dh-ae": 374,
    "dh-ah": 534,
    "dh-ih": 409,
    "v-eh": 306,
    "v-er": 506,
    "w-ae": 530,
    "w-ao": 527,
    "w-eh": 580,
    "y-aw": 766,
};

const DEFAULT_DUR_MS = 180;

// Pause timing (between units, between words, after punctuation) is set
// in verity_phonemes.js's textToPhonemeSequence() — nothing to configure here.

const activeRuns = new Map(); // playerId -> array of scheduled runTimeout ids

/**
 * Speaks `text` for `player` by sequencing pre-registered phoneme/diphone
 * sounds (verity.phoneme.<id> or verity.diphone.<id> in
 * sound_definitions.json). Cancels any speech already in progress for
 * this player first.
 * @param {import("@minecraft/server").Player} player
 * @param {string} text
 */
export function speakLocal(player, text) {
    stopSpeaking(player);

    const sequence = textToPhonemeSequence(text);
    const timeoutIds = [];
    let delayMs = 0;

    for (const { unit, isDiphone, pauseAfterMs } of sequence) {
        if (unit) {
            const soundId = isDiphone ? `verity.diphone.${unit}` : `verity.phoneme.${unit}`;
            const durTable = isDiphone ? DIPHONE_DURATIONS_MS : PHONEME_DURATIONS_MS;
            const dur = durTable[unit] ?? DEFAULT_DUR_MS;
            const scheduledDelay = delayMs;

            const id = system.runTimeout(() => {
                try {
                    player.dimension.playSound(soundId, player.location, { volume: 1, pitch: 1 });
                } catch (e) {
                    console.warn(`[Verity TTS] playSound failed for ${soundId}: ${e}`);
                }
            }, msToTicks(scheduledDelay));

            timeoutIds.push(id);
            delayMs += dur;
        }
        delayMs += pauseAfterMs;
    }

    activeRuns.set(player.id, timeoutIds);
}

/**
 * Cancels any speech currently scheduled/playing for this player.
 * Call this on entity despawn/death and on player leave so timeouts
 * don't fire into an invalid entity or disconnected player.
 * @param {import("@minecraft/server").Player} player
 */
export function stopSpeaking(player) {
    const ids = activeRuns.get(player.id);
    if (!ids) return;
    for (const id of ids) system.clearRun(id);
    activeRuns.delete(player.id);
}

function msToTicks(ms) {
    return Math.max(0, Math.round(ms / 50)); // 1 tick = 50ms
}
