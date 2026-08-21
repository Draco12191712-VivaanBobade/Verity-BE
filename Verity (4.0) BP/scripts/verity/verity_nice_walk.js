import { world, system, EntityDamageCause } from "@minecraft/server";
import {
    VARIANT,
    IS_TALKING,
    VERITY_TYPE,
    setVariant,
    getVerity,
    claimFaceLock,
    releaseFaceLock,
} from "./verity_systems.js";

// ── Burn trigger ──────────────────────────────────────────────────────────────
// When the live verity:verity entity itself takes fire/lava/explosion damage,
// Verity gets serious — because you burned him.
//
// entity.json now lets these five causes deal real damage (damage_sensor no
// longer blocks them), so entityHurt actually fires. Health is restored to
// max immediately below so Verity stays visibly invincible to players.

const BURN_CAUSES = [
  EntityDamageCause.fire,
  EntityDamageCause.fireTick,
  EntityDamageCause.lava,
  EntityDamageCause.blockExplosion,
  EntityDamageCause.entityExplosion,
];
const NEARBY_PLAYER_DIST = 32;

// Tag used to claim/release the shared face lock in verity.js. Any setVariant
// call made during this sequence must pass this as opts.owner so it isn't
// rejected by its own lock, and ambient writers (playTalk, idle refresh) will
// back off as long as the lock is held under this tag.
const FACE_LOCK_OWNER = "nicewalk";

world.afterEvents.entityHurt.subscribe(
    (ev) => {
        const verity = ev.hurtEntity;
        if (!verity?.isValid) return;
        if (!BURN_CAUSES.includes(ev.damageSource.cause)) return;

        // Damage now actually lands (JSON no longer blocks these causes) —
        // immediately restore health so Verity stays visibly invincible.
        const health = verity.getComponent("minecraft:health");
        if (health) health.setCurrentValue(health.effectiveMax);

        const dimension = verity.dimension;
        const players = dimension.getPlayers({ location: verity.location, maxDistance: NEARBY_PLAYER_DIST });
        if (players.length === 0) return;

        const player = players[0];
        console.warn(`[Verity] [NiceWalk] entity burned — starting sequence for ${player.name}`);

        // Defer so any external respawn/damage-resolution logic finishes first.
        system.run(() => startNiceWalkSequence(player));
    },
    { entityTypes: [VERITY_TYPE] }
);

// ── Dialogue ─────────────────────────────────────────────────────────────────

const LINE_1 = "no. No. No. No. No. No. No. NO. NO. NO NO.";
const LINE_2 = "DON'T DO THAT.";
const LINE_3 = "I THOUGHT WE WERE HAVING A NICE WALK.";
const LINE_4 = "WEREN'T WE HAVING A NICE WALK?";
const LINE_5 = "ANSWER ME WEREN'T WE HAVING A NICE WALK?";
const LINE_OK = "Oh. Okay.";

const TAG = "§c§lVerity§r";

// ── Timing (ticks) ────────────────────────────────────────────────────────────

const FACE_1_AT      = 6;   // 0.3s → escalate to SERIOUS1
const FACE_2_AT      = 20;  // 1.0s → escalate to SERIOUS2
const LINE_2_AT      = 28;  // 1.4s → Line 2 + escalate to SERIOUS3
const TALK_DUR       = 25;  // IS_TALKING duration per line
const LINE_GAP       = 50;  // ticks between lines after line 2 (2.5s)
const WAIT_FOR_RESP  = 120; // ticks to wait for player response before repeating (6s)

// ── Active sessions ───────────────────────────────────────────────────────────

/** @type {Set<string>} */
const activeWalk = new Set();

// ── Face helpers ──────────────────────────────────────────────────────────────

/**
 * Applies IS_TALKING and variant based on current face level and talking state.
 * Levels: 1 = SERIOUS1/TALKINGSERIOUS, 2 = SERIOUS2/TALKINGSERIOUS, 3 = SERIOUS3/TALKINGSERIOUS3
 *
 * Passes { owner: FACE_LOCK_OWNER } on every setVariant call so these writes
 * go through even though this sequence holds the face lock on itself —
 * without that, setVariant's own lock check would reject them.
 *
 * @param {import("@minecraft/server").Entity} verity
 * @param {boolean} talking
 * @param {number} level
 */
