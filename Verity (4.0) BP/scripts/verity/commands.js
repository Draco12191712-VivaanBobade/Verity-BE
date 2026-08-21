import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,   // ✅ Added this enum
  system,
  world,
} from "@minecraft/server";
import { CONFIG, isEnabled } from "./config.js";
import {
  findPlacedVerity,
  startVerityRollFollow,
  stopVerityRollFollow,
} from "./rollverity.js";

const QUESTION_COUNT_PROPERTY = "verity:qcount";
const BASE_PROPERTIES = [
  "verity:base_x",
  "verity:base_y",
  "verity:base_z",
  "verity:base_dim",
];

// ❌ Removed: const serverModule = await import("@minecraft/server");
// ❌ Removed: const CustomCommandResult = serverModule.CustomCommandResult ?? null;

const COMMAND_SOUNDS = {
  cow: "mob.cow.say",
  moo: "mob.cow.say",
  sheep: "mob.sheep.say",
  baa: "mob.sheep.say",
  pig: "mob.pig.say",
  oink: "mob.pig.say",
  chicken: "mob.chicken.say",
  cluck: "mob.chicken.say",
  cat: "mob.cat.meow",
  meow: "mob.cat.meow",
  wolf: "mob.wolf.bark",
  bark: "mob.wolf.bark",
  villager: "mob.villager.haggle",
  zombie: "mob.zombie.say",
  skeleton: "mob.skeleton.say",
  creeper: "mob.creeper.say",
  enderman: "mob.endermen.scream",
  ghast: "mob.ghast.scream",
  thunder: "ambient.weather.thunder",
  explosion: "random.explode",
  bell: "block.bell.hit",
};

