import { world, system } from "@minecraft/server";
import {
  VARIANT,
  IS_TALKING,
  getVerity,
  getVariant,
  setVariant,
  claimFaceLock,
  releaseFaceLock,
} from "./verity_systems.js";
import { phase } from "./verity_core.js";

const TRIGGER_REGEX = /^requesting\s+human\s+supervisor[.!?]*$/i;
const SUPPORT_TAG = "verity:customer_support";
const FACE_OWNER = "customer_support";
const SESSION_TIMEOUT_TICKS = 1200;

const SOUNDS = {
  1: { id: "verity.customer_support.1", ticks: 223 },
  2: { id: "verity.customer_support.2", ticks: 113 },
  4: { id: "verity.customer_support.4", ticks: 85 },
  5: { id: "verity.customer_support.5", ticks: 246 },
};

/** playerId -> session */
const sessions = new Map();
/** verity entityId -> playerId */
const occupiedVerities = new Map();

function supportPlayer(session) {
  const entity = world.getEntity(session.playerId);
  return entity?.typeId === "minecraft:player" ? entity : undefined;
}

function supportVerity(session) {
  const entity = world.getEntity(session.verityId);
  return entity?.isValid ? entity : undefined;
}

function setSupportFace(session, talking) {
  const verity = supportVerity(session);
  if (!verity) return;
  try { verity.setProperty(IS_TALKING, talking); } catch {}
  setVariant(
    verity,
    talking ? VARIANT.SLEEPTALK : VARIANT.SLEEP,
    { owner: FACE_OWNER }
  );
}

function stopSupportSounds(player) {
  if (!player?.isValid) return;
  for (const sound of Object.values(SOUNDS)) {
    try { player.stopSound(sound.id); }
    catch {
      try { player.runCommand(`stopsound @s ${sound.id}`); } catch {}
    }
  }
}

function clearFaceTimeout(session) {
  if (session.faceTimeout === undefined) return;
  try { system.clearRun(session.faceTimeout); } catch {}
  session.faceTimeout = undefined;
}

function resetSessionTimeout(session) {
  if (session.expiryTimeout !== undefined) {
    try { system.clearRun(session.expiryTimeout); } catch {}
  }
  session.expiryTimeout = system.runTimeout(() => {
    if (sessions.get(session.playerId) !== session) return;
    const player = supportPlayer(session);
    player?.sendMessage("§d<Verity>§r Your customer support request expired. I'm returning to normal now.");
    endSession(session);
  }, SESSION_TIMEOUT_TICKS);
}

function playSupportClip(session, number) {
  const player = supportPlayer(session);
  const sound = SOUNDS[number];
  if (!player || !sound) {
    endSession(session);
    return;
  }

  clearFaceTimeout(session);
  setSupportFace(session, true);
  try { player.playSound(sound.id); }
  catch {
    try { player.runCommand(`playsound ${sound.id} @s`); } catch {}
  }

  session.faceTimeout = system.runTimeout(() => {
    session.faceTimeout = undefined;
    if (sessions.get(session.playerId) !== session) return;
    setSupportFace(session, false);
  }, sound.ticks);
}

function endSession(session) {
  if (sessions.get(session.playerId) !== session) return;
  sessions.delete(session.playerId);
  occupiedVerities.delete(session.verityId);

  clearFaceTimeout(session);
  if (session.nextClipTimeout !== undefined) {
    try { system.clearRun(session.nextClipTimeout); } catch {}
  }
  if (session.endTimeout !== undefined) {
    try { system.clearRun(session.endTimeout); } catch {}
  }
  if (session.expiryTimeout !== undefined) {
    try { system.clearRun(session.expiryTimeout); } catch {}
  }

  const player = supportPlayer(session);
  stopSupportSounds(player);

  const verity = supportVerity(session);
  if (verity) {
    try { verity.removeTag(SUPPORT_TAG); } catch {}
    try { verity.setProperty(IS_TALKING, false); } catch {}
    setVariant(verity, getVariant(phase(), false), { owner: FACE_OWNER });
    releaseFaceLock(verity, FACE_OWNER);
  }
}

function startSession(player) {
  const existing = sessions.get(player.id);
  if (existing) endSession(existing);

  const verity = getVerity(player);
  if (!verity?.isValid) {
    player.sendMessage("§7No Verity is available for customer support.");
    return;
  }
  if (occupiedVerities.has(verity.id)) {
    player.sendMessage("§7Verity Support Services is already handling another request.");
    return;
  }

  const session = {
    playerId: player.id,
    verityId: verity.id,
    stage: "menu",
    faceTimeout: undefined,
    nextClipTimeout: undefined,
    endTimeout: undefined,
    expiryTimeout: undefined,
  };
  sessions.set(player.id, session);
  occupiedVerities.set(verity.id, player.id);

  claimFaceLock(verity, FACE_OWNER);
  try { verity.addTag(SUPPORT_TAG); } catch {}
  resetSessionTimeout(session);
  playSupportClip(session, 1);
}

function finishSupportCall(session) {
  session.stage = "ending";
  resetSessionTimeout(session);
  stopSupportSounds(supportPlayer(session));
  playSupportClip(session, 4);

  session.nextClipTimeout = system.runTimeout(() => {
    session.nextClipTimeout = undefined;
    if (sessions.get(session.playerId) !== session) return;
    playSupportClip(session, 5);

    session.endTimeout = system.runTimeout(() => {
      session.endTimeout = undefined;
      endSession(session);
    }, SOUNDS[5].ticks);
  }, SOUNDS[4].ticks + 8);
}

function handleSessionInput(session, raw) {
  if (sessions.get(session.playerId) !== session) return;
  const input = raw.trim();
  if (!input) return;
  resetSessionTimeout(session);

  if (session.stage === "menu") {
    if (input === "1" || input === "2") {
      endSession(session);
      return;
    }
    if (input === "3") {
      session.stage = "reason";
      stopSupportSounds(supportPlayer(session));
      playSupportClip(session, 2);
    }
    return;
  }

  if (session.stage === "reason") {
    finishSupportCall(session);
  }
}

world.beforeEvents.chatSend.subscribe((event) => {
  const player = event.sender;
  const message = event.message;
  const active = sessions.get(player.id);

  if (active) {
    event.cancel = true;
    system.run(() => handleSessionInput(active, message));
    return;
  }

  if (!TRIGGER_REGEX.test(message.trim())) return;
  event.cancel = true;
  system.run(() => startSession(player));
});

world.afterEvents.playerLeave.subscribe((event) => {
  const session = sessions.get(event.playerId);
  if (session) endSession(session);
});
