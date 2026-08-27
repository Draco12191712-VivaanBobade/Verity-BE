import { world, system } from "@minecraft/server";
import { VARIANT, setVariant, getVariant } from "./verity_systems.js";
import { currentDay } from "./verity_core.js";

const DESPAWN_RADIUS = 15;     // blocks
const DESPAWN_SECONDS = 20;    // seconds player must remain in radius
const CHECK_INTERVAL = 20;     // ticks (1 second)
const REQUIRED_TICKS = DESPAWN_SECONDS; // since check runs once per second

system.runInterval(() => {
    for (const dim of [
        world.getDimension("overworld"),
        world.getDimension("nether"),
        world.getDimension("the_end")
    ]) {
        const verityEntities = dim.getEntities({ type: "verity:smiler" });

        for (const verity of verityEntities) {
            if (!verity.isValid) continue;

            const nearbyPlayers = dim.getPlayers({
                location: verity.location,
                maxDistance: DESPAWN_RADIUS
            });

            let nearTicks = verity.getDynamicProperty("verity:near_ticks");
            if (typeof nearTicks !== "number") nearTicks = 0;

            if (nearbyPlayers.length > 0) {
                nearTicks++;

                if (nearTicks >= REQUIRED_TICKS) {
                    verity.remove();
                    continue; // entity gone, skip setting property on it
                }

                verity.setDynamicProperty("verity:near_ticks", nearTicks);
            } else if (nearTicks !== 0) {
                // Reset if player leaves radius before 20s elapses
                verity.setDynamicProperty("verity:near_ticks", 0);
            }
        }
    }
}, CHECK_INTERVAL);