function normalizedChat(message) {
  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mentionsVerity(message) {
  return /\bverity\b/i.test(message);
}

function isFollowPhrase(message) {
  const text = normalizedChat(message);
  if (!mentionsVerity(text)) return false;

  const asksToFollow =
    /\b(fol+ow+|foll?ow|folow|trail|roll|come|come along|tag along|s[ií]gueme|ven)\b/.test(
      text
    );
  const pointsAtPlayer =
    /\b(me|us|with me|with us|behind me|along|conmigo|nos)\b/.test(text);
  const asksPolitely =
    /\b(can you|could you|would you|please|pls|plz|i want you to|will you)\b/.test(
      text
    );

  return asksToFollow && (pointsAtPlayer || asksPolitely);
}

function isStopFollowPhrase(message) {
  const text = normalizedChat(message);
  if (!mentionsVerity(text)) return false;

  // Music commands belong to verity.js. Without this exclusion, a phrase
  // such as "Verity stop playing that song" is consumed as a movement-stop
  // command before the music handler can stop the sound.
  if (
    /\b(music|m[uú]sica|song|track|tune|audio|sing(?:ing)?|play(?:ing|in|uing)?|my gal)\b/.test(
      text
    )
  ) {
    return false;
  }

  return (
    /\b(sto+p+|stap|stay|wait|pause|freeze|hold(?:\s+on)?|quit|don'?t|dont|do not|no more|leave me|go away)\b/.test(
      text
    )
  );
}

export function isVerityRollChatCommand(message) {
  return isFollowPhrase(message) || isStopFollowPhrase(message);
}

world.afterEvents.chatSend.subscribe((event) => {
  if (!isEnabled(CONFIG.features.followCommands)) return;

  const message = event.message.trim();
  const player = event.sender;

  if (isStopFollowPhrase(message)) {
    if (stopVerityRollFollow(player)) {
      player.sendMessage("§eVerity stopped following you.");
    } else {
      player.sendMessage("§7Verity was not following you.");
    }
    return;
  }

  if (!isFollowPhrase(message)) return;

  const verity = findPlacedVerity(player);
  if (!verity) {
    player.sendMessage("§cPlace Verity down nearby first.");
    return;
  }

  startVerityRollFollow(player, verity);
  player.sendMessage("§eVerity is following you.");
});

// ✅ Corrected helper functions
function success(message) {
  return { status: CustomCommandStatus.Success, message };
}

function failure(message) {
  return { status: CustomCommandStatus.Failure, message };
}

function sourcePlayer(origin) {
  const source = origin.sourceEntity;
  return source?.typeId === "minecraft:player" ? source : undefined;
}

function phaseFromQuestions(questionCount) {
  const thresholds = CONFIG.phases.thresholds;
  for (let index = thresholds.length - 1; index >= 0; index -= 1) {
    if (questionCount >= thresholds[index]) return index;
  }
  return 0;
}

system.beforeEvents.startup.subscribe((event) => {
  if (!isEnabled(CONFIG.features.commands)) return;

  const registry = event.customCommandRegistry;

  registry.registerCommand(
    {
      name: "verity:help",
      description: "Shows the available Verity commands.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    () =>
      success(
        "§eVerity commands: §f/verity:status, /verity:reset, " +
          "/verity:phase <0-5>, /verity:summon, /verity:remove, " +
          "/verity:face <0-19>, /verity:roll, /verity:stoproll, " +
          "/verity:sound <name>, /verity:crashout"
      )
  );

  registry.registerCommand(
    {
      name: "verity:sound",
      description: "Makes Verity play a Minecraft sound.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        {
          name: "sound",
          type: CustomCommandParamType.String,
        },
      ],
    },
    (origin, requestedSound) => {
      const player = sourcePlayer(origin);
      if (!player) return failure("§cRun this command as a player.");

      const key = String(requestedSound ?? "").toLowerCase().trim();
      const soundId = COMMAND_SOUNDS[key];
      if (!soundId) {
        return failure(
          `§cUnknown sound. Try: ${Object.keys(COMMAND_SOUNDS).join(", ")}`
        );
      }

      system.run(() => {
        const verity = findPlacedVerity(player);
        const location = verity?.location ?? player.location;
        try {
          player.dimension.playSound(soundId, location, {
            volume: 1,
            pitch: 1,
          });
        } catch (error) {
          console.warn(`[Verity] Sound command failed: ${error}`);
        }
      });
      return success(`§aVerity played the ${key} sound.`);
    }
  );

  registry.registerCommand(
    {
      name: "verity:status",
      description: "Shows Verity's current progression status.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    () => {
      const questions = Number(
        world.getDynamicProperty(QUESTION_COUNT_PROPERTY) ?? 0
      );
      return success(
        `§eVerity phase: §f${phaseFromQuestions(questions)} §7| §eQuestions: §f${questions}`
      );
    }
  );

  registry.registerCommand(
    {
      name: "verity:roll",
      description: "Makes the nearest placed Verity roll after you.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const player = sourcePlayer(origin);
      if (!player) return failure("§cRun this command as a player.");

      system.run(() => {
        const verity = findPlacedVerity(player);
        if (!verity) {
          player.sendMessage("§cPlace Verity down nearby first.");
          return;
        }

        startVerityRollFollow(player, verity);
        player.sendMessage("§eVerity is rolling after you.");
      });
      return success("§aStarting Verity's rolling.");
    }
  );

  registry.registerCommand(
    {
      name: "verity:stoproll",
      description: "Stops Verity from rolling after you.",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const player = sourcePlayer(origin);
      if (!player) return failure("§cRun this command as a player.");

      system.run(() => {
        if (stopVerityRollFollow(player)) {
          player.sendMessage("§eVerity stopped rolling after you.");
        } else {
          player.sendMessage("§7Verity was not rolling after you.");
        }
      });
      return success("§aStopping Verity's rolling.");
    }
  );

  registry.registerCommand(
    {
      name: "verity:reset",
      description: "Resets Verity's progression and your saved base.",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: true,
    },
    (origin) => {
      const player = sourcePlayer(origin);
      system.run(() => {
        world.setDynamicProperty(QUESTION_COUNT_PROPERTY, 0);
        if (player) {
          for (const property of BASE_PROPERTIES) {
            player.setDynamicProperty(property, undefined);
          }
        }
      });
      return success("§aVerity progression reset to phase 0.");
    }
  );

  registry.registerCommand(
    {
      name: "verity:phase",
      description: "Sets Verity's phase from 0 to 5.",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: true,
      mandatoryParameters: [
        {
          name: "phase",
          type: CustomCommandParamType.Integer,
        },
      ],
    },
    (_origin, requestedPhase) => {
      const phase = Math.floor(Number(requestedPhase));
      if (!Number.isFinite(phase) || phase < 0 || phase > 5) {
        return failure("§cPhase must be a number from 0 to 5.");
      }

      system.run(() => {
        world.setDynamicProperty(
          QUESTION_COUNT_PROPERTY,
          CONFIG.phases.thresholds[phase]
        );
      });
      return success(`§aVerity phase set to ${phase}.`);
    }
  );

  registry.registerCommand(
    {
      name: "verity:summon",
      description: "Summons Verity at your location.",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: true,
    },
    (origin) => {
      const player = sourcePlayer(origin);
      if (!player) return failure("§cRun this command as a player.");

      system.run(() => {
        player.dimension.spawnEntity("verity:verity", player.location);
      });
      return success("§aVerity summoned.");
    }
  );

  registry.registerCommand(
    {
      name: "verity:remove",
      description: "Removes all loaded Verity entities.",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: true,
    },
    () => {
      system.run(() => {
        for (const dimensionId of ["overworld", "nether", "the_end"]) {
          const dimension = world.getDimension(dimensionId);
          for (const entity of dimension.getEntities({ type: "verity:verity" })) {
            entity.remove();
          }
        }
      });
      return success("§aLoaded Verity entities removed.");
    }
  );

  registry.registerCommand(
    {
      name: "verity:face",
      description: "Sets every loaded Verity entity's face from 0 to 19.",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: true,
      mandatoryParameters: [
        {
          name: "face",
          type: CustomCommandParamType.Integer,
        },
      ],
    },
    (_origin, requestedFace) => {
      const face = Math.floor(Number(requestedFace));
      if (!Number.isFinite(face) || face < 0 || face > 19) {
        return failure("§cFace must be a number from 0 to 19.");
      }

      system.run(() => {
        for (const dimensionId of ["overworld", "nether", "the_end"]) {
          const dimension = world.getDimension(dimensionId);
          for (const entity of dimension.getEntities({ type: "verity:verity" })) {
            entity.setProperty("verity:variant", face);
          }
        }
      });
      return success(`§aVerity face set to ${face}.`);
    }
  );
});
