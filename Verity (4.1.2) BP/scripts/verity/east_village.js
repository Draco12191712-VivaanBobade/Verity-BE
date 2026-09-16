import { world, system } from "@minecraft/server";

/**
 * Verity — Eastward Village Clear System
 *
 * BEDROCK LIMITATION: There is no structure-query API for villages
 * (no equivalent to Java's Level#findNearestMapStructure). Villages
 * are NOT directly queryable. This system detects a village INDIRECTLY
 * by checking whether any village-associated entities exist within a
 * fixed radius to the east of the player. If so, that whole radius is
 * treated as "the village" and cleared.
 *
 * Trigger: every 30s (600 ticks) per player, automatically.
 * Check/clear radius: 64 blocks, centered on a point 64 blocks east
 * of the player (so the check area sits entirely in the +X hemisphere).
 */

const VILLAGE_CHECK_RADIUS = 64; // Radius to check for villagers (village indicator)
const RUN_INTERVAL_TICKS = 600; // 30s at 20 tps

// Verity's own entity identifier — always excluded from detection/removal.
const VERITY_TYPE_ID = "verity:verity";

// All entity identifiers considered "village related."
// villager_v2 = modern villager. Legacy "minecraft:villager" id is
// kept for safety on worlds/behavior packs still spawning the old id.
const VILLAGE_ENTITY_TYPES = [
    "minecraft:villager_v2",
    "minecraft:villager",
    "minecraft:zombie_villager_v2",
    "minecraft:iron_golem",
    "minecraft:cat",
    "minecraft:wandering_trader",
    "minecraft:trader_llama",
];

/**
 * EntityQueryOptions only supports a single `type: string`, not a
 * `types: string[]` array — that property doesn't exist on the
 * interface and is silently ignored if passed. There's no native
 * "match any of N types" filter, so we run one query per type and
 * merge results.
 */
function getVillageEntities(dimension, queryBase) {
    const results = [];
    for (const type of VILLAGE_ENTITY_TYPES) {
        const found = dimension.getEntities({ ...queryBase, type });
        results.push(...found);
    }
    return results;
}

/**
 * Checks a single fixed radius east of the player for village entities.
 * If any are found (excluding Verity), clears all village entities in
 * that same radius.
 */
function clearEastVillage(player) {
    const dimension = player.dimension;
    const origin = player.location;

    // Check point sits VILLAGE_CHECK_RADIUS blocks east of the player,
    // keeping the whole check area in the +X hemisphere.
    const checkPoint = {
        x: origin.x + VILLAGE_CHECK_RADIUS,
        y: origin.y,
        z: origin.z,
    };

    const found = getVillageEntities(dimension, {
        location: checkPoint,
        maxDistance: VILLAGE_CHECK_RADIUS,
    }).filter((entity) => entity.isValid && entity.typeId !== VERITY_TYPE_ID);

    if (found.length === 0) {
        return; // No village detected to the east within range.
    }

    let removedCount = 0;
    for (const entity of found) {
        if (!entity.isValid) continue;
        if (entity.typeId === VERITY_TYPE_ID) continue; // belt-and-suspenders
        try {
            entity.remove();
            removedCount++;
        } catch {
            // Entity may have despawned between query and removal; ignore.
        }
    }

    if (removedCount > 0) {
        console.warn(
            `[Verity] The village to the east has been silenced. (${removedCount} removed)`
        );
    }
}

// --- Periodic trigger: runs every 30s for every online player ---
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        clearEastVillage(player);
    }
}, RUN_INTERVAL_TICKS);
