// Use 1 for yes/on and 0 for no/off.
// Keep real provider API keys in your Cloudflare Worker, not in this pack.

export const CONFIG = {
  features: {
    ai: 1,
    commands: 1,
    localKnowledge: 1,
    idleTalking: 1,
    joinGreetings: 1,
    phaseProgression: 1,
    profanityFilter: 1,
    music: 1,
    weather: 1,
    timers: 1,
    oreLocator: 1,
    featureLocator: 1,
    followCommands: 1,
    talkAnimation: 1,
    debugLogs: 0,
  },

  ai: {
    workerUrl: "https://gentle-hall-9c27.lagunajoshua750.workers.dev/",
    workerToken: "verity_8F2xK9mQpL7R4nZ",
    clientVersion: 5,
    timeoutTicks: 300,
    maxHistoryMessages: 20,
    providers: [
      "groq",
      "pollinations",
      "gemini",
      "or-gemma4-26b",
      "or-laguna-m1",
      "or-qwen3-235b",
      "or-qwen3-coder",
      "or-qwen3-next-80b",
      "or-deepseek-r1",
      "or-deepseek-chat",
      "or-llama4-scout",
      "or-llama4-maverick",
      "or-llama33-70b",
      "or-mistral-7b",
      "or-hermes-405b",
      "or-gpt-oss-20b",
      "or-nemotron-super-120b",
      "or-nemotron-reasoning-30b",
      "or-nemotron-nano-30b",
      "or-nemotron-nano-9b",
      "or-lfm-thinking",
      "or-lfm-instruct",
      "or-north-mini-code",
      "or-laguna-xs2",
      "or-owl-alpha",
    ],

    // Optional fields for your own relay. Verity does not send these directly.
    // Putting real keys here would expose them to anyone who opens the pack.
    groqApiKey: "",
    geminiApiKey: "",
    openRouterApiKey: "",
    customApiUrl: "",
    customApiToken: "",
  },

  chat: {
    name: "Verity",
    tag: "§f§l<Verity>§r",
    hearingRange: 128,
    answerInPlayerLanguage: 1,
    maxReplySentences: 2,
    showThinkingMessage: 1,
  },

  phases: {
    thresholds: [0, 10, 25, 45, 70, 100],
    colors: ["§f", "§7", "§8", "§4", "§c", "§5"],
    normalQuestionWeight: 1,
    loreQuestionWeight: 4,
    happinessRecovery: 3,
    happinessCooldownTicks: 600,
    maxHappinessPhaseRecovery: 2,
  },

  idle: {
    refreshTicks: 100,
    startTalkingAfterTicks: 3600,
    cooldownTicks: 6000,
  },

  gameplay: {
    followDistance: 2,
    throwStrength: 0.8,
    throwUpwardBoost: 0.12,
    worldAwarenessRadius: 96,
    oreSearchRadius: 96,
    oreMinimumY: -64,
    oreMaximumY: 320,
    oreSearchBatchSize: 128,
    oreVeinSkipRadius: 4,
    blockSearchRadius: 96,
    blockVerticalRadius: 48,
    entitySearchRadius: 192,
    structureSearchRadius: 384,
    timerMaximumSeconds: 86400,
    talkMinimumTicks: 20,
    talkMaximumTicks: 100,
  },

  fishAudio: {
    // Master switch: 1 = enabled, 0 = disabled
    enabled: 0,

    // TTS provider per player: "local" | "fish" | "both"
    //   local = phoneme/diphone TTS only (existing)
    //   fish  = Fish.audio TTS only (new)
    //   both  = local + Fish.audio simultaneously
    provider: "fish",

    // Fish.audio voice/reference ID (get this from fish.audio after cloning)
    voiceId: "",

    // Cloudflare Worker URL that proxies Fish.audio API.
    // Leave blank to reuse CONFIG.ai.workerUrl.
    workerUrl: "",

    // Fish.audio voice model
    model: "s2.1-pro-free",

    // Your TTS server endpoint.
    // The behavior pack POSTs to: workerUrl + "/tts" via HivemindAPI.
    // Your server calls Fish.audio and plays audio through OS speakers.
    // Leave blank to reuse CONFIG.ai.workerUrl.
    workerUrl: "",
  },

  safety: {
    warnBeforeProfanityKick: 1,
    allowExplicitContent: 0,
    allowSlurs: 0,
    allowDangerousAdvice: 0,
  },
};

export function isEnabled(value) {
  return Number(value) === 1;
}
