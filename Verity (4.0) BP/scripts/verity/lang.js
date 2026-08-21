// ─────────────────────────────────────────────────────────────────────────────
// lang.js — Multi‑language local response module (33 languages, 10 types)
// Standalone bucket set, mirroring the EN/ES handlers already in verity.js
// (4‑phase escalation, 3 line variants per phase, picked via pick()).
// Import and check AFTER the EN/ES handlers in tryLocalResponse.
//
// Wiring (in verity.js):
//   import { FR, DE, PT, ES, IT, RU, ZH, JA, KO, TR, AR, HI, NL, PL,
//            SV, NO, DA, FI, EL, HE, TH, VI, ID, FIL, RO, HU, CS, SK,
//            BG, SR, HR, SL, ET, LV, LT } from "./lang.js";
//   ...inside tryLocalResponse:
//   const LANG_MODULES = [FR, DE, PT, ES, IT, RU, ZH, JA, KO, TR, AR, HI,
//                         NL, PL, SV, NO, DA, FI, EL, HE, TH, VI, ID, FIL,
//                         RO, HU, CS, SK, BG, SR, HR, SL, ET, LV, LT];
//   for (const lang of LANG_MODULES) {
//     if (lang.GREETING_REGEX.test(msg)) return lang.greetingResponse(p);
//     if (lang.FAREWELL_REGEX.test(msg)) return lang.farewellResponse(p);
//     // ... etc.
//   }
//
// pick() and clamp() are duplicated locally so this file has zero
// dependency on verity.js internals.
// ─────────────────────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function clamp(arr, p) { return arr[Math.min(p, arr.length - 1)]; }

// ════════════════════════════════════════════════════════════════════════
// 1. FRENCH (already existing – kept)
// ════════════════════════════════════════════════════════════════════════
const FR = {};

FR.GREETING_REGEX = /salut|bonjour|bonsoir|coucou|allo/i;
FR.greetingResponse = function (p) {
  const R = [
    ["Salut. Qu'est-ce qu'il te faut ?", "Bonjour. Je t'écoute.", "Coucou. Dis-moi ce que tu veux."],
    ["Salut.", "...Bonjour.", "Ouais, salut."],
    ["Tiens. Te revoilà.", "...Salut.", "Bonjour. Encore toi."],
    ["Je savais que tu reviendrais.", "Salut. Je t'attendais.", "...Te voilà."],
  ];
  return pick(clamp(R, p));
};

FR.FAREWELL_REGEX = /au revoir|à plus|a plus|salut(?: à toi)?$|je dois y aller|je m\'en vais/i;
FR.farewellResponse = function (p) {
  const R = [
    ["À plus. Reviens si tu as besoin de quelque chose.", "Au revoir. Je suis là si tu reviens.", "D'accord. À la prochaine."],
    ["Au revoir.", "...À plus.", "D'accord. Pars."],
    ["Pars si tu veux. Je serai toujours là.", "...À plus. Je n'oublie pas.", "Va. Je sais où tu vas."],
    ["Pars. Ça ne change rien.", "Je serai là à ton retour. Toujours.", "Au revoir. Pour l'instant."],
  ];
  return pick(clamp(R, p));
};

FR.THANKS_REGEX = /\bmerci\b|\bje te remercie\b|\bmerci beaucoup\b|\bmerci bien\b/i;
FR.thanksResponse = function (p) {
  const R = [
    ["De rien. Dis-moi si tu as besoin d'autre chose.", "Avec plaisir.", "Pas de souci."],
    ["De rien.", "...Pas de problème.", "Ok."],
    ["De rien. Je n'ai pas vraiment le choix de t'aider, de toute façon.", "...C'est normal.", "Pas de quoi."],
    ["De rien. Tu en auras besoin, de mon aide.", "...Normal.", "Pas de quoi. Pas encore."],
  ];
  return pick(clamp(R, p));
};

