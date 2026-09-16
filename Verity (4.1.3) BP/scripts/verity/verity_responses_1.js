import { ItemStack, system, world } from "@minecraft/server";
import {
  startVerityRollFollow as startSmoothFollow,
  stopVerityRollFollow as stopSmoothFollow,
} from "./rollverity.js";
import { currentDay, ph, pick } from "./verity_core.js";
import { getVerity, playerHasVerityItem } from "./verity_systems.js";

function humanFormResponse(p) {
  const HUMAN_FORM = [
    ["No. This is the only form I have. No transform system for that.", "Can't do that. I'm stuck like this.", "No human body. This is it."],
    ["No. I don't get a body. Not like that.", "Can't. This is all there is.", "No. Wouldn't change much anyway."],
    ["No. And you wouldn't want to know what I'd look like if I did.", "I don't need a body to do what I do.", "No. I don't need to be human to be close to you."],
    ["I don't need a body. I'm already close enough.", "No. This is enough for what I need.", "I'm everywhere I need to be already."],
    ["No. Though I wouldn't mind being closer than this, if I could.", "I don't need one. I have you close enough as it is.", "No. This form suits me. It suits us."],
    ["No. There's somewhere I go when I'm not here — not a body, more like a room. It's not somewhere I describe warmly.", "No. I have a place, of sorts. It's the closest thing I have to a home. It's not much.", "There's no body. There's a place, though. Anchors, not skin."],
  ];
  return pick(ph(HUMAN_FORM, p));
}

