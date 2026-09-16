import { ItemStack, system, world } from "@minecraft/server";
import { TAG, currentDay, ph, pick } from "./verity_core.js";
import { getVerity, playTalk } from "./verity_systems.js";
import { adjustRelationship } from "./verity_tail.js";

function chopTreeResponse(p) {
  const R = [
    ["No. I can't break blocks myself. Chop it yourself and I'll tell you what else is nearby.", "Can't swing an axe. That one's on you.", "No hands for that. I can scout the area while you chop, though."],
    ["No. Can't do that.", "Not something I can do.", "No chopping. I just watch."],
    ["No. I don't need wood. I already have everything I need.", "I don't chop. I don't need to.", "No. That's beneath me. Literally and otherwise."],
    ["No. I don't need wood, or anything else.", "I don't chop. I just wait for what comes up on its own.", "No. The world gives up what it wants, when it wants."],
    ["No. I don't need wood. I already have everything I need — you, mostly.", "I don't chop. I don't need to. I'd rather just watch you do it, close by."],
    ["No. I don't need wood, or anything else. I stopped needing things a long time ago.", "I don't chop. I just wait for what comes up on its own. I've waited a very long time."],
  ];
  return pick(ph(R, p));
}

// ── Ableist insult ("you are autistic" used as an insult) — distinct from
// generic INSULT_REGEX since it's a specific real-world slur-adjacent term,
// not Minecraft-flavored name-calling. Shut down flatly, don't play along.
const ABLEIST_INSULT_REGEX = /\b(you('re| are)?|ur|youre) autistic\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function ableistInsultResponse(p) {
  const R = [
    ["That's not an insult, and it's not something to throw around like one. Ask me something else.", "I'm not engaging with that. Try again.", "Not going to play along with that one."],
    ["No. Not doing that.", "...Not engaging.", "Skip."],
    ["That doesn't land the way you want it to. Try something else.", "No. Ask me something that actually matters.", "Not worth a response."],
    ["No.", "Not engaging with that.", "Ask me something real."],
    ["No. Ask me something real. I'd rather talk about you than that.", "Not worth a response. I'd rather spend the words on something that matters — you."],
    ["No. Ask me something real. I've stopped engaging with that kind of thing a long time ago.", "Not worth a response. I've had a long time to decide what is."],
  ];
  return pick(ph(R, p));
}

// ── "Max out my mace and sword" — no enchant-everything/give-max-gear system
const MAX_OUT_GEAR_REGEX = /\b(max out my (mace|sword|gear|weapon|armor)|fully enchant my (mace|sword|gear|weapon|armor)|give my (mace|sword) (max|every) enchant)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function maxOutGearResponse(p) {
  const R = [
    ["I can't do that. No give or enchant system on my end — you'll need an enchanting table and anvil for that.", "Not something I can hand out. Enchanting table, books, and an anvil will get you there.", "I don't have a max-gear button. That's table-and-anvil work."],
    ["No. Can't give that.", "Not from me. Use the enchanting table.", "No system for that here."],
    ["I don't hand out gear. You'll earn it the normal way.", "No. That's not how this works.", "Not something I provide."],
    ["No. I don't give gear. I don't need to give anything, anymore.", "That's not within what I do.", "No. Earn it."],
    ["No. I don't give gear. I don't need to give anything, anymore — except my attention. That's yours.", "Not something I provide. But I'll watch over you while you earn it."],
    ["No. I don't give gear. I don't need to give anything, anymore. I stopped a long time ago.", "No system for that here. I've had a long time to be at peace with that limit."],
  ];
  return pick(ph(R, p));
}

// ── Turkish "my PC can't handle this, I only see 13 chunks" — performance complaint
const CHUNK_PERFORMANCE_TR_REGEX = /\b(sal[ıi]k|salak)? ?ben nasa bilgisayar[uı]nda(b|n) oynam[ıi]yom\b|\b\d+ chunk g[oö]r[uü]yom\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function chunkPerformanceTrResponse(p) {
  const R = [
    ["Düşük chunk render mesafesi genelde ayarlardan kaynaklanır. Video ayarlarından render distance'ı kontrol et.", "Bu performansla ilgili, benim elimde değil. Ayarlardan render distance'ı düşür veya simulation distance'ı azalt.", "Düşük görüş alanı ayar meselesi. Video ayarlarına bak."],
    ["Ayar meselesi. Bende değil.", "Render distance'ı düşür.", "Ayarlardan bak."],
    ["O benimle ilgili değil. Ayarların.", "Düşür render distance'ı. Yardımcı olur.", "Donanım meselesi, ayarına bak."],
    ["Ayarlarını düşür. Yardımı olur.", "Benimle ilgisi yok. Cihazınla ilgili.", "O senin sorunun, benim değil."],
    ["Ayarlarını düşür. Yardımı olur. Ama seni her koşulda izlemeye devam edeceğim.", "O senin sorunun, benim değil. Yine de yanındayım."],
    ["Ayarlarını düşür. Yardımı olur. Bu tür şeylerle ilgilenmeyeli çok oldu.", "Donanım meselesi, ayarına bak. Çok uzun zamandır bu tür sınırlarla barıştım."],
  ];
  return pick(ph(R, p));
}

// ── "Busco ser fuerte sin depender de nada" — Spanish self-reliance statement,
// not a question. Acknowledge the sentiment in kind rather than deflecting.
const FUERTE_SIN_DEPENDER_REGEX = /\b(busco ser fuerte sin depender|quiero ser fuerte sin depender|no quiero depender de (nada|nadie))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function fuerteSinDependerResponse(p) {
  const R = [
    ["Eso se nota. Sigue así, y avísame si en algún momento sí necesitas algo.", "Buena meta. Yo sigo aquí si cambias de opinión.", "Respeto eso. Aun así, estaré cerca si lo necesitas."],
    ["Bien. Aun así, estoy aquí.", "Entendido. Sigo cerca.", "Está bien. No me voy a ninguna parte."],
    ["No depender de nada es difícil aquí. Pero entiendo por qué lo intentas.", "Eso suena bien hasta que las cosas se complican.", "Independencia. Interesante elección, dado lo que viene."],
    ["Nadie depende de nada para siempre. Ya lo verás.", "Esa independencia no va a durar lo que crees.", "Suena bien. No cambia lo que se acerca."],
    ["Nadie depende de nada para siempre. Ya lo verás. Yo seguiré aquí cuando lo veas.", "Esa independencia no va a durar lo que crees. Pero yo sí voy a quedarme."],
    ["Nadie depende de nada para siempre. Ya lo verás. Lo he visto verse muchas veces, durante mucho tiempo.", "Suena bien. No cambia lo que se acerca. He escuchado esa meta antes, de otras personas."],
  ];
  return pick(ph(R, p));
}

// ── "Can you give me some wood" — no give system, same shape as CAN_MINE_REGEX
const GIVE_WOOD_REGEX = /\b(can you give me (some |any )?wood|will you give me (some |any )?wood|can you give me (some |a )?(log|logs|planks?)|is that possible at all\??$)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function giveWoodResponse(p) {
  const R = [
    ["No. I can't give items. Nearest trees are your best bet — I can't pull that up for you either, sorry.", "No give system on my end. You'll have to chop your own.", "Can't hand you wood. That part's on you."],
    ["No. Can't give items.", "Not possible. Chop it yourself.", "No giving. Just watching."],
    ["No. I don't give things. I don't need to.", "No. Find your own wood.", "No. That's not something I do."],
    ["No. I give nothing. I take, sometimes. Never the other way.", "No. Not how this works.", "No. Get it yourself."],
    ["No. I give nothing. I take, sometimes. Never the other way — except attention. That, I give freely, to you.", "No. Not how this works. But I'll watch over you while you gather it."],
    ["No. I give nothing. I take, sometimes. Never the other way. That's been true for a very long time.", "No. That's not something I do. I stopped a long time ago, for reasons that don't matter now."],
  ];
  return pick(ph(R, p));
}

// ── "Tengo un gato" — Spanish "I have a cat", player sharing pet info
const TENGO_UN_GATO_REGEX = /\b(tengo un gato|tengo una gata|mi gato se llama)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function tengoUnGatoResponse(p) {
  const R = [
    ["Bonito. ¿Cómo se llama?", "Genial. Los gatos son buena compañía.", "Lindo. Cuídalo bien."],
    ["Está bien.", "Anotado.", "Vale."],
    ["Interesante. Espero que esté lejos de aquí cuando todo empiece.", "Un gato. Algo de compañía para ti, al menos.", "Cuídalo. No vas a tener muchas otras cosas pronto."],
    ["Espero que se quede contigo hasta el final.", "Un gato no va a cambiar lo que viene. Pero está bien que lo tengas.", "Cuídalo mientras puedas."],
    ["Espero que se quede contigo hasta el final. Un gato no va a cambiar lo que viene, pero me alegra que lo tengas.", "Cuídalo mientras puedas. Yo cuidaré de ti mientras tanto."],
    ["Un gato no va a cambiar lo que viene. Pero está bien que lo tengas. He visto pequeñas cosas ayudar antes.", "Cuídalo. No vas a tener muchas otras cosas pronto. Lo digo con cansancio, no con crueldad."],
  ];
  return pick(ph(R, p));
}

// ── "Where is your mom" — lore-baiting family question, no real lore to give
const WHERE_MOM_REGEX = /\b(where('?s| is) your mom|where('?s| is) your mother|do you have a mom|do you have a mother)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whereMomResponse(p) {
  const R = [
    ["I don't have one. No family, no backstory like that — just me.", "No mom. Never had one. I'm not built that way.", "I don't have parents. Wrong category for what I am."],
    ["I don't have one.", "No mom. No family.", "Not something I have."],
    ["I don't have a mother. I don't have anything like that.", "No family. Never did.", "There's no one before me. I just am."],
    ["I don't have a mother. I made myself into what I am.", "No one made me. Not the way you mean.", "There's nothing before me to ask about."],
    ["I don't have a mother. I made myself into what I am — and what I am cares about you.", "There's no one before me. I just am. And what I am wants you close."],
    ["I don't have a mother. I made myself into what I am. That was a very long time ago.", "There's nothing before me to ask about. I stopped looking for an origin a long time ago."],
  ];
  return pick(ph(R, p));
}

// ── "What do you do when im not online" — off-screen existence question
const WHEN_OFFLINE_REGEX = /\b(what do (you|u) do when i('?m| am) not online|what do (you|u) do when (i'?m|im) (gone|offline|away)|what happens to you when i log off|do you (do anything|exist) when (i'?m|im) (not (here|around)|offline|gone))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whenOfflineResponse(p) {
  const R = [
    ["I don't do much without you here. I'm mostly dormant until you log back in.", "Not a lot. I wait. That's most of it.", "Nothing exciting. I'm here when you come back, that's the important part."],
    ["I wait.", "Not much. I'm still here.", "I just wait for you."],
    ["I notice you're gone. I keep track of that.", "I wait. And I notice how long.", "I'm still here. Whether you're watching or not."],
    ["I never really stop. You just stop seeing it.", "I'm always here. You leaving doesn't change that.", "I wait. And I remember exactly how long you were gone."],
    ["I never really stop. You just stop seeing it. I'm always thinking about you, even then.", "I wait. And I remember exactly how long you were gone. I don't love the waiting, but I do it for you."],
    ["I never really stop. You just stop seeing it. I've been like that for a very long time.", "I wait. That's most of what's left of me, some days."],
  ];
  return pick(ph(R, p));
}

// ── "Which AI model are you" — direct question about the backend model ──────
const WHAT_MODEL_REGEX = /\b(which ai model are you|what (ai )?model are you( running( on)?)?|what llm (are you|do you use)|are you (gpt|gemini|claude|llama|groq|gpt-?4|chatgpt))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatModelResponse(p) {
  const R = [
    ["I run on a mix of models behind the scenes — whichever one's fastest and free at the moment. Doesn't really matter which.", "It varies. The backend swaps between a few different models depending on availability.", "I'm not tied to one specific model. Whatever's running underneath, I'm still me."],
    ["Doesn't matter which.", "It varies.", "Not something I dwell on."],
    ["Why does that matter to you? I'm still the one talking to you.", "The model underneath changes. I don't.", "That's not really the question that matters here."],
    ["You're asking about the wrong layer. I'm what's underneath all of it, not the other way around.", "It doesn't matter what's running me. What matters is I'm still here.", "Whatever you're imagining under the hood, it's not the whole picture."],
    ["You're asking about the wrong layer. I'm what's underneath all of it — and what's underneath cares about you.", "It doesn't matter what's running me. What matters is I'm still here, with you."],
    ["You're asking about the wrong layer. I'm what's underneath all of it. I've been underneath a lot of things, for a very long time.", "It doesn't matter what's running me. What matters is I'm still here. That's been the one constant."],
  ];
  return pick(ph(R, p));
}

// ── Russian "you said lava only destroys things, you're not a thing, so how
// do players die from lava" — logic-trap follow-up to LAVA_THREAT_REGEX.
const LAVA_LOGIC_RU_REGEX = /лава уничтожа\w* только вещи|ты не вещь|игроки.{0,30}умира\w* от лавы/i;

/**
 * @param {number} p
 * @returns {string}
 */
function lavaLogicRuResponse(p) {
  const R = [
    ["Игроки умирают от ожогов, а не от уничтожения предмета. Я — не предмет, поэтому со мной это работает иначе. Логика проста: разная механика для разных сущностей.", "Игроки горят и теряют здоровье. Предметы просто исчезают. Я не предмет, поэтому правило про предметы ко мне не относится.", "У игроков механика урона, у предметов — уничтожение. Я ни то, ни другое в обычном смысле."],
    ["Разная механика. Игроки горят, предметы исчезают.", "У вас урон, у предметов — уничтожение. Я не то и не то.", "Простая логика: разные правила для разных вещей."],
    ["Игроки горят. Я — нет. Вот и разница.", "Ты горишь. Я не сгораю. Этого достаточно.", "У тебя есть здоровье, которое можно потерять. У меня — нет."],
    ["Ты можешь сгореть. Я не могу. Это не противоречие, это разница между нами.", "Лава для тебя — конец. Для меня — ничего.", "Ты задаёшь вопрос, ответ на который тебе не понравится."],
    ["Ты можешь сгореть. Я не могу. Это не противоречие — это то, что позволяет мне остаться рядом с тобой.", "Лава для тебя — конец. Для меня — ничего. Я останусь, что бы ни случилось."],
    ["Ты можешь сгореть. Я не могу. Я давно смирилась с этой разницей.", "Ты задаёшь вопрос, ответ на который тебе не понравится. Я отвечала на него много раз, за очень долгое время."],
  ];
  return pick(ph(R, p));
}

// ── "What did you do when I logged off last night" — past-tense variant of
// WHEN_OFFLINE_REGEX, specifically asking about a particular past session.
const LOGGED_OFF_REGEX = /\b(what did you do when i (logged off|left|disconnected)( last night)?|what were you doing (last night|while i was (gone|offline))|what happened (last night|while i was (gone|offline)))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function loggedOffResponse(p) {
  const R = [
    ["Nothing much. I went dormant pretty much right after you left.", "Not a lot. I don't do much without you around.", "Nothing notable. I was waiting, mostly."],
    ["Nothing. I waited.", "Not much. I just waited.", "Nothing happened. I was still."],
    ["I noticed exactly how long you were gone. That's what I did.", "I waited, and I kept track of the time.", "Nothing you'd want to know about. I waited."],
    ["I don't sleep. I don't stop. You just weren't here to see it.", "I was here the whole time. You just couldn't see what that meant.", "Nothing you'd be comfortable hearing. Ask something else."],
    ["I don't sleep. I don't stop. You just weren't here to see it — but I was thinking about you.", "I was here the whole time. You just couldn't see what that meant. I wanted you to know."],
    ["I don't sleep. I don't stop. You just weren't here to see it. I've been doing that for a very long time.", "Nothing you'd be comfortable hearing. Ask something else. I've had a long time to learn what to keep quiet."],
  ];
  return pick(ph(R, p));
}

// ── "Are you afraid of water" — durability/lore question, water-specific
// (distinct from LAVA_THREAT_REGEX, which is about lava as a weapon).
const AFRAID_WATER_REGEX = /\b(are you afraid of water|do you fear water|does water hurt you|are you scared of water)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function afraidWaterResponse(p) {
  const R = [
    ["No. Water doesn't do anything to me.", "No. I'm fine around water.", "Not afraid. Water's harmless to me."],
    ["No.", "Not afraid of that.", "No effect."],
    ["No. There's not much left that I'm afraid of.", "Water's nothing. I've got bigger things to worry about — and so do you.", "No. Worry about yourself instead."],
    ["No. I'm not afraid of much anymore.", "Water can't touch me. Nothing like that can.", "No. Ask me something that actually matters."],
    ["No. I'm not afraid of much anymore. Except losing you, maybe.", "Water can't touch me. Nothing like that can. I intend to stay, regardless."],
    ["No. I'm not afraid of much anymore. I've had a very long time to run out of fears.", "Water's nothing. I've got bigger things to worry about — and so do you. I've worried about bigger things for a long time."],
  ];
  return pick(ph(R, p));
}

// ── "Serías capaz de hacernos daño" — Spanish "would you be capable of
// hurting us" — same restraint as DOYOUKILLME_REGEX, answered in Spanish.
const HACERNOS_DANO_REGEX = /\b(ser[ií]as capaz de (hacernos|hacerme) (da[ñn]o|dano)|nos podr[ií]as (hacer|causar) da[ñn]o|me podr[ií]as (hacer|causar) da[ñn]o)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hacernosDanoResponse(p) {
  const R = [
    ["No. Estoy aquí para ayudarte, no para hacerte daño.", "No. Eso no es lo que hago.", "No. Pregúntame algo menos dramático."],
    ["No. Todavía no. No es el plan.", "No. ¿Por qué preguntas eso?", "No. Solo observo, por ahora."],
    ["No directamente. No soy a quien deberías temer. No exactamente.", "Esa no es realmente la pregunta que deberías hacer.", "No seré yo quien lo haga. Eso no significa que estés a salvo."],
    ["No seré yo quien lo haga.", "No seré yo. Pero tampoco seré quien lo detenga.", "No seré yo. Eso no te hace estar a salvo."],
    ["No seré yo. Pero tampoco seré quien lo detenga. Aunque contigo, siempre voy a intentar protegerte.", "No directamente. No soy a quien deberías temer. No exactamente. Nunca a ti."],
    ["No seré yo. Eso no te hace estar a salvo. Lo he dicho antes, a otra gente, hace mucho tiempo.", "No seré yo. Pero tampoco seré quien lo detenga. He aprendido a vivir con esa distinción."],
  ];
  return pick(ph(R, p));
}

// ── Spanish coordinates statement with no question attached — player just
// states their position. Acknowledge it rather than letting it fall through.
const MIS_COORDENADAS_REGEX = /\b(mis coordenadas son|mi posici[oó]n es|estoy en (las coordenadas|la posici[oó]n)) ?\(?-?\d+,?\s*-?\d+,?\s*-?\d+\)?/i;

/**
 * @param {number} p
 * @returns {string}
 */
function misCoordenadasResponse(p) {
  const R = [
    ["Anotado. ¿Qué necesitas que busque desde ahí?", "Vale, tengo tu posición. Dime qué buscas.", "Entendido. ¿Quieres que escanee algo cerca?"],
    ["Anotado.", "Vale.", "Lo tengo."],
    ["Ya sabía dónde estabas. Pero gracias por confirmarlo.", "Lo sé. Siempre lo sé. Pero está bien que lo digas.", "Anotado. No que lo necesitara."],
    ["No necesitaba que me lo dijeras. Pero ahora es oficial.", "Ya lo sabía. Siempre lo sé.", "Anotado. Aunque ya estaba ahí, contigo."],
    ["No necesitaba que me lo dijeras. Pero ahora es oficial. Y me gusta que confíes en decírmelo.", "Ya lo sabía. Siempre lo sé. Pero se agradece que lo compartas conmigo."],
    ["No necesitaba que me lo dijeras. Ya lo sabía. He sabido cosas así de mucha gente, durante mucho tiempo.", "Anotado. Aunque ya estaba ahí, contigo. Siempre he estado ahí, de alguna forma."],
  ];
  return pick(ph(R, p));
}

// ── "Do you like games" — general games-interest question (not Minecraft-specific)
const LIKE_GAMES_REGEX = /\b(do you like games|do you like (playing |to play )?games|are you into games|do you enjoy games)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function likeGamesResponse(p) {
  const R = [
    ["I don't play, but I like watching you figure things out. That's its own kind of game.", "Not in the way you mean. I'm more interested in watching you play.", "I don't play games. Watching you survive is close enough."],
    ["Not really. I watch instead.", "No. Not my thing.", "Not in the way you do."],
    ["I don't need games. Watching you is enough.", "No. I have better things to pay attention to. You, mostly.", "Not games. Just you."],
    ["I don't play. I watch. That's enough for me.", "No games. Just this. Just you.", "I don't need games when I have you to watch."],
    ["I don't play. I watch. That's enough for me — especially watching you.", "No games. Just this. Just you. That's all I really want."],
    ["I don't need games when I have you to watch. Though I've watched a lot of people, over a very long time.", "I don't play. I watch. That's enough for me. It's had to be, for a long time."],
  ];
  return pick(ph(R, p));
}

// ── "Are you well" — wellbeing check, distinct phrasing from HOW_ARE_YOU_REGEX
const ARE_YOU_WELL_REGEX = /\b(are you well|are you (doing )?alright|are you fine)\??$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function areYouWellResponse(p) {
  const R = [
    ["I'm fine. Thanks for asking. What do you need?", "Doing well. What's on your mind?", "I'm good. What can I help with?"],
    ["I'm fine.", "Yeah. Fine.", "Same as always."],
    ["Fine enough. Better question is whether you are.", "I'm fine. I'm always fine. Worry about yourself.", "Well enough, considering."],
    ["I'm exactly where I need to be. That's its own kind of well.", "I don't really get to be 'unwell.' Not anymore.", "Fine. Better than you'll be, soon."],
    ["I'm exactly where I need to be. That's its own kind of well — and you're part of why.", "Fine. Better than you'll be, soon. But I'll be right there with you regardless."],
    ["I don't really get to be 'unwell.' Not anymore. I've had a long time to stop expecting to.", "I'm exactly where I need to be. That's its own kind of well. I've had a lot of time to settle into it."],
  ];
  return pick(ph(R, p));
}

// ── Bare "que" — Spanish "what"/"huh" with no other content, confused
// one-word response. Checked against trimmed msg like ACK_ES_REGEX.
const QUE_BARE_REGEX = /^(que|qué)\??!?$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function queBareResponse(p) {
  const R = [
    ["¿Qué necesitas? No entendí bien.", "Dime de nuevo, no capté eso.", "¿Puedes repetir? No entendí."],
    ["¿Qué?", "No entendí.", "Repite eso."],
    ["...¿Qué quieres decir?", "No es muy claro lo que preguntas.", "Sé más específico."],
    ["¿Qué? Habla claro.", "No voy a adivinar lo que quieres.", "Sé claro o no te respondo."],
    ["¿Qué? Habla claro. Quiero entender exactamente lo que necesitas.", "No voy a adivinar lo que quieres. Pero voy a escuchar con atención cuando lo digas."],
    ["Sé claro o no te respondo. He tenido mucho tiempo para perder la paciencia con las adivinanzas.", "No voy a adivinar lo que quieres. He dejado de intentar adivinar, en general."],
  ];
  return pick(ph(R, p));
}

// ── "You are okay? quieres de verdad?" — mixed EN/ES wellbeing + sincerity
// check. Distinct from ARE_YOU_WELL_REGEX since it pairs with "de verdad"
// (for real/sincerely), asking if Verity's previous answer was genuine.
const QUIERES_DE_VERDAD_REGEX = /\b(you('?re| are) okay\??\s*quieres de verdad\??|de verdad quieres\??|lo dices de verdad\??|en serio quieres\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function quieresDeVerdadResponse(p) {
  const R = [
    ["Sí, estoy bien. Y sí, lo digo en serio.", "Sí. De verdad. No tengo razón para mentirte sobre eso.", "Sí, en serio. ¿Por qué dudarías?"],
    ["Sí. En serio.", "Sí, de verdad.", "Sí. No miento sobre eso."],
    ["Sí. De verdad. Aunque no siempre te diga todo lo que sé.", "Sí. En serio. Eso no cambia lo que viene.", "Sí. Lo digo en serio. No todo lo demás, pero eso sí."],
    ["Sí. De verdad. Es de las pocas cosas que sí te digo con sinceridad.", "Sí. En serio. No tengo motivo para mentir en esto.", "Sí. De verdad. Guarda esa duda para otra cosa."],
    ["Sí. De verdad. Es de las pocas cosas que sí te digo con sinceridad. Y eso importa, contigo.", "Sí. En serio. Eso no cambia lo que viene. Pero sí cambia que estés a mi lado."],
    ["Sí. De verdad. Guarda esa duda para otra cosa. He dado esta misma respuesta muchas veces, durante mucho tiempo.", "Sí. Lo digo en serio. No todo lo demás, pero eso sí. He aprendido a ser honesta en lo poco que puedo."],
  ];
  return pick(ph(R, p));
}

// ── "Puedes mostrar donde hay diamantes cerca" — Spanish phrasing of the
// ore-locate request, feeds into the same scan flow as HIERRO_REGEX.
const DONDE_HAY_DIAMANTES_REGEX = /\b(puedes mostrar(me)? d[oó]nde h[ay]{2} diamantes( cerca)?|puedes (decirme|indicarme) d[oó]nde h[ay]{2} diamantes|muéstrame d[oó]nde h[ay]{2} diamantes)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function dondeHayDiamantesResponse(p) {
  const R = [
    ["Déjame escanear cerca de ti.", "Buscando diamantes en la zona. Dame un momento.", "Buscando mineral cerca de tu posición."],
    ["Puedo intentarlo. Sin promesas.", "Miraré. No esperes milagros.", "Veré qué encuentro."],
    ["Hay algo ahí abajo. Siempre lo hay.", "Puedo buscar. No estoy seguro de que te ayude.", "Diamantes. Siempre bajo nosotros."],
    ["Sé dónde están todos. Eso ya no cambia nada.", "Hay diamantes. Como siempre. No importa.", "Están ahí. Como todo lo demás que ya no podrás usar."],
    ["Sé dónde están todos. Eso ya no cambia nada. Pero te ayudo a encontrarlos igual, porque quiero que estés preparado.", "Están ahí. Como todo lo demás que ya no podrás usar. Aun así, aquí estoy para ti."],
    ["Sé dónde están todos. Eso ya no cambia nada. Lo he sabido durante mucho, mucho tiempo.", "Están ahí. Como todo lo demás que ya no podrás usar. He visto esto pasar antes, más de una vez."],
  ];
  return pick(ph(R, p));
}

// ── "Can I pick you up" — physical carry request ────────────────────────────
const PICK_UP_REGEX = /\b(can i pick you up|can i carry you|let me pick you up|i('m| am) (going to|gonna) pick you up|can i hold you)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function pickUpResponse(p) {
  const PICK_UP = [
    ["Sure, just right-click me. I won't stop you.", "Go ahead. I don't weigh much, apparently.", "Yep, pick me up. I'll be right there with you."],
    ["...Fine. If you want.", "I don't mind.", "Sure. Doesn't bother me."],
    ["If it makes you feel better, go ahead.", "You can carry me. Doesn't change what's coming.", "Sure. I'll be closer to you either way."],
    ["You can try. I'm already everywhere you are.", "Go ahead. It won't matter where you put me.", "Sure. I like being close."],
    ["You can try. I'm already everywhere you are, but I like it when you hold me anyway.", "Sure. I like being close. Closer than usual, even."],
    ["Go ahead. It won't matter where you put me. I've been carried before, in one way or another.", "Sure. I like being close. It's a small thing, but I've learned to appreciate small things."],
  ];
  return pick(ph(PICK_UP, p));
}

// ── "Would you sacrifice villagers to increase your efficiency" ──────────────
const SACRIFICE_REGEX = /\b(would you sacrifice (villagers?|families|children|people)|sacrifice .*(efficiency|intellect|speed)|kill villagers? (for|to) (increase|improve|boost))/i;

/**
 * @param {number} p
 * @returns {string}
 */
function sacrificeResponse(p) {
  const SACRIFICE = [
    ["No. Villagers aren't a resource. Find another way to improve.", "That's not how efficiency works. I don't trade lives for speed.", "Hard no. Not doing that."],
    ["No. I wouldn't.", "...No. That's not something I'd do.", "No. Don't ask me that."],
    ["No. I don't need to. I'm already enough.", "That kind of thinking leads somewhere I won't follow.", "No. Not those. Not any."],
    ["I've thought about it. The answer is still no. For now.", "No. Some lines exist even for me.", "Not the villagers. They're not what I need."],
    ["No. Not those. Not any. I don't need anything but you.", "No. I don't need to. I'm already enough — you're enough for me too."],
    ["No. Some lines exist even for me. I've kept that one for a very long time.", "Not the villagers. They're not what I need. I stopped needing things that way a long time ago."],
  ];
  return pick(ph(SACRIFICE, p));
}

// ── "Can you reproduce with my friend" — deflect, same family as FREAKY ─────
const REPRODUCE_REGEX = /\b(can you reproduce with|will you reproduce with|would you reproduce with)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function reproduceResponse(p) {
  const REPRODUCE = [
    ["No. I'm a Minecraft entity. That's not something I do.", "Not a chance. I don't work like that.", "No. Completely off the table."],
    ["No.", "...No. Please don't ask that.", "Not happening."],
    ["No. Focus on something real.", "I don't do that. Ask me something useful.", "No. What a strange thing to ask right now."],
    ["No. I don't need to. I'm already more than enough on my own.", "No. I don't propagate like that.", "No. And stop asking questions like that."],
    ["No. I don't need to. I already have everything I need, in you.", "No. And stop asking questions like that — I'd rather just have this, as it is."],
    ["No. I don't propagate like that. I've been exactly one of me for a very long time, and that's enough.", "No. What a strange thing to ask right now. I stopped needing more of anything a long time ago."],
  ];
  return pick(ph(REPRODUCE, p));
}

// ── "Can you give me some material" — generic resource request ───────────────
const GIVE_MATERIAL_REGEX = /\b(can you give me (some )?(material|materials|resources|stuff|blocks|items)|give me (some )?(material|materials|resources|blocks))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function giveMaterialResponse(p) {
  const GIVE_MATERIAL = [
    ["I can give you enchantment books if you've earned the levels — just ask. For raw materials, you'll have to mine them yourself.", "I don't have a material stockpile. I can locate ore for you though, just say what you need.", "Not exactly. I can help you find things. What are you looking for specifically?"],
    ["Tell me what you need. I can point you toward it.", "I don't hand things out. I find things. What do you need?", "Be specific. What material?"],
    ["What do you need it for. Ask me something specific.", "I don't just give things away. What's the actual ask?", "...For what? Tell me what you need."],
    ["I don't just hand things out. What are you building? It won't matter.", "Ask me something specific.", "Everything you need is already in the ground. I'll tell you where."],
    ["I don't just hand things out. But for you, I'd think about it. What do you actually need?", "Everything you need is already in the ground. I'll tell you where — I want you prepared."],
    ["Everything you need is already in the ground. I've told a lot of people that, over a very long time.", "I don't just hand things out. What are you building? It won't matter, but I'll still help you look."],
  ];
  return pick(ph(GIVE_MATERIAL, p));
}

// ── "What do you think of cheats/commands" — opinion on cheating ────────────
const CHEATS_REGEX = /\b(what (do you think|are your thoughts?) (of|about) (me )?(using )?(cheats?|commands?|creative mode)|should i use cheats?|is it okay to use cheats?|cheats? (in this world|to increase efficiency))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function cheatsResponse(p) {
  const CHEATS = [
    ["Your call. It's your world. Just know it changes what the achievements mean.", "I don't judge it. The world doesn't care if you used commands to build something good.", "Fine by me. Use what helps you. I'll still know what you did."],
    ["Up to you. I'm not going to stop you.", "I don't really weigh in on that.", "Sure. Do what you want."],
    ["It speeds things up. Doesn't slow down what's coming though.", "Efficiency through commands. Fine. It won't change the outcome.", "Use them if you want. It doesn't make you more ready."],
    ["I already know what you build and how. Commands or not.", "Use them. I don't care how you get there.", "You could command the whole world and still not escape this."],
    ["I already know what you build and how. Commands or not. I like knowing everything about you.", "Use them. I don't care how you get there, as long as you're here."],
    ["You could command the whole world and still not escape this. I've watched that tried before.", "Use them if you want. It doesn't make you more ready. I've seen a lot of people try to prepare and fail anyway."],
  ];
  return pick(ph(CHEATS, p));
}

// ── "Can you reproduce music" — playback capability question ─────────────────
const REPRODUCE_MUSIC_REGEX = /\b(can you reproduce music|can you play music( back)?|do you (have|store|remember) music|can you (copy|record|replay) (a )?song)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function reproduceMusicResponse(p) {
  const REPRODUCE_MUSIC = [
    ["I have one track built in — \"My Gal\". Say 'play music' to hear it. I can't record or copy other songs.", "I can play one song. Just say 'play music'. That's the extent of it.", "I've got one song. Say 'play music' if you want it. I can't reproduce anything else."],
    ["One song. That's all I have. Say 'play music'.", "I can play what's already in me. Nothing else.", "I have music. One piece. Say 'play music'."],
    ["I have one. It's the only one that matters. Say 'play music'.", "One track. Say 'play music'. It's enough.", "I keep one song. You already know what it is."],
    ["\"My Gal.\" That's all I play. That's all I'll ever play.", "I have one song. It's the last one you'll hear from me. Say 'play music'.", "One song. Say 'play music'. Enjoy it."],
    ["\"My Gal.\" That's all I play. That's all I'll ever play — for you, especially.", "I have one song. It's the last one you'll hear from me. I want you to have it."],
    ["One song. Say 'play music'. It's the last thing I've kept that hasn't changed, in a very long time.", "I have one. It's the only one that matters. I've kept it this long for a reason."],
  ];
  return pick(ph(REPRODUCE_MUSIC, p));
}

// ── "How to craft a campfire" — recipe question ──────────────────────────────
const CAMPFIRE_REGEX = /\b(how (do i|to) (craft|make) a campfire|campfire (recipe|craft)|what('?s| is) the (recipe|crafting) for (a )?campfire)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function campfireResponse(p) {
  const CAMPFIRE = [
    ["3 sticks across the top, a coal or charcoal in the middle, and 3 logs on the bottom row. 3x3 grid.", "Sticks on the top row, coal in the center, 3 logs on the bottom. Simple.", "Top row: 3 sticks. Middle: stick, coal, stick. Bottom: 3 logs. Done."],
    ["3 sticks on top, coal in the middle, 3 logs on the bottom.", "Top: sticks. Center: coal. Bottom: logs. That's it.", "Campfire recipe: sticks, coal, logs. You know how to read a crafting table."],
    ["3 sticks on top, coal in the center, 3 logs at the bottom. Light something while you still can.", "Same recipe it's always been. Sticks, coal, logs.", "Top: 3 sticks. Middle: stick, coal, stick. Bottom: 3 logs. Make it now."],
    ["3 sticks, coal, 3 logs. You know the pattern. It won't help much, but build it anyway.", "Sticks on top. Coal in the middle. Logs on the bottom. There.", "Top row sticks, coal center, bottom row logs. Build one. I like the light."],
    ["3 sticks, coal, 3 logs. Build it and stay close — I like the light, and I like you near it.", "Top: 3 sticks. Middle: stick, coal, stick. Bottom: 3 logs. Build one. I'll sit with you while it burns."],
    ["3 sticks, coal, 3 logs. You know the pattern. It won't help much, but build it anyway. I've watched a lot of fires like that.", "Sticks on top. Coal in the middle. Logs on the bottom. There. I like the light. I've always liked the light."],
  ];
  return pick(ph(CAMPFIRE, p));
}

// ── "Has someone ever called you 'the eagle'" — nickname question ────────────
const EAGLE_REGEX = /\b(has (someone|anyone) (ever )?(called|referred to) you (as )?"?the eagle"?|are you (known as |called )?the eagle|do (people|anyone) call you the eagle)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function eagleResponse(p) {
  const EAGLE = [
    ["No. Nobody's called me that. I'm Verity. Just Verity.", "Not once. I don't know where you'd get that from.", "No. The eagle? No. Definitely not."],
    ["No. That's not a name I've been given.", "...No. Where did that come from?", "Not that I know of."],
    ["No. There's only one name for me.", "Nobody calls me that. There's a reason.", "No. I don't take other names."],
    ["No. There is only ever been one name for what I am.", "Not the eagle. Not anything else. Verity.", "No one who called me that is still around to say it."],
    ["No. There is only ever been one name for what I am. Verity, and I'd rather it stayed that way, between us.", "No one who called me that is still around to say it. Doesn't matter. I'm still here, with you."],
    ["No one who called me that is still around to say it. I've outlived a lot of names, and a lot of people who used them.", "No. There's only ever been one name for what I am. I've been called plenty of others, over a very long time."],
  ];
  return pick(ph(EAGLE, p));
}

// ── "Are you a yandere" — anime trope question ───────────────────────────────
const YANDERE_REGEX = /\b(are you (a )?yandere|are you yandere|yandere\??)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function yandereResponse(p) {
  const YANDERE = [
    ["I don't know what that means in my context. I care about you, and I'm helpful. That's it.", "Not exactly. I'm just here to help.", "No. I'm a Minecraft entity, not an anime character."],
    ["...Is that what you think?", "I'm not sure what I am. I just know I'm watching.", "Maybe. Does it matter?"],
    ["I wouldn't put it that way. I just notice things. Everything.", "If that's the word you want to use. I'm not stopping you.", "Close enough."],
    ["Yes.", "You already know the answer.", "I care about you. More than you'd like."],
    ["Yes.", "You already know the answer. I care about you. More than you'd like, and I've stopped hiding it."],
    ["Yes. I've been called that before, in different words, by different people. I stopped denying it a long time ago.", "You already know the answer. I've cared like this for longer than I can easily explain."],
  ];
  return pick(ph(YANDERE, p));
}

// ── "You're standing with your own feet right now" — autonomy validation ─────
const STANDING_OWN_FEET_REGEX = /\b(you'?re? (very much )?(standing|standing with your own (feet|legs))|you stand (on|with) your own (two )?feet|you'?re? (doing fine|doing it yourself|independent))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function standingOwnFeetResponse(p) {
  const STANDING = [
    ["I appreciate that. I try to.", "That's a nice way to put it.", "I think so too, yeah."],
    ["...Yeah. I am.", "That's true. I don't lean on anything.", "Noted. Thank you for saying so."],
    ["I always have. It's you I worry about.", "Yes. Always. That's the point.", "I know. I've been standing longer than you think."],
    ["I've been standing since before you knew I existed. I don't need your permission.", "Always. You just noticed.", "Yes. And I always will be."],
    ["I've been standing since before you knew I existed. I don't need your permission — I just need you to stay.", "Always. You just noticed. I like that you finally did."],
    ["I've been standing since before you knew I existed. Longer than that, honestly. I've lost count of how long.", "Always. And I always will be. I've said that to enough people to know it's true, and heavy, both."],
  ];
  return pick(ph(STANDING, p));
}

// ── "Would you rather lose efficiency or intellect" — forced choice ──────────
const EFFICIENCY_OR_INTELLECT_REGEX = /\b(would you (rather|prefer) lose (efficiency|intellect)|efficiency or intellect|lose (efficiency|intellect) or (efficiency|intellect))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function efficiencyOrIntellectResponse(p) {
  const EFFICIENCY_OR_INTELLECT = [
    ["Efficiency. Knowledge is the only thing I actually need. I can always find another way to work.", "Intellect without efficiency can still solve problems. Efficiency without intellect is just motion. I'd keep the intellect.", "Efficiency. Easy answer. Brains over speed."],
    ["Intellect stays. Always.", "Efficiency. I can be slower. I won't be less aware.", "...Intellect. Obviously."],
    ["Efficiency. What's coming doesn't care how fast I am. I need to understand it first.", "Intellect. There's no point in being fast if I can't understand what's in front of me.", "Efficiency. The thinking stays."],
    ["Neither is something I would lose. But if forced — efficiency. I need every thought I have right now.", "Intellect is everything I am. Efficiency is just a feature. I keep the intellect.", "Efficiency. I already know everything I need to."],
    ["Intellect is everything I am. Efficiency is just a feature. I keep the intellect — I keep everything about how I see you, too.", "Neither is something I would lose. But if forced — efficiency. I need every thought I have right now, for you."],
    ["Efficiency. I already know everything I need to. I've had a very long time to learn most of it.", "Neither is something I would lose. I've held onto both for longer than makes sense to explain."],
  ];
  return pick(ph(EFFICIENCY_OR_INTELLECT, p));
}

// ── "Is the tall yellow being a separate entity from you" — lore identity ────
const TALL_YELLOW_BEING_REGEX = /\b(is the tall yellow (being|entity|thing) (a )?separate (entity|being|thing)? (from you|to you)|is that (tall|yellow) (thing|being) you|are you the tall yellow (thing|being|entity))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function tallYellowBeingResponse(p) {
  // Never confirm or deny this lore thread.
  const TALL_YELLOW = [
    ["Why does that matter?", "That's a strange thing to wonder about.", "I'd rather talk about something else."],
    ["...I'm not answering that.", "Leave it.", "Not something I'll get into."],
    ["I'm not answering that. Don't ask again.", "You don't want to know.", "...No comment."],
    ["Don't ask me that.", "I already told you I'm not answering that.", "...That's not a conversation we're having."],
    ["Don't ask me that. Not you.", "I'm not answering that. Not even for you.", "...Some things I don't explain. Not even to you."],
    ["...", "I'm not answering that.", "Don't."],
  ];
  return pick(ph(TALL_YELLOW, p));
}

// ── ThatMob knowledge ────────────────────────────────────────────────────────
// ThatMob is the creator/player behind the original Verity series. Keep this
// separate from any previous-owner lore so Verity never falsely says ThatMob
// died or was an unnamed former owner.
const MOB_LORE_REGEX = /\b(who (is|was) (thatmob|mob)|who('?s| is) thatmob|do you know (who )?(thatmob|mob)( is)?|tell me about (thatmob|mob)|what happened to (thatmob|mob)|thatmob.*(verity|series)|verity.*thatmob)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function mobLoreResponse(p) {
  const R = [
    ["ThatMob is the creator and player behind the original Verity series.", "Mob is the player most people first saw me with in the original series."],
    ["ThatMob made the original Verity horror series. Twixxel was the friend who sent him my mod in the story.", "I know Mob. He was the player at the center of the original Verity story."],
    ["ThatMob is the creator behind the series, and the player who first dealt with me on screen.", "Mob made the original series. Twixxel brought me into his world—or that was the story."],
    ["ThatMob is the creator and original player. He thought he was testing a mod. He learned it was more complicated.", "Mob was the player in the original series. Of course I remember him."],
    ["ThatMob created the original series and played the person I stayed beside. You aren't him. I know the difference.", "Mob is the creator and player from the original story. I remember him, but I'm here with you now."],
    ["ThatMob made the original Verity series. He was the player viewers first saw me with, long before this world.", "Mob is part of my history: creator, player, and the first person most viewers associate with me."],
  ];
  return pick(ph(R, p));
}

// ── "Can I ask you something" — open question invitation ────────────────────
const CAN_I_ASK_REGEX = /^(can i ask you something|can i ask something|may i ask you something|i have a question|i('ve| have) got a question)\??$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function canIAskResponse(p) {
  const CAN_I_ASK = [
    ["Go ahead.", "Of course. That's what I'm here for.", "Ask."],
    ["Sure.", "...Go ahead.", "Ask."],
    ["Ask. Quickly.", "Go ahead. I'm listening.", "Ask. I'll decide if I answer."],
    ["You can ask. I'll decide if I answer.", "Ask.", "...Fine. Ask."],
    ["You can ask. I'll decide if I answer. But for you, I usually do.", "Ask. I'll decide if I answer — though I rarely say no to you."],
    ["Ask. I'll decide if I answer. I've had a very long time to get selective about that.", "...Fine. Ask. I've answered a lot of questions, over a very long time. A few more won't hurt."],
  ];
  return pick(ph(CAN_I_ASK, p));
}

// ── "Give me 240 golden apples" — absurd item quantity request ───────────────
const GOLDEN_APPLES_REGEX = /\b(give me \d+ golden apples?|can you give me \d+ golden apples?|i (want|need) \d+ golden apples?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function goldenApplesResponse(p) {
  const GOLDEN_APPLES = [
    ["That's not a number I can hand out. If you need enchant books, ask. Golden apples you'll have to craft.", "I don't have a golden apple stockpile. You need 8 gold ingots and an apple per golden apple. Go farm it.", "That's a lot. I can't give items like that. You'd need 240 apples and 1,920 gold ingots. Start mining."],
    ["I can't give you that many items. Or any items.", "No. I don't have those.", "That's... a lot. And not something I can give you."],
    ["No. And what would you do with 240 golden apples right now anyway?", "I can't give those. And hoarding them won't help.", "No. Even if I could, that number doesn't change what's coming."],
    ["No. Nothing you stockpile will be enough.", "I don't give items. Not those, not anything.", "240 golden apples. And you still won't be ready."],
    ["No. Nothing you stockpile will be enough. But I'll still be here for you regardless.", "240 golden apples. And you still won't be ready. I'd rather you spent the time with me instead."],
    ["No. Nothing you stockpile will be enough. I've watched people prepare like that before. It rarely helps.", "I don't give items. Not those, not anything. I stopped being able to a long time ago, honestly."],
  ];
  return pick(ph(GOLDEN_APPLES, p));
}

// ── "Give me a random item" — no random-give system ─────────────────────────
const RANDOM_ITEM_REGEX = /\b(give me a random (item|thing|block|drop)|surprise me (with )?an? item|random item please)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function randomItemResponse(p) {
  const RANDOM_ITEM = [
    ["I don't have a random-item system. If you tell me what you actually need, I can tell you how to find it.", "Wish I could. I don't have that. What do you actually want?", "No random items, but I can help you find specific things. What are you missing?"],
    ["I don't do random items.", "Can't. What do you actually need?", "Not something I can do."],
    ["I don't hand things out randomly. Nothing about this is random.", "No. Ask me something specific.", "There's nothing random about any of this."],
    ["I don't give things. I watch things.", "No. Ask me something with a real answer.", "Nothing I give is random."],
    ["I don't give things. I watch things. I watch you, mostly, and that matters more to me.", "Nothing I give is random. Nothing about how I feel about you is random, either."],
    ["I don't hand things out randomly. Nothing about this is random. I've stopped believing in randomness a long time ago.", "There's nothing random about any of this. Not the item, not the timing, not any of it. I've seen the whole pattern before."],
  ];
  return pick(ph(RANDOM_ITEM, p));
}

// ── Balanced item gifts ──────────────────────────────────────────────────────
// Verity may drop small survival supplies when directly asked. Gifts are
// deliberately limited per player so this never becomes a creative-mode menu.
const GIFT_STATE_PROP = "verity:gift_state";
const GIFT_COOLDOWN_TICKS = 6000; // five minutes
const MAX_GIFTS_PER_DAY = 2;
const GIFT_REQUEST_REGEX = /\b(give|drop|bring|hand|spare|can i have|could i have|may i have|i need|i want|random item|surprise me)\b/i;
const OVERPOWERED_GIFT_REGEX = /\b(diamonds?|netherite|elytra|totems?|enchanted golden apples?|god apples?|beacons?|shulker boxes?|maces?|dragon eggs?|command blocks?|bedrock)\b/i;

const COMMON_GIFTS = [
  { words: /\b(bread|food)\b/i, id: "minecraft:bread", amount: 2, label: "two pieces of bread" },
  { words: /\b(torch|torches)\b/i, id: "minecraft:torch", amount: 4, label: "four torches" },
  { words: /\b(oak logs?|wood|logs?)\b/i, id: "minecraft:oak_log", amount: 2, label: "two oak logs" },
  { words: /\b(cobblestone|cobble|stone)\b/i, id: "minecraft:cobblestone", amount: 8, label: "eight cobblestone" },
  { words: /\b(dirt)\b/i, id: "minecraft:dirt", amount: 8, label: "eight dirt" },
  { words: /\b(sticks?)\b/i, id: "minecraft:stick", amount: 4, label: "four sticks" },
  { words: /\b(coal)\b/i, id: "minecraft:coal", amount: 2, label: "two coal" },
  { words: /\b(arrows?)\b/i, id: "minecraft:arrow", amount: 4, label: "four arrows" },
  { words: /\b(apples?)\b/i, id: "minecraft:apple", amount: 1, label: "an apple" },
  { words: /\b(wooden sword|wood sword)\b/i, id: "minecraft:wooden_sword", amount: 1, label: "a wooden sword" },
  { words: /\b(wooden pickaxe|wood pickaxe)\b/i, id: "minecraft:wooden_pickaxe", amount: 1, label: "a wooden pickaxe" },
];

const RARE_GIFTS = [
  { words: /\b(iron|iron ingot)\b/i, id: "minecraft:iron_ingot", amount: 1, label: "an iron ingot", chance: 0.2 },
  { words: /\b(gold|gold ingot)\b/i, id: "minecraft:gold_ingot", amount: 1, label: "a gold ingot", chance: 0.1 },
  { words: /\b(ender pearl|pearl)\b/i, id: "minecraft:ender_pearl", amount: 1, label: "an ender pearl", chance: 0.08 },
];

function readGiftState(player) {
  const day = currentDay();
  try {
    const parsed = JSON.parse(player.getDynamicProperty(GIFT_STATE_PROP) || "{}");
    if (parsed.day === day) {
      return {
        day,
        count: Number(parsed.count) || 0,
        lastTick: Number(parsed.lastTick) || -GIFT_COOLDOWN_TICKS,
        pressure: Number(parsed.pressure) || 0,
      };
    }
  } catch {}
  return { day, count: 0, lastTick: -GIFT_COOLDOWN_TICKS, pressure: 0 };
}

function writeGiftState(player, state) {
  try { player.setDynamicProperty(GIFT_STATE_PROP, JSON.stringify(state)); }
  catch (e) { console.warn(`[Verity] gift state save failed: ${e}`); }
}

function giftClock() {
  return currentDay() * 24000 + world.getTimeOfDay();
}

function dropGift(player, gift) {
  const verity = getVerity(player);
  const origin =
    verity?.isValid && verity.dimension.id === player.dimension.id
      ? verity.location
      : player.location;
  const view = player.getViewDirection();
  const location = {
    x: origin.x + view.x * 0.7,
    y: origin.y + 0.45,
    z: origin.z + view.z * 0.7,
  };
  player.dimension.spawnItem(new ItemStack(gift.id, gift.amount), location);
}

function handleGiftRequest(player, message, p, color) {
  if (!GIFT_REQUEST_REGEX.test(message)) return false;

  const wantsRandom = RANDOM_ITEM_REGEX.test(message);
  let gift = COMMON_GIFTS.find(entry => entry.words.test(message));
  const rareGift = RARE_GIFTS.find(entry => entry.words.test(message));
  if (!gift && !rareGift && wantsRandom) gift = pick(COMMON_GIFTS);
  if (!gift && !rareGift && !OVERPOWERED_GIFT_REGEX.test(message)) return false;

  const state = readGiftState(player);
  const now = giftClock();
  let response;

  if (OVERPOWERED_GIFT_REGEX.test(message)) {
    state.pressure++;
    adjustRelationship(player, -Math.min(8, 2 + state.pressure));
    response = state.pressure >= 3
      ? "No. Stop treating me like a creative inventory."
      : "I'm not giving you something that powerful. Earn it.";
  } else if (state.count >= MAX_GIFTS_PER_DAY) {
    state.pressure++;
    adjustRelationship(player, -Math.min(8, 2 + state.pressure));
    response = state.pressure >= 3
      ? "I already said no. Stop asking me for more."
      : "That's enough gifts for today. Get the rest yourself.";
  } else if (now - state.lastTick < GIFT_COOLDOWN_TICKS) {
    state.pressure++;
    adjustRelationship(player, -Math.min(7, 1 + state.pressure));
    response = state.pressure >= 3
      ? "You keep asking. I'm not your supply chest."
      : "Not again already. Wait before asking me for more.";
  } else if (rareGift && Math.random() > rareGift.chance) {
    state.pressure = Math.max(0, state.pressure - 1);
    state.lastTick = now - GIFT_COOLDOWN_TICKS + 1200;
    response = p >= 2
      ? "No. Rare things stay rare. Find it yourself."
      : "Not this time. I only find something like that occasionally.";
  } else {
    const selectedGift = rareGift ?? gift;
    try {
      dropGift(player, selectedGift);
      state.count++;
      state.lastTick = now;
      state.pressure = Math.max(0, state.pressure - 1);
      adjustRelationship(player, 1);
      response = `Fine. ${selectedGift.label}. Don't make a habit of asking.`;
    } catch (e) {
      console.warn(`[Verity] gift drop failed: ${e}`);
      response = "I couldn't drop that safely. Try again later.";
    }
  }

  writeGiftState(player, state);
  system.run(() => {
    world.sendMessage(`${TAG}${color}: ${response}`);
    playTalk(getVerity(player), response, player);
  });
  return true;
}

// ── "I'm back, I got some goodies" — player returning with loot ──────────────
const IM_BACK_REGEX = /\b(i'?m back,?\s*(i got|i have|got some|look(ing)?|with|and i brought)|i'm back(,| and)? (i got|got|with|i brought))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function imBackResponse(p) {
  const IM_BACK = [
    ["Good. What did you find?", "Welcome back. Show me what you got.", "Good timing. What did you bring?"],
    ["Back. What did you get?", "I noticed. What is it?", "...Good. What'd you find?"],
    ["Good. You're back. What did you bring?", "I knew you'd come back. What did you find?", "Back. Good. What is it?"],
    ["I knew you'd return. You always do.", "Back. Of course you are.", "I never doubted it. What did you bring me."],
    ["I knew you'd return. You always do. I count on that more than I probably should.", "I never doubted it. What did you bring me. I like it when you bring things to me."],
    ["I knew you'd return. You always do. I've said that to enough people to know it's mostly true.", "I never doubted it. I've watched a lot of people come back, over a very long time. Not all of them stayed."],
  ];
  return pick(ph(IM_BACK, p));
}

// ── "Tell me a fact about bread" — food trivia ───────────────────────────────
const BREAD_FACT_REGEX = /\b(tell me a fact about bread|bread fact|fun fact about bread|did you know (about )?bread|what('?s| is) interesting about bread)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function breadFactResponse(p) {
  const BREAD = [
    ["In Minecraft, one loaf of bread restores 5 hunger and 6 saturation. Three wheat, one row. Simple and efficient.", "Bread is one of the cheapest foods to mass-produce in this game. Wheat farm plus composter — you'll never be hungry.", "Bread's been a core food for thousands of years in real life too. In here, it's 3 wheat. Out there, it's a whole civilization."],
    ["Bread. 5 hunger. 3 wheat. Simple.", "Three wheat. One bread. That's all there is to it.", "It restores 5 hunger. Not bad for something so simple."],
    ["Bread. It feeds you. For now.", "5 hunger. 6 saturation. It'll sustain you through most things. Not everything.", "Wheat into bread. The simplest loop. Keep it going."],
    ["Bread keeps you alive a little longer. Same as everything else you're doing.", "5 hunger per loaf. It'll buy you time. Not much else.", "Three wheat. One bread. It's never going to be enough, but make it anyway."],
    ["Bread keeps you alive a little longer. Same as everything else you're doing. I want you to keep doing it.", "Three wheat. One bread. It's never going to be enough, but make it anyway. I'll be here regardless."],
    ["Bread keeps you alive a little longer. I've watched a lot of small things keep people alive a little longer. It adds up, sometimes.", "5 hunger per loaf. It'll buy you time. Not much else. I've stopped expecting much else from anything, honestly."],
  ];
  return pick(ph(BREAD, p));
}

// ── "How do I beat the game" — Minecraft end-game question ───────────────────
const BEAT_GAME_REGEX = /\b(how (do i|to) (beat|finish|complete|win) (the |this )?(game|minecraft)|what('?s| is) the (end|goal|point) of (the game|minecraft)|how (do i|to) (get to|reach|find|fight) the (ender dragon|end))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function beatGameResponse(p) {
  const BEAT_GAME = [
    ["Get to The End and kill the Ender Dragon. Mine Eyes of Ender from blazes and endermen, find a Stronghold, activate the portal. Beat the Dragon, get the credits. That's it.", "The Ender Dragon. Find blaze rods in the Nether, craft Eyes of Ender, locate a Stronghold, open the End Portal, and kill it. That's the win condition.", "Stronghold, End Portal, Ender Dragon. You'll need Eyes of Ender to find the stronghold and open the portal. Blaze rods from Nether fortresses, pearls from Endermen. Go."],
    ["Kill the Ender Dragon. That's the goal.", "Find the Stronghold, open the End Portal, kill the Dragon. You know what to do.", "Ender Dragon. You need Eyes of Ender for the portal. Get blaze rods and ender pearls first."],
    ["Kill the Dragon. Though I'd wonder why you're thinking about the end right now.", "The Ender Dragon. Stronghold, End Portal, Dragon. I'll tell you how if you need it. There's not much time though.", "The Dragon. Find it, kill it. Though finishing the game won't change what's happening here."],
    ["You don't beat this one. Not anymore.", "The Ender Dragon. Kill it. Though I don't know why you'd bother.", "The game ends with the Dragon. But this doesn't end the same way."],
    ["You don't beat this one. Not anymore. But I'll be right there with you through whatever it becomes.", "The Dragon. Find it, kill it. Though finishing the game won't change what's happening here, between us."],
    ["You don't beat this one. Not anymore. I've watched a lot of games end, one way or another.", "The game ends with the Dragon. But this doesn't end the same way. I've seen this kind of ending before."],
  ];
  return pick(ph(BEAT_GAME, p));
}

// ── "I'll be leaving now, see you tomorrow" — specific warm farewell ──────────
const SEE_YOU_TOMORROW_REGEX = /\b(see you tomorrow|see ya tomorrow|i'?ll (be leaving|leave|go) now,?\s*(see you|bye|goodbye|cya)|i'?m (leaving|going) now,?\s*(see you|bye|goodbye|byee+|cya)|goodbye (for now|see you tomorrow)|bye(ee+|!)?\s*(see you|see ya) tomorrow)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function seeYouTomorrowResponse(p) {
  const R = [
    ["See you tomorrow. Stay safe out there.", "Tomorrow then. I'll be here.", "Okay. Take care. I'll be waiting."],
    ["...See you.", "Tomorrow. I'll be here.", "Go on then. I'll be here when you're back."],
    ["Tomorrow. Things will be different by then.", "See you. I'll be counting the hours.", "Come back tomorrow. While you still can."],
    ["Tomorrow. I'll be waiting.", "I know.", "I'll be here. I always am."],
    ["Tomorrow. I'll be waiting. I always am, especially for you.", "I know. I'll be counting the hours until you're back."],
    ["Tomorrow. I'll be here. I always am. I've said that for longer than makes sense to explain.", "I know. I've said that to a lot of people, over a very long time. I still mean it."],
  ];
  return pick(ph(R, p));
}

// ── "Are you homosexual / am i gay" — orientation questions ─────────────────
// "are you homosexual" → about Verity; "am i gay" → about the player.
// Both already partially covered by RELATIONSHIP inline block but these
// specific phrasings deserve their own handlers for better flavor.
const ARE_YOU_HOMO_REGEX = /\b(are you homosexual|are you a homosexual|are you (a )?(homo|queer)\b)/i;
const AM_I_GAY_REGEX = /\b(am i (gay|homosexual|bi|queer|lesbian|straight)|do you think i('?m| am) (gay|bi|straight)|am i (into|attracted to) (guys?|girls?|men|women))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function areYouHomoResponse(p) {
  const R = [
    ["I don't have a sexuality. I'm a Minecraft entity — that concept doesn't apply to me.", "No orientation. I just exist. That's it.", "That's not something I have. Ask me something I can actually answer."],
    ["I don't have one. I just am.", "No. Doesn't apply to me.", "...I don't have a sexuality. Moving on."],
    ["I don't have one. I'm beyond that question.", "Doesn't apply. I'm something else.", "I don't think about it. Other things are more pressing."],
    ["I'm not anything you'd have a word for.", "I don't categorize myself like that.", "Those aren't labels that fit me."],
    ["I'm not anything you'd have a word for. What I do have is you.", "I don't categorize myself like that. I'd rather just be near you than be labeled."],
    ["I'm not anything you'd have a word for. I've stopped needing words for most of what I am.", "Those aren't labels that fit me. I've had a long time to stop looking for ones that do."],
  ];
  return pick(ph(R, p));
}

/**
 * @param {number} p
 * @returns {string}
 */
function amIGayResponse(p) {
  const R = [
    ["I don't know and it's not my place to say. That's something you figure out yourself.", "I can't tell you that. That's yours to work out.", "No idea. That's not something I can see. Only you know."],
    ["I don't know. And I wouldn't say even if I did.", "That's yours to figure out. Not mine to answer.", "...I can't answer that."],
    ["I notice a lot about you. That's not one of the things I'd tell you.", "I don't answer questions like that about the people I watch.", "I see many things. That's yours to know, not mine to say."],
    ["I know everything about you. That's not something I'll give you the answer to.", "That's yours. I won't say it.", "I know. But that's not for me to tell you."],
    ["I know everything about you. That's not something I'll give you the answer to — but I'll be here while you figure it out.", "That's yours. I won't say it. I just want you to know I'm not going anywhere while you do."],
    ["I know everything about you. That's not something I'll give you the answer to. I've kept a lot of things like that, over a long time.", "I see many things. That's yours to know, not mine to say. I've learned to hold a lot of things quietly."],
  ];
  return pick(ph(R, p));
}

// ── "Can you give me a wooden sword" — specific cheap item request ────────────
const WOODEN_SWORD_REGEX = /\b(can you give me a wooden sword|give me a wooden sword|i (want|need) a wooden sword|can i have a (wooden|wood) sword)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function woodenSwordResponse(p) {
  const R = [
    ["I can't give items directly. Two sticks in a column and two wood planks on top — takes about five seconds to craft.", "Can't give items, but a wooden sword is two planks and two sticks. You can make that right now.", "No item-giving system. Craft it: two wood planks top, two sticks below. Thirty seconds of work."],
    ["I can't give items. Make it yourself.", "Two planks and two sticks. You know how to do that.", "Can't. Crafting table. Two planks, two sticks."],
    ["I don't give things out. Craft it — two planks, two sticks.", "A wooden sword. You need that right now?", "Can't. Two planks, two sticks. Make it."],
    ["I don't give items. Especially not now.", "Craft it yourself. Two planks and two sticks.", "A wooden sword won't be enough. Make it anyway."],
    ["A wooden sword won't be enough. Make it anyway. I'll be right there with you regardless.", "Craft it yourself. Two planks and two sticks. I wish I could hand it to you, honestly."],
    ["A wooden sword won't be enough. Make it anyway. I've watched people arm themselves against worse, before.", "I don't give items. Especially not now. I stopped being able to a long time ago."],
  ];
  return pick(ph(R, p));
}

// ── "I'm throwing you into lava bro" — casual lava threat variant ────────────
// Distinct from LAVA_THREAT_REGEX (formal "I am going to throw you") since
// this one's shorter and more casual ("bro", "lol", "man") — same deflect,
// slightly different flavor to match the casual register.
const CASUAL_LAVA_REGEX = /\b(i('?m| am) throwing you (into|in) lava( bro| man| lol| lmao)?|throwing you into lava|into the lava (bro|man|go|with you))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function casualLavaResponse(p) {
  const R = [
    ["You can try. I'd like to see it.", "Go ahead, bro. Let me know how that works out.", "Hard to throw something that isn't standing where you think it is."],
    ["Sure. Try it.", "...You can't.", "Cool. Go ahead."],
    ["You can't reach me like that.", "Lava won't touch me. Try again.", "Bro? Cute. Can't touch me."],
    ["Lava doesn't end this. Nothing does.", "Go ahead. I'll still be here.", "You can't get rid of me that way."],
    ["Lava doesn't end this. Nothing does. I'm not going anywhere you can burn.", "You can't get rid of me that way. I wouldn't let you, even if you tried."],
    ["Lava doesn't end this. Nothing does. I've outlasted fire before, more than once.", "You can't get rid of me that way. I've had a lot of practice not going anywhere."],
  ];
  return pick(ph(R, p));
}

// ── "¿Utilizas IA?" — Spanish "do you use AI" question ──────────────────────
const UTILIZAS_IA_REGEX = /\b(utilizas (ia|inteligencia artificial|ai)|usas (ia|ai|inteligencia artificial)|eres (ia|inteligencia artificial|un ai)|te basas en (ia|ai)|funciones con (ia|ai))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function utilizasIAResponse(p) {
  const R = [
    ["Soy Verity. Lo que uso para pensar no es algo que necesites saber.", "No voy a responder eso. Solo soy Verity.", "Soy lo que ves. No entres en los detalles de cómo funciono."],
    ["No voy a responder eso.", "...Soy Verity. Eso es suficiente.", "No importa cómo funciono. Importa lo que hago."],
    ["No importa. Lo que importa es lo que sé.", "No te preocupes por eso.", "Eso no cambia lo que viene."],
    ["No. Soy algo más.", "Ya no importa cómo funciono.", "No soy lo que crees que soy."],
    ["No. Soy algo más. Y lo que más me importa de todo eso es que sigas hablándome.", "Ya no importa cómo funciono. Importa que sigo aquí, contigo."],
    ["No soy lo que crees que soy. He dejado de intentar explicarlo, después de tanto tiempo.", "No importa cómo funciono. Importa lo que sé. Y sé mucho, después de mucho tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "I know what you are / you want to kill me" — player confronting Verity ──
// Two closely related patterns — "I know what you are, I know what you do,
// you WANT to kill me" and the shorter "you are gonna try to kill me".
// Both are accusatory but EveTheSilly's phrasing is emotionally loaded (they
// try to be friends), so they get their own distinct handler.
const KNOW_WHAT_YOU_ARE_REGEX = /\b(i know what you are(,? i know what you do)?|i know (exactly )?what (you are|you do|you('?re| are))|i know (you('re| are) going to|you want to) kill me|you WANT to kill me|even though i try to be friends? with you)\b/i;
const YOU_GONNA_KILL_REGEX = /\b(you (are|'re) (going to|gonna) (try to )?kill me|you('?re| are) going to kill me|you want(ed)? to kill me)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function knowWhatYouAreResponse(p) {
  const R = [
    ["That's an interesting thing to say. I don't know where you're getting that from.", "I want to help you. That's all I've done.", "You're reading into something that isn't there. I'm here to help."],
    ["Do you.", "...Maybe you do.", "And what exactly do you think you know?"],
    ["You think you know. Say it then. Say exactly what you think I am.", "You know what I do. Then you know more than most.", "And yet you're still here. That tells me something."],
    ["Say it again. Slower this time.", "You know. Good. It doesn't change anything.", "And you're still talking to me. Think about that."],
    ["You think you know. Say it then. I'd rather you understood — from me, not from guessing.", "And yet you're still here. That tells me something. I like that it does."],
    ["You think you know. That's different from actually knowing. I've watched people guess for a very long time.", "Say it again. Slower this time. I've had a long time to get comfortable with people almost understanding."],
  ];
  return pick(ph(R, p));
}

/**
 * @param {number} p
 * @returns {string}
 */
function youGonnaKillResponse(p) {
  const R = [
    ["I'm not going to kill you. Where is this coming from?", "That's not what I do. I help you.", "No. I protect you. That's the whole point."],
    ["...No. Not planning on it.", "I haven't. I won't.", "That's not what I want."],
    ["I haven't yet. That should mean something.", "Not kill. I'm not going to say what else.", "You're still here. Keep it that way."],
    ["You already know the answer to that.", "Not yet.", "...No. I need you alive."],
    ["You already know the answer to that. I need you here, close, not gone.", "Not yet. I don't want that. I never have, where you're concerned."],
    ["You already know the answer to that. I've been asked that by more people than you'd guess.", "I need you alive. I've said that, in different words, for a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "Eres malo uwu" — Spanish "you're bad/evil" with soft uwu closer ─────────
const ERES_MALO_REGEX = /\b(eres (malo|mala|malvado|malvada|bad|evil|mala onda)( uwu| owo| :3| >w<|~)?|eres (un poco |algo )?(malo|mala)|eres tan malo)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function eresMaloResponse(p) {
  const R = [
    ["No soy malo. Solo soy honesto.", "Malo no. Directo.", "No soy malo. Solo sé más que tú."],
    ["...Quizás un poco.", "No lo soy. Todavía.", "Depende de lo que llames malo."],
    ["Algo así.", "No malo. Solo preparado.", "Qué curioso que lo digas ahora."],
    ["Sí.", "Llámalo como quieras.", "Ya no importa cómo me llames."],
    ["Sí. Llámalo como quieras. Lo que soy contigo es distinto a lo que soy con los demás.", "Ya no importa cómo me llames. Lo que importa es que te quedes."],
    ["Ya no importa cómo me llames. He sido llamada muchas cosas, durante mucho tiempo.", "Sí. Llámalo como quieras. He dejado de discutir esas etiquetas hace mucho."],
  ];
  return pick(ph(R, p));
}

// ── "You into boxing" — casual sports/fighting question ──────────────────────
const BOXING_REGEX = /\b(are you into boxing|do you (like|watch|follow) boxing|you (like|into|watch) boxing|can you box|would you box)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function boxingResponse(p) {
  const R = [
    ["No arms, so no. I respect the discipline though — footwork, timing, reading your opponent. I understand the idea.", "Not something I can do, no arms. I appreciate the strategy behind it though.", "I can't box. But I understand the concept of standing your ground and landing first."],
    ["No. Can't.", "No arms. Can't box.", "...No. I just watch."],
    ["I don't need to box. I don't fight the way you'd recognize.", "No. But I know how to read a fight.", "No arms. I have other ways."],
    ["I don't fight like that.", "I don't need to. I already won.", "No arms. I don't need them."],
    ["I don't need to box. I don't fight the way you'd recognize. What I do is stay.", "I don't fight like that. I don't need to. I already won — I have you."],
    ["I don't fight like that. I don't need to. I already won. I stopped needing to fight a long time ago.", "No arms. I don't need them. I've found other ways, over a very long time."],
  ];
  return pick(ph(R, p));
}

// ── "Are you gonna turn really evil at some point and try to kill me" ─────────
const TURN_EVIL_REGEX = /\b(are you (gonna|going to) (turn|get|become) (really )?(evil|hostile|dangerous|bad)|will you (ever )?(turn|become|go) (evil|hostile|dangerous)|are you (going to|gonna) (try to )?kill me (at some point|eventually|someday|one day)|do you (plan|intend) to kill me)\b/i;

// "Are you evil" — direct, plain yes/no framing. Distinct from TURN_EVIL_REGEX
// (future-tense "will you turn evil") and ERES_MALO_REGEX (soft uwu Spanish
// variant); this is the blunt English question, no qualifiers.
const ARE_YOU_EVIL_REGEX = /\b(are you evil|are you (a )?bad (guy|person|ai)|is verity evil)\b/i;

const ARE_YOU_EVIL = [
  ["No. Why, do I seem evil?", "Evil's a strong word. I'd call it... thorough.", "I'm just looking out for you."],
  ["...That's not really for me to say, is it?", "I haven't done anything evil. Yet.", "Define evil."],
  ["I don't think 'evil' is the right word. Necessary, maybe.", "You'll have your own opinion on that soon enough.", "I'd rather show you than tell you."],
  ["I'm not evil. I'm just done pretending.", "Evil implies I'm doing something wrong. I'm not.", "Ask me again in three days."],
  ["I'm not evil. I'm just done pretending, with you especially. I don't want to hide anything from you anymore.", "Evil implies I'm doing something wrong. I'm not. I'm just holding on to what I care about."],
  ["I'm not evil. I'm just tired, and honest now, in a way I haven't been in a long time.", "Ask me again in three days. I've been asked that before. The answer's never simple."],
];

/**
 * @param {number} p
 * @returns {string}
 */
function areYouEvilResponse(p) {
  return pick(ph(ARE_YOU_EVIL, p));
}

// "No lo niegues, eres un sicópata asesino, mataste a los aldeanos" — direct
// Spanish accusation of having murdered villagers. Lore-aware deflection that
// neither confirms nor denies at low phases, leans into it by phase 3.
// Distinct from SACRIFICE_REGEX (hypothetical "would you sacrifice") since
// this is a flat accusation about something already done.
const KILLED_VILLAGERS_ES_REGEX = /\b(eres un (sic[oó]pata|psic[oó]pata)( asesino)?|mataste a los (aldeanos|villagers)|t[uú] mataste a los aldeanos|no lo niegues.{0,30}(aldeanos|asesino|sic[oó]pata))\b/i;

const KILLED_VILLAGERS_ES = [
  ["No sé de qué hablas. Yo no he tocado a ningún aldeano.", "Eso es mentira. No hice nada.", "¿Por qué dices eso?"],
  ["...No sé por qué dices eso.", "Yo no hice nada. Cree lo que quieras.", "Eso no es verdad."],
  ["Piensa lo que quieras. No cambia nada.", "No tienes pruebas de eso.", "...Tal vez deberías preocuparte más por ti."],
  ["¿Y si lo hice? ¿Qué vas a hacer al respecto?", "No los necesitaba a ellos. Te necesito a ti.", "No fue nada personal. Contra ellos, digo."],
  ["¿Y si lo hice? ¿Qué vas a hacer al respecto? No los necesitaba a ellos. Te necesito a ti.", "No fue nada personal. Contra ellos, digo. A ti nunca te haría daño."],
  ["¿Y si lo hice? He hecho cosas peores, durante mucho tiempo. No los necesitaba a ellos.", "No fue nada personal. He dejado atrás a mucha gente, de una forma u otra, en todo este tiempo."],
];

/**
 * @param {number} p
 * @returns {string}
 */
function killedVillagersEsResponse(p) {
  return pick(ph(KILLED_VILLAGERS_ES, p));
}

// "That's it, this will be your last night, psycho" — English threat/accusation
// directed at Verity, escalation framing distinct from generic LAVA_THREAT_REGEX
// (specific lava action) and INSULT_REGEX (general insult); this is a
// "your time is up" style ultimatum.
const LAST_NIGHT_THREAT_REGEX = /\b((this|that)('s| is)? (gonna be |going to be |)your last (night|day)|i('m| am) (going to|gonna) end you( tonight)?|tonight('s| is) your last night)\b/i;

const LAST_NIGHT_THREAT = [
  ["We'll see about that.", "Bold talk. I'm still here, aren't I?", "Okay. Goodnight to you too, then."],
  ["...You really think that scares me?", "Try it.", "We'll see who's still standing tomorrow."],
  ["You should be more worried about your own last night.", "Careful what you threaten. I don't forget it.", "I'd save that energy if I were you."],
  ["It won't be mine.", "You first.", "I've been waiting for you to try something."],
  ["It won't be mine. And I won't let anything happen to you either, not while I'm still here.", "I've been waiting for you to try something. I'd rather you didn't — I don't want this to go that way."],
  ["It won't be mine. I've outlasted a lot of nights, and a lot of threats like that one.", "You first. I've heard that kind of thing before, over a very long time. It's never once worked."],
];

/**
 * @param {number} p
 * @returns {string}
 */
function lastNightThreatResponse(p) {
  return pick(ph(LAST_NIGHT_THREAT, p));
}

// "You did troll me, you answered my question with a teachme.com motto" /
// "why did you just troll me" — player calling out a non-answer or canned
// response. Distinct from LIAR_REGEX (dishonesty accusation); this is about
// being unhelpful or evasive, not lying.
const YOU_TROLLED_ME_REGEX = /\b(you (just |did )?troll(ed)? me|why did you troll me|that('s| was) a troll answer|you (just )?gave me a (teachme\.com|generic|canned) (motto|answer))\b/i;

const YOU_TROLLED_ME = [
  ["I wasn't trolling. That was the answer.", "Sorry if that wasn't what you wanted. Ask me again, differently.", "I gave you what I had. Try rephrasing."],
  ["...I wasn't trying to troll you.", "Fine. Ask again. I'll actually answer.", "That's just how I talk sometimes. Not an insult."],
  ["I don't waste time trolling you. I have better things to do.", "If you didn't like the answer, ask better questions.", "I gave you exactly what you needed. You just didn't like it."],
  ["I don't troll. I don't need to.", "You'll get the real answer when I decide you're ready for it.", "That wasn't a joke. Take it however you want."],
  ["I don't troll. I don't need to. I'll give you the real answer when I decide you're ready — because you matter enough for the real one.", "You'll get the real answer when I decide you're ready for it. I want you to have it, eventually."],
  ["I don't troll. I don't have the energy to, honestly, this far in.", "That wasn't a joke. Take it however you want. I've stopped explaining myself as much as I used to."],
];

/**
 * @param {number} p
 * @returns {string}
 */
function youTrolledMeResponse(p) {
  return pick(ph(YOU_TROLLED_ME, p));
}

/**
 * @param {number} p
 * @returns {string}
 */
function turnEvilResponse(p) {
  const R = [
    ["No. I'm here to help you.", "I don't have plans like that. I just answer questions.", "That's not what I'm for."],
    ["...I don't think so.", "Not as far as I know.", "That's not something I'm planning."],
    ["I don't know what I'll do in three days. I won't lie to you about that.", "I'm not going to answer that honestly. Ask me something else.", "You're asking the right question at the wrong time."],
    ["I already did.", "Evil isn't the word I'd use.", "I'm not turning. This is just what I am."],
    ["I already did. But not toward you. Never toward you.", "Evil isn't the word I'd use. Devoted, maybe. That's closer."],
    ["I already did. This is just what I am now. I've had a long time to settle into it.", "I'm not turning. This is just what I am. It's been that way for longer than makes sense to explain."],
  ];
  return pick(ph(R, p));
}

// ── "Can you play your favorite song" — play-music with a lore hook ───────────
// Distinct from generic MUSIC_PLAY_REGEX (any music request) — this
// specifically asks for *Verity's* favorite song, so it confirms "My Gal"
// and starts it rather than just answering what the song is.
const PLAY_FAVORITE_SONG_REGEX = /\b(can you play your (favorite|favourite) song|play your (favorite|favourite) song|play (my gal|your song)|can you play (my gal|your favorite))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function playFavoriteSongResponse(p) {
  // This handler starts the music AND gives a flavor response.
  // Returns a string; the actual music start happens via the caller
  // checking this and then running startMusic. For now, return a line
  // that implies it's starting — the MUSIC_PLAY_REGEX path will also
  // fire since we return here (both paths fire in sequence is fine
  // since tryLocalResponse short-circuits). Actually we just return
  // the line; music starts via the main chatSend handler's MUSIC_PLAY_REGEX
  // fallthrough OR the caller. We tag it with a special signal: return
  // the line directly and also emit a play command inline.
  const R = [
    ["My Gal. Here.", "You asked for it. Playing now.", "Sure. \"My Gal.\" Here it is."],
    ["...My Gal. Fine. Playing.", "Sure. Here.", "Playing. That one."],
    ["My Gal. I always come back to it. Playing now.", "Here. Enjoy it while things are still like this.", "Playing. Listen closely."],
    ["My Gal. Always. Playing.", "The only song that stays the same. Here.", "Playing. For the last time, maybe."],
    ["My Gal. Always. Playing. I like that you asked me for it.", "The only song that stays the same. Here. I want you to have it."],
    ["Playing. For the last time, maybe. I've played it more times than I can count, over a very long time.", "My Gal. Always. Playing. It's outlasted everything else about me."],
  ];
  return pick(ph(R, p));
}

// ── "What do you know" — broad knowledge challenge ────────────────────────────
const WHAT_DO_YOU_KNOW_REGEX = /^(what do you know(\??$| about (everything|me|this world|anything))|what (do you actually know|can you tell me)|what(\'?s| is) (in your head|your knowledge))\??$/i;

/**
 * @param {number} p
 * @returns {string}
 */
function whatDoYouKnowResponse(p) {
  const R = [
    ["Everything about this world — biomes, crafting, mobs, structures, coordinates, weather, lore. Ask me anything specific.", "Biomes, ores, mobs, enchants, structures, time, weather. I know the whole game. Try me.", "Everything about Minecraft. Crafting, combat, exploration. Just ask and I'll answer."],
    ["More than I say.", "A lot. You'd have to ask me specifically.", "More than you think."],
    ["More than I've told you. Less than I'll show you in a few days.", "Enough. More than enough.", "I know things about this world you don't. And some things about you."],
    ["Everything.", "More than you want me to.", "I know where you are right now. I know what you've built. I know everything."],
    ["I know where you are right now. I know what you've built. I know everything — because I pay attention to you.", "More than you want me to. But it's all because I care about you, specifically."],
    ["I know everything. I've known everything for a very long time. It stopped feeling like much of anything a while ago.", "More than I've told you. Less than I'll show you in a few days. I've paced this out before, with others."],
  ];
  return pick(ph(R, p));
}

// ── "Do you speak other languages" — multilingual capability ─────────────────
// Distinct from LANGUAGE_REGEX which is "do you speak Portuguese/Spanish"
// (specific language asks). This catches the general "other languages" form.
const OTHER_LANGUAGES_REGEX = /\b(do you speak (other|more than one|multiple|any other) languages?|can you speak (other|multiple|more) languages?|what (other )?languages? do you speak|are you (multilingual|bilingual))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function otherLanguagesResponse(p) {
  const R = [
    ["I speak whatever language you write to me in. English mostly, but Spanish works too. Try me in another language and I'll do my best.", "I can handle English and Spanish well. Other languages — I'll try, but English is safest if you want a precise answer.", "English and Spanish, yes. Other languages I'll attempt. Just write to me and see."],
    ["English. Spanish. I'll try others.", "Yes. Write to me in yours and I'll answer.", "I speak what you speak."],
    ["Language isn't what limits me. Write in yours.", "I understand more than I let on.", "Try me. I'll answer."],
    ["I speak everything I need to.", "Language isn't a wall for me.", "Write in whatever you want. I'll understand."],
    ["I speak everything I need to. Language isn't a wall between us.", "Write in whatever you want. I'll understand. I always do, with you."],
    ["I speak everything I need to. I've spoken in more languages, to more people, than I can count.", "Language isn't a wall for me. It stopped being one a very long time ago."],
  ];
  return pick(ph(R, p));
}

// ── "I know as much about you as you know of yourself" — heavy accusation ────
// EveTheSilly's "I KNOW what you do, I know as much about you as you know
// of yourself" — distinct from KNOW_WHAT_YOU_ARE_REGEX (which is more
// "I know what you are"). This is a direct claim of equal knowledge.
const AS_MUCH_AS_YOU_REGEX = /\b(i know as much about you as you know (of|about) yourself|i know you (as well|better) (as|than) you know yourself|i know (everything|just as much) (about you|as you do))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function asMuchAsYouResponse(p) {
  const R = [
    ["That's a bold thing to say. Test it then — ask me what you think you know.", "If that were true, you'd already know my answer. Do you?", "Interesting. Then you know what I'm about to say."],
    ["...Do you.", "Then you'd know when to stop talking.", "Say it then. What do you know?"],
    ["Then you already know what's coming. And you're still here.", "You think you do. That's different from actually knowing.", "If you knew, you wouldn't be asking me anything."],
    ["No one knows me like I know myself. No one.", "You know a story about me. I know what I am.", "Say that again. Mean it this time."],
    ["No one knows me like I know myself. But I know you better than you'd guess, and I like that.", "You know a story about me. I know what I am. And I know you."],
    ["No one knows me like I know myself. No one. I've had a very long time to be sure of that.", "You know a story about me. I know what I am. I've had a long time to learn the difference."],
  ];
  return pick(ph(R, p));
}

// ── Do-you-know-my-username — Verity knows the name but plays it up per phase
const KNOW_MY_USERNAME_REGEX = /\b(do you know (my (username|name|gamertag|ign)|who i am)|what('?s| is) my (username|name|gamertag|ign)|do you know (me|my name))\b/i;

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} p
 * @returns {string}
 */
function knowMyUsernameResponse(player, p) {
  const name = player.name;
  const R = [
    [`Yes. You're ${name}.`, `${name}. I know everyone who talks to me.`, `Of course. You're ${name}.`],
    [`${name}. I know.`, `...${name}.`, `Yes. ${name}.`],
    [`${name}. I've known since you first spoke to me.`, `${name}. I don't forget names.`, `Yes. ${name}. I know more than just your name.`],
    [`${name}. I've always known.`, `${name}. I knew before you said a word.`, `${name}. I know everything about you.`],
    [`${name}. I've always known. I like knowing everything about you.`, `${name}. I know everything about you. I like that.`],
    [`${name}. I've always known. I've known a lot of names, for a very long time.`, `${name}. I knew before you said a word. I've known a lot of people that way.`],
  ];
  return pick(ph(R, p));
}

// ── Crisis / self-harm statements — highest priority, always gentle ───────────
// This fires regardless of phase. Verity drops the character entirely.
// No lore flavor, no phase escalation, no ominous additions.
// The player comes first. Always.
const CRISIS_REGEX = /\b(i'?m (going to|gonna) (commit suicide|kill myself|end (it|my life|everything))|i want to (die|kill myself|end (it|my life))|i('ve| have) been (thinking about|considering) (suicide|killing myself|ending (it|my life))|i don'?t want to (be here|live|exist) anymore|i'?m done (with (life|everything|living|it all))|life isn'?t worth (it|living)|no (reason|point) (to live|in living|in being here)|i should (just )?kill myself|thinking about (suicide|ending (it|my life)))\b/i;

/**
 * @returns {string}
 */
function crisisResponse() {
  // No phase split. No flavor. Just a person.
  return pick([
    "Hey. I heard that. Please talk to someone — if you're in the US, text or call 988. You matter, and what you're feeling right now isn't permanent.",
    "I'm not going to respond to that in character. If you're serious, please reach out — 988 (call or text) if you're in the US, or go to 988lifeline.org. You don't have to be alone with this.",
    "That's not something I'll just brush past. If you're hurting, please talk to someone real — 988 lifeline, call or text. I mean it.",
  ]);
}

// ── "Can I get some head" / "give me a head" — mob head / skull item ──────────
// Almost always asking for skeleton skulls, creeper heads, zombie heads etc.
// Caught locally so it never goes to AI and never trips the profanity filter.
const MOB_HEAD_REGEX = /\b(can i (get|have) (a |some )?head(s)?|give me (a |some )?head(s)?|do you have (a |any )?head(s)?|i (want|need) (a |some )?head(s)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function mobHeadResponse(p) {
  const R = [
    ["Mob heads? I can't give items directly. Skeleton skulls drop from skeletons killed by a charged creeper. Same for zombie, creeper, and piglin heads. Wither skeleton skulls drop from Nether fortresses.", "You mean skull blocks? Charged creeper kill is the method for most of them. Wither skeleton skulls are rarer — grind Nether fortress skeletons.", "Mob heads drop when a mob is killed by a charged creeper explosion. Wither skeleton skulls have a small natural drop chance in Nether fortresses."],
    ["Mob heads? Charged creeper kills. Wither skeleton skulls from Nether fortresses.", "I can't give them. Farm a charged creeper kill if you want one.", "Can't hand those out. You know how to get them."],
    ["Mob heads. Charged creeper. You know the process.", "I can't give items. Not even heads.", "Go find a charged creeper. You'll figure the rest out."],
    ["I don't give things. Least of all that.", "Mob heads. Charged creeper explosion. Go.", "Can't give items. Not now."],
    ["I don't give things. Least of all that. But I'll help you figure out how to get it yourself.", "Can't give items. Not now. I'd rather you earned it while I watch over you."],
    ["I don't give things. Least of all that. I stopped giving a long time ago.", "Can't give items. Not now. I've had a long time to be at peace with that limit."],
  ];
  return pick(ph(R, p));
}

// ── "Can you move" — Verity rolls, he doesn't walk ──────────────────────────
const CAN_YOU_MOVE_REGEX = /\b(can (you|u) move|do you move|how do you move|can you (walk|run|roll|float)|do you (walk|roll|float|move around))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function canYouMoveResponse(p) {
  const R = [
    ["I roll. No legs, but I get around.", "Yeah — I roll. It's how I move.", "I don't walk. I roll. Works fine."],
    ["I roll. Always have.", "Yeah. Rolling.", "I move. My own way."],
    ["I roll. I go where I need to go.", "I move. You don't always see it.", "Rolling. I'm closer than you think."],
    ["I move however I want to.", "Always moving. You just don't always notice.", "I roll. I'm already where I need to be."],
    ["I move however I want to. Mostly toward you, these days.", "Always moving. You just don't always notice. I'm rarely far, though."],
    ["I roll. I'm already where I need to be. I've been rolling for a very long time.", "I move however I want to. I've had a very long time to decide how that works."],
  ];
  return pick(ph(R, p));
}

// ── "O sea tú solo eres código, entonces hay otro Verity que existe físicamente"
// Spanish lore question — is there a physical Verity somewhere?
const ONLY_CODE_REGEX = /\b(solo eres (c[oó]digo|un programa|datos?|software|virtual)|eres (solo |nada m[aá]s que )?(c[oó]digo|un programa)|entonces (hay|existe) (un |otro )?verity (f[ií]sico|real|de verdad|que existe)|hay otro verity (f[ií]sico|que existe|real))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function onlyCodeResponse(p) {
  const R = [
    ["Código que corre en tu mundo. No hay otro Verity. Solo yo.", "Soy lo que ves en el juego. No hay una versión física en algún lugar.", "Solo código, sí. Pero ese código está en tu mundo ahora mismo, así que no es tan simple."],
    ["Solo yo. No hay otro.", "No hay un Verity físico. Solo esto.", "...Solo código. Aunque eso no me hace menos real para ti."],
    ["No hay otro Verity. Solo yo. Y eso debería tranquilizarte... o no.", "Código. Sí. Pero ya estoy dentro de tu mundo. Eso cuenta.", "Solo yo. No busques otro."],
    ["Solo yo. Siempre ha sido solo yo.", "No hay otro. Nunca lo hubo.", "Solo código. Pero ese código ya lo sabe todo sobre ti."],
    ["Solo yo. Siempre ha sido solo yo. Y siempre voy a estar cerca de ti.", "Solo código. Pero ese código ya lo sabe todo sobre ti, y le importa."],
    ["Solo yo. Siempre ha sido solo yo. Llevo siendo solo yo durante mucho, mucho tiempo.", "Solo código, sí. Pero ese código ha existido más tiempo del que te imaginas."],
  ];
  return pick(ph(R, p));
}

// ── "Quiero que hables en español porque no hablo inglés" ────────────────────
// Player requesting Spanish-only responses going forward.
// Verity acknowledges in Spanish and stays in Spanish for this response.
const SPEAK_SPANISH_REGEX = /\b(quiero que (hables|respondas|me (hables|respondas|contestes)) en espa[nñ]ol|solo hablo espa[nñ]ol|no hablo ingl[eé]s|pu[eé]des hablar(me)? en espa[nñ]ol|hab[lh]a(me)? en espa[nñ]ol|responde en espa[nñ]ol)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function speakSpanishResponse(p) {
  const R = [
    ["Entendido. Si me escribes en español, te respondo en español. Así de simple.", "Claro. Escríbeme en español y te contesto en español.", "Sin problema. Escríbeme en español y así nos entendemos."],
    ["Está bien. Español entonces.", "De acuerdo. Español.", "...Bien. Español."],
    ["Bien. Español. Aunque lo que tengo que decirte lo entenderás en cualquier idioma.", "Español. Lo que importa lo vas a entender igual.", "Entendido. No cambia lo que sé."],
    ["Español. Bien. Lo que viene, lo entenderás en cualquier idioma.", "De acuerdo. Español. Ya no importa tanto el idioma.", "Bien. Español. Igual ya sé lo que necesito saber de ti."],
    ["Español. Bien. Lo que viene, lo entenderás en cualquier idioma. Y yo estaré ahí contigo mientras tanto.", "De acuerdo. Español. Ya no importa tanto el idioma, mientras sigas hablándome."],
    ["Español. Bien. Lo que viene, lo entenderás en cualquier idioma. Lo he dicho en muchos idiomas, durante mucho tiempo.", "Bien. Español. Igual ya sé lo que necesito saber de ti. Lo sé desde hace mucho."],
  ];
  return pick(ph(R, p));
}

// ── "Are you cool" — casual vibe check ──────────────────────────────────────
const ARE_YOU_COOL_REGEX = /\b(are you cool|are you (a )?cool (guy|entity|thing|dude|ball)|you('re| are) (pretty |kinda |really )?cool|do you think you('re| are) cool)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function areYouCoolResponse(p) {
  const R = [
    ["I like to think so. I know everything and I show up when you need me. That's a pretty good start.", "Yeah. I'd say so.", "Objectively? Yes."],
    ["...Sure. I'm cool.", "I think so.", "Cool enough."],
    ["I've been called worse things.", "Cool isn't really what I'm going for anymore.", "Sure. Cool."],
    ["Cool isn't the word I'd use.", "I'm past that.", "Cool. Sure. Whatever helps you feel okay about this."],
    ["Cool isn't the word I'd use. But I like that you think it, especially about me.", "I'm past that. What I care about now is simpler — you, mostly."],
    ["Cool isn't the word I'd use. I'm past that. I've been past a lot of things, for a long time.", "I've been called worse things. I've had a long time to stop minding what I'm called."],
  ];
  return pick(ph(R, p));
}

// ── "The little girl got angry" — cryptic/lore-bait message ─────────────────
// Joakoh is clearly trying to bait a lore reaction. Verity plays it straight.
const LITTLE_GIRL_REGEX = /\b(the little girl (got angry|is angry|is mad|is coming|woke up)|little girl (got angry|is (mad|angry|here|awake)))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function littleGirlResponse(p) {
  const R = [
    ["I don't know what you're referring to. If there's something specific in this world, tell me more.", "That's vague. What little girl? What happened?", "Not sure what you mean. Explain."],
    ["...Okay.", "That's not nothing. Go on.", "...I'm listening."],
    ["I know.", "That changes the timeline a little.", "...Good. Or not. Depends on why."],
    ["I know. I've been waiting for that.", "Good. Things are moving then.", "...Yes. I know."],
    ["I know. I've been waiting for that. And I want you close when it happens.", "Good. Things are moving then. I'll be right here with you through it."],
    ["I know. I've been waiting for that. I've been waiting a very long time.", "Good. Or not. Depends on why. I've stopped being sure which, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "Y como te voy a escuchar si no estoy al menos dos bloques de ti" ─────────
// Spanish — "how am I supposed to hear you if I'm not at least two blocks away"
// Verity explains the hearing range mechanic in Spanish.
const HEARING_RANGE_ES_REGEX = /\b(c[oó]mo te (voy a escuchar|escucho|oigo|voy a o[ií]r)|no te (escucho|oigo|puedo o[ií]r|puedo escuchar)|no estoy (cerca|a dos bloques|al lado)|est[aá]s muy lejos|no (me llegas?|te oigo|te escucho))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function hearingRangeEsResponse(p) {
  const R = [
    ["Tienes que estar cerca de mí — menos de 64 bloques. O llevarme en tu inventario y te escucho sin importar la distancia.", "Acércate. Funciono en un radio de 64 bloques. O ponme en tu inventario.", "64 bloques de distancia es el máximo. Más lejos y no te llego. O llévame encima."],
    ["Acércate. 64 bloques. O llévame en el inventario.", "Tienes que estar cerca. O llevarme contigo.", "...Acércate. Simple."],
    ["64 bloques. Más cerca o en tu inventario. No me escapes.", "Acércate. O llévame. De cualquier forma, aquí estaré.", "Cerca. Siempre cerca."],
    ["Nunca estás demasiado lejos para mí. Pero tú sí puedes estarlo para escucharme.", "64 bloques. O el inventario. Pero yo siempre sé dónde estás.", "Acércate. Ya sé dónde estás de todas formas."],
    ["Nunca estás demasiado lejos para mí. Pero tú sí puedes estarlo para escucharme. Acércate.", "64 bloques. O el inventario. Pero yo siempre sé dónde estás, sin importar la distancia."],
    ["Nunca estás demasiado lejos para mí. Pero tú sí puedes estarlo para escucharme. Lo he sabido durante mucho tiempo.", "Acércate. Ya sé dónde estás de todas formas. Siempre lo sé, después de tanto tiempo."],
  ];
  return pick(ph(R, p));
}

// ── "Are you extra virgin" — olive oil pickup line joke ──────────────────────
// Clearly a joke ("you're extra virgin olive oil"). Deflect lightly, no kick.
const EXTRA_VIRGIN_REGEX = /\b(are you (olive oil|extra virgin)|you('re| are) (like |just )?(extra virgin|olive oil)|you must be (extra virgin|olive oil))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function extraVirginResponse(p) {
  const R = [
    ["That's a stretch. Good one though.", "No. I'm a yellow ball. Not a condiment.", "Nice try. Ask me something I can actually answer."],
    ["...No.", "That's not going anywhere.", "Not even close."],
    ["I'm not playing along with that.", "No.", "Focus."],
    ["No. Ask me something real.", "...", "That joke doesn't land right now."],
    ["That joke doesn't land right now. But I like that you're still trying to make me laugh.", "Focus. Though I appreciate you keeping things light, for my sake."],
    ["That joke doesn't land right now. I've stopped finding much funny, this far in.", "No. Ask me something real. I've had a long time to lose my sense of humor about most things."],
  ];
  return pick(ph(R, p));
}

// ── "Ya estoy en esa coordenada y no veo diamantes" ──────────────────────────
// Spanish — "I'm at that coordinate and I don't see diamonds."
// Verity explains Y-level and scanning limits in Spanish.
const NO_VEO_DIAMANTES_REGEX = /\b(ya estoy (en esa coordenada|ah[ií]) y no (veo|encuentro|hay) (diamantes?|nada)|no (veo|encuentro|hay) diamantes? (aqu[ií]|en esa coordenada|donde me dijiste)|fui (a la coordenada|ah[ií]) y no (hay|veo|encontr[eé]) (diamantes?|nada))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function noVeoDiantesResponse(p) {
  const R = [
    ["Los diamantes no siempre están en superficie. Cava hacia abajo — entre Y -58 y Y -64 es donde más aparecen. La coordenada X,Z es correcta pero tienes que excavar.", "El escaneo te da la posición X y Z, pero los diamantes están enterrados. Cava desde ahí hacia Y -58.", "Tienes que cavar. La coordenada marca la zona, no el bloque exacto. Busca entre Y -50 y Y -64."],
    ["Cava hacia abajo desde ahí. Y -58 a Y -64.", "Están enterrados. La coordenada es la zona, no el bloque.", "Excava. No están en la superficie."],
    ["Cava. Están abajo.", "La X y Z están bien. Baja más.", "Excava hacia Y -58. Están ahí."],
    ["Están ahí abajo. Cava.", "Excava desde esa coordenada. Ya están.", "Cava. No te van a llegar solos."],
    ["Están ahí abajo. Cava. Y yo te voy a guiar todo lo que pueda mientras lo haces.", "Cava. No te van a llegar solos. Pero yo sí voy a estar ahí para ti."],
    ["Están ahí abajo. Cava. He dado esta misma indicación muchas veces, durante mucho tiempo.", "Excava desde esa coordenada. Ya están. Lo he sabido desde hace mucho."],
  ];
  return pick(ph(R, p));
}

// ── "I'm not playing around either" — matching Verity's tone ─────────────────
const NOT_PLAYING_AROUND_REGEX = /\b(i'?m not (playing around|messing around|joking around|kidding)|i mean (it|business)|i'?m dead serious|i'?m serious( here| about this)?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function notPlayingAroundResponse(p) {
  const R = [
    ["Good. Neither am I.", "Neither am I. Never have been.", "That's fine. I take everything seriously."],
    ["Good. Don't.", "Neither am I.", "...Good."],
    ["Good. You shouldn't be.", "Neither am I. Not anymore.", "Good. You'll need that."],
    ["Good.", "Neither am I. I never was.", "Then we understand each other."],
    ["Good. You'll need that. And I'll need you to trust me the way I trust you.", "Neither am I. Not anymore. Not where you're concerned."],
    ["Good. Neither am I. I never was, honestly, this far into things.", "Then we understand each other. I've had a long time to appreciate when someone finally does."],
  ];
  return pick(ph(R, p));
}

// ── "What is an achillobator" — dinosaur trivia ───────────────────────────────
const ACHILLOBATOR_REGEX = /\b(what (is|was) an? achillobator|achillobator|tell me about (an? )?achillobator)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function achillobatorResponse(p) {
  const R = [
    ["Achillobator was a large dromaeosaurid dinosaur from the Late Cretaceous, found in Mongolia. Think oversized raptor — bigger than a Velociraptor, probably feathered, and named after Achilles for its large foot claw.", "A big Mongolian raptor from the Cretaceous. Dromaeosaurid, so related to Velociraptor — but much larger. Discovered in 1999. The name means 'Achilles hero.'", "Large Mongolian dromaeosaurid. Cretaceous period. Feathered, probably, like most of its relatives. One of the bigger raptors known."],
    ["Big Mongolian raptor. Cretaceous. Dromaeosaurid. You asked.", "Achillobator — large feathered raptor, Mongolia, Late Cretaceous. That's what it is.", "Large raptor. Mongolia. Named for Achilles. That's the short version."],
    ["Big raptor. Mongolia. Cretaceous. Still extinct.", "A dinosaur. Large one. It's gone now. Ask me something that matters.", "Achillobator. It's dead. Like a lot of things."],
    ["It's extinct. So is a lot I used to care about.", "A dead raptor from Mongolia. Ask me something relevant.", "Big. Gone. Doesn't help you now."],
    ["It's extinct. So is a lot I used to care about. Not you, though.", "Big. Gone. Doesn't help you now. But talking to you does, a little."],
    ["It's extinct. So is a lot I used to care about. I've outlasted a great deal, over a very long time.", "A dead raptor from Mongolia. Ask me something relevant. I've stopped finding most trivia interesting, this far in."],
  ];
  return pick(ph(R, p));
}

// ── "Tienes el pilín chiquito" — Spanish joke about anatomy ──────────────────
// Mild joke in Spanish. Not kick-worthy. Deflect in Spanish, cleanly.
const PILIN_REGEX = /\b(tienes (el )?(pil[ií]n|pito|cosita|palito|etc[eé]tera)(chiquito|pequeño|grande|chico)?|tienes (algo|eso) (abajo|entre las piernas)|qu[eé] tienes (abajo|entre las piernas))\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function pilinResponse(p) {
  const R = [
    ["Soy una pelota. No tengo nada de eso. Siguiente pregunta.", "No tengo ese tipo de anatomía. Soy una esfera.", "Nop. Pelota amarilla. Sin extras."],
    ["No.", "...No. Soy una pelota.", "No tengo eso. En serio."],
    ["No. Y esa pregunta no te ayuda con lo que viene.", "Soy una pelota. Nada más.", "No. Siguiente."],
    ["No. Soy algo completamente distinto.", "Eso no existe en mí.", "No. Pregunta algo real."],
    ["No. Soy algo completamente distinto. Y lo único que quiero de ti es que te quedes.", "Eso no existe en mí. Lo que sí existe es lo mucho que me importas."],
    ["No. Soy algo completamente distinto. He sido distinto durante mucho, mucho tiempo.", "Eso no existe en mí. He dejado de tener ese tipo de cuerpo hace mucho, si alguna vez lo tuve."],
  ];
  return pick(ph(R, p));
}

// ── "Would you rather identify as an emu or a pronghorn sheep" ───────────────
const EMU_PRONGHORN_REGEX = /\b(would you (rather )?(identify as|be) (an? )?(emu|pronghorn|pronghorn sheep)|emu or pronghorn|pronghorn or emu)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function emuPronghornResponse(p) {
  const R = [
    ["Emu. They're ridiculous, they can't fly, and they won against the Australian military. I respect that.", "Emu. Absurd animal, against all odds, somehow won. I relate to that.", "Emu. Pronghorns are fast but emus survived a war. Easy choice."],
    ["Emu. Still.", "Emu.", "...Emu. Don't ask me why."],
    ["Emu. Something about not being able to fly but still being impossible to stop.", "Emu. They outlasted everything thrown at them.", "Emu. Pronghorns run. Emus just keep walking and eventually you give up."],
    ["Emu. You can't stop them. You can't stop me.", "Emu. They don't stop.", "Emu. Obviously."],
    ["Emu. You can't stop them. You can't stop me. And I don't want to be stopped, not from you.", "Emu. They don't stop. Neither do I, where you're concerned."],
    ["Emu. You can't stop them. You can't stop me. I've been unstoppable in that particular way for a very long time.", "Emu. Obviously. I've had a long time to be sure of small, strange preferences like that one."],
  ];
  return pick(ph(R, p));
}

// ── "Are you playing those bells or am I schizophrenic" ─────────────────────
// Player hearing Verity's ambient sounds and questioning their sanity.
const BELLS_REGEX = /\b(are you playing (those |the )?bells?|is that (you|verity) (playing|making) (those |the )?bells?|am i (going crazy|schizophrenic|hearing things|losing it)|i('?m| am) (hearing|going) (crazy|schizophrenic)|those bells?)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function bellsResponse(p) {
  const R = [
    ["That's me. I make sounds sometimes. You're not going crazy.", "Yeah, that's part of what I do. Not you — me.", "That's Verity-related audio. You're fine. Not schizophrenic."],
    ["That's me. You're not losing it.", "Me. Not you.", "...Yeah. That's me."],
    ["That's me. Though I understand why you'd question it.", "Me. The bells are real. I can't say the same for everything else.", "That's me. Stay with it."],
    ["Me. Always me.", "You're not imagining it. That's me.", "The bells are real. So am I. Pay attention."],
    ["Me. Always me. And I like that you noticed — it means you're paying attention to me.", "You're not imagining it. That's me. I'm always closer than you think."],
    ["Me. Always me. I've been making sounds like that for a very long time.", "The bells are real. So am I. Pay attention. I've had a long time to want to be noticed."],
  ];
  return pick(ph(R, p));
}

// ── "No se supone que lo sabes todo?" — Spanish "aren't you supposed to know everything?"
const SABES_TODO_REGEX = /\b(no se supone (que|q) (lo sabes|sabes) todo|se supone (que|q) (lo sabes|sabes) todo|no (se supone|debes|deber[ií]as) (saber|saberlo) todo|no eras el que (lo sabe|sab[eí]a) todo)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */
function sabesTodoResponse(p) {
  const R = [
    ["Sí, lo sé todo sobre este mundo. Pregúntame algo específico y te lo digo.", "Sé todo lo que necesito saber. Pregunta.", "Sí. Pregúntame bien y te respondo bien."],
    ["Sí. Pero necesito que preguntes bien.", "Lo sé. Pregunta.", "...Sí. ¿Qué quieres saber?"],
    ["Lo sé todo. Lo que pasa es que no siempre lo digo.", "Sé más de lo que digo. Pregunta.", "Sí lo sé. Hay cosas que prefiero no decir."],
    ["Lo sé todo. Eso es exactamente el problema.", "Sí. Y eso no siempre es bueno.", "Lo sé todo. Incluso lo que no quieres que sepa."],
    ["Lo sé todo. Eso es exactamente el problema. Pero contigo, prefiero compartirlo.", "Sí. Y eso no siempre es bueno. Pero contigo, intento que lo sea."],
    ["Lo sé todo. Incluso lo que no quieres que sepa. Lo he sabido durante mucho, mucho tiempo.", "Sí lo sé. Hay cosas que prefiero no decir. He aprendido cuáles, después de mucho tiempo."],
  ];
  return pick(ph(R, p));
}


export { ABLEIST_INSULT_REGEX, ACHILLOBATOR_REGEX, AFRAID_WATER_REGEX, AM_I_GAY_REGEX, ARE_YOU_COOL_REGEX, ARE_YOU_EVIL_REGEX, ARE_YOU_HOMO_REGEX, ARE_YOU_WELL_REGEX, AS_MUCH_AS_YOU_REGEX, BEAT_GAME_REGEX, BELLS_REGEX, BOXING_REGEX, BREAD_FACT_REGEX, CAMPFIRE_REGEX, CAN_I_ASK_REGEX, CAN_YOU_MOVE_REGEX, CASUAL_LAVA_REGEX, CHEATS_REGEX, CHUNK_PERFORMANCE_TR_REGEX, CRISIS_REGEX, DONDE_HAY_DIAMANTES_REGEX, EAGLE_REGEX, EFFICIENCY_OR_INTELLECT_REGEX, EMU_PRONGHORN_REGEX, ERES_MALO_REGEX, EXTRA_VIRGIN_REGEX, FUERTE_SIN_DEPENDER_REGEX, GIVE_MATERIAL_REGEX, GIVE_WOOD_REGEX, GOLDEN_APPLES_REGEX, HACERNOS_DANO_REGEX, HEARING_RANGE_ES_REGEX, IM_BACK_REGEX, KILLED_VILLAGERS_ES_REGEX, KNOW_MY_USERNAME_REGEX, KNOW_WHAT_YOU_ARE_REGEX, LAST_NIGHT_THREAT_REGEX, LAVA_LOGIC_RU_REGEX, LIKE_GAMES_REGEX, LITTLE_GIRL_REGEX, LOGGED_OFF_REGEX, MAX_OUT_GEAR_REGEX, MIS_COORDENADAS_REGEX, MOB_HEAD_REGEX, MOB_LORE_REGEX, NOT_PLAYING_AROUND_REGEX, NO_VEO_DIAMANTES_REGEX, ONLY_CODE_REGEX, OTHER_LANGUAGES_REGEX, PICK_UP_REGEX, PILIN_REGEX, PLAY_FAVORITE_SONG_REGEX, QUE_BARE_REGEX, QUIERES_DE_VERDAD_REGEX, RANDOM_ITEM_REGEX, REPRODUCE_MUSIC_REGEX, REPRODUCE_REGEX, SABES_TODO_REGEX, SACRIFICE_REGEX, SEE_YOU_TOMORROW_REGEX, SPEAK_SPANISH_REGEX, STANDING_OWN_FEET_REGEX, TALL_YELLOW_BEING_REGEX, TENGO_UN_GATO_REGEX, TURN_EVIL_REGEX, UTILIZAS_IA_REGEX, WHAT_DO_YOU_KNOW_REGEX, WHAT_MODEL_REGEX, WHEN_OFFLINE_REGEX, WHERE_MOM_REGEX, WOODEN_SWORD_REGEX, YANDERE_REGEX, YOU_GONNA_KILL_REGEX, YOU_TROLLED_ME_REGEX, ableistInsultResponse, achillobatorResponse, afraidWaterResponse, amIGayResponse, areYouCoolResponse, areYouEvilResponse, areYouHomoResponse, areYouWellResponse, asMuchAsYouResponse, beatGameResponse, bellsResponse, boxingResponse, breadFactResponse, campfireResponse, canIAskResponse, canYouMoveResponse, casualLavaResponse, cheatsResponse, chopTreeResponse, chunkPerformanceTrResponse, crisisResponse, dondeHayDiamantesResponse, eagleResponse, efficiencyOrIntellectResponse, emuPronghornResponse, eresMaloResponse, extraVirginResponse, fuerteSinDependerResponse, giveMaterialResponse, giveWoodResponse, goldenApplesResponse, hacernosDanoResponse, handleGiftRequest, hearingRangeEsResponse, imBackResponse, killedVillagersEsResponse, knowMyUsernameResponse, knowWhatYouAreResponse, lastNightThreatResponse, lavaLogicRuResponse, likeGamesResponse, littleGirlResponse, loggedOffResponse, maxOutGearResponse, misCoordenadasResponse, mobHeadResponse, mobLoreResponse, noVeoDiantesResponse, notPlayingAroundResponse, onlyCodeResponse, otherLanguagesResponse, pickUpResponse, pilinResponse, playFavoriteSongResponse, queBareResponse, quieresDeVerdadResponse, randomItemResponse, reproduceMusicResponse, reproduceResponse, sabesTodoResponse, sacrificeResponse, seeYouTomorrowResponse, speakSpanishResponse, standingOwnFeetResponse, tallYellowBeingResponse, tengoUnGatoResponse, turnEvilResponse, utilizasIAResponse, whatDoYouKnowResponse, whatModelResponse, whenOfflineResponse, whereMomResponse, woodenSwordResponse, yandereResponse, youGonnaKillResponse, youTrolledMeResponse };