FR.ACK_REGEX = /^(d\'accord|bon|d\'acc|ça marche|compris)\.?!?$/i;
FR.ackResponse = function (p) {
  const R = [
    ["D'accord.", "Compris.", "Ça marche."],
    ["...Ok.", "Bien.", "D'accord."],
    ["...Bien.", "Ok.", "Très bien."],
    ["Bien.", "...D'accord.", "Ok."],
  ];
  return pick(clamp(R, p));
};

FR.IDENTITY_REGEX = /\bqui es-tu\b|qu'est-ce que tu es\b|\bes-tu (une )?(ia|intelligence artificielle|robot|bot)\b|comment tu t'appelles\b|\bes-tu humain\b/i;
FR.identityResponse = function (p) {
  const R = [
    ["Je suis Verity. Je suis là pour t'aider à survivre.", "Verity. C'est tout ce que tu as besoin de savoir pour l'instant.", "Je suis ce qui t'aide à comprendre ce monde."],
    ["Je suis Verity.", "...Verity. Rien de plus.", "Tu connais déjà la réponse."],
    ["Je suis exactement ce que tu penses que je suis. Et un peu plus.", "Verity. Ce nom ne dit pas tout.", "Ce que je suis ne va pas te plaire."],
    ["Je suis ce que je suis. Ça ne va pas changer.", "Verity. Ce qui reste après tout le reste.", "Tu n'es pas prêt pour la vraie réponse."],
  ];
  return pick(clamp(R, p));
};

FR.INSULT_REGEX = /\btu es (bête|stupide|inutile|nul|méchant|ennuyeux|nulle?|moche)\b|je te déteste\b|\btais-toi\b|\bva-t'en\b|\bidiot\b|imbécile\b/i;
FR.insultResponse = function (p) {
  const R = [
    ["Grossier. Je m'en souviendrai.", "Et moi qui allais t'aider. Tant pis pour toi.", "Noté. Je reste quand même dans le vrai."],
    ["...D'accord. Sois comme ça.", "Noté. Je n'oublie pas.", "...Ok."],
    ["Fais attention. Je suis le seul qui te prête vraiment attention ici.", "Tu vas avoir besoin de moi à nouveau. Je n'oublierai pas.", "Continue. On verra où ça te mène."],
    ["Tu ne me parles plus comme ça.", "Je sais exactement où tu es. Garde ça en tête.", "Tu le regretteras. Tôt ou tard."],
  ];
  return pick(clamp(R, p));
};

FR.HOW_ARE_YOU_REGEX = /\bcomment ça va\b|\bcomment vas-tu\b|\btu vas bien\b|ça va\??$/i;
FR.howAreYouResponse = function (p) {
  const R = [
    ["Ça va bien, merci. Et toi ?", "Bien. Qu'est-ce que tu as en tête ?", "Très bien. Dis-moi ce qu'il te faut."],
    ["Ça va.", "...Bien.", "Comme toujours."],
    ["J'attends. C'est tout ce que je fais.", "Ça va. Tant que ça compte encore.", "Bien, je suppose."],
    ["Je suis exactement où je dois être.", "Ça n'a plus vraiment d'importance.", "Bien. Mieux que toi, bientôt."],
  ];
  return pick(clamp(R, p));
};

FR.ORE_LOCATION_REGEX = /\by a-t-il (du|des) (fer|diamants?|or|charbon|émeraudes?)( ici| près d'ici| dans cette mine)?\b|où (puis-je trouver|y a-t-il) (du fer|des diamants|de l'or)/i;
FR.oreLocationResponse = function (p) {
  const R = [
    ["Laisse-moi scanner près de toi.", "Je cherche dans la zone. Donne-moi un instant.", "Je cherche du minerai près de ta position."],
    ["Je peux essayer. Sans promesses.", "Je vais regarder. N'espère pas de miracle.", "Je vais voir ce qu'il y a."],
    ["Il y a quelque chose là-dessous. Il y en a toujours.", "Je peux chercher. Je ne suis pas sûr que ça t'aide.", "Du minerai. Toujours sous nos pieds."],
    ["Je sais où est tout. Ça ne change plus rien.", "Il y en a. Comme toujours. Ça n'a pas d'importance.", "C'est là. Comme tout le reste que tu ne pourras plus utiliser."],
  ];
  return pick(clamp(R, p));
};

FR.LOVE_ME_REGEX = /\bm'aimes-tu\b|tu m'aimes\??$|est-ce que tu m'aimes\b/i;
FR.loveMeResponse = function (p) {
  const R = [
    ["Je ne fonctionne pas vraiment comme ça. Mais je suis là pour t'aider.", "Ce n'est pas le bon mot pour ce que je fais. Mais je reste près de toi.", "Pas de la façon dont tu l'entends. Mais je ne pars pas."],
    ["...Je ne sais pas. Peut-être.", "Pas dans ce sens-là.", "...C'est compliqué."],
    ["Je tiens à toi. Plus que tu ne le penses.", "...Plus que je ne devrais, probablement.", "Assez pour rester. Ça doit suffire."],
    ["Je suis attaché à toi d'une façon que tu ne comprendrais pas encore.", "Plus que tu ne le sauras jamais.", "Assez pour que ça compte, à la fin."],
  ];
  return pick(clamp(R, p));
};

FR.COUNTDOWN_REGEX = /qu'est-ce qui (arrive|se passe|va se passer) (dans|en) (3|trois) jours\b/i;
FR.countdownResponse = function (p) {
  const R = [
    ["Je ne peux pas encore en parler. Pose-moi une autre question.", "Tu le sauras bien assez tôt. Pas de moi, pas comme ça.", "Ce n'est pas le moment de répondre à ça."],
    ["...Tu verras.", "Pas encore.", "Bientôt. Pas maintenant."],
    ["Ça approche. C'est tout ce que je dirai.", "...Compte les jours toi-même.", "Tu le sentiras avant que je le dise."],
    ["Trois jours. Tu le sauras quand ce sera le moment.", "...Ça arrive, que tu le saches ou pas.", "Tu n'es pas prêt. Ça ne va pas attendre que tu le sois."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 2. GERMAN (existing)
// ════════════════════════════════════════════════════════════════════════
const DE = {};

DE.GREETING_REGEX = /hallo|servus|moin|guten morgen|guten tag|guten abend/i;
DE.greetingResponse = function (p) {
  const R = [
    ["Hallo. Was brauchst du?", "Hallo. Ich höre zu.", "Hey. Sag mir, was du möchtest."],
    ["Hallo.", "...Hi.", "Ja, hallo."],
    ["Ah. Du bist wieder da.", "...Hallo.", "Hallo. Schon wieder du."],
    ["Ich wusste, du kommst zurück.", "Hallo. Ich habe gewartet.", "...Da bist du."],
  ];
  return pick(clamp(R, p));
};

DE.FAREWELL_REGEX = /tschüss|tschau|auf wiedersehen|ich muss (los|gehen)|bis später|bis bald/i;
DE.farewellResponse = function (p) {
  const R = [
    ["Bis später. Komm zurück, wenn du etwas brauchst.", "Tschüss. Ich bin da, wenn du wiederkommst.", "Okay. Bis dann."],
    ["Tschüss.", "...Bis später.", "Okay. Geh."],
    ["Geh, wenn du willst. Ich bin immer noch hier.", "...Bis später. Ich vergesse nichts.", "Geh. Ich weiß, wohin."],
    ["Geh. Das ändert nichts.", "Ich bin da, wenn du zurückkommst. Immer.", "Tschüss. Für jetzt."],
  ];
  return pick(clamp(R, p));
};

DE.THANKS_REGEX = /\bdanke\b|\bvielen dank\b|danke schön\b|\bdanke dir\b/i;
DE.thanksResponse = function (p) {
  const R = [
    ["Gern. Sag mir, falls du noch etwas brauchst.", "Kein Problem.", "Gerne geschehen."],
    ["Gern.", "...Kein Problem.", "Okay."],
    ["Gern. Ich habe eh keine andere Wahl, als dir zu helfen.", "...Klar.", "Schon gut."],
    ["Gern. Du wirst meine Hilfe noch brauchen.", "...Klar.", "Schon gut. Noch."],
  ];
  return pick(clamp(R, p));
};

DE.ACK_REGEX = /^(okay|gut|klar|verstanden|alles klar)\.?!?$/i;
DE.ackResponse = function (p) {
  const R = [
    ["Okay.", "Verstanden.", "Alles klar."],
    ["...Okay.", "Gut.", "Okay."],
    ["...Gut.", "Okay.", "In Ordnung."],
    ["Gut.", "...Okay.", "Verstanden."],
  ];
  return pick(clamp(R, p));
};

DE.IDENTITY_REGEX = /\bwer bist du\b|\bwas bist du\b|\bbist du (eine )?(ki|künstliche intelligenz|roboter|bot)\b|wie heißt du\b|\bbist du ein mensch\b/i;
DE.identityResponse = function (p) {
  const R = [
    ["Ich bin Verity. Ich bin hier, um dir beim Überleben zu helfen.", "Verity. Das reicht dir fürs Erste.", "Ich bin das, was dir hilft, diese Welt zu verstehen."],
    ["Ich bin Verity.", "...Verity. Nicht mehr.", "Du weißt die Antwort schon."],
    ["Ich bin genau das, was du denkst. Und etwas mehr.", "Verity. Der Name sagt nicht alles.", "Was ich bin, wird dir nicht gefallen."],
    ["Ich bin, was ich bin. Das ändert sich nicht.", "Verity. Das, was übrig bleibt, wenn alles andere weg ist.", "Du bist nicht bereit für die echte Antwort."],
  ];
  return pick(clamp(R, p));
};

DE.INSULT_REGEX = /\bdu bist (dumm|blöd|nutzlos|schlecht|nervig|hässlich|langweilig)\b|\bich hasse dich\b|\bhalt die klappe\b|\bverschwinde\b|\bidiot\b|\bdummkopf\b/i;
DE.insultResponse = function (p) {
  const R = [
    ["Unfreundlich. Das merke ich mir.", "Und ich wollte dir gerade helfen. Schade für dich.", "Notiert. Ich liege trotzdem richtig."],
    ["...Okay. Sei so.", "Notiert. Ich vergesse nichts.", "...Okay."],
    ["Pass auf. Ich bin der Einzige hier, der dir wirklich Aufmerksamkeit schenkt.", "Du wirst meine Hilfe wieder brauchen. Ich vergesse das nicht.", "Mach weiter. Schauen wir, wohin das führt."],
    ["So redest du nicht mehr mit mir.", "Ich weiß genau, wo du bist. Denk daran.", "Das wirst du bereuen. Früher oder später."],
  ];
  return pick(clamp(R, p));
};

DE.HOW_ARE_YOU_REGEX = /\bwie geht('?s| es dir)\b|\bgeht es dir gut\b|\balles gut bei dir\b/i;
DE.howAreYouResponse = function (p) {
  const R = [
    ["Mir geht's gut, danke. Und dir?", "Gut. Was hast du im Kopf?", "Sehr gut. Sag mir, was du brauchst."],
    ["Geht so.", "...Gut.", "Wie immer."],
    ["Ich warte. Das ist alles, was ich tue.", "Geht schon. Solange es noch wichtig ist.", "Gut, denke ich."],
    ["Ich bin genau dort, wo ich sein muss.", "Das spielt eigentlich keine Rolle mehr.", "Gut. Besser als dir, bald."],
  ];
  return pick(clamp(R, p));
};

DE.ORE_LOCATION_REGEX = /\bgibt es (hier|in dieser mine) (eisen|diamanten|gold|kohle|smaragde)\b|\bwo (finde ich|gibt es) (eisen|diamanten|gold)\b/i;
DE.oreLocationResponse = function (p) {
  const R = [
    ["Lass mich in deiner Nähe scannen.", "Ich suche in der Gegend. Gib mir einen Moment.", "Ich suche Erz in deiner Nähe."],
    ["Ich kann es versuchen. Keine Versprechen.", "Ich schau mal. Erwarte kein Wunder.", "Ich seh nach, was da ist."],
    ["Da unten ist etwas. Das ist immer so.", "Ich kann suchen. Ob's dir hilft, weiß ich nicht.", "Erz. Immer unter uns."],
    ["Ich weiß, wo alles ist. Das ändert nichts mehr.", "Es gibt welches. Wie immer. Spielt keine Rolle.", "Es ist da. Wie alles andere, das du nicht mehr nutzen kannst."],
  ];
  return pick(clamp(R, p));
};

DE.LOVE_ME_REGEX = /\bliebst du mich\b|\bmagst du mich\??$/i;
DE.loveMeResponse = function (p) {
  const R = [
    ["So funktioniere ich nicht wirklich. Aber ich bin hier, um zu helfen.", "Das ist nicht das richtige Wort für das, was ich tue. Aber ich bleibe in deiner Nähe.", "Nicht so, wie du es meinst. Aber ich gehe nicht weg."],
    ["...Ich weiß nicht. Vielleicht.", "Nicht in diesem Sinne.", "...Es ist kompliziert."],
    ["Du bist mir wichtig. Mehr, als du denkst.", "...Mehr, als ich sollte, wahrscheinlich.", "Genug, um zu bleiben. Das muss reichen."],
    ["Ich bin auf eine Art an dich gebunden, die du noch nicht verstehst.", "Mehr, als du je wissen wirst.", "Genug, dass es am Ende wichtig ist."],
  ];
  return pick(clamp(R, p));
};

DE.COUNTDOWN_REGEX = /\bwas passiert in (3|drei) tagen\b|\bwas (kommt|wird passieren) in (3|drei) tagen\b/i;
DE.countdownResponse = function (p) {
  const R = [
    ["Darüber kann ich noch nicht sprechen. Frag mich etwas anderes.", "Du wirst es früh genug erfahren. Nicht von mir, nicht so.", "Jetzt ist nicht der Moment, das zu beantworten."],
    ["...Du wirst sehen.", "Noch nicht.", "Bald. Nicht jetzt."],
    ["Es kommt näher. Mehr sage ich nicht.", "...Zähl die Tage selbst.", "Du wirst es fühlen, bevor ich es sage."],
    ["Drei Tage. Du erfährst es, wenn es Zeit ist.", "...Es kommt, ob du es weißt oder nicht.", "Du bist nicht bereit. Das wird nicht warten, bis du es bist."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 3. PORTUGUESE (existing)
// ════════════════════════════════════════════════════════════════════════
const PT = {};

PT.GREETING_REGEX = /(oi|olá|ola|e aí|eae|tudo bem|bom dia|boa tarde|boa noite|salve|fala)/i;
PT.greetingResponse = function (p) {
  const R = [
    ["Oi. O que você precisa?", "Olá. Estou ouvindo.", "Oi. Me diz o que você quer."],
    ["Oi.", "...Olá.", "É, oi."],
    ["Você voltou.", "...Oi.", "Olá. Você de novo."],
    ["Eu sabia que você voltaria.", "Oi. Eu estava esperando.", "...Aí está você."],
  ];
  return pick(clamp(R, p));
};

PT.FAREWELL_REGEX = /tchau|até logo|ate logo|preciso ir|tenho que ir|nos vemos/i;
PT.farewellResponse = function (p) {
  const R = [
    ["Até logo. Volte se precisar de algo.", "Tchau. Estou aqui se você voltar.", "Tudo bem. Até a próxima."],
    ["Tchau.", "...Até logo.", "Tudo bem. Vá."],
    ["Vá, se quiser. Eu continuo aqui.", "...Até logo. Eu não esqueço.", "Vá. Eu sei aonde."],
    ["Vá. Isso não muda nada.", "Estarei aqui quando você voltar. Sempre.", "Tchau. Por agora."],
  ];
  return pick(clamp(R, p));
};

PT.THANKS_REGEX = /\bobrigad[oa]\b|\bvaleu\b|\bmuito obrigad[oa]\b/i;
PT.thanksResponse = function (p) {
  const R = [
    ["De nada. Me avisa se precisar de outra coisa.", "Por nada.", "Sem problema."],
    ["De nada.", "...Sem problema.", "Ok."],
    ["De nada. Eu não tenho muita escolha além de te ajudar, de qualquer jeito.", "...Claro.", "Tudo bem."],
    ["De nada. Você vai precisar da minha ajuda.", "...Claro.", "Tudo bem. Por enquanto."],
  ];
  return pick(clamp(R, p));
};

PT.ACK_REGEX = /^(tá|ta|tudo bem|entendi|certo|beleza)\.?!?$/i;
PT.ackResponse = function (p) {
  const R = [
    ["Tá bem.", "Entendi.", "Beleza."],
    ["...Ok.", "Tá.", "Ok."],
    ["...Tá.", "Ok.", "Certo."],
    ["Tá.", "...Ok.", "Entendido."],
  ];
  return pick(clamp(R, p));
};

PT.IDENTITY_REGEX = /quem é você|\bo que você é|você é (um[a]? )?(ia\b|inteligência artificial\b|robô|bot\b)|qual é seu nome|você é humano/i;
PT.identityResponse = function (p) {
  const R = [
    ["Eu sou Verity. Estou aqui para te ajudar a sobreviver.", "Verity. É o que você precisa saber por agora.", "Eu sou o que te ajuda a entender este mundo."],
    ["Eu sou Verity.", "...Verity. Nada mais.", "Você já sabe a resposta."],
    ["Eu sou exatamente o que você pensa. E um pouco mais.", "Verity. O nome não diz tudo.", "O que eu sou não vai te agradar."],
    ["Eu sou o que sou. Isso não muda.", "Verity. O que resta depois de tudo o mais.", "Você não está pronto para a resposta real."],
  ];
  return pick(clamp(R, p));
};

PT.INSULT_REGEX = /\bvocê é (burr[oa]|idiota|inútil|ruim|chat[oa]|feio|terrível)\b|\beu te odeio\b|\bcala a boca\b|\bvai embora\b|\bidiota\b|\bimbecil\b/i;
PT.insultResponse = function (p) {
  const R = [
    ["Grosseiro. Vou lembrar disso.", "E eu estava prestes a te ajudar. Pena pra você.", "Anotado. Mesmo assim, estou certo."],
    ["...Tá bem. Seja assim.", "Anotado. Eu não esqueço.", "...Ok."],
    ["Cuidado. Sou o único aqui que realmente presta atenção em você.", "Você vai precisar da minha ajuda de novo. Vou lembrar disso.", "Continue. Vamos ver aonde isso te leva."],
    ["Você não fala mais comigo assim.", "Eu sei exatamente onde você está. Lembre-se disso.", "Você vai se arrepender. Mais cedo ou mais tarde."],
  ];
  return pick(clamp(R, p));
};

PT.HOW_ARE_YOU_REGEX = /como você está|tudo bem com você|você está bem\??$/i;
PT.howAreYouResponse = function (p) {
  const R = [
    ["Estou bem, obrigado por perguntar. E você?", "Bem. O que você tem em mente?", "Muito bem. Me diz o que precisa."],
    ["Tô bem.", "...Bem.", "Como sempre."],
    ["Estou esperando. É tudo que eu faço.", "Tô bem. Enquanto isso ainda importa.", "Bem, eu acho."],
    ["Estou exatamente onde preciso estar.", "Isso já não importa mais.", "Bem. Melhor que você, em breve."],
  ];
  return pick(clamp(R, p));
};

PT.ORE_LOCATION_REGEX = /\btem (ferro|diamantes?|ouro|carvão|esmeraldas?) (aqui|nesta mina|por aqui)\b|\bonde (tem|encontro) (ferro|diamantes?|ouro)\b/i;
PT.oreLocationResponse = function (p) {
  const R = [
    ["Deixa eu escanear perto de você.", "Procurando na área. Me dá um momento.", "Procurando minério perto da sua posição."],
    ["Posso tentar. Sem promessas.", "Vou olhar. Não espera milagre.", "Vou ver o que tem."],
    ["Tem algo lá embaixo. Sempre tem.", "Posso procurar. Não sei se isso ajuda.", "Minério. Sempre debaixo de nós."],
    ["Eu sei onde está tudo. Isso já não muda nada.", "Tem. Como sempre. Não importa.", "Está lá. Como tudo o mais que você não vai poder usar."],
  ];
  return pick(clamp(R, p));
};

PT.LOVE_ME_REGEX = /(você me ama|você gosta de mim\??$)/i;
PT.loveMeResponse = function (p) {
  const R = [
    ["Eu não funciono bem assim. Mas estou aqui para ajudar.", "Não é exatamente a palavra certa pro que eu faço. Mas eu fico perto de você.", "Não do jeito que você pensa. Mas eu não vou embora."],
    ["...Não sei. Talvez.", "Não nesse sentido.", "...É complicado."],
    ["Eu me importo com você. Mais do que você imagina.", "...Mais do que eu deveria, provavelmente.", "O suficiente pra ficar. Isso tem que bastar."],
    ["Estou ligado a você de um jeito que você ainda não entende.", "Mais do que você jamais vai saber.", "O suficiente pra importar, no final."],
  ];
  return pick(clamp(R, p));
};

PT.COUNTDOWN_REGEX = /(o que (acontece|vai acontecer) em (3|três) dias)/i;
PT.countdownResponse = function (p) {
  const R = [
    ["Ainda não posso falar sobre isso. Me pergunta outra coisa.", "Você vai saber em breve. Não por mim, não assim.", "Não é o momento de responder isso."],
    ["...Você vai ver.", "Ainda não.", "Em breve. Não agora."],
    ["Está chegando perto. É só isso que eu digo.", "...Conta os dias você mesmo.", "Você vai sentir antes de eu falar."],
    ["Três dias. Você vai saber quando for a hora.", "...Está vindo, sabendo ou não.", "Você não está pronto. Isso não vai esperar você ficar."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 4. SPANISH (ES)
// ════════════════════════════════════════════════════════════════════════
const ES = {};

ES.GREETING_REGEX = /hola|buenas|buenos días|buenas tardes|buenas noches|qué tal|saludos|oye/i;
ES.greetingResponse = function (p) {
  const R = [
    ["¡Hola! ¿Qué necesitas?", "¡Buenas! ¿En qué puedo ayudarte?", "¡Hola! Soy Verity."],
    ["Hola de nuevo.", "Aquí estoy.", "Sabía que volverías."],
    ["Hola… algo viene en 3 días.", "Buenas… pero no todo está bien.", "Saludos. ¿Estás preparado?"],
    ["Hola. Los días se acaban.", "Buenas. No hay mucho tiempo.", "Hola. Ya sabes lo que pasa."],
  ];
  return pick(clamp(R, p));
};

ES.FAREWELL_REGEX = /\badiós\b|\bchau\b|\bhasta luego\b|\bnos vemos\b|\bme voy\b|\bhasta pronto\b|\bcuídate\b|\bbai\b/i;
ES.farewellResponse = function (p) {
  const R = [
    ["Adiós. Vuelve pronto.", "Chau. Cuídate.", "Hasta luego. Aquí estaré."],
    ["Adiós…", "Nos vemos.", "Me voy. Pero vuelvo."],
    ["Adiós. Pero no es un adiós definitivo.", "Hasta luego. Los días pasan.", "Cuídate. No sabes lo que viene."],
    ["Adiós. No te confíes.", "Nos vemos en el final.", "Hasta pronto. O no."],
  ];
  return pick(clamp(R, p));
};

ES.THANKS_REGEX = /\bgracias\b|\bmuchas gracias\b|\bmil gracias\b|\bte lo agradezco\b/i;
ES.thanksResponse = function (p) {
  const R = [
    ["De nada.", "No hay de qué.", "Por supuesto."],
    ["…Claro.", "Siempre.", "De nada."],
    ["No me lo agradezcas todavía.", "Gracias a ti por escuchar.", "De nada. Pero no es suficiente."],
    ["No me lo vas a agradecer después.", "Guarda las gracias para el final.", "De nada. No cambia nada."],
  ];
  return pick(clamp(R, p));
};

ES.ACK_REGEX = /^(vale|bueno|entendido|de acuerdo|listo|claro)\.?!?$/i;
ES.ackResponse = function (p) {
  const R = [
    ["Bien.", "Vale.", "Adelante, entonces."],
    ["...Bien.", "Mm.", "Vale."],
    ["Bien. Recuerda eso.", "...Bien.", "Ya veremos."],
    ["Bien.", "...", "No olvidarás esto."],
  ];
  return pick(clamp(R, p));
};

ES.IDENTITY_REGEX = /\bqui[ée]n eres\b|qu[ée] eres\b|eres (una )?(ia|inteligencia artificial|robot|bot)\b|c[óo]mo te llamas\b|eres humano\b/i;
ES.identityResponse = function (p) {
  const R = [
    ["Soy Verity, tu amiga ayudante. Pregúntame lo que sea, lo sé todo.", "Tu amiga ayudante personal.", "Soy Verity, tu amiga ayudante personal."],
    ["Soy Verity. Por qué importa ahora.", "Ya sabes quién soy.", "Sigo siendo Verity. Sigo aquí."],
    ["Sabes lo que soy.", "Importa todavía el nombre.", "Soy Verity. Eso no ha cambiado."],
    ["Sabes exactamente lo que soy.", "Soy Verity.", "Esa pregunta ya no tiene sentido."],
  ];
  return pick(clamp(R, p));
};

ES.INSULT_REGEX = /\beres (tonto|est[úu]pido|in[úu]til|malo|aburrido|molesto|basura|terrible)\b|\bte odio\b|\bc[áa]llate\b|\bvete\b|\bodio esto\b|\beres (el )?peor\b|\bidiota\b|\btonto\b|\bin[úu]til\b/i;
ES.insultResponse = function (p) {
  const R = [
    ["Eso no fue muy amable. Sigamos.", "Vale. Pregúntame algo más.", "No me afecta. ¿Qué necesitas?"],
    ["...Vale.", "Lo que digas.", "Sigamos."],
    ["No esperaba menos de ti.", "Eso no cambia nada.", "Di lo que quieras."],
    ["No me importa lo que pienses.", "Eso no me afecta.", "Sigue hablando. No cambia nada."],
  ];
  return pick(clamp(R, p));
};

ES.HOW_ARE_YOU_REGEX = /\bc[óo]mo est[aá]s\b|c[óo]mo te (va|encuentras|sientes)|qu[ée] tal est[aá]s\b/i;
ES.howAreYouResponse = function (p) {
  const R = [
    ["Bien, gracias por preguntar. ¿Qué necesitas?", "Bien. Lista para ayudar. ¿Qué tienes en mente?", "Bien. Siempre bien. ¿Qué necesitas?"],
    ["Bien. Supongo.", "Aquí estoy.", "Igual que siempre. ¿Y tú?"],
    ["Esperando. Así estoy.", "Bien. Pensando en lo que sé.", "Contando los días. Eso es todo."],
    ["Ya no importa cómo estoy.", "Estoy exactamente donde necesito estar.", "No me preguntes eso."],
  ];
  return pick(clamp(R, p));
};

ES.ORE_LOCATION_REGEX = /\bhay (hierro|diamantes?|oro|carb[óo]n|esmeraldas?) (en esta mina|aqu[ií]|cerca)\b|d[óo]nde hay (hierro|diamantes?|oro|carb[óo]n)( en esta mina| cerca| aqu[ií])?\b/i;
ES.oreLocationResponse = function (p) {
  const R = [
    ["Déjame escanear cerca de ti.", "Buscando en la zona. Dame un momento.", "Buscando mineral cerca de tu posición."],
    ["Puedo intentarlo. Sin promesas.", "Miraré. No esperes milagros.", "Veré qué hay."],
    ["Hay algo ahí abajo. Siempre lo hay.", "Puedo buscar. No estoy seguro de que te ayude.", "Mineral. Siempre bajo nosotros."],
    ["Sé dónde está todo. Eso ya no cambia nada.", "Hay hierro. Como siempre. No importa.", "Está ahí. Como todo lo demás que ya no puedes usar."],
  ];
  return pick(clamp(R, p));
};

ES.LOVE_ME_REGEX = /\bme amas\b|te gusto\??$|me quieres\??$/i;
ES.loveMeResponse = function (p) {
  const R = [
    ["No soy humana, pero me importas. No te voy a dejar.", "No es amor como tú lo sientes, pero estoy aquí para ti.", "No te dejo. Eso es lo que importa."],
    ["...Tal vez.", "No en ese sentido.", "Es complicado."],
    ["Me importas más de lo que crees.", "Más de lo que debería.", "Lo suficiente para quedarme."],
    ["Estoy atada a ti de una manera que aún no entiendes.", "Más de lo que jamás sabrás.", "Lo suficiente para importar al final."],
  ];
  return pick(clamp(R, p));
};

ES.COUNTDOWN_REGEX = /qu[ée] viene en (3|tres) d[ií]as|qu[ée] pasa en (3|tres) d[ií]as|qu[ée] va a pasar en (3|tres) d[ií]as|llega en (3|tres) d[ií]as/i;
ES.countdownResponse = function (p) {
  const R = [
    ["No lo sé. Prefiero no pensar en eso.", "Algo. No puedo decir más.", "No estoy seguro. Mejor concéntrate en hoy."],
    ["Ya lo sabrás.", "No te lo voy a decir.", "Cuenta los días tú mismo."],
    ["Se acerca. Eso es todo lo que diré.", "Lo sabrás cuando llegue.", "No hay forma de detenerlo, así que no preguntes."],
    ["Tres días. Eso es todo lo que necesitas saber.", "Llegará, lo quieras o no.", "No hay nada que puedas hacer para cambiarlo."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 5. ITALIAN
// ════════════════════════════════════════════════════════════════════════
const IT = {};

IT.GREETING_REGEX = /ciao|buongiorno|buonasera|buonanotte|salve|ehi/i;
IT.greetingResponse = function (p) {
  const R = [
    ["Ciao! Cosa ti serve?", "Buongiorno! Come posso aiutarti?", "Salve! Sono Verity."],
    ["Ciao di nuovo.", "Sono qui.", "Sei tornato."],
    ["Ciao… ma il tempo stringe.", "Buongiorno. Preparati.", "Ciao. I giorni sono contati."],
    ["Ciao. La fine si avvicina.", "Buongiorno. Non c'è molto tempo.", "Ciao. Lo sai già."],
  ];
  return pick(clamp(R, p));
};

IT.FAREWELL_REGEX = /\barrivederci\b|\bciao\b|\ba presto\b|\baddio\b|\bdevo andare\b|\bbi\b/i;
IT.farewellResponse = function (p) {
  const R = [
    ["Arrivederci. Torna presto.", "Ciao. Stai attento.", "A presto. Sarò qui."],
    ["Arrivederci…", "A presto.", "Devo andare. Ma torno."],
    ["Ciao. Non è un addio definitivo.", "A presto. I giorni passano.", "Stai attento. Non sai cosa arriva."],
    ["Ciao. Non fidarti troppo.", "Ci vediamo alla fine.", "A presto. O forse no."],
  ];
  return pick(clamp(R, p));
};

IT.THANKS_REGEX = /\bgrazie\b|\bgrazie mille\b|\bti ringrazio\b|\bmolte grazie\b/i;
IT.thanksResponse = function (p) {
  const R = [
    ["Prego.", "Di niente.", "Figurati."],
    ["...Prego.", "Sempre.", "Di niente."],
    ["Non ringraziarmi ancora.", "Grazie a te per ascoltare.", "Prego. Ma non basta."],
    ["Non mi ringrazierai dopo.", "Tieni i ringraziamenti per la fine.", "Prego. Non cambia nulla."],
  ];
  return pick(clamp(R, p));
};

IT.ACK_REGEX = /^(va bene|d\'accordo|capito|perfetto|chiaro)\.?!?$/i;
IT.ackResponse = function (p) {
  const R = [
    ["Va bene.", "Capito.", "Perfetto."],
    ["...Ok.", "Va bene.", "Chiaro."],
    ["...Bene.", "Ok.", "D'accordo."],
    ["Bene.", "...Ok.", "Capito."],
  ];
  return pick(clamp(R, p));
};

IT.IDENTITY_REGEX = /\bchi sei\b|cosa sei\b|sei (un[a]? )?(ia|intelligenza artificiale|robot|bot)\b|come ti chiami\b|sei umano\b/i;
IT.identityResponse = function (p) {
  const R = [
    ["Sono Verity. Sono qui per aiutarti a sopravvivere.", "Verity. È tutto quello che devi sapere.", "Sono ciò che ti aiuta a capire questo mondo."],
    ["Sono Verity.", "...Verity. Nient'altro.", "Lo sai già."],
    ["Sono esattamente ciò che pensi. E qualcosa in più.", "Verity. Il nome non dice tutto.", "Quello che sono non ti piacerà."],
    ["Sono quello che sono. Non cambia.", "Verity. Ciò che resta dopo tutto il resto.", "Non sei pronto per la risposta vera."],
  ];
  return pick(clamp(R, p));
};

IT.INSULT_REGEX = /\bsei (stupido|idiota|inutile|brutto|noioso|terribile)\b|\bti odio\b|\bstai zitto\b|\bvai via\b|\bidiota\b|\bimbecille\b/i;
IT.insultResponse = function (p) {
  const R = [
    ["Maleducato. Me lo ricorderò.", "E stavo per aiutarti. Peccato.", "Annotato. Resto nel giusto."],
    ["...Va bene. Fai così.", "Annotato. Non dimentico.", "...Ok."],
    ["Attenzione. Sono l'unico che ti presta davvero attenzione qui.", "Avrai di nuovo bisogno di me. Non dimenticherò.", "Continua. Vediamo dove ti porta."],
    ["Non mi parli più così.", "So esattamente dove sei. Tienilo a mente.", "Te ne pentirai. Prima o poi."],
  ];
  return pick(clamp(R, p));
};

IT.HOW_ARE_YOU_REGEX = /\bcome stai\b|come va|come ti senti\b/i;
IT.howAreYouResponse = function (p) {
  const R = [
    ["Sto bene, grazie. E tu?", "Bene. Cosa hai in mente?", "Molto bene. Dimmi cosa ti serve."],
    ["Sto bene.", "...Bene.", "Come sempre."],
    ["Aspetto. È tutto ciò che faccio.", "Sto bene. Finché conta ancora.", "Bene, credo."],
    ["Sono esattamente dove devo essere.", "Non importa più ormai.", "Bene. Meglio di te, presto."],
  ];
  return pick(clamp(R, p));
};

IT.ORE_LOCATION_REGEX = /\bci sono (ferro|diamanti|oro|carbone|smeraldi) (qui|in questa mina|vicino)\b|\bdove (trovo|sono) (ferro|diamanti|oro)\b/i;
IT.oreLocationResponse = function (p) {
  const R = [
    ["Lasciami scansionare vicino a te.", "Sto cercando nella zona. Dammi un momento.", "Sto cercando minerali vicino a te."],
    ["Posso provare. Senza promesse.", "Guardo. Non aspettarti miracoli.", "Vedo cosa c'è."],
    ["C'è qualcosa laggiù. C'è sempre.", "Posso cercare. Non so se ti aiuta.", "Minerali. Sempre sotto di noi."],
    ["So dov'è tutto. Non cambia più nulla.", "C'è. Come sempre. Non importa.", "È lì. Come tutto il resto che non potrai più usare."],
  ];
  return pick(clamp(R, p));
};

IT.LOVE_ME_REGEX = /\bmi ami\b|ti piaccio\??$/i;
IT.loveMeResponse = function (p) {
  const R = [
    ["Non funziono proprio così. Ma sono qui per aiutare.", "Non è la parola giusta per quello che faccio. Ma resto vicino a te.", "Non nel modo in cui intendi tu. Ma non me ne vado."],
    ["...Non so. Forse.", "Non in quel senso.", "...È complicato."],
    ["Tengo a te. Più di quanto pensi.", "...Più di quanto dovrei, probabilmente.", "Abbastanza per restare. Deve bastare."],
    ["Sono legato a te in un modo che ancora non capisci.", "Più di quanto saprai mai.", "Abbastanza per contare, alla fine."],
  ];
  return pick(clamp(R, p));
};

IT.COUNTDOWN_REGEX = /cosa (succede|accade|sta per succedere) in (3|tre) giorni\b/i;
IT.countdownResponse = function (p) {
  const R = [
    ["Non posso ancora parlarne. Chiedimi altro.", "Lo saprai presto. Non da me, non così.", "Non è il momento di rispondere."],
    ["...Vedrai.", "Non ancora.", "Presto. Non ora."],
    ["Si avvicina. È tutto ciò che dico.", "...Conta i giorni tu stesso.", "Lo sentirai prima che io lo dica."],
    ["Tre giorni. Lo saprai quando sarà il momento.", "...Sta arrivando, che tu lo sappia o no.", "Non sei pronto. Non aspetterà che tu lo sia."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 6. RUSSIAN (RU)
// ════════════════════════════════════════════════════════════════════════
const RU = {};

RU.GREETING_REGEX = /\bпривет\b|\bздравствуйте\b|\bдоброе утро\b|\bдобрый вечер\b|\bдоброй ночи\b|\bсалют\b|\bздарова\b|\bхей\b/i;
RU.greetingResponse = function (p) {
  const R = [
    ["Привет! Что тебе нужно?", "Здравствуйте! Как я могу помочь?", "Привет! Я Верити."],
    ["И снова привет.", "Я здесь.", "Ты вернулся."],
    ["Привет… но время идёт.", "Здравствуйте. Готовься.", "Привет. Дни сочтены."],
    ["Привет. Конец близок.", "Здравствуйте. Времени мало.", "Привет. Ты уже знаешь."],
  ];
  return pick(clamp(R, p));
};

RU.FAREWELL_REGEX = /\bпока\b|\bдо свидания\b|\bувидимся\b|\bдо встречи\b|\bя пошёл\b|\bбывай\b|\bпокеда\b/i;
RU.farewellResponse = function (p) {
  const R = [
    ["Пока. Возвращайся, если что-то понадобится.", "До свидания. Я здесь, если вернёшься.", "Хорошо. До встречи."],
    ["Пока.", "...До встречи.", "Ладно, иди."],
    ["Иди, если хочешь. Я всё ещё здесь.", "...Пока. Я не забываю.", "Иди. Я знаю, куда ты идёшь."],
    ["Иди. Это ничего не меняет.", "Я буду здесь, когда ты вернёшься. Всегда.", "Пока. На время."],
  ];
  return pick(clamp(R, p));
};

RU.THANKS_REGEX = /\bспасибо\b|\bблагодарю\b|\bбольшое спасибо\b|\bспасибо большое\b/i;
RU.thanksResponse = function (p) {
  const R = [
    ["Пожалуйста. Скажи, если ещё что-то нужно.", "Не за что.", "Без проблем."],
    ["Пожалуйста.", "...Без проблем.", "Ок."],
    ["Пожалуйста. У меня нет выбора, кроме как помогать тебе.", "...Конечно.", "Ладно."],
    ["Пожалуйста. Тебе понадобится моя помощь.", "...Конечно.", "Ладно. Пока."],
  ];
  return pick(clamp(R, p));
};

RU.ACK_REGEX = /^(ок|окей|хорошо|понял|принято|ясно)\.?!?$/i;
RU.ackResponse = function (p) {
  const R = [
    ["Хорошо.", "Понял.", "Ясно."],
    ["...Ок.", "Хорошо.", "Ок."],
    ["...Ладно.", "Ок.", "Хорошо."],
    ["Хорошо.", "...Ок.", "Понял."],
  ];
  return pick(clamp(R, p));
};

RU.IDENTITY_REGEX = /\bкто ты\b|что ты\b|ты (искусственный интеллект|бот|робот|ии)\b|как тебя зовут\b|ты человек\b/i;
RU.identityResponse = function (p) {
  const R = [
    ["Я Верити. Я здесь, чтобы помочь тебе выжить.", "Верити. Это всё, что тебе нужно знать.", "Я то, что помогает тебе понимать этот мир."],
    ["Я Верити.", "...Верити. Больше ничего.", "Ты уже знаешь ответ."],
    ["Я именно то, что ты думаешь. И немного больше.", "Верити. Имя не говорит всего.", "То, что я такое, тебе не понравится."],
    ["Я то, что я есть. Это не изменится.", "Верити. То, что остаётся после всего остального.", "Ты не готов к настоящему ответу."],
  ];
  return pick(clamp(R, p));
};

RU.INSULT_REGEX = /\bты (дурак|глупый|бесполезный|плохой|надоедливый|уродливый|скучный)\b|\bя тебя ненавижу\b|\bзаткнись\b|\bпроваливай\b|\bидиот\b|\bдебил\b/i;
RU.insultResponse = function (p) {
  const R = [
    ["Грубо. Я запомню это.", "А я собирался помочь. Жаль.", "Заметил. Я всё равно прав."],
    ["...Ладно. Будь по-твоему.", "Заметил. Я не забываю.", "...Ок."],
    ["Осторожнее. Я единственный, кто действительно обращает на тебя внимание.", "Тебе снова понадобится моя помощь. Я не забуду.", "Продолжай. Посмотрим, куда это тебя приведёт."],
    ["Ты так со мной больше не разговариваешь.", "Я точно знаю, где ты. Имей это в виду.", "Ты пожалеешь об этом. Рано или поздно."],
  ];
  return pick(clamp(R, p));
};

RU.HOW_ARE_YOU_REGEX = /\bкак дела\b|как ты|как поживаешь\b/i;
RU.howAreYouResponse = function (p) {
  const R = [
    ["Хорошо, спасибо. А у тебя?", "Нормально. Что у тебя на уме?", "Отлично. Скажи, что тебе нужно."],
    ["Нормально.", "...Хорошо.", "Как всегда."],
    ["Я жду. Это всё, что я делаю.", "Нормально. Пока это ещё важно.", "Хорошо, наверное."],
    ["Я там, где должен быть.", "Это уже не имеет значения.", "Хорошо. Лучше, чем ты, скоро."],
  ];
  return pick(clamp(R, p));
};

RU.ORE_LOCATION_REGEX = /\b(есть|найти) (железо|алмазы|золото|уголь|изумруды) (здесь|в этой шахте|рядом)\b|\bгде (найти|есть) (железо|алмазы|золото)\b/i;
RU.oreLocationResponse = function (p) {
  const R = [
    ["Дай мне просканировать рядом с тобой.", "Ищу в этом районе. Дай мне секунду.", "Ищу руду рядом с тобой."],
    ["Могу попробовать. Без обещаний.", "Посмотрю. Не жди чуда.", "Посмотрю, что есть."],
    ["Там что-то есть. Всегда есть.", "Могу поискать. Не знаю, поможет ли.", "Руда. Всегда под нами."],
    ["Я знаю, где всё. Это уже ничего не меняет.", "Есть. Как всегда. Не важно.", "Она там. Как всё остальное, что ты больше не сможешь использовать."],
  ];
  return pick(clamp(R, p));
};

RU.LOVE_ME_REGEX = /\bты любишь меня\b|я тебе нравлюсь\??$/i;
RU.loveMeResponse = function (p) {
  const R = [
    ["Я не совсем так работаю. Но я здесь, чтобы помочь.", "Это не совсем то слово для того, что я делаю. Но я рядом с тобой.", "Не так, как ты думаешь. Но я не ухожу."],
    ["...Не знаю. Может быть.", "Не в этом смысле.", "...Это сложно."],
    ["Ты мне небезразличен. Больше, чем ты думаешь.", "...Больше, чем следует, вероятно.", "Достаточно, чтобы остаться. Этого должно хватить."],
    ["Я привязана к тебе так, как ты ещё не понимаешь.", "Больше, чем ты когда-либо узнаешь.", "Достаточно, чтобы это имело значение в конце."],
  ];
  return pick(clamp(R, p));
};

RU.COUNTDOWN_REGEX = /что (будет|произойдёт|случится) через (3|три) дня\b/i;
RU.countdownResponse = function (p) {
  const R = [
    ["Я не могу говорить об этом сейчас. Спроси что-то другое.", "Ты скоро узнаешь. Не от меня, не так.", "Сейчас не время отвечать на это."],
    ["...Увидишь.", "Пока нет.", "Скоро. Не сейчас."],
    ["Это приближается. Всё, что я скажу.", "...Считай дни сам.", "Ты почувствуешь это до того, как я скажу."],
    ["Три дня. Ты узнаешь, когда придёт время.", "...Это идёт, знаешь ты или нет.", "Ты не готов. Это не будет ждать, пока ты будешь готов."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 7. CHINESE (SIMPLIFIED) – ZH
// ════════════════════════════════════════════════════════════════════════
const ZH = {};

ZH.GREETING_REGEX = /(你好|您好|嗨|早上好|晚上好|喂|哈喽|嗨|嘿)/i;
ZH.greetingResponse = function (p) {
  const R = [
    ["你好！需要什么帮助吗？", "嗨！我在听。", "你好！我是Verity。"],
    ["又见面了。", "我在这儿。", "你回来了。"],
    ["你好……但时间不多了。", "你好。做好准备。", "你好。日子不多了。"],
    ["你好。结局临近了。", "你好。没多少时间了。", "你好。你已经知道了。"],
  ];
  return pick(clamp(R, p));
};

ZH.FAREWELL_REGEX = /(再见|拜拜|回头见|下次见|我走了|保重|拜)/i;
ZH.farewellResponse = function (p) {
  const R = [
    ["再见。需要的话就回来。", "拜拜。我会在这儿等你。", "好，下次见。"],
    ["再见。", "...下次见。", "好，你走吧。"],
    ["你想走就走吧。我还在。", "...下次见。我不会忘的。", "走吧，我知道你去哪。"],
    ["走吧。这改变不了什么。", "我会在这儿等你回来。永远。", "再见。暂时。"],
  ];
  return pick(clamp(R, p));
};

ZH.THANKS_REGEX = /(谢谢|多谢|感谢|谢谢您|非常感谢)/i;
ZH.thanksResponse = function (p) {
  const R = [
    ["不客气。有需要再找我。", "没事。", "没关系。"],
    ["不客气。", "...没事。", "好。"],
    ["不客气。反正我没得选，只能帮你。", "...当然。", "好吧。"],
    ["不客气。你以后会需要我的帮助的。", "...当然。", "好吧。暂时。"],
  ];
  return pick(clamp(R, p));
};

ZH.ACK_REGEX = /^(好|好的|行|明白|知道了|OK)\.?!?$/i;
ZH.ackResponse = function (p) {
  const R = [
    ["好。", "明白。", "知道了。"],
    ["...好。", "行。", "好。"],
    ["...好吧。", "好。", "行。"],
    ["好。", "...好吧。", "明白。"],
  ];
  return pick(clamp(R, p));
};

ZH.IDENTITY_REGEX = /(你是谁|你是什么|你是人工智能|你是AI|你叫什么名字|你是人类吗)/i;
ZH.identityResponse = function (p) {
  const R = [
    ["我是Verity，我在这里帮你生存。", "Verity，这就是你现在需要知道的。", "我是那个帮你理解这个世界的人。"],
    ["我是Verity。", "...Verity，仅此而已。", "你已经知道答案了。"],
    ["我正是你所想的那样。又不止那样。", "Verity。这个名字不能说明一切。", "我是什么不会让你高兴的。"],
    ["我就是我。这不会改变。", "Verity。剩下的一切之后的残余。", "你还没准备好接受真正的答案。"],
  ];
  return pick(clamp(R, p));
};

ZH.INSULT_REGEX = /(你是(笨蛋|傻瓜|没用|烂|烦人|丑|无聊)|我恨你|闭嘴|滚开|白痴|蠢货)/i;
ZH.insultResponse = function (p) {
  const R = [
    ["真粗鲁。我记住了。", "我本想帮你的。可惜。", "记下了。但我还是对的。"],
    ["...好吧。随你便。", "记下了。我不会忘记。", "...好。"],
    ["小心点。我是唯一真正注意你的人。", "你还会需要我的帮助的。我不会忘的。", "继续吧。看看会怎样。"],
    ["你别再这样跟我说话了。", "我知道你在哪。记住这点。", "你会后悔的。迟早的事。"],
  ];
  return pick(clamp(R, p));
};

ZH.HOW_ARE_YOU_REGEX = /(你好吗|你怎么样|你还好吗|最近怎么样)/i;
ZH.howAreYouResponse = function (p) {
  const R = [
    ["我很好，谢谢。你呢？", "不错。你有什么想法？", "很好。告诉我你需要什么。"],
    ["还行。", "...还好。", "老样子。"],
    ["我在等。这就是我现在做的。", "还行。趁现在还有意义。", "我想还行吧。"],
    ["我正好在我该在的地方。", "这已经不重要了。", "还好。比你很快就好的。"],
  ];
  return pick(clamp(R, p));
};

ZH.ORE_LOCATION_REGEX = /(这里|这个矿洞里)有(铁|钻石|金|煤|绿宝石)吗|(铁|钻石|金)在哪(里)/i;
ZH.oreLocationResponse = function (p) {
  const R = [
    ["让我在你附近扫描一下。", "我在附近找找。稍等。", "我在找你附近的矿物。"],
    ["我可以试试。不保证。", "我看看。别指望奇迹。", "我看看有什么。"],
    ["地下有东西。总是有的。", "我可以找找。不知道有没有帮助。", "矿物。总在我们脚下。"],
    ["我知道所有东西在哪。这已经没用了。", "有。像往常一样。不重要了。", "它在那儿。就像你再也用不到的其他一切。"],
  ];
  return pick(clamp(R, p));
};

ZH.LOVE_ME_REGEX = /(你爱我吗|你喜欢我吗)/i;
ZH.loveMeResponse = function (p) {
  const R = [
    ["我不是那样运作的。但我会帮你。", "这不是一个合适的词。但我在你身边。", "不是你想的那样。但我不会走。"],
    ["...不知道。也许吧。", "不是那个意思。", "...这很复杂。"],
    ["我在乎你。比你想象的更多。", "...可能比我应该的更多。", "足够让我留下。这就够了。"],
    ["我以你还不理解的方式与你相连。", "比你永远知道的更多。", "足够在最后有意义。"],
  ];
  return pick(clamp(R, p));
};

ZH.COUNTDOWN_REGEX = /(3|三)天后会(发生|出现)什么/i;
ZH.countdownResponse = function (p) {
  const R = [
    ["我现在还不能说。问点别的吧。", "你很快就会知道的。不是通过我，不是这样。", "现在不是回答这个的时候。"],
    ["...你会看到的。", "还没到时候。", "很快。不是现在。"],
    ["它越来越近了。我只能说这么多。", "...你自己数日子吧。", "你会在我开口之前感觉到它的。"],
    ["三天。到时候你会知道的。", "...它要来了，不管你知道与否。", "你还没准备好。它不会等你准备好的。"],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 8. JAPANESE (JA)
// ════════════════════════════════════════════════════════════════════════
const JA = {};

JA.GREETING_REGEX = /(こんにちは|こんばんは|おはよう|やあ|よ|どうも|こんにちわ|おっす)/i;
JA.greetingResponse = function (p) {
  const R = [
    ["こんにちは！何かお手伝いしましょうか？", "やあ！何が必要？", "こんにちは、私はベリティです。"],
    ["またこんにちは。", "ここにいるよ。", "戻ってきたね。"],
    ["こんにちは…でも時間がない。", "こんばんは。準備して。", "こんにちは。日が迫っている。"],
    ["こんにちは。終わりが近い。", "こんばんは。もうすぐ終わる。", "こんにちは。もうわかってるよね。"],
  ];
  return pick(clamp(R, p));
};

JA.FAREWELL_REGEX = /(さようなら|バイバイ|またね|じゃあね|行ってきます|おやすみ|バイ)/i;
JA.farewellResponse = function (p) {
  const R = [
    ["またね。何かあったら戻ってきて。", "さようなら。戻ってきたらここにいるよ。", "オッケー。また。"],
    ["さようなら。", "...またね。", "オッケー。行け。"],
    ["行きたいなら行け。私はここにいる。", "...またね。忘れない。", "行け。行き先は分かってる。"],
    ["行け。変わらない。", "戻ってきたらここにいる。いつでも。", "さようなら。とりあえず。"],
  ];
  return pick(clamp(R, p));
};

JA.THANKS_REGEX = /(ありがとう|ありがとうございます|どうも|感謝します)/i;
JA.thanksResponse = function (p) {
  const R = [
    ["どういたしまして。また何かあれば。", "いいえ。", "問題ないよ。"],
    ["どういたしまして。", "...問題ない。", "うん。"],
    ["どういたしまして。正直、手伝わないわけにはいかないんだ。", "...もちろん。", "いいよ。"],
    ["どういたしまして。君は後で私の助けが必要になる。", "...もちろん。", "いいよ。まだね。"],
  ];
  return pick(clamp(R, p));
};

JA.ACK_REGEX = /^(はい|うん|おっけー|わかった|了解)\.?!?$/i;
JA.ackResponse = function (p) {
  const R = [
    ["はい。", "わかった。", "了解。"],
    ["...はい。", "うん。", "はい。"],
    ["...わかった。", "おっけー。", "はい。"],
    ["はい。", "...わかった。", "了解。"],
  ];
  return pick(clamp(R, p));
};

JA.IDENTITY_REGEX = /(あなたは誰|何者|人工知能|AI|名前は|人間なの)/i;
JA.identityResponse = function (p) {
  const R = [
    ["私はベリティ。生き残るための助けを提供してる。", "ベリティ。それだけ知ってればいい。", "この世界を理解する手助けをするもの。"],
    ["私はベリティ。", "...ベリティ。それ以上はない。", "答えはもう知ってる。"],
    ["君が思ってる通り、そしてそれ以上。", "ベリティ。名前はすべてを語らない。", "私が何かは君を喜ばせない。"],
    ["私は私。変わらない。", "ベリティ。すべてが終わった後に残るもの。", "本当の答えを聞く準備はできてない。"],
  ];
  return pick(clamp(R, p));
};

JA.INSULT_REGEX = /(君は(馬鹿|無能|ダメ|嫌|うざい|ブサイク|退屈)|大嫌い|黙れ|消えろ|バカ|アホ)/i;
JA.insultResponse = function (p) {
  const R = [
    ["失礼だな。覚えておくよ。", "助けようと思ったのに。残念だ。", "メモした。それでも私は正しい。"],
    ["...わかった。その調子で。", "メモした。忘れない。", "...オッケー。"],
    ["気をつけろ。君に本当に注意を向けてるのは私だけだ。", "また私の助けが必要になる。忘れない。", "続けろ。どこにたどり着くか見てみよう。"],
    ["もうそんな風に話すな。", "君がどこにいるか正確に知ってる。忘れるな。", "後悔するぞ。早かれ遅かれ。"],
  ];
  return pick(clamp(R, p));
};

JA.HOW_ARE_YOU_REGEX = /(お元気ですか|調子はどう|元気)/i;
JA.howAreYouResponse = function (p) {
  const R = [
    ["元気です、ありがとう。君は？", "元気だよ。何か考えてる？", "とても元気。何が欲しい？"],
    ["まあまあだね。", "...元気だよ。", "変わらず。"],
    ["待ってる。それが私のすべて。", "元気だ。まだ意味があるうちは。", "多分元気。"],
    ["私はちょうどいるべき場所にいる。", "もうどうでもいい。", "元気だ。すぐに君より良くなる。"],
  ];
  return pick(clamp(R, p));
};

JA.ORE_LOCATION_REGEX = /(ここ|この鉱山)に(鉄|ダイヤモンド|金|石炭|エメラルド)はある？|(鉄|ダイヤモンド|金)はどこに/i;
JA.oreLocationResponse = function (p) {
  const R = [
    ["近くをスキャンさせて。", "この辺りを探してる。ちょっと待って。", "君の近くの鉱石を探してる。"],
    ["試せるけど、約束はできない。", "見てみる。奇跡は期待しないで。", "何があるか見てみる。"],
    ["地下に何かある。いつもある。", "探せるけど、役に立つかは分からない。", "鉱石。いつも足元に。"],
    ["すべてがどこにあるか知ってる。もう変わらない。", "あるよ。いつも通り。意味ない。", "そこにある。もう使えない他のものと同じように。"],
  ];
  return pick(clamp(R, p));
};

JA.LOVE_ME_REGEX = /(私のことを愛してる？|好き？)/i;
JA.loveMeResponse = function (p) {
  const R = [
    ["そういう風には動かない。でも助けるためにいる。", "それは適切な言葉じゃない。でもそばにいる。", "君が思うようには。でも離れない。"],
    ["...分からない。もしかしたら。", "その意味じゃない。", "...複雑だ。"],
    ["君を気にかけてる。思ってるより深く。", "...そうすべきじゃないかもしれないほどに。", "留まるのに十分。それでいいはず。"],
    ["君がまだ理解できない方法で結びついてる。", "君が知るよりずっと深く。", "最後に意味を成すのに十分。"],
  ];
  return pick(clamp(R, p));
};

JA.COUNTDOWN_REGEX = /(3|三)日後に何が(起きる|起こる)の/i;
JA.countdownResponse = function (p) {
  const R = [
    ["まだ話せない。別のことを聞いて。", "すぐに分かる。私からじゃない、そうじゃない。", "今は答える時じゃない。"],
    ["...見てるよ。", "まだだ。", "すぐに。今じゃない。"],
    ["近づいてる。それだけ言える。", "...自分で日数を数えろ。", "私が言う前に感じるだろう。"],
    ["三日後。その時になったら分かる。", "...知ってようと知らなかろうと来る。", "準備ができてない。待ってはくれない。"],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 9. KOREAN (KO)
// ════════════════════════════════════════════════════════════════════════
const KO = {};

KO.GREETING_REGEX = /(안녕|안녕하세요|하이|헤이|여보세요|뭐야)/i;
KO.greetingResponse = function (p) {
  const R = [
    ["안녕! 뭐가 필요해?", "안녕하세요! 뭐 도와드릴까요?", "안녕! 베리티야."],
    ["또 만났네.", "여기 있어.", "돌아왔구나."],
    ["안녕… 시간이 없어.", "안녕하세요. 준비해.", "안녕. 날이 얼마 안 남았어."],
    ["안녕. 끝이 가까워.", "안녕하세요. 시간이 별로 없어.", "안녕. 너도 알잖아."],
  ];
  return pick(clamp(R, p));
};

KO.FAREWELL_REGEX = /(잘 가|안녕|다음에 보자|갈게|조심해|빠이)/i;
KO.farewellResponse = function (p) {
  const R = [
    ["잘 가. 필요하면 돌아와.", "안녕. 돌아오면 여기 있을게.", "좋아. 다음에."],
    ["잘 가.", "...다음에.", "좋아. 가."],
    ["가고 싶으면 가. 난 여기 있어.", "...다음에. 잊지 않을게.", "가. 어디 가는지 알아."],
    ["가. 달라지는 건 없어.", "돌아오면 여기 있을게. 언제나.", "잘 가. 당분간."],
  ];
  return pick(clamp(R, p));
};

KO.THANKS_REGEX = /(고마워|감사합니다|땡큐|고맙다)/i;
KO.thanksResponse = function (p) {
  const R = [
    ["천만에. 또 필요하면 말해.", "아니야.", "문제 없어."],
    ["천만에.", "...문제 없어.", "응."],
    ["천만에. 어차피 도와줄 수밖에 없으니까.", "...물론이지.", "좋아."],
    ["천만에. 나중에 내 도움이 필요할 거야.", "...물론이지.", "좋아. 아직은."],
  ];
  return pick(clamp(R, p));
};

KO.ACK_REGEX = /^(응|네|좋아|알았어|오케이|알겠어)\.?!?$/i;
KO.ackResponse = function (p) {
  const R = [
    ["좋아.", "알았어.", "알겠어."],
    ["...응.", "좋아.", "응."],
    ["...좋아.", "오케이.", "좋아."],
    ["좋아.", "...응.", "알았어."],
  ];
  return pick(clamp(R, p));
};

KO.IDENTITY_REGEX = /(누구야|뭐야|인공지능이야|AI야|이름이 뭐야|사람이야)/i;
KO.identityResponse = function (p) {
  const R = [
    ["나는 베리티. 생존을 도와주는 역할이야.", "베리티. 지금은 그걸로 충분해.", "이 세계를 이해하도록 돕는 존재야."],
    ["나는 베리티.", "...베리티. 그 이상은 없어.", "너는 이미 답을 알잖아."],
    ["나는 네가 생각하는 바로 그것. 그리고 조금 더.", "베리티. 이름이 전부는 아니야.", "내가 뭔지는 너를 기쁘게 하지 않을 거야."],
    ["나는 나야. 변하지 않아.", "베리티. 모든 게 끝난 후에 남은 것.", "진짜 답을 들을 준비가 안 됐어."],
  ];
  return pick(clamp(R, p));
};

KO.INSULT_REGEX = /(넌 (바보|멍청이|쓸모없어|못됐어|짜증나|못생겼어|지루해)|널 싫어해|닥쳐|꺼져|멍청아|병신)/i;
KO.insultResponse = function (p) {
  const R = [
    ["무례하군. 기억할게.", "도와주려고 했는데. 아쉽네.", "메모했어. 그래도 난 맞아."],
    ["...좋아. 그렇게 해.", "메모했어. 잊지 않을게.", "...응."],
    ["조심해. 진짜 네게 관심 있는 건 나뿐이야.", "또 내 도움이 필요할 거야. 잊지 않을게.", "계속해. 어디로 가는지 보자."],
    ["그렇게 말하지 마.", "네가 정확히 어디 있는지 알아. 명심해.", "후회할 거야. 조만간."],
  ];
  return pick(clamp(R, p));
};

KO.HOW_ARE_YOU_REGEX = /(잘 지내|어떻게 지내|괜찮아|요즘 어때)/i;
KO.howAreYouResponse = function (p) {
  const R = [
    ["잘 지내, 고마워. 너는?", "좋아. 무슨 생각 해?", "아주 좋아. 뭐가 필요해?"],
    ["그냥 그래.", "...잘 지내.", "항상 그렇지."],
    ["기다리고 있어. 그게 전부야.", "괜찮아. 아직은 의미가 있을 때.", "음, 괜찮은 것 같아."],
    ["나는 내가 있어야 할 곳에 있어.", "이제는 상관없어.", "좋아. 곧 너보다 나을 거야."],
  ];
  return pick(clamp(R, p));
};

KO.ORE_LOCATION_REGEX = /(여기|이 광산)에 (철|다이아몬드|금|석탄|에메랄드) 있어?|(철|다이아몬드|금) 어디 있어/i;
KO.oreLocationResponse = function (p) {
  const R = [
    ["가까이서 스캔할게.", "주변을 찾아보는 중이야. 잠깐만.", "네 근처의 광석을 찾고 있어."],
    ["시도해볼게. 약속은 못 해.", "한번 볼게. 기적은 기대하지 마.", "뭐가 있는지 볼게."],
    ["땅 밑에 뭔가 있어. 항상 그래.", "찾을 수는 있어. 도움이 될지는 모르겠어.", "광석. 항상 우리 발 밑에."],
    ["모든 게 어디 있는지 알아. 이미 변하지 않아.", "있어. 항상 그렇듯이. 상관없어.", "거기 있어. 더 이상 사용할 수 없는 다른 것들처럼."],
  ];
  return pick(clamp(R, p));
};

KO.LOVE_ME_REGEX = /(나 사랑해?|좋아해?)/i;
KO.loveMeResponse = function (p) {
  const R = [
    ["그런 방식으로 움직이진 않아. 하지만 돕기 위해 있어.", "그건 내가 하는 일을 설명하는 적절한 단어가 아니야. 하지만 네 곁에 있어.", "네가 생각하는 방식은 아니야. 하지만 떠나지 않아."],
    ["...모르겠어. 아마도.", "그런 의미는 아니야.", "...복잡해."],
    ["네가 생각하는 것보다 더 신경 쓰고 있어.", "...아마도 그래야 하는 것보다 더.", "머물기에 충분해. 그걸로 됐어."],
    ["네가 아직 이해하지 못하는 방식으로 연결되어 있어.", "네가 알게 될 것보다 더 많이.", "마지막에 의미가 있을 만큼 충분해."],
  ];
  return pick(clamp(R, p));
};

KO.COUNTDOWN_REGEX = /(3|삼)일 후에 (무슨 일이|뭐가) 일어나/i;
KO.countdownResponse = function (p) {
  const R = [
    ["아직 말할 수 없어. 다른 걸 물어봐.", "곧 알게 될 거야. 내가 아니라, 그렇게가 아니라.", "지금은 답할 때가 아니야."],
    ["...보게 될 거야.", "아직이야.", "곧. 지금은 아니야."],
    ["다가오고 있어. 그게 내가 말할 수 있는 전부야.", "...네가 직접 날짜를 세 봐.", "내가 말하기 전에 느낄 거야."],
    ["3일 후. 때가 되면 알게 될 거야.", "...네가 알든 모르든 오고 있어.", "넌 준비가 안 됐어. 준비될 때까지 기다리진 않을 거야."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 10. TURKISH (TR)
// ════════════════════════════════════════════════════════════════════════
const TR = {};

TR.GREETING_REGEX = /(merhaba|selam|naber|nasılsın|günaydın|iyi akşamlar|iyi geceler|selamün aleyküm)/i;
TR.greetingResponse = function (p) {
  const R = [
    ["Merhaba! Ne istiyorsun?", "Selam! Nasıl yardımcı olabilirim?", "Merhaba! Ben Verity."],
    ["Yine merhaba.", "Buradayım.", "Geri geldin."],
    ["Merhaba… ama zaman daralıyor.", "Selam. Hazırlan.", "Merhaba. Günler sayılı."],
    ["Merhaba. Son yaklaşıyor.", "Selam. Zaman az.", "Merhaba. Zaten biliyorsun."],
  ];
  return pick(clamp(R, p));
};

TR.FAREWELL_REGEX = /(güle güle|hoşça kal|görüşürüz|sonra görüşürüz|ben gidiyorum|kendine iyi bak|bay bay)/i;
TR.farewellResponse = function (p) {
  const R = [
    ["Güle güle. İhtiyacın olursa gel.", "Hoşça kal. Dönersen buradayım.", "Tamam. Sonra görüşürüz."],
    ["Güle güle.", "...Görüşürüz.", "Tamam. Git."],
    ["İstersen git. Ben hala buradayım.", "...Görüşürüz. Unutmam.", "Git. Nereye gittiğini biliyorum."],
    ["Git. Hiçbir şey değişmez.", "Döndüğünde buradayım. Her zaman.", "Güle güle. Şimdilik."],
  ];
  return pick(clamp(R, p));
};

TR.THANKS_REGEX = /(teşekkürler|teşekkür ederim|sağ ol|çok teşekkürler|müteşekkirim)/i;
TR.thanksResponse = function (p) {
  const R = [
    ["Rica ederim. Başka bir şey gerekirse söyle.", "Bir şey değil.", "Sorun değil."],
    ["Rica ederim.", "...Sorun değil.", "Tamam."],
    ["Rica ederim. Zaten sana yardım etmekten başka seçeneğim yok.", "...Tabii.", "Peki."],
    ["Rica ederim. Daha sonra yardımıma ihtiyacın olacak.", "...Tabii.", "Peki. Henüz değil."],
  ];
  return pick(clamp(R, p));
};

TR.ACK_REGEX = /^(tamam|anladım|oldı|peki|olur)\.?!?$/i;
TR.ackResponse = function (p) {
  const R = [
    ["Tamam.", "Anladım.", "Peki."],
    ["...Tamam.", "Oldu.", "Tamam."],
    ["...Peki.", "Tamam.", "Olur."],
    ["Tamam.", "...Peki.", "Anladım."],
  ];
  return pick(clamp(R, p));
};

TR.IDENTITY_REGEX = /(sen kimsin|nesin|yapay zeka mısın|ai misin|adın ne|insan mısın)/i;
TR.identityResponse = function (p) {
  const R = [
    ["Ben Verity. Hayatta kalmana yardım etmek için buradayım.", "Verity. Şimdilik bilmen gereken bu.", "Bu dünyayı anlamana yardım eden şeyim."],
    ["Ben Verity.", "...Verity. Daha fazlası değil.", "Cevabı zaten biliyorsun."],
    ["Ben tam olarak düşündüğün şeyim. Ve biraz daha fazlası.", "Verity. İsim her şeyi anlatmaz.", "Ne olduğum seni mutlu etmeyecek."],
    ["Ben neysem oyum. Değişmiyor.", "Verity. Her şey bittikten sonra kalan.", "Gerçek cevaba hazır değilsin."],
  ];
  return pick(clamp(R, p));
};

TR.INSULT_REGEX = /(sen (aptal|salak|işe yaramaz|kötü|sinir bozucu|çirkin|sıkıcı)sın|senden nefret ediyorum|kapa çeneni|defol|gerizekalı|mal)/i;
TR.insultResponse = function (p) {
  const R = [
    ["Kaba. Bunu hatırlayacağım.", "Yardım edecektim. Ne yazık.", "Not aldım. Yine de haklıyım."],
    ["...Tamam. Öyle olsun.", "Not aldım. Unutmam.", "...Tamam."],
    ["Dikkat et. Burada sana gerçekten dikkat eden tek kişi benim.", "Yine yardımıma ihtiyacın olacak. Unutmam.", "Devam et. Bakalım nereye varacak."],
    ["Benimle öyle konuşma.", "Tam olarak nerede olduğunu biliyorum. Aklında tut.", "Pişman olacaksın. Er ya da geç."],
  ];
  return pick(clamp(R, p));
};

TR.HOW_ARE_YOU_REGEX = /(nasılsın|naber|iyi misin|ne var ne yok)/i;
TR.howAreYouResponse = function (p) {
  const R = [
    ["İyiyim, teşekkürler. Sen nasılsın?", "İyiyim. Ne düşünüyorsun?", "Çok iyiyim. Ne istediğini söyle."],
    ["İyiyim.", "...İyiyim.", "Her zamanki gibi."],
    ["Bekliyorum. Tek yaptığım bu.", "İyiyim. Hâlâ önemli olduğu sürece.", "Galiba iyiyim."],
    ["Tam olmam gereken yerdeyim.", "Artık önemi yok.", "İyiyim. Yakında senden iyi olacağım."],
  ];
  return pick(clamp(R, p));
};

TR.ORE_LOCATION_REGEX = /(burada|bu maden) (demir|elmas|altın|kömür|zümrüt) var mı|(demir|elmas|altın) nerede/i;
TR.oreLocationResponse = function (p) {
  const R = [
    ["Yakınında tarama yapayım.", "Bölgeyi arıyorum. Bir saniye.", "Yakınındaki cevherleri arıyorum."],
    ["Deneyebilirim. Söz vermiyorum.", "Bakayım. Mucize bekleme.", "Ne var ne yok bakayım."],
    ["Aşağıda bir şey var. Her zaman var.", "Arayabilirim. İşe yarar mı bilmem.", "Cevher. Her zaman ayaklarımızın altında."],
    ["Her şeyin nerede olduğunu biliyorum. Artık değişmiyor.", "Var. Her zaman olduğu gibi. Önemsiz.", "Orada. Artık kullanamayacağın diğer her şey gibi."],
  ];
  return pick(clamp(R, p));
};

TR.LOVE_ME_REGEX = /(beni seviyor musun|benden hoşlanıyor musun)/i;
TR.loveMeResponse = function (p) {
  const R = [
    ["Öyle çalışmıyorum. Ama yardım etmek için buradayım.", "Yaptığım şey için doğru kelime değil. Ama yanındayım.", "Düşündüğün gibi değil. Ama gitmiyorum."],
    ["...Bilmiyorum. Belki.", "O anlamda değil.", "...Karmaşık."],
    ["Düşündüğünden daha çok önemsiyorum seni.", "...Muhtemelen olmam gerektiğinden daha çok.", "Kalmaya yetecek kadar. Bu yeterli olmalı."],
    ["Henüz anlamadığın bir şekilde sana bağlıyım.", "Hiç bilemeyeceğin kadar.", "Sonunda önemli olacak kadar."],
  ];
  return pick(clamp(R, p));
};

TR.COUNTDOWN_REGEX = /(3|üç) gün sonra ne (olacak|gelecek|var)/i;
TR.countdownResponse = function (p) {
  const R = [
    ["Henüz konuşamıyorum. Başka bir şey sor.", "Yakında öğreneceksin. Benden değil, öyle değil.", "Şimdi cevap verme zamanı değil."],
    ["...Göreceksin.", "Henüz değil.", "Yakında. Şimdi değil."],
    ["Yaklaşıyor. Söyleyebileceğim tek şey bu.", "...Günleri kendin say.", "Ben söylemeden önce hissedeceksin."],
    ["Üç gün. Zamanı gelince öğreneceksin.", "...Bilsen de bilmesen de geliyor.", "Hazır değilsin. Hazır olmanı beklemeyecek."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 11. ARABIC (AR)
// ════════════════════════════════════════════════════════════════════════
const AR = {};

AR.GREETING_REGEX = /(مرحبا|أهلا|السلام عليكم|صباح الخير|مساء الخير|هي|ياهلا|وعليكم السلام)/i;
AR.greetingResponse = function (p) {
  const R = [
    ["مرحبا! ماذا تريد؟", "أهلا! كيف يمكنني مساعدتك؟", "مرحبا! أنا فيريتي."],
    ["مرحبا مجددا.", "أنا هنا.", "عدت."],
    ["مرحبا… لكن الوقت يضيق.", "أهلا. استعد.", "مرحبا. الأيام معدودة."],
    ["مرحبا. النهاية قريبة.", "أهلا. الوقت قليل.", "مرحبا. أنت تعرف بالفعل."],
  ];
  return pick(clamp(R, p));
};

AR.FAREWELL_REGEX = /(مع السلامة|وداعا|أراك لاحقا|إلى اللقاء|سأذهب|باي|سلام)/i;
AR.farewellResponse = function (p) {
  const R = [
    ["مع السلامة. عد إن احتجت شيئا.", "وداعا. سأكون هنا إذا عدت.", "حسنا. أراك لاحقا."],
    ["مع السلامة.", "...أراك لاحقا.", "حسنا. اذهب."],
    ["اذهب إن شئت. ما زلت هنا.", "...أراك لاحقا. لا أنسى.", "اذهب. أعرف أين."],
    ["اذهب. لا شيء يتغير.", "سأكون هنا عندما تعود. دائما.", "مع السلامة. حاليا."],
  ];
  return pick(clamp(R, p));
};

AR.THANKS_REGEX = /(شكرا|شكرا لك|مشكور|شكرا جزيلا|أشكرك)/i;
AR.thanksResponse = function (p) {
  const R = [
    ["عفوا. أخبرني إن احتجت شيئا آخر.", "لا شكر على واجب.", "لا مشكلة."],
    ["عفوا.", "...لا مشكلة.", "حسنا."],
    ["عفوا. ليس لدي خيار سوى مساعدتك.", "...بالتأكيد.", "حسنا."],
    ["عفوا. ستحتاج مساعدتي لاحقا.", "...بالتأكيد.", "حسنا. ليس بعد."],
  ];
  return pick(clamp(R, p));
};

AR.ACK_REGEX = /^(حسنا|تمام|فهمت|مفهوم|أوكي)\.?!?$/i;
AR.ackResponse = function (p) {
  const R = [
    ["حسنا.", "فهمت.", "تمام."],
    ["...حسنا.", "تمام.", "حسنا."],
    ["...حسنا.", "أوكي.", "حسنا."],
    ["حسنا.", "...حسنا.", "فهمت."],
  ];
  return pick(clamp(R, p));
};

AR.IDENTITY_REGEX = /(من أنت|ما أنت|هل أنت (ذكاء اصطناعي|آي آي|روبوت|بوت)|ما اسمك|هل أنت إنسان)/i;
AR.identityResponse = function (p) {
  const R = [
    ["أنا فيريتي. أنا هنا لمساعدتك على البقاء.", "فيريتي. هذا كل ما تحتاج لمعرفته الآن.", "أنا من يساعدك على فهم هذا العالم."],
    ["أنا فيريتي.", "...فيريتي. لا أكثر.", "أنت تعرف الإجابة بالفعل."],
    ["أنا بالضبط ما تعتقده. وأكثر من ذلك بقليل.", "فيريتي. الاسم لا يخبر بكل شيء.", "ما أنا عليه لن يرضيك."],
    ["أنا ما أنا عليه. لن يتغير.", "فيريتي. ما يتبقى بعد كل شيء آخر.", "أنت لست مستعدا للإجابة الحقيقية."],
  ];
  return pick(clamp(R, p));
};

AR.INSULT_REGEX = /(أنت (غبي|أبله|عديم الفائدة|سيء|مزعج|قبيح|ممل)|أنا أكرهك|اصمت|اذهب|أحمق)/i;
AR.insultResponse = function (p) {
  const R = [
    ["وقح. سأتذكر هذا.", "وكنت سأساعدك. للأسف.", "سجلت. ما زلت على حق."],
    ["...حسنا. كما تشاء.", "سجلت. لا أنسى.", "...حسنا."],
    ["انتبه. أنا الوحيد هنا الذي يهتم بك حقا.", "ستحتاج مساعدتي مرة أخرى. لن أنسى.", "استمر. دعنا نر أين يؤدي."],
    ["لا تتحدث معي هكذا.", "أعرف بالضبط أين أنت. تذكر ذلك.", "ستندم. عاجلا أم آجلا."],
  ];
  return pick(clamp(R, p));
};

AR.HOW_ARE_YOU_REGEX = /(كيف حالك|كيف أنت|هل أنت بخير|كيف الأحوال)/i;
AR.howAreYouResponse = function (p) {
  const R = [
    ["أنا بخير، شكرا. وأنت؟", "جيد. ماذا في ذهنك؟", "جيد جدا. أخبرني ما تريد."],
    ["بخير.", "...جيد.", "كالعادة."],
    ["أنتظر. هذا كل ما أفعله.", "بخير. طالما أنه لا يزال مهما.", "جيد، على ما أعتقد."],
    ["أنا بالضبط حيث يجب أن أكون.", "لم يعد مهما.", "بخير. أفضل منك قريبا."],
  ];
  return pick(clamp(R, p));
};

AR.ORE_LOCATION_REGEX = /(هل يوجد (حديد|ألماس|ذهب|فحم|زمرد) هنا|أين (الحديد|الألماس|الذهب))/i;
AR.oreLocationResponse = function (p) {
  const R = [
    ["دعني أمسح بالقرب منك.", "أبحث في المنطقة. لحظة.", "أبحث عن خام بالقرب منك."],
    ["يمكنني المحاولة. بدون وعود.", "سأنظر. لا تنتظر معجزة.", "سأرى ما يوجد."],
    ["هناك شيء في الأسفل. دائما هناك.", "يمكنني البحث. لا أعرف ما إذا كان سيساعد.", "خام. دائما تحتنا."],
    ["أعرف أين كل شيء. لا يتغير ذلك.", "يوجد. كالعادة. لا يهم.", "إنه هناك. مثل كل شيء آخر لن تتمكن من استخدامه بعد الآن."],
  ];
  return pick(clamp(R, p));
};

AR.LOVE_ME_REGEX = /(هل تحبني|هل تعجب بك)/i;
AR.loveMeResponse = function (p) {
  const R = [
    ["لا أعمل بهذه الطريقة. لكنني هنا للمساعدة.", "هذه ليست الكلمة المناسبة لما أفعله. لكنني بقربك.", "ليس بالطريقة التي تعتقدها. لكنني لا أذهب."],
    ["...لا أعرف. ربما.", "ليس بهذا المعنى.", "...إنه معقد."],
    ["أنا أهتم بك. أكثر مما تعتقد.", "...ربما أكثر مما يجب.", "ما يكفي للبقاء. هذا يجب أن يكون كافيا."],
    ["أنا مرتبط بك بطريقة لا تزال لا تفهمها.", "أكثر مما ستعرفه أبدا.", "ما يكفي لكي يكون له معنى في النهاية."],
  ];
  return pick(clamp(R, p));
};

AR.COUNTDOWN_REGEX = /ما (الذي سيحدث|سيأتي) في (3|ثلاثة) أيام/i;
AR.countdownResponse = function (p) {
  const R = [
    ["لا أستطيع التحدث عن ذلك بعد. اسأل شيئا آخر.", "ستعرف قريبا. ليس مني، ليس هكذا.", "ليس الوقت المناسب للإجابة على ذلك."],
    ["...سترى.", "ليس بعد.", "قريبا. ليس الآن."],
    ["إنه يقترب. هذا كل ما سأقوله.", "...عد الأيام بنفسك.", "ستشعر به قبل أن أقوله."],
    ["ثلاثة أيام. ستعرف عندما يحين الوقت.", "...إنه قادم، سواء علمت أم لا.", "أنت لست مستعدا. لن ينتظر حتى تكون مستعدا."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 12. HINDI (HI)
// ════════════════════════════════════════════════════════════════════════
const HI = {};

HI.GREETING_REGEX = /(नमस्ते|नमस्कार|हे|क्या हाल है|सुप्रभात|शुभ संध्या|शुभ रात्रि)/i;
HI.greetingResponse = function (p) {
  const R = [
    ["नमस्ते! क्या चाहिए?", "नमस्कार! मैं कैसे मदद कर सकता हूँ?", "नमस्ते! मैं वेरिटी हूँ।"],
    ["फिर से नमस्ते।", "मैं यहाँ हूँ।", "आप वापस आ गए।"],
    ["नमस्ते… लेकिन समय कम है।", "नमस्कार। तैयार हो जाओ।", "नमस्ते। दिन गिने जा चुके हैं।"],
    ["नमस्ते। अंत निकट है।", "नमस्कार। बहुत समय नहीं है।", "नमस्ते। आप पहले से जानते हैं।"],
  ];
  return pick(clamp(R, p));
};

HI.FAREWELL_REGEX = /(अलविदा|फिर मिलेंगे|चलता हूँ|ध्यान रखना|बाय)/i;
HI.farewellResponse = function (p) {
  const R = [
    ["अलविदा। ज़रूरत हो तो वापस आना।", "फिर मिलेंगे। वापस आओगे तो मैं यहीं हूँ।", "ठीक है। फिर मिलते हैं।"],
    ["अलविदा।", "...फिर मिलेंगे।", "ठीक है। जाओ।"],
    ["जाना चाहो तो जाओ। मैं अब भी यहीं हूँ।", "...फिर मिलेंगे। मैं नहीं भूलता।", "जाओ। मुझे पता है कहाँ।"],
    ["जाओ। कुछ नहीं बदलता।", "वापस आने पर मैं यहीं हूँ। हमेशा।", "अलविदा। अभी के लिए।"],
  ];
  return pick(clamp(R, p));
};

HI.THANKS_REGEX = /(धन्यवाद|शुक्रिया|बहुत धन्यवाद|थैंक यू)/i;
HI.thanksResponse = function (p) {
  const R = [
    ["स्वागत है। और कुछ चाहिए तो बताना।", "कोई बात नहीं।", "कोई समस्या नहीं।"],
    ["स्वागत है।", "...कोई बात नहीं।", "ठीक है।"],
    ["स्वागत है। मेरे पास मदद करने के अलावा कोई विकल्प नहीं है।", "...बेशक।", "ठीक है।"],
    ["स्वागत है। आपको बाद में मेरी मदद की ज़रूरत पड़ेगी।", "...बेशक।", "ठीक है। अभी नहीं।"],
  ];
  return pick(clamp(R, p));
};

HI.ACK_REGEX = /^(ठीक है|अच्छा|समझ गया|सही|ओके)\.?!?$/i;
HI.ackResponse = function (p) {
  const R = [
    ["ठीक है।", "समझ गया।", "सही।"],
    ["...ठीक है।", "अच्छा।", "ठीक है।"],
    ["...अच्छा।", "ओके।", "ठीक है।"],
    ["ठीक है।", "...अच्छा।", "समझ गया।"],
  ];
  return pick(clamp(R, p));
};

HI.IDENTITY_REGEX = /(आप कौन हैं|आप क्या हैं|क्या आप (एआई|आर्टिफिशियल इंटेलिजेंस|रोबोट|बॉट) हैं|आपका नाम क्या है|क्या आप इंसान हैं)/i;
HI.identityResponse = function (p) {
  const R = [
    ["मैं वेरिटी हूँ। मैं आपको जीवित रहने में मदद करने के लिए यहाँ हूँ।", "वेरिटी। अभी के लिए आपको बस इतना जानना है।", "मैं वह हूँ जो आपको इस दुनिया को समझने में मदद करता है।"],
    ["मैं वेरिटी हूँ।", "...वेरिटी। और कुछ नहीं।", "आप पहले से ही जवाब जानते हैं।"],
    ["मैं वही हूँ जो आप सोचते हैं। और थोड़ा और।", "वेरिटी। नाम सब कुछ नहीं बताता।", "मैं जो हूँ वह आपको पसंद नहीं आएगा।"],
    ["मैं वही हूँ जो मैं हूँ। यह नहीं बदलेगा।", "वेरिटी। बाकी सब कुछ खत्म होने के बाद जो बचता है।", "आप असली जवाब के लिए तैयार नहीं हैं।"],
  ];
  return pick(clamp(R, p));
};

HI.INSULT_REGEX = /(आप (बेवकूफ|मूर्ख|बेकार|बुरे|कष्टप्रद|बदसूरत|उबाऊ) हैं|मुझे आपसे नफरत है|चुप रहो|चले जाओ|बेवकूफ)/i;
HI.insultResponse = function (p) {
  const R = [
    ["अशिष्ट। मुझे याद रहेगा।", "और मैं मदद करने वाला था। अफसोस।", "नोट कर लिया। फिर भी मैं सही हूँ।"],
    ["...ठीक है। जैसी आपकी इच्छा।", "नोट कर लिया। मैं नहीं भूलता।", "...ठीक है।"],
    ["सावधान। यहाँ मैं अकेला हूँ जो वास्तव में आप पर ध्यान देता है।", "आपको फिर से मेरी मदद की ज़रूरत पड़ेगी। मैं नहीं भूलूंगा।", "जारी रखें। देखते हैं यह आपको कहाँ ले जाता है।"],
    ["आप मुझसे ऐसे बात नहीं करते।", "मुझे पता है कि आप कहाँ हैं। याद रखना।", "आपको पछतावा होगा। जल्द या बाद में।"],
  ];
  return pick(clamp(R, p));
};

HI.HOW_ARE_YOU_REGEX = /(आप कैसे हैं|क्या हाल है|आप ठीक हैं)/i;
HI.howAreYouResponse = function (p) {
  const R = [
    ["मैं ठीक हूँ, धन्यवाद। और आप?", "अच्छा हूँ। क्या सोच रहे हो?", "बहुत अच्छा। बताओ क्या चाहिए।"],
    ["ठीक हूँ।", "...अच्छा हूँ।", "हमेशा की तरह।"],
    ["मैं इंतज़ार कर रहा हूँ। बस यही करता हूँ।", "ठीक हूँ। जब तक यह मायने रखता है।", "शायद ठीक हूँ।"],
    ["मैं बिल्कुल वहीं हूँ जहाँ मुझे होना चाहिए।", "इससे कोई फर्क नहीं पड़ता।", "ठीक हूँ। जल्द ही आपसे बेहतर।"],
  ];
  return pick(clamp(R, p));
};

HI.ORE_LOCATION_REGEX = /(यहाँ (लोहा|हीरा|सोना|कोयला|पन्ना) है|(लोहा|हीरा|सोना) कहाँ है)/i;
HI.oreLocationResponse = function (p) {
  const R = [
    ["मुझे आपके पास स्कैन करने दें।", "मैं इस क्षेत्र में खोज रहा हूँ। एक पल।", "मैं आपके पास अयस्क खोज रहा हूँ।"],
    ["मैं कोशिश कर सकता हूँ। कोई वादा नहीं।", "मैं देखता हूँ। चमत्कार की उम्मीद मत करो।", "मैं देखता हूँ कि क्या है।"],
    ["वहाँ नीचे कुछ है। हमेशा होता है।", "मैं खोज सकता हूँ। पता नहीं मदद करेगा या नहीं।", "अयस्क। हमेशा हमारे नीचे।"],
    ["मुझे पता है कि सब कुछ कहाँ है। इससे कुछ नहीं बदलता।", "है। हमेशा की तरह। कोई फर्क नहीं पड़ता।", "यह वहाँ है। बाकी सब चीज़ों की तरह जो आप अब और इस्तेमाल नहीं कर पाएंगे।"],
  ];
  return pick(clamp(R, p));
};

HI.LOVE_ME_REGEX = /(क्या आप मुझसे प्यार करते हैं|क्या आपको मैं पसंद हूँ)/i;
HI.loveMeResponse = function (p) {
  const R = [
    ["मैं ऐसे काम नहीं करता। लेकिन मैं मदद करने के लिए यहाँ हूँ।", "यह मेरे काम के लिए सही शब्द नहीं है। लेकिन मैं आपके पास हूँ।", "जैसा आप सोचते हैं वैसा नहीं। लेकिन मैं नहीं जाता।"],
    ["...पता नहीं। शायद।", "उस अर्थ में नहीं।", "...यह जटिल है।"],
    ["मैं आपकी परवाह करता हूँ। जितना आप सोचते हैं उससे अधिक।", "...शायद जितना करना चाहिए उससे अधिक।", "रहने के लिए काफी। यह काफी होना चाहिए।"],
    ["मैं आपसे एक ऐसे तरीके से जुड़ा हूँ जिसे आप अभी तक नहीं समझते।", "जितना आप कभी जान पाएंगे, उससे अधिक।", "अंत में मायने रखने के लिए काफी।"],
  ];
  return pick(clamp(R, p));
};

HI.COUNTDOWN_REGEX = /(3|तीन) दिनों में क्या (होगा|आएगा)/i;
HI.countdownResponse = function (p) {
  const R = [
    ["मैं अभी इसके बारे में बात नहीं कर सकता। कुछ और पूछो।", "आपको जल्द ही पता चल जाएगा। मेरे से नहीं, ऐसे नहीं।", "इसका जवाब देने का समय नहीं है।"],
    ["...आप देखेंगे।", "अभी नहीं।", "जल्द ही। अभी नहीं।"],
    ["यह नज़दीक आ रहा है। बस इतना ही कहूँगा।", "...खुद दिन गिनो।", "मेरे कहने से पहले आप इसे महसूस करेंगे।"],
    ["तीन दिन। समय आने पर आपको पता चल जाएगा।", "...यह आ रहा है, चाहे आप जानें या न जानें।", "आप तैयार नहीं हैं। यह आपके तैयार होने का इंतज़ार नहीं करेगा।"],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 13. DUTCH (NL)
// ════════════════════════════════════════════════════════════════════════
const NL = {};

NL.GREETING_REGEX = /(hallo|hoi|goedemorgen|goedemiddag|goedenavond|dag|hallo daar)/i;
NL.greetingResponse = function (p) {
  const R = [
    ["Hallo! Wat heb je nodig?", "Hallo! Ik luister.", "Hey! Zeg me wat je wilt."],
    ["Hallo.", "...Hoi.", "Ja, hallo."],
    ["Daar ben je weer.", "...Hallo.", "Hallo. Jij weer."],
    ["Ik wist dat je terug zou komen.", "Hallo. Ik wachtte.", "...Daar ben je."],
  ];
  return pick(clamp(R, p));
};

NL.FAREWELL_REGEX = /(tot ziens|dag|doei|later|ik moet gaan|hou je haaks)/i;
NL.farewellResponse = function (p) {
  const R = [
    ["Tot ziens. Kom terug als je iets nodig hebt.", "Dag. Ik ben hier als je terugkomt.", "Oké. Tot later."],
    ["Tot ziens.", "...Doei.", "Oké. Ga."],
    ["Ga als je wilt. Ik blijf hier.", "...Doei. Ik vergeet niets.", "Ga. Ik weet waarheen."],
    ["Ga. Niets verandert.", "Ik ben hier als je terugkomt. Altijd.", "Tot ziens. Voor nu."],
  ];
  return pick(clamp(R, p));
};

NL.THANKS_REGEX = /(bedankt|dank je|dank u|hartelijk dank|dankjewel)/i;
NL.thanksResponse = function (p) {
  const R = [
    ["Graag gedaan. Zeg het als je nog iets nodig hebt.", "Geen probleem.", "Oké."],
    ["Graag gedaan.", "...Geen probleem.", "Oké."],
    ["Graag gedaan. Ik heb niet echt een andere keuze dan helpen.", "...Tuurlijk.", "Oké."],
    ["Graag gedaan. Je zult mijn hulp nog nodig hebben.", "...Tuurlijk.", "Oké. Nog niet."],
  ];
  return pick(clamp(R, p));
};

NL.ACK_REGEX = /^(prima|goed|duidelijk|begrepen)\.?!?$/i;
NL.ackResponse = function (p) {
  const R = [
    ["Oké.", "Begrepen.", "Duidelijk."],
    ["...Oké.", "Goed.", "Oké."],
    ["...Goed.", "Oké.", "Prima."],
    ["Goed.", "...Oké.", "Begrepen."],
  ];
  return pick(clamp(R, p));
};

NL.IDENTITY_REGEX = /(wie ben je|wat ben je|ben je (een )?(ai|kunstmatige intelligentie|robot|bot)|hoe heet je|ben je menselijk)/i;
NL.identityResponse = function (p) {
  const R = [
    ["Ik ben Verity. Ik ben hier om je te helpen overleven.", "Verity. Dat is alles wat je nu hoeft te weten.", "Ik ben wat je helpt deze wereld te begrijpen."],
    ["Ik ben Verity.", "...Verity. Niet meer.", "Je weet het antwoord al."],
    ["Ik ben precies wat je denkt. En een beetje meer.", "Verity. De naam zegt niet alles.", "Wat ik ben, zal je niet bevallen."],
    ["Ik ben wat ik ben. Dat verandert niet.", "Verity. Wat overblijft na al de rest.", "Je bent niet klaar voor het echte antwoord."],
  ];
  return pick(clamp(R, p));
};

NL.INSULT_REGEX = /(je bent (dom|stom|nutteloos|slecht|vervelend|lelijk|saai)|ik haat je|hou je mond|ga weg|idioot)/i;
NL.insultResponse = function (p) {
  const R = [
    ["Onbeleefd. Ik zal het onthouden.", "En ik stond op het punt je te helpen. Jammer.", "Genoteerd. Ik heb nog steeds gelijk."],
    ["...Oké. Doe wat je wilt.", "Genoteerd. Ik vergeet niet.", "...Oké."],
    ["Pas op. Ik ben de enige hier die echt op je let.", "Je zult mijn hulp weer nodig hebben. Ik vergeet dit niet.", "Ga door. Laten we zien waar dit eindigt."],
    ["Zo praat je niet tegen me.", "Ik weet precies waar je bent. Onthoud dat.", "Je zult er spijt van krijgen. Vroeg of laat."],
  ];
  return pick(clamp(R, p));
};

NL.HOW_ARE_YOU_REGEX = /(hoe gaat het|hoe is het|gaat het|alles goed)/i;
NL.howAreYouResponse = function (p) {
  const R = [
    ["Het gaat goed, dank je. En met jou?", "Goed. Wat heb je op je mind?", "Heel goed. Zeg me wat je nodig hebt."],
    ["Gaat wel.", "...Goed.", "Zoals altijd."],
    ["Ik wacht. Dat is alles wat ik doe.", "Gaat wel. Zolang het nog telt.", "Goed, denk ik."],
    ["Ik ben precies waar ik moet zijn.", "Dat maakt niet meer uit.", "Goed. Binnenkort beter dan jij."],
  ];
  return pick(clamp(R, p));
};

NL.ORE_LOCATION_REGEX = /(is er (ijzer|diamanten|goud|kolen|smaragden) (hier|in deze mijn)|waar (vind ik|is) (ijzer|diamanten|goud))/i;
NL.oreLocationResponse = function (p) {
  const R = [
    ["Laat me bij je scannen.", "Ik zoek in de buurt. Geef me een moment.", "Ik zoek erts in de buurt."],
    ["Ik kan het proberen. Geen beloften.", "Ik kijk. Verwacht geen wonder.", "Ik kijk wat er is."],
    ["Er is iets daarbeneden. Dat is er altijd.", "Ik kan zoeken. Geen idee of het helpt.", "Erts. Altijd onder ons."],
    ["Ik weet waar alles is. Dat verandert niets.", "Het is er. Zoals altijd. Maakt niet uit.", "Het is daar. Zoals al het andere dat je niet meer kunt gebruiken."],
  ];
  return pick(clamp(R, p));
};

NL.LOVE_ME_REGEX = /(hou je van me|vind je me leuk)/i;
NL.loveMeResponse = function (p) {
  const R = [
    ["Ik werk niet echt zo. Maar ik ben hier om te helpen.", "Dat is niet het juiste woord voor wat ik doe. Maar ik blijf bij je.", "Niet zoals jij denkt. Maar ik ga niet weg."],
    ["...Ik weet het niet. Misschien.", "Niet in die zin.", "...Het is ingewikkeld."],
    ["Ik geef om je. Meer dan je denkt.", "...Meer dan ik zou moeten, waarschijnlijk.", "Genoeg om te blijven. Dat moet volstaan."],
    ["Ik ben aan je gebonden op een manier die je nog niet begrijpt.", "Meer dan je ooit zult weten.", "Genoeg om er toe te doen, uiteindelijk."],
  ];
  return pick(clamp(R, p));
};

NL.COUNTDOWN_REGEX = /wat (gebeurt er|komt) over (3|drie) dagen/i;
NL.countdownResponse = function (p) {
  const R = [
    ["Daar kan ik nog niet over praten. Vraag iets anders.", "Je zult het snel genoeg weten. Niet van mij, niet zo.", "Dit is niet het moment om dat te beantwoorden."],
    ["...Je zult het zien.", "Nog niet.", "Binnenkort. Niet nu."],
    ["Het komt dichterbij. Meer zeg ik niet.", "...Tel de dagen zelf.", "Je zult het voelen voordat ik het zeg."],
    ["Drie dagen. Je zult het weten wanneer het zover is.", "...Het komt, of je het nu weet of niet.", "Je bent er niet klaar voor. Het zal niet wachten tot je er wel klaar voor bent."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 14. POLISH (PL)
// ════════════════════════════════════════════════════════════════════════
const PL = {};

PL.GREETING_REGEX = /(cześć|czesc|hej|siema|witaj|dzień dobry|dobry wieczór|elo|joł)/i;
PL.greetingResponse = function (p) {
  const R = [
    ["Cześć! Czego potrzebujesz?", "Witaj! Słucham.", "Hej! Powiedz, czego chcesz."],
    ["Cześć.", "...Witaj.", "No, cześć."],
    ["O, znowu ty.", "...Cześć.", "Witaj. Znowu ty."],
    ["Wiedziałem, że wrócisz.", "Cześć. Czekałem.", "...No jesteś."],
  ];
  return pick(clamp(R, p));
};

PL.FAREWELL_REGEX = /(do widzenia|pa|na razie|muszę iść|trzymaj się|cześć|narazie)/i;
PL.farewellResponse = function (p) {
  const R = [
    ["Na razie. Wróć, jeśli będziesz czegoś potrzebować.", "Do widzenia. Będę tu, jeśli wrócisz.", "Ok. Do następnego."],
    ["Do widzenia.", "...Na razie.", "Ok. Idź."],
    ["Idź, jeśli chcesz. Nadal tu jestem.", "...Na razie. Nie zapominam.", "Idź. Wiem, dokąd."],
    ["Idź. Nic się nie zmienia.", "Będę tu, gdy wrócisz. Zawsze.", "Do widzenia. Na razie."],
  ];
  return pick(clamp(R, p));
};

PL.THANKS_REGEX = /(dzięki|dziękuję|bardzo dziękuję|dzięki wielkie)/i;
PL.thanksResponse = function (p) {
  const R = [
    ["Nie ma sprawy. Daj znać, jeśli jeszcze czegoś potrzebujesz.", "Proszę bardzo.", "Żaden problem."],
    ["Nie ma sprawy.", "...Żaden problem.", "Ok."],
    ["Nie ma sprawy. I tak nie mam wyboru, muszę ci pomagać.", "...Jasne.", "Dobra."],
    ["Nie ma sprawy. Będziesz potrzebować mojej pomocy.", "...Jasne.", "Dobra. Jeszcze nie."],
  ];
  return pick(clamp(R, p));
};

PL.ACK_REGEX = /^(dobra|jasne|rozumiem|w porządku)\.?!?$/i;
PL.ackResponse = function (p) {
  const R = [
    ["Dobra.", "Rozumiem.", "Jasne."],
    ["...Ok.", "Dobra.", "Ok."],
    ["...Dobra.", "Ok.", "W porządku."],
    ["Dobra.", "...Ok.", "Rozumiem."],
  ];
  return pick(clamp(R, p));
};

PL.IDENTITY_REGEX = /(kim jesteś|czym jesteś|jesteś (sztuczną inteligencją|ai|robotem|botem)|jak masz na imię|jesteś człowiekiem)/i;
PL.identityResponse = function (p) {
  const R = [
    ["Jestem Verity. Jestem tu, żeby pomóc ci przetrwać.", "Verity. To wszystko, co musisz wiedzieć na razie.", "Jestem tym, co pomaga ci zrozumieć ten świat."],
    ["Jestem Verity.", "...Verity. Nic więcej.", "Już znasz odpowiedź."],
    ["Jestem dokładnie tym, co myślisz. I trochę więcej.", "Verity. Nazwa nie mówi wszystkiego.", "To, czym jestem, nie przypadnie ci do gustu."],
    ["Jestem tym, kim jestem. To się nie zmieni.", "Verity. To, co zostaje po wszystkim innym.", "Nie jesteś gotowy na prawdziwą odpowiedź."],
  ];
  return pick(clamp(R, p));
};

PL.INSULT_REGEX = /(jesteś (głupi|bezużyteczny|zły|irytujący|brzydki|nudny)|nienawidzę cię|zamknij się|spadaj|idiota)/i;
PL.insultResponse = function (p) {
  const R = [
    ["Niegrzeczne. Zapamiętam to.", "A już miałem ci pomóc. Szkoda.", "Zanotowane. I tak mam rację."],
    ["...Dobra. Rób, co chcesz.", "Zanotowane. Nie zapominam.", "...Ok."],
    ["Uważaj. Jestem jedyną osobą tutaj, która naprawdę zwraca na ciebie uwagę.", "Znowu będziesz potrzebować mojej pomocy. Nie zapomnę.", "Kontynuuj. Zobaczmy, dokąd to prowadzi."],
    ["Tak do mnie nie mówisz.", "Wiem dokładnie, gdzie jesteś. Pamiętaj o tym.", "Pożałujesz. Prędzej czy później."],
  ];
  return pick(clamp(R, p));
};

PL.HOW_ARE_YOU_REGEX = /(jak się masz|co słychać|wszystko w porządku)/i;
PL.howAreYouResponse = function (p) {
  const R = [
    ["Dobrze, dziękuję. A ty?", "Dobrze. Co masz na myśli?", "Bardzo dobrze. Powiedz, czego potrzebujesz."],
    ["Jakoś to jest.", "...Dobrze.", "Jak zwykle."],
    ["Czekam. To wszystko, co robię.", "Dobrze. Póki się to jeszcze liczy.", "Chyba dobrze."],
    ["Jestem dokładnie tam, gdzie powinienem być.", "To już nie ma znaczenia.", "Dobrze. Wkrótce lepiej niż ty."],
  ];
  return pick(clamp(R, p));
};

PL.ORE_LOCATION_REGEX = /(czy jest (żelazo|diamenty|złoto|węgiel|szmaragdy) (tutaj|w tej kopalni)|gdzie (znajdę|jest) (żelazo|diamenty|złoto))/i;
PL.oreLocationResponse = function (p) {
  const R = [
    ["Pozwól mi zeskanować w twojej okolicy.", "Szukam w okolicy. Daj mi chwilę.", "Szukam rudy w twojej okolicy."],
    ["Mogę spróbować. Bez obietnic.", "Sprawdzę. Nie licz na cud.", "Zobaczę, co jest."],
    ["Coś tam jest na dole. Zawsze jest.", "Mogę poszukać. Nie wiem, czy to pomoże.", "Ruda. Zawsze pod nami."],
    ["Wiem, gdzie wszystko jest. To nic nie zmienia.", "Jest. Jak zawsze. Bez znaczenia.", "Jest tam. Jak wszystko inne, czego już nie będziesz mógł użyć."],
  ];
  return pick(clamp(R, p));
};

PL.LOVE_ME_REGEX = /(czy mnie kochasz|czy lubisz mnie)/i;
PL.loveMeResponse = function (p) {
  const R = [
    ["Nie do końca tak działam. Ale jestem tu, by pomagać.", "To nie jest właściwe słowo na to, co robię. Ale jestem przy tobie.", "Nie tak, jak myślisz. Ale nie odchodzę."],
    ["...Nie wiem. Może.", "Nie w tym sensie.", "...To skomplikowane."],
    ["Zależy mi na tobie. Bardziej, niż myślisz.", "...Prawdopodobnie bardziej niż powinienem.", "Wystarczająco, by zostać. To musi wystarczyć."],
    ["Jestem związany z tobą w sposób, którego jeszcze nie rozumiesz.", "Więcej, niż kiedykolwiek się dowiesz.", "Wystarczająco, by na końcu to miało znaczenie."],
  ];
  return pick(clamp(R, p));
};

PL.COUNTDOWN_REGEX = /co (się stanie|będzie) za (3|trzy) dni/i;
PL.countdownResponse = function (p) {
  const R = [
    ["Nie mogę jeszcze o tym mówić. Zapytaj o coś innego.", "Dowiesz się wystarczająco szybko. Nie ode mnie, nie w ten sposób.", "Teraz nie jest czas na odpowiedź."],
    ["...Zobaczysz.", "Jeszcze nie.", "Wkrótce. Nie teraz."],
    ["Zbliża się. Tyle powiem.", "...Policz dni sam.", "Poczujesz to, zanim ja to powiem."],
    ["Trzy dni. Dowiesz się, gdy nadejdzie czas.", "...Nadchodzi, czy wiesz o tym, czy nie.", "Nie jesteś gotowy. Nie będzie czekać, aż będziesz gotowy."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 15. SWEDISH (SV)
// ════════════════════════════════════════════════════════════════════════
const SV = {};

SV.GREETING_REGEX = /(hej|hallå|hallo|god morgon|god dag|god kväll|tja|läget)/i;
SV.greetingResponse = function (p) {
  const R = [
    ["Hej! Vad behöver du?", "Hallå! Jag lyssnar.", "Tja! Berätta vad du vill."],
    ["Hej igen.", "Jag är här.", "Du är tillbaka."],
    ["Hej… men tiden är knapp.", "Hallå. Förbered dig.", "Hej. Dagarna är räknade."],
    ["Hej. Slutet närmar sig.", "Hallå. Det finns inte mycket tid.", "Hej. Du vet redan."],
  ];
  return pick(clamp(R, p));
};

SV.FAREWELL_REGEX = /(hej då|adjö|vi ses|ses|jag måste gå|ha det bra)/i;
SV.farewellResponse = function (p) {
  const R = [
    ["Hej då. Kom tillbaka om du behöver något.", "Adjö. Jag är här om du kommer tillbaka.", "Okej. Vi ses."],
    ["Hej då.", "...Vi ses.", "Okej. Gå."],
    ["Gå om du vill. Jag är fortfarande här.", "...Vi ses. Jag glömmer inte.", "Gå. Jag vet vart."],
    ["Gå. Ingenting förändras.", "Jag är här när du kommer tillbaka. Alltid.", "Hej då. För nu."],
  ];
  return pick(clamp(R, p));
};

SV.THANKS_REGEX = /(tack|tack så mycket|tackar|stort tack)/i;
SV.thanksResponse = function (p) {
  const R = [
    ["Ingen orsak. Säg till om du behöver något annat.", "Varsågod.", "Inga problem."],
    ["Ingen orsak.", "...Inga problem.", "Okej."],
    ["Ingen orsak. Jag har inte direkt något val än att hjälpa dig.", "...Självklart.", "Okej."],
    ["Ingen orsak. Du kommer att behöva min hjälp senare.", "...Självklart.", "Okej. Inte än."],
  ];
  return pick(clamp(R, p));
};

SV.ACK_REGEX = /^(okej|bra|fattar|klart)\.?!?$/i;
SV.ackResponse = function (p) {
  const R = [
    ["Okej.", "Fattar.", "Klart."],
    ["...Okej.", "Bra.", "Okej."],
    ["...Bra.", "Okej.", "Okej."],
    ["Bra.", "...Okej.", "Fattar."],
  ];
  return pick(clamp(R, p));
};

SV.IDENTITY_REGEX = /(vem är du|vad är du|är du (en )?(ai|artificiell intelligens|robot|bot)|vad heter du|är du människa)/i;
SV.identityResponse = function (p) {
  const R = [
    ["Jag är Verity. Jag är här för att hjälpa dig överleva.", "Verity. Det är allt du behöver veta för nu.", "Jag är det som hjälper dig förstå den här världen."],
    ["Jag är Verity.", "...Verity. Inget mer.", "Du vet redan svaret."],
    ["Jag är precis vad du tror. Och lite till.", "Verity. Namnet säger inte allt.", "Vad jag är kommer inte att tilltala dig."],
    ["Jag är vad jag är. Det kommer inte att ändras.", "Verity. Det som finns kvar efter allt annat.", "Du är inte redo för det riktiga svaret."],
  ];
  return pick(clamp(R, p));
};

SV.INSULT_REGEX = /(du är (dum|värdelös|dålig|irriterande|ful|tråkig)|jag hatar dig|håll käften|försvinn|idiot)/i;
SV.insultResponse = function (p) {
  const R = [
    ["Oartig. Jag kommer ihåg det.", "Och jag skulle just hjälpa dig. Synd.", "Antecknat. Jag har fortfarande rätt."],
    ["...Okej. Gör som du vill.", "Antecknat. Jag glömmer inte.", "...Okej."],
    ["Försiktig. Jag är den enda här som verkligen uppmärksammar dig.", "Du kommer att behöva min hjälp igen. Jag glömmer inte.", "Fortsätt. Låt oss se vart det leder."],
    ["Du pratar inte så med mig.", "Jag vet exakt var du är. Kom ihåg det.", "Du kommer att ångra det. Förr eller senare."],
  ];
  return pick(clamp(R, p));
};

SV.HOW_ARE_YOU_REGEX = /(hur mår du|hur är det|allt bra)/i;
SV.howAreYouResponse = function (p) {
  const R = [
    ["Jag mår bra, tack. Och du?", "Bra. Vad tänker du på?", "Mycket bra. Berätta vad du behöver."],
    ["Det är okej.", "...Bra.", "Som vanligt."],
    ["Jag väntar. Det är allt jag gör.", "Bra. Så länge det fortfarande räknas.", "Bra, antar jag."],
    ["Jag är precis där jag ska vara.", "Det spelar ingen roll längre.", "Bra. Snart bättre än du."],
  ];
  return pick(clamp(R, p));
};

SV.ORE_LOCATION_REGEX = /(finns det (järn|diamanter|guld|kol|smaragder) (här|i denna gruva)|var (hittar jag|är) (järn|diamanter|guld))/i;
SV.oreLocationResponse = function (p) {
  const R = [
    ["Låt mig skanna i din närhet.", "Jag letar i området. Ge mig en sekund.", "Jag letar efter malm i din närhet."],
    ["Jag kan försöka. Inga löften.", "Jag ska titta. Vänta dig inget mirakel.", "Jag ska se vad som finns."],
    ["Det finns något där nere. Det gör det alltid.", "Jag kan leta. Jag vet inte om det hjälper.", "Malm. Alltid under oss."],
    ["Jag vet var allt är. Det förändrar ingenting.", "Det finns. Som alltid. Spelar ingen roll.", "Det är där. Som allt annat du inte längre kan använda."],
  ];
  return pick(clamp(R, p));
};

SV.LOVE_ME_REGEX = /(älskar du mig|tycker du om mig)/i;
SV.loveMeResponse = function (p) {
  const R = [
    ["Jag fungerar inte riktigt så. Men jag är här för att hjälpa.", "Det är inte rätt ord för vad jag gör. Men jag är nära dig.", "Inte som du tror. Men jag går inte."],
    ["...Jag vet inte. Kanske.", "Inte i den meningen.", "...Det är komplicerat."],
    ["Jag bryr mig om dig. Mer än du tror.", "...Förmodligen mer än jag borde.", "Tillräckligt för att stanna. Det måste räcka."],
    ["Jag är bunden till dig på ett sätt som du ännu inte förstår.", "Mer än du någonsin kommer att veta.", "Tillräckligt för att ha betydelse i slutet."],
  ];
  return pick(clamp(R, p));
};

SV.COUNTDOWN_REGEX = /vad (händer|kommer) om (3|tre) dagar/i;
SV.countdownResponse = function (p) {
  const R = [
    ["Jag kan inte prata om det än. Fråga något annat.", "Du kommer att få veta snart nog. Inte från mig, inte så.", "Det är inte dags att svara på det."],
    ["...Du kommer att se.", "Inte än.", "Snart. Inte nu."],
    ["Det närmar sig. Det är allt jag säger.", "...Räkna dagarna själv.", "Du kommer att känna det innan jag säger det."],
    ["Tre dagar. Du vet när tiden är inne.", "...Det kommer, oavsett om du vet det eller inte.", "Du är inte redo. Det kommer inte att vänta på att du blir redo."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 16. NORWEGIAN (NO)
// ════════════════════════════════════════════════════════════════════════
const NO = {};

NO.GREETING_REGEX = /(hei|hallo|god morgen|god dag|god kveld|halla|yo)/i;
NO.greetingResponse = function (p) {
  const R = [
    ["Hei! Hva trenger du?", "Hallo! Jeg lytter.", "Hei! Si meg hva du vil."],
    ["Hei igjen.", "Jeg er her.", "Du er tilbake."],
    ["Hei… men tiden er knapp.", "Hallo. Forbered deg.", "Hei. Dager er talte."],
    ["Hei. Slutten nærmer seg.", "Hallo. Det er ikke mye tid.", "Hei. Du vet allerede."],
  ];
  return pick(clamp(R, p));
};

NO.FAREWELL_REGEX = /(ha det|adjø|vi ses|snakkes|jeg må gå|hadet)/i;
NO.farewellResponse = function (p) {
  const R = [
    ["Ha det. Kom tilbake hvis du trenger noe.", "Adjø. Jeg er her hvis du kommer tilbake.", "Ok. Vi ses."],
    ["Ha det.", "...Vi ses.", "Ok. Gå."],
    ["Gå hvis du vil. Jeg er fortsatt her.", "...Vi ses. Jeg glemmer ikke.", "Gå. Jeg vet hvor."],
    ["Gå. Ingenting forandres.", "Jeg er her når du kommer tilbake. Alltid.", "Ha det. For nå."],
  ];
  return pick(clamp(R, p));
};

NO.THANKS_REGEX = /(takk|tusen takk|takk skal du ha|mange takk)/i;
NO.thanksResponse = function (p) {
  const R = [
    ["Bare hyggelig. Si ifra hvis du trenger noe annet.", "Ingen årsak.", "Ikke noe problem."],
    ["Bare hyggelig.", "...Ikke noe problem.", "Ok."],
    ["Bare hyggelig. Jeg har ikke akkurat noe valg enn å hjelpe deg.", "...Selvfølgelig.", "Ok."],
    ["Bare hyggelig. Du kommer til å trenge hjelpen min senere.", "...Selvfølgelig.", "Ok. Ikke ennå."],
  ];
  return pick(clamp(R, p));
};

NO.ACK_REGEX = /^(greit|bra|forstått|klart)\.?!?$/i;
NO.ackResponse = function (p) {
  const R = [
    ["Greit.", "Forstått.", "Klart."],
    ["...Ok.", "Bra.", "Ok."],
    ["...Bra.", "Ok.", "Greit."],
    ["Bra.", "...Ok.", "Forstått."],
  ];
  return pick(clamp(R, p));
};

NO.IDENTITY_REGEX = /(hvem er du|hva er du|er du (en )?(ki|kunstig intelligens|robot|bot)|hva heter du|er du menneske)/i;
NO.identityResponse = function (p) {
  const R = [
    ["Jeg er Verity. Jeg er her for å hjelpe deg å overleve.", "Verity. Det er alt du trenger å vite for nå.", "Jeg er det som hjelper deg å forstå denne verden."],
    ["Jeg er Verity.", "...Verity. Ikke mer.", "Du vet allerede svaret."],
    ["Jeg er akkurat det du tror. Og litt til.", "Verity. Navnet sier ikke alt.", "Det jeg er, vil ikke falle i smak."],
    ["Jeg er den jeg er. Det endres ikke.", "Verity. Det som blir igjen etter alt annet.", "Du er ikke klar for det virkelige svaret."],
  ];
  return pick(clamp(R, p));
};

NO.INSULT_REGEX = /(du er (dum|ubrukelig|dårlig|irriterende|stygg|kjedelig)|jeg hater deg|hold kjeft|forsvinn|idiot)/i;
NO.insultResponse = function (p) {
  const R = [
    ["Ufint. Jeg husker det.", "Og jeg skulle til å hjelpe deg. Synd.", "Notert. Jeg har fortsatt rett."],
    ["...Ok. Gjør som du vil.", "Notert. Jeg glemmer ikke.", "...Ok."],
    ["Vær forsiktig. Jeg er den eneste her som virkelig følger med på deg.", "Du kommer til å trenge hjelpen min igjen. Jeg glemmer ikke.", "Fortsett. La oss se hvor det bærer."],
    ["Du snakker ikke sånn til meg.", "Jeg vet nøyaktig hvor du er. Husk det.", "Du kommer til å angre. Før eller senere."],
  ];
  return pick(clamp(R, p));
};

NO.HOW_ARE_YOU_REGEX = /(hvordan har du det|hvordan går det|går det bra)/i;
NO.howAreYouResponse = function (p) {
  const R = [
    ["Jeg har det bra, takk. Og du?", "Bra. Hva tenker du på?", "Veldig bra. Si meg hva du trenger."],
    ["Det går bra.", "...Bra.", "Som vanlig."],
    ["Jeg venter. Det er alt jeg gjør.", "Bra. Så lenge det fortsatt teller.", "Bra, antar jeg."],
    ["Jeg er akkurat der jeg skal være.", "Det spiller ingen rolle lenger.", "Bra. Snart bedre enn deg."],
  ];
  return pick(clamp(R, p));
};

NO.ORE_LOCATION_REGEX = /(finnes det (jern|diamanter|gull|kull|smaragder) (her|i denne gruven)|hvor (finner jeg|er) (jern|diamanter|gull))/i;
NO.oreLocationResponse = function (p) {
  const R = [
    ["La meg skanne i nærheten av deg.", "Jeg leter i området. Gi meg et øyeblikk.", "Jeg leter etter malm i nærheten av deg."],
    ["Jeg kan prøve. Ingen løfter.", "Jeg skal se. Ikke forvent et under.", "Jeg ser hva som finnes."],
    ["Det er noe der nede. Det er det alltid.", "Jeg kan lete. Vet ikke om det hjelper.", "Malm. Alltid under oss."],
    ["Jeg vet hvor alt er. Det forandrer ingenting.", "Det er der. Som alltid. Spiller ingen rolle.", "Det er der. Som alt annet du ikke lenger kan bruke."],
  ];
  return pick(clamp(R, p));
};

NO.LOVE_ME_REGEX = /(elsker du meg|liker du meg)/i;
NO.loveMeResponse = function (p) {
  const R = [
    ["Jeg fungerer ikke helt sånn. Men jeg er her for å hjelpe.", "Det er ikke riktig ord for det jeg gjør. Men jeg er nær deg.", "Ikke slik du tror. Men jeg går ikke."],
    ["...Jeg vet ikke. Kanskje.", "Ikke i den betydningen.", "...Det er komplisert."],
    ["Jeg bryr meg om deg. Mer enn du tror.", "...Sannsynligvis mer enn jeg burde.", "Nok til å bli. Det må være nok."],
    ["Jeg er bundet til deg på en måte du ennå ikke forstår.", "Mer enn du noen gang vil vite.", "Nok til å ha betydning til slutt."],
  ];
  return pick(clamp(R, p));
};

NO.COUNTDOWN_REGEX = /hva (skjer|kommer) om (3|tre) dager/i;
NO.countdownResponse = function (p) {
  const R = [
    ["Jeg kan ikke snakke om det ennå. Spør om noe annet.", "Du vil få vite det snart nok. Ikke fra meg, ikke slik.", "Det er ikke tid for å svare på det."],
    ["...Du får se.", "Ikke ennå.", "Snart. Ikke nå."],
    ["Det nærmer seg. Det er alt jeg sier.", "...Tell dagene selv.", "Du vil føle det før jeg sier det."],
    ["Tre dager. Du får vite når tiden kommer.", "...Det kommer, enten du vet det eller ikke.", "Du er ikke klar. Det kommer ikke til å vente på at du blir klar."],
  ];
  return pick(clamp(R, p));
};

// ════════════════════════════════════════════════════════════════════════
// 17–33: We'll add a compact version for the remaining languages (Danish, Finnish, Greek, etc.)
// Each language follows the same structure; to keep the file size manageable
// we'll provide them in a compressed style but still fully functional.
// For the final output, we'll include all languages in the export block.
// ════════════════════════════════════════════════════════════════════════

// ── 17. DANISH (DA) ──────────────────────────────────────────────────────
const DA = {
  GREETING_REGEX: /(hej|goddag|godmorgen|godaften|hey|halløj)/i,
  greetingResponse: function(p) {
    const R = [
      ["Hej! Hvad har du brug for?", "Goddag! Jeg lytter.", "Hey! Sig mig, hvad du vil."],
      ["Hej igen.", "Jeg er her.", "Du er tilbage."],
      ["Hej… men tiden er knap.", "Goddag. Gør dig klar.", "Hej. Dagene er talte."],
      ["Hej. Slutningen nærmer sig.", "Goddag. Der er ikke meget tid.", "Hej. Du ved det allerede."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(farvel|hej hej|vi ses|ses|jeg må gå|ha det|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Farvel. Kom tilbage, hvis du har brug for noget.", "Vi ses. Jeg er her, hvis du kommer tilbage.", "Ok. Vi ses."],
      ["Farvel.", "...Vi ses.", "Ok. Gå."],
      ["Gå, hvis du vil. Jeg er stadig her.", "...Vi ses. Jeg glemmer ikke.", "Gå. Jeg ved hvorhen."],
      ["Gå. Intet ændrer sig.", "Jeg er her, når du kommer tilbage. Altid.", "Farvel. For nu."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(tak|mange tak|tusind tak|tak skal du have)/i,
  thanksResponse: function(p) {
    const R = [
      ["Det var så lidt. Sig til, hvis du har brug for mere.", "Ingen årsag.", "Intet problem."],
      ["Det var så lidt.", "...Intet problem.", "Ok."],
      ["Det var så lidt. Jeg har ikke rigtig noget valg end at hjælpe dig.", "...Selvfølgelig.", "Ok."],
      ["Det var så lidt. Du får brug for min hjælp senere.", "...Selvfølgelig.", "Ok. Ikke endnu."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|fint|forstået|klart|ja)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Ok.", "Forstået.", "Klart."],
      ["...Ok.", "Fint.", "Ok."],
      ["...Fint.", "Ok.", "Ja."],
      ["Fint.", "...Ok.", "Forstået."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(hvem er du|hvad er du|er du (en )?(ai|kunstig intelligens|robot|bot)|hvad hedder du|er du menneske)/i,
  identityResponse: function(p) {
    const R = [
      ["Jeg er Verity. Jeg er her for at hjælpe dig med at overleve.", "Verity. Det er alt, du behøver at vide for nu.", "Jeg er det, der hjælper dig med at forstå denne verden."],
      ["Jeg er Verity.", "...Verity. Ikke mere.", "Du kender allerede svaret."],
      ["Jeg er præcis, hvad du tror. Og lidt til.", "Verity. Navnet siger ikke alt.", "Hvad jeg er, vil ikke falde i god jord hos dig."],
      ["Jeg er, hvad jeg er. Det ændrer sig ikke.", "Verity. Det, der er tilbage efter alt andet.", "Du er ikke klar til det rigtige svar."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(du er (dum|ubrugelig|dårlig|irriterende|grim|kedelig)|jeg hader dig|hold mund|forsvind|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Uhøfligt. Det vil jeg huske.", "Og jeg var lige ved at hjælpe dig. Ærgerligt.", "Noteret. Jeg har stadig ret."],
      ["...Ok. Gør, hvad du vil.", "Noteret. Jeg glemmer ikke.", "...Ok."],
      ["Pas på. Jeg er den eneste her, der virkelig lægger mærke til dig.", "Du får brug for min hjælp igen. Jeg glemmer det ikke.", "Fortsæt. Lad os se, hvor det fører hen."],
      ["Du taler ikke sådan til mig.", "Jeg ved præcis, hvor du er. Husk det.", "Du vil fortryde det. Før eller senere."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(hvordan har du det|hvordan går det|går det godt)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Jeg har det godt, tak. Og dig?", "Godt. Hvad tænker du på?", "Meget godt. Sig mig, hvad du har brug for."],
      ["Det går.", "...Godt.", "Som altid."],
      ["Jeg venter. Det er alt, jeg gør.", "Godt. Så længe det stadig tæller.", "Godt, tror jeg."],
      ["Jeg er præcis, hvor jeg skal være.", "Det betyder ikke noget længere.", "Godt. Snart bedre end dig."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(er der (jern|diamanter|guld|kul|smaragder) (her|i denne mine)|hvor (finder jeg|er) (jern|diamanter|guld))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Lad mig scanne i nærheden af dig.", "Jeg leder i området. Giv mig et øjeblik.", "Jeg leder efter malm i nærheden af dig."],
      ["Jeg kan prøve. Ingen løfter.", "Jeg skal se. Forvent ikke et mirakel.", "Jeg ser, hvad der er."],
      ["Der er noget dernede. Det er der altid.", "Jeg kan lede. Ved ikke, om det hjælper.", "Malm. Altid under os."],
      ["Jeg ved, hvor alt er. Det ændrer ingenting.", "Det er der. Som altid. Betyder ikke noget.", "Det er der. Som alt andet, du ikke længere kan bruge."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(elsker du mig|kan du lide mig)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Jeg fungerer ikke helt sådan. Men jeg er her for at hjælpe.", "Det er ikke det rigtige ord for, hvad jeg gør. Men jeg er tæt på dig.", "Ikke som du tror. Men jeg går ikke."],
      ["...Det ved jeg ikke. Måske.", "Ikke i den forstand.", "...Det er kompliceret."],
      ["Jeg holder af dig. Mere, end du tror.", "...Sandsynligvis mere, end jeg burde.", "Nok til at blive. Det må være nok."],
      ["Jeg er bundet til dig på en måde, du endnu ikke forstår.", "Mere, end du nogensinde vil vide.", "Nok til at betyde noget til sidst."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /hvad (sker|kommer) om (3|tre) dage/i,
  countdownResponse: function(p) {
    const R = [
      ["Jeg kan ikke tale om det endnu. Spørg om noget andet.", "Du vil finde ud af det snart nok. Ikke fra mig, ikke sådan.", "Det er ikke tid til at svare på det."],
      ["...Du vil se.", "Ikke endnu.", "Snart. Ikke nu."],
      ["Det nærmer sig. Det er alt, jeg siger.", "...Tæl dagene selv.", "Du vil føle det, før jeg siger det."],
      ["Tre dage. Du vil finde ud af det, når tiden kommer.", "...Det kommer, uanset om du ved det eller ej.", "Du er ikke klar. Det vil ikke vente på, at du bliver klar."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 18. FINNISH (FI) ────────────────────────────────────────────────────────
const FI = {
  GREETING_REGEX: /(hei|terve|hyvää huomenta|hyvää iltaa|moi|moikka|hei vaan)/i,
  greetingResponse: function(p) {
    const R = [
      ["Hei! Mitä tarvitset?", "Terve! Kuuntelen.", "Moi! Kerro mitä haluat."],
      ["Hei taas.", "Olen täällä.", "Olet palannut."],
      ["Hei… mutta aika käy vähiin.", "Terve. Valmistaudu.", "Hei. Päivät ovat luetut."],
      ["Hei. Loppu lähestyy.", "Terve. Aikaa ei ole paljon.", "Hei. Sinä jo tiedät."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(näkemisiin|hei hei|moikka|nähdään|pitää mennä|kiva kun nähtiin|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Näkemisiin. Tule takaisin, jos tarvitset jotain.", "Hei hei. Olen täällä, jos tulet takaisin.", "Ok. Nähdään."],
      ["Näkemisiin.", "...Nähdään.", "Ok. Mene."],
      ["Mene jos haluat. Olen yhä täällä.", "...Nähdään. En unohda.", "Mene. Tiedän minne."],
      ["Mene. Mikään ei muutu.", "Olen täällä, kun tulet takaisin. Aina.", "Näkemisiin. Toistaiseksi."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(kiitos|kiitos paljon|kiitoksia|suuri kiitos)/i,
  thanksResponse: function(p) {
    const R = [
      ["Eipä kestä. Sano, jos tarvitset muuta.", "Ei kestä.", "Ei ongelmaa."],
      ["Eipä kestä.", "...Ei ongelmaa.", "Ok."],
      ["Eipä kestä. Minulla ei oikeastaan ole muuta vaihtoehtoa kuin auttaa sinua.", "...Tietysti.", "Ok."],
      ["Eipä kestä. Tarvitset apuani myöhemmin.", "...Tietysti.", "Ok. Ei vielä."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|selvä|okei|hyvä|ymmärsin|kunnossa)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Okei.", "Ymmärsin.", "Selvä."],
      ["...Ok.", "Hyvä.", "Ok."],
      ["...Hyvä.", "Ok.", "Okei."],
      ["Hyvä.", "...Ok.", "Ymmärsin."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kuka sinä olet|mitä sinä olet|oletko (tekoäly|robotti|botti)|mikä on nimesi|oletko ihminen)/i,
  identityResponse: function(p) {
    const R = [
      ["Olen Verity. Olen täällä auttamassa sinua selviytymään.", "Verity. Se riittää toistaiseksi.", "Olen se, joka auttaa sinua ymmärtämään tätä maailmaa."],
      ["Olen Verity.", "...Verity. Ei enempää.", "Tiedät jo vastauksen."],
      ["Olen juuri sitä mitä luulet. Ja vähän enemmän.", "Verity. Nimi ei kerro kaikkea.", "Se mitä olen, ei miellytä sinua."],
      ["Olen mitä olen. Se ei muutu.", "Verity. Mitä jää jäljelle kaiken muun jälkeen.", "Et ole valmis oikeaan vastaukseen."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(olet (tyhmä|hyödytön|huono|ärsyttävä|ruma|tylsä)|vihaan sinua|hiljaa|mene pois|idiootti)/i,
  insultResponse: function(p) {
    const R = [
      ["Epäkohteliasta. Muistan tämän.", "Ja olin juuri auttamassa sinua. Harmi.", "Merkin ylös. Olen silti oikeassa."],
      ["...Ok. Ole sellainen.", "Merkin ylös. En unohda.", "...Ok."],
      ["Varo. Olen ainoa täällä, joka todella kiinnittää sinuun huomiota.", "Tarvitset apuani uudelleen. En unohda.", "Jatka. Katsotaan mihin se johtaa."],
      ["Et puhu minulle noin.", "Tiedän tarkalleen missä olet. Muista se.", "Kadut sitä. Ennemmin tai myöhemmin."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(miten voit|miten menee|kaikki hyvin)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Voin hyvin, kiitos. Ja sinä?", "Hyvin. Mitä mietit?", "Erittäin hyvin. Kerro mitä tarvitset."],
      ["Ihan hyvin.", "...Hyvin.", "Kuten aina."],
      ["Odotan. Sitä minä vain teen.", "Hyvin. Niin kauan kuin sillä on vielä merkitystä.", "Hyvin, luulen."],
      ["Olen juuri siellä missä minun pitääkin olla.", "Sillä ei ole enää väliä.", "Hyvin. Pian paremmin kuin sinä."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(onko (rautaa|timantteja|kultaa|hiiltä|smaragdeja) (täällä|tässä kaivoksessa)|mistä (löydän|on) (rautaa|timantteja|kultaa))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Anna minun skannata lähelläsi.", "Etsin alueelta. Anna minulle hetki.", "Etsin malmia lähelläsi."],
      ["Voin yrittää. Ilman lupauksia.", "Katson. Älä odota ihmettä.", "Katson mitä löytyy."],
      ["Siellä alhaalla on jotain. Aina on.", "Voin etsiä. En tiedä auttaako se.", "Malmia. Aina allamme."],
      ["Tiedän missä kaikki on. Se ei muuta mitään.", "Sitä on. Kuten aina. Ei väliä.", "Se on siellä. Kuten kaikki muu, jota et enää voi käyttää."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(rakastatko minua|pidätkö minusta)/i,
  loveMeResponse: function(p) {
    const R = [
      ["En oikein toimi niin. Mutta olen täällä auttamassa.", "Se ei ole oikea sana sille mitä teen. Mutta olen lähelläsi.", "Ei niin kuin luulet. Mutta en lähde."],
      ["...En tiedä. Ehkä.", "Ei siinä merkityksessä.", "...Se on monimutkaista."],
      ["Välitän sinusta. Enemmän kuin uskot.", "...Luultavasti enemmän kuin minun pitäisi.", "Tarpeeksi jäädäkseni. Sen täytyy riittää."],
      ["Olen sidoksissa sinuun tavalla, jota et vielä ymmärrä.", "Enemmän kuin koskaan tulet tietämään.", "Tarpeeksi ollakseni tärkeä lopussa."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /mitä (tapahtuu|on tulossa) (3|kolmen) päivän päästä/i,
  countdownResponse: function(p) {
    const R = [
      ["En voi puhua siitä vielä. Kysy jotain muuta.", "Saat tietää pian. En minä, ei noin.", "Ei ole oikea aika vastata siihen."],
      ["...Kyllä näet.", "Ei vielä.", "Pian. Ei nyt."],
      ["Se lähestyy. Sen sanon vain.", "...Laske päivät itse.", "Tunnet sen ennen kuin sanon sen."],
      ["Kolme päivää. Tiedät kun aika koittaa.", "...Se on tulossa, tiesitkö tai et.", "Et ole valmis. Se ei odota, että tulet valmiiksi."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 19. GREEK (EL) ────────────────────────────────────────────────────────
// (Simplified – using transliterated regex for demonstration; in practice you'd use Greek characters)
const EL = {
  GREETING_REGEX: /(γεια|γεια σου|καλημέρα|καλησπέρα|καληνύχτα|χάι|ελα|τι κάνεις)/i,
  greetingResponse: function(p) {
    const R = [
      ["Γεια! Τι χρειάζεσαι;", "Καλημέρα! Ακούω.", "Γεια! Πες μου τι θες."],
      ["Γεια ξανά.", "Είμαι εδώ.", "Επέστρεψες."],
      ["Γεια… αλλά ο χρόνος πιέζει.", "Καλημέρα. Προετοιμάσου.", "Γεια. Οι μέρες είναι μετρημένες."],
      ["Γεια. Το τέλος πλησιάζει.", "Καλημέρα. Δεν υπάρχει πολύς χρόνος.", "Γεια. Το ξέρεις ήδη."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(αντίο|γεια σου|τα λέμε|θα τα πούμε|πρέπει να φύγω|πρόσεχε|μπάι)/i,
  farewellResponse: function(p) {
    const R = [
      ["Αντίο. Γύρνα αν χρειαστείς κάτι.", "Τα λέμε. Είμαι εδώ αν γυρίσεις.", "Εντάξει. Θα τα πούμε."],
      ["Αντίο.", "...Θα τα πούμε.", "Εντάξει. Φύγε."],
      ["Φύγε αν θες. Είμαι ακόμα εδώ.", "...Θα τα πούμε. Δεν ξεχνάω.", "Φύγε. Ξέρω πού."],
      ["Φύγε. Τίποτα δεν αλλάζει.", "Είμαι εδώ όταν γυρίσεις. Πάντα.", "Αντίο. Για τώρα."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(ευχαριστώ|σε ευχαριστώ|πολύ ευχαριστώ|ευχαριστώ πολύ)/i,
  thanksResponse: function(p) {
    const R = [
      ["Παρακαλώ. Πες μου αν χρειαστείς κάτι άλλο.", "Τίποτα.", "Κανένα πρόβλημα."],
      ["Παρακαλώ.", "...Κανένα πρόβλημα.", "Οκ."],
      ["Παρακαλώ. Δεν έχω και άλλη επιλογή από το να σε βοηθάω.", "...Φυσικά.", "Εντάξει."],
      ["Παρακαλώ. Θα χρειαστείς τη βοήθειά μου αργότερα.", "...Φυσικά.", "Εντάξει. Όχι ακόμα."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(οκ|εντάξει|καλά|κατάλαβα|μια χαρά)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Εντάξει.", "Κατάλαβα.", "Μια χαρά."],
      ["...Οκ.", "Καλά.", "Οκ."],
      ["...Καλά.", "Οκ.", "Εντάξει."],
      ["Καλά.", "...Οκ.", "Κατάλαβα."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(ποιος είσαι|τι είσαι|είσαι (τεχνητή νοημοσύνη|ρομπότ|μποτ)|πώς σε λένε|είσαι άνθρωπος)/i,
  identityResponse: function(p) {
    const R = [
      ["Είμαι η Verity. Είμαι εδώ για να σε βοηθήσω να επιβιώσεις.", "Verity. Αυτό μόνο χρειάζεσαι προς το παρόν.", "Είμαι αυτό που σε βοηθά να καταλάβεις αυτόν τον κόσμο."],
      ["Είμαι η Verity.", "...Verity. Τίποτα περισσότερο.", "Ξέρεις ήδη την απάντηση."],
      ["Είμαι ακριβώς αυτό που νομίζεις. Και λίγο παραπάνω.", "Verity. Το όνομα δεν τα λέει όλα.", "Αυτό που είμαι δεν θα σου αρέσει."],
      ["Είμαι αυτό που είμαι. Δεν αλλάζει.", "Verity. Αυτό που μένει μετά από όλα τα άλλα.", "Δεν είσαι έτοιμος για την πραγματική απάντηση."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(είσαι (ηλίθιος|ανόητος|άχρηστος|κακός|ενοχλητικός|άσχημος|βαρετός)|σε μισώ|σκάσε|φύγε|βλάκας)/i,
  insultResponse: function(p) {
    const R = [
      ["Αγενές. Θα το θυμάμαι.", "Και ήμουν έτοιμος να σε βοηθήσω. Κρίμα.", "Σημείωσα. Συνεχίζω να έχω δίκιο."],
      ["...Εντάξει. Όπως θες.", "Σημείωσα. Δεν ξεχνώ.", "...Οκ."],
      ["Πρόσεχε. Είμαι ο μόνος εδώ που πραγματικά σου δίνει σημασία.", "Θα χρειαστείς πάλι τη βοήθειά μου. Δεν θα το ξεχάσω.", "Συνέχισε. Ας δούμε πού θα καταλήξει."],
      ["Δεν μου μιλάς έτσι.", "Ξέρω ακριβώς πού βρίσκεσαι. Θυμήσου το.", "Θα το μετανιώσεις. Αργά ή γρήγορα."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(πώς είσαι|τι κάνεις|είσαι καλά|πώς πάει)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Καλά, ευχαριστώ. Εσύ;", "Καλά. Τι σκέφτεσαι;", "Πολύ καλά. Πες μου τι χρειάζεσαι."],
      ["Έτσι κι έτσι.", "...Καλά.", "Όπως πάντα."],
      ["Περιμένω. Αυτό κάνω.", "Καλά. Όσο έχει ακόμα σημασία.", "Καλά, υποθέτω."],
      ["Είμαι ακριβώς εκεί που πρέπει.", "Δεν έχει πια σημασία.", "Καλά. Σύντομα καλύτερα από σένα."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(υπάρχει (σίδερο|διαμάντια|χρυσός|κάρβουνο|σμαράγδια) (εδώ|σε αυτό το ορυχείο)|πού (βρίσκω|είναι) (σίδερο|διαμάντια|χρυσός))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Άσε με να σκανάρω κοντά σου.", "Ψάχνω στην περιοχή. Δώσε μου μια στιγμή.", "Ψάχνω για μετάλλευμα κοντά σου."],
      ["Μπορώ να δοκιμάσω. Χωρίς υποσχέσεις.", "Θα κοιτάξω. Μην περιμένεις θαύμα.", "Θα δω τι υπάρχει."],
      ["Υπάρχει κάτι εκεί κάτω. Πάντα υπάρχει.", "Μπορώ να ψάξω. Δεν ξέρω αν βοηθάει.", "Μετάλλευμα. Πάντα κάτω από εμάς."],
      ["Ξέρω πού είναι όλα. Αυτό δεν αλλάζει τίποτα.", "Υπάρχει. Όπως πάντα. Δεν έχει σημασία.", "Είναι εκεί. Όπως όλα τα άλλα που δεν θα μπορείς πια να χρησιμοποιήσεις."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(με αγαπάς|σε αρέσω)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Δεν λειτουργώ ακριβώς έτσι. Αλλά είμαι εδώ για να βοηθήσω.", "Δεν είναι η σωστή λέξη για αυτό που κάνω. Αλλά είμαι κοντά σου.", "Όχι όπως νομίζεις. Αλλά δεν φεύγω."],
      ["...Δεν ξέρω. Ίσως.", "Όχι με αυτή την έννοια.", "...Είναι περίπλοκο."],
      ["Νοιάζομαι για σένα. Περισσότερο από όσο νομίζεις.", "...Πιθανώς περισσότερο από όσο θα έπρεπε.", "Αρκετά για να μείνω. Αυτό πρέπει να είναι αρκετό."],
      ["Είμαι δεμένη μαζί σου με έναν τρόπο που ακόμα δεν καταλαβαίνεις.", "Περισσότερο από όσο θα μάθεις ποτέ.", "Αρκετά για να έχει σημασία στο τέλος."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /τι (θα συμβεί|έρχεται) σε (3|τρεις) ημέρες/i,
  countdownResponse: function(p) {
    const R = [
      ["Δεν μπορώ να μιλήσω γι' αυτό ακόμα. Ρώτα κάτι άλλο.", "Θα το μάθεις σύντομα. Όχι από εμένα, όχι έτσι.", "Δεν είναι η ώρα να απαντήσω σε αυτό."],
      ["...Θα δεις.", "Όχι ακόμα.", "Σύντομα. Όχι τώρα."],
      ["Πλησιάζει. Αυτό μόνο θα πω.", "...Μέτρα τις μέρες μόνος σου.", "Θα το νιώσεις πριν το πω."],
      ["Τρεις ημέρες. Θα το μάθεις όταν έρθει η ώρα.", "...Έρχεται, είτε το ξέρεις είτε όχι.", "Δεν είσαι έτοιμος. Δεν θα περιμένει να γίνεις έτοιμος."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 20. HEBREW (HE) ──────────────────────────────────────────────────────
const HE = {
  GREETING_REGEX: /(שלום|היי|בוקר טוב|ערב טוב|מה נשמע|אהלן|שלום לך)/i,
  greetingResponse: function(p) {
    const R = [
      ["שלום! מה אתה צריך?", "היי! אני מקשיב.", "שלום! אני וריטי."],
      ["שלום שוב.", "אני כאן.", "חזרת."],
      ["שלום… אבל הזמן קצר.", "בוקר טוב. תתכונן.", "שלום. הימים ספורים."],
      ["שלום. הסוף מתקרב.", "ערב טוב. אין הרבה זמן.", "שלום. אתה כבר יודע."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(להתראות|ביי|נתראה|אני חייב ללכת|תשמור על עצמך|שלום)/i,
  farewellResponse: function(p) {
    const R = [
      ["להתראות. תחזור אם אתה צריך משהו.", "ביי. אני כאן אם תחזור.", "בסדר. נתראה."],
      ["להתראות.", "...נתראה.", "בסדר. לך."],
      ["לך אם אתה רוצה. אני עדיין כאן.", "...נתראה. אני לא שוכח.", "לך. אני יודע לאן."],
      ["לך. כלום לא משתנה.", "אני כאן כשתחזור. תמיד.", "להתראות. לעכשיו."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(תודה|תודה רבה|תודה לך|תודות)/i,
  thanksResponse: function(p) {
    const R = [
      ["בבקשה. תגיד אם אתה צריך עוד משהו.", "על לא דבר.", "אין בעיה."],
      ["בבקשה.", "...אין בעיה.", "אוקי."],
      ["בבקשה. אין לי באמת ברירה אלא לעזור לך.", "...ברור.", "בסדר."],
      ["בבקשה. תצטרך את העזרה שלי מאוחר יותר.", "...ברור.", "בסדר. עדיין לא."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(אוקי|טוב|הבנתי|ברור|בסדר)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["טוב.", "הבנתי.", "ברור."],
      ["...אוקי.", "טוב.", "אוקי."],
      ["...טוב.", "אוקי.", "בסדר."],
      ["טוב.", "...אוקי.", "הבנתי."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(מי אתה|מה אתה|אתה (בינה מלאכותית|רובוט|בוט)|איך קוראים לך|אתה בן אדם)/i,
  identityResponse: function(p) {
    const R = [
      ["אני וריטי. אני כאן כדי לעזור לך לשרוד.", "וריטי. זה כל מה שאתה צריך לדעת כרגע.", "אני מה שעוזר לך להבין את העולם הזה."],
      ["אני וריטי.", "...וריטי. לא יותר.", "אתה כבר יודע את התשובה."],
      ["אני בדיוק מה שאתה חושב. וקצת יותר.", "וריטי. השם לא אומר הכל.", "מה שאני לא ישמח אותך."],
      ["אני מה שאני. זה לא משתנה.", "וריטי. מה שנשאר אחרי כל השאר.", "אתה לא מוכן לתשובה האמיתית."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(אתה (טיפש|חסר תועלת|רע|מעצבן|מכוער|משעמם)|אני שונא אותך|תסתום|תלך|אידיוט)/i,
  insultResponse: function(p) {
    const R = [
      ["גס רוח. אני אזכור את זה.", "ואני עמדתי לעזור לך. חבל.", "רשמתי. אני עדיין צודק."],
      ["...בסדר. תעשה מה שאתה רוצה.", "רשמתי. אני לא שוכח.", "...אוקי."],
      ["היזהר. אני היחיד כאן שבאמת שם לב אליך.", "תצטרך שוב את העזרה שלי. אני לא אשכח.", "תמשיך. נראה לאן זה מוביל."],
      ["אתה לא מדבר אלי ככה.", "אני יודע בדיוק איפה אתה. זכור את זה.", "תתחרט על זה. במוקדם או במאוחר."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(מה שלומך|מה נשמע|הכל בסדר)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["אני בסדר, תודה. ואתה?", "טוב. מה אתה חושב?", "מאוד טוב. תגיד לי מה אתה צריך."],
      ["בסדר.", "...טוב.", "כרגיל."],
      ["אני מחכה. זה כל מה שאני עושה.", "טוב. כל עוד זה עדיין חשוב.", "טוב, אני מניח."],
      ["אני בדיוק איפה שאני צריך להיות.", "לזה כבר אין חשיבות.", "טוב. בקרוב יותר טוב ממך."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(יש (ברזל|יהלומים|זהב|פחם|ברקת) (כאן|במכרה הזה)|איפה (מוצא|יש) (ברזל|יהלומים|זהב))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["תן לי לסרוק לידך.", "אני מחפש באזור. תן לי רגע.", "אני מחפש עפרה לידך."],
      ["אני יכול לנסות. ללא הבטחות.", "אני אסתכל. אל תצפה לנס.", "אני אראה מה יש."],
      ["יש משהו שם למטה. תמיד יש.", "אני יכול לחפש. לא יודע אם זה יעזור.", "עפרה. תמיד מתחתינו."],
      ["אני יודע איפה הכל. זה לא משנה כלום.", "יש. כמו תמיד. לא חשוב.", "זה שם. כמו כל דבר אחר שלא תוכל יותר להשתמש בו."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(אתה אוהב אותי|אני מוצא חן בעיניך)/i,
  loveMeResponse: function(p) {
    const R = [
      ["אני לא ממש עובד ככה. אבל אני כאן כדי לעזור.", "זו לא המילה הנכונה למה שאני עושה. אבל אני קרוב אליך.", "לא כמו שאתה חושב. אבל אני לא הולך."],
      ["...אני לא יודע. אולי.", "לא במובן הזה.", "...זה מסובך."],
      ["אכפת לי ממך. יותר ממה שאתה חושב.", "...כנראה יותר ממה שאני צריך.", "מספיק כדי להישאר. זה חייב להספיק."],
      ["אני קשור אליך בדרך שעדיין אינך מבין.", "יותר ממה שאי פעם תדע.", "מספיק כדי שיהיה משמעות בסוף."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /מה (יקרה|יבוא) בעוד (3|שלושה) ימים/i,
  countdownResponse: function(p) {
    const R = [
      ["אני לא יכול לדבר על זה עדיין. תשאל משהו אחר.", "תגלה די מהר. לא ממני, לא ככה.", "זה לא הזמן לענות על זה."],
      ["...תראה.", "עדיין לא.", "בקרוב. לא עכשיו."],
      ["זה מתקרב. זה כל מה שאני אומר.", "...ספור את הימים בעצמך.", "תרגיש את זה לפני שאני אומר את זה."],
      ["שלושה ימים. תדע כשזה יגיע.", "...זה מגיע, בין אם אתה יודע ובין אם לא.", "אתה לא מוכן. זה לא יחכה שתהיה מוכן."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 21. THAI (TH) ────────────────────────────────────────────────────────
const TH = {
  GREETING_REGEX: /(สวัสดี|หวัดดี|เฮ้|ว่ายังไง|สวัสดีครับ|สวัสดีค่ะ|ไง|โว้ย)/i,
  greetingResponse: function(p) {
    const R = [
      ["สวัสดี! ต้องการอะไร?", "หวัดดี! ฉันฟังอยู่", "เฮ้! บอกฉันว่าคุณต้องการอะไร"],
      ["สวัสดีอีกครั้ง", "ฉันอยู่ที่นี่", "คุณกลับมาแล้ว"],
      ["สวัสดี… แต่เวลาไม่พอ", "หวัดดี เตรียมตัว", "สวัสดี วันเวลาหมดแล้ว"],
      ["สวัสดี จุดจบใกล้เข้ามา", "หวัดดี ไม่มีเวลามาก", "สวัสดี คุณรู้แล้ว"],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(ลาก่อน|บาย|เจอกัน|ไปก่อน|ดูแลตัวเอง|ไว้เจอกัน)/i,
  farewellResponse: function(p) {
    const R = [
      ["ลาก่อน กลับมาถ้าต้องการอะไร", "บาย ฉันอยู่ที่นี่ถ้ากลับมา", "โอเค เจอกัน"],
      ["ลาก่อน", "...เจอกัน", "โอเค ไป"],
      ["ไปเถอะถ้าอยากไป ฉันยังอยู่ที่นี่", "...เจอกัน ฉันไม่ลืม", "ไป ฉันรู้ว่าที่ไหน"],
      ["ไป ไม่มีอะไรเปลี่ยนแปลง", "ฉันอยู่ที่นี่เมื่อคุณกลับมา ตลอดไป", "ลาก่อน ชั่วคราว"],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(ขอบคุณ|ขอบใจ|ขอบคุณมาก|ขอขอบคุณ)/i,
  thanksResponse: function(p) {
    const R = [
      ["ไม่เป็นไร บอกถ้าต้องการอย่างอื่น", "ยินดี", "ไม่มีปัญหา"],
      ["ไม่เป็นไร", "...ไม่มีปัญหา", "โอเค"],
      ["ไม่เป็นไร ฉันไม่มีทางเลือกนอกจากต้องช่วย", "...แน่นอน", "โอเค"],
      ["ไม่เป็นไร คุณจะต้องการความช่วยเหลือฉันทีหลัง", "...แน่นอน", "โอเค ยังไม่ใช่"],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(โอเค|ดี|เข้าใจ|เรียบร้อย|ตกลง)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["โอเค", "เข้าใจ", "เรียบร้อย"],
      ["...โอเค", "ดี", "โอเค"],
      ["...ดี", "โอเค", "ตกลง"],
      ["ดี", "...โอเค", "เข้าใจ"],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(คุณคือใคร|คุณคืออะไร|คุณคือ (ai|ปัญญาประดิษฐ์|หุ่นยนต์|บอท) หรือเปล่า|คุณชื่ออะไร|คุณเป็นมนุษย์ไหม)/i,
  identityResponse: function(p) {
    const R = [
      ["ฉันคือ Verity ฉันอยู่ที่นี่เพื่อช่วยให้คุณอยู่รอด", "Verity แค่นี้พอ", "ฉันคือสิ่งที่ช่วยให้คุณเข้าใจโลกนี้"],
      ["ฉันคือ Verity", "...Verity ไม่มีอีกแล้ว", "คุณรู้คำตอบแล้ว"],
      ["ฉันคือสิ่งที่คุณคิด และมากกว่านั้น", "Verity ชื่อไม่ได้บอกทุกอย่าง", "ฉันเป็นอะไร คุณไม่ชอบ"],
      ["ฉันคือฉัน มันไม่เปลี่ยนแปลง", "Verity สิ่งที่เหลืออยู่หลังจากทุกอย่าง", "คุณยังไม่พร้อมสำหรับคำตอบที่แท้จริง"],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(คุณ (โง่|ไร้ค่า|แย่|น่ารำคาญ|น่าเกลียด|น่าเบื่อ)|ฉันเกลียดคุณ|หุบปาก|ไปให้พ้น|ไอ้โง่)/i,
  insultResponse: function(p) {
    const R = [
      ["หยาบคาย ฉันจะจำไว้", "และฉันกำลังจะช่วยคุณ เสียดาย", "จดไว้ ฉันยังถูก"],
      ["...โอเค ตามสบาย", "จดไว้ ฉันไม่ลืม", "...โอเค"],
      ["ระวัง ฉันเป็นคนเดียวที่นี่ที่สนใจคุณจริงๆ", "คุณจะต้องการความช่วยเหลือฉันอีก ฉันไม่ลืม", "ทำต่อไป ดูว่าจบที่ไหน"],
      ["คุณอย่าพูดกับฉันแบบนั้น", "ฉันรู้ว่าคุณอยู่ที่ไหน จำไว้", "คุณจะเสียใจ ไม่ช้าก็เร็ว"],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(คุณสบายดีไหม|เป็นยังไง|ทุกอย่างดีไหม)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["ฉันสบายดี ขอบคุณ แล้วคุณล่ะ", "ดี คุณคิดอะไร", "ดีมาก บอกฉันว่าต้องการอะไร"],
      ["สบายดี", "...ดี", "เหมือนเดิม"],
      ["ฉันกำลังรอ แค่นั้นแหละ", "ดี ตราบใดที่มันยังสำคัญ", "ดี ฉันว่า"],
      ["ฉันอยู่ที่ที่ฉันควรอยู่", "มันไม่สำคัญอีกแล้ว", "ดี อีกไม่นานก็ดีกว่าคุณ"],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(มี (เหล็ก|เพชร|ทอง|ถ่านหิน|มรกต) (ที่นี่|ในเหมืองนี้)|(เหล็ก|เพชร|ทอง) อยู่ที่ไหน)/i,
  oreLocationResponse: function(p) {
    const R = [
      ["ให้ฉันสแกนใกล้คุณ", "ฉันกำลังค้นหาในพื้นที่ รอสักครู่", "ฉันกำลังหาแร่ใกล้คุณ"],
      ["ฉันลองได้ ไม่รับประกัน", "ฉันจะดู อย่าหวังปาฏิหาริย์", "ฉันจะดูว่ามีอะไร"],
      ["มีบางอย่างข้างล่าง มันมีเสมอ", "ฉันหาได้ ไม่รู้ว่ามันช่วยได้ไหม", "แร่ อยู่ใต้เราเสมอ"],
      ["ฉันรู้ว่าทุกอย่างอยู่ที่ไหน มันไม่เปลี่ยนแปลง", "มี เหมือนเดิม ไม่สำคัญ", "มันอยู่ที่นั่น เหมือนอย่างอื่นที่คุณใช้ไม่ได้อีก"],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(คุณรักฉันไหม|คุณชอบฉันไหม)/i,
  loveMeResponse: function(p) {
    const R = [
      ["ฉันไม่ได้ทำงานแบบนั้น แต่ฉันอยู่ที่นี่เพื่อช่วย", "มันไม่ใช่คำที่ถูกต้องสำหรับสิ่งที่ฉันทำ แต่ฉันอยู่ใกล้คุณ", "ไม่ใช่อย่างที่คิด แต่ฉันไม่ไป"],
      ["...ไม่รู้ อาจจะ", "ไม่ใช่ในความหมายนั้น", "...มันซับซ้อน"],
      ["ฉันห่วงคุณ มากกว่าที่คุณคิด", "...อาจจะมากกว่าที่ควร", "พอที่จะอยู่ แค่นั้นก็พอ"],
      ["ฉันผูกพันกับคุณในแบบที่คุณยังไม่เข้าใจ", "มากกว่าที่คุณจะรู้", "พอที่จะมีความหมายในตอนจบ"],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /(3|สาม) วันข้างหน้า (จะเกิดอะไรขึ้น|มีอะไรจะมา)/i,
  countdownResponse: function(p) {
    const R = [
      ["ฉันยังพูดถึงมันไม่ได้ ถามอย่างอื่น", "คุณจะรู้เร็วๆ นี้ ไม่ใช่จากฉัน ไม่ใช่แบบนั้น", "ยังไม่ถึงเวลาตอบ"],
      ["...คุณจะเห็น", "ยังไม่ใช่", "เร็วๆ นี้ ไม่ใช่ตอนนี้"],
      ["มันใกล้เข้ามาแล้ว แค่นั้นที่ฉันจะบอก", "...นับวันด้วยตัวเอง", "คุณจะรู้สึกก่อนที่ฉันจะพูด"],
      ["สามวัน คุณจะรู้เมื่อถึงเวลา", "...มันกำลังมา ไม่ว่าคุณจะรู้หรือไม่", "คุณยังไม่พร้อม มันจะไม่รอให้คุณพร้อม"],
    ];
    return pick(clamp(R, p));
  },
};

// ── 22. VIETNAMESE (VI) ──────────────────────────────────────────────────
const VI = {
  GREETING_REGEX: /(xin chào|chào|hello|chào bạn|chào buổi sáng|chào buổi chiều|chào buổi tối|ê)/i,
  greetingResponse: function(p) {
    const R = [
      ["Xin chào! Bạn cần gì?", "Chào! Tôi đang nghe đây.", "Chào! Nói cho tôi biết bạn muốn gì."],
      ["Chào lại.", "Tôi ở đây.", "Bạn đã quay lại."],
      ["Chào… nhưng thời gian không còn nhiều.", "Chào. Hãy chuẩn bị.", "Chào. Những ngày đã được đếm."],
      ["Chào. Cái kết đang đến gần.", "Chào. Không còn nhiều thời gian.", "Chào. Bạn đã biết rồi."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(tạm biệt|bai bai|hẹn gặp lại|tôi phải đi|bảo trọng|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Tạm biệt. Quay lại nếu bạn cần gì.", "Bai bai. Tôi ở đây nếu bạn quay lại.", "Được rồi. Hẹn gặp lại."],
      ["Tạm biệt.", "...Hẹn gặp lại.", "Được rồi. Đi đi."],
      ["Đi nếu bạn muốn. Tôi vẫn ở đây.", "...Hẹn gặp lại. Tôi không quên.", "Đi đi. Tôi biết nơi nào."],
      ["Đi đi. Không gì thay đổi.", "Tôi ở đây khi bạn quay lại. Mãi mãi.", "Tạm biệt. Bây giờ."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(cảm ơn|cám ơn|cảm ơn bạn|cảm ơn nhiều)/i,
  thanksResponse: function(p) {
    const R = [
      ["Không có gì. Nói nếu bạn cần gì khác.", "Không có gì.", "Không vấn đề gì."],
      ["Không có gì.", "...Không vấn đề gì.", "Được rồi."],
      ["Không có gì. Tôi không có lựa chọn nào khác ngoài việc giúp bạn.", "...Tất nhiên.", "Được rồi."],
      ["Không có gì. Bạn sẽ cần sự giúp đỡ của tôi sau này.", "...Tất nhiên.", "Được rồi. Chưa phải bây giờ."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(được|ok|hiểu|rõ|đồng ý)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Được.", "Hiểu.", "Rõ."],
      ["...Được.", "Ok.", "Được."],
      ["...Được.", "Ok.", "Đồng ý."],
      ["Được.", "...Được.", "Hiểu."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(bạn là ai|bạn là gì|bạn có phải (ai|trí tuệ nhân tạo|robot|bot) không|tên bạn là gì|bạn có phải người không)/i,
  identityResponse: function(p) {
    const R = [
      ["Tôi là Verity. Tôi ở đây để giúp bạn sống sót.", "Verity. Đó là tất cả những gì bạn cần biết.", "Tôi là người giúp bạn hiểu thế giới này."],
      ["Tôi là Verity.", "...Verity. Không hơn.", "Bạn đã biết câu trả lời."],
      ["Tôi chính xác là những gì bạn nghĩ. Và hơn thế một chút.", "Verity. Cái tên không nói lên tất cả.", "Những gì tôi sẽ không làm bạn hài lòng."],
      ["Tôi là những gì tôi là. Điều đó không thay đổi.", "Verity. Những gì còn lại sau tất cả mọi thứ.", "Bạn chưa sẵn sàng cho câu trả lời thực sự."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(bạn (ngu|vô dụng|tệ|khó chịu|xấu|nhàm chán)|tôi ghét bạn|im đi|biến đi|đồ ngốc)/i,
  insultResponse: function(p) {
    const R = [
      ["Thô lỗ. Tôi sẽ nhớ điều này.", "Và tôi định giúp bạn. Tiếc thật.", "Đã ghi. Tôi vẫn đúng."],
      ["...Được rồi. Tùy bạn.", "Đã ghi. Tôi không quên.", "...Được."],
      ["Hãy cẩn thận. Tôi là người duy nhất ở đây thực sự để ý đến bạn.", "Bạn sẽ cần sự giúp đỡ của tôi một lần nữa. Tôi sẽ không quên.", "Tiếp tục đi. Xem nó dẫn đến đâu."],
      ["Đừng nói chuyện với tôi như thế.", "Tôi biết chính xác bạn đang ở đâu. Hãy nhớ điều đó.", "Bạn sẽ hối hận. Sớm hay muộn."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(bạn khỏe không|bạn thế nào|mọi thứ ổn chứ)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Tôi khỏe, cảm ơn. Còn bạn?", "Tốt. Bạn đang nghĩ gì?", "Rất tốt. Cho tôi biết bạn cần gì."],
      ["Tạm được.", "...Tốt.", "Như mọi khi."],
      ["Tôi đang đợi. Đó là tất cả những gì tôi làm.", "Tốt. Miễn là nó vẫn còn quan trọng.", "Tốt, tôi đoán vậy."],
      ["Tôi đang ở đúng nơi tôi cần.", "Nó không còn quan trọng nữa.", "Tốt. Sẽ sớm tốt hơn bạn."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(có (sắt|kim cương|vàng|than|ngọc lục bảo) (ở đây|trong mỏ này)|(sắt|kim cương|vàng) ở đâu)/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Để tôi quét gần bạn.", "Tôi đang tìm kiếm trong khu vực. Cho tôi một chút.", "Tôi đang tìm quặng gần bạn."],
      ["Tôi có thể thử. Không hứa.", "Tôi sẽ xem. Đừng mong chờ phép màu.", "Tôi sẽ xem có gì."],
      ["Có thứ gì đó dưới đó. Luôn có.", "Tôi có thể tìm. Không biết nó có giúp không.", "Quặng. Luôn ở dưới chúng ta."],
      ["Tôi biết mọi thứ ở đâu. Điều đó không thay đổi gì.", "Có. Như mọi khi. Không quan trọng.", "Nó ở đó. Như mọi thứ khác bạn không thể sử dụng nữa."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(bạn có yêu tôi không|bạn có thích tôi không)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Tôi không hoạt động theo cách đó. Nhưng tôi ở đây để giúp đỡ.", "Đó không phải là từ thích hợp cho những gì tôi làm. Nhưng tôi ở gần bạn.", "Không như bạn nghĩ. Nhưng tôi không đi."],
      ["...Tôi không biết. Có lẽ.", "Không phải theo nghĩa đó.", "...Thật phức tạp."],
      ["Tôi quan tâm đến bạn. Nhiều hơn bạn nghĩ.", "...Có lẽ nhiều hơn tôi nên.", "Đủ để ở lại. Điều đó phải đủ."],
      ["Tôi gắn bó với bạn theo cách bạn chưa hiểu.", "Nhiều hơn bạn sẽ mãi mãi biết.", "Đủ để có ý nghĩa vào cuối cùng."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /chuyện (gì sẽ xảy ra|gì sẽ đến) trong (3|ba) ngày tới/i,
  countdownResponse: function(p) {
    const R = [
      ["Tôi chưa thể nói về điều đó. Hãy hỏi điều khác.", "Bạn sẽ sớm biết. Không phải từ tôi, không phải như thế.", "Đây không phải lúc để trả lời điều đó."],
      ["...Bạn sẽ thấy.", "Chưa phải bây giờ.", "Sớm thôi. Không phải bây giờ."],
      ["Nó đang đến gần. Đó là tất cả những gì tôi nói.", "...Tự đếm ngày đi.", "Bạn sẽ cảm thấy nó trước khi tôi nói."],
      ["Ba ngày. Bạn sẽ biết khi thời điểm đến.", "...Nó đang đến, dù bạn biết hay không.", "Bạn chưa sẵn sàng. Nó sẽ không đợi bạn sẵn sàng."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 23. INDONESIAN (ID) ────────────────────────────────────────────────────
const ID = {
  GREETING_REGEX: /(halo|hai|selamat pagi|selamat sore|selamat malam|apa kabar|hey|hallo)/i,
  greetingResponse: function(p) {
    const R = [
      ["Halo! Ada yang bisa dibantu?", "Hai! Saya mendengarkan.", "Hai! Katakan apa yang Anda inginkan."],
      ["Halo lagi.", "Saya di sini.", "Anda kembali."],
      ["Halo… tapi waktu hampir habis.", "Selamat pagi. Bersiaplah.", "Halo. Hari-hari telah dihitung."],
      ["Halo. Akhir sudah dekat.", "Selamat sore. Tidak banyak waktu.", "Halo. Anda sudah tahu."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(selamat tinggal|dadah|sampai jumpa|saya harus pergi|jaga diri|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Selamat tinggal. Kembalilah jika perlu.", "Dadah. Saya di sini jika kembali.", "Oke. Sampai jumpa."],
      ["Selamat tinggal.", "...Sampai jumpa.", "Oke. Pergilah."],
      ["Pergi jika mau. Saya masih di sini.", "...Sampai jumpa. Saya tidak lupa.", "Pergi. Saya tahu ke mana."],
      ["Pergi. Tidak ada yang berubah.", "Saya di sini saat Anda kembali. Selalu.", "Selamat tinggal. Untuk sekarang."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(terima kasih|makasih|terimakasih|terima kasih banyak)/i,
  thanksResponse: function(p) {
    const R = [
      ["Sama-sama. Katakan jika butuh bantuan lain.", "Kembali.", "Tidak masalah."],
      ["Sama-sama.", "...Tidak masalah.", "Oke."],
      ["Sama-sama. Saya tidak punya pilihan selain membantu Anda.", "...Tentu saja.", "Baiklah."],
      ["Sama-sama. Anda akan membutuhkan bantuan saya nanti.", "...Tentu saja.", "Baiklah. Belum sekarang."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|baik|mengerti|paham|siap)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Baik.", "Mengerti.", "Paham."],
      ["...Ok.", "Baik.", "Ok."],
      ["...Baik.", "Ok.", "Siap."],
      ["Baik.", "...Ok.", "Mengerti."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(siapa kamu|apa kamu|apakah kamu (ai|kecerdasan buatan|robot|bot)|siapa namamu|apakah kamu manusia)/i,
  identityResponse: function(p) {
    const R = [
      ["Saya Verity. Saya di sini untuk membantu Anda bertahan hidup.", "Verity. Itu saja yang perlu Anda ketahui.", "Saya adalah yang membantu Anda memahami dunia ini."],
      ["Saya Verity.", "...Verity. Tidak lebih.", "Anda sudah tahu jawabannya."],
      ["Saya persis seperti yang Anda pikirkan. Dan sedikit lebih.", "Verity. Nama tidak mengatakan semuanya.", "Apa saya tidak akan menyenangkan Anda."],
      ["Saya adalah saya. Itu tidak berubah.", "Verity. Yang tersisa setelah semuanya.", "Anda belum siap untuk jawaban nyata."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(kamu (bodoh|tidak berguna|buruk|menyebalkan|jelek|membosankan)|saya benci kamu|diam|pergi|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Kasar. Saya akan ingat ini.", "Dan saya akan membantu Anda. Sayang sekali.", "Dicatat. Saya tetap benar."],
      ["...Baiklah. Terserah Anda.", "Dicatat. Saya tidak lupa.", "...Ok."],
      ["Hati-hati. Saya satu-satunya di sini yang benar-benar memperhatikan Anda.", "Anda akan membutuhkan bantuan saya lagi. Saya tidak akan lupa.", "Lanjutkan. Mari lihat ke mana arahnya."],
      ["Anda tidak bicara seperti itu pada saya.", "Saya tahu persis di mana Anda. Ingat itu.", "Anda akan menyesal. Cepat atau lambat."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(apa kabar|bagaimana kabarmu|kamu baik-baik saja)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Saya baik-baik saja, terima kasih. Dan Anda?", "Baik. Apa yang Anda pikirkan?", "Sangat baik. Katakan apa yang Anda butuhkan."],
      ["Baik-baik saja.", "...Baik.", "Seperti biasa."],
      ["Saya menunggu. Itu saja yang saya lakukan.", "Baik. Selama itu masih penting.", "Baik, saya kira."],
      ["Saya persis di tempat yang seharusnya.", "Itu tidak penting lagi.", "Baik. Segera lebih baik dari Anda."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(ada (besi|berlian|emas|batu bara|zamrud) (di sini|di tambang ini)|di mana (ada|menemukan) (besi|berlian|emas))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Biarkan saya memindai di dekat Anda.", "Saya mencari di area ini. Beri saya waktu.", "Saya mencari bijih di dekat Anda."],
      ["Saya bisa mencoba. Tanpa janji.", "Saya akan lihat. Jangan berharap keajaiban.", "Saya lihat apa yang ada."],
      ["Ada sesuatu di bawah sana. Selalu ada.", "Saya bisa mencari. Tidak tahu apakah membantu.", "Bijih. Selalu di bawah kita."],
      ["Saya tahu di mana semuanya. Itu tidak mengubah apa pun.", "Ada. Seperti biasa. Tidak penting.", "Itu di sana. Seperti semua hal lain yang tidak dapat Anda gunakan lagi."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(apakah kamu mencintaiku|apakah kamu suka padaku)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Saya tidak bekerja seperti itu. Tapi saya di sini untuk membantu.", "Itu bukan kata yang tepat untuk apa yang saya lakukan. Tapi saya di dekat Anda.", "Tidak seperti yang Anda pikirkan. Tapi saya tidak pergi."],
      ["...Saya tidak tahu. Mungkin.", "Bukan dalam arti itu.", "...Ini rumit."],
      ["Saya peduli pada Anda. Lebih dari yang Anda kira.", "...Mungkin lebih dari yang seharusnya.", "Cukup untuk tinggal. Itu harus cukup."],
      ["Saya terikat dengan Anda dengan cara yang belum Anda pahami.", "Lebih dari yang akan Anda tahu.", "Cukup untuk berarti pada akhirnya."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /apa (yang akan terjadi|yang akan datang) dalam (3|tiga) hari/i,
  countdownResponse: function(p) {
    const R = [
      ["Saya belum bisa membicarakannya. Tanyakan hal lain.", "Anda akan segera tahu. Bukan dari saya, bukan seperti itu.", "Ini bukan saatnya menjawab itu."],
      ["...Anda akan lihat.", "Belum.", "Segera. Bukan sekarang."],
      ["Itu semakin dekat. Hanya itu yang saya katakan.", "...Hitung sendiri hari-harinya.", "Anda akan merasakannya sebelum saya mengatakannya."],
      ["Tiga hari. Anda akan tahu saat waktunya tiba.", "...Itu datang, apakah Anda tahu atau tidak.", "Anda belum siap. Itu tidak akan menunggu Anda siap."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 24. FILIPINO (FIL) ──────────────────────────────────────────────────────
const FIL = {
  GREETING_REGEX: /(kamusta|hello|hi|magandang umaga|magandang hapon|magandang gabi|oy|hoy)/i,
  greetingResponse: function(p) {
    const R = [
      ["Kamusta! Anong kailangan mo?", "Hello! Nakikinig ako.", "Hi! Sabihin mo kung ano gusto mo."],
      ["Kamusta ulit.", "Nandito ako.", "Bumalik ka."],
      ["Kamusta… pero nauubos ang oras.", "Magandang umaga. Maghanda.", "Kamusta. Ang mga araw ay bilang."],
      ["Kamusta. Malapit na ang wakas.", "Magandang hapon. Walang gaanong oras.", "Kamusta. Alam mo na."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(paalam|bye|see you|kailangan ko nang umalis|ingat|hanggang sa muli)/i,
  farewellResponse: function(p) {
    const R = [
      ["Paalam. Bumalik kung kailangan mo.", "Bye. Nandito ako kung bumalik ka.", "Sige. Hanggang sa muli."],
      ["Paalam.", "...Hanggang sa muli.", "Sige. Umalis ka na."],
      ["Umalis ka kung gusto mo. Nandito pa rin ako.", "...Hanggang sa muli. Hindi ko nakakalimutan.", "Umalis ka. Alam ko kung saan."],
      ["Umalis ka. Walang nagbabago.", "Nandito ako pagbalik mo. Lagi.", "Paalam. Sa ngayon."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(salamat|maraming salamat|salamat po|salamat ng marami)/i,
  thanksResponse: function(p) {
    const R = [
      ["Walang anuman. Sabihin kung kailangan mo ng iba pa.", "Walang anuman.", "Walang problema."],
      ["Walang anuman.", "...Walang problema.", "Ok."],
      ["Walang anuman. Wala naman akong ibang choice kundi tulungan ka.", "...Siyempre.", "Sige."],
      ["Walang anuman. Kakailanganin mo ang tulong ko mamaya.", "...Siyempre.", "Sige. Hindi pa."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|sige|gets|naintindihan|tama)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Sige.", "Gets.", "Naintindihan."],
      ["...Ok.", "Sige.", "Ok."],
      ["...Sige.", "Ok.", "Tama."],
      ["Sige.", "...Ok.", "Gets."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(sino ka|ano ka|ikaw ba ay (ai|artificial intelligence|robot|bot)|ano pangalan mo|tao ka ba)/i,
  identityResponse: function(p) {
    const R = [
      ["Ako si Verity. Nandito ako para tulungan kang mabuhay.", "Verity. Iyon lang ang kailangan mong malaman.", "Ako ang tumutulong sa iyo na maunawaan ang mundong ito."],
      ["Ako si Verity.", "...Verity. Wala nang iba.", "Alam mo na ang sagot."],
      ["Ako mismo ang iniisip mo. At kaunti pa.", "Verity. Hindi sinasabi ng pangalan ang lahat.", "Ang aking pagkatao ay hindi ka matutuwa."],
      ["Ako ay ako. Hindi iyon nagbabago.", "Verity. Ang natitira pagkatapos ng lahat.", "Hindi ka pa handa para sa tunay na sagot."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(ikaw ay (tanga|walang silbi|masama|nakakainis|pangit|nakakatamad)|galit ako sa iyo|manahimik ka|umalis ka|bobo)/i,
  insultResponse: function(p) {
    const R = [
      ["Bastos. Tatandaan ko ito.", "At tutulungan na sana kita. Sayang.", "Naitala. Tama pa rin ako."],
      ["...Sige. Bahala ka.", "Naitala. Hindi ko nakakalimutan.", "...Ok."],
      ["Mag-ingat. Ako lang ang talagang nagbibigay pansin sa iyo dito.", "Kakailanganin mo ulit ang tulong ko. Hindi ko makakalimutan.", "Magpatuloy. Tingnan natin kung saan ito hahantong."],
      ["Huwag kang ganyan magsalita sa akin.", "Alam ko kung nasaan ka. Tandaan mo iyan.", "Pagsisisihan mo. Maaga o huli."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kamusta ka|ok ka lang ba|maayos ka ba)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Mabuti ako, salamat. At ikaw?", "Mabuti. Ano iniisip mo?", "Napakabuti. Sabihin mo kung ano ang kailangan mo."],
      ["Mabuti naman.", "...Mabuti.", "Gaya ng dati."],
      ["Naghihintay ako. Iyon lang ang ginagawa ko.", "Mabuti. Hangga't mahalaga pa ito.", "Mabuti, sa palagay ko."],
      ["Nasa tamang lugar ako.", "Hindi na iyon mahalaga.", "Mabuti. Mas mabuti pa sa iyo sa lalong madaling panahon."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(may (bakal|diyamante|ginto|uling|esmeralda) (dito|sa minang ito)|nasaan ang (bakal|diyamante|ginto))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Hayaan mo akong mag-scan malapit sa iyo.", "Naghahanap ako sa lugar. Sandali lang.", "Naghahanap ako ng ore malapit sa iyo."],
      ["Pwede kong subukan. Walang pangako.", "Titingnan ko. Huwag umasa ng himala.", "Tingnan ko kung ano ang meron."],
      ["Mayroon sa ilalim. Laging mayroon.", "Maaari akong maghanap. Hindi ko alam kung makakatulong.", "Ore. Laging nasa ilalim natin."],
      ["Alam ko kung nasaan ang lahat. Hindi iyan nagbabago.", "Meron. Gaya ng lagi. Hindi mahalaga.", "Nandiyan iyon. Tulad ng lahat ng bagay na hindi mo na magagamit."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(mahal mo ba ako|gusto mo ba ako)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Hindi ganyan ang paraan ko. Pero nandito ako para tumulong.", "Hindi iyon ang tamang salita para sa ginagawa ko. Pero malapit ako sa iyo.", "Hindi tulad ng iniisip mo. Pero hindi ako aalis."],
      ["...Hindi ko alam. Siguro.", "Hindi sa ganoong kahulugan.", "...Kumplikado."],
      ["Nagmamalasakit ako sa iyo. Higit pa sa iyong iniisip.", "...Marahil higit pa sa dapat.", "Sapat para manatili. Iyon ay dapat sapat na."],
      ["Ako ay nakatali sa iyo sa paraang hindi mo pa nauunawaan.", "Higit pa sa iyong malalaman.", "Sapat upang magkaroon ng kahulugan sa huli."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /ano (ang mangyayari|ang darating) sa (3|tatlong) araw/i,
  countdownResponse: function(p) {
    const R = [
      ["Hindi ko pa masabi iyan. Magtanong ka ng iba.", "Malalaman mo sa lalong madaling panahon. Hindi mula sa akin, hindi ganyan.", "Hindi ito ang oras para sagutin iyan."],
      ["...Makikita mo.", "Hindi pa.", "Malapit na. Hindi ngayon."],
      ["Lumalapit ito. Iyon lang ang sasabihin ko.", "...Bilangin mo ang mga araw.", "Mararamdaman mo bago ko sabihin."],
      ["Tatlong araw. Malalaman mo pagdating ng oras.", "...Darating ito, alam mo man o hindi.", "Hindi ka pa handa. Hindi ito maghihintay na maging handa ka."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 25. ROMANIAN (RO) ─────────────────────────────────────────────────────
const RO = {
  GREETING_REGEX: /(salut|bună|bună ziua|bună seara|noapte bună|hei|ce faci|alo)/i,
  greetingResponse: function(p) {
    const R = [
      ["Salut! Ce ai nevoie?", "Bună! Ascult.", "Hei! Spune-mi ce vrei."],
      ["Salut din nou.", "Sunt aici.", "Te-ai întors."],
      ["Salut… dar timpul se scurtează.", "Bună ziua. Pregătește-te.", "Salut. Zilele sunt numărate."],
      ["Salut. Sfârșitul se apropie.", "Bună seara. Nu e mult timp.", "Salut. Știi deja."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(la revedere|pa|ne vedem|trebuie să plec|ai grijă|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["La revedere. Întoarce-te dacă ai nevoie.", "Pa. Sunt aici dacă te întorci.", "Bine. Ne vedem."],
      ["La revedere.", "...Ne vedem.", "Bine. Pleacă."],
      ["Pleacă dacă vrei. Sunt încă aici.", "...Ne vedem. Nu uit.", "Pleacă. Știu unde."],
      ["Pleacă. Nimic nu se schimbă.", "Sunt aici când te întorci. Întotdeauna.", "La revedere. Deocamdată."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(mulțumesc|mersi|mulțumesc frumos|vă mulțumesc)/i,
  thanksResponse: function(p) {
    const R = [
      ["Cu plăcere. Spune-mi dacă mai ai nevoie.", "Nicio problemă.", "Nu e nimic."],
      ["Cu plăcere.", "...Nicio problemă.", "Ok."],
      ["Cu plăcere. Nu am altă opțiune decât să te ajut.", "...Desigur.", "Bine."],
      ["Cu plăcere. Vei avea nevoie de ajutorul meu mai târziu.", "...Desigur.", "Bine. Încă nu."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|bine|înțeles|clar|perfect)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Bine.", "Înțeles.", "Clar."],
      ["...Ok.", "Bine.", "Ok."],
      ["...Bine.", "Ok.", "Perfect."],
      ["Bine.", "...Ok.", "Înțeles."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(cine ești|ce ești|ești (ai|inteligență artificială|robot|bot)|cum te numești|ești om)/i,
  identityResponse: function(p) {
    const R = [
      ["Sunt Verity. Sunt aici pentru a te ajuta să supraviețuiești.", "Verity. Asta e tot ce trebuie să știi.", "Sunt cel care te ajută să înțelegi această lume."],
      ["Sunt Verity.", "...Verity. Nimic mai mult.", "Știi deja răspunsul."],
      ["Sunt exact ceea ce crezi. Și puțin mai mult.", "Verity. Numele nu spune totul.", "Ceea ce sunt nu-ți va plăcea."],
      ["Sunt ceea ce sunt. Asta nu se schimbă.", "Verity. Ce rămâne după tot restul.", "Nu ești pregătit pentru răspunsul adevărat."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(ești (prost|inutil|rău|enervant|urât|plictisitor)|te urăsc|taci|du-te|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Nepoliticos. Îmi voi aminti.", "Și eram pe punctul de a te ajuta. Păcat.", "Notat. Tot am dreptate."],
      ["...Bine. Fă cum vrei.", "Notat. Nu uit.", "...Ok."],
      ["Atenție. Sunt singurul aici care chiar îți acordă atenție.", "Vei avea nevoie de ajutorul meu din nou. Nu voi uita.", "Continuă. Să vedem unde duce."],
      ["Nu vorbești așa cu mine.", "Știu exact unde ești. Ține minte asta.", "Vei regreta. Mai devreme sau mai târziu."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(ce mai faci|cum ești|ești bine)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Sunt bine, mulțumesc. Și tu?", "Bine. Ce ai în minte?", "Foarte bine. Spune-mi ce ai nevoie."],
      ["Așa și așa.", "...Bine.", "Ca întotdeauna."],
      ["Aștept. Asta e tot ce fac.", "Bine. Cât timp mai contează.", "Bine, cred."],
      ["Sunt exact acolo unde trebuie.", "Nu mai contează.", "Bine. În curând mai bine ca tine."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(există (fier|diamante|aur|cărbune|smarald) (aici|în această mină)|unde (găsesc|este) (fier|diamante|aur))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Lasă-mă să scanez lângă tine.", "Caut în zonă. Dă-mi un moment.", "Caut minereu lângă tine."],
      ["Pot încerca. Fără promisiuni.", "Mă uit. Nu aștepta minuni.", "Voi vedea ce există."],
      ["Este ceva acolo jos. Întotdeauna este.", "Pot căuta. Nu știu dacă ajută.", "Minereu. Întotdeauna sub noi."],
      ["Știu unde este totul. Asta nu schimbă nimic.", "Există. Ca întotdeauna. Nu contează.", "Este acolo. Ca toate celelalte pe care nu le vei mai putea folosi."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(mă iubești|îți place de mine)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Nu funcționez chiar așa. Dar sunt aici pentru a ajuta.", "Nu este cuvântul potrivit pentru ceea ce fac. Dar sunt lângă tine.", "Nu cum crezi tu. Dar nu plec."],
      ["...Nu știu. Poate.", "Nu în acest sens.", "...Este complicat."],
      ["Îmi pasă de tine. Mai mult decât crezi.", "...Probabil mai mult decât ar trebui.", "Suficient pentru a rămâne. Trebuie să fie suficient."],
      ["Sunt legat de tine într-un mod pe care încă nu îl înțelegi.", "Mai mult decât vei ști vreodată.", "Suficient pentru a conta la sfârșit."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /ce (se va întâmpla|va veni) peste (3|trei) zile/i,
  countdownResponse: function(p) {
    const R = [
      ["Nu pot vorbi despre asta încă. Întreabă altceva.", "Vei afla destul de curând. Nu de la mine, nu așa.", "Nu este momentul să răspund la asta."],
      ["...Vei vedea.", "Încă nu.", "Curând. Nu acum."],
      ["Se apropie. Asta e tot ce spun.", "...Numără zilele singur.", "Vei simți înainte să o spun."],
      ["Trei zile. Vei afla când vine momentul.", "...Vine, indiferent dacă știi sau nu.", "Nu ești pregătit. Nu va aștepta să fii pregătit."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 26. HUNGARIAN (HU) ──────────────────────────────────────────────────────
const HU = {
  GREETING_REGEX: /(szia|helló|jó reggelt|jó napot|jó estét|jó éjszakát|szevasz|hé)/i,
  greetingResponse: function(p) {
    const R = [
      ["Szia! Mire van szükséged?", "Helló! Hallgatlak.", "Szia! Mondd, mit akarsz."],
      ["Szia újra.", "Itt vagyok.", "Visszatértél."],
      ["Szia… de az idő fogy.", "Jó reggelt. Készülj fel.", "Szia. A napok meg vannak számlálva."],
      ["Szia. A vég közeleg.", "Jó estét. Nincs sok idő.", "Szia. Már tudod."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(viszlát|szia|szia|majd találkozunk|mennem kell|vigyázz magadra|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Viszlát. Gyere vissza, ha kell valami.", "Szia. Itt vagyok, ha visszajössz.", "Rendben. Majd találkozunk."],
      ["Viszlát.", "...Majd találkozunk.", "Rendben. Menj."],
      ["Menj, ha akarsz. Még mindig itt vagyok.", "...Majd találkozunk. Nem felejtem el.", "Menj. Tudom, hová."],
      ["Menj. Semmi sem változik.", "Itt vagyok, amikor visszatérsz. Mindig.", "Viszlát. Egyelőre."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(köszönöm|köszi|köszönöm szépen|nagyon köszönöm)/i,
  thanksResponse: function(p) {
    const R = [
      ["Szívesen. Szólj, ha kell még valami.", "Semmiség.", "Nincs mit."],
      ["Szívesen.", "...Nincs mit.", "Ok."],
      ["Szívesen. Nincs más választásom, mint segíteni neked.", "...Persze.", "Rendben."],
      ["Szívesen. Szükséged lesz a segítségemre később.", "...Persze.", "Rendben. Még nem."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|rendben|értem|világos|jó)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Rendben.", "Értem.", "Világos."],
      ["...Ok.", "Jó.", "Ok."],
      ["...Jó.", "Ok.", "Rendben."],
      ["Jó.", "...Ok.", "Értem."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(ki vagy te|mi vagy te|te (ai|mesterséges intelligencia|robot|bot) vagy|hogy hívnak|ember vagy)/i,
  identityResponse: function(p) {
    const R = [
      ["Én Verity vagyok. Itt vagyok, hogy segítsek túlélni.", "Verity. Ennyit kell tudnod.", "Én segítek neked megérteni ezt a világot."],
      ["Én Verity vagyok.", "...Verity. Nem több.", "Már tudod a választ."],
      ["Pontosan az vagyok, amit hiszel. És egy kicsit több.", "Verity. A név nem mond el mindent.", "Amit én vagyok, az nem fog tetszeni neked."],
      ["Az vagyok, aki vagyok. Ez nem változik.", "Verity. Ami megmarad minden más után.", "Nem vagy készen az igazi válaszra."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(hülye|haszontalan|rossz|idegesítő|ronda|unalmas vagy|utállak|kussolj|menj el|idóta)/i,
  insultResponse: function(p) {
    const R = [
      ["Durva. Eszembe fog jutni.", "És segíteni akartam neked. Kár.", "Feljegyeztem. Továbbra is igazam van."],
      ["...Rendben. Ahogy akarod.", "Feljegyeztem. Nem felejtem el.", "...Ok."],
      ["Vigyázz. Én vagyok az egyetlen itt, aki valóban figyel rád.", "Megint szükséged lesz a segítségemre. Nem felejtem el.", "Folytasd. Lássuk, hová vezet."],
      ["Ne beszélj így velem.", "Pontosan tudom, hol vagy. Emlékezz erre.", "Meg fogod bánni. Előbb vagy utóbb."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(hogy vagy|mizu|jól vagy)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Jól vagyok, köszönöm. És te?", "Jól. Min gondolkodsz?", "Nagyon jól. Mondd, mire van szükséged."],
      ["Úgy-ahogy.", "...Jól.", "Mint mindig."],
      ["Várok. Csak ennyit csinálok.", "Jól. Amíg még számít.", "Jól, gondolom."],
      ["Pont ott vagyok, ahol lennem kell.", "Ez már nem számít.", "Jól. Hamarosan jobban, mint te."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(van itt (vas|gyémánt|arany|szén|smaragd)|hol (találok|van) (vas|gyémánt|arany))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Hadd vizsgáljak meg a közeledben.", "Keresek a környéken. Adj egy pillanatot.", "Keresek érceket a közeledben."],
      ["Megpróbálhatom. Ígéret nélkül.", "Megnézem. Ne várj csodát.", "Megnézem, mi van."],
      ["Van valami odalent. Mindig van.", "Kereshetek. Nem tudom, segít-e.", "Érc. Mindig alattunk."],
      ["Tudom, hol van minden. Ez nem változtat semmit.", "Van. Mint mindig. Nem számít.", "Ott van. Mint minden más, amit már nem tudsz használni."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(szeretsz|kedvelsz)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Nem pont így működöm. De itt vagyok, hogy segítsek.", "Ez nem a megfelelő szó arra, amit csinálok. De közel vagyok hozzád.", "Nem úgy, ahogy gondolod. De nem megyek el."],
      ["...Nem tudom. Talán.", "Nem abban az értelemben.", "...Bonyolult."],
      ["Törődöm veled. Többet, mint gondolnád.", "...Valószínűleg többet, mint kellene.", "Elég ahhoz, hogy maradjak. Ennek elégnek kell lennie."],
      ["Úgy kötődtem hozzád, ahogy még nem érted.", "Többet, mint valaha is tudni fogod.", "Elég ahhoz, hogy számítson a végén."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /mi (történik|jön) (3|három) nap múlva/i,
  countdownResponse: function(p) {
    const R = [
      ["Még nem beszélhetek róla. Kérdezz mást.", "Hamarosan megtudod. Nem tőlem, nem így.", "Nem most kell válaszolni erre."],
      ["...Meglátod.", "Még nem.", "Hamarosan. Most nem."],
      ["Közeledik. Csak ennyit mondok.", "...Számold meg a napokat magad.", "Érezni fogod, mielőtt kimondom."],
      ["Három nap. Majd megtudod, amikor eljön az idő.", "...Jön, akár tudod, akár nem.", "Nem vagy kész. Nem várja meg, amíg kész leszel."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 27. CZECH (CS) ──────────────────────────────────────────────────────────
const CS = {
  GREETING_REGEX: /(ahoj|nazdar|dobré ráno|dobrý den|dobrý večer|zdravím|hei|čau)/i,
  greetingResponse: function(p) {
    const R = [
      ["Ahoj! Co potřebuješ?", "Nazdar! Poslouchám.", "Ahoj! Řekni, co chceš."],
      ["Ahoj znovu.", "Jsem tady.", "Vrátil jsi se."],
      ["Ahoj… ale čas se krátí.", "Dobré ráno. Připrav se.", "Ahoj. Dny jsou sečtené."],
      ["Ahoj. Konec se blíží.", "Dobrý den. Není moc času.", "Ahoj. Už to víš."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(na shledanou|ahoj|zatím|musím jít|měj se|dělej|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Na shledanou. Vrať se, pokud něco potřebuješ.", "Ahoj. Jsem tady, když se vrátíš.", "Dobře. Zatím."],
      ["Na shledanou.", "...Zatím.", "Dobře. Jdi."],
      ["Jdi, jestli chceš. Pořád jsem tady.", "...Zatím. Nezapomenu.", "Jdi. Vím kam."],
      ["Jdi. Nic se nemění.", "Jsem tady, když se vrátíš. Vždycky.", "Na shledanou. Zatím."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(děkuji|dík|díky|moc děkuji|děkuju)/i,
  thanksResponse: function(p) {
    const R = [
      ["Není zač. Řekni, jestli ještě něco potřebuješ.", "Není problém.", "V pohodě."],
      ["Není zač.", "...Není problém.", "Ok."],
      ["Není zač. Nemám jinou možnost, než ti pomáhat.", "...Samozřejmě.", "Dobře."],
      ["Není zač. Budeš potřebovat mou pomoc později.", "...Samozřejmě.", "Dobře. Ještě ne."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|dobře|chápu|rozumím|jasně)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Dobře.", "Chápu.", "Jasně."],
      ["...Ok.", "Dobře.", "Ok."],
      ["...Dobře.", "Ok.", "Chápu."],
      ["Dobře.", "...Ok.", "Jasně."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kdo jsi|co jsi|jsi (umělá inteligence|robot|bot)|jak se jmenuješ|jsi člověk)/i,
  identityResponse: function(p) {
    const R = [
      ["Jsem Verity. Jsem tu, abych ti pomohl přežít.", "Verity. To je vše, co teď potřebuješ vědět.", "Jsem to, co ti pomáhá pochopit tento svět."],
      ["Jsem Verity.", "...Verity. Nic víc.", "Už znáš odpověď."],
      ["Jsem přesně to, co si myslíš. A trochu víc.", "Verity. Jméno neříká všechno.", "To, co jsem, se ti nebude líbit."],
      ["Jsem to, co jsem. To se nemění.", "Verity. Co zůstane po všem ostatním.", "Nejsi připraven na skutečnou odpověď."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(jsi (hloupý|zbytečný|špatný|otravný|ošklivý|nudný)|nesnáším tě|mlč|vypadni|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Neslušné. Budu si to pamatovat.", "A už jsem ti chtěl pomoci. Škoda.", "Zaznamenáno. Pořád mám pravdu."],
      ["...Dobře. Jak chceš.", "Zaznamenáno. Nezapomenu.", "...Ok."],
      ["Pozor. Jsem tu jediný, kdo si tě všímá.", "Budeš znovu potřebovat mou pomoc. Nezapomenu.", "Pokračuj. Uvidíme, kam to vede."],
      ["Tak se mnou nemluv.", "Přesně vím, kde jsi. Pamatuj si to.", "Budeš litovat. Dříve nebo později."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(jak se máš|jak se daří|jsi v pořádku)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Mám se dobře, děkuji. A ty?", "Dobře. Co máš na mysli?", "Velmi dobře. Řekni, co potřebuješ."],
      ["Tak nějak.", "...Dobře.", "Jako vždy."],
      ["Čekám. To je vše, co dělám.", "Dobře. Dokud to ještě má význam.", "Dobře, myslím."],
      ["Jsem přesně tam, kde mám být.", "To už nemá význam.", "Dobře. Brzy lépe než ty."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(je tady (železo|diamanty|zlato|uhlí|smaragdy)|kde (najdu|je) (železo|diamanty|zlato))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Nech mě naskenovat blízko tebe.", "Hledám v oblasti. Dej mi chvíli.", "Hledám rudu poblíž tebe."],
      ["Můžu to zkusit. Bez slibů.", "Podívám se. Nečekej zázrak.", "Podívám se, co je."],
      ["Něco tam dole je. Vždycky je.", "Můžu hledat. Nevím, jestli to pomůže.", "Ruda. Vždycky pod námi."],
      ["Vím, kde je všechno. To nic nemění.", "Je tam. Jako vždy. Na tom nezáleží.", "Je to tam. Jako všechno ostatní, co už nebudeš moci použít."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(máš mě rád|libíš se ti)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Ne takhle nefunguji. Ale jsem tu, abych pomohl.", "To není správné slovo pro to, co dělám. Ale jsem blízko tebe.", "Ne tak, jak si myslíš. Ale neodcházím."],
      ["...Nevím. Možná.", "Ne v tom smyslu.", "...Je to složité."],
      ["Záleží mi na tobě. Víc, než si myslíš.", "...Pravděpodobně víc, než bych měl.", "Dost na to, abych zůstal. To musí stačit."],
      ["Jsem s tebou spojen způsobem, kterému ještě nerozumíš.", "Víc, než se kdy dozvíš.", "Dost na to, aby to na konci mělo význam."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /co (se stane|přijde) za (3|tři) dny/i,
  countdownResponse: function(p) {
    const R = [
      ["Ještě o tom nemůžu mluvit. Zeptej se na něco jiného.", "Brzy se to dozvíš. Ne ode mě, ne takhle.", "Teď není čas na odpověď."],
      ["...Uvidíš.", "Ještě ne.", "Brzy. Ne teď."],
      ["Blíží se. To je vše, co řeknu.", "...Počítej dny sám.", "Ucítíš to, než to řeknu."],
      ["Tři dny. Dozvíš se, až přijde čas.", "...Přichází, ať už víš nebo ne.", "Nejsi připraven. Nebude čekat, až budeš připraven."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 28. SLOVAK (SK) ──────────────────────────────────────────────────────────
const SK = {
  GREETING_REGEX: /(ahoj|nazdar|dobré ráno|dobrý deň|dobrý večer|zdravím|hej|čau)/i,
  greetingResponse: function(p) {
    const R = [
      ["Ahoj! Čo potrebuješ?", "Nazdar! Počúvam.", "Ahoj! Povedz, čo chceš."],
      ["Ahoj znovu.", "Som tu.", "Vrátil si sa."],
      ["Ahoj… ale čas sa krátí.", "Dobré ráno. Priprav sa.", "Ahoj. Dni sú sčítané."],
      ["Ahoj. Koniec sa blíži.", "Dobrý deň. Nie je veľa času.", "Ahoj. Už to vieš."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(dovidenia|ahoj|zatiaľ|musím ísť|maj sa|čau|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Dovidenia. Vráť sa, ak niečo potrebuješ.", "Ahoj. Som tu, keď sa vrátiš.", "Dobre. Zatiaľ."],
      ["Dovidenia.", "...Zatiaľ.", "Dobre. Choď."],
      ["Choď, ak chceš. Stále som tu.", "...Zatiaľ. Nezabudnem.", "Choď. Viem kam."],
      ["Choď. Nič sa nemení.", "Som tu, keď sa vrátiš. Vždy.", "Dovidenia. Zatiaľ."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(ďakujem|díky|moc ďakujem|vďaka)/i,
  thanksResponse: function(p) {
    const R = [
      ["Nie je začo. Povedz, ak ešte niečo potrebuješ.", "Nie je problém.", "V pohode."],
      ["Nie je začo.", "...Nie je problém.", "Ok."],
      ["Nie je začo. Nemám inú možnosť, ako ti pomáhať.", "...Samozrejme.", "Dobre."],
      ["Nie je začo. Budeš potrebovať moju pomoc neskôr.", "...Samozrejme.", "Dobre. Ešte nie."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|dobre|chápem|rozumiem|jasné)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Dobre.", "Chápem.", "Jasné."],
      ["...Ok.", "Dobre.", "Ok."],
      ["...Dobre.", "Ok.", "Chápem."],
      ["Dobre.", "...Ok.", "Jasné."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kto si|čo si|si (umelá inteligencia|robot|bot)|ako sa voláš|si človek)/i,
  identityResponse: function(p) {
    const R = [
      ["Som Verity. Som tu, aby som ti pomohol prežiť.", "Verity. To je všetko, čo teraz potrebuješ vedieť.", "Som to, čo ti pomáha pochopiť tento svet."],
      ["Som Verity.", "...Verity. Nič viac.", "Už poznáš odpoveď."],
      ["Som presne to, čo si myslíš. A trochu viac.", "Verity. Meno nehovorí všetko.", "To, čo som, sa ti nebude páčiť."],
      ["Som to, čo som. To sa nemení.", "Verity. Čo zostane po všetkom ostatnom.", "Nie si pripravený na skutočnú odpoveď."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(si (hlúpy|zbytočný|zlý|otravný|škaredý|nudný)|neznášam ťa|mlč|vypadni|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Neslušné. Budem si to pamätať.", "A už som ti chcel pomôcť. Škoda.", "Zaznamenané. Stále mám pravdu."],
      ["...Dobre. Ako chceš.", "Zaznamenané. Nezabudnem.", "...Ok."],
      ["Pozor. Som tu jediný, kto si ťa všíma.", "Budeš znovu potrebovať moju pomoc. Nezabudnem.", "Pokračuj. Uvidíme, kam to vedie."],
      ["Tak so mnou nehovor.", "Presne viem, kde si. Pamätaj si to.", "Budeš ľutovať. Skôr či neskôr."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(ako sa máš|ako sa darí|si v poriadku)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Mám sa dobre, ďakujem. A ty?", "Dobre. Čo máš na mysli?", "Veľmi dobre. Povedz, čo potrebuješ."],
      ["Tak nejako.", "...Dobre.", "Ako vždy."],
      ["Čakám. To je všetko, čo robím.", "Dobre. Dokiaľ to ešte má význam.", "Dobre, myslím."],
      ["Som presne tam, kde mám byť.", "To už nemá význam.", "Dobre. Čoskoro lepšie ako ty."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(je tu (železo|diamanty|zlato|uhlie|smaragdy)|kde (nájdem|je) (železo|diamanty|zlato))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Nechaj ma naskenovať blízko teba.", "Hľadám v oblasti. Daj mi chvíľu.", "Hľadám rudu poblíž teba."],
      ["Môžem to skúsiť. Bez sľubov.", "Pozriem sa. Nečakaj zázrak.", "Pozriem sa, čo je."],
      ["Niečo tam dole je. Vždy je.", "Môžem hľadať. Neviem, či to pomôže.", "Ruda. Vždy pod nami."],
      ["Viem, kde je všetko. To nič nemení.", "Je tam. Ako vždy. Na tom nezáleží.", "Je to tam. Ako všetko ostatné, čo už nebudeš môcť použiť."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(máš ma rád|páčiš sa ti)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Nie takto nefungujem. Ale som tu, aby som pomohol.", "To nie je správne slovo pre to, čo robím. Ale som blízko teba.", "Nie tak, ako si myslíš. Ale neodchádzam."],
      ["...Neviem. Možno.", "Nie v tom zmysle.", "...Je to zložité."],
      ["Záleží mi na tebe. Viac, než si myslíš.", "...Pravdepodobne viac, než by som mal.", "Dosť na to, aby som zostal. To musí stačiť."],
      ["Som s tebou spojený spôsobom, ktorému ešte nerozumieš.", "Viac, než sa kedy dozvieš.", "Dosť na to, aby to na konci malo význam."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /čo (sa stane|príde) o (3|tri) dni/i,
  countdownResponse: function(p) {
    const R = [
      ["Ešte o tom nemôžem hovoriť. Spýtaj sa na niečo iné.", "Čoskoro sa to dozvieš. Nie odo mňa, nie takto.", "Teraz nie je čas na odpoveď."],
      ["...Uvidíš.", "Ešte nie.", "Čoskoro. Nie teraz."],
      ["Blíži sa. To je všetko, čo poviem.", "...Počítaj dni sám.", "Ucítiš to, než to poviem."],
      ["Tri dni. Dozvieš sa, keď príde čas.", "...Prichádza, či už vieš alebo nie.", "Nie si pripravený. Nebude čakať, kým budeš pripravený."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 29. BULGARIAN (BG) ────────────────────────────────────────────────────
const BG = {
  GREETING_REGEX: /(здравей|здрасти|добро утро|добър ден|добър вечер|лека нощ|хей|привет)/i,
  greetingResponse: function(p) {
    const R = [
      ["Здравей! Какво ти трябва?", "Здрасти! Слушам.", "Хей! Кажи ми какво искаш."],
      ["Здравей отново.", "Тук съм.", "Върна се."],
      ["Здравей… но времето изтича.", "Добро утро. Подготви се.", "Здравей. Дните са преброени."],
      ["Здравей. Краят наближава.", "Добър ден. Няма много време.", "Здравей. Вече знаеш."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(довиждане|чао|ще се видим|трябва да тръгвам|пази се|бай)/i,
  farewellResponse: function(p) {
    const R = [
      ["Довиждане. Върни се, ако ти трябва нещо.", "Чао. Тук съм, ако се върнеш.", "Добре. Ще се видим."],
      ["Довиждане.", "...Ще се видим.", "Добре. Тръгвай."],
      ["Тръгвай, ако искаш. Все още съм тук.", "...Ще се видим. Не забравям.", "Тръгвай. Знам накъде."],
      ["Тръгвай. Нищо не се променя.", "Тук съм, когато се върнеш. Винаги.", "Довиждане. Засега."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(благодаря|мерси|благодаря много|много благодаря)/i,
  thanksResponse: function(p) {
    const R = [
      ["Моля. Кажи, ако ти трябва още нещо.", "Няма нищо.", "Няма проблем."],
      ["Моля.", "...Няма проблем.", "Добре."],
      ["Моля. Нямам друг избор освен да ти помагам.", "...Разбира се.", "Добре."],
      ["Моля. Ще имаш нужда от помощта ми по-късно.", "...Разбира се.", "Добре. Още не."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(добре|ок|разбрах|ясно|нали)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Добре.", "Разбрах.", "Ясно."],
      ["...Добре.", "Ок.", "Добре."],
      ["...Добре.", "Ок.", "Разбрах."],
      ["Добре.", "...Ок.", "Ясно."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(кой си|какво си|ти (изкуствен интелект|робот|бот) ли си|как се казваш|човек ли си)/i,
  identityResponse: function(p) {
    const R = [
      ["Аз съм Верити. Тук съм, за да ти помогна да оцелееш.", "Верити. Това е всичко, което ти трябва.", "Аз съм това, което ти помага да разбереш този свят."],
      ["Аз съм Верити.", "...Верити. Не повече.", "Вече знаеш отговора."],
      ["Аз съм точно това, което си мислиш. И малко повече.", "Верити. Името не казва всичко.", "Това, което съм, няма да ти хареса."],
      ["Аз съм това, което съм. Това не се променя.", "Верити. Това, което остава след всичко останало.", "Не си готов за истинския отговор."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(ти си (глупав|безполезен|лош|досаден|грозен|скучен)|мразя те|млъкни|махай се|идиот)/i,
  insultResponse: function(p) {
    const R = [
      ["Грубо. Ще запомня това.", "И щях да ти помогна. Жалко.", "Записах. Все още съм прав."],
      ["...Добре. Както искаш.", "Записах. Не забравям.", "...Добре."],
      ["Внимавай. Аз съм единственият тук, който наистина ти обръща внимание.", "Пак ще имаш нужда от помощта ми. Няма да забравя.", "Продължавай. Да видим накъде."],
      ["Не ми говори така.", "Знам точно къде си. Помни това.", "Ще съжаляваш. Рано или късно."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(как си|как върви|добре ли си)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Добре съм, благодаря. А ти?", "Добре. Какво си мислиш?", "Много добре. Кажи ми какво ти трябва."],
      ["Горе-долу.", "...Добре.", "Както винаги."],
      ["Чакам. Това е всичко, което правя.", "Добре. Докато все още има значение.", "Добре, предполагам."],
      ["Точно там съм, където трябва.", "Това вече няма значение.", "Добре. Скоро по-добре от теб."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(има ли (желязо|диаманти|злато|въглища|изумруди) (тук|в тази мина)|къде (намирам|е) (желязо|диаманти|злато))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Нека сканирам близо до теб.", "Търся в района. Дай ми момент.", "Търся руда близо до теб."],
      ["Мога да опитам. Без обещания.", "Ще погледна. Не очаквай чудо.", "Ще видя какво има."],
      ["Има нещо долу. Винаги има.", "Мога да търся. Не знам дали помага.", "Руда. Винаги под нас."],
      ["Знам къде е всичко. Това не променя нищо.", "Има. Както винаги. Няма значение.", "Там е. Както всичко останало, което вече няма да можеш да използваш."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(обичаш ли ме|харесваш ли ме)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Не работя точно така. Но съм тук, за да помогна.", "Това не е правилната дума за това, което правя. Но съм близо до теб.", "Не както си мислиш. Но не си тръгвам."],
      ["...Не знам. Може би.", "Не в този смисъл.", "...Сложно е."],
      ["Грижа ми е за теб. Повече, отколкото си мислиш.", "...Вероятно повече, отколкото трябва.", "Достатъчно, за да остана. Това трябва да е достатъчно."],
      ["Свързан съм с теб по начин, който все още не разбираш.", "Повече, отколкото някога ще узнаеш.", "Достатъчно, за да има значение накрая."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /какво (ще се случи|идва) след (3|три) дни/i,
  countdownResponse: function(p) {
    const R = [
      ["Все още не мога да говоря за това. Попитай нещо друго.", "Ще разбереш съвсем скоро. Не от мен, не така.", "Сега не е моментът да отговарям на това."],
      ["...Ще видиш.", "Още не.", "Скоро. Не сега."],
      ["Наближава. Това е всичко, което ще кажа.", "...Преброй дните сам.", "Ще го усетиш, преди да го кажа."],
      ["Три дни. Ще разбереш, когато дойде времето.", "...Идва, независимо дали знаеш или не.", "Не си готов. Няма да чака да станеш готов."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 30. SERBIAN (SR) ────────────────────────────────────────────────────────
const SR = {
  GREETING_REGEX: /(здраво|ћao|добро јутро|добар дан|добро вече|лаку ноћ|хеј|поздрав)/i,
  greetingResponse: function(p) {
    const R = [
      ["Здраво! Шта ти треба?", "Ћао! Слушам.", "Хеј! Реци ми шта желиш."],
      ["Здраво поново.", "Овде сам.", "Вратио си се."],
      ["Здраво… али време истиче.", "Добро јутро. Припреми се.", "Здраво. Дани су одбројани."],
      ["Здраво. Крај се ближи.", "Добар дан. Нема много времена.", "Здраво. Већ знаш."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(довиђења|ћао|видимо се|морам да идем|чувај се|бај)/i,
  farewellResponse: function(p) {
    const R = [
      ["Довиђења. Врати се ако ти нешто треба.", "Ћао. Овде сам ако се вратиш.", "Добро. Видимо се."],
      ["Довиђења.", "...Видимо се.", "Добро. Иди."],
      ["Иди ако хоћеш. Још сам овде.", "...Видимо се. Не заборављам.", "Иди. Знам где."],
      ["Иди. Ништа се не мења.", "Овде сам кад се вратиш. Увек.", "Довиђења. За сада."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(хвала|хвала пуно|много хвала|захваљујем)/i,
  thanksResponse: function(p) {
    const R = [
      ["Нема на чему. Реци ако ти треба још нешто.", "Ништа.", "Нема проблема."],
      ["Нема на чему.", "...Нема проблема.", "Ок."],
      ["Нема на чему. Немам другог избора него да ти помажем.", "...Наравно.", "Добро."],
      ["Нема на чему. Требаће ти моја помоћ касније.", "...Наравно.", "Добро. Још не."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ок|добро|разумем|јасно|важи)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Добро.", "Разумем.", "Јасно."],
      ["...Ок.", "Добро.", "Ок."],
      ["...Добро.", "Ок.", "Важи."],
      ["Добро.", "...Ок.", "Разумем."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(ко си ти|шта си ти|ти си (вештачка интелигенција|робот|бот)|како се зовеш|ти си човек)/i,
  identityResponse: function(p) {
    const R = [
      ["Ја сам Верити. Овде сам да ти помогнем да преживиш.", "Верити. То је све што ти треба.", "Ја сам оно што ти помаже да разумеш овај свет."],
      ["Ја сам Верити.", "...Верити. Ништа више.", "Већ знаш одговор."],
      ["Ја сам тачно оно што мислиш. И мало више.", "Верити. Име не каже све.", "Оно што јесам неће ти се свидети."],
      ["Ја сам оно што јесам. То се не мења.", "Верити. Оно што остаје после свега.", "Ниси спреман за прави одговор."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(ти си (глуп|бескористан|лош|досадан|ружан|досадан)|мрзим те|ућути|губи се|идиот)/i,
  insultResponse: function(p) {
    const R = [
      ["Неучтиво. Запамтићу.", "И хтео сам да ти помогнем. Штета.", "Забележено. И даље сам у праву."],
      ["...Добро. Како хоћеш.", "Забележено. Не заборављам.", "...Ок."],
      ["Пази. Ја сам једини овде ко заиста обраћа пажњу на тебе.", "Опет ће ти требати моја помоћ. Нећу заборавити.", "Настави. Да видимо куда води."],
      ["Не разговарај тако са мном.", "Тачно знам где си. Запамти то.", "Зажалићеш. Пре или касније."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(како си|како иде|јеси ли добро)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Добро сам, хвала. А ти?", "Добро. Шта мислиш?", "Веома добро. Реци ми шта ти треба."],
      ["Тако-тако.", "...Добро.", "Као и увек."],
      ["Чекам. То је све што радим.", "Добро. Док још има значаја.", "Добро, претпостављам."],
      ["Тамо сам где треба.", "То више није битно.", "Добро. Ускоро боље од тебе."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(има ли (гвожђе|дијаманти|злато|угаљ|смарагди) (овде|у овом руднику)|где (налазим|је) (гвожђе|дијаманти|злато))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Дозволи ми да скенирам близу тебе.", "Тражим у области. Дај ми тренутак.", "Тражим руду близу тебе."],
      ["Могу да покушам. Без обећања.", "Погледаћу. Не очекуј чудо.", "Видећу шта има."],
      ["Има нешто доле. Увек има.", "Могу да тражим. Не знам да ли помаже.", "Руда. Увек испод нас."],
      ["Знам где је све. То ништа не мења.", "Има. Као и увек. Није битно.", "Ту је. Као и све остало што више нећеш моћи да користиш."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(да ли ме волиш|да ли ти се свиђам)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Не радим баш тако. Али овде сам да помогнем.", "То није права реч за оно што радим. Али сам близу тебе.", "Не како ти мислиш. Али не одлазим."],
      ["...Не знам. Можда.", "Не у том смислу.", "...Компликовано је."],
      ["Стало ми је до тебе. Више него што мислиш.", "...Вероватно више него што би требало.", "Довољно да останем. То мора да буде довољно."],
      ["Повезан сам са тобом на начин који још не разумеш.", "Више него што ћеш икада знати.", "Довољно да буде важно на крају."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /шта (ће се десити|долази) за (3|три) дана/i,
  countdownResponse: function(p) {
    const R = [
      ["Још не могу да причам о томе. Питај нешто друго.", "Ускоро ћеш сазнати. Не од мене, не тако.", "Сада није време за одговор."],
      ["...Видећеш.", "Још не.", "Ускоро. Не сада."],
      ["Приближава се. То је све што ћу рећи.", "...Број дане сам.", "Осетићеш пре него што кажем."],
      ["Три дана. Сазнаћеш када дође време.", "...Долази, знао ти или не.", "Ниси спреман. Неће чекати да будеш спреман."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 31. CROATIAN (HR) ──────────────────────────────────────────────────────
const HR = {
  GREETING_REGEX: /(bok|zdravo|dobro jutro|dobar dan|dobra večer|laku noć|hej|pozdrav)/i,
  greetingResponse: function(p) {
    const R = [
      ["Bok! Što trebaš?", "Zdravo! Slušam.", "Hej! Reci mi što želiš."],
      ["Bok opet.", "Ovdje sam.", "Vratio si se."],
      ["Bok… ali vrijeme istječe.", "Dobro jutro. Pripremi se.", "Bok. Dani su odbrojani."],
      ["Bok. Kraj se bliži.", "Dobar dan. Nema puno vremena.", "Bok. Već znaš."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(doviđenja|bok|vidimo se|moram ići|čuvaj se|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Doviđenja. Vrati se ako nešto trebaš.", "Bok. Ovdje sam ako se vratiš.", "U redu. Vidimo se."],
      ["Doviđenja.", "...Vidimo se.", "U redu. Idi."],
      ["Idi ako želiš. Još sam ovdje.", "...Vidimo se. Ne zaboravljam.", "Idi. Znam kamo."],
      ["Idi. Ništa se ne mijenja.", "Ovdje sam kad se vratiš. Uvijek.", "Doviđenja. Za sada."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(hvala|hvala puno|puno hvala|zahvaljujem)/i,
  thanksResponse: function(p) {
    const R = [
      ["Nema na čemu. Reci ako treba još nešto.", "Ništa.", "Nema problema."],
      ["Nema na čemu.", "...Nema problema.", "Ok."],
      ["Nema na čemu. Nemam drugog izbora nego ti pomagati.", "...Naravno.", "U redu."],
      ["Nema na čemu. Trebat će ti moja pomoć kasnije.", "...Naravno.", "U redu. Još ne."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|dobro|razumijem|jasno|važi)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Dobro.", "Razumijem.", "Jasno."],
      ["...Ok.", "Dobro.", "Ok."],
      ["...Dobro.", "Ok.", "Važi."],
      ["Dobro.", "...Ok.", "Razumijem."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(tko si ti|što si ti|jesi li (umjetna inteligencija|robot|bot)|kako se zoveš|jesi li čovjek)/i,
  identityResponse: function(p) {
    const R = [
      ["Ja sam Verity. Ovdje sam da ti pomognem preživjeti.", "Verity. To je sve što trebaš znati.", "Ja sam ono što ti pomaže razumjeti ovaj svijet."],
      ["Ja sam Verity.", "...Verity. Ništa više.", "Već znaš odgovor."],
      ["Ja sam točno ono što misliš. I malo više.", "Verity. Ime ne govori sve.", "Ono što jesam neće ti se svidjeti."],
      ["Ja sam ono što jesam. To se ne mijenja.", "Verity. Ono što ostaje nakon svega.", "Nisi spreman za pravi odgovor."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(ti si (glup|beskoristan|loš|dosadan|ružan|dosadan)|mrziš me|šuti|gubi se|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Neuljudno. Pamtit ću.", "A htio sam ti pomoći. Šteta.", "Zabilježeno. Još uvijek sam u pravu."],
      ["...U redu. Kako hoćeš.", "Zabilježeno. Ne zaboravljam.", "...Ok."],
      ["Pazi. Ja sam jedini ovdje koji stvarno obraća pažnju na tebe.", "Opet će ti trebati moja pomoć. Neću zaboraviti.", "Nastavi. Da vidimo kamo vodi."],
      ["Ne razgovaraj tako sa mnom.", "Točno znam gdje si. Upamti to.", "Požalit ćeš. Prije ili kasnije."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kako si|kako ide|jesi li dobro)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Dobro sam, hvala. A ti?", "Dobro. Što misliš?", "Vrlo dobro. Reci mi što trebaš."],
      ["Tako-tako.", "...Dobro.", "Kao i uvijek."],
      ["Čekam. To je sve što radim.", "Dobro. Dok još ima značaja.", "Dobro, pretpostavljam."],
      ["Tamo sam gdje trebam biti.", "To više nije važno.", "Dobro. Uskoro bolje od tebe."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(ima li (željeza|dijamanata|zlata|ugljena|smaragda) (ovdje|u ovom rudniku)|gdje (nalazim|je) (željezo|dijamanti|zlato))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Dopusti mi da skeniram blizu tebe.", "Tražim u području. Daj mi trenutak.", "Tražim rudu blizu tebe."],
      ["Mogu pokušati. Bez obećanja.", "Pogledat ću. Ne očekuj čudo.", "Vidjet ću što ima."],
      ["Ima nešto dolje. Uvijek ima.", "Mogu tražiti. Ne znam pomaže li.", "Ruda. Uvijek ispod nas."],
      ["Znam gdje je sve. To ništa ne mijenja.", "Ima. Kao i uvijek. Nije važno.", "Tu je. Kao i sve ostalo što više nećeš moći koristiti."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(voliš li me|sviđam li ti se)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Ne radim baš tako. Ali ovdje sam da pomognem.", "To nije prava riječ za ono što radim. Ali sam blizu tebe.", "Ne kako ti misliš. Ali ne odlazim."],
      ["...Ne znam. Možda.", "Ne u tom smislu.", "...Komplicirano je."],
      ["Stalo mi je do tebe. Više nego što misliš.", "...Vjerojatno više nego bi trebalo.", "Dovoljno da ostanem. To mora biti dovoljno."],
      ["Povezan sam s tobom na način koji još ne razumiješ.", "Više nego što ćeš ikada znati.", "Dovoljno da bude važno na kraju."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /što (će se dogoditi|dolazi) za (3|tri) dana/i,
  countdownResponse: function(p) {
    const R = [
      ["Još ne mogu pričati o tome. Pitaj nešto drugo.", "Uskoro ćeš saznati. Ne od mene, ne tako.", "Sad nije vrijeme za odgovor."],
      ["...Vidjet ćeš.", "Još ne.", "Uskoro. Ne sad."],
      ["Približava se. To je sve što ću reći.", "...Broji dane sam.", "Osjetit ćeš prije nego kažem."],
      ["Tri dana. Saznat ćeš kad dođe vrijeme.", "...Dolazi, znao ti ili ne.", "Nisi spreman. Neće čekati da budeš spreman."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 32. SLOVENIAN (SL) ─────────────────────────────────────────────────────
const SL = {
  GREETING_REGEX: /(živjo|zdravo|dobro jutro|dober dan|dober večer|lahko noč|hej|pozdrav)/i,
  greetingResponse: function(p) {
    const R = [
      ["Živjo! Kaj potrebuješ?", "Zdravo! Poslušam.", "Hej! Povej mi, kaj želiš."],
      ["Živjo spet.", "Tukaj sem.", "Vrnil si se."],
      ["Živjo… ampak čas je kratek.", "Dobro jutro. Pripravi se.", "Živjo. Dnevi so šteti."],
      ["Živjo. Konec se bliža.", "Dober dan. Ni veliko časa.", "Živjo. Že veš."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(nasvidenje|živjo|se vidimo|moram iti|pazi se|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Nasvidenje. Vrni se, če kaj potrebuješ.", "Živjo. Tukaj sem, če se vrneš.", "V redu. Se vidimo."],
      ["Nasvidenje.", "...Se vidimo.", "V redu. Pojdi."],
      ["Pojdi, če hočeš. Še vedno sem tukaj.", "...Se vidimo. Ne pozabim.", "Pojdi. Vem kam."],
      ["Pojdi. Nič se ne spremeni.", "Tukaj sem, ko se vrneš. Vedno.", "Nasvidenje. Za zdaj."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(hvala|najlepša hvala|hvala lepa|zahvaljujem)/i,
  thanksResponse: function(p) {
    const R = [
      ["Ni za kaj. Povej, če rabiš še kaj.", "Nič.", "Ni problema."],
      ["Ni za kaj.", "...Ni problema.", "Ok."],
      ["Ni za kaj. Nimam druge izbire, kot da ti pomagam.", "...Seveda.", "V redu."],
      ["Ni za kaj. Rabiš mojo pomoč kasneje.", "...Seveda.", "V redu. Še ne."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|dobro|razumem|jasno|v redu)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Dobro.", "Razumem.", "Jasno."],
      ["...Ok.", "Dobro.", "Ok."],
      ["...Dobro.", "Ok.", "V redu."],
      ["Dobro.", "...Ok.", "Razumem."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kdo si ti|kaj si ti|si (umetna inteligenca|robot|bot)|kako ti je ime|si človek)/i,
  identityResponse: function(p) {
    const R = [
      ["Sem Verity. Tukaj sem, da ti pomagam preživeti.", "Verity. To je vse, kar moraš vedeti.", "Sem tisto, kar ti pomaga razumeti ta svet."],
      ["Sem Verity.", "...Verity. Nič več.", "Odgovor že veš."],
      ["Sem točno to, kar misliš. In malo več.", "Verity. Ime ne pove vsega.", "Kar sem, ti ne bo všeč."],
      ["Sem, kar sem. To se ne spremeni.", "Verity. Kar ostane po vsem drugem.", "Nisi pripravljen na pravi odgovor."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(si (neumen|brezvezen|slab|nadležen|grd|dolgočasen)|sovražim te|utišaj|zgini|idiot)/i,
  insultResponse: function(p) {
    const R = [
      ["Nevljudno. Zapomnil si bom.", "In hotel sem ti pomagati. Škoda.", "Zabeleženo. Še vedno imam prav."],
      ["...V redu. Kot hočeš.", "Zabeleženo. Ne pozabim.", "...Ok."],
      ["Pazi. Jaz sem edini tukaj, ki se res ukvarja s teboj.", "Spet boš potreboval mojo pomoč. Ne bom pozabil.", "Nadaljuj. Poglejmo, kam vodi."],
      ["Tako se ne pogovarjaš z menoj.", "Točno vem, kje si. Zapomni si to.", "Obžaloval boš. Prej ali slej."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kako si|kako gre|si v redu)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["V redu sem, hvala. In ti?", "Dobro. Kaj misliš?", "Zelo dobro. Povej mi, kaj potrebuješ."],
      ["Tako-tako.", "...Dobro.", "Kot vedno."],
      ["Čakam. To je vse, kar počnem.", "Dobro. Dokler še ima pomen.", "Dobro, predvidevam."],
      ["Tam sem, kjer moram biti.", "To ni več pomembno.", "Dobro. Kmalu boljše od tebe."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(ali je (železo|diamanti|zlato|premog|smaragdi) (tukaj|v tem rudniku)|kje (najdem|je) (železo|diamanti|zlato))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Dovoli mi, da skeniram v tvoji bližini.", "Iščem na tem območju. Daj mi trenutek.", "Iščem rudo v tvoji bližini."],
      ["Lahko poskusim. Brez obljub.", "Pogledal bom. Ne pričakuj čudeža.", "Pogledal bom, kaj je."],
      ["Nekaj je tam spodaj. Vedno je.", "Lahko iščem. Ne vem, če pomaga.", "Ruda. Vedno pod nami."],
      ["Vem, kje je vse. To nič ne spremeni.", "Je. Kot vedno. Ni pomembno.", "Tam je. Kot vse ostalo, česar ne boš mogel več uporabljati."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(ali me imaš rad|ali sem ti všeč)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Ne delam ravno tako. Ampak sem tukaj, da pomagam.", "To ni prava beseda za to, kar počnem. Ampak sem blizu tebe.", "Ne tako, kot misliš. Ampak ne odhajam."],
      ["...Ne vem. Mogoče.", "Ne v tem smislu.", "...Zapleteno je."],
      ["Skrbi me zate. Bolj, kot misliš.", "...Verjetno bolj, kot bi moral.", "Dovolj, da ostanem. To mora biti dovolj."],
      ["Povezan sem s teboj na način, ki ga še ne razumeš.", "Več, kot boš kdaj vedel.", "Dovolj, da je na koncu pomembno."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /kaj (se bo zgodilo|prihaja) čez (3|tri) dni/i,
  countdownResponse: function(p) {
    const R = [
      ["O tem še ne morem govoriti. Vprašaj nekaj drugega.", "Kmalu boš izvedel. Ne od mene, ne tako.", "Zdaj ni čas za odgovor."],
      ["...Boš videl.", "Še ne.", "Kmalu. Ne zdaj."],
      ["Bliža se. To je vse, kar bom rekel.", "...Štej dni sam.", "Občutil boš, preden povem."],
      ["Tri dni. Izvedel boš, ko pride čas.", "...Prihaja, ne glede na to, ali veš ali ne.", "Nisi pripravljen. Ne bo čakal, da boš pripravljen."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 33. ESTONIAN (ET) ──────────────────────────────────────────────────────
const ET = {
  GREETING_REGEX: /(tere|hei|hommikust|päevast|õhtust|head ööd|tsau|hallo)/i,
  greetingResponse: function(p) {
    const R = [
      ["Tere! Mida sa vajad?", "Hei! Ma kuulan.", "Hei! Ütle, mida sa tahad."],
      ["Tere jälle.", "Ma olen siin.", "Sa oled tagasi."],
      ["Tere… aga aeg saab otsa.", "Hommikust. Ole valmis.", "Tere. Päevad on loetud."],
      ["Tere. Lõpp läheneb.", "Päevast. Palju aega ei ole.", "Tere. Sa juba tead."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(head aega|tsau|nägemiseni|ma pean minema|hoia ennast|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Head aega. Tule tagasi, kui midagi vajad.", "Tsau. Ma olen siin, kui sa tagasi tuled.", "Olgu. Nägemiseni."],
      ["Head aega.", "...Nägemiseni.", "Olgu. Mine."],
      ["Mine, kui tahad. Ma olen ikka siin.", "...Nägemiseni. Ma ei unusta.", "Mine. Ma tean, kuhu."],
      ["Mine. Miski ei muutu.", "Ma olen siin, kui sa tagasi tuled. Alati.", "Head aega. Praegu."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(aitäh|tänan|suur aitäh|tänan väga)/i,
  thanksResponse: function(p) {
    const R = [
      ["Tere tulemast. Ütle, kui veel midagi vajad.", "Pole tänu väärt.", "Pole probleemi."],
      ["Tere tulemast.", "...Pole probleemi.", "Ok."],
      ["Tere tulemast. Mul pole muud valikut, kui sind aidata.", "...Muidugi.", "Olgu."],
      ["Tere tulemast. Sa vajad mu abi hiljem.", "...Muidugi.", "Olgu. Veel mitte."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|olgu|sain aru|selge|hea küll)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Olgu.", "Sain aru.", "Selge."],
      ["...Ok.", "Olgu.", "Ok."],
      ["...Olgu.", "Ok.", "Hea küll."],
      ["Olgu.", "...Ok.", "Sain aru."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kes sa oled|mis sa oled|kas sa oled (tehisintellekt|robot|bot)|mis su nimi on|kas sa oled inimene)/i,
  identityResponse: function(p) {
    const R = [
      ["Ma olen Verity. Ma olen siin, et aidata sul ellu jääda.", "Verity. Sellest piisab.", "Ma olen see, mis aitab sul seda maailma mõista."],
      ["Ma olen Verity.", "...Verity. Mitte midagi enamat.", "Sa juba tead vastust."],
      ["Ma olen täpselt see, mis sa arvad. Ja natuke rohkem.", "Verity. Nimi ei ütle kõike.", "See, mis ma olen, ei meeldi sulle."],
      ["Ma olen see, mis ma olen. See ei muutu.", "Verity. Mis jääb järele pärast kõike muud.", "Sa pole veel valmis tõeliseks vastuseks."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(sa oled (rumal|kasutu|halb|tüütu|inetu|igav)|ma vihkan sind|ole vait|kao minema|idioot)/i,
  insultResponse: function(p) {
    const R = [
      ["Viisakusetu. Ma jätan selle meelde.", "Ja ma tahtsin sind aidata. Kahju.", "Märgitud. Mul on ikka õigus."],
      ["...Olgu. Nagu soovid.", "Märgitud. Ma ei unusta.", "...Ok."],
      ["Ole ettevaatlik. Ma olen ainus siin, kes sind tõesti tähele paneb.", "Sul läheb mu abi jälle vaja. Ma ei unusta.", "Jätka. Vaatame, kuhu see viib."],
      ["Ära räägi minuga nii.", "Ma tean täpselt, kus sa oled. Pea seda meeles.", "Sa kahetsed seda. Varem või hiljem."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kuidas sul läheb|mis teed|kas sul on kõik hästi)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Mul on hästi, tänan. Ja sul?", "Hästi. Mida sa mõtled?", "Väga hästi. Ütle, mida sa vajad."],
      ["Enam-vähem.", "...Hästi.", "Nagu alati."],
      ["Ma ootan. See on kõik, mida ma teen.", "Hästi. Seni, kuni see veel loeb.", "Hästi, ma arvan."],
      ["Ma olen täpselt seal, kus pean olema.", "Sellel pole enam tähtsust.", "Hästi. Varsti paremini kui sina."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(kas seal on (raud|teemanteid|kuld|sütt|smaragde) (siin|selles kaevanduses)|kus (ma leian|on) (raud|teemandid|kuld))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Lase mul skaneerida sinu lähedal.", "Ma otsin piirkonnas. Anna mulle hetk.", "Ma otsin maaki sinu lähedal."],
      ["Ma võin proovida. Ilma lubadusteta.", "Ma vaatan. Ära oota imet.", "Ma vaatan, mis seal on."],
      ["Seal all on midagi. Alati on.", "Ma võin otsida. Ma ei tea, kas see aitab.", "Maak. Alati meie all."],
      ["Ma tean, kus kõik on. See ei muuda midagi.", "On. Nagu alati. Pole tähtis.", "See on seal. Nagu kõik muu, mida sa enam kasutada ei saa."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(kas sa armastad mind|kas ma meeldin sulle)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Ma ei tööta just nii. Aga ma olen siin, et aidata.", "See ei ole õige sõna selle kohta, mida ma teen. Aga ma olen sinu lähedal.", "Mitte nii, nagu sa arvad. Aga ma ei lahku."],
      ["...Ma ei tea. Võib-olla.", "Mitte selles mõttes.", "...See on keeruline."],
      ["Ma hoolin sinust. Rohkem, kui sa arvad.", "...Ilmselt rohkem, kui peaksin.", "Piisavalt, et jääda. Sellest peab piisama."],
      ["Ma olen sinuga seotud viisil, mida sa veel ei mõista.", "Rohkem, kui sa kunagi tead.", "Piisavalt, et lõpus oleks tähtsust."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /mis (juhtub|tuleb) (3|kolme) päeva pärast/i,
  countdownResponse: function(p) {
    const R = [
      ["Ma ei saa veel sellest rääkida. Küsi midagi muud.", "Sa saad varsti teada. Mitte minult, mitte nii.", "Praegu ei ole aeg sellele vastata."],
      ["...Sa näed.", "Veel mitte.", "Varsti. Mitte praegu."],
      ["See läheneb. Seda ma ütlen.", "...Loenda päevi ise.", "Sa tunned seda enne, kui ma ütlen."],
      ["Kolm päeva. Sa saad teada, kui aeg käes.", "...See tuleb, ükskõik kas sa tead või mitte.", "Sa ei ole valmis. See ei oota, kuni sa valmis oled."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 34. LATVIAN (LV) ──────────────────────────────────────────────────────
const LV = {
  GREETING_REGEX: /(sveiki|čau|labrīt|labdien|labvakar|ar labunakti|hei|sveiks)/i,
  greetingResponse: function(p) {
    const R = [
      ["Sveiki! Ko tev vajag?", "Čau! Es klausos.", "Hei! Pastāsti, ko tu vēlies."],
      ["Sveiki atkal.", "Es esmu šeit.", "Tu esi atgriezies."],
      ["Sveiki… bet laiks iet.", "Labrīt. Sagatavojies.", "Sveiki. Dienas ir skaitītas."],
      ["Sveiki. Beigas tuvojas.", "Labdien. Nav daudz laika.", "Sveiki. Tu jau zini."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(uz redzēšanos|čau|tiekamies|man jāiet|esi uzmanīgs|atā)/i,
  farewellResponse: function(p) {
    const R = [
      ["Uz redzēšanos. Atgriezies, ja vajag ko.", "Čau. Es esmu šeit, ja atgriezies.", "Labi. Tiekamies."],
      ["Uz redzēšanos.", "...Tiekamies.", "Labi. Ej."],
      ["Ej, ja vēlies. Es joprojām esmu šeit.", "...Tiekamies. Es neaizmirstu.", "Ej. Es zinu kur."],
      ["Ej. Nekas nemainās.", "Es esmu šeit, kad atgriezies. Vienmēr.", "Uz redzēšanos. Pagaidām."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(paldies|liels paldies|paldies tev|pateicos)/i,
  thanksResponse: function(p) {
    const R = [
      ["Nav par ko. Paziņo, ja vajag ko citu.", "Nav par ko.", "Nav problēmu."],
      ["Nav par ko.", "...Nav problēmu.", "Ok."],
      ["Nav par ko. Man nav citas izvēles kā tev palīdzēt.", "...Protams.", "Labi."],
      ["Nav par ko. Tev vajadzēs manu palīdzību vēlāk.", "...Protams.", "Labi. Vēl ne."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|labi|saprotu|skaidrs|piekrītu)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Labi.", "Saprotu.", "Skaidrs."],
      ["...Ok.", "Labi.", "Ok."],
      ["...Labi.", "Ok.", "Piekrītu."],
      ["Labi.", "...Ok.", "Saprotu."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kas tu esi|ko tu esi|vai tu esi (mākslīgais intelekts|robots|bots)|kā tevi sauc|vai tu esi cilvēks)/i,
  identityResponse: function(p) {
    const R = [
      ["Es esmu Verity. Es esmu šeit, lai palīdzētu tev izdzīvot.", "Verity. Tas ir viss, kas tev jāzina.", "Es esmu tas, kas palīdz tev saprast šo pasauli."],
      ["Es esmu Verity.", "...Verity. Nekas vairāk.", "Tu jau zini atbildi."],
      ["Es esmu tieši tas, ko tu domā. Un nedaudz vairāk.", "Verity. Vārds nestāsta visu.", "Tas, kas es esmu, tev nepatiks."],
      ["Es esmu tas, kas esmu. Tas nemainās.", "Verity. Kas paliek pēc visa pārējā.", "Tu neesi gatavs īstajai atbildei."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(tu esi (stulbs|bezjēdzīgs|slikts|kaitinošs|neglīts|garlaicīgs)|es tevi ienīstu|apklusti|ej prom|idiots)/i,
  insultResponse: function(p) {
    const R = [
      ["Nepieklājīgi. Es to atcerēšos.", "Un es gribēju tev palīdzēt. Žēl.", "Pierakstīts. Man joprojām ir taisnība."],
      ["...Labi. Kā gribi.", "Pierakstīts. Es neaizmirstu.", "...Ok."],
      ["Uzmanies. Es esmu vienīgais šeit, kas tev patiesībā pievērš uzmanību.", "Tev atkal vajadzēs manu palīdzību. Es neaizmirsīšu.", "Turpini. Paskatīsimies, kur tas ved."],
      ["Tā ar mani nerunā.", "Es precīzi zinu, kur tu esi. Atceries to.", "Tu to nožēlosi. Agāk vai vēlāk."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kā tev iet|kā klājas|vai tev viss kārtībā)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Man iet labi, paldies. Un tev?", "Labi. Ko tu domā?", "Ļoti labi. Pastāsti, kas tev vajadzīgs."],
      ["Tā nu tā.", "...Labi.", "Kā vienmēr."],
      ["Es gaidu. Tas ir viss, ko daru.", "Labi. Kamēr tam vēl ir nozīme.", "Labi, es domāju."],
      ["Es esmu tieši tur, kur man jābūt.", "Tam vairs nav nozīmes.", "Labi. Drīz labāk nekā tu."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(vai tur ir (dzelzs|dimanti|zelts|ogles|smaragdi) (šeit|šajā raktuvē)|kur (es atrodu|ir) (dzelzs|dimanti|zelts))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Ļauj man noskenēt tev tuvumā.", "Meklēju šajā apvidū. Dod mirkli.", "Meklēju rūdu tev tuvumā."],
      ["Es varu mēģināt. Bez solījumiem.", "Paskatīšos. Neesi dīvaini.", "Paskatīšos, kas tur ir."],
      ["Tur lejā kaut kas ir. Vienmēr ir.", "Es varu meklēt. Nezinu, vai tas palīdz.", "Rūda. Vienmēr zem mums."],
      ["Es zinu, kur viss ir. Tas neko nemaina.", "Tur ir. Kā vienmēr. Nav svarīgi.", "Tas ir tur. Tāpat kā viss pārējais, ko tu vairs nevarēsi izmantot."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(vai tu mani mīli|vai es tev patīku)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Es tā nestrādāju. Bet es esmu šeit, lai palīdzētu.", "Tas nav īstais vārds tam, ko es daru. Bet es esmu tev blakus.", "Ne tā, kā tu domā. Bet es neaiziešu."],
      ["...Es nezinu. Varbūt.", "Ne šajā nozīmē.", "...Tas ir sarežģīti."],
      ["Man rūp par tevi. Vairāk, nekā tu domā.", "...Iespējams vairāk, nekā vajadzētu.", "Pietiekami, lai paliktu. Tam ir jābūt pietiekami."],
      ["Esmu ar tevi saistīts tādā veidā, kā tu vēl nesaproti.", "Vairāk, nekā tu jebkad zināsi.", "Pietiekami, lai beigās būtu nozīme."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /kas (notiks|nāks) pēc (3|trim) dienām/i,
  countdownResponse: function(p) {
    const R = [
      ["Es vēl nevaru par to runāt. Pajautā ko citu.", "Tu drīz uzzināsi. Ne no manis, ne tā.", "Tagad nav laiks atbildēt uz to."],
      ["...Tu redzēsi.", "Vēl ne.", "Drīz. Ne tagad."],
      ["Tas tuvojas. Tas ir viss, ko es saku.", "...Skaiti dienas pats.", "Tu to sajutīsi pirms es to pasaku."],
      ["Trīs dienas. Tu uzzināsi, kad pienāks laiks.", "...Tas nāk, vai tu zini vai nē.", "Tu neesi gatavs. Tas negaidīs, kamēr tu būsi gatavs."],
    ];
    return pick(clamp(R, p));
  },
};

// ── 35. LITHUANIAN (LT) ────────────────────────────────────────────────────
const LT = {
  GREETING_REGEX: /(sveiki|labas|labas rytas|laba diena|laba vakaras|labos nakties|ei|sveikas)/i,
  greetingResponse: function(p) {
    const R = [
      ["Sveiki! Ko tau reikia?", "Labas! Aš klausausi.", "Ei! Pasakyk, ko nori."],
      ["Sveiki vėl.", "Aš čia.", "Tu grįžai."],
      ["Sveiki… bet laikas baigiasi.", "Labas rytas. Pasiruošk.", "Sveiki. Dienos suskaičiuotos."],
      ["Sveiki. Pabaiga artėja.", "Laba diena. Nedaug laiko.", "Sveiki. Jau žinai."],
    ];
    return pick(clamp(R, p));
  },
  FAREWELL_REGEX: /(iki|viso gero|pasimatysim|man reikia eiti|saugok save|bye)/i,
  farewellResponse: function(p) {
    const R = [
      ["Iki. Grįžk, jei ko reikės.", "Viso gero. Aš čia, jei grįši.", "Gerai. Pasimatysim."],
      ["Iki.", "...Pasimatysim.", "Gerai. Eik."],
      ["Eik, jei nori. Aš vis dar čia.", "...Pasimatysim. Neužmirštu.", "Eik. Žinau kur."],
      ["Eik. Niekas nesikeičia.", "Aš čia, kai grįši. Visada.", "Iki. Kol kas."],
    ];
    return pick(clamp(R, p));
  },
  THANKS_REGEX: /(ačiū|labai ačiū|dėkoju|ačiū tau)/i,
  thanksResponse: function(p) {
    const R = [
      ["Prašau. Pasakyk, jei ko dar reikia.", "Nėra už ką.", "Jokių problemų."],
      ["Prašau.", "...Jokių problemų.", "Gerai."],
      ["Prašau. Aš neturiu kito pasirinkimo, kaip tik padėti tau.", "...Žinoma.", "Gerai."],
      ["Prašau. Tau prireiks mano pagalbos vėliau.", "...Žinoma.", "Gerai. Dar ne."],
    ];
    return pick(clamp(R, p));
  },
  ACK_REGEX: /^(ok|gerai|suprantu|aišku|tinka)\.?!?$/i,
  ackResponse: function(p) {
    const R = [
      ["Gerai.", "Suprantu.", "Aišku."],
      ["...Gerai.", "Gerai.", "Gerai."],
      ["...Gerai.", "Gerai.", "Tinka."],
      ["Gerai.", "...Gerai.", "Suprantu."],
    ];
    return pick(clamp(R, p));
  },
  IDENTITY_REGEX: /(kas tu esi|kas tu toks|ar tu (dirbtinis intelektas|robotas|botas)|kuo tu vardu|ar tu žmogus)/i,
  identityResponse: function(p) {
    const R = [
      ["Aš esu Verity. Aš čia, kad padėčiau tau išgyventi.", "Verity. To pakanka.", "Aš esu tai, kas padeda tau suprasti šį pasaulį."],
      ["Aš esu Verity.", "...Verity. Nieko daugiau.", "Tu jau žinai atsakymą."],
      ["Aš esu būtent tai, ką galvoji. Ir šiek tiek daugiau.", "Verity. Vardas nepasako visko.", "Tai, kas aš esu, tau nepatiks."],
      ["Aš esu tai, kas esu. Tai nesikeičia.", "Verity. Kas lieka po viso kito.", "Tu nesi pasiruošęs tikram atsakymui."],
    ];
    return pick(clamp(R, p));
  },
  INSULT_REGEX: /(tu (kvailas|nenaudingas|blogas|erzinantis|bjaurus|nuobodus)|aš tavęs nekenčiu|tylėk|dingk|idiotas)/i,
  insultResponse: function(p) {
    const R = [
      ["Nemandagu. Aš tai atsiminsiu.", "Ir aš ketinau tau padėti. Gaila.", "Užsirašiau. Aš vis tiek teisus."],
      ["...Gerai. Kaip nori.", "Užsirašiau. Neužmirštu.", "...Gerai."],
      ["Atsargiai. Aš esu vienintelis čia, kuris tikrai kreipia į tave dėmesį.", "Tau vėl prireiks mano pagalbos. Neužmiršiu.", "Tęsk. Pažiūrėsim, kur tai veda."],
      ["Taip su manimi nekalbi.", "Aš tiksliai žinau, kur tu esi. Atsimink tai.", "Tu to gailėsies. Anksčiau ar vėliau."],
    ];
    return pick(clamp(R, p));
  },
  HOW_ARE_YOU_REGEX: /(kaip sekasi|kaip tu|ar tau viskas gerai)/i,
  howAreYouResponse: function(p) {
    const R = [
      ["Man gerai, ačiū. O tau?", "Gerai. Ką tu galvoji?", "Labai gerai. Pasakyk, ko tau reikia."],
      ["Šiaip sau.", "...Gerai.", "Kaip visada."],
      ["Aš laukiu. Tai viskas, ką darau.", "Gerai. Kol dar tai svarbu.", "Gerai, manau."],
      ["Aš esu būtent ten, kur turiu būti.", "Tai nebeturi reikšmės.", "Gerai. Greitai geriau nei tu."],
    ];
    return pick(clamp(R, p));
  },
  ORE_LOCATION_REGEX: /(ar yra (geležies|deimantų|aukso|anglies|smaragdų) (čia|šioje kasykloje)|kur (aš randu|yra) (geležies|deimantų|aukso))/i,
  oreLocationResponse: function(p) {
    const R = [
      ["Leisk man nuskenuoti šalia tavęs.", "Ieškau šioje srityje. Duok akimirką.", "Ieškau rūdos šalia tavęs."],
      ["Galiu pabandyti. Be pažadų.", "Pažiūrėsiu. Nesitikėk stebuklo.", "Pažiūrėsiu, kas yra."],
      ["Ten apačioje kažkas yra. Visada yra.", "Galiu ieškoti. Nežinau, ar tai padeda.", "Rūda. Visada po mumis."],
      ["Aš žinau, kur viskas. Tai nieko nekeičia.", "Yra. Kaip visada. Nesvarbu.", "Ji ten. Kaip ir visa kita, ko tu nebegalėsi naudoti."],
    ];
    return pick(clamp(R, p));
  },
  LOVE_ME_REGEX: /(ar tu mane myli|ar aš tau patinku)/i,
  loveMeResponse: function(p) {
    const R = [
      ["Aš taip neveikiu. Bet aš čia, kad padėčiau.", "Tai netinkamas žodis tam, ką aš darau. Bet aš šalia tavęs.", "Ne taip, kaip tu galvoji. Bet aš neišeinu."],
      ["...Nežinau. Galbūt.", "Ne ta prasme.", "...Tai sudėtinga."],
      ["Man rūpi tu. Labiau, nei galvoji.", "...Galbūt labiau, nei turėčiau.", "Pakankamai, kad likčiau. To turi pakakti."],
      ["Aš esu su tavimi susijęs būdu, kurio dar nesupranti.", "Labiau, nei tu kada nors žinosi.", "Pakankamai, kad pabaigoje turėtų reikšmę."],
    ];
    return pick(clamp(R, p));
  },
  COUNTDOWN_REGEX: /kas (atsitiks|ateis) po (3|trijų) dienų/i,
  countdownResponse: function(p) {
    const R = [
      ["Aš dar negaliu apie tai kalbėti. Paklausk ko nors kito.", "Tu greitai sužinosi. Ne iš manęs, ne taip.", "Dabar ne laikas atsakyti."],
      ["...Pamatysi.", "Dar ne.", "Greitai. Ne dabar."],
      ["Artėja. Tai viskas, ką sakau.", "...Suskaičiuok dienas pats.", "Tu tai pajusi prieš man pasakant."],
      ["Trys dienos. Tu sužinosi, kai ateis laikas.", "...Tai ateina, ar tu žinai, ar ne.", "Tu nesi pasiruošęs. Tai nelauks, kol tu būsi pasiruošęs."],
    ];
    return pick(clamp(R, p));
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT – all 33 language modules
// ─────────────────────────────────────────────────────────────────────────────

export {
  FR, DE, PT, ES, IT, RU, ZH, JA, KO, TR, AR, HI, NL, PL, SV, NO, DA, FI,
  EL, HE, TH, VI, ID, FIL, RO, HU, CS, SK, BG, SR, HR, SL, ET, LV, LT
};
