import {
  CommandPermissionLevel,
  CustomCommandStatus,
  system,
  world,
} from "@minecraft/server";
import {
  IS_TALKING,
  VARIANT,
  claimFaceLock,
  getVariant,
  getVerity,
  releaseFaceLock,
  setVariant,
} from "./verity_systems.js";
import { phase } from "./verity_core.js";

const SOUND_ID = "verity.crashout";
const AUDIO_TICKS = 2153;
const SERIOUS_IDLE_TICKS = 60;
const FACE_OWNER = "crashout";
const CRASHOUT_TAG = "verity:crashout";
const activeCrashouts = new Map();

system.run(() => {
  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    try {
      for (const verity of world.getDimension(dimensionId).getEntities({
        type: "verity:verity",
        tags: [CRASHOUT_TAG],
      })) {
        verity.removeTag(CRASHOUT_TAG);
      }
    } catch {}
  }
});

// Speech timestamps detected from the active 0724 recording. Verity uses his
// idle serious face during the gaps instead of appearing to talk continuously.
const TALK_WINDOWS_SECONDS = [
  [0, 9.84],
  [10.84, 19.3],
  [21.14, 25.14],
  [25.82, 27.98],
  [28.7, 60.56],
  [61.76, 63.76],
  [64.4, 66.4],
  [66.96, 68.96],
  [74, 107],
];
const toTicks = (seconds) => Math.round(seconds * 20);

function commandResult(status, message) {
  return { status, message };
}

function setCrashoutFace(verity, talking) {
  if (!verity?.isValid) return;
  try { verity.setProperty(IS_TALKING, talking); } catch {}
  setVariant(
    verity,
    talking ? VARIANT.TALKINGSERIOUS3 : VARIANT.SERIOUS3,
    { owner: FACE_OWNER }
  );
}

function startCrashout(player) {
  const verity = getVerity(player);
  if (!verity?.isValid) {
    player.sendMessage("§cVerity must be placed before using this command.");
    return;
  }
  if (activeCrashouts.has(verity.id)) {
    player.sendMessage("§7Verity is already crashing out.");
    return;
  }

  const state = { handles: [], endTimeout: undefined };
  activeCrashouts.set(verity.id, state);
  try { verity.addTag(CRASHOUT_TAG); } catch {}
  claimFaceLock(verity, FACE_OWNER);

  setCrashoutFace(verity, true);

  try {
    verity.dimension.playSound(SOUND_ID, verity.location, {
      volume: 2,
      pitch: 1,
    });
  } catch (error) {
    console.warn(`[Verity] Crashout sound failed: ${error}`);
  }

  for (const [startSeconds, endSeconds] of TALK_WINDOWS_SECONDS) {
    if (startSeconds > 0) {
      state.handles.push(system.runTimeout(() => {
        if (activeCrashouts.get(verity.id) !== state) return;
        setCrashoutFace(verity, true);
      }, toTicks(startSeconds)));
    }
    state.handles.push(system.runTimeout(() => {
      if (activeCrashouts.get(verity.id) !== state) return;
      setCrashoutFace(verity, false);
    }, toTicks(endSeconds)));
  }

  state.handles.push(system.runTimeout(() => {
    if (!verity.isValid || activeCrashouts.get(verity.id) !== state) {
      activeCrashouts.delete(verity.id);
      return;
    }

    setCrashoutFace(verity, false);
    state.endTimeout = system.runTimeout(() => {
      state.endTimeout = undefined;
      if (!verity.isValid || activeCrashouts.get(verity.id) !== state) return;

      activeCrashouts.delete(verity.id);
      try { verity.removeTag(CRASHOUT_TAG); } catch {}
      releaseFaceLock(verity, FACE_OWNER);
      setVariant(verity, getVariant(phase(), false));
    }, SERIOUS_IDLE_TICKS);
  }, AUDIO_TICKS));
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
  customCommandRegistry.registerCommand(
    {
      name: "verity:crashout",
      description: "Makes Verity crash out.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const player = origin.sourceEntity;
      if (player?.typeId !== "minecraft:player") {
        return commandResult(
          CustomCommandStatus.Failure,
          "§cRun this command as a player."
        );
      }

      system.run(() => startCrashout(player));
      return commandResult(
        CustomCommandStatus.Success,
        "§cVerity is crashing out."
      );
    }
  );
});
