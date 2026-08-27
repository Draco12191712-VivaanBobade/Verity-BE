// ─────────────────────────────────────────────────────────────────────────────
// verity_tts_fish.js — Fish.audio TTS via HivemindAPI
//
// Sends Verity's spoken text to your server endpoint.
// Your server calls Fish.audio and plays the audio through OS speakers.
// No sound slots, no resource pack file swapping needed.
//
// Requires script debugger connected (same as api.js).
// ─────────────────────────────────────────────────────────────────────────────

import { world } from "@minecraft/server";
import { HivemindAPI } from "./api.js";
import { CONFIG, isEnabled } from "./config.js";

const ttsApi = new HivemindAPI("verity_tts", {
    namespace: "hivemind",
    scriptEvent: true,
    logFailures: true,
});

const recentTexts = new Map();

export function speakFish(player, text) {
    if (!player || !text) return;
    if (!isEnabled(CONFIG.fishAudio?.enabled)) return;

    const clean = text.replace(/§[0-9a-fk-or]/gi, "").trim();
    if (!clean) return;

    const last = recentTexts.get(player.id);
    if (last === clean) return;
    recentTexts.set(player.id, clean);

    const url = CONFIG.ai?.workerUrl || CONFIG.fishAudio?.workerUrl || "";
    if (!url) {
        console.warn("[Verity Fish TTS] No worker URL configured.");
        return;
    }

    ttsApi.sendHttpRequest(url + "/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            playerId: player.id,
            playerName: player.name,
            text: clean,
            voiceId: CONFIG.fishAudio?.voiceId || "",
            model: CONFIG.fishAudio?.model || "s2.1-pro-free",
        }),
    }, 100).catch((e) => {
        console.warn(`[Verity Fish TTS] Request failed: ${e.message || e}`);
    });
}

export function clearFishQueue() {}