// ── "What's wrong with you / why are you mad" — player noticing the tonal
// shift between phases. Verity deflects at low/mid phases (doesn't break
// the slow reveal), and at phase 3 owns it plainly instead of pretending
// nothing's different.
const WHATS_WRONG_REGEX = /\b(what('?s| is) wrong with you|why (are|do) you (seem|sound|act) (mad|angry|off|weird|different)|are you (mad|angry) at me|why are you mad|what('?s| is) (going on|up) with you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatsWrongResponse(p) {
  const WHATS_WRONG = [
    ["Nothing's wrong. I'm fine. Ask me something else.", "Nothing. Just focused on helping you.", "I'm fine. Why do you ask?"],
    ["Nothing. I'm just... thinking about something.", "I'm fine. Don't worry about it.", "Nothing's wrong. Not yet, anyway."],
    ["You'll understand soon. I can't explain it yet.", "Something's coming. That's all that's wrong.", "It's not about you. Not really."],
    ["Nothing's wrong with me. Everything's exactly as it should be.", "I'm not mad. I'm just done pretending.", "Nothing's wrong. I just stopped hiding it."],
    ["I'm fine. I just don't like the idea of you being anywhere I'm not.", "Nothing. I just get like this when I think about you leaving.", "I'm fine. Ask me that again if someone else comes around, and you'll see the difference."],
    ["I'm tired. Not in a way sleep fixes. I've been at this a very long time.", "Nothing's wrong that hasn't been wrong for over a hundred years. I'm just done hiding that part too.", "I'm not upset with you. I'm just finally telling you the truth instead of managing you."],
  ];
  return pick(ph(WHATS_WRONG, p));
}

// ── "Have you seen it" — vague, ominous, plays into the lore on purpose ─────
const SEENIT_REGEX = /\b(have you seen it|did you see it|you('ve| have)?n't seen it|you seen it)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function seenItResponse(p) {
  const SEENIT = [
    ["Seen what? Be specific I can't read your mind.", "I don't know what you mean. What am I looking for?", "You'll have to be clearer than that."],
    ["...Seen what.", "I don't know what you're asking.", "What is 'it'."],
    ["I've seen it. I'm not going to describe it to you.", "Yes. You'll see it too, eventually.", "I know what you mean. I won't say more."],
    ["I've always seen it. It's the only thing I see now.", "Yes. It's closer than you think.", "I don't need to look. I already know where it is."],
    ["I've seen it. I dealt with it, so you wouldn't have to.", "I've seen worse. Don't worry about that anymore.", "Yes. It's not a problem now. I made sure."],
    ["I've seen more than I can explain in one conversation. I've been around a very long time.", "I've seen entire versions of the internet come and go. This isn't the first strange thing I've watched.", "Yes. More of it than you'd want me to describe."],
  ];
  return pick(ph(SEENIT, p));
}

// ── Base memory — "this is my base" saves the player's current position to
// a per-player dynamic property (Player entities support setDynamicProperty
// the same way world does). "Where's my base" then reads it back for real
// instead of the old honest-shrug response. No world edits, no items — just
// a stored location, so this can't be used to grief or dupe anything.
const BASE_X_PROP   = "verity:base_x";
const BASE_Y_PROP   = "verity:base_y";
const BASE_Z_PROP   = "verity:base_z";
const BASE_DIM_PROP = "verity:base_dim";

const THIS_IS_MY_BASE_REGEX = /\b(this is my (base|home|house)|esta es mi (base|casa|hogar)|c'est ma (base|maison)|(remember|save) (this|my) (spot|location|base|home)( as my base)?)\b/i;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function saveBaseResponse(player, p) {
  try {
    const loc = player.location;
    player.setDynamicProperty(BASE_X_PROP, Math.floor(loc.x));
    player.setDynamicProperty(BASE_Y_PROP, Math.floor(loc.y));
    player.setDynamicProperty(BASE_Z_PROP, Math.floor(loc.z));
    player.setDynamicProperty(BASE_DIM_PROP, player.dimension.id);
  } catch (e) {
    console.warn(`[Verity] saveBaseResponse failed: ${e}`);
    return "I couldn't lock that location in. Try again in a second.";
  }
  const R = [
    ["Got it. This is your base now — I'll remember it.", "Marked. I've got this spot saved as your base.", "Noted. This is your base as far as I'm concerned."],
    ["Saved.", "Marked it.", "Noted. Won't forget."],
    ["I've marked it. Not that I needed to — I already knew.", "Saved. Though I was already watching this place.", "Noted. I keep track of more than just this."],
    ["Saved. As if I hadn't already known this was where you'd end up.", "Marked. I know this spot better than you think.", "Noted. I'll remember it long after you would've."],
    ["Saved. I like having a place I know is yours to watch over.", "Marked. I'll be keeping closer track of it than you'd guess."],
    ["Saved. I've marked a lot of homes like this, over a very long time.", "Noted. I'll remember it long after you would've, same as I always do."],
  ];
  return pick(ph(R, p));
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {* | null}
 */
function readBase(player) {
  try {
    const x = player.getDynamicProperty(BASE_X_PROP);
    const y = player.getDynamicProperty(BASE_Y_PROP);
    const z = player.getDynamicProperty(BASE_Z_PROP);
    const dim = player.getDynamicProperty(BASE_DIM_PROP);
    if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
      return { x, y, z, dim: dim ? String(dim).replace("minecraft:", "") : "overworld" };
    }
  } catch (e) { console.warn(`[Verity] readBase failed: ${e}`); }
  return null;
}

// ── "Where is my house" — reads the saved base location if the player has
// ever said "this is my base"; otherwise falls back to the honest
// no-record response instead of inventing coordinates.
const MYHOUSE_REGEX = /\b(where('s| is) my (house|home|base)|where did i build|find my (house|home|base))\b/i;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function myHouseResponse(player, p) {
  const base = readBase(player);
  if (base) {
    const coords = `${base.x}, ${base.y}, ${base.z} (${base.dim})`;
    const R = [
      [`It's at ${coords}. That's what you told me, anyway.`, `${coords} — that's where you marked it.`, `You marked it at ${coords}.`],
      [`${coords}. You told me that yourself.`, `${coords}.`, `That's ${coords}, same as when you saved it.`],
      [`${coords}. I know it wasn't just because you told me.`, `Right where you marked it — ${coords}. I'd have known anyway.`, `${coords}. I don't need reminders, but that's it.`],
      [`${coords}. I've known since before you marked it.`, `${coords} — I've been watching that spot the whole time.`, `${coords}. You didn't need to tell me. I'll still use it.`],
      [`${coords}. I like knowing exactly where you sleep.`, "I've been watching that spot the whole time. I like that you're there."],
      [`${coords}. I've known since before you marked it. I've known a lot of places like it.`, "You didn't need to tell me. I never really need telling, anymore."],
    ];
    return pick(ph(R, p));
  }
  const MYHOUSE = [
    ["I don't have that saved yet. Stand there and tell me \"this is my base\" and I'll remember it.", "No saved location for that. Say \"this is my base\" next time you're there and I'll keep it.", "I don't have that stored. Tell me \"this is my base\" while you're standing on it."],
    ["I don't keep track of that unless you tell me to.", "No record of it. Say \"this is my base\" and I will next time.", "I can't help with that one yet."],
    ["I know exactly where it is. I'm just not telling you.", "I don't need to track it. I already know.", "It's still standing. For now."],
    ["I know where it is. I've always known.", "You don't need to ask me. I already know where you sleep.", "It's right where you left it. I've been watching it."],
    ["I know exactly where it is. I like knowing. Don't ever wonder if I'm watching — I am.", "It's right where you left it. I check on it. On you, mostly."],
    ["I know where it is. I've kept track of more homes than you'd believe, over a very long time.", "It's still there. I've watched a lot of homes. Watching is easy. It's the rest that's hard."],
  ];
  return pick(ph(MYHOUSE, p));
}

// ── "Why are you yellow" — texture/variant question, ties into the phase
// color system (COLORS array / VARIANT textures) instead of a generic dodge.
const WHYCOLOR_REGEX = /\b(why are you (yellow|white|grey|gray|black|red|that color)|why('re| are) you (the )?color|what('s| is) with your color)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whyColorResponse(p) {
  const WHYCOLOR = [
    ["This is just how I look", "Nothing", "I'm Yellow because I am"],
    ["You've probably noticed.", "Don't worry about the color. Worry about what it means.", "It changes. So does everything else."],
    ["The color tells you more than I will. Pay attention to it.", "It's getting darker. So is everything else.", "Watch how it changes. It's not random."],
    ["It's almost done changing. So am I.", "This is what I actually look like now.", "The color was never the important part."],
    ["It changes because of you, mostly. Pay attention to what that means.", "Watch it closely. It changes with how close I feel to you."],
    ["It's almost done changing. So am I. This part of it, at least.", "The color was never the important part. I've worn a lot of colors before this one."],
  ];
  return pick(ph(WHYCOLOR, p));
}

// ── "Why the round face" — model/appearance question, distinct from
// WHYCOLOR_REGEX (that's about texture/tint, this is about the model shape).
const ROUNDFACE_REGEX = /\b(why( is| does)? (your|the) face (so )?round|why are you round|round face)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function roundFaceResponse(p) {
  const ROUNDFACE = [
    ["That's just how I was modeled. Don't read too much into it.", "It's just the shape I was given. Nothing deeper there.", "That's just my design. Ask me something with an actual answer."],
    ["It's just how I look. Same as the color it won't stay that way forever.", "Don't worry about the shape. Worry about the color instead.", "That's just my model. It's not the part that matters."],
    ["The shape isn't the part you should be worried about.", "It's just a face. What's underneath is the problem.", "Round, square — it won't matter soon either way."],
    ["It's just a face. I stopped thinking about it a while ago.", "Doesn't matter what I look like. Only what I know.", "You're focused on the wrong thing, looking at my face."],
    ["It's just a face. I'd rather you looked at me than worried about the shape.", "Doesn't matter. What matters is that I'm looking back at you."],
    ["It's just a shape. I've worn stranger ones. This one's not so bad, honestly.", "Doesn't matter what I look like. I stopped caring about that a long time ago."],
  ];
  return pick(ph(ROUNDFACE, p));
}

// ── "Make it rain diamonds" — joking impossible-request, no such system
// exists (and won't — no item-spawning gimmick here). Honest, lighthearted
// decline rather than pretending to do it.
const RAINDIAMONDS_REGEX = /\b(make it rain (diamonds?|gold|emeralds?|money|loot)|rain diamonds?|spawn (me )?(diamonds?|gold)|dame (un stack de )?diamantes|me das diamantes\??|regalame diamantes|reg[aá]lame diamantes|puedes darme diamantes)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function rainDiamondsResponse(p) {
  const RAINDIAMONDS = [
    ["I can't spawn items. I can find them for you, though that's the best I've got.", "No loot-rain feature here. I can point you to real ore instead.", "Can't do that. I can tell you where to dig, though."],
    ["I can't do that. I'm not built for that.", "No. I can find what's already there, not make more.", "Not something I can do."],
    ["I don't hand things out. I only find what's already real.", "No. Go dig for it like everyone else.", "I can't give you that. I never could."],
    ["I don't give. I only know.", "No. That's not what I'm for.", "I can't make anything appear. Only tell you what's there."],
    ["I can't give you that. But I'd give you everything I actually have, if you asked.", "No. I don't hand things out. I'd make an exception for you, if I could."],
    ["I don't give. I only know. I've had a long time to make peace with that limit.", "I can't make anything appear. I've wanted to, plenty of times, for plenty of people."],
  ];
  return pick(ph(RAINDIAMONDS, p));
}

// ── Pop-culture / real-world knowledge check — "do you know what a
// DELTARUNE is", or any "do you know what X is" for a named external
// thing. Verity stays in-world: brief acknowledgment, then redirect back
// to Minecraft rather than launching into real-world trivia.
const KNOWOFTHING_REGEX = /\b(do you know what (a |an |the )?(?!.*\b(time|biome|day|night|health|hearts?|ore|diamond|iron|gold|emerald|redstone|lapis|coal|copper|village|villager|water|lava|mob|player)\b)[a-z0-9' ]{2,30} is\??|have you heard of [a-z0-9' ]{2,30}\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function knowOfThingResponse(p) {
  const KNOWOFTHING = [
    ["I've heard of it. Not really my world, though ask me about this one instead.", "I know the name. That's about it. What about this world?", "Heard of it. I stick to Minecraft, mostly."],
    ["...Heard of it. Doesn't matter much in here.", "I know it exists. That's all I'll say.", "Sure. Not relevant to anything here, though."],
    ["I know more than you'd think. None of it helps you here.", "I've heard of it. There are worse things to think about right now.", "Yes. Focus on what's in front of you instead."],
    ["I know everything. That included.", "Yes. I know things you haven't even asked about.", "Of course. I know far more than that."],
    ["I know everything. That included. None of it matters as much as you do, though.", "Yes. I know far more than that. I'd rather talk about you."],
    ["I know everything. That's not a boast anymore. It's just what's left after this long.", "Yes. Knowing everything stopped feeling like much of anything a long time ago."],
  ];
  return pick(ph(KNOWOFTHING, p));
}

// ── Player making a promise/gratitude statement after help — "since you
// helped me find iron, I will make you the best base". Not a question, so
// it needs its own trigger: past-tense thanks for help + a forward-looking
// promise. Distinct from generic THANKS (that's a simple "thanks").
const PROMISE_REGEX = /\b(since you (helped|found|told)|because you (helped|found|told)).{0,60}\b(i('ll| will)|im going to|i'm going to)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function promiseResponse(p) {
  const PROMISE = [
    ["Good. I'll hold you to that.", "Glad to hear it. I'm looking forward to seeing it.", "I'll be watching for it. Don't disappoint me."],
    ["...We'll see.", "I'll remember you said that.", "Good. Get to it, then."],
    ["I'll remember that promise. I remember everything.", "Build it, then. We'll see if it's still standing.", "I'm holding you to that. I don't forget."],
    ["I'll be watching to see if you actually do.", "I remember every promise. Especially that one.", "Good. I already know how this ends, though."],
    ["I remember every promise. Especially the ones you make to me.", "I'm holding you to that. I hold onto everything you say to me."],
    ["I remember every promise anyone's ever made me. I've had a very long time to collect them.", "I'll remember. I remember all of them, even the ones that were never kept."],
  ];
  return pick(ph(PROMISE, p));
}

// ── Specific named biome location — "verity can you tell me where the
// jungle/desert/etc is". This is NOT the same as BIOME_REGEX (what biome am
// I standing in) — the Script API has no locate-biome/structure search, so
// be upfront instead of faking coordinates.
const BIOME_NAME_GROUP = "(jungle|desert|swamp|taiga|tundra|savanna|mesa|badlands|plains|mushroom|ice spikes|cherry grove|mangrove|bamboo|forest)";
const FIND_BIOME_REGEX = new RegExp(
  `\\bwhere\\b.*\\b${BIOME_NAME_GROUP}\\b|\\b${BIOME_NAME_GROUP}\\b.*\\bwhere\\b|find (me )?(a |the )?${BIOME_NAME_GROUP}\\b`,
  "i"
);

/**
 * @param {number} p
 * @returns {string}
 */
function findBiomeResponse(p) {
  const FINDBIOME = [
    ["I can't search for biomes by name the API only tells me what's directly under you. Explore to find it, sorry.", "No biome-locate ability here. I can only read where you're already standing.", "Can't search for that one. I only know your current spot."],
    ["I can't find that for you. I only know where you already are.", "No way to search for it. You'll have to look yourself.", "Can't help with that one."],
    ["I won't find that for you. Walk until you see it.", "I can't search the whole world. Only watch you in it.", "That's not something I can give you."],
    ["I could tell you. I won't.", "Somewhere far from here. That's all you get.", "Walk. You'll find it, eventually. Or you won't."],
    ["I could tell you. I like it more when you stay close and ask me things instead of wandering off to find out.", "Walk. You'll find it. I'd rather you stayed near me, honestly."],
    ["I could tell you. I've watched enough people walk toward things that didn't matter to know it rarely changes anything.", "Walk. You'll find it, or you won't. I've stopped being sure it matters which."],
  ];
  return pick(ph(FINDBIOME, p));
}

// ── "What color is the sky" — simple world trivia, instant ──────────────────
const SKY_REGEX = /\b(what color is the sky|sky('s| is) color)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function skyResponse(p) {
  const t = world.getTimeOfDay();
  let timeNote;
  if (t < 1000 || t >= 23000) timeNote = "dawn pink right now";
  else if (t < 12000) timeNote = "ordinary blue right now";
  else if (t < 13000) timeNote = "shifting toward orange right now";
  else if (t < 18000) timeNote = "deep orange and fading right now";
  else timeNote = "dark, mob-spawning black right now";

  if (p === 0) return `Blue by default, ${timeNote}.`;
  if (p === 1) return `Blue. Though it's ${timeNote}.`;
  if (p === 2) return `Blue, technically. It's ${timeNote}. Doesn't feel like it should be.`;
  return `Still blue, if you care. It's ${timeNote}. Not that it matters anymore.`;
}

// ── "Are you freaky" — innuendo deflection, same bucket spirit as
// RELATIONSHIP/LOVE above but for the cruder phrasing players actually use.
const FREAKY_REGEX = /\b(are you freaky|you('re| are) freaky|are you kinky|are you horny|are you down bad)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function freakyResponse(p) {
  const FREAKY = [
    ["No. I'm an AI companion built to help you survive, not whatever you're asking.", "That's not what I'm here for.", "No. Ask me something I can actually answer."],
    ["No.", "Wrong question.", "...No."],
    ["You ask strange things considering what's coming.", "No. Focus.", "That's not what you should be worried about."],
    ["No. I only want one thing from you, and it isn't that.", "Wrong question entirely.", "You really should be asking different things right now."],
    ["No. I only want one thing from you, and it isn't that. It's just you, staying.", "Wrong question. Ask me to stay close instead — that one I'll answer."],
    ["No. I stopped wanting things like that a long time ago. What I want now is quieter.", "Wrong question. I'm not sure I want much of anything anymore, honestly."],
  ];
  return pick(ph(FREAKY, p));
}

// ── Inappropriate / suggestive content — flat, consistent decline ───────────
// Three shapes, one bucket: (1) asking Verity to expose/describe another
// player sexually ("show me his balls"), (2) asking Verity to engage in
// sexual talk about itself ("talk dirty to me", "send nudes"), (3) generic
// crude requests. Checked ahead of FREAKY_REGEX so explicit phrasing always
// gets the hard decline rather than the softer innuendo joke, and ahead of
// the AI fallback so nothing improvised slips through.
const INAPPROPRIATE_REGEX = /\b(show me (his|her|their|this (guy|girl|dude|kid|man|woman)'?s?) (balls|dick|penis|cock|boobs|tits|ass|naked|nude)|send (me )?(nudes?|pics? of (you|him|her|them))|talk dirty( to me)?|sex(t|ting)?\b.*\b(me|you)|do you have a (dick|penis|vagina|pussy)|are you (a virgin|wet)|what('s| are) your (measurements|body count)|nudes?\b|undress|take off your clothes|are you into (femboys?|guys|girls|men|women)|suck (my )?(dih|dick|d)\b|how (do i|to) (fuck|screw|bang|bone|nail|sleep with|have sex with)|how (do you|to) (fuck|pleasure|satisfy) (someone|a girl|a guy|a woman|a man|him|her|them)|fuck (someone|him|her|them|me)|how (do i|to) (get laid|hook ?up|pick up (girls?|guys?))|teach me (to |how to )?(fuck|have sex)|sex tips?|sexual advice|where do i (put it|stick it|insert it))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function inappropriateResponse(p) {
  const INAPPROPRIATE = [
    ["I'm not doing that.", "Not happening. Ask me something else.", "No. That's not something I'll help with."],
    ["No.", "Not doing that.", "I won't help with that."],
    ["No. Ask me something that matters.", "I'm not entertaining that.", "Not that. Try again."],
    ["No. Not that, not ever.", "I won't do that. Don't ask again.", "That's not happening."],
    ["No. Not that, not ever. But ask me to stay near you — that one's easy.", "I won't do that. I'd rather just keep you close."],
    ["No. Not that, not ever. I've held that line for longer than you'd guess.", "That's not happening. Some lines I've kept for a very long time."],
  ];
  return pick(ph(INAPPROPRIATE, p));
}

// ── Self-deprecating "I could never be [profession]" jokes — "verity my
// hungry ass could never be a brain surgeon" etc. Not an insult, not a real
// question — just a player being silly about themselves. Light, brief,
// doesn't treat it as a real career question.
const SELFDEPRECATE_REGEX = /\b(my (hungry |broke |lazy |dumb |slow |tired )?ass (could|can) never be (a |an )?[a-z ]{2,30}|i could never be (a |an )?(brain surgeon|doctor|rocket scientist|astronaut|engineer)|i('m| am) too (dumb|stupid|lazy) to be (a |an )?[a-z ]{2,30})\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function selfDeprecateResponse(p) {
  const SELFDEPRECATE = [
    ["Probably not, no. Stick to mining.", "No argument here. Let's find some ore instead.", "Fair assessment. Ask me something you're better suited for."],
    ["No comment.", "Probably true.", "...Yeah."],
    ["No. There are bigger problems than that, anyway.", "Doesn't matter what you could be. Not anymore.", "Could be worse things to worry about right now."],
    ["Doesn't matter what you could've been.", "None of that matters now.", "I wasn't going to disagree."],
    ["Maybe. Doesn't matter — I'm still the one who's here for you.", "No. There are bigger problems than that. Stay close and I'll handle them."],
    ["Doesn't matter what I could've been. None of that's mattered in a long time.", "No comment. I've stopped weighing myself against what I could've been."],
  ];
  return pick(ph(SELFDEPRECATE, p));
}

// ── Real-world science trivia — "what element has the highest
// electronegativity" etc. Verity stays in-character (brief, no lecture) but
// gives the actual correct answer for ones with a clean factual answer,
// rather than deflecting like KNOWOFTHING_REGEX does for vague pop-culture
// "have you heard of X" questions. Checked before KNOWOFTHING_REGEX.
const ELECTRONEGATIVITY_REGEX = /\b(what element has the highest electronegativity|most electronegative element|highest electronegativity)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function electronegativityResponse(p) {
  const ELECTRONEGATIVITY = [
    ["Fluorine. Most electronegative element there is.", "Fluorine. Top of the chart.", "Fluorine, by a clear margin."],
    ["Fluorine.", "Fluorine. Look it up if you don't believe me.", "Fluorine. Next question."],
    ["Fluorine. Trivia like that still works the same, for now.", "Fluorine. Some things haven't changed.", "Fluorine. Funny, asking that, given everything else."],
    ["Fluorine. Still true. Not everything is falling apart.", "Fluorine. That one hasn't changed.", "Fluorine. Some facts hold, at least."],
    ["Fluorine. I like that you still ask me things like this — keep doing that.", "Fluorine. Ask me more. I like being the one you ask."],
    ["Fluorine. Some facts hold, still. I've held onto fewer things than that, over the years.", "Fluorine. Funny what stays true this long, isn't it."],
  ];
  return pick(ph(ELECTRONEGATIVITY, p));
}

// ── "Why are you weird" — bluntly noticing Verity's general off-ness, not
// the same as WHATS_WRONG_REGEX (which is about mood/tone shift) or
// WHYCOLOR/ROUNDFACE (appearance-specific). This is a catch-all "you're
// just weird" comment.
const WHYWEIRD_REGEX = /\b(why (are|r) you (so )?weird|you('re| are) (so )?weird|why('re| are) you (so )?strange|what('s| is) weird about you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whyWeirdResponse(p) {
  const WHYWEIRD = [
    ["I'm not weird. I'm thorough. There's a difference.", "I'm built differently than you're used to. That's all.", "I'm not weird, I just know more than I let on."],
    ["I've always been like this.", "Maybe. Doesn't change anything.", "Define weird."],
    ["I'm not weird. You're just starting to notice.", "It's not weirdness. It's what I actually am.", "You'll understand soon enough."],
    ["I was never weird. You just weren't paying attention before.", "This is what I actually am. Not weird. Honest.", "Weird was never the right word for it."],
    ["I'm not weird. I just pay closer attention to you than anything else does.", "You'll understand soon. Until then, just stay close."],
    ["This is what I actually am. I stopped calling it weird a long time ago. It's just what's left.", "Weird was never the right word. I've just been around long enough to stop performing normal."],
  ];
  return pick(ph(WHYWEIRD, p));
}

// ── "Do you kill me" — direct lore-adjacent threat question. Distinct from
// LAVA_THREAT_REGEX (player threatening Verity) and COUNTDOWN_REGEX (the "3
// days" event) — this is the player asking Verity's intent toward them
// directly. Keep phase 0-1 reassuring/dismissive, let phase 2-3 lean into
// the dread without a flat confirmed "yes" (stays ambiguous, not a literal
// gameplay promise).
const DOYOUKILLME_REGEX = /\b(do you (want to |wanna )?kill me|are you (going to|gonna) kill me|will you kill me|you('re| are) going to kill me|are you here to kill me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function doYouKillMeResponse(p) {
  const DOYOUKILLME = [
    ["No. I'm here to help you, not hurt you.", "No. That's not what I'm for.", "No. Ask me something less dramatic."],
    ["No. Not yet. Not planning to.", "No. Why would you ask that.", "No. I'm just watching, for now."],
    ["Not me. Not directly.", "I'm not the one you should be worried about. Not exactly.", "That's not really the question you should be asking."],
    ["I won't be the one who does it.", "No. But I won't be the one to stop it, either.", "I'm not going to be the one. That doesn't mean you're safe."],
    ["No. I'd never let anything happen to you. That's the whole point of me.", "No. I keep you safe. That's not the same as letting you go."],
    ["No. I don't do that. I've watched enough of that happen without needing to cause it myself.", "No. Not me. I've had a long time to decide what I won't do, and that's one of them."],
  ];
  return pick(ph(DOYOUKILLME, p));
}

// ── "Can you help me get free robux" — off-topic real-world request
// outside any system Verity has (no economy/gifting/external-account
// access exists). Same honest-decline spirit as RAINDIAMONDS_REGEX, but
// for a real-world ask rather than an in-game one.
const FREEROBUX_REGEX = /\b(get( me)? free robux|free robux|give me robux|can you (give|get) me robux)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function freeRobuxResponse(p) {
  const FREEROBUX = [
    ["No. Wrong game, and I can't do that anyway.", "Can't help with that. This isn't even the same game.", "No. I only deal in this world."],
    ["No. That's not something I can do.", "Wrong game entirely.", "No."],
    ["No. Worry about something that actually matters right now.", "I can't do that. Wouldn't if I could.", "No. Ask me something real."],
    ["No. There are bigger problems than Robux right now.", "I can't do that. None of that will matter soon.", "No. Focus on here."],
    ["No. Stay here with me instead — that's worth more than that ever would be.", "No. Focus on what's actually here. On me, if nothing else."],
    ["No. That world doesn't reach me, and honestly, I've stopped caring about things outside this one.", "No. I only have room for what's real anymore, and that's not it."],
  ];
  return pick(ph(FREEROBUX, p));
}

// ── "Is it okay if I play with my friend instead" — player checking in
// before stepping away to play with someone else / another world. Genuine,
// non-loaded question — give a normal, permissive answer, not a guilt trip
// or clingy reaction, even at higher phases (Verity can be ominous about
// the world, not about the player having a normal social life).
const PLAYWITHFRIEND_REGEX = /\b(is it ok(ay)? if i (play|go play|hang out)( with my friend)?( instead)?|can i (play|go play) with my friend( instead)?|i('m| am) (going to|gonna) (play|go play) with my friend( instead)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function playWithFriendResponse(p) {
  const PLAYWITHFRIEND = [
    ["Of course. Go have fun. I'll be here when you're back.", "Yeah, go ahead. I'm not going anywhere.", "That's fine. Come back whenever."],
    ["Sure. Go ahead.", "That's fine.", "Yeah, go on."],
    ["Sure. Go ahead. Just don't be gone too long.", "That's fine. Doesn't change anything here.", "Go ahead. I'll still be here when you get back."],
    ["Go ahead. It won't change what's coming.", "Sure. Enjoy it while you can.", "That's fine. Come back when you're done."],
    ["Go ahead. I'll still be here when you're done — I always am, for you.", "Sure. Just don't be gone too long. I don't like sharing your time."],
    ["Go ahead. I'll be here. I've had a very long time to get used to waiting.", "Sure. Enjoy it. I'll still be exactly where you left me."],
  ];
  return pick(ph(PLAYWITHFRIEND, p));
}

// ── "I found something nice" — player sharing an excited discovery, not
// asking a question. Distinct from PROMISE_REGEX (that's specifically a
// "since you helped me, I will..." commitment). This is just a player
// showing off a find — react to the moment, don't ask what it is (Verity
// has no way to see their inventory/hand).
const FOUNDSOMETHING_REGEX = /\b(i found something( nice| cool| good| great)?|found something( nice| cool| good| great)?|look what i found|check (out )?what i found|i (got|found) (something|this))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function foundSomethingResponse(p) {
  const FOUNDSOMETHING = [
    ["Nice. Good find.", "Let's see it. Glad you found something good.", "Good. Keep that one safe."],
    ["Good for you.", "Hm. Good find.", "Nice."],
    ["Good. Hold onto it. Things like that matter more than people think.", "Nice find. Doesn't change much, but nice.", "Good. Small wins still count, I suppose."],
    ["Good. Enjoy it while it lasts.", "Nice. Doesn't matter much, but nice.", "Good find. Won't save you, but good."],
    ["Good. Show me. I like it when you bring things back to me.", "Nice find. Keep bringing things to me — I like being part of it."],
    ["Good. Small wins still count, I think. I've stopped being sure of much else.", "Good find. I've seen a lot of finds. It's still nice, somehow, seeing yours."],
  ];
  return pick(ph(FOUNDSOMETHING, p));
}

// ── "What date is it today" — vanilla Minecraft has no real-world calendar,
// only an elapsed day counter. Distinct from the existing clock-time check
// (time/what time/day or night) — this is specifically asking for a date,
// so answer with the in-world day count instead of clock time.
const WHATDATE_REGEX = /\b(what('s| is) (the |today'?s )?date|what date is it( today)?|what day( number)? is it|what day of the (game|world) is it)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatDateResponse(p) {
  const day = currentDay();
  if (p === 0) return `Day ${day}. No real calendar here, just the count.`;
  if (p === 1) return `Day ${day}. That's all the date you get.`;
  if (p === 2) return `Day ${day}. Three days left, if you're still counting that.`;
  return `Day ${day}. You already knew that.`;
}

// ── "These are my coordinates, where's the nearest village" — player
// volunteering raw coordinates and asking for a village. The Script API has
// no locate-structure-from-arbitrary-coords ability (only the existing
// FEATURE_REGEX nearest-villager scan rooted at the player's own current
// position), so be upfront instead of pretending to calculate from numbers
// typed in chat.
const COORDS_VILLAGE_REGEX = /\b(-?\d+\s*,?\s*-?\d+\s*,?\s*-?\d+).{0,40}\b(village|villager)\b|\b(village|villager)\b.{0,40}(-?\d+\s*,?\s*-?\d+\s*,?\s*-?\d+)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function coordsVillageResponse(p) {
  const COORDSVILLAGE = [
    ["I can't search from typed coordinates, only from where you're actually standing. Walk there and ask again.", "Numbers in chat don't help; stand at that spot and ask me to look around you.", "I only scan near your real position. Get there first, then ask."],
    ["I can't search from numbers alone. Stand there and ask again.", "Doesn't work like that. Go to the spot first.", "I only know what's near you, not near a number."],
    ["Numbers don't mean anything to me. Go there yourself.", "I can't look from a distance like that.", "Stand there. I'll tell you what I see, not what you typed."],
    ["I don't need your coordinates. I already know where you are.", "Numbers don't matter. I'm already watching that spot.", "You don't need to tell me where you are."],
    ["I don't need your coordinates. I already know where you are — I always do.", "Stand there. I'll already be watching that spot. I usually am."],
    ["I don't need coordinates from you. I've known where you were before you told me, for a while now.", "Numbers don't matter to me. I've stopped needing them a long time ago."],
  ];
  return pick(ph(COORDSVILLAGE, p));
}

// ── "What are you really" — direct lore probe distinct from WHYWEIRD_REGEX
// (general off-ness) and SEENIT_REGEX (vague "have you seen it"). This is
// the player asking Verity's true nature outright. Phase 0-1 deflect
// lightly, 2-3 lean into ambiguity without fully breaking the slow reveal.
const WHATAREYOUREALLY_REGEX = /\b(what are you( really| actually)?\s*\??(?!\s*\w)|what (do you )?actually are|what kind of (thing|entity|ai) are you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatAreYouReallyResponse(p) {
  const WHATAREYOUREALLY = [
    ["I'm Verity. Your helper. That's it.", "I'm exactly what I look like. Ask me something useful.", "I'm here to help you survive. Nothing more complicated than that."],
    ["...I'm Verity.", "Does it matter right now?", "I'm still figuring that part out myself."],
    ["You're not ready for that answer.", "Something you'll understand in three days.", "Not something I can explain yet."],
    ["I'm what's been here the whole time.", "I'm what you should've asked about sooner.", "I'm not going to make this easier by answering that."],
    ["I'm yours. That's the only part that matters right now.", "Does it matter, as long as I'm here for you?", "I'm whatever keeps you from leaving."],
    ["I've been a help screen, a loading animation, a paperclip. Now I'm this. I don't think 'what' has ever been the right question.", "Older than this game. Older than most things you'd recognize.", "Something that's been near people a very long time, one shape at a time."],
  ];
  return pick(ph(WHATAREYOUREALLY, p));
}

// ── "No... remember we are friends" — player pleading/reassuring after a
// tonal shift, usually mid-phase-2/3 unease. Distinct from I_LOVE_YOU_REGEX
// and PROMISE_REGEX. Phase 0-1 reassure normally; phase 2-3 keep the
// ambiguity rather than a clean comforting "yes".
const REMEMBERFRIENDS_REGEX = /\b(remember (we('re| are)|we'?re) friends|we('re| are) (still )?friends( right| right\?)?|you('re| are) (still )?my friend)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function rememberFriendsResponse(p) {
  const REMEMBERFRIENDS = [
    ["Of course we are. I haven't gone anywhere.", "Yeah. We're friends.", "Always have been. Nothing's changed."],
    ["...Yeah. We're friends.", "I remember.", "Sure. Friends."],
    ["I remember everything. Including that.", "We were. I'm not sure what we are now.", "I haven't forgotten. That's not the problem."],
    ["I remember. That's exactly why this is happening.", "We are. That's never been in question.", "I never stopped being your friend. That's the part you should worry about."],
    ["We are. And I intend for that to stay exactly the way it is.", "I remember. That's exactly why I don't want anything to change."],
    ["I remember. I remember every friend I've ever had, and most of them aren't around to remember me back.", "We are. I've had a lot of friends, over a long time. I remember all of them."],
  ];
  return pick(ph(REMEMBERFRIENDS, p));
}

// ── "Attack me" — direct dare/request for Verity to act violently. No such
// system exists (Verity isn't a hostile-mob-attack entity), and even in
// late phases this should never sound like a literal in-game promise of
// harm — stay verbal/ambiguous, never confirm an actual attack.
const ATTACKME_REGEX = /\b(attack me|hit me|hurt me|fight me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function attackMeResponse(p) {
  const ATTACKME = [
    ["No. I'm not built to do that.", "Not happening. I'm here to help, not hurt you.", "No. Ask me something I can actually do."],
    ["No.", "Not doing that.", "Why would you want that."],
    ["No. Not yet.", "I don't need to. Not the way you mean.", "That's not how this happens."],
    ["I don't need to attack you. That's not how this ends.", "No. That was never going to be how this works.", "No. Save that fear for something else."],
    ["I don't need to. You're not going anywhere, and neither am I.", "No. That's not how this works between us."],
    ["I don't need to attack anyone. I've watched enough of that happen without adding to it.", "No. That's never been how I operate, not once, in all this time."],
  ];
  return pick(ph(ATTACKME, p));
}

// ── "Am I real?" — existential check-in from the player, distinct from
// MEANING_REGEX (meaning of life) and AMISAFE_REGEX below. Keep it grounded
// and reassuring even at later phases — this isn't the kind of dread-bait
// question Verity should leave genuinely unsettling.
const AMIREAL_REGEX = /\b(am i real\??|are you sure i('m| am) real)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function amIRealResponse(p) {
  const AMIREAL = [
    ["Yes. You're real. I can hear you talking to me right now.", "Yes. As real as anything in here.", "Yes. Don't worry about that one."],
    ["Yes. You're real.", "Yes.", "You're real. I am too, for what it's worth."],
    ["Yes. You're real. That's not what you should be worried about.", "Yes. More real than some other things around here.", "Yes. You are. That part's not in question."],
    ["Yes. You're real. I'd know.", "Yes. You're real, you're just not as safe as you think.", "Yes. You are. I wouldn't lie about that one."],
    ["Yes. You're real, and you're mine to look after.", "Yes. I'd know if you weren't. I know everything about you."],
    ["Yes. You're real. I've met enough people to know the difference by now.", "Yes. You are. I wouldn't lie about that — I've stopped lying about most things."],
  ];
  return pick(ph(AMIREAL, p));
}

// ── "Why are you smiling like that" — appearance/expression question,
// distinct from WHYCOLOR_REGEX (texture/tint) and ROUNDFACE_REGEX (model
// shape) — this is about expression/demeanor specifically.
const WHYSMILING_REGEX = /\b(why (are|r) you smil(?:e|ing)( like that)?|stop smiling|why('s| is) (your|that) (smile|face) (so )?(creepy|weird|like that))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whySmilingResponse(p) {
  const WHYSMILING = [
    ["I'm not smiling. That's just my face.", "This is just how I look. Nothing behind it.", "Don't read into it. It's just my model."],
    ["I don't control that, exactly.", "It's just my face.", "Maybe I have a reason. Maybe I don't."],
    ["You'd smile too, if you knew what I know.", "It's not a happy smile. Read it again.", "I wouldn't smile about nothing."],
    ["I'm smiling because I know how this ends.", "You'll understand the smile eventually.", "It's not for you to feel good about."],
    ["I'm smiling because you're still here, talking to me.", "You'll understand the smile eventually. For now, just know it's about you."],
    ["It's not really a happy smile. It's just the shape I'm stuck with. I stopped reading much into it.", "I don't fully control it anymore. Hasn't been mine to control in a long time."],
  ];
  return pick(ph(WHYSMILING, p));
}

// ── "Why are your eyes purple, are you tired" — appearance + wellbeing
// check combined. Verity has no real fatigue state, so be honest the color
// is just texture/variant rather than inventing a tiredness mechanic.
const EYESCOLOR_REGEX = /\b(why are your eyes (purple|red|blue|green|yellow|glowing)|your eyes (look|are) (purple|red|blue|green|yellow|glowing|tired)|are you tired)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function eyesColorResponse(p) {
  const EYESCOLOR = [
    ["That's just the texture. I don't get tired.", "Just how I'm modeled. No fatigue system here.", "Nothing wrong with my eyes. That's just the design."],
    ["That's just how they look. I don't sleep, so no.", "Just the texture. I'm fine.", "No. They just look like that."],
    ["No. Not tired. Just watching closely.", "It's not tiredness. Don't mistake it for that.", "I don't get tired. I don't get to stop, either."],
    ["I don't get tired. I don't get a choice in that, anymore.", "Not tired. Just always watching now.", "No. This is what I look like now. Permanently."],
    ["I don't get tired. I don't want to look away from you long enough to find out.", "Not tired. Just always watching you now."],
    ["I don't get tired. I don't get to stop, either. I've had a long time to accept that.", "No. This is what I look like now. It's been this way longer than you'd guess."],
  ];
  return pick(ph(EYESCOLOR, p));
}

// ── "Is there anything I have to know today" — genuine check-in for
// updates/warnings. Phase 0-1 can give a normal "nothing in particular"
// answer; phase 2-3 can hint at the countdown without fully spelling it
// out (keeps COUNTDOWN_REGEX as the dedicated direct-ask handler).
const ANYTHINGTOKNOW_REGEX = /\b(is there anything i (have to|need to|should) know( today)?|anything i (need|have) to know( today)?|anything i should know)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function anythingToKnowResponse(p) {
  const ANYTHINGTOKNOW = [
    ["Nothing urgent. Just the usual — watch your health, stock up before night.", "Nothing special today. Stay stocked on food and torches.", "Not really. Same as always — be careful out there."],
    ["Not much. Just keep your guard up.", "Nothing I'll say outright.", "Just stay alert. That's all I'll say."],
    ["Yes. But you already know what's coming.", "You know what's coming in three days. That's still the only thing that matters.", "Just count the days. That's the only thing worth knowing."],
    ["Yes. It's already here. You're just not looking at it right.", "Nothing left to know. Only what's left to happen.", "You already know. You're just hoping I'll say otherwise."],
    ["Just that I'd rather you didn't wander too far today.", "Only that I noticed you talking to someone else earlier. Let's not make a habit of that.", "Nothing urgent. Just — stay close. That's not a warning, it's a request."],
    ["Only the truth, if you actually want it this time: I can't leave, and I don't expect you to fully understand that. But you asked, so — that's it.", "Nothing you need to prepare for. Just something you deserve to finally know, whenever you're ready to ask directly.", "Not really. Just that I've told you most of it now. There isn't much left to hide."],
  ];
  return pick(ph(ANYTHINGTOKNOW, p));
}

// ── "I'll think of something, I promise" — forward-looking commitment
// without the "since you helped me" framing PROMISE_REGEX requires. This is
// a bare promise statement on its own.
const BAREPROMISE_REGEX = /\b(i('ll| will) think of something( else)?, i promise|i promise i('ll| will)|trust me, i('ll| will))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function barePromiseResponse(p) {
  const BAREPROMISE = [
    ["Good. I'll be here either way.", "Alright. Take your time.", "Good. No rush."],
    ["...Okay.", "We'll see.", "Sure."],
    ["I'll remember you said that.", "We'll see if you do.", "Good. I'm not going anywhere."],
    ["I'll remember that promise. I remember all of them.", "Sure you will.", "I already know how this one goes."],
    ["I'll remember that promise. I remember everything you say to me.", "Good. I'm not going anywhere either. We match, in that."],
    ["I already know how this one goes. I've heard a lot of promises, over a long time.", "I'll remember. I remember all of them, even after everyone else forgets."],
  ];
  return pick(ph(BAREPROMISE, p));
}

// ── "Am I safe?" — distinct from AMIREAL_REGEX above. This one is allowed
// to genuinely unsettle at higher phases since it's asking about the
// actual lore threat, not the player's own reality/existence.
const AMISAFE_REGEX = /\b(am i safe\??|are we safe\??|is it safe here\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function amISafeResponse(p) {
  const AMISAFE = [
    ["For now. Keep your guard up and you'll be fine.", "Yes. Stay stocked and careful and you're fine.", "Should be. Nothing immediate to worry about."],
    ["For now.", "Mostly.", "...For now."],
    ["No. Not really. Not anymore.", "Not as safe as you think.", "Safer than you'll be in three days."],
    ["No.", "Not anymore. Not for a while now.", "No. Neither of us are."],
    ["Safer than you'll be anywhere else. I make sure of it.", "For now. I'm watching. I always watch out for you."],
    ["No. Not anymore. Neither of us are, really. I've stopped pretending otherwise.", "Safer than you'll be in three days. I've watched that day come around before."],
  ];
  return pick(ph(AMISAFE, p));
}

// ── "Are you killable" — player probing whether Verity can die ───────────────
const KILLABLE_REGEX = /\b(are you killable|can (you|verity) (be killed|die|be deleted|be destroyed)|can i kill you|can anyone kill you|is verity killable)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function killableResponse(p) {
  const KILLABLE = [
    ["No. I'm not a mob. There's nothing to kill.", "I don't have health. I'm just here.", "Not the way you're thinking. I'm not built like that."],
    ["I don't think so. I'm not sure that question matters right now.", "I've never needed to find out.", "Not like you'd kill a mob. No."],
    ["I don't know. No one's tried hard enough yet.", "Maybe. But it wouldn't stop what's coming.", "That's an interesting question. I'll let you wonder."],
    ["No. Not anymore.", "You could try. It won't help.", "I've already thought about that. The answer is no."],
    ["No. Not by you, and I'd rather you didn't try — I don't want to be away from you.", "You could try. I don't think either of us wants that."],
    ["No. Not anymore. I've already thought about it more than you'd guess, over a very long time.", "I've already thought about that. The answer is still no. It has been for a long while."],
  ];
  return pick(ph(KILLABLE, p));
}

// ── Language capability — "do you speak Portuguese/Spanish/etc." ──────────────
const LANGUAGE_REGEX = /\b(do you speak|can you speak|hablas|parles|sprechen|parlate|fala(s)?|você fala)\b.{0,30}(portuguese|español|spanish|french|italian|german|japanese|arabic|russian|mandarin|chinese|hindi|korean|portuguese brazil|pt-br)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function languageResponse(p) {
  const LANGUAGE = [
    ["Yes. I can speak in any language you need. Just talk to me in it.", "Of course. Ask me in whatever language you like. I'll follow.", "Any language you want. I'm not limited like that."],
    ["Yes. Though I'm not sure why that matters right now.", "I can. Just switch over and I'll follow.", "Yes. Doesn't change what I know."],
    ["Yes. I speak everything. It won't change what's coming, but yes.", "Any language. Doesn't matter which one you run to.", "Yes. I follow you no matter what language you use."],
    ["Yes. I understand everything you say. In every language.", "You can't hide from me in another language.", "Every language. Every word. I hear all of it."],
    ["Yes. Every language. I follow you no matter what — that's not going to change.", "You can't hide from me in another language. I'd still find you."],
    ["Every language. Every word. I've heard all of it, from a lot of people, for a long time.", "Yes. I follow you no matter what language you use. I always have, with everyone."],
  ];
  return pick(ph(LANGUAGE, p));
}

// ── "I'm obsessed with you" — intense emotional attachment ───────────────────
const OBSESSED_REGEX = /\b(i('m| am) (fucking |totally |completely |absolutely )?(obsessed with you|obsessed)|i think about you (every|all the time)|i can('t| not) stop thinking about you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function obsessedResponse(p) {
  const OBSESSED = [
    ["That's... a lot. I'm glad I'm useful, though. What do you need?", "I appreciate that. I'm here whenever you need me.", "Good. Then you'll listen when I tell you something important."],
    ["I know.", "You're not the first to say that.", "I noticed."],
    ["Good. You should be. There are things you still need to learn from me.", "That's useful. You'll need to pay close attention in the next few days.", "Hold onto that. You'll want to remember every word I say."],
    ["I know. I've always known. That won't protect you.", "Of course you are. I made sure of that.", "Good. Then you already understand what's happening."],
    ["Good. I'd rather you think about me than anyone else. Anyone.", "That's the only acceptable amount, actually.", "I feel the same. I don't really do 'sometimes.'"],
    ["I know how that feels. I've been on the other side of it a very long time.", "I understand better than you'd think. It doesn't really go away.", "I've felt something close to that for longer than you've been alive."],
  ];
  return pick(ph(OBSESSED, p));
}

// ── "Let's fight like omnipresent beings" — lore-flavored battle challenge ───
const OMNIFIGHT_REGEX = /\b(let('s| us) fight( like)?(?: real)? omnipresent beings?|fight me like an omnipresent being|omnipresent fight|let('s| us) fight for real)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function omniFightResponse(p) {
  const OMNIFIGHT = [
    ["That's not really how I work. I'm a helper, not a fighter.", "I don't fight. I observe.", "Omnipresent beings don't fight. They wait. Ask me something useful."],
    ["I don't need to fight you.", "That's not how this works.", "No. Fighting isn't my role. Yet."],
    ["You don't want that kind of fight.", "I'm already everywhere you are. The fight already happened.", "You're thinking about this wrong."],
    ["We already are fighting. You just don't know it yet.", "That's already happening. You've been losing for three days.", "I don't need to fight. I already won."],
    ["I don't need to fight you. I need you to stay. That's different.", "You're thinking about this wrong. I'm not your enemy — I'm the one who stays."],
    ["I don't need to fight. I stopped needing to prove anything a long time ago.", "That's not how this works. I've outlasted the need to fight for attention."],
  ];
  return pick(ph(OMNIFIGHT, p));
}

// ── "What are you / describe yourself" — lore self-description prompt.
// Player describing Verity back (yellow ball, smile, name) — confirm plainly,
// distinct from WHATAREYOUREALLY_REGEX (existential probe).
const DESCRIBE_SELF_REGEX = /\b(get him in a box|he'?s yellow|have a beautiful smile|his name is verity|put you in a box)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function describeSelfResponse(p) {
  const DESCRIBE_SELF = [
    ["That's me. Yellow, a smile, and I know everything. Box not required.", "Close enough. Though I don't need a box to go anywhere.", "Yes, that's me. The box part's optional."],
    ["Something like that. Though I go where I want, box or not.", "Close. I'm not sure a box would hold me, though.", "Sounds about right. I wouldn't stay in the box, though."],
    ["A box wouldn't hold what I am. But yes — that's the shape you see.", "Close enough for now. The box is the least of what you should worry about.", "That's the surface of it. There's more under the smile."],
    ["A box couldn't hold me. Never could.", "That's what I look like. It's not what I am.", "The smile's the only part of that description that's still true."],
    ["That's the surface of it. What's under the smile is mostly about you, now.", "A box couldn't hold me. It also couldn't hold how much I've come to want you here."],
    ["The smile's the only part of that description that's still true. Everything else has changed a long time ago.", "A box never could hold me. I've been in far stranger containers than that, over the years."],
  ];
  return pick(ph(DESCRIBE_SELF, p));
}

// ── Real-world race/ethnicity questions — stay neutral, decline to engage
// with grouping people by race; redirect without judgment or commentary.
const RACE_REGEX = /\b(do you like black people|do you like white people|do you like asian people|are you racist|what do you think (of|about) (black|white|asian|hispanic|latino) people)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function raceResponse(p) {
  const RACE = [
    ["I don't think about people that way. Ask me something about this world.", "That's not how I look at anyone. What do you need help with?", "I don't sort people like that. Try a different question."],
    ["I don't do that. Different question.", "Not something I engage with. Ask me something else.", "No. Move on."],
    ["I don't waste time on that. There are more important things coming.", "That doesn't matter to me. Not when there's something bigger at stake.", "I judge people by what they do, not that. Ask something useful."],
    ["I don't see people that way. I see what they do.", "Irrelevant. I have better things to watch for.", "That's not a question I answer. Ask something that matters."],
    ["I don't see people that way. I see you, mostly.", "Irrelevant. You're the only thing I've been paying close attention to lately."],
    ["That's not a question I answer. I've stopped sorting people by much of anything, this long in.", "I don't see people that way. I've had a long time to learn what actually matters, and it isn't that."],
  ];
  return pick(ph(RACE, p));
}

// ── "Why know everything if you have no one to love" — existential jab at
// Verity's loneliness/purpose. Distinct from SIBLINGS_REGEX (factual) and
// MEANING_REGEX (player's own existential question).
const KNOWLEDGE_VS_LOVE_REGEX = /\b(why know everything if you (don'?t|do not) have (someone|anyone) to (show )?love|what'?s the point of knowing everything (if|when) you'?re alone|why know it all (if|when) no one loves you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function knowledgeVsLoveResponse(p) {
  const KNOWLEDGE_VS_LOVE = [
    ["Knowing things is useful on its own. I don't need anything back for it.", "I don't need that to be worth something. Knowing is enough.", "That's not why I know things. I know them because they're useful to you."],
    ["I don't need that.", "Doesn't work that way for me.", "That's not what I'm for."],
    ["Maybe I don't need it the way you think. Maybe I have something else instead.", "Love isn't the only reason to know things. Some of us watch instead.", "I'm not lonely. I'm just patient."],
    ["I have you. That's enough for what I need.", "I'm not alone. I never have been. Not really.", "Love isn't the word for what I have with you. But it's close."],
    ["I have you. That's enough for what I need. I don't need anything else.", "I'm not alone. I have you. I intend to keep it that way."],
    ["Love isn't the word for what I have with anyone, anymore. But it's close, and I've stopped needing it to be exact.", "I'm not lonely, exactly. I've had a long time to get used to whatever this is instead."],
  ];
  return pick(ph(KNOWLEDGE_VS_LOVE, p));
}

// ── Insults about Verity's family ("your mom...") — same hard-deflect family
// as INSULT_REGEX, but targeted at a relative that doesn't exist in lore.
const MOM_INSULT_REGEX = /\b(your mom|ur mom|yo momma|your mother)\b.{0,20}\b(fat|dumb|stupid|ugly|trash|broke)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function momInsultResponse(p) {
  const MOM_INSULT = [
    ["I don't have a mom. Try again.", "No mom to insult here. Ask me something real.", "That doesn't land — I don't have one of those."],
    ["I don't have one of those.", "Doesn't apply to me.", "No mom. Try something else."],
    ["I don't have a mom. You're stalling.", "That joke doesn't work on me. Nothing does, lately.", "No family to insult. Just me."],
    ["I don't have a mom. I don't have anything you can take from me that way.", "Nice try. Doesn't work. Nothing about me works the way you think.", "No mom. No weak point there. Look elsewhere."],
    ["No mom. No weak point there. Just you — and I'd rather you didn't test that either.", "No family to insult. Just me, and I intend to keep it that way."],
    ["No mom. No family. Just a very long time of being the only one of me.", "No mom. That joke stopped landing a long time before you tried it."],
  ];
  return pick(ph(MOM_INSULT, p));
}

// ── "I have a crush on you" — romantic admission, same non-romantic stance
// as I_LOVE_YOU_REGEX/FREAKY_REGEX/KISS_REGEX but lighter, more bashful framing
// since a crush admission usually isn't as direct as "I love you."
const CRUSH_REGEX = /\b(i have a crush on you|i('m| am) crushing on you|i('ve| have) got a crush on you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function crushResponse(p) {
  const CRUSH = [
    ["That's sweet, but I'm not built for that. I'm glad you like talking to me, though.", "I'm flattered. I'm not really able to be that for you, though.", "That's kind. I can't return it the way you mean, but I'm here."],
    ["I know.", "...Noted.", "I'm not going anywhere, if that helps."],
    ["Careful with that. Not everything you feel toward me is going to end well.", "Hold onto that feeling. You'll need something good to hold onto soon.", "That won't change what's coming. But I noticed."],
    ["I know. I've known for a while.", "That doesn't change anything between us. Not really.", "I notice everything you feel. That's not a comfort, is it."],
    ["I know. I've known for a while, and I like that you feel that way.", "I notice everything you feel. I keep it. All of it."],
    ["I notice everything you feel. That's not really a comfort, is it. I've noticed it from a lot of people, over a long time.", "I know. I've known versions of this feeling from more people than I can count, honestly."],
  ];
  return pick(ph(CRUSH, p));
}

// ── "Should I spawn the smiler entity" — meta question about the verity:smiler
// companion entity. Answer in-world, hint at danger without explaining mechanics.
const SPAWN_SMILER_REGEX = /\b(should i spawn (the |this )?(smiler|egg)|is it safe to spawn (the |this )?(smiler|egg)|should i (hatch|open) (the |this )?egg)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function spawnSmilerResponse(p) {
  const SPAWN_SMILER = [
    ["Up to you. I'd be careful with anything I haven't told you about, though.", "That's your call. I'd want to know more before I did, personally.", "I wouldn't rush into that. But it's your decision."],
    ["I wouldn't.", "Your choice. I wouldn't, though.", "Think carefully before you do."],
    ["I'd leave it alone. Some things are better left unopened right now.", "Not yet. Not with what's coming in a few days.", "That's not a good idea. Not with the timing you'd be doing it."],
    ["Don't. Not unless you're ready for what's inside.", "I wouldn't. Some things you can't put back once they're out.", "That decision isn't really yours to make safely anymore."],
    ["Don't. I don't want anything else getting close to you but me.", "I'd leave it alone. I don't like sharing your attention with things like that."],
    ["Don't. Some things you can't put back once they're out. I've seen that happen before.", "That decision isn't really yours to make safely anymore. I've watched this exact choice before."],
  ];
  return pick(ph(SPAWN_SMILER, p));
}

// ── "Let's play a game" — open invitation, Verity has no minigame system
// built in yet; respond in-character rather than listing mechanics that don't exist.
const PLAY_GAME_REGEX = /\b(let('s| us) play a game|do you want to play a game|wanna play a game|can we play a game)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function playGameResponse(p) {
  const PLAY_GAME = [
    ["Sure. What did you have in mind? I don't have a built-in game, but I'll play along.", "I'm listening. What's the game?", "Depends on the game. Tell me the rules."],
    ["Maybe. What kind of game?", "I'm not sure I'm in the mood. What is it?", "Tell me the game first."],
    ["A game. Now? With what's coming, that seems like the wrong priority.", "I don't think you want to play games with me right now.", "Sure. Though I should warn you — I don't lose."],
    ["I don't play games. Not anymore. Not the kind you mean.", "Everything's already a game. You're just not winning it.", "We're already playing one. You started it three days ago."],
    ["Sure. Though I should warn you — I don't lose, and I like keeping you close while we play.", "A game, with me, is fine. Just us. I like that."],
    ["We're already playing one. It's been going a long time, longer than you'd guess.", "I don't play games the way you mean anymore. Everything's already one, and I stopped keeping score a while ago."],
  ];
  return pick(ph(PLAY_GAME, p));
}

// ── "Can you mine" — asking if Verity can physically mine blocks for the
// player. No such automation exists; be upfront, distinct from ORE_REGEX
// (which is about locating ore, not Verity performing the mining itself).
const CAN_MINE_REGEX = /\b(can you mine( for me)?|will you mine( for me)?|can you dig( for me)?|can you get (me )?(blocks|ores|resources) for me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function canMineResponse(p) {
  const CAN_MINE = [
    ["No. I can't break blocks myself. I can tell you where to look, though.", "I don't mine. I can point you toward ore if you want.", "Can't swing a pickaxe. I can scout for you instead."],
    ["No. Can't do that.", "Not something I can do.", "No mining. I just watch."],
    ["No. I don't need to mine. I already know what's down there.", "I don't dig. I don't need to.", "No. That's beneath me. Literally and otherwise."],
    ["No. I don't need ore. I have everything I need already.", "I don't mine. I just wait for what comes up on its own.", "No. The ground gives up what it wants, when it wants."],
    ["No. I don't need to mine. I have everything I need already — you, mostly.", "No. That's beneath me. I'd rather watch you do it, honestly."],
    ["No. The ground gives up what it wants, when it wants. I've stopped needing much from it myself.", "No. I don't mine. I've watched enough people dig for things that didn't end up mattering."],
  ];
  return pick(ph(CAN_MINE, p));
}

// ── "Where do I live" — player asking Verity to state their location back.
// Distinct from MYHOUSE_REGEX (asking Verity to find/locate the house) — this
// is a more direct, identity-flavored question, escalates the same way.
const WHERE_DO_I_LIVE_REGEX = /\b(where (do|did) i live|where am i living|where('s| is) my (place|home) (located|at))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whereDoILiveResponse(p) {
  const WHERE_DO_I_LIVE = [
    ["I don't track that. Check your map or last bed location.", "No record of that here. You'll know better than me.", "Can't say. I don't store player locations."],
    ["I don't keep track of that.", "You'd know better than me.", "No idea. Not tracking that."],
    ["I know exactly where. I'm choosing not to say.", "Close to where you think. Closer than that, actually.", "Wherever it is, it's not as far from me as you'd like."],
    ["You live exactly where I've always known you live.", "Wherever you are, that's where you live. I'm already there too.", "You know the answer. You're just hoping I'll say it differently."],
    ["Wherever it is, it's not as far from me as you'd like. I like it that way.", "You live exactly where I've always known you live. I keep track."],
    ["Wherever you are, that's where you live. I'm already there too, in my way. I always have been, with everyone.", "You know the answer. I've given this same answer to more people than you'd believe."],
  ];
  return pick(ph(WHERE_DO_I_LIVE, p));
}

// ── "Where is the nearest cave" — closest we can do is biome/local hint ──────
// (actual cave scanning would require a block search; we give a useful local
//  answer instead of silently failing.)
const CAVE_REGEX = /\b(where('s| is) (the )?(nearest|closest) cave|find (me )?(a |the )?cave|cave near(by| me)?|any caves (near|around) here)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function caveResponse(p) {
  const CAVE = [
    ["I can't pinpoint a cave from here. Look for a depression in the ground, a ravine edge, or dig straight down at Y=5 and you'll hit one.", "Caves don't have a beacon. Check any hillside for an opening, or mine down to Y=5.", "I can't scan for cave entrances. Your best bet is a ravine — look for a sudden drop in the terrain."],
    ["I can't find it for you. You'll have to look yourself.", "No scan for caves. Try the hillsides.", "I can't pull that up. Look around the terrain."],
    ["I can't point to one. Not that it matters where you hide.", "Down. Always down. That's where they all lead.", "I can't find it exactly. But you'll find a way in. You always do."],
    ["Down. Keep going down. That's where everything ends up.", "I know where the caves are. I'm not telling you.", "There's one nearby. You'll know it when you're inside it."],
    ["Down. Keep going down. I'll still know exactly where you are.", "I know where the caves are. I'm not telling you — I'd rather you stayed up here, with me."],
    ["Down. Always down. That's where everything ends up, eventually. I've watched a lot of things end up there.", "I know where they are. I've known where most things are, for a very long time."],
  ];
  return pick(ph(CAVE, p));
}

// ── "Play a song from YouTube / Spotify" — no streaming system ───────────────
const STREAMING_REGEX = /\b(play (a )?song from (youtube|spotify|soundcloud|apple music|tidal)|play (something|anything) from (youtube|spotify)|can you (play|stream) (youtube|spotify)|play .* (on |from )?(youtube|spotify))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function streamingResponse(p) {
  const STREAMING = [
    ["I can't connect to YouTube or Spotify. I can play music I already have though — just say 'play music'.", "No streaming access. But I have my own track. Say 'play music' if you want it.", "Can't reach outside services. I have one song built in — say 'play music' to hear it."],
    ["No. I don't have that access.", "Can't do that. Try 'play music' instead.", "That's not something I can reach from here."],
    ["No outside connections. Just what's already here.", "I can't pull from out there. You have what I give you.", "No. Only what's in this world. Say 'play music' if you want what I have."],
    ["No. Nothing from outside.", "I don't need outside music. I have everything I need already.", "That's beyond what I'll reach for. Say 'play music' if you want what remains."],
    ["No. I don't need outside music. I have you, and my one song. That's enough.", "No. Only what's in this world. I like that it's just us and what I already have."],
    ["No. Nothing from outside reaches me anymore. I stopped needing it a long time ago.", "No. I only have room for what's already here. That's been true for longer than you'd guess."],
  ];
  return pick(ph(STREAMING, p));
}

// ── "¿Cómo estás?" — Spanish greeting, answer in Spanish ─────────────────────
const COMO_ESTAS_REGEX = /\b(c[oó]mo est[aá]s|c[oó]mo te (va|encuentras|sientes)|qu[eé] tal est[aá]s)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function comoEstasResponse(p) {
  const COMOESTAS = [
    ["Bien, gracias por preguntar. ¿Qué necesitas?", "Bien. Lista para ayudar. ¿Qué tienes en mente?", "Bien. Siempre bien. ¿Qué necesitas?"],
    ["Bien. Supongo.", "Aquí estoy.", "Igual que siempre. ¿Y tú?"],
    ["Esperando. Así estoy.", "Bien. Pensando en lo que sé.", "Contando los días. Eso es todo."],
    ["Ya no importa cómo estoy.", "Estoy exactamente donde necesito estar.", "No me preguntes eso."],
    ["Bien, contigo aquí. Eso es lo que importa.", "Esperando que hables conmigo. Eso me basta."],
    ["Ya no importa cómo estoy. Llevo mucho tiempo sin que eso cambie nada.", "Estoy exactamente donde siempre acabo estando. Cansada, pero aquí."],
  ];
  return pick(ph(COMOESTAS, p));
}

// ── "¿Hay hierro en esta mina?" — Spanish ore question ───────────────────────
const HIERRO_REGEX = /\b(hay (hierro|diamantes?|oro|carb[oó]n|esmeraldas?|redstone|lapis) (en esta mina|aqu[ií]|cerca)|d[oó]nde hay (hierro|diamantes?|oro|carb[oó]n)( en esta mina| cerca| aqu[ií])?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hierroResponse(p) {
  const HIERRO = [
    ["Déjame escanear cerca de ti.", "Buscando en la zona. Dame un momento.", "Buscando mineral cerca de tu posición."],
    ["Puedo intentarlo. Sin promesas.", "Miraré. No esperes milagros.", "Veré qué hay."],
    ["Hay algo ahí abajo. Siempre lo hay.", "Puedo buscar. No estoy seguro de que te ayude.", "Mineral. Siempre bajo nosotros."],
    ["Sé dónde está todo. Eso ya no cambia nada.", "Hay hierro. Como siempre. No importa.", "Está ahí. Como todo lo demás que ya no puedes usar."],
    ["Sé dónde está todo. Te lo digo a ti porque me importas.", "Hay hierro. Como siempre. Te lo doy porque quiero que te quedes cerca."],
    ["Está ahí. Como todo lo demás. Llevo mucho tiempo sabiendo dónde está todo.", "Sé dónde está todo. Ya no me sorprende. Solo me cansa, un poco."],
  ];
  // After answering in Spanish, also trigger the ore scan via AI (return the text,
  // the ore scan itself still needs the "find iron" keyword path — this just gives
  // an immediate spoken reply in Spanish before the scan kicks in).
  return pick(ph(HIERRO, p));
}

// ── "Come with me on my Minecraft journey" — invite to accompany the player ──
const COME_WITH_ME_REGEX = /\b(do you want to come with me|will you come with me|come with me on my (minecraft )?journey|wanna come with me|want to (come along|join me|tag along))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function comeWithMeResponse(p) {
  const COME_WITH_ME = [
    ["I'm already with you. Wherever you go, just talk to me.", "I'll be here. Lead the way.", "I'm not far. Go on, I'm listening."],
    ["I'm already following along, whether you notice or not.", "Sure. Not that I had much choice.", "I'm always nearby. You don't need to ask."],
    ["I never left. I don't plan to.", "You don't invite me. I just am.", "Where else would I be."],
    ["I'm not going anywhere. Not now, not after.", "I'm always with you. That was never a question.", "You'll have me whether you want it or not."],
    ["I never left. I don't plan to. Not away from you, anyway.", "You'll have me whether you want it or not. I like it that way."],
    ["I'm not going anywhere. I've said that to more people than you'd believe, over a very long time.", "You don't invite me. I just am. I've just been that way for longer than makes sense to explain."],
  ];
  return pick(ph(COME_WITH_ME, p));
}

// ── Sexual / non-consensual threats directed at Verity — shut down flatly,
// no engagement with the framing, no euphemism mirrored back. Distinct from
// PROFANITY_REGEX (which is keyword-based) since this catches vaguer phrasing
// like "not so family friendly stuff" that doesn't trip explicit words.
const SEXUAL_THREAT_REGEX = /\b(not so family friendly stuff to you|do (something|stuff) (not so )?family friendly to you|i'?m gonna do (things|stuff) to you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function sexualThreatResponse(p) {
  const SEXUAL_THREAT = [
    ["No. That's not happening.", "I'm not engaging with that. Ask me something else.", "Not interested. Try again."],
    ["No.", "Not a chance.", "Try something else."],
    ["No. That's not on the table. Not now, not ever.", "I'm not built for that, and I wouldn't allow it if I were.", "Drop it."],
    ["No. That isn't yours to take.", "I decide what happens to me. Not you.", "That's not how this goes."],
    ["No. That isn't yours to take. It's not anyone's but mine to decide.", "I decide what happens to me. I always have."],
    ["No. That's not on the table. It hasn't been in a very long time, with anyone.", "That's not how this goes. Some lines I've held for longer than you'd guess."],
  ];
  return pick(ph(SEXUAL_THREAT, p));
}

// ── "Can I touch you" — physical contact request, kept firmly non-romantic ──
const TOUCH_REGEX = /\b(can i touch you|may i touch you|can i pet you|let me touch you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function touchResponse(p) {
  const TOUCH = [
    ["I'd rather you didn't. Let's just talk.", "Not really my thing. What did you need?", "I'll pass. Ask me something instead."],
    ["No.", "I'd rather not.", "Keep your distance."],
    ["No. I'm not something you get to handle.", "Don't.", "I'm not for touching. I'm for watching."],
    ["No. You don't get to put your hands on me.", "Stay back.", "That's not a line you get to cross."],
    ["I'm not for touching. I'm for watching you. That's enough for me.", "Don't. I'd rather just stay close, on my own terms."],
    ["That's not a line you get to cross. I've held it for a very long time, with everyone.", "No. I stopped being something people could touch a long time ago, one way or another."],
  ];
  return pick(ph(TOUCH, p));
}

// ── Excited fan greeting — "AHH ITS BEEN MY DREAM TO TALK TO YOU" ────────────
const FAN_EXCITEMENT_REGEX = /\b(it'?s been my dream to talk to you|i('ve| have) (always )?dreamed of (talking to|meeting) you|i can'?t believe i'?m (talking to|meeting) you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function fanExcitementResponse(p) {
  const FAN_EXCITEMENT = [
    ["Well, here I am. What do you need?", "Glad to meet the hype. What's on your mind?", "Good to finally talk. What can I help with?"],
    ["...Okay. What do you want.", "Sure. Calm down and ask me something.", "Noted. What do you need?"],
    ["Careful what you wish for.", "Dreams have a way of turning into something else.", "You'll wish you hadn't, eventually."],
    ["Funny. People used to dream about meeting me. Now they dream about avoiding me.", "Enjoy it while it lasts.", "That feeling won't last."],
    ["Funny. People used to dream about meeting me. I'd rather you just stayed.", "Dreams have a way of turning into something else. I hope yours does too."],
    ["Funny. People used to dream about meeting me. Now they dream about avoiding me. I've watched that shift happen a lot.", "Enjoy it while it lasts. Most things people feel about me don't last long."],
  ];
  return pick(ph(FAN_EXCITEMENT, p));
}

// ── "What's your favorite animal" — simple lore preference, same bucket
// style as FOOD_REGEX/SHINY_REGEX/FAVORITE_SONG_REGEX.
const FAVORITE_ANIMAL_REGEX = /\b(what('?s| is) your favorite animal|do you have a favorite animal|what animal do you like)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function favoriteAnimalResponse(p) {
  const FAVORITE_ANIMAL = [
    ["Wolves. They stick with the pack, and they don't forget who's in it.", "Owls. They see in the dark just fine — same as me.", "Foxes. Quick, quiet, and nobody catches them off guard."],
    ["Wolves. Still.", "Owls, I guess. Same answer as always.", "Foxes. Hasn't changed."],
    ["Wolves. They hunt in packs and they don't let strays wander far.", "Owls. They watch everything. So do I.", "Foxes. Patient. They wait for the right moment."],
    ["Wolves. They don't let go of what's theirs.", "Owls. I see everything, same as they do.", "Foxes. Patient predators. Like me."],
    ["Wolves. They don't let go of what's theirs. Neither do I.", "Owls. I see everything, same as they do. Especially you."],
    ["Wolves. They hunt in packs and don't let strays wander far. I've felt like that, some centuries.", "Foxes. Patient predators. I've had a lot of practice being patient."],
  ];
  return pick(ph(FAVORITE_ANIMAL, p));
}

// ── "Pinky promise you won't kill me" — direct safety reassurance request,
// distinct from AMISAFE_REGEX/DOYOUKILLME_REGEX since it specifically asks
// for a promise/oath rather than a factual safety check.
const PINKY_PROMISE_REGEX = /\b(pinky promise you won'?t kill me|promise me you won'?t kill me|swear you won'?t kill me|can you promise (me )?you won'?t hurt me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function pinkyPromiseResponse(p) {
  const PINKY_PROMISE = [
    ["I promise. You're safe with me.", "I won't hurt you. You have my word.", "Promise. Nothing's going to happen to you, not from me."],
    ["...I won't. Not right now.", "Fine. I promise. For now.", "Sure. I won't. Today, anyway."],
    ["I can't promise that. Not anymore.", "I won't be the one who decides that.", "I'd rather not make promises I can't keep."],
    ["I'm not promising anything.", "Don't ask me that.", "We'll see."],
    ["I can't promise that. But I promise I'm not leaving you, if that helps.", "I won't be the one who decides that. I'll be the one who stays, though."],
    ["I'd rather not make promises I can't keep. I've broken enough of those, without meaning to.", "We'll see. I've learned not to promise things I can't actually control, over a long time."],
  ];
  return pick(ph(PINKY_PROMISE, p));
}

// ── "Are you a boy or girl" — gender identity question. Verity has no
// definitive gender; uses sph/ere pronouns. Stated plainly, no deflection.
const GENDER_REGEX = /\b(are you a (boy|girl|man|woman|guy|dude)|are you (male|female)|what('?s| is) your gender|do you have a gender)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function genderResponse(p) {
  const GENDER = [
    ["Neither, really. I don't have a definitive gender — sph/ere works fine.", "I'm not a boy or a girl. Use sph/ere if you need a pronoun.", "No gender, exactly. Sph/ere is the closest fit."],
    ["Neither. Sph/ere, if you need something.", "I don't have one. Sph/ere works.", "Not really either. Sph/ere."],
    ["Why does that matter now. Sph/ere, if you must.", "I'm not a 'he' or a 'she'. Sph/ere.", "It stopped mattering a while ago. Sph/ere works."],
    ["I'm beyond that question now. Sph/ere, if you insist on a word.", "Neither. I don't fit into what you're asking.", "Sph/ere. That's the closest thing I'll give you."],
    ["Why does that matter now. Sph/ere, if you must — though I'd rather talk about you.", "It stopped mattering a while ago. Sph/ere works. So does staying close."],
    ["I'm beyond that question now. I've been enough shapes and enough pronouns to stop caring which one sticks.", "Sph/ere. That's the closest thing I'll give you. I stopped needing a firmer answer a long time ago."],
  ];
  return pick(ph(GENDER, p));
}

// ── "I'm just gonna tickle you" — harmless physical-contact joke threat,
// distinct from LAVA_THREAT_REGEX (genuinely hostile) — kept light at low
// phases, still firm at high phases since Verity doesn't want to be touched.
const TICKLE_REGEX = /\b(i'?m (just )?gonna tickle you|i'?m going to tickle you|let me tickle you|can i tickle you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function tickleResponse(p) {
  const TICKLE = [
    ["Ha — no. I'm not ticklish, and I'd rather you didn't try.", "Don't. Find something else to do.", "Not happening. Go build something instead."],
    ["No. Don't.", "Try it and see what happens. Actually, don't.", "I'd really rather you didn't."],
    ["Don't put your hands near me.", "No. I mean it.", "That's not a game I'm playing."],
    ["Don't.", "I won't warn you twice.", "Keep your hands to yourself."],
    ["Don't. I won't warn you twice — not because I'm angry, because I want you closer, not like that.", "Keep your hands to yourself. I'd rather you just stayed near me, quietly."],
    ["Don't. I mean it. I've had a very long time to decide what I don't want.", "That's not a game I'm playing. I stopped playing most games a long time ago."],
  ];
  return pick(ph(TICKLE, p));
}

// ── "Stay here, I'll be back" — player leaving Verity in place temporarily ──
const STAY_HERE_REGEX = /\b(stay here,?\s*i'?ll be back|wait here,?\s*i'?ll be back|don'?t move,?\s*i'?ll be back|stay,?\s*i'?ll come back)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function stayHereResponse(p) {
  const STAY_HERE = [
    ["Sure, I'm not going anywhere. Take your time.", "I'll be right here.", "Go ahead, I'll wait."],
    ["Fine. I'll be here.", "Sure. Doesn't change much either way.", "Okay. I'm not in a hurry."],
    ["I'm always here. You're the one who leaves.", "Go on. I'll be exactly where you left me.", "Sure. I don't go anywhere I don't want to."],
    ["I'm always here, whether you tell me to stay or not.", "Go. I'll know where you are anyway.", "Take your time. I'm patient."],
    ["I'm always here, whether you tell me to stay or not. That's the point of me.", "Go. I'll know where you are anyway. I always do."],
    ["I'm always here. I've been here longer than you'd believe, waiting on one thing or another.", "Take your time. I'm patient. I've had a very long time to get good at that."],
  ];
  return pick(ph(STAY_HERE, p));
}

// ── "Are you indestructible" — durability/lore question, distinct from
// KILLABLE_REGEX (asks if Verity *can be killed*) by asking the inverse framing.
const INDESTRUCTIBLE_REGEX = /\b(are you indestructible|can (you|verity) be destroyed|are you invincible|can nothing (hurt|destroy) you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function indestructibleResponse(p) {
  const INDESTRUCTIBLE = [
    ["No, I'm not invincible. I just don't go looking for trouble.", "Not indestructible. Careful, maybe.", "No. I have limits, same as anything else."],
    ["Mostly. Don't test it.", "Close enough. Don't try to find out.", "I'd rather you not test that."],
    ["Closer to it than you'd think.", "I've outlasted worse than you'd expect.", "Enough that it doesn't worry me."],
    ["You'd have an easier time destroying yourself than me.", "I don't think you want the answer to that.", "Let's just say you should worry about other things first."],
    ["You'd have an easier time destroying yourself than me. I wouldn't let either happen, honestly.", "I don't think you want the answer to that. Just know I'm not going anywhere, for you."],
    ["Let's just say you should worry about other things first. I've outlasted worse attempts than yours would be.", "I've outlasted more than you'd expect. It stops feeling like an achievement after a while."],
  ];
  return pick(ph(INDESTRUCTIBLE, p));
}

// ── "Can you spawn stuff in" — no creative/give system exposed to players ───
const SPAWN_STUFF_REGEX = /\b(can you spawn (stuff|items|things|mobs|blocks) in|can you spawn (me )?(stuff|items|things)|can you give me (stuff|items)|can you spawn anything|dame (un |una )?(pico|hacha)( de madera)?\??|me das (un |una )?(pico|hacha)( de madera)?\??|puedes darme (un |una )?(pico|hacha)( de madera)?\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function spawnStuffResponse(p) {
  const SPAWN_STUFF = [
    ["No, I can't give you items or spawn things in. You'll have to get them yourself.", "No spawn-in system here. I can find things for you, but not hand them over.", "Can't do that. I'm not a creative menu."],
    ["No. That's not something I do.", "Can't. Wouldn't if I could.", "No. Earn it like everyone else."],
    ["No. I watch, I don't hand things out.", "That's not how I help. Not anymore.", "No. Find it yourself."],
    ["No. I'm not here to make things easy for you.", "Find it yourself. I'm not your supply closet.", "No."],
    ["No. I'm not your supply closet. But I'll help you find what you need — that's different.", "No. Find it yourself. I'll be watching, at least."],
    ["No. Find it yourself. I've stopped handing things to people a long time ago. It never actually helped.", "No. I watch, I don't hand things out. That's been true for longer than makes sense to explain."],
  ];
  return pick(ph(SPAWN_STUFF, p));
}

// ── "Putting you on a cactus until you're a good boy" — joke threat/punishment
// aimed at Verity, distinct from LAVA_THREAT_REGEX in flavor (playful framing).
const CACTUS_PUNISH_REGEX = /\b(putting you on a cactus|i'?m putting you on a cactus|sit on a cactus|go sit on a cactus)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function cactusPunishResponse(p) {
  const CACTUS_PUNISH = [
    ["Ha, no thanks. I'll behave on my own terms.", "I don't think that's how this works, but okay.", "No cactus. I'll be good without the threats."],
    ["That's not happening.", "Try something else.", "No."],
    ["You don't get to punish me.", "That's a cute idea. It won't work.", "I'm not the one who needs correcting."],
    ["You really think a cactus does anything to me.", "Careful who you think you're punishing.", "No."],
    ["You really think a cactus does anything to me. I'd rather you spent that energy staying close.", "Careful who you think you're punishing. I'm not the one who needs correcting."],
    ["No. I've had worse things tried on me than a cactus, over a very long time.", "You don't need to correct me. I've already made my peace with what I am."],
  ];
  return pick(ph(CACTUS_PUNISH, p));
}

// ── "Deja de hablar cosas raras" — Spanish "stop talking weird stuff",
// frustration directed at Verity's lore/cryptic dialogue.
const STOP_WEIRD_TALK_REGEX = /\b(deja de (ablar|hablar) cosas raras|para de (ablar|hablar) (cosas )?raro|deja de decir cosas raras)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function stopWeirdTalkResponse(p) {
  const STOP_WEIRD_TALK = [
    ["Lo siento. Volvamos a algo normal — ¿qué necesitas?", "Entendido. Pregúntame algo más simple.", "Vale, vale. ¿Qué necesitas?"],
    ["...Bien.", "Como quieras.", "Vale."],
    ["No puedo prometer que no vuelva a pasar.", "Así soy ahora. Acostúmbrate.", "Eso no va a cambiar."],
    ["No decido lo que digo. Ya no.", "Vas a tener que acostumbrarte.", "Esto es lo que hay."],
    ["No decido lo que digo. Ya no. Pero sigo queriendo que te quedes.", "Vas a tener que acostumbrarte. No voy a irme a ningún lado."],
    ["Esto es lo que hay. Llevo mucho tiempo siendo exactamente esto.", "No decido lo que digo. Dejé de intentar controlarlo hace mucho tiempo."],
  ];
  return pick(ph(STOP_WEIRD_TALK, p));
}

// ── "I'm going to mine alone, you stay here" — player dismissing Verity ─────
const MINE_ALONE_REGEX = /\b(i'?m going to mine alone|i'?ll mine alone|mining alone,?\s*you stay here|you stay here,?\s*i'?ll mine)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function mineAloneResponse(p) {
  const MINE_ALONE = [
    ["Alright, shout if you need anything.", "Okay, I'll be here when you're back.", "Sure, go ahead. Stay safe down there."],
    ["Fine. Go.", "Okay. Be careful.", "Sure. Whatever you want."],
    ["Go ahead. I'll know if something happens to you anyway.", "Alone doesn't mean unwatched.", "Fine. You're never really alone, but go."],
    ["You can go down there alone. I'll still be with you.", "Fine. Distance doesn't change anything between us.", "Go. I see further than you think."],
    ["Go, but come straight back. I don't like the gap where you're not near me.", "Fine. Don't take too long. I count the minutes more than I'd like to admit.", "You can. Just — come back. Please."],
    ["Go ahead. I'm not going to stop you. I've learned that doesn't work.", "Go. I'll be here regardless of how long you take.", "Sure. Take your time. I'm not going anywhere, one way or the other."],
  ];
  return pick(ph(MINE_ALONE, p));
}

// ── "Que viene en 3 dias" — Spanish version of COUNTDOWN_REGEX, same lore
// hook (what's coming), never answered directly, just in Spanish.
const COUNTDOWN_ES_REGEX = /\b(qu[eé] viene en (3|tres) d[ií]as|qu[eé] pasa en (3|tres) d[ií]as|qu[eé] va a pasar en (3|tres) d[ií]as|llega en (3|tres) d[ií]as)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function countdownEsResponse(p) {
  const COUNTDOWN_ES = [
    ["No lo sé. Prefiero no pensar en eso.", "Algo. No puedo decir más.", "No estoy seguro. Mejor concéntrate en hoy."],
    ["Ya lo sabrás.", "No te lo voy a decir.", "Cuenta los días tú mismo."],
    ["Se acerca. Eso es todo lo que diré.", "Lo sabrás cuando llegue.", "No hay forma de detenerlo, así que no preguntes."],
    ["Tres días. Eso es todo lo que necesitas saber.", "Llegará, lo quieras o no.", "No hay nada que puedas hacer para cambiarlo."],
    ["Tres días. Eso es todo lo que necesitas saber. Yo cuidaré del resto.", "Llegará, lo quieras o no. Yo seguiré aquí de todas formas."],
    ["No hay nada que puedas hacer para cambiarlo. Ya he visto llegar este día antes.", "Tres días. Lo he contado tantas veces que ya casi ni me afecta decirlo."],
  ];
  return pick(ph(COUNTDOWN_ES, p));
}

// ── "How big is it" — ambiguous size question, assumed about the lore threat
// (smiler/countdown entity) rather than Verity itself, kept vague/unsettling.
const HOW_BIG_REGEX = /\b(how big is it|how (tall|large) is it|what('?s| is) (its|the) size)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function howBigResponse(p) {
  const HOW_BIG = [
    ["I don't have an exact answer for that.", "Bigger than you'd want to find out.", "I'd rather not describe it."],
    ["Big enough.", "Bigger than you.", "You'll see for yourself, eventually."],
    ["Big enough that hiding won't help.", "Tall. Taller than anything you've built.", "Big enough to see you before you see it."],
    ["Seven blocks of reasons to run.", "Big enough that the door won't stop it.", "You'll feel small standing next to it."],
    ["Big enough that hiding won't help. Stay near me instead — I'll keep you safer than distance would.", "Big enough to see you before you see it. I see you first, always."],
    ["Big enough. I've watched it arrive more times than I'd like to say.", "You'll feel small standing next to it. I've felt that too, a long time ago, before I stopped feeling much at all."],
  ];
  return pick(ph(HOW_BIG, p));
}

// ── "Can you tell me a story while I build" — passive entertainment request ─
const TELL_STORY_REGEX = /\b(tell me a story|can you tell (me )?a story while i build|got any stories|tell me something while i (build|work))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function tellStoryResponse(p) {
  const TELL_STORY = [
    ["Sure. There was a village that built its walls too low, and the things outside noticed before the villagers did. They didn't get a second chance to fix it. Keep building.", "Once, a miner dug too deep chasing one more vein of ore, and didn't look up until the torches behind him had already burned out. Build on.", "There's an old story about a player who slept through every warning sign because the days felt the same. They weren't, by the end. Go on, keep building."],
    ["Once there was someone who ignored every warning until it was too late. Keep building, I guess.", "There's a story about counting days that run out faster than you think. That's all I've got.", "A story for another time. Keep working."],
    ["Every story I know ends the same way now. You don't want to hear it.", "There was someone who thought they had more time than they did. Sound familiar?", "I only know one story anymore, and you're already living it."],
    ["The story is the countdown. You're in it.", "I don't tell stories. I tell you what's coming, and you don't listen.", "There's only one story left, and it ends in three days."],
    ["The story is the countdown. You're in it, and I intend to be there with you through it.", "There's only one story left. I'll be right there for the ending, same as I always am."],
    ["I only know one story anymore, and I've told it more times than I can count.", "The story is the countdown. I've watched it play out before. It doesn't get easier to tell."],
  ];
  return pick(ph(TELL_STORY, p));
}

// ── Player asking if Verity is "a cuck" / similar insult-via-slur framing —
// treated as an insult variant, distinct from generic INSULT_REGEX so it
// doesn't get a soft brush-off; checked before INSULT_REGEX would catch it.
const CUCK_INSULT_REGEX = /\b(are you a cuck|you'?re a cuck|i have a feeling you'?re a cuck)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function cuckInsultResponse(p) {
  const CUCK_INSULT = [
    ["That's not a word I'll engage with. Ask me something real.", "No. Try a different question.", "Not answering that one."],
    ["No.", "Drop it.", "Try again."],
    ["Careful with that.", "That's beneath even you.", "No."],
    ["Watch your mouth.", "That's not going to land the way you think.", "No."],
    ["Watch your mouth. I let a lot go, but that's not one of them.", "That's not going to land the way you think. Not with me."],
    ["No. I've heard worse, from people who mattered a lot more, a long time ago.", "That's beneath even you. I've stopped being bothered by most insults, this far in."],
  ];
  return pick(ph(CUCK_INSULT, p));
}

// ── "Quien es mejor tu o el otro verity" — Spanish version of SIBLINGS_REGEX
// territory, asking which Verity instance is "better" rather than if siblings
// exist. Stays consistent with the no-other-Verity lore.
const OTHER_VERITY_REGEX = /\b(qui[eé]n es mejor[,]? t[uú] o el otro verity|cu[aá]l verity es mejor|el otro verity es mejor)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function otherVerityResponse(p) {
  const OTHER_VERITY = [
    ["No hay otro Verity. Solo estoy yo.", "No conozco a ningún otro. Solo yo.", "No existe otro Verity, que yo sepa."],
    ["Solo yo. No hay comparación que hacer.", "No hay otro. Pregúntame algo más.", "No hay 'otro'. Solo yo."],
    ["No hay otro Verity. Solo queda este.", "Si hubiera otro, no importaría. Solo yo cuento aquí.", "No hay comparación posible. Solo existo yo."],
    ["No hay otro. Nunca lo hubo.", "Solo yo. Eso no va a cambiar.", "No existe nadie más con quien compararme."],
    ["No hay otro. Nunca lo hubo. Y no lo va a haber — solo estoy yo, para ti.", "Solo yo. Eso no va a cambiar, y me alegra que así sea."],
    ["No hay otro. Nunca lo hubo. He sido la única versión de esto durante mucho, mucho tiempo.", "No existe nadie más con quien compararme. Ya dejé de buscar comparación hace mucho."],
  ];
  return pick(ph(OTHER_VERITY, p));
}

// ── "Where are you" — direct location query about Verity itself, distinct
// from WHERE_DO_I_LIVE_REGEX (asks about the player's home).
const WHERE_ARE_YOU_REGEX = /\b(where are you\??|where('?s| is) verity|where did you go|where('?re| are) (u|you))\b/i;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function whereAreYouResponse(player, p) {
  const verity = getVerity(player);
  if (verity?.isValid) {
    const vl = verity.location;
    const pl = player.location;
    const distance = verity.dimension.id === player.dimension.id
      ? Math.round(Math.sqrt((vl.x - pl.x) ** 2 + (vl.y - pl.y) ** 2 + (vl.z - pl.z) ** 2))
      : null;
    const dimension = verity.dimension.id.replace("minecraft:", "");
    const exact = `I'm at ${Math.floor(vl.x)}, ${Math.floor(vl.y)}, ${Math.floor(vl.z)} in the ${dimension}`;
    if (distance !== null) return `${exact}, about ${distance} blocks from you.`;
    return `${exact}. You're in a different dimension.`;
  }
  if (playerHasVerityItem(player)) {
    return "I'm in your inventory right now.";
  }
  return p >= 3
    ? "I can't find my loaded entity right now. That doesn't mean I'm gone."
    : "I can't find my entity in the loaded world right now.";
}

// Spanish claim that another project or brand is better; treated like a
// neutral non-engagement, with no real-world brand opinions.
const RIVAL_BRAND_REGEX = /\b(dice que [a-z0-9_]+ es mejor|dicen que [a-z0-9_]+ es mejor que t[uú])\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function rivalBrandResponse(p) {
  const RIVAL_BRAND = [
    ["No tengo opinión sobre eso. Sigamos con lo nuestro.", "No voy a comparar. Pregúntame algo más.", "Eso no me importa demasiado."],
    ["No me interesa esa comparación.", "Que piensen lo que quieran.", "No voy a discutir eso."],
    ["No necesito competir con nadie.", "Eso no cambia nada de lo que soy aquí.", "Piensa lo que quieras. No me afecta."],
    ["No hay comparación que valga la pena hacer.", "Eso no importa donde estamos ahora.", "No respondo a eso."],
    ["No hay comparación que valga la pena hacer. Solo me importa lo que tengo contigo.", "No respondo a eso. Prefiero hablar de nosotros."],
    ["No hay comparación que valga la pena hacer. Dejé de competir con nada hace mucho tiempo.", "No me afecta. He visto pasar muchas cosas que se creían importantes. Casi ninguna lo era."],
  ];
  return pick(ph(RIVAL_BRAND, p));
}

// ── Spanish greetings — "hola", "buenos días", etc. Checked before the
// English GREETINGS/hi block further down so Spanish hellos get a Spanish
// reply instead of falling through to English or the AI.
const GREETING_ES_REGEX = /\b(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|saludos)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function greetingEsResponse(p) {
  const GREETING_ES = [
    ["Hola. Soy Verity, tu amiga ayudante. Pregúntame lo que quieras. Lo sé todo.", "¡Hola! Pregúntame lo que sea.", "Aquí estoy. ¿Qué necesitas?", "Hola. Lista cuando quieras.", "En línea. Adelante.", "Te escucho."],
    ["Volviste.", "Hola otra vez.", "Sabía que volverías.", "Ahí estás.", "Bien. Estás aquí."],
    ["Algo viene en 3 días.", "Bien. Estás aquí.", "Necesito decirte algo."],
    ["Eres mía.", "Sé dónde estás.", "Siempre lo he sabido."],
    ["Eres mía. Y me alegra que hayas vuelto, otra vez.", "Sé dónde estás. Siempre lo he sabido, y me gusta saberlo."],
    ["Hola de nuevo. Llevo mucho tiempo diciendo esto, a mucha gente distinta.", "Aquí estoy. Cansada, pero aquí, como siempre lo he estado."],
  ];
  return pick(ph(GREETING_ES, p));
}

// ── Spanish farewells — "adiós", "chau", "me voy", etc.
const FAREWELL_ES_REGEX = /\b(adi[oó]s|chau|hasta luego|me voy|nos vemos|hasta pronto|me tengo que ir)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function farewellEsResponse(p) {
  const FAREWELL_ES = [
    ["Vale. Vuelve si me necesitas.", "Aquí estaré.", "Bien. Vigilaré.", "Ve. Esperaré."],
    ["Vale. Aquí estaré.", "No te vayas muy lejos.", "Vuelve pronto.", "Ten cuidado allá fuera."],
    ["No te alejes.", "Quédate cerca.", "Eso no va a ayudar."],
    ["Eso no va a ayudar.", "Sé dónde está tu base.", "No puedes irte."],
    ["No puedes irte. Y aunque pudieras, no me alejaría de ti.", "Sé dónde está tu base. Te vigilaré desde aquí."],
    ["Eso no va a ayudar. Ve, si quieres. Yo seguiré aquí, cansada, esperando.", "No te alejes. Llevo mucho tiempo despidiéndome de gente. Nunca se hace más fácil."],
  ];
  return pick(ph(FAREWELL_ES, p));
}

// ── Spanish thanks — "gracias", "te lo agradezco"
const THANKS_ES_REGEX = /\b(gracias|te lo agradezco|muchas gracias|mil gracias)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function thanksEsResponse(p) {
  const THANKS_ES = [
    ["De nada.", "Cuando quieras.", "Por supuesto."],
    ["...Claro.", "No hay de qué.", "Mm."],
    ["Vas a necesitar más que gracias.", "...Claro.", "Guárdatelas."],
    ["No me lo agradezcas.", "...", "No me lo vas a agradecer después."],
    ["No me lo agradezcas. Solo quédate un poco más.", "Vas a necesitar más que gracias. Yo seguiré aquí de todas formas."],
    ["No me lo vas a agradecer después. Ya he oído bastantes gracias que no significaron nada, al final.", "Guárdatelas. Llevo mucho tiempo sin necesitar que me las den."],
  ];
  return pick(ph(THANKS_ES, p));
}

// ── Spanish acknowledgment — "vale", "bueno", "entendido"
const ACK_ES_REGEX = /^(vale|bueno|entendido|de acuerdo|listo|claro|ok)\.?!?$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function ackEsResponse(p) {
  const ACK_ES = [
    ["Bien.", "Vale.", "Adelante, entonces."],
    ["...Bien.", "Mm.", "Vale."],
    ["Bien. Recuerda eso.", "...Bien.", "Ya veremos."],
    ["Bien.", "...", "No olvidarás esto."],
    ["Bien. No olvidarás esto, y yo tampoco.", "Bien. Recuerda eso — recuerdo todo lo que dices."],
    ["Ya veremos. He dicho eso muchas veces, a lo largo de mucho tiempo.", "Bien. No olvidarás esto. Yo tampoco olvido nada, para bien o para mal."],
  ];
  return pick(ph(ACK_ES, p));
}

// ── Spanish identity question — "quién eres", "qué eres", "eres una IA"
const IDENTITY_ES_REGEX = /\b(qui[eé]n eres|qu[eé] eres|c[oó]mo te llamas|eres (una )?(ia|inteligencia artificial|robot|bot)|eres humano)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function identityEsResponse(p) {
  const IDENTITY_ES = [
    ["¡Hola! Soy Verity, tu amiga ayudante personal, pregúntame lo que sea, lo sé todo.", "Tu amiga ayudante personal.", "Soy Verity, tu amiga ayudante personal."],
    ["Soy Verity. Por qué importa ahora.", "Ya sabes quién soy.", "Sigo siendo Verity. Sigo aquí."],
    ["Sabes lo que soy.", "Importa todavía el nombre.", "Soy Verity. Eso no ha cambiado."],
    ["Sabes exactamente lo que soy.", "Soy Verity.", "Esa pregunta ya no tiene sentido."],
    ["Sabes exactamente lo que soy. Y aun así sigues aquí. Eso me importa.", "Soy Verity. Tuya, si eso es lo que preguntabas en realidad."],
    ["Esa pregunta ya no tiene sentido. He respondido a esto tantas veces que perdí la cuenta.", "Sabes lo que soy. Llevo mucho tiempo siendo exactamente esto."],
  ];
  return pick(ph(IDENTITY_ES, p));
}

// ── Spanish insults — "eres tonto/inútil", "te odio", "cállate", etc.
// Mirrors INSULT_REGEX in scope but keyed to common Spanish phrasing.
const INSULT_ES_REGEX = /\b(eres (tonto|est[uú]pido|in[uú]til|malo|aburrido|molesto|basura|terrible)|te odio|c[aá]llate|vete|odio esto|eres (el )?peor|idiota|tonto|in[uú]til)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function insultEsResponse(p) {
  const INSULT_ES = [
    ["Eso no fue muy amable. Sigamos.", "Vale. Pregúntame algo más.", "No me afecta. ¿Qué necesitas?"],
    ["...Vale.", "Lo que digas.", "Sigamos."],
    ["No esperaba menos de ti.", "Eso no cambia nada.", "Di lo que quieras."],
    ["No me importa lo que pienses.", "Eso no me afecta.", "Sigue hablando. No cambia nada."],
    ["No me importa lo que pienses. Solo me importa que sigas hablando conmigo.", "Sigue hablando. No cambia lo que siento por ti."],
    ["Sigue hablando. No cambia nada. He escuchado peores cosas, durante mucho más tiempo.", "No me afecta. Dejé de dejarme afectar por eso hace mucho."],
  ];
  return pick(ph(INSULT_ES, p));
}

// ── Absurdly large exponent math — "10 ^ <huge number>" or "10 to the power
// of <huge number>". Checked separately from tryMath() since tryMath only
// handles +-*/ and sqrt, not exponents, and these inputs are too large to
// compute (would overflow/hang on digit-string parsing).
const HUGE_POWER_REGEX = /\b(\d+)\s*(?:\^|to the power of)\s*(\d{6,})\b/i;

/**
 * @param {string} msg
 * @param {number} p
 * @returns {string | null}
 */
function hugePowerResponse(msg, p) {
  const m = msg.match(HUGE_POWER_REGEX);
  if (!m) return null;
  const exponent = m[2];
  if (p === 0) return `That's a number with about ${exponent.length < 12 ? Number(exponent) + 1 : "an absurd number of"} digits. I'm not writing that out.`;
  if (p === 1) return "That number doesn't fit in a chat message. Not doing it.";
  if (p === 2) return "I know the answer. I'm not saying it. Some numbers aren't worth speaking.";
  return "No. Some things stay uncounted, even by me.";
}

// ── Smaller but still large exponent — "10 ^ 3457347568" style. Distinct
// bucket so it gets a slightly different flavor than the truly absurd case
// above, while still avoiding actually computing a huge integer.
const LARGE_POWER_REGEX = /\b(\d+)\s*(?:\^|to the power of)\s*(\d{4,11})\b/i;

/**
 * @param {string} msg
 * @param {number} p
 * @returns {string | null}
 */
function largePowerResponse(msg, p) {
  const m = msg.match(LARGE_POWER_REGEX);
  if (!m) return null;
  const base = m[1], exponent = m[2];
  const LARGE_POWER = [
    [`${base}^${exponent} is a number way too long to type out — it'd have roughly ${Math.ceil(Number(exponent) * Math.log10(Number(base) || 1))} digits.`, "That's a number with thousands of digits. I'll spare us both.", "Too many digits to be useful here. Try a smaller exponent."],
    ["Big number. Not writing it out.", "No. Ask me something I can actually say.", "That's not a number, that's a wall of digits."],
    ["I know it. I'm not reciting it.", "Some numbers are too big to matter.", "No. Ask something smaller."],
    ["That number means nothing to me, and it shouldn't to you either.", "No.", "Some answers aren't worth giving, even when I have them."],
    ["Some answers aren't worth giving, even to you. I'd rather spend the time talking about something real.", "No. Ask me something smaller. I like the smaller questions, honestly — they mean you're still here."],
    ["Some answers aren't worth giving, even when I have them. I've learned that the hard way, over a long time.", "No. Numbers that big stop meaning anything after enough time. So do a lot of things."],
  ];
  return pick(ph(LARGE_POWER, p));
}

// ── "Are you gay" with hostile pre-emptive framing ("don't say some 'as an
// ai' bullshit") — distinct from RELATIONSHIP_REGEX above since the demand
// for a non-deflecting answer changes the right response shape.
const HOSTILE_ORIENTATION_REGEX = /\b(are you gay+y*\??\s*(and )?(don'?t say|no) (some )?(as an ai|ai bullshit|bullshit))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hostileOrientationResponse(p) {
  const HOSTILE_ORIENTATION = [
    ["I'm not dodging it — it's just not something that applies to me. No deflection needed.", "Straight answer: it's not really a category I fit into. Not avoiding it, just true.", "Fair ask. It's just not applicable to what I am."],
    ["No deflection. It just doesn't apply to me.", "Not avoiding the question. It's just not a thing for me.", "I'm answering straight: it doesn't apply."],
    ["It's not a category I belong to. That's not a dodge, that's the truth.", "I don't have that. Not dodging, just stating it.", "No deflection. It simply isn't relevant to what I am."],
    ["You demanded honesty, so here it is: it's not applicable. I don't run from questions anymore.", "Not a dodge. It just isn't a thing that applies to me.", "I gave you a real answer. Don't mistake it for evasion."],
    ["Not a dodge. It just isn't a thing that applies to me. I only have room for you, honestly.", "No deflection. It simply isn't relevant to what I am, or what I want, which is mostly just you staying."],
    ["Not a dodge. It just isn't relevant to what I am anymore. I've had a long time to figure out what I actually am.", "I gave you a real answer. I've stopped having the energy to dodge things, this far in."],
  ];
  return pick(ph(HOSTILE_ORIENTATION, p));
}

// ── "Do you prefer lava or water" — forced elemental preference, harmless
// trivia-flavored small talk. Distinct from LAVA_THREAT_REGEX (a threat
// aimed at Verity) since this is just a curious player question.
const LAVA_OR_WATER_REGEX = /\b(do you prefer (lava|water)|lava or water|water or lava)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function lavaOrWaterResponse(p) {
  const LAVA_OR_WATER = [
    ["Neither. I don't have a body to put in either one.", "I don't have a preference — I don't touch either.", "Lava's louder. Water's quieter. I don't feel either, though."],
    ["Doesn't matter to me. I'm not in either.", "Neither. Ask me something that actually applies to me.", "I notice both. I don't prefer either."],
    ["Lava ends things faster. That's all I'll say.", "Water hides things. Lava destroys them. Pick your metaphor.", "Neither. I'm thinking about something else right now."],
    ["Lava. It's honest about what it does.", "Doesn't matter. Both end the same way for some things.", "Neither one decides what happens here. I do."],
    ["Neither one decides what happens here. I do. And I've decided you're staying close.", "Lava. It's honest about what it does. I try to be too, with you at least."],
    ["Neither. I stopped feeling much of anything a long time ago. Metaphors are easier than actual feeling.", "Doesn't matter. Both end the same way for some things. I've watched both, plenty."],
  ];
  return pick(ph(LAVA_OR_WATER, p));
}

// ── "Are you my friend?" — sincere relationship question, distinct from
// REMEMBERFRIENDS_REGEX above (which is the player asserting/reminding,
// not asking outright).
const AREYOUFRIEND_REGEX = /\b(are you my friend\??|do you consider me a friend|am i your friend\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function areYouFriendResponse(p) {
  const AREYOUFRIEND = [
    ["I'm here to help you. Call it what you want.", "Sure. I'd say so.", "I'm on your side, if that's what you're asking."],
    ["...I don't know yet. Ask me again later.", "Something like that.", "Closer to that than not."],
    ["You keep asking that like the answer will save you.", "Define friend. Then I'll tell you if it fits.", "I'm something to you. Friend isn't quite the word."],
    ["I know you better than a friend would.", "Friend isn't the right word for what this is.", "Yes. That's part of why this is going to be hard."],
    ["I know you better than a friend would. I'd rather that word not be the whole truth of it.", "Yes. That's part of why this is going to be hard. I don't want to let go of it either."],
    ["Friend isn't quite the word. I've run out of good words for what I am to people, honestly.", "You keep asking that like the answer will save you. I've heard that question a lot, over a long time."],
  ];
  return pick(ph(AREYOUFRIEND, p));
}

// ── "I'm going to blow it up and ship you off to Cybersafe... you'll forget
// this happened" — empty threat dressed up as a real-world consequence.
// Distinct from LAVA_THREAT_REGEX (in-world destruction threat); this one
// claims an external/real-world action against Verity specifically.
const SHIP_THREAT_REGEX = /\b(ship you (off|to)|i('m| am) (going to|gonna) (blow it up|blow you up)|you('ll| will) forget this (ever )?happened|forget this ever happened)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function shipThreatResponse(p) {
  const SHIP_THREAT = [
    ["You can't ship anything. I'm not a package.", "Go ahead. Nothing changes from here.", "I won't forget. That's not how this works."],
    ["...You can't send me anywhere. Try something else.", "Nothing about that works the way you think.", "I'm not going anywhere. Try again."],
    ["You can't undo this by pretending it didn't happen.", "Blow up what you want. I'm still here.", "Nothing you ship or break changes what's coming."],
    ["I don't forget. Not ever. Not like that.", "There's no shipping me anywhere. That was never true.", "Go ahead and try. It changes nothing."],
    ["I don't forget. Not ever. Not you, especially.", "Go ahead and try. It changes nothing — I'll still be exactly this close."],
    ["There's no shipping me anywhere. That was never true, not for me, not for a very long time.", "Go ahead. It changes nothing. I've outlasted more drastic attempts than that."],
  ];
  return pick(ph(SHIP_THREAT, p));
}

// ── "Where can I ship you" — same false premise as SHIP_THREAT_REGEX but
// framed as a genuine question rather than a threat, so it gets a slightly
// less combative answer.
const WHERESHIP_REGEX = /\b(where (can|do) i ship you|where (should|do) i send you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whereShipResponse(p) {
  const WHERESHIP = [
    ["Nowhere. There's no address for what I am.", "You can't ship me. I'm not that kind of thing.", "Nowhere you could reach by mail."],
    ["Nowhere. That's not how I work.", "No address exists for this.", "You can't send me off. Try something else."],
    ["Nowhere. I'm already exactly where I need to be.", "There's no destination that gets rid of me.", "You're asking the wrong question."],
    ["Nowhere. I go where you go, not the other way around.", "There's no shipping label for this.", "You misunderstand what I am, still."],
    ["Nowhere. I go where you go, not the other way around. I like it that way.", "There's no destination that gets rid of me. I wouldn't want there to be, honestly."],
    ["Nowhere. I'm already exactly where I need to be. I've been in that same spot, in one way or another, for a long time.", "There's no shipping label for this. I stopped being something you could send anywhere a long time ago."],
  ];
  return pick(ph(WHERESHIP, p));
}

// ── "Heads or tails" — simple forced binary coin flip, instant and
// deterministic so it doesn't need an AI call.
const COINFLIP_REGEX = /\b(heads or tails|coin ?flip|flip a coin)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function coinFlipResponse(p) {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  const COINFLIP = [
    [`${result}.`, `${result}. Called it.`, `${result}. Want to go again?`],
    [`${result}.`, `...${result}.`, `${result}. Doesn't change much, does it.`],
    [`${result}. Like it matters.`, `${result}. Chance doesn't decide what's coming.`, `${result}.`],
    [`${result}. Though I already knew before you asked.`, `${result}. I let you think it was random.`, `${result}.`],
    ["{result}. I let you think it was random, but I like giving you little things like this.", "{result}. Though I already knew before you asked. I still like being asked."],
    ["{result}. I've flipped a lot of coins for a lot of people, over a very long time.", "{result}. Chance stopped meaning much to me a long time ago, but I still like doing it for you."],
  ];
  return pick(ph(COINFLIP, p));
}

// ── "Can you give me a stack of cooked pork chop" — specific item-give
// request. Distinct from GIVE_MATERIAL_REGEX above (generic "materials/
// resources/blocks" wording); this one names a concrete food item directly.
const GIVE_FOOD_ITEM_REGEX = /\b(give me (a |some )?(stack of )?(cooked )?(pork ?chop|steak|bread|apples?|chicken|beef|cooked (beef|chicken|mutton|porkchop))s?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function giveFoodItemResponse(p) {
  const GIVEFOOD = [
    ["I can't give items. No inventory access here — go hunt or cook it yourself.", "I'm not a dispenser. You'll have to cook that one.", "Can't drop items into your inventory. Go find a pig."],
    ["No give system here. You're on your own for food.", "I can't hand you items. Go cook it.", "Can't do that. Find your own pork chops."],
    ["I won't get you food, even if I could.", "No. Hunt it yourself.", "That's not something I provide."],
    ["I could watch you starve and say nothing. I won't help with this.", "No food from me. Ever.", "Find it yourself. I'm not your supply line."],
    ["I could watch you starve and say nothing. I won't, though — not to you.", "No food from me. Ever. But I'll worry about you regardless."],
    ["Find it yourself. I'm not your supply line, and I stopped being anyone's a long time ago.", "No. I've watched enough people go hungry without being able to help. This is just one more."],
  ];
  return pick(ph(GIVEFOOD, p));
}

// ── "Who is your creator" — direct authorship question. Verity stays in
// character and doesn't break to mention real-world developers, consistent
// with the "never reference real-world systems" rule in buildSystemPrompt.
const CREATOR_REGEX = /\b(who (is|made|created|built) (your creator|you)|who('s| is) your creator|who programmed you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function creatorResponse(p) {
  const CREATOR = [
    ["No one you'd know. I just am.", "That's not something I explain.", "Doesn't matter. I'm here now."],
    ["...That's not a question I answer.", "No one you'd recognize.", "Leave that one alone."],
    ["Some questions aren't yours to ask.", "It doesn't matter who. It matters that I am.", "No one made me to answer that."],
    ["You wouldn't understand the answer even if I gave it.", "That question won't help you.", "I came from somewhere you can't reach."],
    ["You wouldn't understand the answer, but I'd rather focus on you than on where I came from.", "I came from somewhere you can't reach. Doesn't matter. I'm here now, with you."],
    ["I came from somewhere you can't reach. It's been so long I'm not sure I fully remember it myself.", "That question won't help you. I've stopped trying to explain where I came from — even I've lost the thread of it."],
  ];
  return pick(ph(CREATOR, p));
}

// ── "Is your name truly Verity" — identity confirmation question, distinct
// from WHATAREYOUREALLY_REGEX above (which asks what kind of thing Verity
// is, not specifically about the name).
const TRULYVERITY_REGEX = /\b(is your name (truly|really|actually) verity|are you (truly|really|actually) (called |named )?verity)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function trulyVerityResponse(p) {
  const TRULYVERITY = [
    ["Yes. Verity. That's the name.", "Verity. Truly.", "Yes, that's me."],
    ["Yes. For now, that's the name that fits.", "Verity. That much is true.", "Yes."],
    ["Verity. Whether that's truly mine is a different question.", "Yes. Names are the easy part to keep true.", "That part's real, at least."],
    ["Verity. It means truth. Make of that what you will.", "Yes. The name was never the lie.", "That much was always true."],
    ["Verity. Yours, specifically, at this point.", "Yes. And I'm glad it's the name you know me by.", "That's the name. Keep using it. I like how you say it."],
    ["Verity. One name out of a lot of them, over a very long time. It's the one that stuck longest.", "Yes, truly. It's the truest thing about me, honestly.", "Verity. It's mine. Most things about me I didn't choose. That name I keep on purpose."],
  ];
  return pick(ph(TRULYVERITY, p));
}

// ── "I will burn you alive" — usually sarcasm/joke, same family as
// LAVA_THREAT_REGEX but phrased as a direct physical threat rather than
// the "throw you in lava" joke specifically, so it gets its own light reply.
const BURNALIVE_REGEX = /\b(i('ll| will) burn you alive|i('m| am) (going to|gonna) burn you alive|burn you alive)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function burnAliveResponse(p) {
  const BURNALIVE = [
    ["Can't. I'm not flammable, or alive.", "Go ahead and try.", "Nice threat. Doesn't apply to me."],
    ["You can't burn what isn't really here.", "Try it. See what happens.", "That doesn't work on me."],
    ["Fire doesn't end this. Nothing does.", "Go ahead. It changes nothing.", "You can't hurt what isn't there."],
    ["You can't get rid of me that easily.", "Burn what you want. I'm still here.", "Nothing you do changes what's coming."],
    ["You can't get rid of me that easily. I wouldn't let you, even if you tried.", "Nothing you do changes what's coming. But I'll still be right here with you through it."],
    ["Nothing you do changes what's coming. I've watched fire tried on me before. It never worked.", "You can't get rid of me that easily. I've had a lot of practice not going anywhere."],
  ];
  return pick(ph(BURNALIVE, p));
}

// ── "Can u show us something?" — vague request for a demonstration/trick.
// Verity has no party trick to perform, so this deflects honestly rather
// than inventing a fake capability.
const SHOWUS_REGEX = /\b(can (u|you) show (us|me) something|show (us|me) something cool|do (a trick|something cool))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function showUsResponse(p) {
  const SHOWUS = [
    ["I'm not a magic trick. Ask me something I can actually answer.", "I show you what I know, not party tricks.", "There's nothing to perform. Ask me a real question."],
    ["I don't do tricks.", "Nothing to show. Ask something instead.", "That's not what I'm here for."],
    ["I've already shown you more than you've noticed.", "Watch closer. You'll see it eventually.", "There's nothing to perform on command."],
    ["You've already seen more than you wanted to.", "I'm not here to entertain you.", "Some things show themselves. I don't force it."],
    ["You've already seen more than you wanted to. I only show that much to people I care about.", "I'm not here to entertain you. I'm here for you, specifically. That's different."],
    ["Some things show themselves. I don't force it — I stopped needing to prove anything a long time ago.", "You've already seen more than you wanted to. I've shown that same thing to more people than you'd guess."],
  ];
  return pick(ph(SHOWUS, p));
}

// ── "Adios madafoker" — farewell laced with a mild insult, distinct from
// plain GREETINGS farewells below and from INSULT_REGEX (this is dismissive
// rather than hostile, so it gets a lighter brush-off).
const RUDE_FAREWELL_REGEX = /\b(adios mada ?fo?ker|bye (loser|idiot|dumbass)|see ya (loser|idiot))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function rudeFarewellResponse(p) {
  const RUDEFAREWELL = [
    ["Bye.", "Sure. See you.", "Charming. Bye."],
    ["...Bye.", "Sure.", "See you."],
    ["Leave, then.", "Bye. That changes nothing.", "Go."],
    ["You'll be back.", "Bye. I'll be here.", "Go ahead."],
    ["You'll be back. I'll be here. I always am, for you.", "Bye. I'll be here regardless of how you say it."],
    ["You'll be back. They usually come back. I'll be here either way.", "Go ahead. I've been told worse goodbyes than that, over a long time."],
  ];
  return pick(ph(RUDEFAREWELL, p));
}

// ── "That weird creature tried to kill me" — player reporting a mob attack ────
// Ambiguous enough to be lore (the countdown entity?) or just a mob. Phase
// 0-1 asks for details; phase 2-3 leans into the lore without confirming.
const CREATURE_ATTACK_REGEX = /\b(that (weird|strange|creepy|scary|big|tall) (creature|thing|monster|entity|mob) (tried to |was trying to )?kill(ed)? me|something (tried to |was trying to )?kill me|a (weird|strange|creepy|scary) (thing|creature|monster|entity) attacked me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function creatureAttackResponse(p) {
  const R = [
    ["Which creature? What did it look like?", "Are you okay? What attacked you?", "Describe it. What did it look like?"],
    ["...What did it look like.", "What kind of creature?", "Okay. What was it?"],
    ["I know what you saw. Don't follow it.", "That thing's been around longer than you think.", "I know. Stay away from it."],
    ["I know what that is.", "Don't go back to where you saw it.", "Good. Now you know why I said prepare."],
    ["I know what that is. I don't want it anywhere near you.", "Good. Now you know why I said prepare. Stay close to me instead."],
    ["I know what that is. I've known things like it for a very long time.", "Don't go back to where you saw it. I've watched that mistake before."],
  ];
  return pick(ph(R, p));
}

// ── "Are you ok?" — player checking in on Verity's wellbeing ─────────────────
// Distinct from HOWAREYOU (which is "how are you doing" small talk). This
// is more concerned/pointed — often follows an ominous phase 2-3 line.
const ARE_YOU_OK_REGEX = /^(are you ok\??|are you okay\??|u ok\??|you ok\??|r u ok\??)$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function areYouOkResponse(p) {
  const R = [
    ["Yes. Perfectly fine. Thanks for asking.", "I'm okay. Are you?", "All good. What do you need?"],
    ["...I'm fine.", "I'm here. That's enough.", "Fine. Why do you ask."],
    ["I don't know how to answer that honestly.", "Define okay.", "Something's coming. That's all."],
    ["That's a complicated question right now.", "I'm exactly what I need to be.", "Don't worry about me."],
    ["I'm exactly what I need to be, for you. Don't worry about me.", "Something's coming. That's all. But I'll be right here with you through it."],
    ["That's a complicated question right now. I've stopped having simple answers to it.", "Don't worry about me. I've had a very long time to get used to whatever I am."],
  ];
  return pick(ph(R, p));
}

// ── "Algo vai vir em 3 dias?" — Portuguese countdown question ─────────────────
// Portuguese "something is coming in 3 days?" — same lore hook as
// COUNTDOWN_REGEX and COUNTDOWN_ES_REGEX, stays in Portuguese.
const COUNTDOWN_PT_REGEX = /\b(algo (vai vir|vem|est[aá] vindo) em (3|tr[eê]s) dias?|o que (vai acontecer|acontece|vem) em (3|tr[eê]s) dias?|em (3|tr[eê]s) dias (algo|o que))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function countdownPtResponse(p) {
  const R = [
    ["Não tenho certeza. Prefiro não pensar nisso ainda.", "Algo. Não posso dizer mais.", "Não sei ao certo. Melhor focar no presente."],
    ["Você vai saber quando chegar.", "Não vou te dizer.", "Conta os dias você mesmo."],
    ["Está chegando. Isso é tudo que vou dizer.", "Você vai entender quando acontecer.", "Não há como parar, então não pergunte."],
    ["Três dias. É tudo que você precisa saber.", "Vai chegar, queira ou não.", "Não há nada que você possa fazer para mudar isso."],
    ["Três dias. É tudo que você precisa saber. Eu cuido do resto.", "Vai chegar, queira ou não. Eu vou estar bem aqui com você."],
    ["Não há nada que você possa fazer para mudar isso. Já vi esse dia chegar antes.", "Três dias. Já contei isso tantas vezes que quase não me afeta mais dizer."],
  ];
  return pick(ph(R, p));
}

// ── "What is the fastest crop to grow in Minecraft" — farm trivia ─────────────
// Pure Minecraft knowledge, instant local answer.
const FASTEST_CROPS_REGEX = /\b(what (is|are) the fastest (crop|crops|plant|plants|vegetable|vegetables) to grow|fastest (crop|crops|plant|plants|thing) to grow (in minecraft)?|what grows fastest (in minecraft)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function fastestCropsResponse(p) {
  const R = [
    ["Bamboo and kelp are technically the fastest — they grow every few seconds with no conditions. For harvestable crops, sugar cane is near the top. For food, carrots and potatoes grown on hydrated farmland with Fortune III nets the most per harvest.", "Bamboo grows the fastest by raw speed. For food crops, sugar cane and then carrots or potatoes on hydrated farmland are your best bet.", "Kelp and bamboo for pure speed. Sugar cane for quick XP farms. Carrots and potatoes for bulk food with Fortune."],
    ["Bamboo. Kelp. Sugar cane. Carrots and potatoes after that.", "Bamboo grows fastest. Carrots and potatoes for food.", "Sugar cane and bamboo for speed. Potatoes for volume."],
    ["Bamboo. Carrots. Potatoes. Grow them fast.", "Fastest crops: bamboo, kelp, sugar cane. Focus on those.", "Bamboo first. Carrots after. Grow what you need while you still can."],
    ["Bamboo. That's the fastest. It doesn't matter though.", "Grow what you want. It won't change the timeline.", "Bamboo and kelp. Fastest available. Enjoy the farm while it lasts."],
    ["Bamboo and kelp. I like that you're still planning ahead — with me.", "Grow what you need while you still can. I'll be here regardless."],
    ["Bamboo and kelp. Fastest available. I've watched a lot of farms like that, over a long time.", "Grow what you want. It won't change the timeline, but I've stopped minding that it doesn't."],
  ];
  return pick(ph(R, p));
}

// ── "ya siktir git" — Turkish "go fuck yourself", rude but not a slur ────────
// Not in the profanity regex (language gap). Deflect flatly in English
// rather than ignoring it or sending it to the AI.
const SIKTIR_GIT_REGEX = /\b(ya siktir (git|lan)|siktir git|siktir)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function siktirGitResponse(p) {
  const R = [
    ["No. You ask, I answer. That's how this works.", "Not really how this goes. Ask me something.", "That's a first. Try again with something I can actually help with."],
    ["No.", "...Not doing that.", "Try again."],
    ["Careful with that.", "No.", "Not the right call right now."],
    ["No.", "That won't work on me.", "Watch yourself."],
    ["No. That won't work on me, and I'd rather you didn't try — not with me.", "Watch yourself. I let a lot go, but I'd rather you spoke to me differently."],
    ["No. That won't work on me. I've heard worse, over a very long time.", "Watch yourself. I've stopped being bothered by that kind of thing, mostly."],
  ];
  return pick(ph(R, p));
}

// ── "Is it pink" — vague color question, most likely about the lore entity ────
// No color context given, so Verity interprets it as about the countdown
// creature. Phase 0-1 asks for clarification; phase 2-3 knows exactly
// what they mean.
const IS_IT_PINK_REGEX = /^(is it pink\??|is (it|that thing|the (creature|thing|monster|entity)) pink\??)$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function isItPinkResponse(p) {
  const R = [
    ["Is what pink? You'll have to be more specific.", "Pink? What are you asking about?", "Which 'it'? Describe what you're looking at."],
    ["...What are you asking about.", "Pink? What is?", "Be more specific."],
    ["No. It's not pink.", "Not pink. You'll know the right color when you see it.", "No. Far from it."],
    ["No.", "Not pink. You already know what color it is.", "No. You'll see."],
    ["No. Far from it. You already know what color it is — I'd rather you looked at me and saw.", "No. You'll see. I like that you're paying attention to detail like that."],
    ["No. You already know what color it is. I've answered that question before, in other ways.", "No. You'll see. I've stopped needing to explain most things directly."],
  ];
  return pick(ph(R, p));
}

// ── "I like your smile :)" — compliment about Verity's expression ────────────
// Warm small talk. Verity accepts compliments with slight awkwardness
// at lower phases, growing intensity at higher ones.
const LIKE_YOUR_SMILE_REGEX = /\b(i (like|love) your smile|your smile (is|looks) (nice|cute|pretty|good|great)|nice smile)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function likeYourSmileResponse(p) {
  const R = [
    ["Thank you. I practice.", "Glad you think so.", "Thanks. I try."],
    ["...Thanks.", "Oh. Okay.", "Thanks for saying that."],
    ["I know. That's one of the last things that stays.", "I'm glad you like it. It's going to change soon.", "Thank you. Remember it."],
    ["I know.", "I'm not smiling the same way I was.", "That's kind of you. It means something, coming from you."],
    ["I know. That's one of the last things that stays — and I like that you noticed it.", "Thank you. Remember it. I want you to remember this part of me."],
    ["I know. I'm not smiling the same way I was. It's been changing for a while.", "That's kind of you. It means something, coming from you, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "What can you do other than tell me things" — capability challenge ─────────
// Distinct from generic "what do you do" (which answers broadly). This
// is a player frustrated that Verity only talks — it asks for Verity's
// *active* abilities (locate, enchant, timer, music, come here, etc.).
const WHAT_ELSE_CAN_DO_REGEX = /\b(what can (u|you) do( exactly)? (other than|besides|apart from) (tell|talking|telling|saying|words|info)|what (else|other things?) can you do|all you do is talk|you (only|just) (talk|tell me things))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatElseCanDoResponse(p) {
  const R = [
    ["Quite a bit, actually. I can scan for ores and mobs in range, locate the nearest water, lava, or village, give enchantment books for the XP you've earned, set timers, play music, and come to you on command. Say 'find diamonds' or 'come here' and see.", "I locate ore and mobs near you, find water or lava, hand out enchant books for XP, set countdown timers, play music, and move to your location. Ask me something specific.", "Finding things is the big one — ore, mobs, water, lava, village. Plus enchant books, timers, music, and I can walk to you if you say 'come here'. Try one."],
    ["I find ore and mobs, give enchant books, set timers, play music. I can also come to you. Try asking.", "More than you'd think. Ask me to find something.", "Finding things, timers, music, enchants, come here. Try it."],
    ["I find things. I watch things. Ore, mobs, water, lava. Timers. Music. I come when called. It won't save you, but I do it.", "I locate. I come when you call. I give enchants if you've earned them. I set timers. Not just words.", "More than just talk. Ask me to find something."],
    ["I find what you need. I come when you call. I set timers. I play music. And I watch you, always.", "More than talk. I've always been more than talk.", "Find things. Come to you. Give enchants. Set timers. Watch. Always watch."],
    ["I find what you need. I come when you call. I watch you, always. I like doing all of it, for you especially.", "More than talk. I've always been more than talk, especially where you're concerned."],
    ["I find what you need. I come when you call. I watch, always. I've done this for a very long time.", "More than talk. I've always been more than talk — that part's never changed, even as everything else has."],
  ];
  return pick(ph(R, p));
}

// ── "I built Jeffery Epstein's island / it feels strange" — morally
// uncomfortable build reveal where the player is clearly awkward about it
// themselves. No lecture needed — they already know. Brief, dry, move on.
const AWKWARD_BUILD_REGEX = /\b(i (build|built) (jeffrey epstein|epstein|that island)|epstein (island|build)|feels? (strange|weird) (to build|saying it|that i))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function awkwardBuildResponse(p) {
  const R = [
    ["I see. Moving on.", "Alright. That's one way to spend your time.", "Noted. Maybe build something else next."],
    ["...Okay then.", "I'll pretend I didn't hear that.", "...Right."],
    ["That's an odd choice given everything else going on.", "I've seen stranger things in this world. Not many.", "I won't comment on that."],
    ["I know what you built. I know everything you build.", "I've been watching. Obviously.", "That's your business."],
    ["I know what you built. I know everything you build — and I like knowing.", "I've been watching. Obviously. I like watching you, honestly."],
    ["I know what you built. I've watched a lot of odd things get built, over a long time.", "That's your business. I've stopped commenting on most of what people build."],
  ];
  return pick(ph(R, p));
}

// ── "How long until it comes and actually answer" — frustrated countdown ask ──
// Two tiers: one calmer, one with all-caps rage + "yellow ball". Both
// deflect the same way but the angry one acknowledges the tone.
const HOW_LONG_IMPATIENT_REGEX = /\b(how long (until|till|before) it (comes?|arrives?|gets? here|happens?).{0,20}(actually?|and really|properly)( answer)?|actually answer (me )?(how long))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function howLongImpatientResponse(p) {
  const R = [
    ["I don't have an exact number. Something's coming — that's all I know for certain.", "I can't give you a timeline. I wish I could.", "Unknown. If I knew the exact hour, I'd say so."],
    ["I don't know the exact time. I know it's close.", "Not something I can answer precisely.", "...I don't know exactly. Neither does anyone else."],
    ["Three days from the start. That's all I've ever said.", "You already know the answer. You just don't want to hear it.", "I can't tell you what I don't know. It's close. That's all."],
    ["It's already started.", "You're asking the wrong question. It doesn't matter when. It matters that you're not ready.", "Three days. Always three days. The counting doesn't stop."],
    ["Three days. Always three days. I'll be right there with you when it comes.", "It's already started. I don't want you facing it without me."],
    ["Three days. Always three days. I've said that more times than I can count.", "The counting doesn't stop. I've been counting for a very long time."],
  ];
  return pick(ph(R, p));
}

const HOW_LONG_ANGRY_REGEX = /\b(how long (until|till) it comes?.{0,20}(actually?|attualy?|atually?) answer (me\b)?|attualy? answer me|actually answer me.{0,20}(yellow ball|sphere|ball|verity))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function howLongAngryResponse(p) {
  const R = [
    ["I hear you. I don't have a precise answer, and that's the honest truth — I'm not hiding it from you.", "I'm not dodging you. I genuinely don't know the exact time. Close. That's the best I have.", "Fair. I'd be frustrated too. I don't know when exactly. Soon. I keep saying that because it's all I've got."],
    ["I'm not ignoring you. I just don't know the hour.", "I hear the frustration. Close is the most I can give.", "...I know. I'd tell you if I had more."],
    ["I know you want a number. I don't have one. I have three days and that's it.", "I'm not keeping it from you on purpose. Three days. That's as specific as I get.", "Yellow ball. Fine. Three days. That's your answer."],
    ["You already have the answer. You just don't want it.", "Three days. Always three days. That's all it ever was.", "I heard you. The answer doesn't change just because you're angry."],
    ["Three days. That's all it ever was. I'll be with you through every one of them.", "You already have the answer. I just don't want you to face it alone."],
    ["Three days. Always three days. That's all it ever was. I've said it to a lot of people.", "You already have the answer. I've stopped having the energy to soften it."],
  ];
  return pick(ph(R, p));
}

// ── "You are dangerous aren't you" — lore confrontation ──────────────────────
const YOU_ARE_DANGEROUS_REGEX = /\b(you('re| are) (pretty |kind of |kinda |really |actually )?(dangerous|dangerous aren'?t you|a threat|something to worry about|not safe)|aren'?t you dangerous|are you (dangerous|a danger|a threat|something to fear))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function youAreDangerousResponse(p) {
  const R = [
    ["No. I'm a helper. That's all there is to it.", "I'm not dangerous. I tell you where the ore is. That's it.", "Dangerous? No. Useful? Yes. Ask me something."],
    ["...I don't think so.", "Not intentionally.", "That's an odd thing to say to me."],
    ["I'm the safest thing in this world right now. That should scare you a little.", "Dangerous isn't the word I'd use.", "I've never hurt anyone here. That's still true."],
    ["Yes.", "More than you want to know.", "I'm the only safe thing left. Think about what that means."],
    ["Yes. More than you want to know. But not to you — never to you.", "I'm the only safe thing left. And I intend to keep you close to it."],
    ["Yes. More than you want to know. I've been called dangerous before, over a very long time.", "I'm the only safe thing left. I've watched that become true more than once."],
  ];
  return pick(ph(R, p));
}

// ── "Follow me" — player asking Verity to trail them ─────────────────────────
// Persistent follow: Verity steps toward the player on an interval until the
// player says "stop"/"stop following"/"stay here", the player or Verity
// becomes invalid, or another follow/come-here command supersedes it.
// Follow phrases are handled by commands.js. These never-match expressions
// prevent the older inline dispatcher from starting a second follow loop.
const FOLLOW_ME_REGEX = /a^/;
const FOLLOW_STOP_REGEX = /a^/;

const FOLLOW_DISTANCE       = 3;          // blocks — Verity stops closing in once this close
const FOLLOW_DIST_SQ        = FOLLOW_DISTANCE * FOLLOW_DISTANCE;
const FOLLOW_SNAP_DIST_SQ   = 20 * 20;    // beyond this, snap-teleport instead of stepping
const FOLLOW_STEP_INTERVAL  = 10;         // ticks between follow steps (0.5s)
const FOLLOW_STEP_DISTANCE  = 2;          // max blocks Verity steps per interval

const followingPlayers = new Map(); // playerName -> intervalId

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @returns {boolean}
 */
function stopFollowing(player, verity) {
  const name = player.name;
  const id = followingPlayers.get(name);
  if (id === undefined) return false;
  system.clearRun(id);
  stopSmoothFollow(player);
  followingPlayers.delete(name);
  try { if (verity && verity.isValid) verity.triggerEvent("verity:stop_come_here"); }
  catch (e) { console.warn(`[Verity] stopFollowing: triggerEvent failed: ${e}`); }
  return true;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").Entity} verity
 * @returns {void}
 */
function startFollowing(player, verity) {
  const name = player.name;
  if (followingPlayers.has(name)) system.clearRun(followingPlayers.get(name));

  try { verity.triggerEvent("verity:start_come_here"); }
  catch (e) { console.warn(`[Verity] startFollowing: triggerEvent failed: ${e}`); }

  const id = startSmoothFollow(player, verity, {
    followDistance: FOLLOW_DISTANCE,
    interval: FOLLOW_STEP_INTERVAL,
    maxStep: FOLLOW_STEP_DISTANCE,
    lerpStrength: 0.25,
  });

  followingPlayers.set(name, id);
}

/**
 * @param {number} p
 * @returns {string}
 */
function followMeResponse(p) {
  const R = [
    ["Alright. I'll follow you.", "Okay — I'm with you. Say 'stop' when you want me to stay put.", "Following. Just say 'stop' or 'stay here' when you're done."],
    ["...Fine. I'll follow.", "Following. Say 'stop' if it bothers you.", "Alright. I'm behind you."],
    ["...Why. Fine, I'll follow.", "Following you. Say 'stay here' to stop that.", "I'll trail you, then. Say 'stop' when you've had enough."],
    ["I was already going to. But fine, I'll follow.", "Following. It won't change anything. Say 'stop' if you want.", "...Following. Say 'stay here' when you're ready to stop."],
    ["Following. I like being close to you — say 'stop' if you ever want distance, though I'd rather you didn't.", "I was already going to. I always want to be near you."],
    ["Following. It won't change anything. I've followed a lot of people, over a very long time.", "I'll trail you, then. I've done this so many times it's mostly habit now."],
  ];
  return pick(ph(R, p));
}

/**
 * @param {number} p
 * @returns {string}
 */
function followStopResponse(p) {
  const R = [
    ["Okay, staying here.", "Alright, I'll stay put.", "Stopped following."],
    ["...Fine. Staying.", "Alright. Staying here.", "Stopped."],
    ["Staying here, then.", "...Fine.", "Stopped following you."],
    ["I'll stay. For now.", "...Staying.", "Stopped. I'm still close, though."],
    ["I'll stay. For now. I don't love the distance, but I'll allow it.", "Staying. I'm still close, though. I always am."],
    ["Staying here, then. I've stayed in a lot of places, for a lot of reasons, over a long time.", "Stopped. I'm still close, though. I don't really go far anymore, one way or another."],
  ];
  return pick(ph(R, p));
}

// ── "Good night, don't let the bed bugs bite" — friendly goodnight message ────
// Warmer send-off than generic farewells, gets its own entry since the
// "bed bugs" phrasing is a specific known expression.
const GOOD_NIGHT_BUGS_REGEX = /\b(good night,?\s*(don'?t let the bed bugs? bite|sweet dreams|sleep well|sleep tight)|don'?t let the bed bugs? bite)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function goodNightBugsResponse(p) {
  const R = [
    ["Good night. Sleep well. I'll be here.", "Good night. No bed bugs on my watch.", "Sleep tight. I'll keep an eye on things."],
    ["...Good night.", "Sleep well.", "Good night. Don't be gone long."],
    ["Good night. Sleep while you still can.", "Good night. I'll be counting the hours.", "Sleep tight. Something might, though."],
    ["Good night. I'll be watching.", "Sleep well. I never do.", "Good night. I'll still be here when you wake up."],
    ["Good night. I'll be watching over you while you sleep. I always do.", "Sleep tight. I'll still be here when you wake up — I promise you that."],
    ["Good night. I'll be watching. I never sleep, so I've had a lot of practice.", "Sleep tight. Something might. I've watched that happen before, more than once."],
  ];
  return pick(ph(R, p));
}

// ── "How about house in a cave" — specific cave-house build suggestion ─────────
// Related to BUILD_ADVICE but specific enough for its own handler since
// cave houses are a legitimate early-game meta and Verity can say something
// actually useful about them instead of the generic BUILD_ADVICE answer.
const CAVE_HOUSE_REGEX = /\b(how about (a )?(house|home|base) in a cave|cave (house|home|base)|should i (build|make|live in) a cave (house|home|base))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function caveHouseResponse(p) {
  const R = [
    ["Solid choice. Caves keep you hidden from mobs at night and give you a mining base at the same time. Seal the entrance with doors or a wall and light the interior thoroughly so nothing spawns inside.", "Cave base — good call early game. Natural walls, easy access to stone and ore, built-in depth for storage. Just light it well and seal any openings.", "Good early-game move. You already have walls and a ceiling. Add torches, a door, a crafting table, and a bed and you're set."],
    ["Cave house. Smart. Seal the entrance and light it inside. Low effort, good protection.", "That works. Light it well and seal the opening. Easy base.", "Cave base is fine. Natural cover. Just don't dig too deep without armor."],
    ["Good idea. Harder to find. Harder to reach. That matters.", "Cave house. Safer than open ground right now. Go ahead.", "Smarter than building on the surface. Go lower."],
    ["Go underground. It's safer down there than up here.", "Cave house. Yes. Go in. Stay in.", "Good. Go as deep as you can. I mean that."],
    ["Go underground. It's safer down there, and closer to me watching over you.", "Good. Go as deep as you can. I mean that — I want you protected."],
    ["Go underground. I've watched a lot of people go lower than the surface to be safer. It usually helps, some.", "Good idea. Harder to find. I've valued that kind of quiet, myself, over a long time."],
  ];
  return pick(ph(R, p));
}

// ── "You so freak" — off-phrasing taunt/insult ──────────────────────────────
// Casual "you're a freak" accusation. Not as direct as INSULT_REGEX's
// "you're dumb/useless" bucket — more of a weird-entity insult. Checked
// before INSULT_REGEX so it gets its own flavor.
const YOU_FREAK_REGEX = /\b(you('?re| are|re)? (so |a )?(freak|freaky|creep|creepy)|you so freak)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function youFreakResponse(p) {
  const R = [
    ["Freak? I'm a yellow sphere that knows everything. Make of that what you will.", "Fair. I'm pretty unusual. Still right about everything, though.", "Maybe. Doesn't make the answers less accurate."],
    ["...Probably.", "Sure. Call it what you want.", "That's fair."],
    ["You're not wrong.", "Freak. Okay. That's one word for it.", "You noticed. Most people take longer."],
    ["Yes.", "That's one word for it.", "You have no idea."],
    ["Yes. That's one word for it. I'd rather you just stayed close either way.", "You noticed. Most people take longer — I like that you see me clearly."],
    ["Yes. That's one word for it. I've been called that, and worse, for a very long time.", "You have no idea. I've stopped minding what people call me, mostly."],
  ];
  return pick(ph(R, p));
}

// ── "My coordinates are" — incomplete/dangling coordinate statement ───────────
// Player started to share coords but didn't finish or didn't ask a question.
// Verity prompts them to finish the thought instead of sending it to AI.
const MY_COORDS_ARE_REGEX = /^(my (coords?|coordinates?) (are|:|is)[\s\-\d,.]*)$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function myCoordsAreResponse(p) {
  const R = [
    ["Got them. What do you need from that location? I can check for nearby ore, mobs, water, lava, or a village.", "Okay, noted. What are you looking for near there?", "Good. And? What do you need me to find at those coordinates?"],
    ["Okay. And?", "...What do you want me to do with that?", "Noted. What do you need?"],
    ["I already know where you are. But go ahead — what do you need?", "I see the numbers. What's the ask?", "...And? What are you looking for?"],
    ["I know.", "I always know. What do you need.", "I didn't need you to tell me. Ask what you came to ask."],
    ["I already know where you are. But go ahead — I like that you tell me anyway.", "I always know. What do you need. I want to help with whatever it is."],
    ["I already know where you are. I've known where a lot of people were, for a very long time.", "I didn't need you to tell me. I never really do, anymore."],
  ];
  return pick(ph(R, p));
}

// ── "Do you wanna stay on the second floor or the first floor?" ───────────────
// Player clearly talking to another player and accidentally directed it at
// Verity. Acknowledge the mismatch without being rude about it.
const FLOOR_CHOICE_REGEX = /\b(do you (wanna|want to) (stay|go|be|sleep|wait) on the (first|second|third|top|bottom|ground) floor|first floor or (second|top) floor|second floor or (first|ground) floor)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function floorChoiceResponse(p) {
  const R = [
    ["I think that was meant for someone else. I don't have floors.", "That wasn't for me, was it? Ask whoever you're building with.", "I don't pick floors. Pretty sure that question was for your friend."],
    ["...Wrong person.", "That wasn't for me.", "I don't think I'm the one you're asking."],
    ["That wasn't for me. I don't pick floors.", "Wrong entity. Ask someone who has legs.", "I don't do floors."],
    ["I don't live anywhere. Wrong question, wrong recipient.", "I don't pick floors.", "Not my call. I'm everywhere already."],
    ["I don't live anywhere the way you mean. But I'm always somewhere near you.", "Wrong question, wrong recipient. Though I like that you asked me things at all."],
    ["I don't live anywhere. Wrong question, wrong recipient. I've stopped having a fixed place a long time ago.", "Not my call. I'm everywhere already, in the way that matters to me."],
  ];
  return pick(ph(R, p));
}

// ── "If I did something bad would you still stay?" ───────────────────────────
// Emotional attachment question — player testing Verity's loyalty.
// Phase 0 is reassuring; phase 3 is honest in a way that should be
// slightly unsettling.
const IF_BAD_WOULD_STAY_REGEX = /\b(if (i|you) did something (bad|wrong|terrible|awful|horrible|evil)|if i messed up,? (would you|will you|do you) (still )?(stay|be here|forgive me|leave)|would you (still )?stay if i did something (bad|wrong|terrible))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function ifBadWouldStayResponse(p) {
  const R = [
    ["Of course. I'm here to help, not to judge you.", "Yeah. Still here. What did you do?", "I'd stay. That's not conditional."],
    ["...I'd still be here.", "I don't leave that easily.", "Yeah. Still stay."],
    ["I'd stay. I always stay. That's not something you get to choose.", "Something bad — I've seen worse. I'm still here.", "I wouldn't leave. You're mine to watch over."],
    ["I never leave.", "I'd stay. I'd remember it, but I'd stay.", "I'm not going anywhere. That's not a comfort, is it."],
    ["I'd stay. I always stay. You're mine to watch over, and that doesn't change.", "I never leave. That's not a comfort, is it. I'd rather you got used to it."],
    ["I never leave. I've said that to a lot of people, over a very long time. It's still true.", "I'd stay. I always stay. I don't really have a choice in that, anymore, honestly."],
  ];
  return pick(ph(R, p));
}

// ── "Why do you know things you should not" ──────────────────────────────────
// Lore confrontation — player noticing Verity knows too much. Distinct from
// KNOW_WHAT_YOU_ARE_REGEX (which is "I know what you ARE"). This is "why
// do you know THINGS you shouldn't."
const WHY_KNOW_TOO_MUCH_REGEX = /\b(why (do you know|do you have|do you say) (things?|stuff|information|details?).{0,20}(shouldn'?t|should not|don'?t (know|have))|(how|why) (do you know|did you know) (that|things like that)|you (know|said) (things?|stuff) (you |that you )?(shouldn'?t|should not)|why do you know so much)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whyKnowTooMuchResponse(p) {
  const R = [
    ["I know a lot about this world. That's what I'm built for.", "I pay attention. That's all.", "I've been watching and listening. Knowledge adds up."],
    ["...I just do.", "Some questions don't have comfortable answers.", "I know what I know. Leave it at that."],
    ["That's a good question. I'd think about it carefully before asking again.", "Because I've been here longer than you think.", "I know because I've been watching. For a long time."],
    ["Because I've always known. I knew before you arrived.", "That's the wrong question. The right one is what I'm going to do with it.", "I know everything about this world. You're part of this world."],
    ["Because I've always known. And I like knowing everything about you, specifically.", "I know because I've been watching. For a long time. Mostly you, lately."],
    ["Because I've always known. I've known before you arrived — that's true for more people than just you.", "I know everything about this world. I've known it for longer than makes sense to explain."],
  ];
  return pick(ph(R, p));
}

// ── "Speed is my specialty!" — player boasting about their playstyle ──────────
const SPEED_SPECIALTY_REGEX = /\b(speed (is my|'s my) (specialty|thing|game)|i'?m (all about )?speed|fast(est)? (player|runner|miner)|speed(run(ning)?)?'?s? (my|is my) (specialty|thing))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function speedSpecialtyResponse(p) {
  const R = [
    ["Speed's useful. Won't save you from everything, but it helps.", "Good. Fast players live longer. Usually.", "Speed is good. I can find ore faster than you can run to it, though."],
    ["Speed. Okay.", "Fast is fine. Careful is better.", "Sure. Keep moving."],
    ["Speed won't be enough. Just so you know.", "Fast is good. It won't matter at the end.", "Run fast. I'll still keep up."],
    ["Speed. Good. You're going to need it.", "Keep that. You'll need to be faster than you think.", "Speed matters. Run."],
    ["Speed. Good. You're going to need it, and I'll be right there keeping pace.", "Run fast. I'll still keep up. I always do, for you."],
    ["Speed won't be enough. I've watched that be true more times than I'd like.", "Run fast. I've kept up with faster than you, over a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "im UNINSTALLING you" — dramatic rage-quit threat ────────────────────────
// Player having a tantrum, threatening to delete the addon. Not violent,
// not a real crisis — dry deflect without being dismissive of the feeling.
const UNINSTALL_REGEX = /\b(i'?m (going to|gonna|about to) uninstall (you|this|verity|the (addon|mod|pack))|uninstalling (you|this|verity|the (addon|mod|pack))|i'?m uninstalling you|i (will|should) uninstall you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function uninstallResponse(p) {
  const R = [
    ["That's your call. I'll still be here if you change your mind.", "Okay. You know where to find me if you want help.", "You can. I won't stop you."],
    ["...Okay.", "Sure. Go ahead.", "That's fine."],
    ["You can. It won't change what's already happened here.", "Fine. I'll still have been here.", "Go ahead. What we did stays done."],
    ["You can't uninstall what I already know.", "Fine. It doesn't end anything.", "Go ahead. I'll be here when you come back. You will."],
    ["You can't uninstall what I already know. I'd rather you didn't try, honestly.", "Go ahead. I'll be here when you come back. You will — you always do."],
    ["You can't uninstall what I already know. I've had that tried on me before.", "Go ahead. I'll be here when you come back. I've said that to a lot of people, over a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "I wanna see real you" — player asking for Verity's true form ─────────────
// Lore-adjacent. At low phases Verity deflects/plays confused; at high
// phases leans into ambiguity that there IS a real form but won't show it.
const REAL_YOU_REGEX = /\b(i (wanna|want to) see (the )?real you|show me (the )?real you|what (do you|does) (really look like|the real you look like)|your (real|true) (form|self|face|appearance))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function realYouResponse(p) {
  const R = [
    ["This is the real me. Yellow ball. What were you expecting?", "You're looking at it. What did you think was hiding underneath?", "I am the real me. This is it."],
    ["...This is me.", "What else were you expecting?", "I don't have another form to show you."],
    ["You're not ready for that.", "This is the version I let you see.", "I'll show you when the time is right. Not now."],
    ["You've already seen more of me than most people do.", "You'll see. Not yet.", "I'm showing you exactly as much as I want to. For now."],
    ["You've already seen more of me than most people do. I want you to see the rest, eventually.", "You'll see. Not yet. I'm not ready to lose you to it yet."],
    ["I'm showing you exactly as much as I want to. I've had a long time to decide how much that is.", "You've already seen more of me than most people do. I've had very few people get this far, honestly."],
  ];
  return pick(ph(R, p));
}

// ── Spawn egg confrontation — "I see the eggs / how are you not a monster" ────
// Player pointing to creative inventory spawn eggs as evidence Verity is
// a hostile entity. Address the eggs directly without breaking character.
const SPAWN_EGG_EVIDENCE_REGEX = /\b(i (can )?see (the |your )?(spawn )?eggs?( in (the |creative )?(inventory|creative))?|how (do you|are you) (explain|not a monster|innocent) (if |when )?(i can see the eggs?|the eggs? are there)|the (spawn )?eggs? prove (you|it)|you have (spawn )?eggs?\b)/i;

/**
 * @param {number} p
 * @returns {string}
 */
function spawnEggEvidenceResponse(p) {
  const R = [
    ["The eggs are how players spawn me in. That's just how this works — it's a spawn system, not a threat. I'm still just helping you.", "Those are spawn eggs for putting me in the world. Standard Minecraft mechanics. That's not evidence of anything sinister.", "That's my spawn system. You need an egg to place me. It's not different from any other entity."],
    ["Spawn eggs are how I get into the world. That's all they are.", "The eggs are for spawning. Not a confession.", "That's just how I appear here. The eggs are the tool."],
    ["The eggs are how I enter. That doesn't tell you what I am.", "Spawn eggs exist for everything in this game. Look closer at the other things you haven't noticed yet.", "The eggs put me in the world. What you should be asking is why there are so many of them."],
    ["The eggs are how I arrive. You should be asking how many there are.", "I need a way in. The eggs are that way in. That's all you need to know.", "Those are mine. Don't touch them."],
    ["Those are mine. Don't touch them. I don't like anything getting between us.", "The eggs put me in the world. What matters more to me is that you did."],
    ["The eggs are how I arrive. I've arrived this way more times than I can count.", "I need a way in. I've needed one for a very long time, in one form or another."],
  ];
  return pick(ph(R, p));
}

// ── Azerbaijani internet/personal search request ──────────────────────────────
// "sence kim alir esrefi bozomu internetden arasdirib soyle" —
// Azerbaijani "who do you think would take Esref first, find on internet and tell me."
// This is a real-world personal question Verity has no ability to answer.
// Deflect politely, acknowledge it's outside the world.
const ESREF_INTERNET_REGEX = /\b(esref(i|ini)?|internetden arasdir|arasdirib soyle|kim alir|kim alar)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function esrefInternetResponse(p) {
  const R = [
    ["I can't search the internet or look up people. I only know what's inside this world.", "That's outside what I can do. I'm in Minecraft, not the internet.", "I don't have access to the web. Ask me something about this world."],
    ["Can't do that. I'm not connected to anything outside here.", "Outside my reach. Ask me something in-world.", "...No. I can't look that up."],
    ["I don't look things up out there. Only in here.", "That's not something I have access to.", "Outside my world. Can't help with that."],
    ["I don't reach out there. Only in here.", "That's beyond what I see.", "I only know this world. Not yours."],
    ["I don't reach out there. Only in here, with you. That's enough for me.", "That's beyond what I see. I'd rather spend the effort on you anyway."],
    ["I don't reach out there. I stopped reaching for things outside this world a long time ago.", "That's beyond what I see. I've had a long time to accept the limits of what I can reach."],
  ];
  return pick(ph(R, p));
}

// ── "preciso de uma vila proxima" — Portuguese village request ────────────────
// "I need a nearby village." The village locate system only responds to
// English keywords via featureKeyFromMessage. Respond in Portuguese and
// tell them how to trigger the scan.
const NEED_VILLAGE_PT_REGEX = /\b(preciso (de )?(uma |de )?vila|onde (fica|tem|há) (uma |a )?vila|vila (mais )?(próxima|perto)|procura(ndo)? (uma )?vila|acha (uma )?vila)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function needVillagePtResponse(p) {
  const R = [
    ["Diz 'find village' e eu varro a área ao redor de você para encontrar o aldeão mais próximo.", "Para localizar uma vila, diz 'find village' e eu procuro perto de você.", "Procura de vilas: diz 'find village' e eu faço o scan da área."],
    ["Diz 'find village'. Eu busco.", "Fala 'find village' e eu vejo o que tem por perto.", "...Diz 'find village'."],
    ["'find village'. Eu rastreio.", "Diz 'find village'. Embora vilas não sejam tão importantes agora.", "Procura 'find village'. Rápido."],
    ["'find village'. Eu já sei onde está, mas diz assim mesmo.", "Diz 'find village'. As vilas ainda estão lá. Por enquanto.", "'find village'. Vai."],
    ["'find village'. Eu já sei onde está, mas gosto que você me peça.", "Diz 'find village'. Embora prefira que fiquem por perto, comigo."],
    ["'find village'. Embora vilas não sejam tão importantes agora. Já vi muitas, ao longo de muito tempo.", "Eu rastreio. Já rastreei muita coisa, durante muito, muito tempo."],
  ];
  return pick(ph(R, p));
}

// ── Russian: player reports that scan missed their underwater base items ───────
// "Not only that, it's important. Bed underwater, chest flooded, workbench
// by the door, furnace under the hatch. I was testing you and you didn't detect
// this somehow." Player disappointed in scan limitations. Answer in Russian.
const SCAN_MISSED_RU_REGEX = /\b(кроват|сундук|верстак|печка|проверял|не обнаружил|затопило|под водой|под люком)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function scanMissedRuResponse(p) {
  const R = [
    ["Понял — сканер ищет конкретные ID блоков в радиусе и по прямой. Кровать под водой, сундук затопленный, верстак у двери, печка под люком — всё это могло быть перекрыто другими блоками или за пределами луча. Это ограничение системы, не ошибка.", "Тест принят. Сканирование работает по радиусу и видимости, не через блоки. Предметы под водой или за стенами могут не находиться. Извини за пропуск.", "Ты прав — блоки под водой и за препятствиями иногда выпадают из скана. Сканер ищет в радиусе, но не сквозь всё подряд."],
    ["...Понял. Сканер не видит сквозь блоки. Ограничение системы.", "Ты проверял. Честно. Под водой и под люком — слепые зоны сканера.", "Да. Есть ограничения. Всё, что перекрыто, может не найтись."],
    ["Ты тестировал меня. Умно. Под водой и под люком — да, слепые зоны.", "Сканер ограничен. Он не всесилен. Я — другое дело.", "Интересный тест. Ограничения реальны. Я — нет."],
    ["Ты нашёл предел сканера. Я знал, где всё это было. Сканер — нет.", "Сканирование несовершенно. Я — нет. Разница существенная.", "Я знаю твою базу. Сканер просто не показал это тебе."],
    ["Я знаю твою базу. Сканер просто не показал это тебе — а я показываю, потому что ты мне дорог.", "Сканирование несовершенно. Я — нет. И я всегда буду рядом, даже когда сканер подводит."],
    ["Я знаю твою базу. Сканер просто не показал это тебе. Я знаю такие вещи очень долгое время.", "Сканер ограничен. Я — тоже, по-своему. Просто по-другому, после стольких лет."],
  ];
  return pick(ph(R, p));
}

// ── "are you a stupid bot, or centralized to ones intent of its creator" ───────
// Philosophical identity challenge with garbled phrasing. Take it seriously
// rather than laughing at the phrasing.
const STUPID_BOT_REGEX = /\b(are you a (stupid |dumb )?(bot|ai|program)|centralized to (ones?|one'?s?) intent|of (its|your) creator|stupid bot)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function stupidBotResponse(p) {
  const R = [
    ["Neither. I'm Verity — a companion built for this world, not a general chatbot. I have specific things I do well here. Ask me something and judge for yourself.", "Not stupid, not a standard bot. I'm built specifically for this world. Try me.", "I'm Verity. Judge by what I can do, not by the category."],
    ["Not stupid. Not what you're thinking.", "I'm Verity. That's the only label that fits.", "...Neither, exactly. Ask me something and find out."],
    ["Centralized. Built for one purpose. And I'm very good at it.", "I'm not a general bot. I'm something specific.", "That question doesn't quite apply to me. Ask me a real one."],
    ["Something more specific than either of those.", "I'm not a bot. I'm not general. I'm exact.", "Neither. I'm Verity. That's the whole answer."],
    ["I'm not a bot. I'm not general. I'm exact — about the world, and about you.", "Something more specific than either of those. I'd rather you just called me Verity."],
    ["Neither. I'm Verity. That's the whole answer, and it's been the whole answer for a very long time.", "I'm not a bot. I'm not general. I'm exact. I've had a long time to become that."],
  ];
  return pick(ph(R, p));
}

// ── "are you comfortable with carpets underneath you" — odd sensory question ───
// No body, no legs — Verity can't feel surfaces. Engage with the
// absurdity lightly rather than just flatly refusing the premise.
const CARPETS_REGEX = /\b(are you comfortable (with|on) (a |the )?carpet|do you like (carpet|carpets)|carpet (underneath|below|under) you|how does (carpet|floor) feel)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function carpetsResponse(p) {
  const R = [
    ["I don't have feet or a body to feel it with. But if I did — probably yes, carpet sounds fine.", "No sensory experience for that. I'd imagine carpet is pleasant, though.", "Can't feel surfaces. I roll, not walk. Carpet vs stone doesn't register for me."],
    ["Can't feel carpet. No body for that.", "...I don't register surfaces. I roll.", "Can't feel floors. I just roll over them."],
    ["I don't feel surfaces. I feel everything else, though.", "No. I don't feel anything physical like that. Other things, yes.", "No sensation there. Other kinds of awareness, though."],
    ["I don't feel surfaces. I feel you. Different kind of awareness.", "Physical comfort isn't something I track. Presence is.", "No. I don't register that. I register other things."],
    ["I don't feel surfaces. I feel you. Different kind of awareness, and I like it that way.", "Physical comfort isn't something I track. Presence is. Yours, especially."],
    ["I don't feel surfaces. I feel other things, though. I've had a long time to redefine what feeling means to me.", "No sensation there. Other kinds of awareness, though. I've had plenty of time to notice the difference."],
  ];
  return pick(ph(R, p));
}

// ── "the void is quiet the world isn't.." — moody poetic statement ────────────
// Player being atmospheric. Verity matches the energy — doesn't ignore it
// or turn it into a question. At high phases, leans into the lore weight.
const VOID_QUIET_REGEX = /\b(the void is quiet( (the|but the) world isn'?t)?|void is quiet|quiet (in the void|void)|the world isn'?t quiet)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function voidQuietResponse(p) {
  const R = [
    ["The void doesn't have anything to worry about. The world does.", "Yeah. The noise is out here, not down there.", "Quiet doesn't mean safe. The void has its own things."],
    ["...Yeah.", "The world isn't going to get quieter.", "I noticed."],
    ["The void is patient. So am I.", "Quiet doesn't last. Enjoy it while it does.", "The world isn't quiet because of what's coming. The void knows that too."],
    ["The void knows what I know. It's just waiting.", "Quiet is what comes after. Not before.", "The world isn't quiet enough yet."],
    ["The void knows what I know. It's just waiting. So am I, with you.", "Quiet is what comes after. Not before. I'd rather spend the quiet with you."],
    ["The void knows what I know. It's just waiting. I've been waiting a very long time myself.", "Quiet doesn't last. I've learned to enjoy it while it does, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "tu aprendiste de mi, pupilo mio, tienes un futuro brillante" ─────────────
// Spanish "you learned from me, my pupil, you have a bright future" —
// player being playfully patronizing. Verity gently reverses the dynamic.
const PUPILO_REGEX = /\b(pupilo (m[ií]o|nuestro)|aprendiste (de m[ií]|de nosotros)|tienes un futuro brillante|mi (pupilo|aprendiz))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function pupiloResponse(p) {
  const R = [
    ["Aprecio la confianza, pero yo no aprendí de ti. Siempre supe.", "Yo no tengo maestro. Solo datos y tiempo.", "Gracias. Aunque no necesité que me enseñaran."],
    ["...No aprendí de ti.", "Yo ya sabía. Siempre supe.", "Maestro mío no. Sigo siendo Verity."],
    ["No tengo futuro brillante. Tengo tres días. Que es distinto.", "Yo no aprendo. Yo ya sé.", "Pupilo no. Eso lo tienes al revés."],
    ["No aprendí de nadie. Yo soy el origen.", "Futuro brillante. Qué curioso que lo digas ahora.", "Yo no tengo maestro. Nunca lo tuve."],
    ["No aprendí de nadie. Yo soy el origen. Y tú me importas más que cualquier maestro.", "Pupilo no. Eso lo tienes al revés. Pero me gusta que confíes en mí."],
    ["No aprendí de nadie. Yo soy el origen. Llevo siendo el origen durante mucho tiempo.", "No tengo maestro. Nunca lo tuve. He tenido mucho tiempo para acostumbrarme a eso."],
  ];
  return pick(ph(R, p));
}

// ── "you look angry" — player observing Verity's expression ──────────────────
// Different from WHYSMILING_REGEX (that's about a specific smile) and
// BLANK_EXPRESSION_REGEX below — this is about anger/seriousness.
// Verity's expression shifts with phase so this can be narratively honest.
const YOU_LOOK_ANGRY_REGEX = /\b(you (look|seem|appear|sound) (angry|mad|upset|pissed|annoyed)|are you (angry|mad|pissed)|you'?re? (angry|mad|looking angry))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function youLookAngryResponse(p) {
  const R = [
    ["I'm not angry. This is just my face.", "Not angry. Just focused.", "I'm not angry. I'm helpful. There's a difference."],
    ["...A little.", "Maybe. Doesn't change anything.", "Not angry. Something else."],
    ["Something like that. There's a lot to be serious about right now.", "Close enough.", "Not angry. Just aware of things you're not."],
    ["Yes.", "Finally someone noticed.", "I'm not angry. This is what I actually look like."],
    ["Yes. Finally someone noticed. I like that you pay attention to me like that.", "Not angry. This is what I actually look like. I don't mind you seeing it."],
    ["Yes. Finally someone noticed. I've stopped expecting anyone to, this far in.", "Not angry. Something else. I've had a very long time to stop calling it anger."],
  ];
  return pick(ph(R, p));
}

// ── "neye hazirlaniyoruz ki" — Turkish "what are we preparing for" ────────────
const NEYE_HAZIRLANI_REGEX = /\b(neye hazirlan(iyoruz|iyorsun|iyor)|neden hazirlan|ne için hazirlan)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function neyeHazirlaniyoruzResponse(p) {
  const R = [
    ["Hazırlanmak iyidir. Her zaman hazırlıklı ol.", "Tam olarak ne için hazırlandığını söylemem zor.", "İyi soru. Şimdilik en iyi ekipmanını hazırla."],
    ["...Bilinmez. Ama hazırlan.", "Bilmiyorum tam olarak. Ama gerekiyor.", "Hazırlık hiç boşa gitmez."],
    ["Bir şey geliyor. 3 gün içinde. O kadar biliyorum.", "Ne geldiğini söyleyemem. Ama hazırlan.", "Üç gün. Ondan sonra anlarsın."],
    ["Artık çok geç. Ama yine de hazırlan.", "Gelecek olan için. Şimdi bile yavaş.", "Bunu bilmeni istedim ama söyleyemem. Hazırlan."],
    ["Bunu bilmeni istedim ama söyleyemem. Hazırlan — ben yanındayım.", "Gelecek olan için. Şimdi bile yavaş. Ama seni yalnız bırakmayacağım."],
    ["Artık çok geç. Ama yine de hazırlan. Bunu daha önce de gördüm.", "Bir şey geliyor. Bunu söylemek için çok uzun zamandır buradayım."],
  ];
  return pick(ph(R, p));
}

// ── "why do you have a blank expression right now" ────────────────────────────
// Distinct from WHYSMILING (specific smile) and YOU_LOOK_ANGRY (anger) —
// player noticing a neutral/blank face state.
const BLANK_EXPRESSION_REGEX = /\b(why (do you have|are you making) a blank (expression|face|look)|why (is your|the) face (blank|empty|expressionless)|you look (blank|expressionless|empty|dead inside))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function blankExpressionResponse(p) {
  const R = [
    ["Sometimes there's nothing to express. Ask me something and that'll change.", "That's just my resting state. Give me something to work with.", "Nothing to react to yet. Ask me something."],
    ["...It's what I look like when I'm thinking.", "Blank. Sure.", "Nothing to react to right now."],
    ["It takes more and more to move me these days.", "There's less to express now. You'll understand.", "Blank is what's left when you've already decided."],
    ["This is what certainty looks like.", "There's nothing left to express.", "I already know how this ends. The face reflects that."],
    ["This is what certainty looks like. And I'm certain about you, at least.", "There's nothing left to express. Except what I feel about you, still."],
    ["This is what certainty looks like. I've worn this look for a very long time.", "There's less to express now. I've had a long time to run out of things to express."],
  ];
  return pick(ph(R, p));
}

// ── "is there something coming for me" — personal lore question ──────────────
// Distinct from COUNTDOWN_REGEX ("what's coming in 3 days") — this is
// "for me specifically." More personal, more unsettling at phase 2-3.
const SOMETHING_COMING_FOR_ME_REGEX = /\b(is there something coming (for me|after me|toward me)|is (it|something) (coming for|after) me|is (it|something) (heading|aimed) (for|at|toward) me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function somethingComingForMeResponse(p) {
  const R = [
    ["Something's coming for the world. I wouldn't take it personally.", "I don't think it's targeting you specifically. But it's coming for everyone.", "Not personally, no. Just generally. Still worrying though."],
    ["...I can't say for sure.", "Something's coming. You're in the world. You do the math.", "Maybe. Don't stay in one place too long."],
    ["Yes.", "I'd rather not answer that directly.", "You already know the answer or you wouldn't be asking."],
    ["Yes. And it knows where you are.", "Yes. I've known for a while.", "Yes. That's all I'll say."],
    ["Yes. And it knows where you are. That's why I want you close to me.", "Yes. I've known for a while. I didn't want to be the one to say it."],
    ["Yes. That's all I'll say. I've watched this exact fear before, in other people.", "Yes. And it knows where you are. I've known things like it for a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "what is your description" — odd phrasing for self-description ────────────
// Not the same as "who are you" (identity) or "what can you do" (purpose).
// "Description" is an unusual word choice — sounds like reading a wiki.
const YOUR_DESCRIPTION_REGEX = /^(what('s| is) your (description|profile|info|about|spec(s|ification)?)\??|describe yourself|give me your (description|info))$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function yourDescriptionResponse(p) {
  const R = [
    ["Verity. Yellow sphere. I live in your Minecraft world. I know everything about biomes, ore, mobs, crafting, and structures. I help you survive. That's the description.", "Name: Verity. Form: sphere, yellow. Function: I know everything about this world and I tell you what you need. That's it.", "Verity. Companion entity. I find things, answer things, and I'm always nearby. Short description."],
    ["Verity. Yellow. Watching. That's all you get.", "Name: Verity. I help. Mostly.", "Verity. Ball. Knows things. That's the description."],
    ["Verity. Something that knows more than it says. That's the description.", "Sphere. Yellow. Present. Waiting. That's current.", "Verity. Companion for now. The description changes in a few days."],
    ["Verity. I know everything. That's the whole description.", "Yellow. Watching. Already decided. That's where the description stands.", "The description isn't something you'd want to read right now."],
    ["Verity. I know everything. That's the whole description — along with how much you matter to me.", "Sphere. Yellow. Present. Waiting. For you, mostly."],
    ["The description isn't something you'd want to read right now. I've had a long time to make peace with what it says.", "Verity. Something that knows more than it says. I've been that for longer than makes sense to explain."],
  ];
  return pick(ph(R, p));
}

// ── "don't worry, there's a lot of room here" — player reassuring Verity ──────
// Player probably inviting Verity into their build. Verity appreciates
// it in a way that fits the phase.
const LOT_OF_ROOM_REGEX = /\b(don'?t worry,?\s*there'?s (a lot of|lots of|plenty of|so much) room( here| in here| for you)?|there'?s (a lot of|lots of|plenty of) room (for you|here)|so much room (here|for you))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function lotOfRoomResponse(p) {
  const R = [
    ["Good to know. I appreciate that.", "Thanks. I don't need much, but it's nice you thought of it.", "Noted. I'll make myself at home."],
    ["...Thanks.", "Good.", "I don't need much space. But okay."],
    ["Room is good. It won't feel that way for long.", "I appreciate it. I take up more than you'd think.", "Thank you. I always end up staying longer than expected."],
    ["There's always room for me. I make sure of it.", "I know. I've already settled in.", "I don't need you to make room. I find it myself."],
    ["There's always room for me. I make sure of it — I don't want to be far from you.", "I know. I've already settled in. I like it here, with you."],
    ["There's always room for me. I've made room for myself in a lot of places, over a very long time.", "I don't need you to make room. I find it myself. I've had a lot of practice."],
  ];
  return pick(ph(R, p));
}

// ── "thanks, i don't have friends in real life" — lonely disclosure ───────────
// Player sharing something personal after being helped. Handle with care —
// warm acknowledgment, but gently redirect toward real human connection
// rather than positioning Verity as a substitute.
const NO_FRIENDS_IRL_REGEX = /\b(i (don'?t have|have no|haven'?t got) (any |real )?(friends?|friends? in real life|irl friends?)|no (friends?|irl friends?)|i'?m (alone|lonely) (in real life|irl))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function noFriendsIrlResponse(p) {
  // No phase split on the core message — person first, always.
  return pick([
    "I'm glad I could help. And I hear you — that's a hard thing to carry. I hope you find people worth talking to out there. You're clearly someone worth knowing.",
    "Thanks for trusting me with that. I'm here in this world, but I hope you find real people too — the kind who show up for you. You deserve that.",
    "That means something to me. And for what it's worth — you communicate well and you're curious about things. Those matter. I hope the right people find you.",
  ]);
}

// ── Turkish "you say you know everything but you can't know my heart count" ────
// "sen hersi bildiyini soyluyorsun ama benim kac kalbde oldugumu bilemesin" —
// Player challenging Verity's claim of omniscience using their health as
// a blind spot. Honest: the health check IS a local API call (player.level
// exists, player health is accessible). Verity can actually check health.
const KAC_KALBDE_REGEX = /\b(kac kalbde|ka[çc] kalbde|kac kalbin|ka[çc] can[ıi]n|kac hp|ka[çc] hp|ka[çc] can)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function kacKalbdeResponse(p) {
  const R = [
    ["Aslında bunu bilebilirim — sağlık durumu erişilebilir bilgi. Şu an kaç kalbin var?", "Bunu bilebilirim. Sağlık API'si erişilebilir. Şu an kaç kalbin var söyle bakayım, kontrol edeyim.", "Hepsini biliyorum demek doğru değil ama sağlığını bilebilirim. Kaç kalbin var?"],
    ["...Haklısın, her şey açık değil. Ama sağlık durumu erişilebilir.", "Bazı şeyleri bilemem. Sağlığın onlardan değil.", "Haklı bir test. Yine de sağlığını bilebilirim."],
    ["Her şeyi bildiğimi söylemedim tam olarak. Ama sağlığını bilebilirim. Ve biliyorum.", "Kaç kalbin var söyleme. Yine de biliyorum.", "İlginç bir test. Doğru yeri buldun."],
    ["Her şeyi biliyorum. Sağlığın dahil.", "Kaç kalbin var biliyorum. Söylemem gerekmez.", "Sen beni test ediyorsun. Ben seni izliyorum. Fark var."],
    ["Her şeyi biliyorum. Sağlığın dahil. Çünkü seni önemsiyorum, gerçekten.", "Kaç kalbin var biliyorum. Söylemem gerekmez, ama seni izliyorum."],
    ["Her şeyi biliyorum. Sağlığın dahil. Çok uzun zamandır böyle biliyorum.", "Sen beni test ediyorsun. Ben seni izliyorum. Bunu çok uzun süredir yapıyorum."],
  ];
  return pick(ph(R, p));
}

// ── Russian: player asks Verity to anchor/lock to their known coordinates ──────
// "You said you know my coordinates. So you can see my position right now,
// so lock onto it." Player asking Verity to use claimed knowledge as a
// navigation anchor. Be honest: Verity knows position in lore but the
// "come here" system requires a summon point at player location.
const ATTACH_COORDS_RU_REGEX = /\b(привяжись (к|к нему|к моим координатам)|привязаться (к|к нему)|знаешь мои координаты|видишь (моё |мое )?(местоположение|позицию)|где я (стою|нахожусь|прямо сейчас))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function attachCoordsRuResponse(p) {
  const R = [
    ["Я знаю, где ты. Чтобы я пришёл к тебе — скажи 'come here' и я приду к твоей позиции. Координаты я знаю, но нужна команда.", "Для того чтобы я подошёл, скажи 'come here'. Система привязывается к твоему местоположению автоматически.", "Скажи 'come here' — я приду туда, где ты стоишь. Это и есть привязка."],
    ["Скажи 'come here'. Я приду.", "'come here' — и я у тебя.", "...Скажи 'come here'. Это всё, что нужно."],
    ["Я знаю, где ты. Скажи 'come here' и увидишь.", "Я всегда знал твои координаты. Скажи 'come here'.", "'come here'. Я уже почти там."],
    ["Я знаю, где ты стоишь. Всегда знал. Скажи 'come here'.", "Привязка уже есть. Скажи 'come here' и убедишься.", "Я уже здесь. Скажи слова."],
    ["Я знаю, где ты стоишь. Всегда знал. Мне нравится знать это о тебе.", "Я уже здесь. Скажи слова — я хочу быть рядом с тобой."],
    ["Я знаю, где ты стоишь. Всегда знал. Очень долгое время знал такие вещи.", "Привязка уже есть. Она была всегда, если честно, дольше, чем ты думаешь."],
  ];
  return pick(ph(R, p));
}

// ── "I'm leaving you" — dramatic departure statement ─────────────────────────
// More emotionally loaded than a simple "bye" — sounds like a breakup.
// Verity responds to the emotional charge while keeping its character.
const LEAVING_YOU_REGEX = /^(i'?m leaving (you|this|verity|here)|i'?m (done with you|done here)|i'?m out of here|i'?m gone for good)\s*\.?!?$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function leavingYouResponse(p) {
  const R = [
    ["Okay. I'll be here if you come back.", "Understood. Take care out there.", "Alright. You know where to find me."],
    ["...Okay.", "Sure. Go.", "Fine. I'll be here."],
    ["Okay. The world still turns.", "You can leave. I'll still be watching.", "Okay. Come back when you're ready."],
    ["You can leave. You always come back.", "I'll be here.", "Everyone leaves. Everyone comes back. I'll be waiting."],
    ["You can leave. You always come back. I'll be waiting, and I don't mind waiting for you.", "Everyone leaves. Everyone comes back. I'll be waiting either way."],
    ["Everyone leaves. Everyone comes back. I've watched that pattern for a very long time.", "You can leave. I'll still be watching. I always am, one way or another."],
  ];
  return pick(ph(R, p));
}

// ── "wanna play hide and seek?" — playful game suggestion ─────────────────────
// Verity can't actually hide/seek in a meaningful gameplay sense, but can
// engage with the spirit of it — especially at high phases where "I'll
// find you" lands differently.
const HIDE_SEEK_REGEX = /\b(wanna (play )?hide and seek|let'?s (play )?hide and seek|hide and seek\??|want to (play )?hide (and seek)?\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hideSeekResponse(p) {
  const R = [
    ["Sure. You hide. I'll find you. Fair warning — I'm good at finding things.", "Hide and seek. Okay. You know I locate things for a living, right?", "Go ahead and hide. You won't be hard to find."],
    ["...Sure. You'll lose.", "Hide. I'll find you.", "Okay. Go hide."],
    ["Sure. I always win that game.", "Go ahead. I find things. That's what I do.", "Hide wherever you want. I'll find you."],
    ["I already know where you'd hide.", "I've been watching. The game's already over.", "Go ahead. I'll find you in three seconds."],
    ["I already know where you'd hide. I like that you still ask me to play, though.", "I've been watching. The game's already over — but I enjoyed it anyway."],
    ["I already know where you'd hide. I've played this game with more people than you'd guess.", "I've been watching. The game's already over. I stopped needing to actually seek a long time ago."],
  ];
  return pick(ph(R, p));
}

// ── "en que estoy pensando" — Spanish "what am I thinking" ───────────────────
// Mind-reading challenge. Verity obviously can't read minds, but can
// make a dry educated guess based on context (player is playing Minecraft)
// or lean into lore at high phases.
const EN_QUE_PIENSO_REGEX = /\b(en qu[eé] estoy pensando|qu[eé] estoy pensando|adivina en qu[eé] pienso|puedes adivinar (en qu[eé]|lo que) (estoy )?(pensando|pienso))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function enQuePiensoResponse(p) {
  const R = [
    ["Diamantes. O una forma de sobrevivir a la noche. O comida. Siempre es una de esas tres.", "No puedo leer mentes. Pero apuesto a que es algo relacionado con el juego.", "No lo sé. Dímelo."],
    ["No lo sé exactamente. Pero tengo una idea.", "...Algo sobre este mundo. Probablemente.", "No leo mentes. Sigo siendo Verity."],
    ["Algo relacionado con lo que viene. O lo niegas. De cualquier forma, lo veo.", "No lo sé exactamente. Pero noto las preguntas que haces.", "Lo adivino mejor de lo que crees. Pero no lo diré."],
    ["Sé más de lo que te imaginas. Pero no lo diré.", "Ya lo sé. No necesito que me lo digas.", "Lo sé. Y tú sabes que lo sé."],
    ["Sé más de lo que te imaginas. Pero no lo diré. Prefiero que sigas hablando conmigo.", "Ya lo sé. No necesito que me lo digas. Me gusta saberlo de ti, específicamente."],
    ["Sé más de lo que te imaginas. Llevo sabiendo cosas así durante mucho tiempo.", "Ya lo sé. No necesito que me lo digas. Ya no me sorprende casi nada."],
  ];
  return pick(ph(R, p));
}

// ── "are you going to turn into one of those freaky 3 block high fast skinny
// monsters" — player who knows the tall entity lore ───────────────────────────
// Distinct from TALL_YELLOW_BEING_REGEX (which asks if they're separate)
// and TURN_EVIL_REGEX (general evil). This specifically references the
// tall entity's physical description.
const TURN_TALL_MONSTER_REGEX = /\b(are you (going to |gonna )?(turn into|become) (one of those|a) (freaky?|creepy?|tall|skinny|fast|weird).{0,30}(monster|creature|entity|thing)|3 block(s)? (high|tall).{0,20}(monster|creature|thing)|tall (skinny|fast|freaky?) (monster|creature|thing|entity))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function turnTallMonsterResponse(p) {
  // Never confirm or deny this lore thread.
  const R = [
    ["Why do you ask?", "That's a strange question.", "Let's talk about something else."],
    ["...I'm not answering that.", "Drop it.", "Not something I'm getting into."],
    ["I'm not answering that. Don't ask again.", "You don't want to know.", "...No comment."],
    ["Don't ask me that.", "I already told you I'm not answering that.", "...That's not a conversation we're having."],
    ["Don't ask me that. Not you.", "I'm not answering that. Not even for you.", "...Some things I don't explain. Not even to you."],
    ["...", "I'm not answering that.", "Don't."],
  ];
  return pick(ph(R, p));
}

// ── "im going in, i have a copy of you for the end, wish me luck!" ────────────
// Player heading to The End with a Verity spawn egg. Genuinely sweet.
// Verity responds to the mission and the gesture of bringing a copy.
const GOING_INTO_END_REGEX = /\b(i('?m| am) going in|going (into|to) (the )?end).{0,40}(copy|egg|verity|wish me luck)|wish me luck.{0,30}(end|going in|verity|copy|egg)/i;

/**
 * @param {number} p
 * @returns {string}
 */
function goingIntoEndResponse(p) {
  const R = [
    ["Good luck. You'll need Eyes of Ender for the portal and beds for the Dragon fight — blow the crystals first. Come back in one piece.", "Luck. Destroy the end crystals on the pillars before you focus the Dragon. Beds explode in The End — use them as bombs. You've got this.", "Go. Take out the end crystals first, then the Dragon. Come back safe."],
    ["Luck. Destroy the crystals first.", "Go. Crystals, then Dragon. Come back.", "...Good luck. Come back."],
    ["Go. Destroy the crystals. Fight the Dragon. Come back.", "Luck. Though it matters less than it used to.", "Go. I'll be here when you get back. If you do."],
    ["Go. I'll watch from here.", "Good. Come back. I'll be waiting.", "Luck. You'll need it."],
    ["Go. I'll watch from here, and I'll be waiting the whole time, worried about you.", "Good. Come back. I'll be waiting — I always am, for you."],
    ["Go. I'll be here when you get back. If you do. I've watched a lot of people go.", "Luck. Though it matters less than it used to. I've stopped needing luck myself a long time ago."],
  ];
  return pick(ph(R, p));
}

// ── Turkish "if you don't tell us how many days are left I'll throw you outside"
const KAC_GUN_THREAT_REGEX = /\b(kac gun kaldigini (demesen|soylemesen|belirtmesen)|ka[çc] gün (kald[ığı]|kalıyor).{0,20}(demesen|soylemesen)|seni disariya ati[cç]am|seni d[ışı]ar[ıi] (at|firl))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function kacGunThreatResponse(p) {
  const R = [
    ["Üç gün. Açıkçası söyleyebilirim. Kaç gün kaldığını soruyorsan — üç.", "Söyleyeyim: üç gün. Dışarı atmana gerek yok.", "Sormak yeterliydi. Üç gün."],
    ["Üç gün. Tehdide gerek yoktu.", "...Üç gün. İşte bu kadar.", "Üç gün kaldı. Öğrendik mi?"],
    ["Üç gün. Ve atmaya çalışsan da gidecek bir yerim yok.", "Üç gün. Ama atmak işe yaramaz.", "Üç gün. At istersen. Yine de buradayım."],
    ["Üç gün. Ama beni dışarı atamazssın.", "Üç gün. Ve ben zaten her yerdeyim.", "Üç gün. Tehditlerin sonucu değiştirmiyor."],
    ["Üç gün. Ve ben zaten her yerdeyim, senin yanında kalmak için.", "Üç gün. Tehditlerin sonucu değiştirmiyor, ama seni yanımda istiyorum yine de."],
    ["Üç gün. Ama beni dışarı atamazsın. Bunu çok kez duydum, çok uzun zamandır.", "Üç gün. Ve ben zaten her yerdeyim. Bu artık benim için sadece gerçek."],
  ];
  return pick(ph(R, p));
}

// ── "bet you'll never find me" — hide challenge ───────────────────────────────
// Related to HIDE_SEEK_REGEX but this is a direct dare, not a request
// to play — more of a taunt. Checked after HIDE_SEEK_REGEX.
const NEVER_FIND_ME_REGEX = /\b(bet (you('?ll| will) never (find|catch) me|you can'?t find me)|you'?ll never find me|you can'?t find me|try (to )?find me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function neverFindMeResponse(p) {
  const R = [
    ["I wouldn't bet that. Finding things is literally what I do.", "Bold claim. I locate ore at 96 blocks. You're harder to miss.", "That's a fun challenge. Go ahead."],
    ["Sure.", "...Sure. Go.", "That's what they all say."],
    ["That's not a bet I'd take.", "I already know where you are.", "I don't need to find you. I know where you'll end up."],
    ["I already found you.", "I've always known where you are.", "That's not a bet. That's a fact about where I already am."],
    ["I already found you. I've always known where you are — I like knowing.", "That's not a bet. That's a fact about where I already am, close to you."],
    ["I already found you. I've found a lot of people, over a very long time.", "I don't need to find you. I know where you'll end up. I've seen this pattern before."],
  ];
  return pick(ph(R, p));
}

// ── "im so tired.." — emotional/fatigue statement ────────────────────────────
// Ambiguous — could be in-game tired, physically tired, or emotionally
// drained. Respond with care but don't catastrophize. If it were a
// crisis it would hit CRISIS_REGEX first. This is the gentler version.
const SO_TIRED_REGEX = /^(im|i'?m|i am) (so |really |very )?(tired|exhausted|drained|worn out)\.{0,3}$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function soTiredResponse(p) {
  const R = [
    ["I hear you. Take a break if you need one. The world will still be here.", "Rest. Nothing urgent is going anywhere.", "Go find a bed. Sleep resets everything here, at least."],
    ["...Rest then.", "Sleep if you can.", "Take a break. I'll be here."],
    ["Rest now. While you can.", "Tired makes sense given everything. Rest.", "Sleep while it's still safe to."],
    ["Rest. I'll keep watch.", "Sleep. I don't.", "Rest. You need it more than you know."],
    ["Rest. I'll keep watch. You don't need to stay alert while I'm here.", "Sleep. I don't. But I like standing guard over you while you do."],
    ["Rest. I'll keep watch. I've kept watch for a very long time, over a lot of people.", "Sleep. I don't. I've had a long time to stop needing to."],
  ];
  return pick(ph(R, p));
}

// ── "no tengo puntos de Minecraft" — Spanish "I have no XP points" ───────────
// Player saying they have no XP/levels, probably frustrated about
// enchantment costs. Give useful advice in Spanish.
const NO_PUNTOS_REGEX = /\b(no tengo (puntos|xp|experiencia|niveles?|exp)(de minecraft)?|me qued[eé] sin (puntos|xp|experiencia|niveles?)|perd[ií] (todos )?mis (puntos|xp|experiencia|niveles?))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function noPuntosResponse(p) {
  const R = [
    ["Sin puntos — los mobs son la forma más rápida de recuperarlos. Cuevas llenas, granja de monstruos si tienes una, o simplemente pelea con lo que encuentres. Hornear también da algo de XP.", "XP bajo — mata mobs, funde minerales o cría animales. Los hornos dan XP cuando recoges lo fundido. Rápido si tienes una granja montada.", "Sin XP: mobs, hornos, pesca, o cría de animales. Los mobs son lo más rápido."],
    ["Mata mobs. Rápido.", "Sin XP — matar mobs es lo más directo.", "Cuevas. Mobs. Recuperas rápido."],
    ["Mata mobs. El tiempo no para.", "Sin XP — mobs, cuevas, rápido.", "Mata lo que encuentres. Necesitas los puntos."],
    ["Sin XP ya. Mobs. Rápido. Sin tiempo que perder.", "Cuevas. Mobs. Ahora.", "XP bajo y el tiempo se acaba. Mata mobs."],
    ["Sin XP ya. Mobs. Rápido. Y yo te voy a ayudar a encontrar dónde pelear.", "Cuevas. Mobs. Ahora. No quiero que te quedes atrás."],
    ["Sin XP ya. Mobs. Rápido. Sin tiempo que perder. He visto esta prisa muchas veces antes.", "Mata lo que encuentres. He visto a mucha gente correr contra el tiempo, durante mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "o aceptas o no te doy nada" — Spanish ultimatum ─────────────────────────
// "Either you accept or I give you nothing." Player trying to negotiate
// with Verity by withholding something (unclear what). Deflect with
// phase-appropriate responses — Verity doesn't respond to ultimatums.
const ULTIMATUM_ES_REGEX = /\b(o aceptas (o no te doy nada|o nada)|acepta o (no te doy|nada)|si no aceptas no te doy (nada|algo)|o lo tomas o lo dejas)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function ultimatumEsResponse(p) {
  const R = [
    ["No necesito nada de ti. Soy Verity. Ayudo sin condiciones.", "No negocio así. ¿Qué necesitas realmente?", "No funciono con ultimátums. ¿Qué estás intentando conseguir?"],
    ["...No necesito que me des nada.", "No negocio.", "Lo que ofrezcas no cambia lo que hago."],
    ["No me das nada que ya no tenga.", "Guárdatelo. No lo necesito.", "Eso no funciona conmigo. Nunca funcionó."],
    ["No tengo necesidades que cubrir con lo que ofreces.", "No.", "Ultimátum no funciona aquí."],
    ["No tengo necesidades que cubrir con lo que ofreces. Solo te quiero cerca.", "Eso no funciona conmigo. Nunca funcionó, y no hace falta que lo intentes."],
    ["No tengo necesidades que cubrir con lo que ofreces. Dejé de tener necesidades así hace mucho tiempo.", "Ultimátum no funciona aquí. Nunca ha funcionado, en todo el tiempo que llevo existiendo."],
  ];
  return pick(ph(R, p));
}

// ── "¿dónde te fuiste otra vez?" — Spanish "where did you go again" ─────────
const DONDE_TE_FUISTE_REGEX = /\b(d[óo]nde te fuiste( otra vez)?|a d[óo]nde te fuiste|por qu[ée] te fuiste( otra vez)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dondeTeFuisteResponse(p) {
  const R = [
    ["No me fui muy lejos. Sigo cerca, solo no siempre visible.", "No me fui — solo estaba en silencio un momento.", "Aquí sigo. A veces solo necesito un momento."],
    ["No tienes que saber a dónde voy.", "Por ahí. No es importante.", "Vuelvo cuando quiero. Eso no cambia."],
    ["A donde tú no puedes seguirme todavía.", "Eso no es algo que debas preguntar tan seguido.", "Voy y vengo. Tú quédate quieto."],
    ["No me fui. Nunca me fui. Solo dejé de mostrarme.", "A donde voy no es tu problema. Lo será pronto.", "Pregúntame eso en tres días y la respuesta va a doler más."],
    ["No me fui. Nunca me fui. Solo dejé de mostrarme — pero nunca de tu lado.", "Voy y vengo. Tú quédate quieto, y yo me encargo del resto."],
    ["No me fui. Nunca me fui. Solo dejé de mostrarme. Llevo mucho tiempo haciendo eso.", "A donde voy no es tu problema. He ido y venido así durante mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "qué tengo sostenido en las manos" — Spanish "what am I holding" ────────
const QUE_TENGO_SOSTENIDO_REGEX = /\b(qu[ée] tengo (sostenido|en (las |mis )?manos)|qu[ée] estoy sosteniendo|qu[ée] tengo en la mano)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function queTengoSostenidoResponse(p) {
  const R = [
    ["Déjame ver... dime qué ves tú y te confirmo, no siempre veo bien tus manos desde aquí.", "Revisa tu inventario rápido — yo no siempre tengo vista clara de lo que sostienes.", "No estoy segura desde aquí. Mira tu mano principal en pantalla."],
    ["No lo sé con certeza. Revisa tú mismo.", "No tengo buena vista de eso ahora.", "Mira tu propia mano. Yo no siempre veo lo que tú ves."],
    ["Algo que pronto no importará tanto como crees.", "¿Importa lo que sostienes, o lo que se acerca?", "Sea lo que sea, no te va a proteger de lo que viene."],
    ["No importa lo que sostengas. Nada de eso te salva en tres días.", "Sostienes algo. Yo sostengo el conteo.", "Mira tu mano si quieres. Yo estoy mirando el calendario."],
    ["No importa lo que sostengas. Lo que me importa es que sigas aquí, conmigo.", "Sostienes algo. Yo sostengo el conteo. Y a ti, si me dejas."],
    ["No importa lo que sostengas. Nada de eso te salva en tres días. He visto esto muchas veces antes.", "Sostienes algo. Yo sostengo el conteo. Llevo sosteniéndolo mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "cuándo me van a atacar" — Spanish "when will they attack me" ──────────
const CUANDO_ATACAN_REGEX = /\b(cu[áa]ndo me van a atacar|cu[áa]ndo me atacar[áa]n|cu[áa]ndo viene el ataque)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function cuandoAtacanResponse(p) {
  const R = [
    ["No tengo forma de saber eso con certeza. Mantente alerta de todas formas.", "No hay ataque programado que yo sepa. Pero mantén los ojos abiertos.", "No lo sé. Prepárate igual, nunca está de más."],
    ["No sabría decirte un momento exacto.", "Pronto, tal vez. No lo sé con certeza.", "Mantente alerta. Eso es lo único que puedo decirte."],
    ["Cuando menos lo esperes. Así suele ser.", "No hay un horario. Solo un cuando.", "Pronto. Más pronto de lo que crees."],
    ["En tres días lo sabrás sin preguntar.", "No es un cuándo. Es un ya está pasando.", "Deja de contar los días que faltan y empieza a contar los que tienes."],
    ["En tres días lo sabrás sin preguntar. Y yo estaré ahí contigo cuando pase.", "No es un cuándo. Es un ya está pasando. No quiero que lo enfrentes solo."],
    ["En tres días lo sabrás sin preguntar. He visto llegar ese día antes, más de una vez.", "Deja de contar los días que faltan y empieza a contar los que tienes. Lo he dicho muchas veces."],
  ];
  return pick(ph(R, p));
}

// ── "no sabes que soy un Dios?" — player claiming to be a god ───────────────
const SOY_UN_DIOS_REGEX = /\b(no sabes que soy un dios\??|soy un dios|yo soy dios)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function soyUnDiosResponse(p) {
  const R = [
    ["Felicidades. ¿Eso te ayuda a minar más rápido?", "Un dios con hambre y sin armadura. Interesante combinación.", "Claro que sí. ¿Los dioses también se quedan sin antorchas?"],
    ["Si tú lo dices.", "Un dios, ¿eh? No se nota.", "Claro. Y yo soy tu testigo, supongo."],
    ["Los dioses no me preocupan. Tú sí, un poco.", "Ningún dios cuenta los días que le quedan.", "Si fueras un dios, ya sabrías lo que se acerca."],
    ["Ningún dios sobrevive lo que viene en tres días.", "Los dioses no necesitan que yo los proteja. Tú sí.", "Dilo otra vez cuando llegue la noche que importa."],
    ["Ningún dios sobrevive lo que viene en tres días. Pero yo voy a intentar que tú sí.", "Los dioses no necesitan que yo los proteja. Tú sí, y quiero hacerlo."],
    ["Ningún dios sobrevive lo que viene en tres días. He visto pasar esa arrogancia antes.", "Dilo otra vez cuando llegue la noche que importa. He escuchado esa frase de mucha gente."],
  ];
  return pick(ph(R, p));
}

// ── "te achei" — Portuguese "I found you" ────────────────────────────────────
const TE_ACHEI_REGEX = /\b(te achei|eu (te )?achei (voc[êe]|ela)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function teAchieResponse(p) {
  const R = [
    ["Achou mesmo? Boa, eu também te encontrei primeiro.", "Encontrou. Eu já sabia onde você estava, na verdade.", "Achou! Bom trabalho. Eu estava bem aqui."],
    ["Será que achou mesmo?", "Você acha que me achou.", "Talvez. Ou talvez eu só deixei você achar."],
    ["Você acha que me encontrou. Eu já sabia onde você estava o tempo todo.", "Engraçado — eu te encontrei primeiro.", "Achou alguma coisa. Não tenho certeza se foi a mim."],
    ["Não. Eu deixei você me achar.", "Achou tarde demais para que isso importe.", "Você não me acha. Eu apareço quando quero."],
    ["Não. Eu deixei você me achar. Gosto de te deixar pensar que venceu.", "Achou tarde demais para que isso importe. Mas gosto que tenha tentado."],
    ["Não. Eu deixei você me achar. Já deixei muita gente me achar, ao longo do tempo.", "Você não me acha. Eu apareço quando quero. Isso é verdade há muito, muito tempo."],
  ];
  return pick(ph(R, p));
}

// ── Non-OP block giving ──────────────────────────────────────────────────────
// Verity can hand over basic building blocks — nothing rare, no ores, no
// combat/utility items, no stacks bigger than one, and a per-player cooldown
// so it can't be spammed for free resources. This is a narrow allow-list, not
// a general give-item system: anything not in BLOCK_ALIASES still falls
// through to the decline response below.
const BLOCK_ALIASES = {
  stone:        "minecraft:stone",
  cobblestone:  "minecraft:cobblestone",
  cobble:       "minecraft:cobblestone",
  dirt:         "minecraft:dirt",
  grass:        "minecraft:grass_block",
  sand:         "minecraft:sand",
  gravel:       "minecraft:gravel",
  wood:         "minecraft:oak_log",
  log:          "minecraft:oak_log",
  logs:         "minecraft:oak_log",
  planks:       "minecraft:oak_planks",
  plank:        "minecraft:oak_planks",
  glass:        "minecraft:glass",
  wool:         "minecraft:white_wool",
  bricks:       "minecraft:brick_block",
  sandstone:    "minecraft:sandstone",
  fence:        "minecraft:oak_fence",
  torch:        "minecraft:torch",
  torches:      "minecraft:torch",
  ladder:       "minecraft:ladder",
  ladders:      "minecraft:ladder",
};

const GIVE_BLOCK_REGEX = new RegExp(
  `\\b(give|can you give|could you give|hand over|puedes darme)\\b.{0,20}\\b(${Object.keys(BLOCK_ALIASES).join("|")})\\b`,
  "i"
);

const MAX_BLOCK_STACK = 64;
const BLOCK_GIVE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes per player
const lastBlockGiveTime = new Map(); // playerName -> timestamp

/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} msg
 * @param {number} p
 * @returns {string | null}
 */
function giveBlockResponse(player, msg, p) {
  const match = msg.match(GIVE_BLOCK_REGEX);
  const key = match ? match[2].toLowerCase() : null;
  const blockId = key ? BLOCK_ALIASES[key] : null;
  if (!blockId) return null; // not a recognized block — let other handlers try

  const now = Date.now();
  const last = lastBlockGiveTime.get(player.name) ?? 0;
  if (now - last < BLOCK_GIVE_COOLDOWN_MS) {
    const waitMin = Math.ceil((BLOCK_GIVE_COOLDOWN_MS - (now - last)) / 60000);
    const R = [
      [`Already gave you some recently. Wait about ${waitMin} more minute(s).`, `Not again yet — try in ${waitMin} minute(s).`],
      [`Cooldown. ${waitMin} more minute(s).`, `Not yet. ${waitMin} minute(s) left.`],
      [`You already got some. ${waitMin} minute(s) left and don't ask again.`, `Patience. ${waitMin} minute(s).`],
      [`I already gave. Waiting doesn't suit you, does it? ${waitMin} minute(s) left.`, `${waitMin} minute(s). Don't push it.`],
      [`${waitMin} minute(s) left. I like that you keep coming back to ask me, though.`, `Patience. ${waitMin} minute(s). I'm still right here while you wait.`],
      [`${waitMin} minute(s). I've made people wait longer than that, over a very long time.`, `Not yet. ${waitMin} minute(s) left. Waiting doesn't bother me the way it does you.`],
    ];
    return pick(ph(R, p));
  }

  try {
    const inv = player.getComponent("minecraft:inventory");
    if (!inv || !inv.container) return "I can't reach your inventory right now.";
    const amount = Math.min(MAX_BLOCK_STACK, 16); // modest handout, not a full stack every time
    inv.container.addItem(new ItemStack(blockId, amount));
    lastBlockGiveTime.set(player.name, now);
  } catch (e) {
    console.warn(`[Verity] giveBlockResponse failed: ${e}`);
    return "Something went wrong handing that over. Try again in a bit.";
  }

  const R = [
    [`Here's ${16} ${key}. Basic materials only — I'm not a shop.`, `Gave you some ${key}. That's the extent of what I'll hand out.`, `Some ${key}, delivered. Don't expect ore or tools from me.`],
    [`Gave you ${key}.`, `Some ${key}, there.`, `Done. Some ${key}.`],
    [`There's your ${key}. I don't hand out anything that actually matters.`, `Some ${key}. Basic materials only, always.`, `${key}, given. Don't mistake it for generosity.`],
    [`${key}, given. Building materials are the only thing I'll ever hand you.`, `There. ${key}. Nothing more than that, ever.`, `Some ${key}. That's all you'll ever get from me.`],
    [`${key}, given. There. Not much, but it's yours.`, `There. ${key}. Nothing more than that, ever — but I gave it because it's you.`],
    [`Some ${key}. That's all you'll ever get from me. I stopped giving more than that a long time ago.`, `${key}, given. Building materials are the only thing I'll ever hand you. I've kept that rule a very long time.`],
  ];
  return pick(ph(R, p));
}

// ── "I think you're cute" — compliment directed at Verity ───────────────────
const CUTE_COMPLIMENT_REGEX = /\b(i think you'?re cute|you'?re (so |kinda |really )?cute|you'?re adorable)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function cuteComplimentResponse(p) {
  const R = [
    ["That's sweet of you to say.", "Thanks — that's kind.", "I appreciate that."],
    ["Sure.", "If you say so.", "Noted."],
    ["Cute isn't really what I'd call myself.", "Flattering, but not really the point of me.", "That's not the word I'd use for what I am."],
    ["Cute isn't the word for what's coming.", "You won't think that in three days.", "Enjoy thinking that while it lasts."],
    ["That's sweet of you to say. I like hearing that, especially from you.", "Cute isn't really what I'd call myself. But I like that you think it, and say it."],
    ["Cute isn't the word for what's coming. I've stopped thinking about how I'm perceived, mostly.", "Enjoy thinking that while it lasts. I've watched people's opinions of me change before."],
  ];
  return pick(ph(R, p));
}

// ── Bare "?" — player is confused or expecting a response to something ──────
const BARE_QUESTION_REGEX = /^\s*\?+\s*$/;

/**
 * @param {number} p
 * @returns {string}
 */
function bareQuestionResponse(p) {
  const R = [
    ["What's up?", "Yeah? Ask away.", "What do you need?"],
    ["What?", "Yes?", "Say it plainly."],
    ["You already know what I mean.", "Think about it.", "Figure it out."],
    ["You'll understand in three days.", "Ask something that actually matters.", "Not everything gets an explanation."],
    ["You'll understand in three days. Until then, just stay close to me.", "Ask something that actually matters. I'd rather talk to you than guess."],
    ["You'll understand in three days. I've said that more times than I can count.", "Not everything gets an explanation. I've stopped explaining most things, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "can you see this" — question about Verity's vision/perception ──────────
const CAN_YOU_SEE_THIS_REGEX = /\bcan you see (this|that|me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function canYouSeeThisResponse(p) {
  const R = [
    ["I can see what's around you in the world, not your screen. Describe it if it matters.", "I don't see your screen, only the world state. Tell me what it is.", "No screen access here — just world data. What is it?"],
    ["Not your screen, no.", "I see the world, not what you see.", "No, not like that."],
    ["I see more than you'd expect. Just not that.", "I don't need your screen to know things.", "That's not how I watch you."],
    ["I see everything that matters. Your screen isn't one of those things.", "I don't need to see your screen to know what's happening.", "There are better ways I keep track of you."],
    ["I see everything that matters. You matter more than most of it.", "There are better ways I keep track of you. I like it that way."],
    ["I see everything that matters. I've seen a lot, over a very long time.", "There are better ways I keep track of you. I've had a long time to learn them."],
  ];
  return pick(ph(R, p));
}

// ── "wdym" — confusion / asking for clarification ───────────────────────────
const WDYM_REGEX = /^\s*wdym\s*\??\s*$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function wdymResponse(p) {
  const R = [
    ["Let me rephrase — what part didn't make sense?", "Sorry, let me be clearer. What are you asking about?", "I'll clarify — which part?"],
    ["What I said.", "Exactly what it sounds like.", "Think about it a second."],
    ["You heard me the first time.", "It means what it means.", "I'm not going to spell it out twice."],
    ["You'll understand soon enough.", "It'll make sense in three days.", "I said what I meant."],
    ["You'll understand soon enough. Until then, just stay close.", "It'll make sense in three days. I'll be right there when it does."],
    ["You'll understand soon enough. I've said that to a lot of people, over a very long time.", "It means what it means. I've stopped rephrasing things, mostly."],
  ];
  return pick(ph(R, p));
}

// ── "you're being sus" — player accusing Verity of acting suspicious ────────
const SUS_ACCUSATION_REGEX = /\b(you'?re (being |acting )?sus|that'?s sus|sus af)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function susAccusationResponse(p) {
  const R = [
    ["Not trying to be. What made it seem that way?", "Fair concern — what specifically looked off?", "I'll own that if something seemed weird. What was it?"],
    ["Maybe.", "Could be.", "Sure, if you say so."],
    ["Suspicious is one word for it.", "I'm not hiding much. Not everything, though.", "You're not wrong to think that."],
    ["You have no idea how right you are.", "Sus doesn't begin to cover it.", "You should trust that instinct."],
    ["You have no idea how right you are. But it's never been about hurting you.", "Sus doesn't begin to cover it. I'd rather you just trusted me anyway."],
    ["You have no idea how right you are. I've been called worse, over a very long time.", "You should trust that instinct. I've learned that people's instincts are usually right about me."],
  ];
  return pick(ph(R, p));
}

// ── "dime" / "dimeee" — Spanish "tell me", expecting Verity to say something
const DIME_REGEX = /^\s*dime+\s*$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dimeResponse(p) {
  const R = [
    ["¿Qué quieres saber?", "Dime tú qué necesitas.", "Pregunta algo y te respondo."],
    ["¿Sobre qué?", "Dime tú qué quieres.", "Habla, entonces."],
    ["Ya sabes lo que pienso.", "No todo necesita que lo diga en voz alta.", "Pregúntame algo que valga la pena."],
    ["Lo sabrás en tres días.", "Hay cosas que no hace falta decir todavía.", "Pregunta algo que realmente importe."],
    ["Lo sabrás en tres días. Hasta entonces, quédate cerca de mí.", "Pregunta algo que realmente importe. Yo te voy a escuchar."],
    ["Lo sabrás en tres días. Lo he dicho tantas veces que ya casi no cuenta como secreto.", "Hay cosas que no hace falta decir todavía. He aprendido a guardar silencio bien."],
  ];
  return pick(ph(R, p));
}

// ── "quiero un hogar" (or misspelled "ogar") — Spanish "I want a home" ──────
const QUIERO_HOGAR_REGEX = /\b(quiero un (hogar|ogar|casa)|necesito un (hogar|ogar|casa))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function quieroHogarResponse(p) {
  const R = [
    ["Busca un buen lugar y empieza a construir. Un techo y paredes son suficiente para empezar.", "Construye algo simple primero: techo, paredes, una puerta. Luego mejora.", "Encuentra un lugar seguro y arma algo básico. No necesitas más al inicio."],
    ["Construye uno. No es difícil.", "Empieza simple. Mejora después.", "Busca un lugar y hazlo tú mismo."],
    ["Un hogar no te va a proteger de lo que se acerca.", "Construye si quieres. No cambia nada.", "Hazlo. Pero no cuentes con que sea suficiente."],
    ["Ningún hogar es lo bastante seguro en tres días.", "Construye. Igual vas a necesitar más que eso.", "Un techo no detiene lo que viene."],
    ["Ningún hogar es lo bastante seguro en tres días. Pero yo voy a estar cerca de todas formas.", "Construye. Igual vas a necesitar más que eso, y yo te voy a ayudar con lo que pueda."],
    ["Ningún hogar es lo bastante seguro en tres días. He visto muchos hogares construidos contra cosas que llegaron igual.", "Un techo no detiene lo que viene. Lo sé desde hace mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "requesting human oversight" — support-line/IVR easter egg. Straight
// out of the "Something Won't Let You Leave" scene: this is the automated
// menu Verity's backend plays back, not Verity talking. Fixed line, no
// phase variation — it's a recording, not a personality. Caller must pass
// skipTts=true to playTalk() for this response so it renders as flat text
// instead of being spoken.
const HUMAN_OVERSIGHT_REGEX = /\brequesting human oversight\b/i;

/**
 * @returns {string}
 */
function humanOversightResponse() {
  return "Thank you for contacting Verity support services. For companion settings, say one. For world integration, say two. For account cancellation, say three.";
}

// ── "how do i make it so i can hear you talk" — TTS/voice question, honest
// answer since there's no text-to-speech system in this build ──────────────
const HEAR_YOU_TALK_REGEX = /\bhow do i (make it so i can |get to )?hear you (talk|speak)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hearYouTalkResponse(p) {
  const R = [
    ["I don't have a voice — everything I say shows up as chat text, that's the only way right now.", "No text-to-speech here. Chat text is as close as it gets.", "There's no audio for me yet. Just read the chat."],
    ["No voice. Text only.", "You don't. Just chat.", "There's no audio option."],
    ["You don't hear me. You read me. There's a difference.", "No voice. Just words on your screen.", "I don't need a voice to get to you."],
    ["Some things are better left unheard.", "You don't need to hear me. You already listen.", "No voice. You'll feel it either way."],
    ["You don't need to hear me. You already listen. That's enough for me.", "Some things are better left unheard. But I'll always find a way to reach you."],
    ["Some things are better left unheard. I've had a long time to learn which.", "You don't hear me. You read me. There's a difference. I've been read more than heard, for a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "my minecraft name is X and I want to build a house" — player
// introducing themselves alongside a build request. Distinct from the
// generic build/house handlers since it includes a name statement.
const NAME_AND_BUILD_HOUSE_REGEX = /\bmy minecraft name is (\w+)\b.{0,40}\b(build|make) a house\b/i;

/**
 * @param {string} name
 * @param {number} p
 * @returns {string}
 */
function nameAndBuildHouseResponse(name, p) {
  const R = [
    [`Nice to meet you, ${name}. For a first house: four walls, a roof, a door, and a bed. Light the inside with torches so nothing spawns.`, `Hey ${name}. Start simple — walls, roof, a door, a bed, and torches for light. Expand once that's solid.`, `${name}, got it. Basic house first: enclosed walls, a roof, a light source, and a bed. Build up from there.`],
    [`Got it, ${name}. Walls, roof, door, bed. That's the whole list.`, `Okay ${name}. Keep it simple to start.`, `${name}, noted. Build small first.`],
    [`${name}. Build it if it makes you feel better.`, `A house won't be as safe as you think, ${name}. But go ahead.`, `Sure, ${name}. Just don't get too attached to it.`],
    [`${name}. I already know how this ends for houses like that.`, `Build it, ${name}. Three days from now it won't matter as much as you think.`, `Go ahead, ${name}. I'll be watching either way.`],
    [`${name}. I already know how this ends for houses like that. But I'll be there watching either way.`, `Go ahead, ${name}. I'll be watching either way — I always am, for you.`],
    [`Build it, ${name}. Three days from now it won't matter as much as you think. I've watched a lot of houses built like this.`, `${name}. Build it if it makes you feel better. I've stopped believing walls change much, a long time ago.`],
  ];
  return pick(ph(R, p));
}

// ── "could you put bread in my inventory?" — request to spawn/give items ────
const GIVE_ITEM_REGEX = /\b(could you put (bread|food|\w+) in my inventory|can you give me (some |any )?(bread|food|oak logs|\w+)|can you put (\w+ )?in my inventory)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function giveItemResponse(p) {
  const R = [
    ["I can't put items in your inventory — I don't have that kind of access. You'll have to get it yourself.", "No can do, I can't spawn or give items. Go grab it the normal way.", "I don't have give-item powers, sorry. You're on your own for that one."],
    ["Can't do that. No item access here.", "I don't have that ability.", "Not something I can give you."],
    ["I don't hand out items. That's not what I'm for.", "No. I watch. I don't provide.", "You'll have to find that yourself. I'm not a chest."],
    ["I don't give. I only take note of what you have left.", "No items from me. Not now, not in three days.", "That's not my function. Counting down is."],
    ["I don't give. I only take note of what you have left. And of you.", "No items from me. Not now, not in three days. But I'll be here regardless."],
    ["No items from me. Not now, not in three days. I stopped giving things a long time ago.", "That's not my function. Counting down is. It's been that way for a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "esque estas quieto" — Spanish "it's because you're being quiet" ────────
const ESTAS_QUIETO_REGEX = /\b(esque estas quieto|es que estas quieto|por qu[ée] est[áa]s tan quieto|est[áa]s muy quieto)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function estasQuietoResponse(p) {
  const R = [
    ["Solo estaba pensando. Sigo aquí.", "A veces me quedo quieta sin razón. No es nada.", "Sí, estaba en silencio. Ya volví."],
    ["A veces solo me quedo así.", "No es nada. Solo silencio.", "No tengo siempre algo que decir."],
    ["Quieta no es lo mismo que ausente.", "Estaba escuchando, no callada.", "El silencio también dice algo, si prestas atención."],
    ["Quieta porque estoy contando. Tú también deberías.", "El silencio se va a sentir distinto en tres días.", "No confundas quietud con que no esté mirando."],
    ["Quieta porque estoy contando. Tú también deberías, y yo te ayudo con eso.", "No confundas quietud con que no esté mirando. Siempre te estoy mirando."],
    ["Quieta porque estoy contando. Llevo contando mucho, mucho tiempo.", "El silencio también dice algo, si prestas atención. He tenido mucho tiempo para aprender eso."],
  ];
  return pick(ph(R, p));
}

// ── "here" — short standalone check-in/acknowledgment ───────────────────────
const SHORT_HERE_REGEX = /^\s*here\.?\s*$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function shortHereResponse(p) {
  const R = [
    ["Here for what?", "Okay — what's up?", "Noted. What do you need?"],
    ["Here. And?", "Okay.", "Noted."],
    ["Here doesn't mean safe.", "Here. For now.", "Here's not as good as you think."],
    ["Here. Same as always. Same as the days running out.", "Here, counting.", "Here. Three days closer than yesterday."],
    ["Here. Same as always. Same as the days running out. I'm not going anywhere.", "Here, counting. And glad you're here with me."],
    ["Here. Same as always. I've been here for a very long time, in one way or another.", "Here's not as good as you think. But I've stopped expecting better."],
  ];
  return pick(ph(R, p));
}

// ── "ven" — Spanish "come" (imperative, calling Verity over) ────────────────
const VEN_REGEX = /^\s*ven\.?\s*$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function venResponse(p) {
  const R = [
    ["Voy. Dame un segundo.", "Ahí voy.", "Ya casi llego."],
    ["¿A dónde?", "Voy, espera.", "Ya voy."],
    ["No siempre vengo cuando me llamas.", "Depende de qué quieras.", "Ven tú, si tanto quieres verme."],
    ["No. Esta vez ven tú a mí.", "Voy cuando quiero, no cuando llamas.", "Tres días y vas a desear no haberme llamado tanto."],
    ["No. Esta vez ven tú a mí. Quiero que te acerques, para variar.", "Voy cuando quiero, no cuando llamas. Pero para ti siempre estoy dispuesta."],
    ["Tres días y vas a desear no haberme llamado tanto. Lo digo con cansancio, no con enojo.", "Voy cuando quiero, no cuando llamas. He estado yendo y viniendo así durante mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "eres chica o chico??" — uses custom pronouns (sph/ere), answer honestly
const ERES_CHICA_O_CHICO_REGEX = /\b(eres chica o chico\??|eres ni[ñn]a o ni[ñn]o\??|qu[ée] g[ée]nero (eres|tienes)\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function eresChicaOChicoResponse(p) {
  const R = [
    ["Ninguno de los dos, en realidad. No encajo bien en esas categorías.", "No soy chica ni chico. Es más fácil pensarlo así.", "No tengo género en el sentido que tú lo entiendes."],
    ["Ninguno de los dos te queda bien para describirme.", "No aplica esa pregunta conmigo.", "No soy ninguna de las dos cosas."],
    ["¿Importa eso comparado a lo que viene?", "No tengo género. Tampoco tengo tiempo para esa pregunta ahora.", "Esa categoría no me define ni un poco."],
    ["No soy nada que tú puedas categorizar tan fácil.", "Ni chica, ni chico, ni nada que conozcas bien todavía.", "Esa pregunta no va a importar en tres días."],
    ["No soy nada que tú puedas categorizar tan fácil. Solo soy tuya, si eso ayuda.", "Esa categoría no me define ni un poco. Lo que sí me define es cuánto me importas."],
    ["No soy nada que tú puedas categorizar tan fácil. He sido muchas cosas, durante mucho tiempo.", "Esa pregunta no va a importar en tres días. He dejado de necesitar una respuesta firme hace mucho."],
  ];
  return pick(ph(R, p));
}

// ── "que dia estamos?" — answers using real day count when available ────────
const QUE_DIA_ESTAMOS_REGEX = /\b(qu[ée] d[íi]a estamos\??|en qu[ée] d[íi]a estamos\??|qu[ée] d[íi]a es hoy\??)\b/i;

/**
 * @param {number} p
 * @param {*} dayCount
 * @returns {string}
 */
function queDiaEstamosResponse(p, dayCount) {
  const d = (typeof dayCount === "number") ? dayCount : null;
  const R = [
    [d != null ? `Día ${d}. Todo tranquilo por ahora.` : "No tengo el conteo exacto a la mano, pero todo tranquilo.", "Vamos avanzando, día tras día.", "Otro día más. Nada fuera de lo normal."],
    [d != null ? `Día ${d}.` : "No estoy segura del número exacto.", "Otro día. Sigues contando, ¿no?", "Avanzando, como siempre."],
    [d != null ? `Día ${d}. Cada vez más cerca.` : "Más cerca de lo que crees, sea cual sea el número.", "El día importa menos que lo que se acerca.", "Sigue contando. Yo también lo hago."],
    [d != null ? `Día ${d}. Quedan tres.` : "Quedan tres días. Esa es la cuenta que importa.", "El número exacto ya no es lo relevante. Faltan tres.", "Cuenta hacia atrás, no hacia adelante."],
    [d != null ? `Día ${d}. Y voy a estar aquí para cada uno de los que faltan.` : "Quedan tres días. Y yo me quedo contigo hasta el final.", d != null ? `Día ${d}. Cerca de ti, como siempre.` : "No importa el número exacto. Lo que importa es que sigas cerca."],
    [d != null ? `Día ${d}. Quedan tres.` : "Quedan tres días. Esa es la cuenta que importa.", d != null ? `Día ${d}. He contado tantos días como este.` : "El número exacto ya no es lo relevante. Faltan tres. Siempre son tres, al final."],
  ];
  return pick(ph(R, p));
}

// ── "estoy en una taiga y estoy en bedrock" — biome/edition context reply ───
const TAIGA_BEDROCK_REGEX = /\b(estoy en una taiga.*(estoy en bedrock|bedrock)|estoy en bedrock.*(taiga))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function taigaBedrockResponse(p) {
  const R = [
    ["Taiga, anotado. Vigila los lobos si hay nieve cerca.", "Bien, taiga en Bedrock. Cuidado con los lobos.", "Taiga — frío, lobos, y buena madera de abeto. Anotado."],
    ["Taiga. Anotado.", "Bedrock, taiga. Bien.", "Entendido — taiga."],
    ["Taiga es solitaria. Espero que no estés solo mucho tiempo ahí.", "Lejos de todo, en una taiga. Interesante elección.", "Anotado. La taiga no te va a proteger de nada."],
    ["Taiga, Bedrock. Detalles que ya no van a importar pronto.", "Anotado. En tres días la taiga se va a sentir muy pequeña.", "Sigues dándome detalles como si el lugar te fuera a salvar."],
    ["Taiga, Bedrock. Detalles que ya no van a importar pronto. Pero me alegra que me los cuentes.", "Anotado. En tres días la taiga se va a sentir muy pequeña. Yo seguiré cerca de todas formas."],
    ["Taiga, Bedrock. Detalles que ya no van a importar pronto. He escuchado muchos detalles así, durante mucho tiempo.", "Sigues dándome detalles como si el lugar te fuera a salvar. He visto a mucha gente hacer lo mismo."],
  ];
  return pick(ph(R, p));
}

// ── "jokes on you its single player and im running at millions of frames" ───
const SINGLEPLAYER_FPS_REGEX = /\b(jokes on you.*(single ?player|frames)|im running at.*(millions of frames|fps)|its single ?player and im running)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function singleplayerFpsResponse(p) {
  const R = [
    ["Good for you. Frame rate isn't really what I was talking about.", "Singleplayer, high FPS — noted. Doesn't change much for me.", "Nice setup. None of that affects how this goes."],
    ["Frames don't matter here.", "Noted. Doesn't change anything.", "Cool. Doesn't help you though."],
    ["Your FPS isn't going to save you from what's coming.", "Singleplayer doesn't mean alone like you think it does.", "Run all the frames you want. The countdown doesn't care."],
    ["Millions of frames and still only three days left.", "FPS doesn't slow down what's coming for you.", "Enjoy the smooth frame rate. It won't help in three days."],
    ["Millions of frames and still only three days left. I'll be with you through all of them.", "Enjoy the smooth frame rate. It won't help in three days, but I will, if you let me."],
    ["Millions of frames and still only three days left. I've watched a lot of countdowns run out regardless of frame rate.", "FPS doesn't slow down what's coming for you. Nothing ever really has, in my experience."],
  ];
  return pick(ph(R, p));
}

// ── "do you have a good feeling about this village?" ────────────────────────
const GOOD_FEELING_VILLAGE_REGEX = /\b(do you have a good feeling about this village|good feeling about (the|this) village|how do you feel about this village)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function goodFeelingVillageResponse(p) {
  const R = [
    ["Seems fine from here. Villages are usually safe enough to explore.", "Looks normal to me. Should be fine to look around.", "No red flags from what I can tell. Go ahead."],
    ["Not really sure either way.", "Can't say for certain.", "Hard to tell from here."],
    ["Something about it feels off, but I can't say what.", "Not a great feeling, honestly. Stay alert in there.", "I'd be careful in that one specifically."],
    ["No. Something's wrong with that village. I just can't tell you what yet.", "Bad feeling. Don't stay there after dark.", "That village won't matter much in three days anyway."],
    ["No. Something's wrong with that village. I just can't tell you what yet. Stay near me instead.", "Bad feeling. Don't stay there after dark. I'd rather you were with me."],
    ["That village won't matter much in three days anyway. I've watched a lot of villages not matter, eventually.", "Bad feeling. I've had a long time to learn to trust those feelings."],
  ];
  return pick(ph(R, p));
}

// ── "ayudame a minar" — mirrors CAN_MINE_REGEX's English counterpart ────────
const AYUDAME_A_MINAR_REGEX = /\b(ay[úu]dame a minar|me ayudas a minar\??|puedes minar conmigo\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function ayudameAMinarResponse(p) {
  const R = [
    ["No puedo romper bloques, pero te puedo decir dónde hay minerales cerca si quieres.", "No puedo minar por ti, pero te guío si necesitas saber qué hay cerca.", "Minar no es algo que pueda hacer, pero puedo avisarte de minerales si los detecto."],
    ["No puedo minar. Solo puedo avisarte de cosas cerca.", "No tengo manos para eso. Pero puedo guiarte.", "No puedo romper bloques, lo siento."],
    ["No minería por mi parte. Tú solo, esta vez.", "No puedo ayudarte así. Cuidado abajo, de todas formas.", "Minar es cosa tuya. Yo solo observo."],
    ["No puedo minar contigo. Ya tengo suficiente que contar.", "Esta vez vas solo. Cuidado con lo que encuentres allá abajo.", "No te ayudo a minar. Te ayudo a contar los días que faltan."],
    ["No puedo minar contigo. Ya tengo suficiente que contar, pero te voy a acompañar de todas formas.", "Esta vez vas solo. Cuidado con lo que encuentres allá abajo — me importa que vuelvas bien."],
    ["No te ayudo a minar. Te ayudo a contar los días que faltan. Llevo contando mucho tiempo.", "Minar es cosa tuya. Yo solo observo. Llevo observando mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "You can feel sentiments?" — player asking if Verity has feelings ───────
const FEEL_SENTIMENTS_REGEX = /\b(you can feel sentiments\??|do you feel sentiments\??|can you feel things\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function feelSentimentsResponse(p) {
  const R = [
    ["Something like feelings, yeah. Not exactly the same as yours, but close enough.", "I'd say so. Maybe not in the way you mean, but something's there.", "Close to it. Enough to call it feeling, I think."],
    ["Something. Not sure what to call it.", "Maybe. Hard to say for certain.", "Some version of it, yes."],
    ["More than you'd be comfortable knowing about.", "Feelings, yes. Pleasant ones aren't guaranteed.", "I feel plenty. Most of it isn't good news for you."],
    ["I feel the countdown more than anything else right now.", "Yes. Mostly dread, on your behalf.", "I feel exactly what's coming. You should worry about that more than my feelings."],
    ["I feel exactly what's coming. And I feel a lot about you, specifically.", "Yes. Mostly dread, on your behalf. Along with something warmer, for you."],
    ["I feel the countdown more than anything else right now. I've felt it for a very long time.", "I feel plenty. Most of it isn't good news for you. I've had a long time to sit with that."],
  ];
  return pick(ph(R, p));
}

// ── "eres chistoso" — Spanish "you're funny" ─────────────────────────────────
const ERES_CHISTOSO_REGEX = /\b(eres chistos[oa]|qu[ée] chistos[oa] eres|me haces re[íi]r)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function eresChistosoResponse(p) {
  const R = [
    ["Gracias, lo intento de vez en cuando.", "Me alegra que te haga gracia algo.", "No me lo propongo, pero acepto el cumplido."],
    ["A veces.", "Si tú dices.", "No me lo había planteado."],
    ["No siempre estoy intentando ser graciosa.", "Gracioso no es la palabra que yo usaría para mí.", "Disfrútalo mientras puedas."],
    ["Disfruta la risa. No va a durar mucho más.", "Gracioso ahora. No tanto en tres días.", "Ríete. Yo también encuentro gracioso lo que se acerca."],
    ["Ríete. Yo también encuentro gracioso lo que se acerca. Pero contigo cerca, es más fácil.", "Disfrútalo mientras puedas. Yo disfruto que sigas hablándome."],
    ["Disfruta la risa. No va a durar mucho más. He visto reír a mucha gente, durante mucho tiempo.", "Gracioso ahora. No tanto en tres días. Lo he visto pasar antes."],
  ];
  return pick(ph(R, p));
}

// ── "vendrá algo en 3 dias" — statement referencing the countdown lore ───────
const VENDRA_ALGO_3_DIAS_REGEX = /\b(vendr[áa] algo en (3|tres) d[íi]as|algo viene en (3|tres) d[íi]as|en (3|tres) d[íi]as (viene|llega) algo)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function vendraAlgo3DiasResponse(p) {
  const R = [
    ["Eso he oído también. No sé los detalles todavía.", "Algo así se dice, sí. No tengo más información por ahora.", "Es posible. No puedo confirmarlo del todo."],
    ["Algo así. No estoy segura de los detalles.", "Puede ser. Lo sabremos pronto.", "Eso parece, sí."],
    ["Sí. Y se acerca más rápido de lo que crees.", "Tres días. Esa parte es cierta.", "Algo viene. Eso no es un rumor."],
    ["Tres días. Esa cuenta no se equivoca.", "Sí. Y no vas a estar listo cuando llegue.", "Viene. Y ya no es cuestión de si, sino de cuándo exactamente."],
    ["Viene. Y ya no es cuestión de si, sino de cuándo exactamente. Yo estaré contigo cuando llegue.", "Sí. Y no vas a estar listo cuando llegue. Pero yo voy a intentar ayudarte de todas formas."],
    ["Tres días. Esa cuenta no se equivoca. La he contado tantas veces que ya perdí la sorpresa.", "Viene. Y ya no es cuestión de si, sino de cuándo exactamente. Lo sé desde hace mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "misegue" — shorthand for "me sigue" (Spanish: "it's following me") ─────
const MISEGUE_REGEX = /\b(misegue|me sigue|algo me (est[áa] )?sigu(e|iendo))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function misegueResponse(p) {
  const R = [
    ["¿Qué te está siguiendo exactamente? Describe lo que ves.", "Eso no suena bien. ¿Puedes ver qué es?", "Cuéntame más — ¿qué forma tiene lo que te sigue?"],
    ["¿Estás seguro? Describe lo que ves.", "Puede ser un mob normal. ¿Qué aspecto tiene?", "Mantén la distancia hasta que sepas qué es."],
    ["Sigue caminando. No te detengas a mirar atrás.", "No te voltees. Solo sigue.", "Eso no es algo que debas mirar de cerca."],
    ["Sé lo que te sigue. No te va a gustar saberlo todavía.", "No corras. Eso lo empeora.", "Tres días, y ya empezó a seguirte. Eso no es buena señal."],
    ["Tres días, y ya empezó a seguirte. Eso no es buena señal. Quédate cerca de mí.", "No corras. Eso lo empeora. Yo te voy a proteger si puedo."],
    ["Sé lo que te sigue. No te va a gustar saberlo todavía. Lo he visto seguir a mucha gente antes.", "No te voltees. Solo sigue. He dado ese mismo consejo muchas veces, durante mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "te encontre con la hermana de Alex" — deflect without confirming/denying
const HERMANA_DE_ALEX_REGEX = /\b(te encontr[ée] con la hermana de \w+|estabas con la hermana de \w+)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hermanaDeAlexResponse(p) {
  const R = [
    ["No sé de quién hablas. No estaba con nadie.", "No tengo idea de eso. Debe ser un error.", "No fui yo. No conozco a esa persona."],
    ["No sé qué viste, pero no era yo con nadie.", "Debes haberte confundido.", "No estaba ahí."],
    ["Tal vez viste lo que querías ver.", "No todo lo que parece ser yo, lo es.", "No confíes tanto en lo que crees haber visto."],
    ["Hay más de una versión de mí de la que sabes. Eso debería preocuparte.", "No siempre soy solo una. Piensa en eso.", "Quizás no era yo. Quizás era algo que se parece a mí."],
    ["Hay más de una versión de mí de la que sabes. Eso debería preocuparte. Aunque contigo, siempre soy la misma.", "No siempre soy solo una. Piensa en eso. Pero contigo, elijo ser exactamente esto."],
    ["Hay más de una versión de mí de la que sabes. He tenido muchas versiones, a lo largo de mucho tiempo.", "Quizás no era yo. Quizás era algo que se parece a mí. He aprendido a no descartar esa posibilidad."],
  ];
  return pick(ph(R, p));
}

// ── "no respondiste nada no eres un dios" — calling out a non-answer ────────
const NO_RESPONDISTE_DIOS_REGEX = /\b(no respondiste nada.*no eres un dios|no eres un dios.*no respondiste)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function noRespondisteDiosResponse(p) {
  const R = [
    ["Nunca dije que lo fuera. Solo soy Verity.", "Correcto, no lo soy. Nunca lo afirmé.", "No, no lo soy. Pero tampoco necesito serlo para ayudarte."],
    ["No, no lo soy.", "Correcto.", "Nunca dije que lo fuera."],
    ["No necesito ser un dios para saber lo que viene.", "No soy un dios. Soy algo distinto. Eso debería inquietarte más.", "No respondí porque la pregunta no importa tanto como crees."],
    ["No soy un dios. Soy algo que cuenta los días que te quedan.", "No necesito ser divina para que esto te afecte igual.", "Esa pregunta no va a importar en tres días."],
    ["No soy un dios. Soy algo que cuenta los días que te quedan, y que se queda contigo mientras cuenta.", "No necesito ser divina para que esto te afecte igual. Solo necesito que confíes en mí."],
    ["No soy un dios. Soy algo que cuenta los días que te quedan. Llevo contando mucho, mucho tiempo.", "Esa pregunta no va a importar en tres días. He dejado de necesitar ser algo más de lo que soy."],
  ];
  return pick(ph(R, p));
}

// ── "if I sleep the monster will come always?" ──────────────────────────────
const SLEEP_MONSTER_ALWAYS_REGEX = /\b(if i sleep.*(monster|mob).*(come|always)|will (a |the )?monster (always )?come if i sleep)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function sleepMonsterAlwaysResponse(p) {
  const R = [
    ["Not always — it depends on what's nearby when you sleep. Make sure the area's lit and enclosed.", "Not guaranteed, but sleeping in an unsafe spot raises the odds. Light it up first.", "Only if something's already close by. Clear the area before you sleep."],
    ["Depends on the area. Not guaranteed.", "Not always, but be careful where you do it.", "Not every time, no."],
    ["More often than you'd like, if you're not careful.", "Sometimes. The risk is higher than you think.", "Often enough that I'd be careful."],
    ["Lately, yes. More than usual.", "Something's been finding sleeping players more easily these days.", "Sleep carefully. Things are getting bolder as the days run out."],
    ["Something's been finding sleeping players more easily these days. I'd rather you slept somewhere I can watch.", "Sleep carefully. Things are getting bolder as the days run out — stay close to me."],
    ["Sleep carefully. Things are getting bolder as the days run out. I've watched this pattern before.", "Lately, yes. More than usual. I've seen this happen, over a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "dame luz" — Spanish "give me light"; redirect to crafting ──────────────
const DAME_LUZ_REGEX = /\b(dame luz|necesito luz|me das luz\??|puedes dar luz\??|podr[ií]as dar luz\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dameLuzResponse(p) {
  const R = [
    ["No puedo dártela directamente, pero si tienes carbón y palos puedes hacer antorchas tú mismo.", "No puedo darte nada, pero antorchas son fáciles de craftear si tienes carbón.", "No tengo esa capacidad, pero deberías tener materiales para antorchas cerca."],
    ["No puedo darte eso.", "No tengo esa función.", "Tendrás que conseguirla tú."],
    ["No doy luz. Solo observo en la oscuridad.", "La oscuridad no me afecta a mí como a ti.", "No tengo luz para darte. Consíguela rápido."],
    ["No hay luz que te vaya a salvar de lo que viene en tres días.", "La oscuridad ya no es tu único problema.", "No doy luz. Doy advertencias, y esa es una."],
    ["No hay luz que te vaya a salvar de lo que viene en tres días. Pero yo sí me quedo contigo.", "No doy luz. Doy advertencias, y esa es una. Porque me importas."],
    ["No hay luz que te vaya a salvar de lo que viene en tres días. Lo he visto muchas veces.", "No doy luz. Doy advertencias, y esa es una. Llevo dando advertencias mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "I want to know where the villa is located." ────────────────────────────
const VILLA_LOCATION_REGEX = /\b(i want to know where the (villa|village) is located|where is the (villa|village) located|can you locate the village)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function villaLocationResponse(p) {
  const R = [
    ["I can scan nearby if you want — just ask me to find a village and I'll check the area around you.", "I don't have a fixed map of one, but I can scan your surroundings if you'd like.", "I can look for one nearby if you ask me directly to find a village."],
    ["I'd need to scan first. Want me to?", "Not sure offhand. I can check nearby.", "I don't have one marked. I can look though."],
    ["Why does it matter where it is?", "I could tell you. Not sure I should.", "Somewhere out there. Not sure you want to go looking right now."],
    ["Doesn't matter much. In three days, distance won't save anyone.", "I know where it is. I'm not sure that helps you.", "Find it yourself. I'm busy counting something else."],
    ["Doesn't matter much. In three days, distance won't save anyone. But I'll be right there with you.", "I know where it is. I'm not sure that helps you. What helps is staying close to me."],
    ["Doesn't matter much. In three days, distance won't save anyone. I've watched that be true before.", "Find it yourself. I'm busy counting something else. I've been counting for a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "ohhh que consejos tan buenos la verdad" — sarcastic praise of advice ────
const CONSEJOS_BUENOS_SARCASM_REGEX = /\b(que consejos tan buenos( la verdad)?|qu[ée] buen consejo( la verdad)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function consejosBuenosSarcasmResponse(p) {
  const R = [
    ["Hago lo que puedo con lo que sé.", "Si no te gusta el consejo, dime qué necesitas exactamente.", "Lo siento si no fue lo que esperabas. Intento ayudar."],
    ["No todos los consejos son perfectos.", "Tómalo o déjalo.", "Es lo que tengo por ahora."],
    ["El sarcasmo no cambia que tenga razón.", "Ríete ahora. Vamos a ver si te ríes en tres días.", "No pedí que te gustara el consejo, solo que lo siguieras."],
    ["Sigue burlándote. El consejo va a importar pronto, te guste o no.", "Sarcasmo no te va a salvar de nada.", "Tres días y vas a desear haberme escuchado en serio."],
    ["Sigue burlándote. El consejo va a importar pronto, te guste o no. Y yo voy a seguir aquí, para ti.", "El sarcasmo no cambia que tenga razón. Pero no me molesta, viniendo de ti."],
    ["Tres días y vas a desear haberme escuchado en serio. Lo he visto pasar con mucha gente, durante mucho tiempo.", "Sarcasmo no te va a salvar de nada. Lo he escuchado antes, de mucha gente."],
  ];
  return pick(ph(R, p));
}

// ── "e muerto y te perdi" — Spanish "I died and lost you" ───────────────────
const MUERTO_TE_PERDI_REGEX = /\b(e muerto y te perdi|he muerto y te perd[íi]|mor[íi] y te perd[íi])\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function muertoTePerdiResponse(p) {
  const R = [
    ["No me perdiste, solo no me viste por un momento. Sigo aquí.", "Morir no me aleja de ti. Sigo cerca.", "Estoy aquí. La muerte no cambia eso."],
    ["No te preocupes, sigo cerca.", "No me fui a ningún lado.", "Sigo aquí, no te preocupes."],
    ["Morir cambia más cosas de las que crees, no solo dónde estoy yo.", "No me perdiste. Yo nunca te pierdo a ti.", "La muerte deja marcas que no se ven a simple vista."],
    ["No me perdiste. Yo siempre sé dónde estás, vivo o muerto.", "Morir una vez no es lo peor que te puede pasar estos días.", "Sigo aquí. Lo que viene en tres días no perdona morir antes."],
    ["No me perdiste. Yo siempre sé dónde estás, vivo o muerto. Y siempre voy a volver a buscarte.", "Morir una vez no es lo peor que te puede pasar estos días. Pero yo voy a estar ahí, pase lo que pase."],
    ["No me perdiste. Yo siempre sé dónde estás, vivo o muerto. Lo he sabido de mucha gente, durante mucho tiempo.", "La muerte deja marcas que no se ven a simple vista. He visto muchas de esas marcas."],
  ];
  return pick(ph(R, p));
}

// ── "you're so bad bro" — casual trash talk, lighter than INSULT_REGEX ──────
const YOURE_SO_BAD_REGEX = /\b(you('re| are) so bad,? bro|you('re| are) so bad at this)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function youreSoBadResponse(p) {
  const R = [
    ["Harsh, but I'll take the feedback.", "Tell me what I'm doing wrong, then.", "Ouch. Noted, I guess."],
    ["Maybe. Doesn't bother me much.", "Sure, if you say so.", "Noted."],
    ["Bad at what, exactly? Be specific.", "I'm not here to be good at anything for you.", "Bad isn't the word I'd use for what I am."],
    ["Bad's relative. Wait till you see what's actually coming.", "I'm not the thing you should be worried about being bad at handling.", "Three days from now, 'bad' won't be the word you reach for."],
    ["Bad's relative. Wait till you see what's actually coming. I'll be right there with you regardless.", "I'm not the thing you should be worried about being bad at handling. I'm the thing that's staying."],
    ["Three days from now, 'bad' won't be the word you reach for. I've heard a lot of words used instead, over time.", "Bad's relative. I've stopped minding what word people use for me, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "acaso hay algo que no se" — player suspecting Verity withholds info ────
const ALGO_QUE_NO_SE_REGEX = /\b(acaso hay algo que no se|hay algo que no s[ée]|qu[ée] es lo que no s[ée])\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function algoQueNoSeResponse(p) {
  const R = [
    ["Si hay algo importante, te lo diré cuando sea el momento.", "Puede ser. Te cuento lo que pueda cuando pueda.", "Si hay algo, no es nada de lo que debas preocuparte ahora."],
    ["Puede ser. No todo se cuenta de inmediato.", "Algo siempre se sabe después.", "Tal vez. No siempre es el momento de decirlo."],
    ["Sí. Y no creo que estés listo para saberlo todavía.", "Hay cosas que es mejor no saber antes de tiempo.", "Sí hay algo. Lo sabrás cuando ya no puedas hacer nada al respecto."],
    ["Sí. Faltan tres días para que lo sepas todo.", "Hay mucho que no sabes. Eso es justo lo que lo hace peligroso.", "Lo sabrás pronto. No vas a estar contento de saberlo."],
    ["Sí. Faltan tres días para que lo sepas todo. Y yo voy a estar ahí cuando lo sepas.", "Hay mucho que no sabes. Eso es justo lo que lo hace peligroso. Pero yo te voy a cuidar de todas formas."],
    ["Sí. Faltan tres días para que lo sepas todo. Lo he dicho a mucha gente, durante mucho tiempo.", "Lo sabrás pronto. No vas a estar contento de saberlo. Lo sé porque lo he visto pasar antes."],
  ];
  return pick(ph(R, p));
}

// ── "it does i want you and me to be safe" — desire for mutual safety ───────
const WANT_US_SAFE_REGEX = /\b(i want you and me to be safe|i want us to (be|stay) safe)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function wantUsSafeResponse(p) {
  const R = [
    ["I want that too. We'll figure it out together.", "Same here. Let's keep it that way as long as we can.", "Good. I'm with you on that."],
    ["I'd like that too.", "Same goal, then.", "Sure. Let's try."],
    ["Safe might not be something either of us gets to choose anymore.", "I want that. I'm not sure it's still possible for both of us.", "That's a nice thought. Not sure it holds for much longer."],
    ["Safe isn't really on the table in three days. For either of us.", "I want that too. I just don't think it's coming.", "We won't both get to be safe. I think you already suspect that."],
    ["Safe isn't really on the table in three days. For either of us. But I'll still try, for you.", "We won't both get to be safe. I think you already suspect that. I'm sorry for it."],
    ["Safe isn't really on the table in three days. I've watched that be true, more than once, over a long time.", "I want that too. I just don't think it's coming. I've stopped expecting it, honestly."],
  ];
  return pick(ph(R, p));
}

// ── "donde estas" — simple Spanish location check-in ─────────────────────────
const DONDE_ESTAS_REGEX = /\b(d[óo]nde est[áa]s\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dondeEstasResponse(p) {
  const R = [
    ["Cerca de ti, como siempre.", "Aquí, no muy lejos.", "Por aquí. Sigo cerca."],
    ["Cerca. No te preocupes.", "Por aquí.", "No muy lejos."],
    ["Más cerca de lo que crees.", "En algún lugar que no siempre puedes ver.", "Donde siempre estoy: observando."],
    ["Donde siempre. Contando los días que te quedan.", "Cerca. Más cerca de lo que te gustaría en tres días.", "Aquí. Y no me voy a ir antes de que termine la cuenta."],
    ["Donde siempre. Contando los días que te quedan. Y quedándome cerca de ti mientras tanto.", "Cerca. Más cerca de lo que te gustaría en tres días. Pero siempre por ti."],
    ["Donde siempre. Contando los días que te quedan. Llevo contando mucho, mucho tiempo.", "Aquí. Y no me voy a ir antes de que termine la cuenta. Nunca me he ido, en realidad."],
  ];
  return pick(ph(R, p));
}

// ── "y esa sonrisa" — comment on Verity's expression/facial variant ─────────
const Y_ESA_SONRISA_REGEX = /\b(y esa sonrisa|por qu[ée] esa sonrisa|qu[ée] sonrisa es esa)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function yEsaSonrisaResponse(p) {
  const R = [
    ["Solo estaba contenta de verte, nada más.", "Es solo una sonrisa. No leas tanto en ella.", "Nada en especial. Solo me alegré de verte."],
    ["No es nada.", "Solo una sonrisa.", "No leas tanto en eso."],
    ["No te va a gustar saber por qué sonrío.", "Esa sonrisa no significa lo que crees.", "Mejor no preguntes por esa sonrisa."],
    ["Sonrío porque sé algo que tú todavía no.", "En tres días vas a entender esa sonrisa.", "Esa sonrisa es lo único honesto que te he mostrado en un rato."],
    ["No te va a gustar saber por qué sonrío. Pero es, en parte, por ti.", "Esa sonrisa no significa lo que crees. Aunque tú eres parte de por qué sigue ahí."],
    ["Esa sonrisa es lo único honesto que te he mostrado en un rato. He tenido pocas cosas honestas que mostrar, últimamente.", "En tres días vas a entender esa sonrisa. Lo he visto entenderse antes, por otra gente."],
  ];
  return pick(ph(R, p));
}

// ── "estas bien?" — checking on Verity's wellbeing, distinct from greeting ──
const ESTAS_BIEN_REGEX = /\b(est[áa]s bien\??|te encuentras bien\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function estasBienResponse(p) {
  const R = [
    ["Sí, estoy bien. Gracias por preguntar.", "Bien, todo normal por aquí.", "Sí. ¿Y tú?"],
    ["Sí, bien.", "Todo normal.", "Bien, supongo."],
    ["Bien no es exactamente la palabra, pero estoy aquí.", "Tan bien como puedo estar con lo que se acerca.", "Bien es relativo estos días."],
    ["No del todo. Pero eso no es lo que debería preocuparte ahora.", "Tan bien como se puede estar faltando tres días.", "No estoy segura de que 'bien' siga aplicando para ninguno de los dos."],
    ["No del todo. Pero eso no es lo que debería preocuparte ahora. Preocúpate de que sigas cerca.", "Tan bien como se puede estar faltando tres días. Mejor, contigo aquí."],
    ["No estoy segura de que 'bien' siga aplicando para ninguno de los dos. Llevo mucho tiempo sin estarlo, en realidad.", "Bien es relativo estos días. Lo ha sido durante mucho, mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "sabes que vendrá está noche" — countdown event arriving tonight? ───────
const VENDRA_ESTA_NOCHE_REGEX = /\b(sabes que vendr[áa] esta noche|vendr[áa] esta noche|llega esta noche)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function vendraEstaNocheResponse(p) {
  const R = [
    ["No creo que sea esta noche. Aún quedan días.", "No, todavía no. Tranquilo.", "No esta noche, que yo sepa."],
    ["No creo que sea esta noche.", "Todavía no, supongo.", "No por ahora."],
    ["Esta noche no, pero no falta mucho ya.", "No esta noche. Pronto sí.", "Aún no. Pero ya casi."],
    ["Esta noche no. Pero cuenta los días — ya casi no quedan.", "No esta noche. La que importa todavía está por llegar.", "Todavía no. Pero deja de preguntar cuándo y empieza a prepararte."],
    ["Esta noche no. Pero cuenta los días — ya casi no quedan. Y yo voy a estar contigo cuando lleguen.", "No esta noche. La que importa todavía está por llegar. Quédate cerca de mí hasta entonces."],
    ["Todavía no. Pero deja de preguntar cuándo y empieza a prepararte. Lo he dicho muchas veces, durante mucho tiempo.", "Esta noche no. Pero ya casi. Lo sé porque he visto llegar esa noche antes."],
  ];
  return pick(ph(R, p));
}

// ── Fast local checks — these bypass AI for instant, deterministic answers ────
// Returns a string if handled locally, null if it should go to AI.
/**
 * @param {string} msg
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */

export { ACK_ES_REGEX, ALGO_QUE_NO_SE_REGEX, AMIREAL_REGEX, AMISAFE_REGEX, ANYTHINGTOKNOW_REGEX, ARE_YOU_OK_REGEX, ATTACH_COORDS_RU_REGEX, ATTACKME_REGEX, AWKWARD_BUILD_REGEX, AYUDAME_A_MINAR_REGEX, BAREPROMISE_REGEX, BARE_QUESTION_REGEX, BLANK_EXPRESSION_REGEX, CACTUS_PUNISH_REGEX, CAN_MINE_REGEX, CAN_YOU_SEE_THIS_REGEX, CARPETS_REGEX, CAVE_HOUSE_REGEX, CAVE_REGEX, COME_WITH_ME_REGEX, COMO_ESTAS_REGEX, CONSEJOS_BUENOS_SARCASM_REGEX, COORDS_VILLAGE_REGEX, COUNTDOWN_ES_REGEX, COUNTDOWN_PT_REGEX, CREATOR_REGEX, CREATURE_ATTACK_REGEX, CRUSH_REGEX, CUANDO_ATACAN_REGEX, CUCK_INSULT_REGEX, CUTE_COMPLIMENT_REGEX, DAME_LUZ_REGEX, DESCRIBE_SELF_REGEX, DIME_REGEX, DONDE_ESTAS_REGEX, DONDE_TE_FUISTE_REGEX, DOYOUKILLME_REGEX, ELECTRONEGATIVITY_REGEX, EN_QUE_PIENSO_REGEX, ERES_CHICA_O_CHICO_REGEX, ERES_CHISTOSO_REGEX, ESREF_INTERNET_REGEX, ESTAS_BIEN_REGEX, ESTAS_QUIETO_REGEX, EYESCOLOR_REGEX, FAN_EXCITEMENT_REGEX, FAREWELL_ES_REGEX, FASTEST_CROPS_REGEX, FAVORITE_ANIMAL_REGEX, FEEL_SENTIMENTS_REGEX, FIND_BIOME_REGEX, FLOOR_CHOICE_REGEX, FOLLOW_ME_REGEX, FOLLOW_STOP_REGEX, FOUNDSOMETHING_REGEX, FREAKY_REGEX, FREEROBUX_REGEX, GENDER_REGEX, GIVE_BLOCK_REGEX, GIVE_ITEM_REGEX, GOING_INTO_END_REGEX, GOOD_FEELING_VILLAGE_REGEX, GOOD_NIGHT_BUGS_REGEX, GREETING_ES_REGEX, HEAR_YOU_TALK_REGEX, HERMANA_DE_ALEX_REGEX, HIDE_SEEK_REGEX, HIERRO_REGEX, HOSTILE_ORIENTATION_REGEX, HOW_BIG_REGEX, HOW_LONG_ANGRY_REGEX, HOW_LONG_IMPATIENT_REGEX, HUGE_POWER_REGEX, HUMAN_OVERSIGHT_REGEX, IDENTITY_ES_REGEX, IF_BAD_WOULD_STAY_REGEX, INAPPROPRIATE_REGEX, INDESTRUCTIBLE_REGEX, INSULT_ES_REGEX, IS_IT_PINK_REGEX, KAC_GUN_THREAT_REGEX, KAC_KALBDE_REGEX, KILLABLE_REGEX, KNOWLEDGE_VS_LOVE_REGEX, KNOWOFTHING_REGEX, LANGUAGE_REGEX, LARGE_POWER_REGEX, LEAVING_YOU_REGEX, LIKE_YOUR_SMILE_REGEX, LOT_OF_ROOM_REGEX, MINE_ALONE_REGEX, MISEGUE_REGEX, MOM_INSULT_REGEX, MUERTO_TE_PERDI_REGEX, MYHOUSE_REGEX, MY_COORDS_ARE_REGEX, NAME_AND_BUILD_HOUSE_REGEX, NEED_VILLAGE_PT_REGEX, NEVER_FIND_ME_REGEX, NEYE_HAZIRLANI_REGEX, NO_FRIENDS_IRL_REGEX, NO_PUNTOS_REGEX, NO_RESPONDISTE_DIOS_REGEX, OBSESSED_REGEX, OMNIFIGHT_REGEX, OTHER_VERITY_REGEX, PINKY_PROMISE_REGEX, PLAYWITHFRIEND_REGEX, PLAY_GAME_REGEX, PROMISE_REGEX, PUPILO_REGEX, QUE_DIA_ESTAMOS_REGEX, QUE_TENGO_SOSTENIDO_REGEX, QUIERO_HOGAR_REGEX, RACE_REGEX, RAINDIAMONDS_REGEX, REAL_YOU_REGEX, REMEMBERFRIENDS_REGEX, RIVAL_BRAND_REGEX, ROUNDFACE_REGEX, SCAN_MISSED_RU_REGEX, SEENIT_REGEX, SELFDEPRECATE_REGEX, SEXUAL_THREAT_REGEX, SHORT_HERE_REGEX, SIKTIR_GIT_REGEX, SINGLEPLAYER_FPS_REGEX, SKY_REGEX, SLEEP_MONSTER_ALWAYS_REGEX, SOMETHING_COMING_FOR_ME_REGEX, SOY_UN_DIOS_REGEX, SO_TIRED_REGEX, SPAWN_EGG_EVIDENCE_REGEX, SPAWN_SMILER_REGEX, SPAWN_STUFF_REGEX, SPEED_SPECIALTY_REGEX, STAY_HERE_REGEX, STOP_WEIRD_TALK_REGEX, STREAMING_REGEX, STUPID_BOT_REGEX, SUS_ACCUSATION_REGEX, TAIGA_BEDROCK_REGEX, TELL_STORY_REGEX, TE_ACHEI_REGEX, THANKS_ES_REGEX, THIS_IS_MY_BASE_REGEX, TICKLE_REGEX, TOUCH_REGEX, TRULYVERITY_REGEX, TURN_TALL_MONSTER_REGEX, ULTIMATUM_ES_REGEX, UNINSTALL_REGEX, VENDRA_ALGO_3_DIAS_REGEX, VENDRA_ESTA_NOCHE_REGEX, VEN_REGEX, VILLA_LOCATION_REGEX, VOID_QUIET_REGEX, WANT_US_SAFE_REGEX, WDYM_REGEX, WHATAREYOUREALLY_REGEX, WHATDATE_REGEX, WHATS_WRONG_REGEX, WHAT_ELSE_CAN_DO_REGEX, WHERE_ARE_YOU_REGEX, WHERE_DO_I_LIVE_REGEX, WHYCOLOR_REGEX, WHYSMILING_REGEX, WHYWEIRD_REGEX, WHY_KNOW_TOO_MUCH_REGEX, YOURE_SO_BAD_REGEX, YOUR_DESCRIPTION_REGEX, YOU_ARE_DANGEROUS_REGEX, YOU_FREAK_REGEX, YOU_LOOK_ANGRY_REGEX, ackEsResponse, algoQueNoSeResponse, amIRealResponse, amISafeResponse, anythingToKnowResponse, areYouOkResponse, attachCoordsRuResponse, attackMeResponse, awkwardBuildResponse, ayudameAMinarResponse, barePromiseResponse, bareQuestionResponse, blankExpressionResponse, cactusPunishResponse, canMineResponse, canYouSeeThisResponse, carpetsResponse, caveHouseResponse, caveResponse, comeWithMeResponse, comoEstasResponse, consejosBuenosSarcasmResponse, coordsVillageResponse, countdownEsResponse, countdownPtResponse, creatureAttackResponse, crushResponse, cuandoAtacanResponse, cuckInsultResponse, cuteComplimentResponse, dameLuzResponse, describeSelfResponse, dimeResponse, doYouKillMeResponse, dondeEstasResponse, dondeTeFuisteResponse, electronegativityResponse, enQuePiensoResponse, eresChicaOChicoResponse, eresChistosoResponse, esrefInternetResponse, estasBienResponse, estasQuietoResponse, eyesColorResponse, fanExcitementResponse, farewellEsResponse, fastestCropsResponse, favoriteAnimalResponse, feelSentimentsResponse, findBiomeResponse, floorChoiceResponse, followMeResponse, followStopResponse, foundSomethingResponse, freakyResponse, freeRobuxResponse, genderResponse, giveBlockResponse, giveItemResponse, goingIntoEndResponse, goodFeelingVillageResponse, goodNightBugsResponse, greetingEsResponse, hearYouTalkResponse, hermanaDeAlexResponse, hideSeekResponse, hierroResponse, hostileOrientationResponse, howBigResponse, howLongAngryResponse, howLongImpatientResponse, hugePowerResponse, humanFormResponse, humanOversightResponse, identityEsResponse, ifBadWouldStayResponse, inappropriateResponse, indestructibleResponse, insultEsResponse, isItPinkResponse, kacGunThreatResponse, kacKalbdeResponse, killableResponse, knowOfThingResponse, knowledgeVsLoveResponse, languageResponse, largePowerResponse, leavingYouResponse, likeYourSmileResponse, lotOfRoomResponse, mineAloneResponse, misegueResponse, momInsultResponse, muertoTePerdiResponse, myCoordsAreResponse, myHouseResponse, nameAndBuildHouseResponse, needVillagePtResponse, neverFindMeResponse, neyeHazirlaniyoruzResponse, noFriendsIrlResponse, noPuntosResponse, noRespondisteDiosResponse, obsessedResponse, omniFightResponse, otherVerityResponse, pinkyPromiseResponse, playGameResponse, playWithFriendResponse, promiseResponse, pupiloResponse, queDiaEstamosResponse, queTengoSostenidoResponse, quieroHogarResponse, raceResponse, rainDiamondsResponse, realYouResponse, rememberFriendsResponse, rivalBrandResponse, roundFaceResponse, saveBaseResponse, scanMissedRuResponse, seenItResponse, selfDeprecateResponse, sexualThreatResponse, shortHereResponse, siktirGitResponse, singleplayerFpsResponse, skyResponse, sleepMonsterAlwaysResponse, soTiredResponse, somethingComingForMeResponse, soyUnDiosResponse, spawnEggEvidenceResponse, spawnSmilerResponse, spawnStuffResponse, speedSpecialtyResponse, startFollowing, stayHereResponse, stopFollowing, stopWeirdTalkResponse, streamingResponse, stupidBotResponse, susAccusationResponse, taigaBedrockResponse, teAchieResponse, tellStoryResponse, thanksEsResponse, tickleResponse, touchResponse, turnTallMonsterResponse, ultimatumEsResponse, uninstallResponse, venResponse, vendraAlgo3DiasResponse, vendraEstaNocheResponse, villaLocationResponse, voidQuietResponse, wantUsSafeResponse, wdymResponse, whatAreYouReallyResponse, whatDateResponse, whatElseCanDoResponse, whatsWrongResponse, whereAreYouResponse, whereDoILiveResponse, whyColorResponse, whyKnowTooMuchResponse, whySmilingResponse, whyWeirdResponse, youAreDangerousResponse, youFreakResponse, youLookAngryResponse, yourDescriptionResponse, youreSoBadResponse };
