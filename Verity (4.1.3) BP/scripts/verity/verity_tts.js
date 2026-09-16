import {
    system,
    CommandPermissionLevel,
    CustomCommandParamType,
    CustomCommandStatus
} from "@minecraft/server";
import { CONFIG, isEnabled } from "./config.js";

const TTS_PROP = "verity:ttsEnabled";
const TTS_PROVIDER_PROP = "verity:ttsProvider";
const TTS_DEFAULT = true;

export function isTtsEnabled(player) {
    return player.getDynamicProperty(TTS_PROP) ?? TTS_DEFAULT;
}

export function setTtsEnabled(player, enabled) {
    player.setDynamicProperty(TTS_PROP, enabled);
}

/**
 * Get the player's TTS provider preference.
 * Returns "local", "fish", or "both".
 */
export function getTtsProvider(player) {
    const stored = player.getDynamicProperty(TTS_PROVIDER_PROP);
    if (stored) return stored;
    // Fall back to global config default
    return CONFIG.fishAudio?.provider || "local";
}

export function setTtsProvider(player, provider) {
    player.setDynamicProperty(TTS_PROVIDER_PROP, provider);
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerEnum("verity:ttsState", ["on", "off"]);
    customCommandRegistry.registerEnum("verity:ttsProvider", ["local", "fish", "both"]);

    customCommandRegistry.registerCommand(
        {
            name: "verity:tts",
            description: "Toggle Verity's spoken voice on/off",
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
                { name: "state", type: CustomCommandParamType.Enum, enumName: "verity:ttsState" }
            ]
        },
        (origin, state) => {
            const player = origin.sourceEntity;
            if (!player) return { status: CustomCommandStatus.Failure, message: "Must be run by a player." };

            setTtsEnabled(player, state === "on");
            return { status: CustomCommandStatus.Success, message: `Verity's voice is now ${state}.` };
        }
    );

    customCommandRegistry.registerCommand(
        {
            name: "verity:tts_provider",
            description: "Switch TTS engine: local (phonemes), fish (Fish.audio), or both",
            permissionLevel: CommandPermissionLevel.Any,
            mandatoryParameters: [
                { name: "provider", type: CustomCommandParamType.Enum, enumName: "verity:ttsProvider" }
            ]
        },
        (origin, provider) => {
            const player = origin.sourceEntity;
            if (!player) return { status: CustomCommandStatus.Failure, message: "Must be run by a player." };

            setTtsProvider(player, provider);
            const note = provider === "fish"
                ? "Using Fish.audio TTS. Open the companion player in your browser to hear Verity's voice."
                : provider === "both"
                ? "Using both local and Fish.audio TTS."
                : "Using local phoneme TTS.";
            return { status: CustomCommandStatus.Success, message: note };
        }
    );
});
