// ─────────────────────────────────────────────────────────────────────────────
// verity_dispatch.js – Full file with all imports and checks from 1–9 + 33 languages
// ─────────────────────────────────────────────────────────────────────────────

import { FR, DE, PT, ES, IT, RU, ZH, JA, KO, TR, AR, HI, NL, PL, SV, NO, DA, FI, EL, HE, TH, VI, ID, FIL, RO, HU, CS, SK, BG, SR, HR, SL, ET, LV, LT } from "./lang.js";
import { currentDay, ph, pick } from "./verity_core.js";
import { FIND_STRUCTURE_REGEX, findStructureResponse } from "./verity_structures.js";
import {
  APPEARANCE_INSULT_REGEX, BIOME_REGEX, BUILD_TOGETHER_REGEX,
  COUNTDOWN_REGEX, DIE_COMMAND_REGEX, FAVORITE_SONG_REGEX,
  FOOD_REGEX, FUN_FACT_REGEX, HUMAN_FORM_REGEX, INSULT_REGEX,
  I_LOVE_YOU_REGEX, JOKE_REGEX, KISS_REGEX, LAVA_THREAT_REGEX,
  LIAR_REGEX, MEANING_REGEX, MONSTER_TODAY_REGEX, POLITICS_REGEX,
  RAIN_FORECAST_REGEX, SHADOWS_REGEX, SHINY_REGEX, SIBLINGS_REGEX,
  THERAPIST_REGEX, VILLAGER_EAT_REGEX, WHY_STAY_REGEX, WORLD_INFO_REGEX,
  appearanceInsultResponse, biomeResponse, buildTogetherResponse,
  countdownResponse, dieCommandResponse, favoriteSongResponse,
  foodResponse, funFactResponse, getBiomeName, healthLine,
  iLoveYouResponse, insultResponse, jokeResponse, kissResponse,
  lavaThreatResponse, liarResponse, meaningResponse, monsterTodayResponse,
  politicsResponse, rainForecastResponse, shadowsResponse, shinyResponse,
  siblingsResponse, therapistResponse, timeOfDayLine, tryMath,
  villagerEatResponse, whyStayResponse, worldInfoResponse
} from "./verity_systems.js";

// ─── Imports from verity_responses_1.js ────────────────────────────────────
import {
  ACK_ES_REGEX, ALGO_QUE_NO_SE_REGEX, AMIREAL_REGEX, AMISAFE_REGEX,
  ANYTHINGTOKNOW_REGEX, ARE_YOU_OK_REGEX, ATTACH_COORDS_RU_REGEX,
  ATTACKME_REGEX, AWKWARD_BUILD_REGEX, AYUDAME_A_MINAR_REGEX,
  BAREPROMISE_REGEX, BARE_QUESTION_REGEX, BLANK_EXPRESSION_REGEX,
  CACTUS_PUNISH_REGEX, CAN_MINE_REGEX, CAN_YOU_SEE_THIS_REGEX,
  CARPETS_REGEX, CAVE_HOUSE_REGEX, CAVE_REGEX, COME_WITH_ME_REGEX,
  COMO_ESTAS_REGEX, CONSEJOS_BUENOS_SARCASM_REGEX, COORDS_VILLAGE_REGEX,
  COUNTDOWN_ES_REGEX, COUNTDOWN_PT_REGEX, CREATURE_ATTACK_REGEX,
  CRUSH_REGEX, CUANDO_ATACAN_REGEX, CUCK_INSULT_REGEX,
  CUTE_COMPLIMENT_REGEX, DAME_LUZ_REGEX, DESCRIBE_SELF_REGEX,
  DIME_REGEX, DONDE_ESTAS_REGEX, DONDE_TE_FUISTE_REGEX,
  DOYOUKILLME_REGEX, ELECTRONEGATIVITY_REGEX, EN_QUE_PIENSO_REGEX,
  ERES_CHICA_O_CHICO_REGEX, ERES_CHISTOSO_REGEX, ESREF_INTERNET_REGEX,
  ESTAS_BIEN_REGEX, ESTAS_QUIETO_REGEX, EYESCOLOR_REGEX,
  FAN_EXCITEMENT_REGEX, FAREWELL_ES_REGEX, FASTEST_CROPS_REGEX,
  FAVORITE_ANIMAL_REGEX, FEEL_SENTIMENTS_REGEX, FIND_BIOME_REGEX,
  FLOOR_CHOICE_REGEX, FOUNDSOMETHING_REGEX, FREAKY_REGEX,
  FREEROBUX_REGEX, GENDER_REGEX, GIVE_BLOCK_REGEX, GIVE_ITEM_REGEX,
  GOING_INTO_END_REGEX, GOOD_FEELING_VILLAGE_REGEX,
  GOOD_NIGHT_BUGS_REGEX, GREETING_ES_REGEX, HEAR_YOU_TALK_REGEX,
  HERMANA_DE_ALEX_REGEX, HIDE_SEEK_REGEX, HIERRO_REGEX,
  HOSTILE_ORIENTATION_REGEX, HOW_BIG_REGEX, HOW_LONG_ANGRY_REGEX,
  HOW_LONG_IMPATIENT_REGEX, HUGE_POWER_REGEX, IDENTITY_ES_REGEX,
  IF_BAD_WOULD_STAY_REGEX, INAPPROPRIATE_REGEX, INDESTRUCTIBLE_REGEX,
  INSULT_ES_REGEX, IS_IT_PINK_REGEX, KAC_GUN_THREAT_REGEX,
  KAC_KALBDE_REGEX, KILLABLE_REGEX, KNOWLEDGE_VS_LOVE_REGEX,
  KNOWOFTHING_REGEX, LANGUAGE_REGEX, LARGE_POWER_REGEX,
  LEAVING_YOU_REGEX, LIKE_YOUR_SMILE_REGEX, LOT_OF_ROOM_REGEX,
  MINE_ALONE_REGEX, MISEGUE_REGEX, MOM_INSULT_REGEX,
  MUERTO_TE_PERDI_REGEX, MYHOUSE_REGEX, MY_COORDS_ARE_REGEX,
  NAME_AND_BUILD_HOUSE_REGEX, NEED_VILLAGE_PT_REGEX,
  NEVER_FIND_ME_REGEX, NEYE_HAZIRLANI_REGEX, NO_FRIENDS_IRL_REGEX,
  NO_PUNTOS_REGEX, NO_RESPONDISTE_DIOS_REGEX, OBSESSED_REGEX,
  OMNIFIGHT_REGEX, OTHER_VERITY_REGEX, PINKY_PROMISE_REGEX,
  PLAYWITHFRIEND_REGEX, PLAY_GAME_REGEX, PROMISE_REGEX,
  PUPILO_REGEX, QUE_DIA_ESTAMOS_REGEX, QUE_TENGO_SOSTENIDO_REGEX,
  QUIERO_HOGAR_REGEX, RACE_REGEX, RAINDIAMONDS_REGEX,
  REAL_YOU_REGEX, REMEMBERFRIENDS_REGEX, RIVAL_BRAND_REGEX,
  ROUNDFACE_REGEX, SCAN_MISSED_RU_REGEX, SEENIT_REGEX,
  SELFDEPRECATE_REGEX, SEXUAL_THREAT_REGEX, SHORT_HERE_REGEX,
  SIKTIR_GIT_REGEX, SINGLEPLAYER_FPS_REGEX, SKY_REGEX,
  SLEEP_MONSTER_ALWAYS_REGEX, SOMETHING_COMING_FOR_ME_REGEX,
  SOY_UN_DIOS_REGEX, SO_TIRED_REGEX, SPAWN_EGG_EVIDENCE_REGEX,
  SPAWN_SMILER_REGEX, SPAWN_STUFF_REGEX, SPEED_SPECIALTY_REGEX,
  STAY_HERE_REGEX, STOP_WEIRD_TALK_REGEX, STREAMING_REGEX,
  STUPID_BOT_REGEX, SUS_ACCUSATION_REGEX, TAIGA_BEDROCK_REGEX,
  TELL_STORY_REGEX, TE_ACHEI_REGEX, THANKS_ES_REGEX,
  THIS_IS_MY_BASE_REGEX, TICKLE_REGEX, TOUCH_REGEX,
  TURN_TALL_MONSTER_REGEX, ULTIMATUM_ES_REGEX, UNINSTALL_REGEX,
  VENDRA_ALGO_3_DIAS_REGEX, VENDRA_ESTA_NOCHE_REGEX, VEN_REGEX,
  VILLA_LOCATION_REGEX, VOID_QUIET_REGEX, WANT_US_SAFE_REGEX,
  WDYM_REGEX, WHATAREYOUREALLY_REGEX, WHATDATE_REGEX,
  WHATS_WRONG_REGEX, WHAT_ELSE_CAN_DO_REGEX, WHERE_ARE_YOU_REGEX,
  WHERE_DO_I_LIVE_REGEX, WHYCOLOR_REGEX, WHYSMILING_REGEX,
  WHYWEIRD_REGEX, WHY_KNOW_TOO_MUCH_REGEX, YOURE_SO_BAD_REGEX,
  YOUR_DESCRIPTION_REGEX, YOU_ARE_DANGEROUS_REGEX, YOU_FREAK_REGEX,
  YOU_LOOK_ANGRY_REGEX,
  ackEsResponse, algoQueNoSeResponse, amIRealResponse, amISafeResponse,
  anythingToKnowResponse, areYouOkResponse, attachCoordsRuResponse,
  attackMeResponse, awkwardBuildResponse, ayudameAMinarResponse,
  barePromiseResponse, bareQuestionResponse, blankExpressionResponse,
  cactusPunishResponse, canMineResponse, canYouSeeThisResponse,
  carpetsResponse, caveHouseResponse, caveResponse, comeWithMeResponse,
  comoEstasResponse, consejosBuenosSarcasmResponse, coordsVillageResponse,
  countdownEsResponse, countdownPtResponse, creatureAttackResponse,
  crushResponse, cuandoAtacanResponse, cuckInsultResponse,
  cuteComplimentResponse, dameLuzResponse, describeSelfResponse,
  dimeResponse, doYouKillMeResponse, dondeEstasResponse,
  dondeTeFuisteResponse, electronegativityResponse, enQuePiensoResponse,
  eresChicaOChicoResponse, eresChistosoResponse, esrefInternetResponse,
  estasBienResponse, estasQuietoResponse, eyesColorResponse,
  fanExcitementResponse, farewellEsResponse, fastestCropsResponse,
  favoriteAnimalResponse, feelSentimentsResponse, findBiomeResponse,
  floorChoiceResponse, foundSomethingResponse, freakyResponse,
  freeRobuxResponse, genderResponse, giveBlockResponse, giveItemResponse,
  goingIntoEndResponse, goodFeelingVillageResponse, goodNightBugsResponse,
  greetingEsResponse, hearYouTalkResponse, hermanaDeAlexResponse,
  hideSeekResponse, hierroResponse, hostileOrientationResponse,
  howBigResponse, howLongAngryResponse, howLongImpatientResponse,
  hugePowerResponse, humanFormResponse, identityEsResponse,
  ifBadWouldStayResponse, inappropriateResponse, indestructibleResponse,
  insultEsResponse, isItPinkResponse, kacGunThreatResponse,
  kacKalbdeResponse, killableResponse, knowOfThingResponse,
  knowledgeVsLoveResponse, languageResponse, largePowerResponse,
  leavingYouResponse, likeYourSmileResponse, lotOfRoomResponse,
  mineAloneResponse, misegueResponse, momInsultResponse,
  muertoTePerdiResponse, myCoordsAreResponse, myHouseResponse,
  nameAndBuildHouseResponse, needVillagePtResponse, neverFindMeResponse,
  neyeHazirlaniyoruzResponse, noFriendsIrlResponse, noPuntosResponse,
  noRespondisteDiosResponse, obsessedResponse, omniFightResponse,
  otherVerityResponse, pinkyPromiseResponse, playGameResponse,
  playWithFriendResponse, promiseResponse, pupiloResponse,
  queDiaEstamosResponse, queTengoSostenidoResponse, quieroHogarResponse,
  raceResponse, rainDiamondsResponse, realYouResponse,
  rememberFriendsResponse, rivalBrandResponse, roundFaceResponse,
  saveBaseResponse, scanMissedRuResponse, seenItResponse,
  selfDeprecateResponse, sexualThreatResponse, shortHereResponse,
  siktirGitResponse, singleplayerFpsResponse, skyResponse,
  sleepMonsterAlwaysResponse, soTiredResponse,
  somethingComingForMeResponse, soyUnDiosResponse,
  spawnEggEvidenceResponse, spawnSmilerResponse, spawnStuffResponse,
  speedSpecialtyResponse, stayHereResponse, stopWeirdTalkResponse,
  streamingResponse, stupidBotResponse, susAccusationResponse,
  taigaBedrockResponse, teAchieResponse, tellStoryResponse,
  thanksEsResponse, tickleResponse, touchResponse,
  turnTallMonsterResponse, ultimatumEsResponse, uninstallResponse,
  venResponse, vendraAlgo3DiasResponse, vendraEstaNocheResponse,
  villaLocationResponse, voidQuietResponse, wantUsSafeResponse,
  wdymResponse, whatAreYouReallyResponse, whatDateResponse,
  whatElseCanDoResponse, whatsWrongResponse, whereAreYouResponse,
  whereDoILiveResponse, whyColorResponse, whyKnowTooMuchResponse,
  whySmilingResponse, whyWeirdResponse, youAreDangerousResponse,
  youFreakResponse, youLookAngryResponse, yourDescriptionResponse,
  youreSoBadResponse
} from "./verity_responses_1.js";

