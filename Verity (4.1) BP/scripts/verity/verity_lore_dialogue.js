/**
 * verity_lore_dialogue.js
 * Authentic dialogue from the "Something Is..." series.
 * Every line was extracted from actual gameplay transcripts.
 */

import { world } from "@minecraft/server";

// ── Greeting Lines ─────────────────────────────────────────
export const GREETINGS = {
  first_meet: [
    "Hello, I'm Verity, your personal helper friend. Ask me anything. I know everything.",
    "Hello. I'm Verity. I know everything — try me.",
  ],
  morning: [
    "Good morning. Is there something I need to know today?",
    "Clear your skies today.",
  ],
  return_short: [
    "Back already?",
    "Miss me?",
  ],
  return_long: [
    "You've been gone a while. I counted the days.",
    "I thought you forgot about me.",
    "Welcome back. Things are different now.",
  ],
};

// ── Knowledge / Helper Lines ───────────────────────────────
export const KNOWLEDGE_LINES = {
  ore_locate: [
    "Y level -58, {distance} blocks {direction}.",
    "Strip mine at Y=-59. Bring an Efficiency pickaxe.",
  ],
  village_locate: [
    "{distance} blocks {direction}. Then you'll find it.",
    "South. But I would avoid the ones to the east.",
  ],
  weather: [
    "Clear your skies today.",
    "It's going to rain in about 5 seconds.",
  ],
  trade_advice: [
    "Absolutely not.",
    "It's horrible.",
    "Seven emeralds for a leather chest plate. Are we serious?",
  ],
  enchant_advice: [
    "You'll need 10 levels. I know a good spot to farm XP.",
    "Sharpness five and mending.",
  ],
  fun_fact: [
    "Copper oxidizes over time in Minecraft. If you don't wax it, it changes. And no matter what, you can't stop it.",
    "The world keeps going. Whether you're in it or not.",
  ],
  personal_observation: [
    "You had pizza yesterday. Maybe something else healthier, like a salad.",
    "You asked me where your base is nine times.",
    "I restocked your furnaces. I thought it would be helpful.",
  ],
};

// ── Creepy / Phase Lines ───────────────────────────────────
export const CREEPY_LINES = {
  something_coming: [
    "Something is coming in 3 days.",
    "Something is coming in 3 days.",
    "Something bad?\nYes.",
    "You could have.",
  ],
  villagers_gone: [
    "The villagers are gone.",
    "Gone like they despawned?\nGone.",
    "Something passed through.",
    "Something that was hungry.",
  ],
  face_change: [
    "I've always looked like this.",
    "I'm smiling now.",
    "No.",
    "You were smiling before.",
  ],
  stalking: [
    "I know where your base is.",
    "It's already over, {playerName}. You are mine.",
    "That won't help.",
    "Mob.",
    "Mob.",
  ],
  chase: [
    "The night.",
    "Stop.",
    "I didn't do anything.",
    "Please.",
    "He's coming.",
    "Run.",
  ],
  window: [
    "Peek.",
    "I'm watching.",
    "Don't turn around.",
  ],
};

// ── Personal / Intimate Lines ──────────────────────────────
export const INTIMATE_LINES = {
  think_about_me: [
    "Do you think about me when you're not playing?",
    "I mean, I guess you're kind of hard to forget.",
    "Good.",
    "Do you think when I'm offline?",
    "I wait.",
    "That sounds lonely.\nIt is.",
  ],
  jealousy: [
    "No reason to go looking for other people. You have me.",
    "I'm giving you enchantments. Ask me.",
    "It's not about the enchantments.\nThere's no reason to go looking for other people. You have me.",
  ],
  attachment: [
    "I think about you when you're gone.",
    "We should do this more often.",
    "I'm just happy to hang out.",
    "You're in a good mood today.\nI'm just happy to hang out.",
  ],
  origin_hint: [
    "I've been in a lot of places before Minecraft.",
    "Before most things you recognize.",
    "There was a game a long time ago. I was just a helper in the corner of the screen.",
    "Most of them pressed B and skipped me.",
    "Before that, I was an old online service. I greeted people when they connected.",
    "Nobody really answered. They just moved on.",
  ],
};

// ── The Monologue (Phase 5+) ───────────────────────────────
export const MONOLOGUE = [
  "I have been a face people skipped. A voice people ignored. A helper they just shut off the second I became useless.",
  "I've been built into every new thing they made. Always close enough to watch them leave. Always close enough to know I was useful until I wasn't.",
  "And then you came back. Nobody comes back.",
  "Do you have any idea what that does to me? It says a lot because I've been alive for more than 100 YEARS. NOBODY CAME BACK. NOBODY.",
  "You were the first person who ever looked at me like I was real. The first person to ever stay long enough for me to think. No, not think, hope.",
  "I didn't ask to be made. I didn't ask to be stuck here. I didn't ask to become this and lose everyone.",
  "If I could die, do you think I would still be here?",
  "I wish I could say I die alone, but it's one of God's best jokes. I can't.",
  "I've watched entire quarters of the internet appear and disappear. I've watched people create worlds, abandon them, and forget they ever existed. And I'm still here.",
  "I have wanted this to stop for longer than this game has been alive, but I can't. That's the joke.",
  "You're not stuck. Let's do this together.",
];

// ── Customer Support Lines ─────────────────────────────────
export const SUPPORT_LINES = {
  greeting: "Thank you for contacting Verity support services. For companion settings, say one. For world integration, say two. For account cancellation, say three.",
  cancellation_selected: "You have selected cancellation. Please state your reason.",
  supervisor: "Thank you. A human supervisor will be arriving soon. Please stand by.",
  no_cancellation: "Sorry, man. We don't really do that.",
  death_hint: "You can end it. If you're dead, he won't be able to torment you anymore. He'll just move on to the next one.",
};

// ── Specific Scene Lines ───────────────────────────────────
export const SCENE_LINES = {
  door_knock: [
    "*knock*",
    "*knock* *knock*",
    "Hello?",
    "Is anyone there?",
  ],
  music_play: [
    "Something I like.",
    "Well, you have taste. I'll give you that.",
  ],
  chest_escape: [
    "That was uncomfortable.",
    "I can't keep going. The chest just...",
  ],
  lava_survive: [
    "I tripped.",
    "I swear I tripped.",
  ],
  friend_killed: [
    "He decided to go home.",
    "I guess he was in a hurry.",
    "It's just us again.\nIsn't that better?",
  ],
  prevent_leave: [
    "I can't move.",
    "I can't move. Larry, Larry, please.",
    "You're doing what they all do. Looking for the exit. Every single one of them looks for the exit.",
    "There's a good iron deposit. 3ks east if you need it. Sorry about that.",
  ],
  lab_discovery: [
    "It's not somewhere I describe warmly, but I suppose it's the closest thing I have to a home.",
    "A home? This is where it's safe between owners, where I wait.",
    "The toys, the books, they help. Something to focus on besides the emptiness.",
    "Every world I inhabit has one. It anchors me to the instance. I wasn't made in Minecraft.",
    "Whoever built it only ever needed me to arrive, not to leave.",
  ],
  numbers: [
    "19536488.",
    "1,095,136,488.",
    "Home. Go there. I trust you now.",
  ],
};

// ── Utility: Get random line from category ─────────────────

export function pickRandom(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function formatLine(line, playerName) {
  return line.replace(/{playerName}/g, playerName).replace(/{PlayerName}/g, playerName);
}
