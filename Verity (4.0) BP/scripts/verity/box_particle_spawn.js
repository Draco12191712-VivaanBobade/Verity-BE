import { world, system } from "@minecraft/server";

const INWARDS_BURST_DELAY  = Math.round(3.13 * 20); // 63 ticks
const OUTWARDS_BURST_DELAY = Math.round(3.92 * 20); // 78 ticks
const BURST_OFFSET_Y       = 1.8;

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "verity:box_opening") return;

    const box = event.sourceEntity;
    if (!box || !box.isValid) return;

    const loc = { ...box.location };
    const dim = box.dimension;

    system.runTimeout(() => {
        if (!box.isValid) return;
        dim.spawnParticle("verity:inward_burst", {
            x: loc.x,
            y: loc.y + BURST_OFFSET_Y,
            z: loc.z,
        });
    }, INWARDS_BURST_DELAY);

    system.runTimeout(() => {
        if (!box.isValid) return;
        dim.spawnParticle("verity:outward_burst", {
            x: loc.x,
            y: loc.y + BURST_OFFSET_Y,
            z: loc.z,
        });
    }, OUTWARDS_BURST_DELAY);
}, { namespaces: ["verity"] });