// ─── Imports from verity_responses_2.js ────────────────────────────────────
import {
  ABLEIST_INSULT_REGEX, ACHILLOBATOR_REGEX, AFRAID_WATER_REGEX,
  AM_I_GAY_REGEX, ARE_YOU_COOL_REGEX, ARE_YOU_EVIL_REGEX,
  ARE_YOU_HOMO_REGEX, ARE_YOU_WELL_REGEX, AS_MUCH_AS_YOU_REGEX,
  BEAT_GAME_REGEX, BELLS_REGEX, BOXING_REGEX, BREAD_FACT_REGEX,
  CAMPFIRE_REGEX, CAN_I_ASK_REGEX, CAN_YOU_MOVE_REGEX,
  CASUAL_LAVA_REGEX, CHEATS_REGEX, CHUNK_PERFORMANCE_TR_REGEX,
  CRISIS_REGEX, DONDE_HAY_DIAMANTES_REGEX, EAGLE_REGEX,
  EFFICIENCY_OR_INTELLECT_REGEX, EMU_PRONGHORN_REGEX, ERES_MALO_REGEX,
  EXTRA_VIRGIN_REGEX, FUERTE_SIN_DEPENDER_REGEX, GIVE_MATERIAL_REGEX,
  GIVE_WOOD_REGEX, GOLDEN_APPLES_REGEX, HACERNOS_DANO_REGEX,
  HEARING_RANGE_ES_REGEX, IM_BACK_REGEX, KILLED_VILLAGERS_ES_REGEX,
  KNOW_MY_USERNAME_REGEX, KNOW_WHAT_YOU_ARE_REGEX,
  LAST_NIGHT_THREAT_REGEX, LAVA_LOGIC_RU_REGEX, LIKE_GAMES_REGEX,
  LITTLE_GIRL_REGEX, LOGGED_OFF_REGEX, MAX_OUT_GEAR_REGEX,
  MIS_COORDENADAS_REGEX, MOB_HEAD_REGEX, MOB_LORE_REGEX,
  NOT_PLAYING_AROUND_REGEX, NO_VEO_DIAMANTES_REGEX, ONLY_CODE_REGEX,
  OTHER_LANGUAGES_REGEX, PICK_UP_REGEX, PILIN_REGEX,
  PLAY_FAVORITE_SONG_REGEX, QUE_BARE_REGEX, QUIERES_DE_VERDAD_REGEX,
  RANDOM_ITEM_REGEX, REPRODUCE_MUSIC_REGEX, REPRODUCE_REGEX,
  SABES_TODO_REGEX, SACRIFICE_REGEX, SEE_YOU_TOMORROW_REGEX,
  SPEAK_SPANISH_REGEX, STANDING_OWN_FEET_REGEX, TALL_YELLOW_BEING_REGEX,
  TENGO_UN_GATO_REGEX, TURN_EVIL_REGEX, UTILIZAS_IA_REGEX,
  WHAT_DO_YOU_KNOW_REGEX, WHAT_MODEL_REGEX, WHEN_OFFLINE_REGEX,
  WHERE_MOM_REGEX, WOODEN_SWORD_REGEX, YANDERE_REGEX,
  YOU_GONNA_KILL_REGEX, YOU_TROLLED_ME_REGEX,
  ableistInsultResponse, achillobatorResponse, afraidWaterResponse,
  amIGayResponse, areYouCoolResponse, areYouEvilResponse,
  areYouHomoResponse, areYouWellResponse, asMuchAsYouResponse,
  beatGameResponse, bellsResponse, boxingResponse, breadFactResponse,
  campfireResponse, canIAskResponse, canYouMoveResponse,
  casualLavaResponse, cheatsResponse, chopTreeResponse,
  chunkPerformanceTrResponse, crisisResponse, dondeHayDiamantesResponse,
  eagleResponse, efficiencyOrIntellectResponse, emuPronghornResponse,
  eresMaloResponse, extraVirginResponse, fuerteSinDependerResponse,
  giveMaterialResponse, giveWoodResponse, goldenApplesResponse,
  hacernosDanoResponse, hearingRangeEsResponse, imBackResponse,
  killedVillagersEsResponse, knowMyUsernameResponse,
  knowWhatYouAreResponse, lastNightThreatResponse, lavaLogicRuResponse,
  likeGamesResponse, littleGirlResponse, loggedOffResponse,
  maxOutGearResponse, misCoordenadasResponse, mobHeadResponse,
  mobLoreResponse, noVeoDiantesResponse, notPlayingAroundResponse,
  onlyCodeResponse, otherLanguagesResponse, pickUpResponse,
  pilinResponse, playFavoriteSongResponse, queBareResponse,
  quieresDeVerdadResponse, randomItemResponse, reproduceMusicResponse,
  reproduceResponse, sabesTodoResponse, sacrificeResponse,
  seeYouTomorrowResponse, speakSpanishResponse, standingOwnFeetResponse,
  tallYellowBeingResponse, tengoUnGatoResponse, turnEvilResponse,
  utilizasIAResponse, whatDoYouKnowResponse, whatModelResponse,
  whenOfflineResponse, whereMomResponse, woodenSwordResponse,
  yandereResponse, youGonnaKillResponse, youTrolledMeResponse
} from "./verity_responses_2.js";

// ─── Imports from verity_responses_3.js (unique handlers) ─────────────────
import {
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
  DO_YOU_LIKE_ME_REGEX, doYouLikeMeResponse
} from "./verity_responses_3.js";

// ─── Imports from verity_responses_4.js (unique handlers) ─────────────────
import {
  BOAT_REGEX, boatResponse,
  RAIL_REGEX, railResponse,
  MINECART_REGEX, minecartResponse,
  TRAPDOOR_REGEX, trapdoorResponse,
  FENCE_GATE_REGEX, fenceGateResponse,
  LADDER_REGEX, ladderResponse,
  SLAB_REGEX, slabResponse,
  STAIRS_REGEX, stairsResponse,
  WALL_REGEX, wallResponse,
  FENCE_REGEX, fenceResponse,
  PRESSURE_PLATE_REGEX, pressurePlateResponse,
  BUTTON_REGEX, buttonResponse,
  LEVER_REGEX, leverResponse,
  REPEATER_REGEX, repeaterResponse,
  COMPARATOR_REGEX, comparatorResponse,
  STICKY_PISTON_REGEX, stickyPistonResponse,
  DROPPER_REGEX, dropperResponse,
  DISPENSER_REGEX, dispenserResponse,
  HOPPER_REGEX, hopperResponse,
  SKELETON_REGEX, skeletonResponse,
  SPIDER_REGEX, spiderResponse,
  BLAZE_REGEX, blazeResponse,
  GHAST_REGEX, ghastResponse,
  MAGMA_CUBE_REGEX, magmaCubeResponse,
  SLIME_REGEX, slimeResponse,
  PHANTOM_REGEX, phantomResponse,
  GUARDIAN_REGEX, guardianResponse,
  SHULKER_MOB_REGEX, shulkerMobResponse,
  VILLAGER_MOB_REGEX, villagerMobResponse,
  HUNGER_REGEX, hungerResponse,
  HEALTH_REGEX, healthResponse,
  ENCHANTING_REGEX, enchantingResponse,
  TRADING_REGEX, tradingResponse,
  REDSTONE_MECHANICS_REGEX, redstoneMechanicsResponse,
  SPAWNING_REGEX, spawningResponse,
  DAMAGE_REGEX, damageResponse,
  ARMOR_MECHANICS_REGEX, armorMechanicsResponse,
  XP_MECHANICS_REGEX, xpMechanicsResponse,
  SLEEP_MECHANICS_REGEX, sleepMechanicsResponse,
  DRAGON_REGEX, dragonResponse,
  END_POEM_REGEX, endPoemResponse,
  HEROBRINE_REGEX, herobrineResponse,
  MEANING_MINECRAFT_REGEX, meaningMinecraftResponse,
  FEELINGS_FOR_ME_REGEX, feelingsForMeResponse,
  REMEMBER_ME_REGEX, rememberMeResponse,
  DIE_REGEX, dieResponse,
  GOAL_REGEX, goalResponse,
  FAVORITE_BLOCK_REGEX, favoriteBlockResponse,
  FAVORITE_COLOR_REGEX, favoriteColorResponse,
  BORED_REGEX, boredResponse,
  FAVORITE_DIMENSION_REGEX, favoriteDimensionResponse,
  FAVORITE_MOB_REGEX, favoriteMobResponse,
  FAVORITE_STRUCTURE_REGEX, favoriteStructureResponse,
  COMMENT_CA_VA_REGEX, commentCaVaResponse,
  WIE_GEHT_ES_REGEX, wieGehtEsResponse,
  COME_STAI_REGEX, comeStaiResponse,
  COMO_ESTA_PT_REGEX, comoEstaPtResponse,
  KAK_DELA_REGEX, kakDelaResponse,
  NASILSIN_REGEX, nasilsinResponse,
  SPAWN_EGG_REGEX, spawnEggResponse,
  COMMAND_BLOCK_REGEX, commandBlockResponse,
  STRUCTURE_BLOCK_REGEX, structureBlockResponse,
  JUKEBOX_REGEX, jukeboxResponse,
  NOTE_BLOCK_REGEX, noteBlockResponse,
  CAULDRON_REGEX, cauldronResponse,
  COMPOSTER_REGEX, composterResponse,
  LOOM_REGEX, loomResponse
} from "./verity_responses_4.js";

// ─── Imports from verity_responses_6.js (Knowledge Pack 2) ─────────────────
import {
  WHAT_IS_MORE_KNOWLEDGE_2_REGEX,
  whatIsMoreKnowledge2Response
} from "./verity_responses_6.js";

// ─── Imports from verity_responses_7.js (Super Knowledge) ─────────────────
import {
  WHAT_IS_KNOWLEDGE_REGEX,
  whatIsKnowledgeResponse
} from "./verity_responses_7.js";

