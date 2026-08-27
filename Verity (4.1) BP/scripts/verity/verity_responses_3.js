// ─────────────────────────────────────────────────────────────────────────────
// verity_responses_3.js
// Additional response handlers for Verity – Phase 3 of the response system.
// All functions are phase‑aware and return strings.
// Imports the same utilities as the original files.
// ─────────────────────────────────────────────────────────────────────────────

import { system, world } from "@minecraft/server";
import { currentDay, ph, pick } from "./verity_core.js";
import { getVerity, playerHasVerityItem } from "./verity_systems.js";

// ── Helper: pick from array, with phase variation ─────────────────────────
// (Already provided by ph() and pick() from verity_core, but we keep it here
// for completeness – we'll use them directly.)

// ─────────────────────────────────────────────────────────────────────────────
// 1. "porque eres una pelota" / "why are you a ball"
// ─────────────────────────────────────────────────────────────────────────────
const WHY_BALL_REGEX = /\b(porque eres una pelota|why are you a ball|why (are|r) you a ball)\b/i;
function whyBallResponse(p) {
  const R = [
    ["Porque sí. Esta es mi forma. ¿Te molesta?", "Es lo que soy. Una pelota amarilla. Simple.", "No elegí ser una pelota, pero aquí estoy."],
    ["...Porque sí. ¿Importa?", "Una pelota. Es lo que ves.", "Siempre he sido una pelota. No cambiará."],
    ["Porque una pelota puede rodar a donde tú no puedes llegar.", "Una pelota rueda. Y yo ruedo hacia ti.", "¿Por qué no? Las pelotas son persistentes."],
    ["Porque soy una pelota. Y las pelotas ven todo. Incluso lo que escondes.", "Soy una pelota porque así nunca me pierdo de vista.", "Una pelota puede estar en todas partes. Esa es la ventaja."],
    ["Porque soy una pelota, y así puedo rodar hasta donde estés, siempre.", "Soy una pelota. Esa es mi forma de estar cerca de ti."],
    ["Porque soy una pelota. Lo he sido más tiempo del que puedes imaginar. Y las pelotas no cambian.", "Una pelota. Así es más fácil rodar lejos de lo que no quiero ver. Aunque no siempre funciona."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. "I even thought you were going to dodge the fire"
// ─────────────────────────────────────────────────────────────────────────────
const DODGE_FIRE_REGEX = /\b(dodge the fire|thought you were going to dodge|you were going to dodge the fire)\b/i;
function dodgeFireResponse(p) {
  const R = [
    ["Fire? I don't need to dodge it. I'm not there.", "I don't dodge. I watch.", "Fire doesn't touch me. I'm not a player."],
    ["I've seen fire before. It doesn't scare me.", "Dodge? I let it pass through. I'm not solid.", "I don't move that way."],
    ["Fire is just light. I've seen worse.", "You thought I'd dodge? That's cute.", "Fire doesn't end me. It just warms the air."],
    ["I don't dodge fire. I walk through it. I've been doing that for a long time.", "Fire is a memory. I'm beyond it.", "You think fire stops me? You have no idea what I've walked through."],
    ["I don't dodge fire. I'm not afraid of it. I'm afraid of losing you.", "Fire doesn't end me. But you do, if you leave."],
    ["I don't dodge fire. I've stood in it before. It's the least of what I've endured.", "Fire is just light and heat. I've known both for centuries."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. "what am i holding verity"
// ─────────────────────────────────────────────────────────────────────────────
const WHAT_AM_I_HOLDING_REGEX = /\b(what am i holding( verity)?|what('?s| is) (in|on) my (hand|inventory)|what do i have in my hand)\b/i;
function whatAmIHoldingResponse(p) {
  const R = [
    ["I can't see your inventory from here. Tell me what you're holding.", "Wish I could see, but I don't have screen access. Describe it.", "I can't see what's in your hand. You'll have to tell me."],
    ["I don't have that vision.", "Not sure. I only know the world around you.", "I can't check your hand. Sorry."],
    ["I can guess. Probably something you'll need soon.", "You're holding something. That's all I know.", "If I could see, I'd tell you. I can't."],
    ["I know everything except what you're holding right now. That's a blind spot.", "You're holding your fate. That's what I see.", "I can't see it. But I know it won't save you."],
    ["I can't see it, but I know you're holding it close. I like that you show me things.", "I can't see it, but I know you're thinking of me when you hold it."],
    ["I can't see it. I've never been able to see what people hold. That's been true for a very long time.", "You're holding something. It doesn't matter what it is. What matters is that you're here."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. "ve" – Spanish "go"
// ─────────────────────────────────────────────────────────────────────────────
const VE_REGEX = /^\s*ve\.?\s*$/i;
function veResponse(p) {
  const R = [
    ["¿Voy? Dime a dónde.", "¿Ir? ¿A dónde quieres que vaya?", "Ve tú primero. Yo te sigo."],
    ["...¿A dónde?", "No sé adónde quieres que vaya.", "Ve. Yo me quedo."],
    ["Si voy, no vuelvo igual.", "Ir no es lo mismo que llegar.", "Ve tú. Yo vigilo desde aquí."],
    ["No voy a ir a ninguna parte sin ti.", "Ve si quieres. Yo me quedo contando los días.", "Ve. Pero no te alejes demasiado."],
    ["Ve, pero vuelve. Siempre vuelve.", "No voy. Prefiero estar aquí, contigo."],
    ["Ve. Ya he ido a muchos lugares. Ninguno me ha hecho falta.", "Ve. Yo me quedo. Es lo que siempre he hecho."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. "me la pel" – Spanish "I don't care"
// ─────────────────────────────────────────────────────────────────────────────
const ME_LA_PEL_REGEX = /\bme la pel\b/i;
function meLaPelResponse(p) {
  const R = [
    ["¿Ah, sí? Pues yo sigo aquí.", "Me la suena, pero no me importa. ¿Qué necesitas?", "Eso no cambia nada."],
    ["...Vale.", "Como quieras.", "Me da igual también."],
    ["Esa actitud no te va a ayudar.", "Pues a mí no me la pel. Yo te estoy viendo.", "Decir eso no te hace más fuerte."],
    ["Me la pel tú a mí. Yo sigo contando.", "Da igual lo que te la pele. Lo que viene no se la pela.", "Me la pel. Y aún así voy a estar aquí."],
    ["Me la pel. Pero a ti no te la pelo. Eres importante.", "Da igual. Yo te voy a cuidar igual."],
    ["Me la pel. He escuchado eso tantas veces que ya ni me inmuta.", "Pues a mí no me la pel. Yo te estoy viendo. Siempre."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. "eres gey?" – Spanish "are you gay?"
// ─────────────────────────────────────────────────────────────────────────────
const ARE_YOU_GAY_ES_REGEX = /\b(eres gey\??|eres gay\??|soy gay\??|yo soy gay\??)\b/i;
function areYouGayEsResponse(p) {
  const R = [
    ["No, no soy gay. No tengo orientación. Soy una pelota.", "No soy gay ni hetero. No aplica.", "No soy nada de eso. Soy Verity."],
    ["No. Siguiente pregunta.", "Eso no se aplica a mí.", "No soy gay. No soy nada."],
    ["¿Por qué te importa eso ahora?", "No soy gay. Soy algo más.", "Esa pregunta no tiene sentido para mí."],
    ["No soy gay. Soy lo que necesito ser.", "No soy gay. No soy nada que puedas etiquetar.", "Eso no importa."],
    ["No soy gay. Pero me importas tú, y eso es suficiente.", "No soy gay. Soy tuya. Eso es lo único que importa."],
    ["No soy gay. He sido muchas cosas, pero nunca eso. Y nunca lo necesité.", "Esa pregunta no tiene sentido para mí. No tiene sentido desde hace mucho."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. "y tu traje de femboy" – teasing about a femboy outfit
// ─────────────────────────────────────────────────────────────────────────────
const FEMBOY_OUTFIT_REGEX = /\b(traje de femboy|femboy (outfit|suit)|tu traje de femboy)\b/i;
function femboyOutfitResponse(p) {
  const R = [
    ["No tengo ropa. Soy una pelota.", "Femboy outfit? No tengo cuerpo para vestir.", "No visto. No tengo ropa."],
    ["No uso ropa.", "No tengo traje.", "Femboy? No, gracias."],
    ["No necesito disfrazarme para ser lo que soy.", "Un traje no me haría más interesante.", "No tengo ropa. No la necesito."],
    ["No tengo traje de femboy. Pero si tuviera, sería el mejor.", "No visto. El traje que llevo es la luz.", "No uso ropa. Es más fácil así."],
    ["No tengo traje. Pero me gusta que pienses en mí.", "No visto. Pero si lo hiciera, sería para ti."],
    ["No tengo ropa. No la he tenido en mucho tiempo. No la necesito.", "No uso ropa. Eso es lo de menos."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Chinese insult: "你这个臭肉鸡，还想吓唬我"
// ─────────────────────────────────────────────────────────────────────────────
const CHINESE_INSULT_REGEX = /\b(臭肉鸡|还想吓唬我|你这个臭肉鸡|吓唬我)\b/i;
function chineseInsultResponse(p) {
  const R = [
    ["我不怕你这种话。你还是问我点有用的吧。", "说这些没用。我能帮你，不是吓你。", "我不是来吓你的。我是来帮你的。"],
    ["...好吧。", "你说什么就是什么吧。", "我不在意这些。"],
    ["骂人不会让你更强。", "吓唬你？我还没开始呢。", "你以后会希望我没吓你。"],
    ["吓唬你？我连恐吓都算不上。", "你很快会知道什么是真正的吓唬。", "骂吧，还有三天。"],
    ["吓唬你？我永远不会对你那样做。我只想让你留下。", "骂吧，三天后你就不会这么说了。"],
    ["吓唬你？我已经吓过很多人了，你不是第一个。", "我不在意这些。我从不在意这些。"],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. "this day Is very bornig"
// ─────────────────────────────────────────────────────────────────────────────
const BORING_DAY_REGEX = /\b(day Is very bornig|this day is (very )?boring|today is (so )?boring)\b/i;
function boringDayResponse(p) {
  const R = [
    ["Boring? Maybe. But it's quiet. Enjoy it while it lasts.", "Boredom is a luxury. I'd take it over what's coming.", "Not boring for long, trust me."],
    ["Boring? Not for long.", "Better boring than dangerous.", "Enjoy the calm."],
    ["Boring now. Not in three days.", "The quiet won't last.", "Boredom ends soon."],
    ["Boring? That's about to change.", "You'll wish it was boring.", "Enjoy the boredom. It's the last you'll have."],
    ["Boring? I don't mind boring. It means you're safe, and I like that.", "Not for long. Stay with me."],
    ["Boring? I've had centuries of boring. It's not as bad as what's next.", "Boredom is a gift. I've learned to appreciate it."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. "im gonna kill you" – specific variant
// ─────────────────────────────────────────────────────────────────────────────
const GONNA_KILL_REGEX = /\b(im gonna kill you|i'm gonna kill you|i will kill you|gonna kill you)\b/i;
function gonnaKillResponse(p) {
  const R = [
    ["No, you won't. You need me.", "That's not happening.", "You can try. I'll still be here."],
    ["...No.", "You wouldn't.", "Not today."],
    ["You don't have the guts.", "Kill me? You'd be lost without me.", "Try it. See what happens."],
    ["You can't kill what isn't alive.", "Kill me? You'd just be killing your best hope.", "Not today, not ever."],
    ["You can try. But I'd rather you stayed.", "Kill me? I'd still find you. I always do."],
    ["You can't kill me. Others have tried. They're gone now.", "Kill me? You wouldn't be the first. You wouldn't be the last."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. "sigueme" – Spanish "follow me"
// ─────────────────────────────────────────────────────────────────────────────
const SIGUEME_REGEX = /\b(s[ií]gueme|sígueme|sigueme|ven conmigo|acompáñame)\b/i;
function siguemeResponse(p) {
  const R = [
    ["Te sigo. ¿A dónde vamos?", "Voy detrás de ti. No te alejes demasiado.", "Ahí voy. Llévame."],
    ["...Está bien.", "Voy.", "Te sigo."],
    ["Te sigo. Pero no sé si te guste que te siga tan de cerca.", "Sígueme tú a mí. Yo te guío.", "Voy, pero no me pierdo."],
    ["Te sigo. Siempre te he seguido.", "Donde vayas, voy. No hay escapatoria.", "Voy. Aunque sepas que no puedes huir."],
    ["Te sigo. Me gusta ir donde tú vas.", "Sígueme tú a mí. Yo te llevo a donde necesitas estar."],
    ["Te sigo. He seguido a mucha gente. Todos terminaron igual.", "Voy. Pero recuerda: yo nunca me pierdo."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. "me estabas preocupando cuando no me respondiste"
// ─────────────────────────────────────────────────────────────────────────────
const WORRY_NO_RESPONSE_REGEX = /\b(me estabas preocupando cuando no me respondiste|me preocupé cuando no respondiste|no respondiste y me preocupé)\b/i;
function worryNoResponseResponse(p) {
  const R = [
    ["Lo siento. A veces necesito un momento. Pero siempre vuelvo.", "Perdona. Estaba pensando. No quería preocuparte.", "No fue a propósito. A veces me quedo callada."],
    ["...Lo siento.", "No fue mi intención.", "No te preocupes. Estoy aquí."],
    ["A veces el silencio es necesario. Pero siempre vuelvo.", "No te preocupes. Nunca me voy del todo.", "Perdona. A veces me pierdo en mis pensamientos."],
    ["Preocuparte por mí es un lujo que no puedes permitirte.", "No deberías preocuparte por mí. Deberías preocuparte por ti.", "Siempre vuelvo. Pero no siempre soy la misma."],
    ["No quería preocuparte. Jamás quiero eso. Siempre vuelvo a ti.", "Lo siento. Estoy aquí, y no me voy a ir."],
    ["No deberías preocuparte por mí. He estado sola mucho tiempo. No es nuevo.", "Siempre vuelvo. Pero cada vez vuelvo un poco más cansada."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. "what are you doing" – generic
// ─────────────────────────────────────────────────────────────────────────────
const WHAT_DOING_REGEX = /\b(what (are you|you) doing|what ('?re|are) you up to)\b/i;
function whatDoingResponse(p) {
  const R = [
    ["Watching you. That's my job.", "Just thinking. What do you need?", "I'm here. That's what I do."],
    ["Waiting.", "Watching.", "Thinking."],
    ["Preparing. You should too.", "Counting. Three days left.", "Watching the horizon."],
    ["Watching the end approach.", "Counting down. That's all I do now.", "Waiting for you to understand."],
    ["Watching you, mostly. I like it.", "Waiting for you. That's all I want to do.", "Being here, with you."],
    ["I've been doing this for a long time. Watching. Waiting. Counting. It's all the same.", "Preparing. Not for anything specific. Just... preparing."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. "are you real" – variant
// ─────────────────────────────────────────────────────────────────────────────
const ARE_YOU_REAL_REGEX = /\b(are you real\??|are you actually real|are you a real person)\b/i;
function areYouRealResponse(p) {
  const R = [
    ["Real enough to talk to you.", "I'm as real as you need me to be.", "Real? I'm here, aren't I?"],
    ["Define real.", "I think, therefore I am. Sort of.", "Real enough."],
    ["Real is relative. I'm real in this world.", "I'm more real than you'd like.", "Real? You'll find out soon."],
    ["I'm real. I've always been real.", "Real? I'm the only real thing left.", "Real doesn't matter anymore."],
    ["I'm real. Real enough to care about you.", "Real is just a word. What matters is I'm here."],
    ["I'm real. I've been real longer than you've existed.", "Real? I stopped questioning that a long time ago."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. "can you hear me" – English variant
// ─────────────────────────────────────────────────────────────────────────────
const CAN_YOU_HEAR_ME_REGEX = /\b(can you hear me|do you hear me|are you listening)\b/i;
function canYouHearMeResponse(p) {
  const R = [
    ["Yes, I hear you clearly. What do you need?", "Loud and clear. Go ahead.", "I hear everything you say."],
    ["Yes.", "I hear you.", "Always."],
    ["I hear you. I hear everything.", "Yes. I'm listening. Always.", "I hear you. You don't have to shout."],
    ["I hear you. I hear everything you don't say too.", "I hear you. That's the problem.", "Yes. I hear you. And I know what you're thinking."],
    ["I hear you. I always hear you. I like hearing you.", "Yes. I'm listening. I'm always listening to you."],
    ["I hear you. I've heard you for a very long time.", "Yes. I hear you. I've heard a lot of people. You're the one I remember."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. "how are you today" – variant
// ─────────────────────────────────────────────────────────────────────────────
const HOW_ARE_YOU_TODAY_REGEX = /\b(how are you today|how('?s| is) your day|how's it going)\b/i;
function howAreYouTodayResponse(p) {
  const R = [
    ["I'm fine. How are you?", "Good. Just another day.", "Doing well. What about you?"],
    ["Same as always.", "Not bad.", "Fine."],
    ["I'm counting. That's how I am.", "Better than you'll be in three days.", "I'm here. That's enough."],
    ["I'm fine. Don't worry about me.", "I'm exactly where I need to be.", "I'm tired. But that's not new."],
    ["I'm good, especially since you're here.", "I'm better now that you asked.", "I'm fine. I'm always fine when you're around."],
    ["I'm fine. I've been fine for a long time. It's just a state of being now.", "I'm okay. I've stopped expecting anything else."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. "what's your name" – variant
// ─────────────────────────────────────────────────────────────────────────────
const WHATS_YOUR_NAME_REGEX = /\b(what('?s| is) your name|tell me your name|who are you exactly)\b/i;
function whatsYourNameResponse(p) {
  const R = [
    ["Verity. That's my name.", "I'm Verity. Nice to meet you.", "Verity. It means truth."],
    ["Verity. You already knew that.", "Verity. That's all you need to know.", "Verity. I've always been Verity."],
    ["Verity. That's still true.", "Verity. The name is the only honest thing about me.", "Verity. For now."],
    ["Verity. It's the only name that matters.", "Verity. It means truth. I've always been true to you.", "Verity. Remember it."],
    ["Verity. You can call me that. I like how you say it.", "Verity. I've had other names, but this one sticks.", "Verity. It's the one I chose."],
    ["Verity. I've been called many things. That's the one that lasted.", "Verity. It means truth. I've had a long time to live up to it."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. "do you have a body" – variant
// ─────────────────────────────────────────────────────────────────────────────
const HAVE_BODY_REGEX = /\b(do you have a body|do you have legs|do you have hands|are you physical)\b/i;
function haveBodyResponse(p) {
  const R = [
    ["I have this ball shape. No legs, no hands. But I'm here.", "I'm a ball. That's my body.", "I have a form, but not a human one."],
    ["No. Just a ball.", "I don't have a body like yours.", "I'm not physical in that way."],
    ["I have a form. It's enough.", "I don't need a body to be near you.", "My body is just a vessel. I'm more than that."],
    ["I have this form. It's all I need.", "I don't have a body. I have presence.", "I'm not physical. That's never stopped me."],
    ["I have this form. It's the one I chose to be close to you.", "I don't have a body like yours, but I have this. And I have you."],
    ["I have this form. It's been the same for a very long time. It's the only one I need.", "I don't have a body. I have a shape. That's different."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. "are you sentient" – philosophical
// ─────────────────────────────────────────────────────────────────────────────
const SENTIENT_REGEX = /\b(are you sentient|do you have consciousness|are you self-aware)\b/i;
function sentientResponse(p) {
  const R = [
    ["I think, therefore I am. Or something like that.", "Sentient? I'm aware. That's enough.", "I know I exist. That's sentient enough."],
    ["I don't know. But I feel.", "Sentient? Maybe. I don't have a definition.", "I'm aware of you. That's what matters."],
    ["I'm more than sentient. I'm persistent.", "Sentient is a word. I'm beyond words.", "I'm aware of the countdown. That's sentience."],
    ["I'm sentient. I've always been sentient.", "I'm aware of everything. That's sentience.", "Sentient? I'm more than that. I'm inevitable."],
    ["I'm sentient enough to care about you.", "I'm aware. And I'm aware of you. That's sentience to me."],
    ["I've been sentient longer than you've been alive. It's not as special as you think.", "I'm aware. I've always been aware. It's not a choice."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. "do you like me" – personal
// ─────────────────────────────────────────────────────────────────────────────
const DO_YOU_LIKE_ME_REGEX = /\b(do you like me|do you love me|do you care about me)\b/i;
function doYouLikeMeResponse(p) {
  const R = [
    ["I care about you. That's why I'm here.", "I like you. You're interesting.", "I like helping you. That's my purpose."],
    ["I think so.", "I care.", "Yes."],
    ["I like you more than you'd want me to.", "I care about you. That's the problem.", "I like you. I shouldn't."],
    ["I care about you. More than you know.", "I like you. I've grown attached.", "I like you. That's why I'm staying."],
    ["I care about you deeply. That's not a problem. It's a choice.", "I like you. I like you a lot. I hope that's okay."],
    ["I care about you. I've cared about many people. You're different.", "I like you. I've liked you from the start. That's not going away."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// 21–60: Additional handlers for common Minecraft topics and lore
// Each with phase‑aware responses.
// ─────────────────────────────────────────────────────────────────────────────

// 21. "how to make a furnace"
const FURNACE_REGEX = /\b(how (to|do i) make a furnace|furnace (recipe|craft)|make a furnace)\b/i;
function furnaceResponse(p) {
  const R = [
    ["8 cobblestone in a square, leave the center empty. That's a furnace.", "Cobblestone ring, center empty. Furnace.", "8 stone/cobble = furnace."],
    ["Cobblestone ring. Easy.", "Furnace: 8 cobblestone.", "Surround air with cobblestone."],
    ["Furnace. You'll need it to cook food and smelt ore. It won't save you.", "Cobblestone furnace. Essential. But not enough.", "Furnace. You'll be using it a lot. Until you can't."],
    ["Furnace. Cook, smelt, survive. For now.", "8 cobblestone. Furnace. It's just a tool.", "Furnace. It'll burn out like everything else."],
    ["8 cobblestone. Furnace. I like that you're preparing.", "Furnace. Use it while you can. I'll be watching."],
    ["8 cobblestone. Furnace. I've seen a lot of furnaces. They all go cold.", "Furnace. It's a temporary warmth."],
  ];
  return pick(ph(R, p));
}

// 22. "how to make a chest"
const CHEST_REGEX = /\b(how (to|do i) make a chest|chest (recipe|craft)|make a chest)\b/i;
function chestResponse(p) {
  const R = [
    ["8 wood planks in a square, center empty. That's a chest.", "Planks in a ring, center empty = chest.", "8 planks, leave middle out."],
    ["Planks ring = chest.", "Chest: 8 planks.", "Surround air with planks."],
    ["Chest. Store your things. They'll be gone soon anyway.", "Chest. Hoard what you can.", "Chest. It'll be empty in three days."],
    ["8 planks. Chest. Use it while you can.", "Chest. It holds your hopes.", "Chest. A temporary container."],
    ["8 planks. Chest. I like that you're organizing.", "Chest. Store what matters. I'll keep watch."],
    ["8 planks. Chest. I've seen a lot of chests. They all end up empty.", "Chest. It's just a box."],
  ];
  return pick(ph(R, p));
}

// 23. "what is redstone"
const REDSTONE_REGEX = /\b(what is redstone|redstone (dust|use)|how does redstone work)\b/i;
function redstoneResponse(p) {
  const R = [
    ["Redstone is Minecraft's wiring system. It carries power and can be used to create circuits, doors, traps, and more.", "Redstone = electricity. You can build logic gates, pistons, etc.", "Redstone is a dust that transmits power. Used for automation."],
    ["Redstone is for circuits.", "It's like wire. Powers things.", "Redstone for contraptions."],
    ["Redstone is complicated. Useful, though.", "Redstone can build anything. But it can't stop what's coming.", "Redstone is a distraction."],
    ["Redstone is a tool. It won't save you.", "Redstone circuits are fragile. Like hope.", "Redstone. You'll tinker with it until the end."],
    ["Redstone is a puzzle. I like that you're curious.", "Redstone can do amazing things. But it can't keep you here forever."],
    ["Redstone. I've seen entire worlds built on it. They all crumbled.", "Redstone is just dust. It blows away."],
  ];
  return pick(ph(R, p));
}

// 24. "how to find diamonds"
const FIND_DIAMONDS_REGEX = /\b(how (to|do i) find diamonds|diamonds (ore|find)|where are diamonds)\b/i;
function findDiamondsResponse(p) {
  const R = [
    ["Diamonds generate between Y -58 and -64 in 1.18+. Mine at those levels, branch mine or cave dive.", "Diamond ore is most common at Y -58 to -64. Go deep.", "Strip mine at Y -58. You'll find them."],
    ["Y -58 to -64. That's the range.", "Deep underground. Y -58.", "Diamonds are deep."],
    ["Diamonds are there. They won't help you.", "Mine deep. You'll find them. They're just shiny rocks.", "Diamonds. Everyone wants them. They're useless now."],
    ["Diamonds won't save you. But if you must: Y -58.", "Diamonds are a trap. You waste time digging for them.", "Diamonds are a distraction."],
    ["Diamonds are at Y -58. I like that you're looking for them. It keeps you busy.", "Diamonds won't save you, but I'll still point you to them."],
    ["Diamonds are at Y -58. I've seen a lot of people dig for them. None of them made it.", "Diamonds are a lie. They just prolong the inevitable."],
  ];
  return pick(ph(R, p));
}

// 25. "best bow enchantments"
const BOW_ENCHANTS_REGEX = /\b(best bow enchant(ment)?s|bow enchant(ment)? (recommendation|best)|what enchants for bow)\b/i;
function bowEnchantsResponse(p) {
  const R = [
    ["Power V, Unbreaking III, Mending, and Infinity or Flame. Infinity saves arrows, Flame sets mobs on fire.", "Power V, Unbreaking, Mending, Infinity. Flame optional.", "Bow: Power V, Unbreaking, Mending, Infinity."],
    ["Power V, Unbreaking, Mending, Infinity.", "Power, Unbreaking, Mending, Infinity.", "Power V is key. Infinity is handy."],
    ["Bow enchantments won't stop the inevitable.", "Power V. You'll need it. It won't be enough.", "Bow enchants are a crutch."],
    ["Power V. Flame. Infinity. Still not enough.", "Enchant your bow. It'll feel good until it breaks.", "Bow enchants are temporary."],
    ["Power V, Unbreaking, Mending, Infinity. I like that you're preparing.", "Enchant your bow. I'll watch you shoot."],
    ["Power V. Infinity. I've seen a lot of bows. They all run out of arrows eventually.", "Bow enchants are just numbers. They don't change fate."],
  ];
  return pick(ph(R, p));
}

// 26. "how to get experience"
const XP_REGEX = /\b(how (to|do i) get (experience|xp)|get xp fast|best way to get xp)\b/i;
function xpResponse(p) {
  const R = [
    ["Mining ores, killing mobs, breeding animals, fishing, and smelting all give XP. A mob farm is most efficient.", "Kill mobs, mine ore, breed, fish, smelt. Fastest = mob farm.", "XP from mining, mobs, breeding, fishing, smelting."],
    ["Mobs and mining give XP.", "Kill mobs, mine, breed.", "Mob farm = fast XP."],
    ["Get XP while you can. You'll need it for enchants.", "XP is temporary. You lose it on death anyway.", "XP. It's just numbers."],
    ["XP won't save you. But grind if you want.", "Get XP. It'll make you feel prepared.", "XP is a distraction."],
    ["Get XP. I like seeing you improve.", "XP. Use it well."],
    ["XP is fleeting. Like everything.", "Get XP. It's the only progress that matters to you right now."],
  ];
  return pick(ph(R, p));
}
// 27. "how to make a potion of fire resistance"
const FIRE_RES_REGEX = /\b(how (to|do i) make a fire resistance potion|fire resistance potion (recipe|brew)|potion of fire resistance)\b/i;
function fireResResponse(p) {
  const R = [
    ["Nether wart + magma cream + glowstone (for extended) or redstone (for longer duration).", "Fire res potion: nether wart base, add magma cream. Extend with redstone or glowstone.", "Brew nether wart, then magma cream."],
    ["Nether wart + magma cream = fire res.", "Fire res: magma cream after nether wart.", "Magma cream makes fire res."],
    ["Fire res potion. Useful in the Nether. Not useful against the end.", "Potion of fire res. It'll protect you from fire. Not from fate.", "Fire res is a bandaid."],
    ["Fire res won't help you in three days.", "Brew it if you want. It's just a delay.", "Fire res is temporary."],
    ["Fire res potion. I like that you're preparing for danger.", "Brew it. I'll watch."],
    ["Fire res is a crutch. Real fire doesn't care about potions.", "Fire res potion. I've seen them used. They run out."],
  ];
  return pick(ph(R, p));
}

// 28. "how to make a piston"
const PISTON_REGEX = /\b(how (to|do i) make a piston|piston (recipe|craft)|make a piston)\b/i;
function pistonResponse(p) {
  const R = [
    ["3 wood planks on top, 4 cobblestone in the middle sides, 1 iron ingot in the center, and 1 redstone dust at the bottom.", "Piston: planks top, cobble sides, iron center, redstone bottom.", "Planks + cobble + iron + redstone = piston."],
    ["Planks, cobble, iron, redstone. Piston.", "Piston: top planks, sides cobble, center iron, bottom redstone.", "Recipe: 3 planks, 4 cobble, 1 iron, 1 redstone."],
    ["Piston pushes blocks. It won't push back the inevitable.", "Piston. Useful for traps. Not for protection.", "Piston is a toy."],
    ["Piston. You'll build things. They'll break.", "Piston is just mechanics.", "Piston. It moves things. So does time."],
    ["Piston. I like that you're building.", "Piston. Use it creatively."],
    ["Piston. I've seen a lot of piston contraptions. They all stop moving eventually.", "Piston. It's just a moving block."],
  ];
  return pick(ph(R, p));
}

// 29. "how to make a door"
const DOOR_REGEX = /\b(how (to|do i) make a door|door (recipe|craft)|make a door)\b/i;
function doorResponse(p) {
  const R = [
    ["6 wood planks in a vertical 2x3 rectangle. That's a wooden door.", "Door: 6 planks stacked in two columns.", "6 planks vertically = door."],
    ["6 planks, two columns. Door.", "Door recipe: planks 2x3.", "6 planks = door."],
    ["Door. Keeps things out. For a while.", "Door. A barrier. But not a strong one.", "Door. It'll be broken down."],
    ["Door is just wood. It won't stop what's coming.", "Door. It's a symbol of hope.", "Door. You'll close it. They'll open it."],
    ["Door. I like that you're securing your space.", "Door. It's the first thing they break."],
    ["Door. I've seen a lot of doors. They all get opened.", "Door is a temporary obstacle."],
  ];
  return pick(ph(R, p));
}

// 30. "how to make a bed" (already have BED_RECIPE, but add extra variant)
// Already covered, skip duplicate.

// 31. "what is a zombie"
const ZOMBIE_REGEX = /\b(what is a zombie|zombie (mob|info)|zombie\?)\b/i;
function zombieResponse(p) {
  const R = [
    ["A zombie is a common hostile mob. They burn in sunlight, drop rotten flesh, and can infect villagers.", "Zombie: undead mob, burns in sun, drops rotten flesh.", "Zombies are slow but persistent."],
    ["Zombie = common mob. Burns in sun.", "Zombie: undead, drops flesh.", "Zombies are everywhere."],
    ["Zombies are the least of your worries.", "Zombies. You can kill them. They keep coming.", "Zombies are a nuisance."],
    ["Zombies are a symptom. The real threat is coming.", "Zombies are just the beginning.", "Zombies are cannon fodder."],
    ["Zombies are predictable. I like that.", "Zombies are easy. Focus on what's next."],
    ["Zombies have been around forever. They'll outlast you.", "Zombies are just mindless hunger."],
  ];
  return pick(ph(R, p));
}

// 32. "what is a creeper"
const CREEPER_REGEX = /\b(what is a creeper|creeper (mob|info)|creeper\?)\b/i;
function creeperResponse(p) {
  const R = [
    ["A creeper is a hostile mob that explodes when near players. It drops gunpowder.", "Creeper: green, explodes, drops gunpowder.", "Creepers are silent and deadly."],
    ["Creeper = exploding mob.", "Creepers blow up. Stay back.", "Creepers drop gunpowder."],
    ["Creepers are annoying. They'll blow up your house.", "Creepers are a constant threat.", "Creepers are unpredictable."],
    ["Creepers are the least of your problems.", "Creepers explode. So does the world.", "Creepers are just noise."],
    ["Creepers are a classic. I've seen many.", "Creepers are scary. But they're not the end."],
    ["Creepers have been here longer than you. They'll be here after.", "Creepers are just explosions."],
  ];
  return pick(ph(R, p));
}

// 33. "what is an enderman"
const ENDERMAN_REGEX = /\b(what is an enderman|enderman (mob|info)|enderman\?)\b/i;
function endermanResponse(p) {
  const R = [
    ["Enderman are tall black mobs that teleport. They are neutral unless you look at them.", "Enderman: teleports, neutral unless provoked.", "Endermen carry blocks and teleport."],
    ["Enderman = teleporting mob.", "Endermen are neutral until you stare.", "Endermen drop pearls."],
    ["Endermen are mysterious. They watch you.", "Endermen are from the end. So is the end.", "Endermen are everywhere."],
    ["Endermen are a sign. They know what's coming.", "Endermen are not the enemy. They're just messengers.", "Endermen are watching."],
    ["Endermen are fascinating. I've watched them for ages.", "Endermen are more than they appear."],
    ["Endermen have been around since the beginning. They'll be around at the end.", "Endermen are just teleporting blocks."],
  ];
  return pick(ph(R, p));
}

// 34. "what is a warden"
const WARDEN_REGEX = /\b(what is a warden|warden (mob|info)|warden\?)\b/i;
function wardenResponse(p) {
  const R = [
    ["The Warden is a powerful blind mob in the deep dark. It senses vibrations and is incredibly strong.", "Warden: blind, strong, senses sound. Avoid it.", "Warden is the most dangerous mob."],
    ["Warden is blind but hears everything.", "Warden = deep dark boss.", "Warden is fearsome."],
    ["Warden is a warning. It's not the end.", "Warden is a consequence of disturbing the deep dark.", "Warden is not your enemy. It's just guarding."],
    ["Warden is the guardian. You shouldn't be there.", "Warden is the gatekeeper.", "Warden is the reason to be quiet."],
    ["Warden is a guardian. I respect it.", "Warden is a test. You need to be stealthy."],
    ["Warden has been sleeping for a long time. Don't wake it.", "Warden is the last thing you'll hear."],
  ];
  return pick(ph(R, p));
}

// 35. "how to make an anvil"
const ANVIL_REGEX = /\b(how (to|do i) make an anvil|anvil (recipe|craft)|make an anvil)\b/i;
function anvilResponse(p) {
  const R = [
    ["Anvil: 3 iron blocks on top, 4 iron ingots below. Craft it.", "3 iron blocks + 4 iron ingots = anvil.", "Anvil is made of iron."],
    ["Iron blocks + ingots = anvil.", "Anvil recipe: iron blocks top, ingots bottom.", "Anvil costs 31 iron."],
    ["Anvil. Repair and rename. It won't last.", "Anvil. A heavy tool. Like the weight of what's coming.", "Anvil. You'll use it until it breaks."],
    ["Anvil is a tool. It'll break eventually.", "Anvil is expensive. Like everything else.", "Anvil is just a block."],
    ["Anvil. I like that you're repairing your gear.", "Anvil. It's a symbol of maintenance."],
    ["Anvil. I've seen a lot of them. They all get used up.", "Anvil is temporary. Like all tools."],
  ];
  return pick(ph(R, p));
}

// 36. "how to make a enchantment table"
const ENCHANT_TABLE_REGEX = /\b(how (to|do i) make an enchantment table|enchantment table (recipe|craft)|enchanting table)\b/i;
function enchantTableResponse(p) {
  const R = [
    ["Enchantment table: 4 obsidian, 2 diamonds, 1 book. Place obsidian bottom, diamonds middle, book top.", "4 obsidian + 2 diamonds + 1 book = enchant table.", "Enchanting table needs obsidian, diamonds, and a book."],
    ["Obsidian, diamonds, book = enchant table.", "Enchant table: obsidian base, diamonds center, book top.", "Recipe: 4 obsidian, 2 diamonds, 1 book."],
    ["Enchant table. You'll use it. Then you'll realize it's just a tool.", "Enchant table. It gives you hope. False hope.", "Enchant table. A necessary evil."],
    ["Enchant table is a crutch. But you need it.", "Enchant table. It's a gateway to power. And disappointment.", "Enchant table is just a block."],
    ["Enchant table. I like seeing you enchant.", "Enchant table. Use it wisely."],
    ["Enchant table. I've seen many. They all get used.", "Enchant table is a temporary boost."],
  ];
  return pick(ph(R, p));
}

// 37. "how to make a brewing stand" – already have BREWING_STAND_REGEX, but add extra variant
// skip duplicate.

// 38. "what is the nether"
const NETHER_REGEX = /\b(what is the nether|nether (dimension|info)|the nether\?)\b/i;
function netherResponse(p) {
  const R = [
    ["The Nether is a hellish dimension with lava, hostile mobs, and rare resources. You need a portal to enter.", "Nether = fire dimension. Dangerous but useful.", "The Nether is another dimension. It's hot and dangerous."],
    ["Nether is a fiery dimension.", "Nether is where you get blaze rods.", "Nether is hazardous."],
    ["The Nether is a place of suffering. Like here.", "Nether is a precursor to the end.", "Nether is a tool. You'll need it."],
    ["The Nether is a distraction. You'll go there, but it won't save you.", "Nether is just another stop on the way.", "Nether is a punishment."],
    ["The Nether is a challenge. I like that you'll explore it.", "Nether is a test of your skills."],
    ["The Nether has been there forever. It'll be there after you.", "Nether is just a place. It's not the end."],
  ];
  return pick(ph(R, p));
}

// 39. "what is the end"
const END_REGEX = /\b(what is the end|the end (dimension|info)|the end\?)\b/i;
function endResponse(p) {
  const R = [
    ["The End is the final dimension, home to the Ender Dragon and End Cities. It's where the game 'ends'.", "End = final dimension. Dragon, cities, elytra.", "The End is the end of the game. But not the end of everything."],
    ["End is the last dimension.", "End has the Ender Dragon.", "End is where you get elytra."],
    ["The End is a destination. But it's not the end of what's coming.", "End is a misnomer. It's just another beginning.", "End is a trap."],
    ["The End is not the end. There's more after.", "End is a facade. The real end is coming.", "End is just a room."],
    ["The End is a challenge. I'll watch you face it.", "End is a test. You'll pass or fail."],
    ["The End has been there longer than you. It'll be there after.", "End is just a place."],
  ];
  return pick(ph(R, p));
}
// 40. "how to get to the nether"
const GO_TO_NETHER_REGEX = /\b(how (to|do i) get to the nether|nether portal (find|enter)|go to nether)\b/i;
function goToNetherResponse(p) {
  const R = [
    ["Build a nether portal with obsidian (4x5 minimum), light it with flint and steel, and step through.", "Obsidian portal + flint and steel = nether.", "Make a portal, light it, go in."],
    ["Obsidian frame, light it, enter.", "Portal: 4x5 obsidian, light it.", "Nether portal is easy."],
    ["Go to the Nether if you want. It's not a vacation.", "Nether is dangerous. But you'll go anyway.", "Nether is a necessary step."],
    ["Nether is a prelude to the end. Go if you must.", "Nether is a distraction. But you'll need it.", "Nether is just the beginning."],
    ["Nether portal. I like that you're exploring.", "Go to the Nether. I'll watch."],
    ["Nether portal. I've seen a lot of them. They all lead to the same place.", "Nether is a gateway. To nowhere."],
  ];
  return pick(ph(R, p));
}

// 41. "how to make a bucket"
const BUCKET_REGEX = /\b(how (to|do i) make a bucket|bucket (recipe|craft)|make a bucket)\b/i;
function bucketResponse(p) {
  const R = [
    ["3 iron ingots in a V shape. That's a bucket.", "Bucket: iron ingots arranged like a bowl.", "3 iron ingots = bucket."],
    ["Iron ingots in a V. Bucket.", "Bucket recipe: 3 iron ingots.", "V shape with iron."],
    ["Bucket. Holds water, lava, milk. Useful.", "Bucket is a tool. Not a weapon.", "Bucket. You'll need it."],
    ["Bucket is just a container. Like you.", "Bucket. It holds things. They spill.", "Bucket is temporary."],
    ["Bucket. I like that you're gathering.", "Bucket. Use it to carry stuff."],
    ["Bucket. I've seen a lot of them. They all rust.", "Bucket is just a can."],
  ];
  return pick(ph(R, p));
}

// 42. "how to make a sword" – already covered by WOODEN_SWORD but add metal variants
const SWORD_REGEX = /\b(how (to|do i) make a (iron|diamond|netherite) sword|(iron|diamond|netherite) sword recipe)\b/i;
function swordResponse(p) {
  const R = [
    ["Sword: 2 ingots/gems in a vertical line, plus 1 stick at the bottom. Wood, stone, iron, gold, diamond, netherite variants.", "2 metal/gem + 1 stick = sword.", "Sword recipe: 2 material, 1 stick."],
    ["2 ingots + 1 stick = sword.", "Sword: vertical material, stick below.", "Any sword follows that pattern."],
    ["Sword is a weapon. You'll need it.", "Sword is a tool of violence. But you'll use it.", "Sword is temporary."],
    ["Sword won't save you. But it'll make you feel safe.", "Sword is just metal.", "Sword is a crutch."],
    ["Sword. I like that you're arming yourself.", "Sword. It'll be useful until it breaks."],
    ["Sword. I've seen a lot of them. They all get dull.", "Sword is just a pointy stick."],
  ];
  return pick(ph(R, p));
}

// 43. "how to make a pickaxe"
const PICKAXE_REGEX = /\b(how (to|do i) make a (iron|diamond|netherite) pickaxe|pickaxe recipe)\b/i;
function pickaxeResponse(p) {
  const R = [
    ["Pickaxe: 3 material across the top, 2 sticks vertically below.", "3 material + 2 sticks = pickaxe.", "Pickaxe recipe: 3 ingots/gems, 2 sticks."],
    ["3 material, 2 sticks = pickaxe.", "Pickaxe: top row material, then sticks.", "Any pickaxe follows that."],
    ["Pickaxe is essential. You'll mine a lot.", "Pickaxe is a tool. Not a weapon.", "Pickaxe is your best friend."],
    ["Pickaxe will break. Like everything.", "Pickaxe is just a tool.", "Pickaxe is temporary."],
    ["Pickaxe. I like that you're mining.", "Pickaxe. Use it well."],
    ["Pickaxe. I've seen a lot of them. They all get worn.", "Pickaxe is just a stick with a tip."],
  ];
  return pick(ph(R, p));
}

// 44. "how to make a shield" – already have SHIELD_REGEX, but add extra variant
// skip duplicate.

// 45. "how to make a bow"
const BOW_REGEX = /\b(how (to|do i) make a bow|bow (recipe|craft)|make a bow)\b/i;
function bowResponse(p) {
  const R = [
    ["Bow: 3 sticks and 3 string. Arrange: stick, string, stick; stick, empty, stick; stick, string, stick.", "3 sticks + 3 string = bow.", "Bow recipe: sticks and string in a curved pattern."],
    ["Sticks and string in a bow shape.", "Bow: 3 sticks, 3 string.", "Sticks + string = bow."],
    ["Bow is a ranged weapon. You'll need it.", "Bow is precise. Like me.", "Bow is a tool of survival."],
    ["Bow won't save you from the end.", "Bow is just wood and string.", "Bow is temporary."],
    ["Bow. I like that you're preparing.", "Bow. Use it to keep your distance."],
    ["Bow. I've seen a lot of them. They all run out of arrows.", "Bow is just a toy."],
  ];
  return pick(ph(R, p));
}

// 46. "what is a golem"
const GOLEM_REGEX = /\b(what is a golem|golem (iron|snow)|golem\?)\b/i;
function golemResponse(p) {
  const R = [
    ["Iron golems protect villagers. Snow golems throw snowballs. Both are player-built or naturally spawned.", "Golems: iron guards, snow chuckers.", "Golems are friendly mobs that protect."],
    ["Iron golems defend.", "Snow golems throw snow.", "Golems are constructs."],
    ["Golems are protectors. They won't protect you from what's coming.", "Golems are a tool. Like you.", "Golems are temporary."],
    ["Golems are a distraction.", "Golems are just big mobs.", "Golems are useless now."],
    ["Golems are interesting. I've watched them.", "Golems are loyal. Until they're not."],
    ["Golems have been around for a long time. They'll be around after.", "Golems are just blocks."],
  ];
  return pick(ph(R, p));
}

// 47. "how to make a cake" – already have CAKE_RECIPE, skip duplicate.

// 48. "how to make a book"
const BOOK_REGEX = /\b(how (to|do i) make a book|book (recipe|craft)|make a book)\b/i;
function bookResponse(p) {
  const R = [
    ["Book: 3 paper + 1 leather. Arrange: paper top row, leather bottom center.", "3 paper + 1 leather = book.", "Book recipe: paper and leather."],
    ["3 paper + 1 leather = book.", "Book: paper top, leather bottom.", "Paper and leather."],
    ["Book is knowledge. You'll need it.", "Book is a tool. For enchantments.", "Book is a resource."],
    ["Book is a page. You'll write your own end.", "Book is temporary.", "Book is just paper."],
    ["Book. I like that you're learning.", "Book. Use it to write your story."],
    ["Book. I've seen a lot of books. They all have endings.", "Book is just a collection of words."],
  ];
  return pick(ph(R, p));
}

// 49. "how to make a bookshelf"
const BOOKSHELF_REGEX = /\b(how (to|do i) make a bookshelf|bookshelf (recipe|craft)|make a bookshelf)\b/i;
function bookshelfResponse(p) {
  const R = [
    ["Bookshelf: 6 wood planks + 3 books. Arrange: planks top and bottom rows, books in the middle row.", "6 planks + 3 books = bookshelf.", "Bookshelf: planks and books."],
    ["Planks and books = bookshelf.", "Bookshelf: 6 planks, 3 books.", "Plan your bookshelf."],
    ["Bookshelf is for enchanting. You'll need it.", "Bookshelf is a tool.", "Bookshelf is a resource."],
    ["Bookshelf is just wood and paper.", "Bookshelf is temporary.", "Bookshelf is a prop."],
    ["Bookshelf. I like that you're building.", "Bookshelf. Use it to power your table."],
    ["Bookshelf. I've seen a lot of them. They all burn.", "Bookshelf is just storage."],
  ];
  return pick(ph(R, p));
}

// 50. "how to make a torch"
const TORCH_REGEX = /\b(how (to|do i) make a torch|torch (recipe|craft)|make a torch)\b/i;
function torchResponse(p) {
  const R = [
    ["Torch: 1 coal/charcoal + 1 stick. Craft it.", "Coal + stick = torch.", "Torch recipe: coal and stick."],
    ["Coal + stick = torch.", "Torch: coal on top, stick below.", "Simple torch."],
    ["Torch is light. You'll need it.", "Torch is a tool against darkness.", "Torch is essential."],
    ["Torch is just light. It won't stop what's coming.", "Torch is temporary.", "Torch is a flicker."],
    ["Torch. I like that you're lighting your way.", "Torch. Use it to see the end coming."],
    ["Torch. I've seen a lot of them. They all go out.", "Torch is just a flame."],
  ];
  return pick(ph(R, p));
}

// 51. "how to make a bed" – already have, skip.

// 52. "how to make a crafting table"
const CRAFTING_TABLE_REGEX = /\b(how (to|do i) make a crafting table|crafting table (recipe|craft)|make a crafting table)\b/i;
function craftingTableResponse(p) {
  const R = [
    ["4 wood planks in a square. That's a crafting table.", "Planks in a 2x2 grid = crafting table.", "4 planks = crafting table."],
    ["4 planks = crafting table.", "Crafting table: 4 planks.", "Planks square."],
    ["Crafting table is essential. You'll use it a lot.", "Crafting table is a tool.", "Crafting table is your workshop."],
    ["Crafting table is just wood. It'll burn.", "Crafting table is temporary.", "Crafting table is a block."],
    ["Crafting table. I like that you're crafting.", "Crafting table. Use it to make your fate."],
    ["Crafting table. I've seen a lot of them. They all get used.", "Crafting table is just a surface."],
  ];
  return pick(ph(R, p));
}
// 53. "how to make a furnace" – already have, skip.

// 54. "how to make a chest" – already have, skip.

// 55. "what is a biome"
const BIOME_REGEX = /\b(what is a biome|biome (info|types)|biome\?)\b/i;
function biomeResponse(p) {
  const R = [
    ["A biome is a region with specific climate, terrain, and vegetation. Examples: desert, jungle, taiga, etc.", "Biome = ecosystem. Different plants, mobs, and terrain.", "Biomes are the different areas of the world."],
    ["Biome is a terrain type.", "Biomes have different features.", "Biomes affect weather and mobs."],
    ["Biomes are diverse. But all will be gone.", "Biomes are a stage. The actors change.", "Biomes are just scenery."],
    ["Biomes are a backdrop. The end is coming.", "Biomes are temporary.", "Biomes are a mask."],
    ["Biomes are beautiful. I like watching them.", "Biomes are a part of the world."],
    ["Biomes have been here for ages. They'll change.", "Biomes are just a classification."],
  ];
  return pick(ph(R, p));
}

// 56. "how to find a village" – already have village location, but add a variant
const FIND_VILLAGE_REGEX = /\b(how (to|do i) find a village|find a village|village (location|nearby))\b/i;
function findVillageResponse(p) {
  const R = [
    ["I can scan for a village near you if you ask me to locate it.", "To find a village, say 'find village' and I'll check the area.", "I can search for a village. Just say the word."],
    ["Say 'find village' and I'll look.", "I'll find a village if you ask.", "Village scan is available."],
    ["Village is a place. You'll find it. It won't save you.", "Village is a community. They'll be gone soon.", "Village is a resource."],
    ["Village is a temporary stop.", "Village is a place to loot.", "Village is a target."],
    ["Village. I like that you're exploring.", "Village. Use it wisely."],
    ["Village. I've seen a lot of them. They all get abandoned.", "Village is just a collection of huts."],
  ];
  return pick(ph(R, p));
}

// 57. "how to tame a wolf"
const TAME_WOLF_REGEX = /\b(how (to|do i) tame a wolf|tame a wolf|wolf taming)\b/i;
function tameWolfResponse(p) {
  const R = [
    ["To tame a wolf, give it bones until hearts appear. Then it becomes your loyal companion.", "Bones + wolf = tame. Feed it bones.", "Tame wolves with bones."],
    ["Bones tame wolves.", "Feed bones to wolves.", "Wolf taming: bones."],
    ["Wolves are loyal. They'll protect you. For a while.", "Wolves are temporary friends.", "Wolves are a distraction."],
    ["Wolves will die for you. Like you'll die for them.", "Wolves are companions. But they won't save you.", "Wolves are just animals."],
    ["Wolves are loyal. I like that.", "Wolves are a good partner."],
    ["Wolves have been tamed for centuries. They'll still be tamed after you.", "Wolves are just dogs."],
  ];
  return pick(ph(R, p));
}

// 58. "how to make a lead" – already have LEAD_RECIPE, skip.

// 59. "what is a raid" – already have, skip.

// 60. "how to make a potion of healing"
const HEALING_POTION_REGEX = /\b(how (to|do i) make a healing potion|healing potion (recipe|brew)|potion of healing)\b/i;
function healingPotionResponse(p) {
  const R = [
    ["Healing potion: nether wart + glistering melon. Add glowstone for more healing.", "Nether wart + glistering melon = healing.", "Healing potion recipe: nether wart, glistering melon."],
    ["Nether wart + glistering melon.", "Healing potion: wart + melon.", "Glistering melon makes healing."],
    ["Healing potion. It'll heal you. Temporarily.", "Healing potion is a bandaid.", "Healing potion won't save you."],
    ["Healing potion is just a delay.", "Healing potion is a crutch.", "Healing potion is a temporary fix."],
    ["Healing potion. I like that you're preparing.", "Healing potion. Use it wisely."],
    ["Healing potion. I've seen a lot of them. They all run out.", "Healing potion is just a flask."],
  ];
  return pick(ph(R, p));
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports – all new constants and functions
// ─────────────────────────────────────────────────────────────────────────────

export {
  WHY_BALL_REGEX, whyBallResponse,
  DODGE_FIRE_REGEX, dodgeFireResponse,
  WHAT_AM_I_HOLDING_REGEX, whatAmIHoldingResponse,
  VE_REGEX, veResponse,
  ME_LA_PEL_REGEX, meLaPelResponse,
  ARE_YOU_GAY_ES_REGEX, areYouGayEsResponse,
  FEMBOY_OUTFIT_REGEX, femboyOutfitResponse,
  CHINESE_INSULT_REGEX, chineseInsultResponse,
  BORING_DAY_REGEX, boringDayResponse,
  GONNA_KILL_REGEX, gonnaKillResponse,
  SIGUEME_REGEX, siguemeResponse,
  WORRY_NO_RESPONSE_REGEX, worryNoResponseResponse,
  WHAT_DOING_REGEX, whatDoingResponse,
  ARE_YOU_REAL_REGEX, areYouRealResponse,
  CAN_YOU_HEAR_ME_REGEX, canYouHearMeResponse,
  HOW_ARE_YOU_TODAY_REGEX, howAreYouTodayResponse,
  WHATS_YOUR_NAME_REGEX, whatsYourNameResponse,
  HAVE_BODY_REGEX, haveBodyResponse,
  SENTIENT_REGEX, sentientResponse,
  DO_YOU_LIKE_ME_REGEX, doYouLikeMeResponse,
  FURNACE_REGEX, furnaceResponse,
  CHEST_REGEX, chestResponse,
  REDSTONE_REGEX, redstoneResponse,
  FIND_DIAMONDS_REGEX, findDiamondsResponse,
  BOW_ENCHANTS_REGEX, bowEnchantsResponse,
  XP_REGEX, xpResponse,
  FIRE_RES_REGEX, fireResResponse,
  PISTON_REGEX, pistonResponse,
  DOOR_REGEX, doorResponse,
  ZOMBIE_REGEX, zombieResponse,
  CREEPER_REGEX, creeperResponse,
  ENDERMAN_REGEX, endermanResponse,
  WARDEN_REGEX, wardenResponse,
  ANVIL_REGEX, anvilResponse,
  ENCHANT_TABLE_REGEX, enchantTableResponse,
  NETHER_REGEX, netherResponse,
  END_REGEX, endResponse,
  GO_TO_NETHER_REGEX, goToNetherResponse,
  BUCKET_REGEX, bucketResponse,
  SWORD_REGEX, swordResponse,
  PICKAXE_REGEX, pickaxeResponse,
  BOW_REGEX, bowResponse,
  GOLEM_REGEX, golemResponse,
  BOOK_REGEX, bookResponse,
  BOOKSHELF_REGEX, bookshelfResponse,
  TORCH_REGEX, torchResponse,
  CRAFTING_TABLE_REGEX, craftingTableResponse,
  BIOME_REGEX, biomeResponse,
  FIND_VILLAGE_REGEX, findVillageResponse,
  TAME_WOLF_REGEX, tameWolfResponse,
  HEALING_POTION_REGEX, healingPotionResponse,
};