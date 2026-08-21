import { world, system } from "@minecraft/server";
import {
  VERITY_TYPE,
  IS_TALKING,
  VARIANT,
  getVariant,
  setVariant,
  claimFaceLock,
  releaseFaceLock,
} from "./verity_systems.js";
import { phase } from "./verity_core.js";

// ── Intro talk windows ───────────────────────────────────────────────────────
const TALK_WINDOWS_SEC = [
  [0, 0.5],
  [0.67, 0.69],
  [0.83, 1.04],
  [1.61, 2.0],
  [3.0, 3.2],
  [3.5, 4.38],
];

const toTicks = (sec) => Math.round(sec * 20); // 20 ticks/sec
const TALK_WINDOWS_TICKS = TALK_WINDOWS_SEC.map(([s, e]) => [toTicks(s), toTicks(e)]);

const INTRO_SAFETY_TICKS = toTicks(6.2);
const INTRO_OWNER = "spawn_intro";

const introRuns = new Map();

function clearIntroRun(entityId) {
  const handles = introRuns.get(entityId);
  if (!handles) return;
  for (const handle of handles) {
    try { system.clearRun(handle); } catch (e) { /* already fired, ignore */ }
  }
  introRuns.delete(entityId);
}

function runIntroFaceSequence(verity) {
  if (!verity || !verity.isValid) return;

  clearIntroRun(verity.id);
  claimFaceLock(verity, INTRO_OWNER);

  const introPhase = phase();
  const handles = [];
  try { verity.setProperty(IS_TALKING, true); } catch {}
  setVariant(verity, VARIANT.TALKING2, {
    owner: INTRO_OWNER,
    respectLock: false,
  });

  for (const [startTick, endTick] of TALK_WINDOWS_TICKS) {
    if (startTick > 0) {
      handles.push(system.runTimeout(() => {
        if (!verity.isValid) return;
        try { verity.setProperty(IS_TALKING, true); } catch (e) { console.warn(`[Verity] intro face on failed: ${e}`); }
        // Intro always uses TALKING2, regardless of phase.
        setVariant(verity, VARIANT.TALKING2, { owner: INTRO_OWNER, respectLock: false });
      }, startTick));
    }

    handles.push(system.runTimeout(() => {
      if (!verity.isValid) return;
      try { verity.setProperty(IS_TALKING, false); } catch (e) { console.warn(`[Verity] intro face off failed: ${e}`); }
      setVariant(verity, getVariant(introPhase, false), { owner: INTRO_OWNER, respectLock: false });
    }, endTick));
  }

  handles.push(system.runTimeout(() => {
    if (verity.isValid) {
      try { verity.setProperty(IS_TALKING, false); } catch {}
      setVariant(verity, getVariant(phase(), false), {
        owner: INTRO_OWNER,
        respectLock: false,
      });
    }
    releaseFaceLock(verity, INTRO_OWNER);
    introRuns.delete(verity.id);
  }, INTRO_SAFETY_TICKS));

  introRuns.set(verity.id, handles);
}

world.afterEvents.dataDrivenEntityTrigger.subscribe(
  (event) => {
    const verity = event.entity;
    if (event.eventId === "verity:begin_introduction") runIntroFaceSequence(verity);
  },
  { entityTypes: [VERITY_TYPE], eventTypes: ["verity:begin_introduction"] }
);