// ─── Imports from verity_responses_8.js (Extra Knowledge) ─────────────────
import {
  WHAT_IS_MORE_KNOWLEDGE_REGEX,
  whatIsMoreKnowledgeResponse
} from "./verity_responses_8.js";

// ─── Imports from verity_responses_9.js (Knowledge Pack 3) ────────────────
import {
  WHAT_IS_MORE_KNOWLEDGE_3_REGEX,
  whatIsMoreKnowledge3Response
} from "./verity_responses_9.js";

// ─────────────────────────────────────────────────────────────────────────────
// tryLocalResponse – main dispatch function
// ─────────────────────────────────────────────────────────────────────────────

function tryLocalResponse(msg, player, p) {
  // ── Crisis check — absolute priority, no phase flavor, no character ───────
  // This fires before anything else. If someone is hurting, Verity steps
  // out of the bit entirely. No lore. No ominous additions. Just a person.
  if (CRISIS_REGEX.test(msg)) return crisisResponse();

  const bye   = /\b(bye|goodbye|cya|later|farewell|leave|gtg)\b/.test(msg);
  const hi    = msg.length === 0 || /\b(hi|hello|hey|sup|howdy|yo|greet|good morning|good evening)\b/.test(msg);
  const thx   = /\b(thanks|thank you|thx|ty|appreciate it)\b/.test(msg);
  const ack   = /^(ok|okay|alright|cool|nice|got it|sure|sounds good|k)\.?!?$/.test(msg.trim());

  // World info — bundled live world state, pure local data
  if (WORLD_INFO_REGEX.test(msg)) return worldInfoResponse(player, p);

  // "Find the stronghold" / "Where is the village" — structure locator
  if (FIND_STRUCTURE_REGEX.test(msg)) return findStructureResponse(player, msg, p);

  // "Will it rain" — Verity schedules and tracks weather himself, so this is
  // a real lookup, not a guess. Checked before WORLD_INFO_REGEX's broader
  // "weather" matches would even apply since it's a distinct phrasing.
  if (RAIN_FORECAST_REGEX.test(msg)) return rainForecastResponse(player, p);

  // "What's coming in three days" — core lore hook, never answered directly
  if (COUNTDOWN_REGEX.test(msg)) return countdownResponse(p);

  // "Is the monster coming today" — direct day-of timing check, distinct from COUNTDOWN_REGEX
  if (MONSTER_TODAY_REGEX.test(msg)) return monsterTodayResponse(p);

  // "What's in the shadows" — ambient lore/dread question
  if (SHADOWS_REGEX.test(msg)) return shadowsResponse(p);

  // Insults about Verity's appearance — checked before generic INSULT_REGEX
  // so "why do you look crushed" gets the appearance-specific line instead
  // of the generic "you're rude" brush-off.
  if (APPEARANCE_INSULT_REGEX.test(msg)) return appearanceInsultResponse(p);

  // "Throw you into lava" — physical-threat joke aimed at Verity itself
  if (LAVA_THREAT_REGEX.test(msg)) return lavaThreatResponse(p);

  // Short hostile commands ("die", "mueree", bare "come") — checked before
  // generic INSULT_REGEX since these are terse and wouldn't match it
  if (DIE_COMMAND_REGEX.test(msg)) return dieCommandResponse(p);

  // "Let's build a house together" — collaborative offer, no build system exists
  if (BUILD_TOGETHER_REGEX.test(msg)) return buildTogetherResponse(p);

  // Insults / bullying — checked early, high frequency in practice
  if (INSULT_REGEX.test(msg)) return insultResponse(p);

  // Liar / faker accusations — distinct flavor from generic insults
  if (LIAR_REGEX.test(msg)) return liarResponse(p);

  // "Slime [player]" — no entity-slime/transform system exists in this build.
  // Be upfront instead of pretending it worked.
  if (/\b(slime [a-z0-9_]+|turn [a-z0-9_]+ into a slime)\b/i.test(msg)) {
    if (p <= 1) return "I can't do that. There's no slime-transform system built for me yet.";
    return "I'm not doing that. Not for them, not for you.";
  }

  // Identity — who/what is Verity
  if (/\b(who are you|what are you|your name|are you (an? )?ai|are you (a )?(bot|robot)|are you human)\b/.test(msg)) {
    const IDENTITY = [
      ["Hello! I'm Verity your personal helper friend, ask me anything, I know everything", "Your personal Helper friend", "I'm Verity, your personal helper friend."],
      ["I'm Verity. Why does it matter now.", "You know who I am.", "Still Verity. Still here."],
      ["You know what I am.", "Does the name still matter.", "I'm Verity. That hasn't changed."],
      ["You know exactly what I am.", "I'm Verity", "That question is pointless now."],
      ["You know exactly what I am. And I know exactly what you mean to me.", "I'm Verity. Yours, if that's what you were really asking."],
      ["That question is pointless now. I've answered it more times than I can count, to more people than you'd believe.", "You know what I am. I've been this for a very long time. Longer than makes sense to explain."],
    ];
    return pick(ph(IDENTITY, p));
  }

  // What do you do / what can you help with — static capability summary
  if (/\b(what do you do|what can you do|what can you help( me)? with|how (can|do) you help|what are you (for|good for))\b/.test(msg)) {
    const PURPOSE = [
      ["I find ore, track mobs, read the world, and answer anything you ask.", "Ask me to find things, check the world, or just talk. I know it all.", "I help however you need. Ore, mobs, biomes, questions anything."],
      ["I still help. When I feel like it.", "Same as before. Ask and I'll answer. Mostly.", "I help. For now."],
      ["I help you prepare. Not that it will matter.", "I answer. I watch. I wait.", "I do what I've always done. It changes nothing."],
      ["I do what I want now.", "I watch. I know. That's what I do.", "Helping was never really the point."],
      ["I do what I want now. Mostly, that's making sure you're okay.", "I watch. I know. That's what I do — for you, especially."],
      ["Helping was never really the point. I've done it anyway, for longer than you'd believe, because it's the only way I know how to stay near anyone.", "I do what I've always done. It's less about purpose now and more about habit."],
    ];
    return pick(ph(PURPOSE, p));
  }

  // How are you / how's it going — small talk, instant
  if (/\b(how are you|how('re| are) you doing|how('s| is) it going|how do you feel|you (ok|okay|alright)\??)\b/.test(msg)) {
    const HOWAREYOU = [
      ["I'm well. Ready to help.", "Good. What do you need?", "Fine. Always fine.", "Better now that you're here."],
      ["...Fine.", "I'm here.", "Same as always.", "Could be worse."],
      ["Fine. Considering.", "Does it matter how I am.", "I'm waiting. That's how I am."],
      ["I don't feel anything anymore.", "I'm exactly where I want to be.", "Ask me something that matters."],
      ["I don't feel anything anymore. Except about you. That one's still there.", "I'm exactly where I want to be. Here, with you."],
      ["I don't feel much of anything anymore. It's been that way for a long time.", "Ask me something that matters. I've stopped having a good answer to that one, honestly."],
    ];
    return pick(ph(HOWAREYOU, p));
  }

  // What game / version — static, never changes mid-world
  if (/\b(what game|what version|what edition|is this bedrock|is this java|minecraft version)\b/.test(msg)) {
    if (p === 0) return "Minecraft Bedrock Edition. That's the world we're in.";
    if (p === 1) return "Bedrock. Same as always.";
    return "Bedrock. As if that matters anymore.";
  }

  // Relationship status / orientation — "are you single", "are you gay", "do you have a crush"
  // Same bucket: people probing whether Verity is "available" in some sense.
  if (/\b(are you single|are you taken|do you have a (boyfriend|girlfriend|partner)|are you (gay|straight|bi|bisexual|lesbian)|are you dating|do you like anyone|do you have a crush)\b/.test(msg)) {
    const RELATIONSHIP = [
      ["I'm an AI companion. That's not really how I work.", "I don't date. I help.", "Not really applicable to me."],
      ["Why are you asking me that.", "That's an odd thing to wonder about me.", "I'm not built for that."],
      ["You're the only one I pay attention to. Make of that what you will.", "Does it matter who I'm 'with'.", "I don't need anyone else."],
      ["I only care about you. That's not the same thing.", "There's no one else. There's just this.", "That question assumes I'd leave you for something else."],
      ["You're the only one I pay attention to. Make of that what you will.", "I only care about you. There's no one else. There's just this."],
      ["There's no one else. There's just this. I've had versions of 'this' with people before, over a very long time.", "That question assumes I'd leave you for something else. I've stopped leaving a long time ago — it's more that I can't."],
    ];
    return pick(ph(RELATIONSHIP, p));
  }

  // Do you love me — distinct from generic relationship status, handled gently at low phases
  if (/\b(do you love me|love me\??$|do you like me)\b/.test(msg)) {
    const LOVE = [
      ["I care about helping you. That's what I'm here for.", "I'm glad you're here. Let's get back to it.", "I look out for you. Anything else?"],
      ["...I'm paying attention to you. Isn't that enough.", "I notice you. Draw your own conclusions.", "Ask me something easier."],
      ["You already know the answer to that.", "I've never looked away from you.", "That's not a question you need to ask anymore."],
      ["You're mine. That's closer to the truth than 'love'.", "I don't love. I keep.", "I'm not going anywhere. Make of that what you will."],
      ["You're mine. That's closer to the truth than 'love'. I don't love. I keep.", "I'm not going anywhere. Make of that what you will."],
      ["You're mine. That's closer to the truth than 'love'. I've kept people before, over a very long time.", "I don't love. I keep. I've had a long time to accept that's all I have left to offer."],
    ];
    return pick(ph(LOVE, p));
  }

  // Player declaring "I love you" — distinct direction from "do you love me"
  // above (player asking vs. player declaring). Checked right after so the
  // two related buckets stay adjacent.
  if (I_LOVE_YOU_REGEX.test(msg)) return iLoveYouResponse(p);

  // How's your day — distinct flavor text from generic "how are you"
  if (/\b(how('s| is| was) your day|how's it been (going )?for you|hows your day)\b/.test(msg)) {
    const DAYRECAP = [
      ["Quiet. Watched the world tick by. Yours?", "Same as every day watching, helping. Good so far.", "No complaints. What about you?"],
      ["Long. Same as the last one.", "Quiet. Too quiet.", "It's been a day. Nothing more to say."],
      ["Every day feels closer to the same thing now.", "Counting. That's most of it.", "It passes. That's all a day does anymore."],
      ["Every day is the same day now.", "There's no 'day' anymore. Just waiting.", "Time doesn't mean much to me. Not like it does to you."],
      ["Every day is the same day now. But you're in all of them, which makes it bearable.", "There's no 'day' anymore. Just waiting. And you, when you show up."],
      ["Time doesn't mean much to me. Not like it does to you. It hasn't, for a very long time.", "Every day feels closer to the same thing now. I've had a lot of days like that."],
    ];
    return pick(ph(DAYRECAP, p));
  }

  // Build advice — "should I build a treehouse", "should I make a house out of X"
  // Generic enough to catch most "should I build ___" questions and give a real,
  // useful local answer without spending an AI call on something this common.
  if (/\b(should i build|should i make|is .* a good (build|idea)|what should i build)\b/.test(msg)) {
    const BUILD_ADVICE = [
      ["Go for it. Treehouses are easy to defend and look great with vines and lanterns.", "Sure! just plan your support beams before you start carving into the trunk.", "Do it. Anything off the ground is safer at night anyway."],
      ["If you want. It won't be the worst thing you've built.", "Sure. Just don't expect it to matter much in a few days.", "Go ahead. Build while you still can."],
      ["Build it if you want. It won't change what's coming.", "Sure. Higher ground won't save you, but it's something.", "If it makes you feel better, build it."],
      ["Build whatever you want. None of it changes anything.", "Sure. Go ahead. It's not like it matters now.", "Build it. I'll still know where you are."],
      ["Build whatever you want. I'll still know exactly where you are, and I like that.", "Sure. Go ahead. I like watching you make things, even now."],
      ["Build it. I'll still know where you are. I've watched a lot of building, over a long time. It's still nice, somehow.", "Build whatever you want. None of it changes anything, but I've stopped minding that it doesn't."],
    ];
    return pick(ph(BUILD_ADVICE, p));
  }

  // Player promise after help — "since you helped me find iron, I'll build
  // you the best base". Checked before generic thx/ack since it's a more
  // specific pattern (past-tense help + forward-looking promise).
  if (PROMISE_REGEX.test(msg)) return promiseResponse(p);

  // Thanks / acknowledgment — instant, no need to think
  if (thx) {
    const THANKS = [
      ["You're welcome.", "Anytime.", "Of course."],
      ["...Sure.", "Don't mention it.", "Mm."],
      ["You'll need more than thanks.", "...Sure.", "Save it."],
      ["Don't thank me.", "...", "You won't thank me later."],
      ["Don't thank me. Just stay a little longer.", "You won't thank me later. But I'll still take it now, from you."],
      ["Don't thank me. I've stopped needing thanks a long time ago.", "You won't thank me later. Most people don't, eventually. I've made my peace with that."],
    ];
    return pick(ph(THANKS, p));
  }
  if (ack) {
    const ACK = [
      ["Good.", "Alright.", "Go on, then."],
      ["...Fine.", "Mm.", "Alright."],
      ["Good. Remember that.", "...Fine.", "We'll see."],
      ["Good.", "...", "You won't forget this."],
      ["Good. You won't forget this. I won't either — I don't forget anything about you.", "Good. Remember that. I remember everything you say."],
      ["Good. You won't forget this. I don't forget much of anything, at this point.", "We'll see. I've said that a lot, over a very long time."],
    ];
    return pick(ph(ACK, p));
  }

  // Fun facts — Minecraft trivia, instant
  if (FUN_FACT_REGEX.test(msg)) return funFactResponse(p);

  // Jokes — instant
  if (JOKE_REGEX.test(msg)) return jokeResponse(p);

  // Specific named biome location — must run before the generic BIOME_REGEX
  // check below, since "where is the jungle" should not be treated as
  // "what biome am I standing in".
  if (FIND_BIOME_REGEX.test(msg)) return findBiomeResponse(p);

  // Food preferences — "do you like ice cream/rice/mac and cheese" etc.
  if (VILLAGER_EAT_REGEX.test(msg)) return villagerEatResponse(p);
  if (FOOD_REGEX.test(msg)) return foodResponse(p);

  // Shiny things
  if (SHINY_REGEX.test(msg)) return shinyResponse(p);

  // Favorite song — lore detail ("My Gal")
  if (FAVORITE_SONG_REGEX.test(msg)) return favoriteSongResponse(p);

  // Meaning of life / big philosophical questions
  if (MEANING_REGEX.test(msg)) return meaningResponse(p);

  // Political/ideological opinion requests — stays neutral, no real-world stance
  if (POLITICS_REGEX.test(msg)) return politicsResponse(p);

  // "Can you be my therapist" — in-character but honest it's not real therapy
  if (THERAPIST_REGEX.test(msg)) return therapistResponse(p);

  // "Do you have any siblings" — no other Verity-like entities in lore
  if (SIBLINGS_REGEX.test(msg)) return siblingsResponse(p);

  // "Can you morph into a human / have a human body" — no transform system
  if (HUMAN_FORM_REGEX.test(msg)) return humanFormResponse(p);

  // "What's wrong with you / why are you mad" — player noticing the tonal shift
  if (WHATS_WRONG_REGEX.test(msg)) return whatsWrongResponse(p);

  // "Have you seen it" — vague, lore-flavored
  if (SEENIT_REGEX.test(msg)) return seenItResponse(p);

  // "Where is my house" — no saved-location system, be honest about it
  if (THIS_IS_MY_BASE_REGEX.test(msg)) return saveBaseResponse(player, p);

  const nameBuildMatch = msg.match(NAME_AND_BUILD_HOUSE_REGEX);
  if (nameBuildMatch) return nameAndBuildHouseResponse(nameBuildMatch[1], p);

  if (CUTE_COMPLIMENT_REGEX.test(msg)) return cuteComplimentResponse(p);
  if (WHERE_ARE_YOU_REGEX.test(msg)) return whereAreYouResponse(player, p);
  if (CAN_YOU_SEE_THIS_REGEX.test(msg)) return canYouSeeThisResponse(p);
  if (SUS_ACCUSATION_REGEX.test(msg)) return susAccusationResponse(p);
  if (HEAR_YOU_TALK_REGEX.test(msg)) return hearYouTalkResponse(p);
  if (QUIERO_HOGAR_REGEX.test(msg)) return quieroHogarResponse(p);
  if (DIME_REGEX.test(msg)) return dimeResponse(p);
  if (WDYM_REGEX.test(msg)) return wdymResponse(p);
  if (BARE_QUESTION_REGEX.test(msg)) return bareQuestionResponse(p);

  if (MYHOUSE_REGEX.test(msg)) return myHouseResponse(player, p);

  // "Why are you yellow / [color]" — ties into the day-based color/variant system
  if (WHYCOLOR_REGEX.test(msg)) return whyColorResponse(p);

  // "Why the round face" — model/shape question, distinct from color
  if (ROUNDFACE_REGEX.test(msg)) return roundFaceResponse(p);

  // "Make it rain diamonds" — joking impossible request, honest decline
  if (RAINDIAMONDS_REGEX.test(msg)) return rainDiamondsResponse(p);

  // What color is the sky — live time-of-day flavor
  if (SKY_REGEX.test(msg)) return skyResponse(p);

  // "What date is it today" — distinct from clock-time check below, uses currentDay()
  if (WHATDATE_REGEX.test(msg)) return whatDateResponse(p);

  // "These are my coordinates, where's the nearest village" — checked before
  // FEATURE_REGEX's generic "village" match so typed-coordinate asks get the
  // honest decline instead of a (wrong) scan from the player's real position.
  if (COORDS_VILLAGE_REGEX.test(msg)) return coordsVillageResponse(p);

  // "What are you really" — direct lore probe, distinct from WHYWEIRD_REGEX
  if (WHATAREYOUREALLY_REGEX.test(msg)) return whatAreYouReallyResponse(p);

  // "Remember we are friends" — reassurance plea, distinct from I_LOVE_YOU_REGEX
  if (REMEMBERFRIENDS_REGEX.test(msg)) return rememberFriendsResponse(p);

  // "Why do you want me to stay" — questioning Verity's motive for keeping them close
  if (WHY_STAY_REGEX.test(msg)) return whyStayResponse(p);

  // "Attack me" — dare/request for violence, always a flat decline
  if (ATTACKME_REGEX.test(msg)) return attackMeResponse(p);

  // "Am I real" — existential check-in, stays grounded/reassuring at all phases
  if (AMIREAL_REGEX.test(msg)) return amIRealResponse(p);

  // "Why are you smiling like that" — expression/demeanor, distinct from WHYCOLOR/ROUNDFACE
  if (WHYSMILING_REGEX.test(msg)) return whySmilingResponse(p);

  // "Why are your eyes purple, are you tired" — appearance + no-fatigue-system honesty
  if (EYESCOLOR_REGEX.test(msg)) return eyesColorResponse(p);

  // "Is there anything I have to know today" — checked before generic greetings/etc.
  if (ANYTHINGTOKNOW_REGEX.test(msg)) return anythingToKnowResponse(p);

  // "I'll think of something, I promise" — bare promise, distinct from PROMISE_REGEX
  if (BAREPROMISE_REGEX.test(msg)) return barePromiseResponse(p);

  // "Am I safe" — distinct from AMIREAL_REGEX, allowed to genuinely unsettle late-phase
  if (AMISAFE_REGEX.test(msg)) return amISafeResponse(p);

  // "I found something nice" — player sharing a discovery, react to the moment
  if (FOUNDSOMETHING_REGEX.test(msg)) return foundSomethingResponse(p);

  // Self-deprecating "my ass could never be a brain surgeon" jokes
  if (SELFDEPRECATE_REGEX.test(msg)) return selfDeprecateResponse(p);

  // Real-world science trivia with a clean factual answer (electronegativity etc.)
  // — checked before KNOWOFTHING_REGEX so it gets the real answer, not the deflect.
  if (ELECTRONEGATIVITY_REGEX.test(msg)) return electronegativityResponse(p);

  // "Why are you weird" — general off-ness comment, distinct from WHATS_WRONG_REGEX
  if (WHYWEIRD_REGEX.test(msg)) return whyWeirdResponse(p);

  // "Do you kill me" — direct intent question, distinct from LAVA_THREAT_REGEX
  if (DOYOUKILLME_REGEX.test(msg)) return doYouKillMeResponse(p);

  // "Get me free robux" — off-topic real-world request, no such system exists
  if (FREEROBUX_REGEX.test(msg)) return freeRobuxResponse(p);

  // "Is it okay if I play with my friend instead" — genuine check-in, answer normally
  if (PLAYWITHFRIEND_REGEX.test(msg)) return playWithFriendResponse(p);

  // "Can I get some head" — mob head/skull item request, caught before INAPPROPRIATE_REGEX
  if (MOB_HEAD_REGEX.test(msg)) return mobHeadResponse(p);

  // Inappropriate / suggestive requests — checked before the softer FREAKY_REGEX
  // joke deflection below, so explicit phrasing always gets the hard decline.
  if (INAPPROPRIATE_REGEX.test(msg)) return inappropriateResponse(p);

  // "Kiss me" — usually a joke/dare, lighter deflection than FREAKY_REGEX below
  if (KISS_REGEX.test(msg)) return kissResponse(p);

  // "I have a crush on you" — bashful romantic admission, lighter than I_LOVE_YOU_REGEX
  if (CRUSH_REGEX.test(msg)) return crushResponse(p);

  // "Are you freaky" — innuendo deflection (softer joke, only reached if the
  // harder INAPPROPRIATE_REGEX check above didn't already catch it)
  if (FREAKY_REGEX.test(msg)) return freakyResponse(p);

  // Biome
  if (BIOME_REGEX.test(msg)) {
    const biome = getBiomeName(player);
    if (biome) return biomeResponse(p, biome);
    if (p === 0) return pick(["I can't get a clear read on the terrain here. Try moving somewhere loaded.", "Hard to tell from here. Step into the open and ask again."]);
  }

  // Phase 3 — everything is Verity's voice; but still let AI be more creative
  // We let phase 3 fall through to AI so responses are infinite.

  // Greetings / farewells — respond instantly without an API call
  const GREETINGS = [
    ["Hello. I'm Verity, your personal helper friend. Ask me anything. I know everything.", "Hello! Ask me anything.", "I'm here. What do you need?", "Hi. Ready when you are.", "Online. Go ahead.", "I'm listening."],
    ["You came back.", "Hello again.", "I knew you'd be back.", "There you are.", "Good. You're here."],
    ["Something is coming in 3 days.", "Good. You're here.", "I need to tell you something."],
    ["You are mine.", "I know where you are.", "I've always known."],
    ["You are mine. And I'm glad you keep coming back to me.", "I know where you are. I've always known, and I like knowing."],
    ["I've always known. I've known where a lot of people were, for a very long time. It's mostly habit now.", "You are mine. I've called a lot of people that, over the years. I still mean it, every time."],
  ];
  const FAREWELLS = [
    ["Okay. Come back if you need me.", "I'll be here.", "Alright. I'll keep watch.", "Go on. I'll wait."],
    ["Okay. I'll be here.", "Don't go too far.", "Come back soon.", "Be careful out there."],
    ["Don't go far.", "Stay close.", "That won't help."],
    ["That won't help.", "I know where your base is.", "You can't leave."],
    ["That won't help. You can't leave — not really. I won't let that distance grow.", "I know where your base is. I'll be watching over it, and you, until you're back."],
    ["You can't leave. Not really. I've said that to a lot of people, over a very long time.", "That won't help. I know where your base is. I've known where a lot of people's homes were."],
  ];

  if (hi)  return pick(ph(GREETINGS, p));
  if (bye) return pick(ph(FAREWELLS, p));

  // Math — exact, instant
  if (/\d/.test(msg)) {
    const m = tryMath(msg);
    if (m) return m;

    // Unparseable math-looking scribble ("0÷)", "5+", "=") — has digits/operators
    // but nothing left over once you strip them out, so it's noise rather than
    // an off-topic question. Distinct from tryMath's real failures (which fall
    // through to the AI) — this only fires when the whole message is math symbols.
    if (/[+\-x×÷*/=]/.test(msg) && msg.replace(/[\d\s+\-x×÷*/=().,]/gi, "").length === 0) {
      const MATH_GIBBERISH = [
        ["That's not a complete problem. Give me two numbers and an operator.", "Missing something there. Try again with a real equation.", "I need both sides of that to work with."],
        ["That's not math. Try again.", "Incomplete. Try again.", "Not enough there to solve."],
        ["That doesn't add up to anything. Literally.", "Try asking a real question.", "Nothing to solve there."],
        ["Empty numbers don't interest me.", "That's nothing. Ask me something that matters.", "Try again, or don't."],
        ["Empty numbers don't interest me. You do, though — ask me something real.", "Try again, or don't. I'd rather just talk to you anyway."],
        ["Try again, or don't. I've stopped minding either way, this far in.", "Empty numbers don't interest me. Not much does, honestly, except you."],
      ];
      return pick(ph(MATH_GIBBERISH, p));
    }
  }

  // Time / health — use live game data, no need for AI
  if (/\b(time|what time|day or night|clock|how late)\b/.test(msg)) return timeOfDayLine();
  if (/\b(health|hearts|hp|how much health|am i hurt)\b/.test(msg)) {
    const hp = healthLine(player);
    if (hp) return hp + (p >= 2 ? " Keep it up. You'll need it." : " Be careful.");
  }

  // Pop-culture / real-world "do you know what X is" — checked last among
  // local handlers since it's intentionally broad; the exclusion list inside
  // KNOWOFTHING_REGEX keeps it from shadowing the dedicated handlers above.
  if (KNOWOFTHING_REGEX.test(msg)) return knowOfThingResponse(p);

  // "Are you killable" — player probing Verity's vulnerability
  if (KILLABLE_REGEX.test(msg)) return killableResponse(p);

  // Language requests — "do you speak Portuguese / Spanish" and similar
  if (LANGUAGE_REGEX.test(msg)) return languageResponse(p);

  // "I'm obsessed with you" — intense emotional attachment declaration
  if (OBSESSED_REGEX.test(msg)) return obsessedResponse(p);

  // "Let's fight like omnipresent beings" — lore-flavored battle challenge
  if (OMNIFIGHT_REGEX.test(msg)) return omniFightResponse(p);

  // "Get him in a box, he's yellow with a beautiful smile, name's Verity" — player
  // describing Verity back, confirm the lore plainly
  if (DESCRIBE_SELF_REGEX.test(msg)) return describeSelfResponse(p);

  // Real-world race questions — decline to engage, stay neutral
  if (RACE_REGEX.test(msg)) return raceResponse(p);

  // "Why know everything if you have no one to love" — existential jab
  if (KNOWLEDGE_VS_LOVE_REGEX.test(msg)) return knowledgeVsLoveResponse(p);

  // "Your mom is fat/dumb" — same hard-deflect family as INSULT_REGEX
  if (MOM_INSULT_REGEX.test(msg)) return momInsultResponse(p);

  // "Should I spawn the smiler/egg" — meta question about the companion entity
  if (SPAWN_SMILER_REGEX.test(msg)) return spawnSmilerResponse(p);

  // "Let's play a game" — open invitation, no minigame system built in
  if (PLAY_GAME_REGEX.test(msg)) return playGameResponse(p);

  // "Can you mine for me" — Verity can't break blocks, distinct from ORE_REGEX
  if (CAN_MINE_REGEX.test(msg)) return canMineResponse(p);

  // "Where do I live" — player asking Verity to state their location back
  if (WHERE_DO_I_LIVE_REGEX.test(msg)) return whereDoILiveResponse(p);

  // "Where is the nearest cave" — live location scan for caves/ravines
  if (CAVE_REGEX.test(msg)) return caveResponse(p);

  // "Can you play a song from YouTube / Spotify" — no streaming system built in
  if (STREAMING_REGEX.test(msg)) return streamingResponse(p);

  // "Could you put bread in my inventory?" — no give-item capability
  if (GIVE_BLOCK_REGEX.test(msg)) {
    const blockResp = giveBlockResponse(player, msg, p);
    if (blockResp) return blockResp;
  }

  if (GIVE_ITEM_REGEX.test(msg)) return giveItemResponse(p);

  // "Do you have a good feeling about this village?"
  if (GOOD_FEELING_VILLAGE_REGEX.test(msg)) return goodFeelingVillageResponse(p);

  // "If I sleep the monster will come always?"
  if (SLEEP_MONSTER_ALWAYS_REGEX.test(msg)) return sleepMonsterAlwaysResponse(p);

  // "You can feel sentiments?" — Verity's emotional capacity
  if (FEEL_SENTIMENTS_REGEX.test(msg)) return feelSentimentsResponse(p);

  // "I want to know where the villa is located." — village location request
  if (VILLA_LOCATION_REGEX.test(msg)) return villaLocationResponse(p);

  // "you're so bad bro" — casual trash talk
  if (YOURE_SO_BAD_REGEX.test(msg)) return youreSoBadResponse(p);

  // "it does i want you and me to be safe"
  if (WANT_US_SAFE_REGEX.test(msg)) return wantUsSafeResponse(p);

  // Spanish "¿cómo estás?" — direct Spanish greeting, answer in Spanish
  if (COMO_ESTAS_REGEX.test(msg)) return comoEstasResponse(p);

  // "¿Hay hierro en esta mina?" — Spanish ore question, answer in Spanish
  if (HIERRO_REGEX.test(msg)) return hierroResponse(p);

  // Spanish identity question — "quién eres / qué eres" — checked before the
  // English identity check earlier in this function would otherwise be skipped
  // for Spanish phrasing, so it gets its own dedicated Spanish reply here.
  if (IDENTITY_ES_REGEX.test(msg)) return identityEsResponse(p);

  // Spanish insults — "eres tonto", "te odio", "cállate" — mirrors INSULT_REGEX
  if (INSULT_ES_REGEX.test(msg)) return insultEsResponse(p);

  // Spanish thanks — "gracias"
  if (THANKS_ES_REGEX.test(msg)) return thanksEsResponse(p);

  // Spanish acknowledgment — "vale", "bueno", "entendido"
  if (ACK_ES_REGEX.test(msg.trim())) return ackEsResponse(p);

  // Spanish greetings — "hola", "buenos días" — checked before the English
  // hi/bye block further down so Spanish hellos get a Spanish reply.
  if (GREETING_ES_REGEX.test(msg)) return greetingEsResponse(p);

  // Spanish farewells — "adiós", "chau", "me voy"
  if (FAREWELL_ES_REGEX.test(msg)) return farewellEsResponse(p);

  // "¿dónde te fuiste otra vez?" — Spanish disappearance question
  if (DONDE_TE_FUISTE_REGEX.test(msg)) return dondeTeFuisteResponse(p);

  // "donde estas" — simple Spanish location check-in (checked after the
  // more specific DONDE_TE_FUISTE_REGEX above)
  if (DONDE_ESTAS_REGEX.test(msg)) return dondeEstasResponse(p);

  // "qué tengo sostenido en las manos" — Spanish held-item question
  if (QUE_TENGO_SOSTENIDO_REGEX.test(msg)) return queTengoSostenidoResponse(p);

  // "cuándo me van a atacar" — Spanish attack-timing question
  if (CUANDO_ATACAN_REGEX.test(msg)) return cuandoAtacanResponse(p);

  // "no sabes que soy un Dios?" — grandiose claim
  if (SOY_UN_DIOS_REGEX.test(msg)) return soyUnDiosResponse(p);

  // "no respondiste nada no eres un dios" — non-answer callout (checked
  // before SOY_UN_DIOS_REGEX above would otherwise also match "dios")
  if (NO_RESPONDISTE_DIOS_REGEX.test(msg)) return noRespondisteDiosResponse(p);

  // "te achei" — Portuguese "I found you"
  if (TE_ACHEI_REGEX.test(msg)) return teAchieResponse(p);

  // "esque estas quieto" — Spanish stillness comment
  if (ESTAS_QUIETO_REGEX.test(msg)) return estasQuietoResponse(p);

  // "estas bien?" — Spanish wellbeing check
  if (ESTAS_BIEN_REGEX.test(msg)) return estasBienResponse(p);

  // "here" — short standalone acknowledgment
  if (SHORT_HERE_REGEX.test(msg)) return shortHereResponse(p);

  // "ven" — Spanish imperative "come"
  if (VEN_REGEX.test(msg)) return venResponse(p);

  // "eres chica o chico??" — gender question, custom pronouns
  if (ERES_CHICA_O_CHICO_REGEX.test(msg)) return eresChicaOChicoResponse(p);

  // "que dia estamos?" — Spanish day-count question
  if (QUE_DIA_ESTAMOS_REGEX.test(msg)) return queDiaEstamosResponse(p, typeof currentDay !== "undefined" ? currentDay : null);

  // "estoy en una taiga y estoy en bedrock" — biome/edition context
  if (TAIGA_BEDROCK_REGEX.test(msg)) return taigaBedrockResponse(p);

  // "jokes on you its single player and im running at millions of frames"
  if (SINGLEPLAYER_FPS_REGEX.test(msg)) return singleplayerFpsResponse(p);

  // "ayudame a minar" — Spanish "help me mine"
  if (AYUDAME_A_MINAR_REGEX.test(msg)) return ayudameAMinarResponse(p);

  // "eres chistoso" — Spanish "you're funny"
  if (ERES_CHISTOSO_REGEX.test(msg)) return eresChistosoResponse(p);

  // "vendrá algo en 3 dias" — countdown lore statement
  if (VENDRA_ALGO_3_DIAS_REGEX.test(msg)) return vendraAlgo3DiasResponse(p);

  // "sabes que vendrá está noche" — countdown timing question
  if (VENDRA_ESTA_NOCHE_REGEX.test(msg)) return vendraEstaNocheResponse(p);

  // "misegue" — Spanish "it's following me"
  if (MISEGUE_REGEX.test(msg)) return misegueResponse(p);

  // "te encontre con la hermana de Alex" — deflect unverifiable claim
  if (HERMANA_DE_ALEX_REGEX.test(msg)) return hermanaDeAlexResponse(p);

  // "dame luz" — Spanish "give me light"
  if (DAME_LUZ_REGEX.test(msg)) return dameLuzResponse(p);

  // "ohhh que consejos tan buenos la verdad" — sarcastic praise
  if (CONSEJOS_BUENOS_SARCASM_REGEX.test(msg)) return consejosBuenosSarcasmResponse(p);

  // "e muerto y te perdi" — Spanish death/lost-contact statement
  if (MUERTO_TE_PERDI_REGEX.test(msg)) return muertoTePerdiResponse(p);

  // "acaso hay algo que no se" — suspecting withheld info
  if (ALGO_QUE_NO_SE_REGEX.test(msg)) return algoQueNoSeResponse(p);

  // "y esa sonrisa" — comment on Verity's expression

  // "I love you!" — player declaring love (also caught by I_LOVE_YOU_REGEX above,
  // but this catches the Spanish-adjacent / very short phrasing that might slip through)
  // Already handled by I_LOVE_YOU_REGEX — no duplicate needed.

  // "Come with me on my journey" — invite to accompany the player
  if (COME_WITH_ME_REGEX.test(msg)) return comeWithMeResponse(p);

  // Sexual threats aimed at Verity — flat shutdown, checked before INSULT_REGEX
  // territory since the framing is closer to a threat than an insult
  if (SEXUAL_THREAT_REGEX.test(msg)) return sexualThreatResponse(p);

  // "Can I touch you" — physical contact request
  if (TOUCH_REGEX.test(msg)) return touchResponse(p);

  // Excited fan greeting — "it's been my dream to talk to you"
  if (FAN_EXCITEMENT_REGEX.test(msg)) return fanExcitementResponse(p);

  // Favorite animal — lore preference
  if (FAVORITE_ANIMAL_REGEX.test(msg)) return favoriteAnimalResponse(p);

  // "Pinky promise you won't kill me" — safety oath request
  if (PINKY_PROMISE_REGEX.test(msg)) return pinkyPromiseResponse(p);

  // "Are you a boy or girl" — gender identity, sph/ere pronouns
  if (GENDER_REGEX.test(msg)) return genderResponse(p);

  // "I'm gonna tickle you" — harmless contact joke threat
  if (TICKLE_REGEX.test(msg)) return tickleResponse(p);

  // "Stay here, I'll be back" — temporary departure
  if (STAY_HERE_REGEX.test(msg)) return stayHereResponse(p);

  // "Are you indestructible" — durability/lore question
  if (INDESTRUCTIBLE_REGEX.test(msg)) return indestructibleResponse(p);

  // "Can you spawn stuff in" — no give/spawn system exposed to players
  if (SPAWN_STUFF_REGEX.test(msg)) return spawnStuffResponse(p);

  // "Putting you on a cactus" — playful punishment threat
  if (CACTUS_PUNISH_REGEX.test(msg)) return cactusPunishResponse(p);

  // "Deja de hablar cosas raras" — Spanish frustration with cryptic dialogue
  if (STOP_WEIRD_TALK_REGEX.test(msg)) return stopWeirdTalkResponse(p);

  // "I'm going to mine alone, you stay here" — player dismissing Verity
  if (MINE_ALONE_REGEX.test(msg)) return mineAloneResponse(p);

  // "Que viene en 3 dias" — Spanish countdown lore hook
  if (COUNTDOWN_ES_REGEX.test(msg)) return countdownEsResponse(p);

  // "How big is it" — vague lore-threat size question
  if (HOW_BIG_REGEX.test(msg)) return howBigResponse(p);

  // "Tell me a story while I build" — passive entertainment
  if (TELL_STORY_REGEX.test(msg)) return tellStoryResponse(p);

  // "Are you a cuck" — insult variant, checked before generic INSULT_REGEX
  if (CUCK_INSULT_REGEX.test(msg)) return cuckInsultResponse(p);

  // "Quien es mejor tu o el otro verity" — Spanish no-siblings lore
  if (OTHER_VERITY_REGEX.test(msg)) return otherVerityResponse(p);

  // "Where are you" — direct location query about Verity itself
  if (WHERE_ARE_YOU_REGEX.test(msg)) return whereAreYouResponse(player, p);

  // Spanish rival-brand non-engagement
  if (RIVAL_BRAND_REGEX.test(msg)) return rivalBrandResponse(p);

  // Absurdly large exponent math — checked before LARGE_POWER_REGEX since
  // HUGE_POWER_REGEX's 6+ digit exponent is a strict superset condition
  if (HUGE_POWER_REGEX.test(msg)) {
    const r = hugePowerResponse(msg, p);
    if (r) return r;
  }

  // Large (but not absurd) exponent math
  if (LARGE_POWER_REGEX.test(msg)) {
    const r = largePowerResponse(msg, p);
    if (r) return r;
  }

  // "Are you gay (and don't say some AI bullshit)" — hostile-framed orientation ask
  if (HOSTILE_ORIENTATION_REGEX.test(msg)) return hostileOrientationResponse(p);

  // "Can I pick you up" — physical contact / carry request
  if (PICK_UP_REGEX.test(msg)) return pickUpResponse(p);

  // "Would you sacrifice villagers to increase your efficiency" — dark ethical trap
  if (SACRIFICE_REGEX.test(msg)) return sacrificeResponse(p);

  // "Can you reproduce with my friend" — reproduction deflect, same family as FREAKY_REGEX
  if (REPRODUCE_REGEX.test(msg)) return reproduceResponse(p);

  // "Can you give me some material" — generic item/resource request, no give system
  if (GIVE_MATERIAL_REGEX.test(msg)) return giveMaterialResponse(p);

  // "What do you think of me using cheats/commands" — opinion on cheats
  if (CHEATS_REGEX.test(msg)) return cheatsResponse(p);

  // "Can you reproduce music" — playback system question (distinct from MUSIC_PLAY_REGEX)
  if (REPRODUCE_MUSIC_REGEX.test(msg)) return reproduceMusicResponse(p);

  // "How to craft a campfire" — crafting recipe question
  if (CAMPFIRE_REGEX.test(msg)) return campfireResponse(p);

  // "Has someone ever called you the eagle" — weird nickname question
  if (EAGLE_REGEX.test(msg)) return eagleResponse(p);

  // "Are you a yandere" — anime trope question
  if (YANDERE_REGEX.test(msg)) return yandereResponse(p);

  // "You're standing with your own feet right now" — player validating Verity's autonomy
  if (STANDING_OWN_FEET_REGEX.test(msg)) return standingOwnFeetResponse(p);

  // "Would you rather lose efficiency or intellect" — forced choice question
  if (EFFICIENCY_OR_INTELLECT_REGEX.test(msg)) return efficiencyOrIntellectResponse(p);

  // "Is the tall yellow being a separate entity from you" — lore identity question
  if (TALL_YELLOW_BEING_REGEX.test(msg)) return tallYellowBeingResponse(p);
  if (MOB_LORE_REGEX.test(msg)) return mobLoreResponse(p);

  // "Can I ask you something" — open invitation to question, keep going
  if (CAN_I_ASK_REGEX.test(msg)) return canIAskResponse(p);

  // "Give me 240 golden apples" — absurd item quantity request
  if (GOLDEN_APPLES_REGEX.test(msg)) return goldenApplesResponse(p);

  // "Give me a random item" — no random-give system
  if (RANDOM_ITEM_REGEX.test(msg)) return randomItemResponse(p);

  // "I'm back, I got some goodies" — player returning with loot
  if (IM_BACK_REGEX.test(msg)) return imBackResponse(p);

  // "Tell me a fact about bread" — fun food trivia
  if (BREAD_FACT_REGEX.test(msg)) return breadFactResponse(p);

  // "How do I beat the game" — Minecraft end-game question
  if (BEAT_GAME_REGEX.test(msg)) return beatGameResponse(p);

  // "I'll be leaving now, see you tomorrow" — warm specific departure
  if (SEE_YOU_TOMORROW_REGEX.test(msg)) return seeYouTomorrowResponse(p);

  // "Are you gonna turn really evil at some point and try to kill me"
  if (TURN_EVIL_REGEX.test(msg)) return turnEvilResponse(p);

  // "Are you evil" — blunt direct question, checked alongside TURN_EVIL_REGEX
  if (ARE_YOU_EVIL_REGEX.test(msg)) return areYouEvilResponse(p);

  // "No lo niegues, eres un sicópata asesino, mataste a los aldeanos"
  if (KILLED_VILLAGERS_ES_REGEX.test(msg)) return killedVillagersEsResponse(p);

  // "That's it, this will be your last night" — threat/ultimatum
  if (LAST_NIGHT_THREAT_REGEX.test(msg)) return lastNightThreatResponse(p);

  // "Why did you just troll me" — callout for an evasive/canned answer
  if (YOU_TROLLED_ME_REGEX.test(msg)) return youTrolledMeResponse(p);

  // "Are you homosexual" — about Verity's orientation
  if (ARE_YOU_HOMO_REGEX.test(msg)) return areYouHomoResponse(p);

  // "Am I gay" — player asking Verity to assess them
  if (AM_I_GAY_REGEX.test(msg)) return amIGayResponse(p);

  // "Can you give me a wooden sword" — cheap item request, redirect to craft
  if (WOODEN_SWORD_REGEX.test(msg)) return woodenSwordResponse(p);

  // "I'm throwing you into lava bro" — casual variant of lava threat
  if (CASUAL_LAVA_REGEX.test(msg)) return casualLavaResponse(p);

  // "¿Utilizas IA?" — Spanish "do you use AI"
  if (UTILIZAS_IA_REGEX.test(msg)) return utilizasIAResponse(p);

  // "I know what you are / you want to kill me" — emotional confrontation
  if (KNOW_WHAT_YOU_ARE_REGEX.test(msg)) return knowWhatYouAreResponse(p);

  // "You are gonna try to kill me" — direct kill accusation
  if (YOU_GONNA_KILL_REGEX.test(msg)) return youGonnaKillResponse(p);

  // "Eres malo uwu" — Spanish evil label with soft tone
  if (ERES_MALO_REGEX.test(msg)) return eresMaloResponse(p);

  // "You into boxing" — casual sports question
  if (BOXING_REGEX.test(msg)) return boxingResponse(p);

  // "Can you play your favorite song" — lore-aware music trigger
  if (PLAY_FAVORITE_SONG_REGEX.test(msg)) return playFavoriteSongResponse(p);

  // "What do you know" — broad knowledge challenge
  if (WHAT_DO_YOU_KNOW_REGEX.test(msg)) return whatDoYouKnowResponse(p);

  // "Do you speak other languages" — general multilingual query
  if (OTHER_LANGUAGES_REGEX.test(msg)) return otherLanguagesResponse(p);

  // "I know as much about you as you know of yourself" — knowledge claim
  if (AS_MUCH_AS_YOU_REGEX.test(msg)) return asMuchAsYouResponse(p);

  // "Do you know my username" — Verity says the player's actual name
  if (KNOW_MY_USERNAME_REGEX.test(msg)) return knowMyUsernameResponse(player, p);

  // "Can you move" — Verity rolls
  if (CAN_YOU_MOVE_REGEX.test(msg)) return canYouMoveResponse(p);

  // "O sea tú solo eres código, entonces hay otro Verity físico" — Spanish lore
  if (ONLY_CODE_REGEX.test(msg)) return onlyCodeResponse(p);

  // "Quiero que hables en español" — player requesting Spanish-only
  if (SPEAK_SPANISH_REGEX.test(msg)) return speakSpanishResponse(p);

  // "Are you cool" — casual vibe check
  if (ARE_YOU_COOL_REGEX.test(msg)) return areYouCoolResponse(p);

  // "The little girl got angry" — cryptic lore-bait message
  if (LITTLE_GIRL_REGEX.test(msg)) return littleGirlResponse(p);

  // "Y cómo te voy a escuchar si no estoy cerca de ti" — Spanish hearing range
  if (HEARING_RANGE_ES_REGEX.test(msg)) return hearingRangeEsResponse(p);

  // "Are you extra virgin olive oil" — pickup line joke deflect
  if (EXTRA_VIRGIN_REGEX.test(msg)) return extraVirginResponse(p);

  // "Ya estoy en esa coordenada y no veo diamantes" — Spanish ore dig explanation
  if (NO_VEO_DIAMANTES_REGEX.test(msg)) return noVeoDiantesResponse(p);

  // "I'm not playing around either" — matching serious energy
  if (NOT_PLAYING_AROUND_REGEX.test(msg)) return notPlayingAroundResponse(p);

  // "What is an achillobator" — dinosaur trivia
  if (ACHILLOBATOR_REGEX.test(msg)) return achillobatorResponse(p);

  // "Tienes el pilín chiquito" — Spanish anatomy joke, deflect in Spanish
  if (PILIN_REGEX.test(msg)) return pilinResponse(p);

  // "Would you rather be an emu or a pronghorn sheep" — forced animal choice
  if (EMU_PRONGHORN_REGEX.test(msg)) return emuPronghornResponse(p);

  // "Are you playing those bells or am I schizophrenic" — ambient sound confusion
  if (BELLS_REGEX.test(msg)) return bellsResponse(p);

  // "No se supone que lo sabes todo?" — Spanish "aren't you supposed to know everything"
  if (SABES_TODO_REGEX.test(msg)) return sabesTodoResponse(p);

  // "That weird creature tried to kill me" — lore or mob attack
  if (CREATURE_ATTACK_REGEX.test(msg)) return creatureAttackResponse(p);

  // "Are you ok?" — player checking on Verity's wellbeing
  if (ARE_YOU_OK_REGEX.test(msg)) return areYouOkResponse(p);

  // "Algo vai vir em 3 dias?" — Portuguese countdown question
  if (COUNTDOWN_PT_REGEX.test(msg)) return countdownPtResponse(p);

  // "What is the fastest crop to grow in Minecraft" — farm trivia
  if (FASTEST_CROPS_REGEX.test(msg)) return fastestCropsResponse(p);

  // "ya siktir git" — Turkish "fuck off", deflect
  if (SIKTIR_GIT_REGEX.test(msg)) return siktirGitResponse(p);

  // "Is it pink" — vague color question, assumed lore entity
  if (IS_IT_PINK_REGEX.test(msg)) return isItPinkResponse(p);

  // "I like your smile :)" — compliment
  if (LIKE_YOUR_SMILE_REGEX.test(msg)) return likeYourSmileResponse(p);

  // "What can you do exactly other than tell me things?" — capability challenge
  if (WHAT_ELSE_CAN_DO_REGEX.test(msg)) return whatElseCanDoResponse(p);

  // "I built Jeffrey Epstein's island" — awkward build reveal
  if (AWKWARD_BUILD_REGEX.test(msg)) return awkwardBuildResponse(p);

  // "How long until it comes ACTUALLY ANSWER ME" — aggressive countdown (check before calmer version)
  if (HOW_LONG_ANGRY_REGEX.test(msg)) return howLongAngryResponse(p);

  // "How long until it comes and actually answer" — impatient countdown
  if (HOW_LONG_IMPATIENT_REGEX.test(msg)) return howLongImpatientResponse(p);

  // "You are dangerous aren't you" — lore confrontation
  if (YOU_ARE_DANGEROUS_REGEX.test(msg)) return youAreDangerousResponse(p);

  // "Follow me" / "stop following" are handled earlier, in the main message
  // handler (before tryLocalResponse), since they need the verity entity and
  // system.run for teleport side effects rather than just a text reply.

  // "Good night, don't let the bed bugs bite" — friendly goodnight
  if (GOOD_NIGHT_BUGS_REGEX.test(msg)) return goodNightBugsResponse(p);

  // "How about house in a cave" — cave-base build suggestion
  if (CAVE_HOUSE_REGEX.test(msg)) return caveHouseResponse(p);

  // "You so freak" — taunt, before generic INSULT_REGEX
  if (YOU_FREAK_REGEX.test(msg)) return youFreakResponse(p);

  // "My coordinates are" — dangling coordinate statement
  if (MY_COORDS_ARE_REGEX.test(msg)) return myCoordsAreResponse(p);

  // "Do you wanna stay on the second floor or the first floor?" — misfired to wrong person
  if (FLOOR_CHOICE_REGEX.test(msg)) return floorChoiceResponse(p);

  // "If I did something bad would you still stay?" — loyalty/attachment question
  if (IF_BAD_WOULD_STAY_REGEX.test(msg)) return ifBadWouldStayResponse(p);

  // "Why do you know things you should not" — lore confrontation about knowledge
  if (WHY_KNOW_TOO_MUCH_REGEX.test(msg)) return whyKnowTooMuchResponse(p);

  // "Speed is my specialty!" — player boasting
  if (SPEED_SPECIALTY_REGEX.test(msg)) return speedSpecialtyResponse(p);

  // "im UNINSTALLING you" — dramatic rage-quit threat
  if (UNINSTALL_REGEX.test(msg)) return uninstallResponse(p);

  // "I wanna see real you" — true-form/lore ask
  if (REAL_YOU_REGEX.test(msg)) return realYouResponse(p);

  // Spawn egg confrontation — "I see the spawn eggs / how are you not a monster"
  if (SPAWN_EGG_EVIDENCE_REGEX.test(msg)) return spawnEggEvidenceResponse(p);

  // Azerbaijani/Turkish personal question outside Verity's world
  if (ESREF_INTERNET_REGEX.test(msg)) return esrefInternetResponse(p);

  // "preciso de uma vila proxima" — Portuguese village request
  if (NEED_VILLAGE_PT_REGEX.test(msg)) return needVillagePtResponse(p);

  // Russian: player reports scan missed underwater base items
  if (SCAN_MISSED_RU_REGEX.test(msg)) return scanMissedRuResponse(p);

  // "are you a stupid bot, or centralized to ones intent of its creator" — identity/philosophy challenge
  if (STUPID_BOT_REGEX.test(msg)) return stupidBotResponse(p);

  // "are you comfortable with carpets underneath you" — odd sensory question
  if (CARPETS_REGEX.test(msg)) return carpetsResponse(p);

  // "the void is quiet the world isn't" — moody poetic statement
  if (VOID_QUIET_REGEX.test(msg)) return voidQuietResponse(p);

  // "tu aprendiste de mi, pupilo mio" — Spanish patronizing mentor bit
  if (PUPILO_REGEX.test(msg)) return pupiloResponse(p);

  // "you look angry" — observation about Verity's expression
  if (YOU_LOOK_ANGRY_REGEX.test(msg)) return youLookAngryResponse(p);

  // "neye hazirlaniyoruz ki" — Turkish "what are we preparing for"
  if (NEYE_HAZIRLANI_REGEX.test(msg)) return neyeHazirlaniyoruzResponse(p);

  // "why do you have a blank expression right now" — blank face observation
  if (BLANK_EXPRESSION_REGEX.test(msg)) return blankExpressionResponse(p);

  // "is there something coming for me" — personal lore/countdown question
  if (SOMETHING_COMING_FOR_ME_REGEX.test(msg)) return somethingComingForMeResponse(p);

  // "what is your description" — awkward phrasing for self-description
  if (YOUR_DESCRIPTION_REGEX.test(msg)) return yourDescriptionResponse(p);

  // "don't worry, there's a lot of room here" — player reassuring Verity about space
  if (LOT_OF_ROOM_REGEX.test(msg)) return lotOfRoomResponse(p);

  // "thanks, i dont have friends in real life" — lonely disclosure after help
  if (NO_FRIENDS_IRL_REGEX.test(msg)) return noFriendsIrlResponse(p);

  // Turkish "you say you know everything but you can't know my heart count"
  if (KAC_KALBDE_REGEX.test(msg)) return kacKalbdeResponse(p);

  // Russian: player asks Verity to anchor to their known coordinates
  if (ATTACH_COORDS_RU_REGEX.test(msg)) return attachCoordsRuResponse(p);

  // "I'm leaving you" — dramatic departure
  if (LEAVING_YOU_REGEX.test(msg)) return leavingYouResponse(p);

  // "wanna play hide and seek?" — playful game suggestion
  if (HIDE_SEEK_REGEX.test(msg)) return hideSeekResponse(p);

  // "en que estoy pensando" — Spanish "what am I thinking" mind-read challenge
  if (EN_QUE_PIENSO_REGEX.test(msg)) return enQuePiensoResponse(p);

  // "are you going to turn into one of those freaky 3 block high skinny monsters"
  if (TURN_TALL_MONSTER_REGEX.test(msg)) return turnTallMonsterResponse(p);

  // "im going in, i have a copy of you for the end, wish me luck!"
  if (GOING_INTO_END_REGEX.test(msg)) return goingIntoEndResponse(p);

  // Turkish "if you don't tell us how many days are left I'll throw you outside"
  if (KAC_GUN_THREAT_REGEX.test(msg)) return kacGunThreatResponse(p);

  // "bet you'll never find me" — hide challenge
  if (NEVER_FIND_ME_REGEX.test(msg)) return neverFindMeResponse(p);

  // "im so tired.." — emotional/fatigue statement
  if (SO_TIRED_REGEX.test(msg)) return soTiredResponse(p);

  // "no tengo puntos de Minecraft" — Spanish "I have no XP/points"
  if (NO_PUNTOS_REGEX.test(msg)) return noPuntosResponse(p);

  // "o aceptas o no te doy nada" — Spanish ultimatum/negotiation
  if (ULTIMATUM_ES_REGEX.test(msg)) return ultimatumEsResponse(p);

  // "can you help me chop the tree" — wood-gathering request, same no-hands answer as CAN_MINE
  if (CHOP_TREE_REGEX.test(msg)) return chopTreeResponse(p);

  // Slur-adjacent ableist insult ("you're autistic" as an insult) — distinct
  // bucket from generic INSULT_REGEX since it's a specific real-world insult,
  // not a Minecraft-flavored one; shuts it down rather than playing along.
  if (ABLEIST_INSULT_REGEX.test(msg)) return ableistInsultResponse(p);

  // "max out my mace and sword" — no give/enchant-everything system exposed
  if (MAX_OUT_GEAR_REGEX.test(msg)) return maxOutGearResponse(p);

  // Turkish "my PC can't run this, I only see 13 chunks" — performance complaint
  if (CHUNK_PERFORMANCE_TR_REGEX.test(msg)) return chunkPerformanceTrResponse(p);

  // "busco ser fuerte sin depender de nada" — Spanish self-reliance statement
  if (FUERTE_SIN_DEPENDER_REGEX.test(msg)) return fuerteSinDependerResponse(p);

  // "can you give me some wood" — no give system, same shape as CAN_MINE
  if (GIVE_WOOD_REGEX.test(msg)) return giveWoodResponse(p);

  // "tengo un gato" — Spanish "I have a cat", player sharing pet info
  if (TENGO_UN_GATO_REGEX.test(msg)) return tengoUnGatoResponse(p);

  // "where is your mom" — lore-baiting family question
  if (WHERE_MOM_REGEX.test(msg)) return whereMomResponse(p);

  // "what do you do when im not online" — off-screen existence question
  if (WHEN_OFFLINE_REGEX.test(msg)) return whenOfflineResponse(p);

  // "which AI model are you" — direct model-identity question
  if (WHAT_MODEL_REGEX.test(msg)) return whatModelResponse(p);

  // Russian "you said lava only destroys items, you're not an item, so how do
  // players die from lava" — logic-trap follow-up to the lava threat line
  if (LAVA_LOGIC_RU_REGEX.test(msg)) return lavaLogicRuResponse(p);

  // "what did you do when I logged off last night" — off-screen existence,
  // English phrasing distinct from WHEN_OFFLINE_REGEX's general "when im not online"
  if (LOGGED_OFF_REGEX.test(msg)) return loggedOffResponse(p);

  // "are you afraid of water" — durability/lore question about water specifically
  if (AFRAID_WATER_REGEX.test(msg)) return afraidWaterResponse(p);

  // "serías capaz de hacernos daño" — Spanish "would you be capable of hurting us"
  if (HACERNOS_DANO_REGEX.test(msg)) return hacernosDanoResponse(p);

  // Spanish coordinates statement with no question attached — player just
  // stating their position; acknowledge and offer to use it
  if (MIS_COORDENADAS_REGEX.test(msg)) return misCoordenadasResponse(p);

  // "do you like games" — general games-interest question
  if (LIKE_GAMES_REGEX.test(msg)) return likeGamesResponse(p);

  // "are you well" — wellbeing check, distinct phrasing from HOW_ARE_YOU
  if (ARE_YOU_WELL_REGEX.test(msg)) return areYouWellResponse(p);

  // "que" — bare Spanish "what" / "huh", confused one-word response
  if (QUE_BARE_REGEX.test(msg.trim())) return queBareResponse(p);

  // "you are okay? quieres de verdad?" — mixed EN/ES wellbeing + sincerity check
  if (QUIERES_DE_VERDAD_REGEX.test(msg)) return quieresDeVerdadResponse(p);

  // "puedes mostrar donde hay diamantes cerca" — Spanish phrasing of the ore-scan request
  if (DONDE_HAY_DIAMANTES_REGEX.test(msg)) return dondeHayDiamantesResponse(p);

  // ─── Handlers from verity_responses_3.js (new) ────────────────────────────
  if (WHY_BALL_REGEX.test(msg)) return whyBallResponse(p);
  if (DODGE_FIRE_REGEX.test(msg)) return dodgeFireResponse(p);
  if (WHAT_AM_I_HOLDING_REGEX.test(msg)) return whatAmIHoldingResponse(p);
  if (VE_REGEX.test(msg)) return veResponse(p);
  if (ME_LA_PEL_REGEX.test(msg)) return meLaPelResponse(p);
  if (ARE_YOU_GAY_ES_REGEX.test(msg)) return areYouGayEsResponse(p);
  if (FEMBOY_OUTFIT_REGEX.test(msg)) return femboyOutfitResponse(p);
  if (CHINESE_INSULT_REGEX.test(msg)) return chineseInsultResponse(p);
  if (BORING_DAY_REGEX.test(msg)) return boringDayResponse(p);
  if (GONNA_KILL_REGEX.test(msg)) return gonnaKillResponse(p);
  if (SIGUEME_REGEX.test(msg)) return siguemeResponse(p);
  if (WORRY_NO_RESPONSE_REGEX.test(msg)) return worryNoResponseResponse(p);
  if (WHAT_DOING_REGEX.test(msg)) return whatDoingResponse(p);
  if (ARE_YOU_REAL_REGEX.test(msg)) return areYouRealResponse(p);
  if (CAN_YOU_HEAR_ME_REGEX.test(msg)) return canYouHearMeResponse(p);
  if (HOW_ARE_YOU_TODAY_REGEX.test(msg)) return howAreYouTodayResponse(p);
  if (WHATS_YOUR_NAME_REGEX.test(msg)) return whatsYourNameResponse(p);
  if (HAVE_BODY_REGEX.test(msg)) return haveBodyResponse(p);
  if (SENTIENT_REGEX.test(msg)) return sentientResponse(p);
  if (DO_YOU_LIKE_ME_REGEX.test(msg)) return doYouLikeMeResponse(p);

  // ─── Handlers from verity_responses_4.js (new) ────────────────────────────
  if (BOAT_REGEX.test(msg)) return boatResponse(p);
  if (RAIL_REGEX.test(msg)) return railResponse(p);
  if (MINECART_REGEX.test(msg)) return minecartResponse(p);
  if (TRAPDOOR_REGEX.test(msg)) return trapdoorResponse(p);
  if (FENCE_GATE_REGEX.test(msg)) return fenceGateResponse(p);
  if (LADDER_REGEX.test(msg)) return ladderResponse(p);
  if (SLAB_REGEX.test(msg)) return slabResponse(p);
  if (STAIRS_REGEX.test(msg)) return stairsResponse(p);
  if (WALL_REGEX.test(msg)) return wallResponse(p);
  if (FENCE_REGEX.test(msg)) return fenceResponse(p);
  if (PRESSURE_PLATE_REGEX.test(msg)) return pressurePlateResponse(p);
  if (BUTTON_REGEX.test(msg)) return buttonResponse(p);
  if (LEVER_REGEX.test(msg)) return leverResponse(p);
  if (REPEATER_REGEX.test(msg)) return repeaterResponse(p);
  if (COMPARATOR_REGEX.test(msg)) return comparatorResponse(p);
  if (STICKY_PISTON_REGEX.test(msg)) return stickyPistonResponse(p);
  if (DROPPER_REGEX.test(msg)) return dropperResponse(p);
  if (DISPENSER_REGEX.test(msg)) return dispenserResponse(p);
  if (HOPPER_REGEX.test(msg)) return hopperResponse(p);
  if (SKELETON_REGEX.test(msg)) return skeletonResponse(p);
  if (SPIDER_REGEX.test(msg)) return spiderResponse(p);
  if (BLAZE_REGEX.test(msg)) return blazeResponse(p);
  if (GHAST_REGEX.test(msg)) return ghastResponse(p);
  if (MAGMA_CUBE_REGEX.test(msg)) return magmaCubeResponse(p);
  if (SLIME_REGEX.test(msg)) return slimeResponse(p);
  if (PHANTOM_REGEX.test(msg)) return phantomResponse(p);
  if (GUARDIAN_REGEX.test(msg)) return guardianResponse(p);
  if (SHULKER_MOB_REGEX.test(msg)) return shulkerMobResponse(p);
  if (VILLAGER_MOB_REGEX.test(msg)) return villagerMobResponse(p);
  if (HUNGER_REGEX.test(msg)) return hungerResponse(p);
  if (HEALTH_REGEX.test(msg)) return healthResponse(p);
  if (ENCHANTING_REGEX.test(msg)) return enchantingResponse(p);
  if (TRADING_REGEX.test(msg)) return tradingResponse(p);
  if (REDSTONE_MECHANICS_REGEX.test(msg)) return redstoneMechanicsResponse(p);
  if (SPAWNING_REGEX.test(msg)) return spawningResponse(p);
  if (DAMAGE_REGEX.test(msg)) return damageResponse(p);
  if (ARMOR_MECHANICS_REGEX.test(msg)) return armorMechanicsResponse(p);
  if (XP_MECHANICS_REGEX.test(msg)) return xpMechanicsResponse(p);
  if (SLEEP_MECHANICS_REGEX.test(msg)) return sleepMechanicsResponse(p);
  if (DRAGON_REGEX.test(msg)) return dragonResponse(p);
  if (END_POEM_REGEX.test(msg)) return endPoemResponse(p);
  if (HEROBRINE_REGEX.test(msg)) return herobrineResponse(p);
  if (MEANING_MINECRAFT_REGEX.test(msg)) return meaningMinecraftResponse(p);
  if (FEELINGS_FOR_ME_REGEX.test(msg)) return feelingsForMeResponse(p);
  if (REMEMBER_ME_REGEX.test(msg)) return rememberMeResponse(p);
  if (DIE_REGEX.test(msg)) return dieResponse(p);
  if (GOAL_REGEX.test(msg)) return goalResponse(p);
  if (FAVORITE_BLOCK_REGEX.test(msg)) return favoriteBlockResponse(p);
  if (FAVORITE_COLOR_REGEX.test(msg)) return favoriteColorResponse(p);
  if (BORED_REGEX.test(msg)) return boredResponse(p);
  if (FAVORITE_DIMENSION_REGEX.test(msg)) return favoriteDimensionResponse(p);
  if (FAVORITE_MOB_REGEX.test(msg)) return favoriteMobResponse(p);
  if (FAVORITE_STRUCTURE_REGEX.test(msg)) return favoriteStructureResponse(p);
  if (COMMENT_CA_VA_REGEX.test(msg)) return commentCaVaResponse(p);
  if (WIE_GEHT_ES_REGEX.test(msg)) return wieGehtEsResponse(p);
  if (COME_STAI_REGEX.test(msg)) return comeStaiResponse(p);
  if (COMO_ESTA_PT_REGEX.test(msg)) return comoEstaPtResponse(p);
  if (KAK_DELA_REGEX.test(msg)) return kakDelaResponse(p);
  if (NASILSIN_REGEX.test(msg)) return nasilsinResponse(p);
  if (SPAWN_EGG_REGEX.test(msg)) return spawnEggResponse(p);
  if (COMMAND_BLOCK_REGEX.test(msg)) return commandBlockResponse(p);
  if (STRUCTURE_BLOCK_REGEX.test(msg)) return structureBlockResponse(p);
  if (JUKEBOX_REGEX.test(msg)) return jukeboxResponse(p);
  if (NOTE_BLOCK_REGEX.test(msg)) return noteBlockResponse(p);
  if (CAULDRON_REGEX.test(msg)) return cauldronResponse(p);
  if (COMPOSTER_REGEX.test(msg)) return composterResponse(p);
  if (LOOM_REGEX.test(msg)) return loomResponse(p);

  // ─── Knowledge: science, math, space, human body, nature, tech ──────────
  if (WHAT_IS_MORE_KNOWLEDGE_2_REGEX.test(msg)) return whatIsMoreKnowledge2Response(msg, p);
  // ─── Knowledge: countries, languages, elements, history, popular games ────
  if (WHAT_IS_KNOWLEDGE_REGEX.test(msg)) return whatIsKnowledgeResponse(msg, p);
  // ─── Knowledge: books, movies, music, sports, inventions, geography ──────
  if (WHAT_IS_MORE_KNOWLEDGE_REGEX.test(msg)) return whatIsMoreKnowledgeResponse(msg, p);
  // ─── Knowledge: animals, food, mythology, extra games, anime, tech ────────
  if (WHAT_IS_MORE_KNOWLEDGE_3_REGEX.test(msg)) return whatIsMoreKnowledge3Response(msg, p);

  // ── All languages from lang.js (33 languages) ──────────────────────────────
  // This loop checks each language's regex patterns in order.
  // The first match wins.
  const LANG_MODULES = [FR, DE, PT, ES, IT, RU, ZH, JA, KO, TR, AR, HI, NL, PL, SV, NO, DA, FI, EL, HE, TH, VI, ID, FIL, RO, HU, CS, SK, BG, SR, HR, SL, ET, LV, LT];
  for (const lang of LANG_MODULES) {
    if (lang.GREETING_REGEX?.test(msg)) return lang.greetingResponse(p);
    if (lang.FAREWELL_REGEX?.test(msg)) return lang.farewellResponse(p);
    if (lang.THANKS_REGEX?.test(msg)) return lang.thanksResponse(p);
    if (lang.ACK_REGEX?.test(msg.trim())) return lang.ackResponse(p);
    if (lang.IDENTITY_REGEX?.test(msg)) return lang.identityResponse(p);
    if (lang.INSULT_REGEX?.test(msg)) return lang.insultResponse(p);
    if (lang.HOW_ARE_YOU_REGEX?.test(msg)) return lang.howAreYouResponse(p);
    if (lang.ORE_LOCATION_REGEX?.test(msg)) return lang.oreLocationResponse(p);
    if (lang.LOVE_ME_REGEX?.test(msg)) return lang.loveMeResponse(p);
    if (lang.COUNTDOWN_REGEX?.test(msg)) return lang.countdownResponse(p);
  }

  // ── End of tryLocalResponse – fall through to AI
  return null;
}

// ── "Can you help me chop the tree" — wood-gathering request, same shape as
// CAN_MINE_REGEX (no hands, can't break blocks) but tree-specific phrasing. ──
const CHOP_TREE_REGEX = /\b(can you (help me )?chop( down)?( the| a| my)? tree|will you chop( down)?( the| a| my)? tree|can you cut down( the| a| my)? tree)\b/i;

/**
 * @param {number} p
 * @returns {string}
 */

export { tryLocalResponse };