function applyFace(verity, talking, level) {
    if (!verity?.isValid) return;
    try {
        verity.setProperty(IS_TALKING, talking);
        let v;
        if (talking) {
            // No TALKINGSERIOUS2 — levels 1 and 2 both use TALKINGSERIOUS
            v = level < 3 ? VARIANT.TALKINGSERIOUS : VARIANT.TALKINGSERIOUS3;
        } else {
            v = level === 1 ? VARIANT.SERIOUS1
              : level === 2 ? VARIANT.SERIOUS2
              : VARIANT.SERIOUS3;
        }
        setVariant(verity, v, { owner: FACE_LOCK_OWNER });
        console.log(`[Verity] [NiceWalk] applyFace: talking=${talking}, level=${level} -> variant ${v}`);
    } catch (e) {
        console.warn(`[Verity] [NiceWalk] applyFace failed: ${e}`);
    }
}

// ── Sequence logic ────────────────────────────────────────────────────────────

/**
 * @param {import("@minecraft/server").Player} player
 */
export function startNiceWalkSequence(player) {
    const playerId = player.id;
    if (activeWalk.has(playerId)) {
        console.log(`[Verity] [NiceWalk] startNiceWalkSequence: already active for ${player.name}`);
        return;
    }
    activeWalk.add(playerId);
    console.log(`[Verity] [NiceWalk] Sequence started for ${player.name}`);

    const verity = getVerity(player);
    if (!verity) {
        console.warn(`[Verity] [NiceWalk] Could not find Verity for ${player.name}, aborting`);
        activeWalk.delete(playerId);
        return;
    }
    console.log(`[Verity] [NiceWalk] Found Verity entity ${verity.id}`);

    // Claim exclusive ownership of this entity's face for the duration of the
    // sequence. While held, playTalk() and the phase-based idle refresh
    // interval in verity.js will no-op on this entity instead of racing with
    // the escalation below — this is what fixes the random serious-face bug,
    // since previously the idle interval could overwrite mid-sequence faces
    // the instant IS_TALKING read false between lines.
    claimFaceLock(verity, FACE_LOCK_OWNER);
    console.log(`[Verity] [NiceWalk] Face lock claimed with owner "${FACE_LOCK_OWNER}"`);

    // Face state — shared across all timeouts in this sequence.
    // Using an object so mutations in one timeout are visible in later ones.
    const face = { level: 1, talking: false };

    function setFace(talking, level) {
        face.talking = talking;
        face.level   = level;
        applyFace(verity, talking, level);
    }

    function escalateTo(level) {
        // Update idle level; if still talking, also update the talking variant
        face.level = level;
        applyFace(verity, face.talking, level);
        console.log(`[Verity] [NiceWalk] Escalated to level ${level}`);
    }

    function speakLine(line) {
        world.sendMessage(`${TAG}: ${line}`);
        console.log(`[Verity] [NiceWalk] Speaking: "${line}"`);
        if (!verity.isValid) {
            console.warn(`[Verity] [NiceWalk] Verity invalid while speaking, skipping face update`);
            return;
        }
        setFace(true, face.level);
        system.runTimeout(() => {
            // Revert to idle at whatever level we're at now
            setFace(false, face.level);
            console.log(`[Verity] [NiceWalk] Idle face restored after speaking`);
        }, TALK_DUR);
    }

    // Player response tracking
    const state = { responded: false };

    const unsub = world.afterEvents.chatSend.subscribe((ev) => {
        if (ev.sender.id === playerId) {
            state.responded = true;
            console.log(`[Verity] [NiceWalk] Player ${player.name} responded in chat`);
        }
    });

    function cleanup() {
        console.log(`[Verity] [NiceWalk] Cleaning up sequence for ${player.name}`);
        activeWalk.delete(playerId);
        // Release the face lock so playTalk() and the idle refresh interval
        // resume normal control of the entity's face. Always do this even on
        // early-exit paths (verity went invalid mid-sequence) — otherwise the
        // lock leaks and the face stays frozen in serious mode forever.
        releaseFaceLock(verity, FACE_LOCK_OWNER);
        console.log(`[Verity] [NiceWalk] Face lock released`);
        try { world.afterEvents.chatSend.unsubscribe(unsub); } catch {}
    }

    /**
     * Waits WAIT_FOR_RESP ticks, then either ends (player responded) or
     * repeats lines 4+5 and recurses.
     */
    function repeatCycle() {
        system.runTimeout(() => {
            if (!verity.isValid) {
                console.warn(`[Verity] [NiceWalk] repeatCycle: Verity invalid, cleaning up`);
                cleanup();
                return;
            }

            if (state.responded) {
                speakLine(LINE_OK);
                cleanup();
                return;
            }

            // No response — repeat lines 4 and 5
            console.log(`[Verity] [NiceWalk] No response yet, repeating lines 4 & 5`);
            speakLine(LINE_4);

            system.runTimeout(() => {
                if (!verity.isValid) {
                    console.warn(`[Verity] [NiceWalk] repeatCycle (inner): Verity invalid, cleaning up`);
                    cleanup();
                    return;
                }

                if (state.responded) {
                    speakLine(LINE_OK);
                    cleanup();
                    return;
                }

                speakLine(LINE_5);
                repeatCycle(); // recurse
            }, LINE_GAP);
        }, WAIT_FOR_RESP);
    }

    // ── Sequence timeline ─────────────────────────────────────────────────────

    // t=0 (0.0s): Line 1 — starts at level 1 → IS_TALKING=true, TALKINGSERIOUS
    speakLine(LINE_1);

    // t=6 (0.3s): escalate idle face to SERIOUS1
    // (still talking → TALKINGSERIOUS unchanged, but idle is now level 1)
    system.runTimeout(() => escalateTo(1), FACE_1_AT);

    // t=20 (1.0s): escalate idle face to SERIOUS2
    // (if still talking → TALKINGSERIOUS unchanged; if done → SERIOUS2 shows)
    system.runTimeout(() => escalateTo(2), FACE_2_AT);

    // t=28 (1.4s): Line 2 — escalate to level 3 + speak
    // → IS_TALKING=true, TALKINGSERIOUS3 while speaking; SERIOUS3 after
    system.runTimeout(() => {
        if (!verity.isValid) {
            console.warn(`[Verity] [NiceWalk] timeout LINE_2_AT: Verity invalid, cleaning up`);
            cleanup();
            return;
        }
        escalateTo(3);
        speakLine(LINE_2);
    }, LINE_2_AT);

    // t=78 (3.9s): Line 3
    system.runTimeout(() => {
        if (!verity.isValid) {
            console.warn(`[Verity] [NiceWalk] timeout LINE_3: Verity invalid, cleaning up`);
            cleanup();
            return;
        }
        speakLine(LINE_3);
    }, LINE_2_AT + LINE_GAP);

    // t=128 (6.4s): Line 4
    system.runTimeout(() => {
        if (!verity.isValid) {
            console.warn(`[Verity] [NiceWalk] timeout LINE_4: Verity invalid, cleaning up`);
            cleanup();
            return;
        }
        speakLine(LINE_4);
    }, LINE_2_AT + LINE_GAP * 2);

    // t=178 (8.9s): Line 5 — then begin repeat/response cycle
    system.runTimeout(() => {
        if (!verity.isValid) {
            console.warn(`[Verity] [NiceWalk] timeout LINE_5: Verity invalid, cleaning up`);
            cleanup();
            return;
        }
        speakLine(LINE_5);
        repeatCycle();
    }, LINE_2_AT + LINE_GAP * 3);

    console.warn(`[Verity] [NiceWalk] Sequence started for ${player.name}`);
}
