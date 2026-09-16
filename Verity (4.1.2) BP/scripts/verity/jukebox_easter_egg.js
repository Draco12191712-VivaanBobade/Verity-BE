// scripts/jukebox_easter_egg.js
import { world, system } from "@minecraft/server";

const SOUND_ID = "chrmbchrmb_matrix"; // must match sound_definitions.json
const TRIGGER_CHANCE = 0.04; // 4%
const SOUND_DURATION_TICKS = 2240; // measured 110.98s, plus a small cleanup margin

let activeMatrix = null;

function sameBlock(block, active) {
    return (
        active &&
        block.dimension.id === active.dimensionId &&
        Math.floor(block.location.x) === active.x &&
        Math.floor(block.location.y) === active.y &&
        Math.floor(block.location.z) === active.z
    );
}

function stopMatrix() {
    if (!activeMatrix) return false;
    if (activeMatrix.timeoutId !== undefined) {
        try { system.clearRun(activeMatrix.timeoutId); } catch {}
    }
    for (const listener of world.getAllPlayers()) {
        try {
            listener.stopSound(SOUND_ID);
        } catch {
            try { listener.runCommand(`stopsound @s ${SOUND_ID}`); } catch {}
        }
    }
    activeMatrix = null;
    return true;
}

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, player, isFirstEvent, beforeItemStack } = event;

    // Only fire once per press, not every tick while held
    if (!isFirstEvent) return;

    // Only on jukeboxes, only when the player's hand is empty
    // (empty hand = "pressing" it rather than inserting a disc)
    if (block.typeId !== "minecraft:jukebox") return;
    if (beforeItemStack !== undefined) return;

    // Pressing the same active jukebox again stops the Matrix easter egg.
    if (sameBlock(block, activeMatrix)) {
        system.run(stopMatrix);
        return;
    }

    // Only one Matrix instance may exist at once, so separate jukeboxes
    // cannot stack overlapping copies.
    if (activeMatrix) return;

    if (Math.random() < TRIGGER_CHANCE) {
        system.run(() => {
            player.dimension.playSound(SOUND_ID, block.location, {
                volume: 1,
                pitch: 1
            });
            const timeoutId = system.runTimeout(() => {
                activeMatrix = null;
            }, SOUND_DURATION_TICKS);
            activeMatrix = {
                dimensionId: block.dimension.id,
                x: Math.floor(block.location.x),
                y: Math.floor(block.location.y),
                z: Math.floor(block.location.z),
                timeoutId,
            };
        });
    }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    if (!activeMatrix) return;
    if (event.brokenBlockPermutation?.type?.id !== "minecraft:jukebox") return;
    if (!sameBlock(event.block, activeMatrix)) return;
    system.run(stopMatrix);
});
