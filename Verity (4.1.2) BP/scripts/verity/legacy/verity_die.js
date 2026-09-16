import { world, system } from "@minecraft/server";

const VERITY_TYPE = "verity:verity";
const RESPAWN_DELAY_TICKS = 20; // 1 second

world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity } = event;

    if (!deadEntity || deadEntity.typeId !== VERITY_TYPE) return;

    // Capture location/dimension while the reference is still valid this tick
    const location = deadEntity.location;
    const dimension = deadEntity.dimension;

    system.runTimeout(() => {
        dimension.spawnEntity(VERITY_TYPE, location);
    }, RESPAWN_DELAY_TICKS);
});