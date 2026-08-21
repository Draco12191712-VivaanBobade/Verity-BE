// ============================================================
// The Shattered Command (The Broken Script)
// Copyright (c) 2025 The Writers of the Command
// All Rights Reserved.
//
// Unauthorized copying, redistribution, or modification of
// this file or any part of this project, via any medium,
// is strictly prohibited without prior written permission.
//
// CurseForge : https://www.curseforge.com/minecraft-bedrock/addons/the-shattered-command
// Discord    : https://discord.gg/affh5Xdvcg
// ============================================================

import { world, system } from "@minecraft/server";
import { safeKick } from "./safe_kick.js";

// ── Banned player list ────────────────────────────────────────
const BANNED_PLAYERS = new Set([
    "Joni2608",
    "YaelGuerra6670",
    "NTHEe",
    "TheMikeosas230",
    "SpiralGrain7494",
     "BeetlePlayz7202",
     "POCHOLO20110",
     "THEbrownie25479",
     "Santas 23158",
     "Elpanbimbo3601",
     "DekkyGaming",
]);

// ── Manual kick via script event ─────────────────────────────
// Usage: /scriptevent thebrokenscript:kick
// Must be triggered by or targeting a player entity.
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "thebrokenscript:kick") return;

    const entity = event.sourceEntity;
    if (!entity || entity.typeId !== "minecraft:player") return;

    const player = world.getPlayers().find((p) => p.id === entity.id);
    if (player) {
        safeKick(player, "You were removed from this world.");
    }
});

// ── Auto-kick banned players on join ─────────────────────────
world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return; // only fire on first spawn (join)

    const player = event.player;
    if (BANNED_PLAYERS.has(player.name)) {
        // Defer one tick so the player fully loads before the kick.
        system.run(() => {
            safeKick(player, "You are not permitted to join this world.");
        });
    }
});
