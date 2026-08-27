import { world, system } from "@minecraft/server";

const BOX_SPAWNED_KEY = "verity:boxSpawned"; // now a WORLD-level flag
const MAX_UP_CHECKS = 40;

world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return;

    // Global gate: if ANY player has ever triggered the spawn, stop here.
    if (world.getDynamicProperty(BOX_SPAWNED_KEY) === true) return;

    const player = event.player;

    system.run(() => {
        if (!player.isValid) return;

        // Re-check after the tick delay in case two players spawned the
        // same tick and both passed the check above before either could write.
        if (world.getDynamicProperty(BOX_SPAWNED_KEY) === true) return;

        // Claim the flag immediately, before any block scanning/spawning,
        // so a second player's system.run callback (already queued) sees
        // it set the instant this one runs.
        world.setDynamicProperty(BOX_SPAWNED_KEY, true);

        const loc = player.location;
        const dir = player.getViewDirection();
        const dimension = player.dimension;

        const flatX = dir.x;
        const flatZ = dir.z;
        const length = Math.sqrt(flatX * flatX + flatZ * flatZ);

        const normX = length > 0.001 ? flatX / length : 0;
        const normZ = length > 0.001 ? flatZ / length : 1;

        const spawnPos = {
            x: loc.x + normX * 5,
            y: loc.y,
            z: loc.z + normZ * 5
        };

        const blockX = Math.floor(spawnPos.x);
        const blockZ = Math.floor(spawnPos.z);
        let spawnY = Math.floor(spawnPos.y);

        try {
            for (let i = 0; i < MAX_UP_CHECKS; i++) {
                const block = dimension.getBlock({ x: blockX, y: spawnY, z: blockZ });
                if (!block || block.isAir) break;
                spawnY += 1;
            }
        } catch {
            // keep last resolved spawnY
        }

        spawnPos.y = spawnY;

        dimension.spawnEntity("verity:box", spawnPos);
    });
});
