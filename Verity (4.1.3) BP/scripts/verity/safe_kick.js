// ============================================================
// Verity — safe_kick.js
//
// @minecraft/server-admin (and its kickPlayer export) is ONLY
// available when the world is running on a Bedrock Dedicated
// Server. On a normal world/Realm, importing it statically
// throws at module-load time and — because main.js chain-imports
// every script — takes the ENTIRE addon down before anything
// runs. This module isolates that risk behind a dynamic import
// so a missing server-admin module degrades gracefully instead
// of crashing every script that touches it.
// ============================================================

let adminKickPlayer = null;
let loadAttempted = false;

async function loadAdminKick() {
    if (loadAttempted) return;
    loadAttempted = true;
    try {
        const mod = await import("@minecraft/server-admin");
        adminKickPlayer = mod.kickPlayer;
    } catch (e) {
        console.warn(
            "[Verity] @minecraft/server-admin is unavailable (not running on a Bedrock Dedicated Server) — kick-based features are disabled on this platform."
        );
    }
}

// Kick off the load immediately; callers don't need to await this,
// they just call safeKick() which checks whether it resolved yet.
loadAdminKick();

/**
 * Attempts to kick a player. Returns true if the kick call was made,
 * false if the admin module isn't available on this platform or the
 * call itself failed (both cases are logged, never thrown).
 * @param {import("@minecraft/server").Player} player
 * @param {string} reason
 */
export function safeKick(player, reason) {
    if (!adminKickPlayer) {
        console.warn(
            `[Verity] Cannot kick ${player?.name ?? "player"}: @minecraft/server-admin is not available on this platform.`
        );
        return false;
    }
    try {
        adminKickPlayer(player, reason);
        return true;
    } catch (e) {
        console.warn(`[Verity] kickPlayer failed for ${player?.name ?? "player"}: ${e}`);
        return false;
    }
}
