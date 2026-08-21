
import {
  world,
  system,
  Player,
  PlayerPermissionLevel,
  CustomCommandParamType,
  CommandPermissionLevel,
  CustomCommandStatus,
} from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { STRINGS, t, LANGS } from './lang.js';
const VERSION = 2,
  TICK_RATE_MS = 900,
  MAX_CHUNK = 128,
  BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function utf8Encode(_0x2c1b5a) {
  const _0x2d638b = [],
    _0x1dbf6e = String(_0x2c1b5a ?? '');
  for (let _0x2493d3 = 0; _0x2493d3 < _0x1dbf6e.length; _0x2493d3++) {
    let _0x320078 = _0x1dbf6e.codePointAt(_0x2493d3);
    if (_0x320078 > 65535) _0x2493d3++;
    if (_0x320078 <= 127) _0x2d638b.push(_0x320078);
    else {
      if (_0x320078 <= 2047) _0x2d638b.push(192 | (_0x320078 >> 6), 128 | (_0x320078 & 63));
      else
        _0x320078 <= 65535
          ? _0x2d638b.push(
              224 | (_0x320078 >> 12),
              128 | ((_0x320078 >> 6) & 63),
              128 | (_0x320078 & 63),
            )
          : _0x2d638b.push(
              240 | (_0x320078 >> 18),
              128 | ((_0x320078 >> 12) & 63),
              128 | ((_0x320078 >> 6) & 63),
              128 | (_0x320078 & 63),
            );
    }
  }
  return _0x2d638b;
}
function base64urlEncode(_0x341f8d) {
  let _0xf35332 = '';
  for (let _0x4c4432 = 0; _0x4c4432 < _0x341f8d.length; _0x4c4432 += 3) {
    const _0xa8825e = _0x341f8d[_0x4c4432],
      _0x58234b = _0x4c4432 + 1 < _0x341f8d.length,
      _0x3bcd7f = _0x4c4432 + 2 < _0x341f8d.length,
      _0x7242f4 = _0x58234b ? _0x341f8d[_0x4c4432 + 1] : 0,
      _0x57dfa9 = _0x3bcd7f ? _0x341f8d[_0x4c4432 + 2] : 0;
    ((_0xf35332 += BASE64_CHARS[(_0xa8825e >> 2) & 63]),
      (_0xf35332 += BASE64_CHARS[((_0xa8825e & 3) << 4) | ((_0x7242f4 >> 4) & 15)]),
      (_0xf35332 += _0x58234b
        ? BASE64_CHARS[((_0x7242f4 & 15) << 2) | ((_0x57dfa9 >> 6) & 3)]
        : '='),
      (_0xf35332 += _0x3bcd7f ? BASE64_CHARS[_0x57dfa9 & 63] : '='));
  }
  return _0xf35332.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function base64urlDecode(_0x47ffbe) {
  let _0x1888c6 = String(_0x47ffbe || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  while (_0x1888c6.length % 4) _0x1888c6 += '=';
  const _0x3e14f6 = [];
  for (let _0x2a4bf2 = 0; _0x2a4bf2 < _0x1888c6.length; _0x2a4bf2 += 4) {
    const _0x209d9a = BASE64_CHARS.indexOf(_0x1888c6[_0x2a4bf2]),
      _0x476d5e = BASE64_CHARS.indexOf(_0x1888c6[_0x2a4bf2 + 1]),
      _0x35b919 =
        _0x1888c6[_0x2a4bf2 + 2] === '=' ? -1 : BASE64_CHARS.indexOf(_0x1888c6[_0x2a4bf2 + 2]),
      _0xc2e65f =
        _0x1888c6[_0x2a4bf2 + 3] === '=' ? -1 : BASE64_CHARS.indexOf(_0x1888c6[_0x2a4bf2 + 3]);
    if (
      _0x209d9a < 0 ||
      _0x476d5e < 0 ||
      (_0x35b919 < 0 && _0x1888c6[_0x2a4bf2 + 2] !== '=') ||
      (_0xc2e65f < 0 && _0x1888c6[_0x2a4bf2 + 3] !== '=')
    )
      throw new Error('invalid base64url');
    _0x3e14f6.push((_0x209d9a << 2) | (_0x476d5e >> 4));
    if (_0x35b919 >= 0) _0x3e14f6.push(((_0x476d5e & 15) << 4) | (_0x35b919 >> 2));
    if (_0xc2e65f >= 0) _0x3e14f6.push(((_0x35b919 & 3) << 6) | _0xc2e65f);
  }
  let _0x2f1bbd = '';
  for (let _0x4db88b = 0; _0x4db88b < _0x3e14f6.length;) {
    const _0x17f1b0 = _0x3e14f6[_0x4db88b++];
    let _0x80d09b;
    if (_0x17f1b0 < 128) _0x80d09b = _0x17f1b0;
    else {
      if ((_0x17f1b0 & 224) === 192)
        _0x80d09b = ((_0x17f1b0 & 31) << 6) | (_0x3e14f6[_0x4db88b++] & 63);
      else
        (_0x17f1b0 & 240) === 224
          ? (_0x80d09b =
              ((_0x17f1b0 & 15) << 12) |
              ((_0x3e14f6[_0x4db88b++] & 63) << 6) |
              (_0x3e14f6[_0x4db88b++] & 63))
          : (_0x80d09b =
              ((_0x17f1b0 & 7) << 18) |
              ((_0x3e14f6[_0x4db88b++] & 63) << 12) |
              ((_0x3e14f6[_0x4db88b++] & 63) << 6) |
              (_0x3e14f6[_0x4db88b++] & 63));
    }
    _0x2f1bbd +=
      _0x80d09b <= 65535 ? String.fromCharCode(_0x80d09b) : String.fromCodePoint(_0x80d09b);
  }
  return _0x2f1bbd;
}
function jsonToBase64(_0x3a39db) {
  return base64urlEncode(utf8Encode(JSON.stringify(_0x3a39db)));
}
function base64ToJson(_0x323dfe) {
  return JSON.parse(base64urlDecode(_0x323dfe));
}
const COLOR_BLACK = '§0',
  COLOR_DARK_BLUE = '§1',
  OBJ_SHOW_ICONS = 'vcmc:show_icons',
  OBJ_SHOW_TITLES = 'vcmc:show_titles',
  OBJ_GROUPS = 'vcmc:groups',
  OBJ_HEAR_SPECTATORS = 'vcmc:hear_spectators',
  OBJ_SPATIAL_AUDIO = 'vcmc:spatial_audio',
  OBJ_REQUIRE_AUTH = 'vcmc:require_auth',
  OBJ_COORD_INTERVAL = 'vcmc:coord_interval',
  OBJ_MAX_GROUPS_PP = 'vcmc:max_groups_pp',
  OBJ_ENV_SFX = 'vcmc:environment_sfx',
  OBJ_ENV_WATER = 'vcmc:environment_water',
  OBJ_ENV_LAVA = 'vcmc:environment_lava',
  OBJ_ENV_DIMENSIONS = 'vcmc:environment_dimensions',
  OBJ_ENV_CAVES = 'vcmc:environment_caves',
  OBJ_WORLD_ID = 'vcmc:world_id_v1',
  OBJ_VOICE_GROUPS = 'vcmc:voice_groups_v1',
  OBJ_PLAYER_SFX = 'vcmc:player_sfx_v1',
  OBJ_SFX_CATALOG = 'vcmc:sfx_catalog_v1',
  OBJ_VCMC_GROUP = 'vcmc_group',
  OBJ_VCMC_VOICE = 'vcmc_voice',
  MS_PER_SECOND = 1000,
  TAG_A = '',
  TAG_B = '',
  TAG_C = '',
  TAG_D = '',
  BRIDGE_TAGS = [TAG_A, TAG_B, TAG_C, TAG_D],
  CMD_MEG_ON = 'vcmc_meg_on;',
  CMD_MEG_OFF = 'vcmc_meg_off;';
class State {
  static roomId = '';
  static worldId = '';
  static roomToken = '';
  static bridgeConnected = false;
  static bridgeRevision = 0;
  static bridgeSignature = '';
  static bridgeFrames = ['VCMC2:0:0:1:e30'];
  static bridgeReadLockUntil = 0;
  static radarRevision = 0;
  static radarFrame = 'VCMCR:0:eyJwIjpbXSwibSI6MH0';
  static worldV3AckSequence = 0;
  static worldV3AckPart = -1;
  static worldV3Assemblies = new Map();
  static worldV3Applied = new Set();
  static bridgeRefreshTicks = 0;
  static bridgeSettingsQueue = new Map();
  static bridgeSettingsSequence = 0;
  static bridgeLastSeenMs = 0;
  static bridgeHeartbeatCapable = false;
  static bridgeUnavailable = false;
  static BRIDGE_LIVENESS_TIMEOUT_MS = 8000;
  static settings = {
    showIcons: true,
    showTitles: true,
    groups: false,
    hearSpectators: true,
    spatialAudio: true,
    requireAuth: true,
    coordInterval: 10,
    maxGroupsPerPlayer: 3,
    environmentalSfx: false,
    environmentalWater: true,
    environmentalLava: true,
    environmentalDimensions: true,
    environmentalCaves: true,
  };
  static pendingVerifications = [];
  static playerSettings = new Map();
  static megaphonePlayers = new Set();
  static MEGAPHONE_MAX = 10;
  static playerSfx = new Map();
  static environmentalSfx = new Map();
  static environmentalRayCursor = 0;
  static ENVIRONMENT_RAYCAST_BUDGET = 64;
  static customSfx = new Map();
  static sfxCatalogRevision = 1;
  static sfxCatalogDirty = true;
  static SFX_MAX_CUSTOM = 11;
  static NETHER_SFX_DEFINITION = Object.freeze({
    base: 0,
    pitch: 0,
    gain: 0,
    lowpass: 4800,
    highpass: 80,
    q: 0.707,
    distortion: 2.5,
    delay: 65,
    feedback: 0.12,
    wet: 0.18,
    dry: 0.95,
  });
  static sfxRuntimeCache = undefined;
  static groups = new Map();
  static playerGroup = new Map();
  static roomSettingsCache = undefined;
  static groupObjectiveCache = undefined;
  static voiceObjectiveCache = undefined;
  static playerInfo = new Map();
  static lastSentPos = new Map();
  static forceMuteState = new Map();
  static lastVoiceState = new Map();
  static lastSpeakingState = new Map();
  static lastVoiceScores = new Map();
  static voiceScoreHoldUntil = new Map();
  static voiceScoreWriteErrorShown = false;
  static pendingMuteFlushes = new Map();
  static pendingSelfMutes = new Map();
  static appMuteState = new Map();
  static restartGraceHeld = null;
  static isSending = false;
  static lastTickMs = 0;
  static lastVoiceActivityMs = new Map();
  static CONFIG_SETTLE_MS = 15000;
  static ensureWorldOperatorCommandAccess(_0x286024) {
    try {
      if (_0x286024.playerPermissionLevel !== PlayerPermissionLevel.Operator) return;
      const _0x18a3df = _0x286024.commandPermissionLevel;
      if (
        _0x18a3df !== CommandPermissionLevel.Any &&
        _0x18a3df !== CommandPermissionLevel.GameDirectors
      )
        return;
      _0x286024.commandPermissionLevel = CommandPermissionLevel.Admin;
    } catch (_0x4ff2de) {}
  }
  static loadOrCreateWorldId() {
    try {
      const _0x5c8bc7 = world.getDynamicProperty(OBJ_WORLD_ID);
      if (typeof _0x5c8bc7 === 'string' && /^[A-Za-z0-9_-]{24,64}$/['test'](_0x5c8bc7)) {
        this.worldId = _0x5c8bc7;
        return;
      }
    } catch (_0xc03ba8) {}
    const _0x50c624 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let _0x49a915 = '';
    for (let _0x495ab6 = 0; _0x495ab6 < 32; _0x495ab6++) {
      _0x49a915 += _0x50c624[Math.floor(Math.random() * _0x50c624.length)];
    }
    const _0x4e2cee = Math.abs(
      (Date.now() ^ ((system.currentTick || 0) * 2654435761)) | 0,
    ).toString(36);
    this.worldId = (_0x49a915 + _0x4e2cee).slice(0, 40);
    try {
      world.setDynamicProperty(OBJ_WORLD_ID, this.worldId);
    } catch (_0x1c167e) {
      console.warn('[VCMC] Could not persist WORLD identity: ' + _0x1c167e);
    }
  }
  static init() {
    ((this.roomId = ''),
      (this.roomToken = ''),
      (this.bridgeConnected = false),
      (this.bridgeLastSeenMs = 0),
      (this.bridgeHeartbeatCapable = false),
      (this.bridgeUnavailable = false),
      this.loadOrCreateWorldId());
    try {
      const _0x47b2d5 = this.settings,
        _0xe117dd = (_0x110eb5, _0xb48e34) => {
          const _0x32a754 = world.getDynamicProperty(_0x110eb5);
          return typeof _0x32a754 === 'boolean' ? _0x32a754 : _0xb48e34;
        };
      ((_0x47b2d5.showIcons = _0xe117dd(OBJ_SHOW_ICONS, true)),
        (_0x47b2d5.showTitles = _0xe117dd(OBJ_SHOW_TITLES, true)),
        (_0x47b2d5.groups = _0xe117dd(OBJ_GROUPS, false)),
        (_0x47b2d5.hearSpectators = _0xe117dd(OBJ_HEAR_SPECTATORS, true)),
        (_0x47b2d5.spatialAudio = _0xe117dd(OBJ_SPATIAL_AUDIO, true)),
        (_0x47b2d5.environmentalSfx = _0xe117dd(OBJ_ENV_SFX, false)),
        (_0x47b2d5.environmentalWater = _0xe117dd(OBJ_ENV_WATER, true)),
        (_0x47b2d5.environmentalLava = _0xe117dd(OBJ_ENV_LAVA, true)),
        (_0x47b2d5.environmentalDimensions = _0xe117dd(OBJ_ENV_DIMENSIONS, true)),
        (_0x47b2d5.environmentalCaves = _0xe117dd(OBJ_ENV_CAVES, true)),
        (_0x47b2d5.requireAuth = true));
      const _0x459e8d = world.getDynamicProperty(OBJ_COORD_INTERVAL);
      _0x47b2d5.coordInterval =
        typeof _0x459e8d === 'number' && _0x459e8d >= 4 && _0x459e8d <= 40 ? _0x459e8d : 10;
      const _0x20cce3 = world.getDynamicProperty(OBJ_MAX_GROUPS_PP);
      _0x47b2d5.maxGroupsPerPlayer =
        typeof _0x20cce3 === 'number' && _0x20cce3 >= 1 && _0x20cce3 <= 20 ? _0x20cce3 : 3;
    } catch (_0xb19677) {}
    (this.restoreGroups(),
      this.restoreSfxCatalog(),
      this.restorePlayerSfx(),
      this.groupObjective());
    const _0x26dddc = this.voiceObjective();
    try {
      for (const _0x622784 of _0x26dddc?.['getParticipants']() || []) {
        _0x26dddc.setScore(_0x622784, -2);
      }
    } catch (_0x3e4ab2) {}
    (world.afterEvents.playerSpawn.subscribe(({ player: _0x1004ed, initialSpawn: _0x3a1e67 }) => {
      system.run(() => {
        if (_0x1004ed.isValid) this.ensureWorldOperatorCommandAccess(_0x1004ed);
      });
      if (!_0x3a1e67) return;
      system.runTimeout(() => {
        if (!_0x1004ed.isValid) return;
        const _0x30cd24 = this._norm(_0x1004ed.name);
        this.syncGroupForPlayer(_0x1004ed);
        const _0x528317 = this.settings.groups
          ? this.groups.get(this.playerGroup.get(_0x30cd24))
          : undefined;
        (_0x528317 &&
          _0x1004ed.sendMessage(
            t(this.langOf(_0x1004ed), 'groups_current_body', {
              name: _0x528317.name,
              num: _0x528317.number,
            }),
          ),
          this.setVoiceScore(_0x1004ed, -2, true),
          !this.playerInfo.has(_0x30cd24) &&
            this.playerInfo.set(_0x30cd24, { state: 'PENDING', notified: false }),
          this.settings.showIcons &&
            !_0x1004ed.nameTag.includes(TAG_A) &&
            !_0x1004ed.nameTag.includes(TAG_B) &&
            !_0x1004ed.nameTag.includes(TAG_C) &&
            this._applyIcon(_0x1004ed, TAG_C),
          this.settings.showTitles && _0x1004ed.onScreenDisplay.setTitle('vcmc_di;'),
          this.lastVoiceState.set(_0x30cd24, 'disconnected'));
      }, 20);
    }),
      system.run(() => {
        for (const _0x587b28 of world.getPlayers()) {
          if (_0x587b28.isValid) this.ensureWorldOperatorCommandAccess(_0x587b28);
        }
      }),
      world.afterEvents.playerLeave.subscribe(({ playerName: _0x2aae7e }) => {
        const _0x32a8e5 = this._norm(_0x2aae7e);
        (this.playerInfo.delete(_0x32a8e5),
          this.lastSentPos.delete(_0x32a8e5),
          this.forceMuteState.delete(_0x32a8e5),
          this.pendingMuteFlushes.delete(_0x32a8e5),
          this.pendingSelfMutes.delete(_0x32a8e5),
          this.appMuteState.delete(_0x32a8e5),
          this.playerSettings.delete(_0x32a8e5),
          this.lastVoiceState.delete(_0x32a8e5),
          this.lastSpeakingState.delete(_0x32a8e5),
          this.lastVoiceScores.delete(_0x32a8e5),
          this.voiceScoreHoldUntil.delete(_0x32a8e5),
          this.environmentalSfx.delete(_0x32a8e5),
          this.setObjectiveScoreByNorm(this.voiceObjective(), _0x32a8e5, -2),
          this.megaphonePlayers.delete(_0x32a8e5));
      }),
      system.runInterval(() => this._tick(), 20),
      system.runInterval(() => this._scanEnvironmentalSfx(), 20),
      this._refreshBridgeSnapshot(),
      this._refreshRadarFrame());
  }
  static _markBridgeActivity(_0xf8b862 = false) {
    if (_0xf8b862) this.bridgeHeartbeatCapable = true;
    ((this.bridgeLastSeenMs = Date.now()), (this.bridgeConnected = true));
    if (!this.bridgeUnavailable) return;
    ((this.bridgeUnavailable = false), system.run(() => this._restoreBridgeDisplayAfterRecovery()));
  }
  static _restoreBridgeDisplayAfterRecovery() {
    if (this.bridgeUnavailable) return;
    const _0x4e1e6d = [];
    for (const _0x5110bf of world.getPlayers()) {
      if (!_0x5110bf.isValid) continue;
      const _0x11cd41 = this._norm(_0x5110bf.name),
        _0xab750a = this.playerInfo.get(_0x11cd41)?.['state'] === 'CONNECTED',
        _0xe172cd = this.appMuteState.get(_0x11cd41) === true;
      (this._setVoiceState(_0x5110bf, !_0xab750a ? 'disconnected' : _0xe172cd ? 'off' : 'on', true),
        this._updateSpeakingIcon(_0x5110bf, 0, _0xab750a, _0xe172cd),
        this.setVoiceScore(_0x5110bf, !_0xab750a ? -2 : _0xe172cd ? -1 : 0, true, true),
        _0xab750a && this.megaphonePlayers.has(_0x11cd41) && _0x4e1e6d.push(_0x5110bf));
    }
    (_0x4e1e6d.length > 0 &&
      system.runTimeout(() => {
        if (this.bridgeUnavailable) return;
        for (const _0x1c5511 of _0x4e1e6d) {
          _0x1c5511.isValid &&
            this.megaphonePlayers.has(this._norm(_0x1c5511.name)) &&
            this._setMegaphoneHud(_0x1c5511, true);
        }
      }, 1),
      console.warn('[VCMC] WORLD relay heartbeat recovered.'));
  }
  static _checkBridgeLiveness(_0x31dd45) {
    if (
      !this.bridgeHeartbeatCapable ||
      this.bridgeUnavailable ||
      this.bridgeLastSeenMs <= 0 ||
      _0x31dd45 - this.bridgeLastSeenMs < this.BRIDGE_LIVENESS_TIMEOUT_MS
    )
      return;
    ((this.bridgeConnected = false), (this.bridgeUnavailable = true));
    const _0x1d516 = [];
    for (const _0x2fc596 of world.getPlayers()) {
      if (!_0x2fc596.isValid) continue;
      const _0x2b09e2 = this._norm(_0x2fc596.name);
      (this._setVoiceState(_0x2fc596, 'disconnected', true),
        this._updateSpeakingIcon(_0x2fc596, 0, false, false),
        this.setVoiceScore(_0x2fc596, -2, true, true));
      if (this.megaphonePlayers.has(_0x2b09e2)) _0x1d516.push(_0x2fc596);
    }
    (_0x1d516.length > 0 &&
      system.runTimeout(() => {
        if (!this.bridgeUnavailable) return;
        for (const _0x52b87f of _0x1d516) {
          if (_0x52b87f.isValid) this._setMegaphoneHud(_0x52b87f, false);
        }
      }, 1),
      console.warn(
        '[VCMC] WORLD relay heartbeat lost for ' +
          (_0x31dd45 - this.bridgeLastSeenMs + 'ms; all players marked disconnected.'),
      ));
  }
  static _tick() {
    const _0x32a911 = Date.now(),
      _0x322385 = this.lastTickMs ? _0x32a911 - this.lastTickMs : 0;
    _0x322385 > 4000 &&
      (this.bridgeHeartbeatCapable &&
        this.bridgeLastSeenMs > 0 &&
        (this.bridgeLastSeenMs = _0x32a911),
      console.warn(
        '[VCMC] Ticks resumed after ' +
          _0x322385 +
          'ms; ' +
          'WORLD relay recovery grace restarted.',
      ));
    ((this.lastTickMs = _0x32a911), this._checkBridgeLiveness(_0x32a911));
    if (this.isSending) return;
    this._sendCoords();
  }
  static _refreshBridgeSnapshot() {
    if (Date.now() < this.bridgeReadLockUntil) return;
    const _0x39aaf0 = {},
      _0x3d7848 = [],
      _0x55d75b = this.buildSfxRuntimeCatalog(),
      _0x12d911 = Date.now();
    let _0x2be6a3 = false;
    for (const _0x327de8 of world.getPlayers()) {
      if (!_0x327de8.isValid) continue;
      const _0xdf36c2 = this._norm(_0x327de8.name),
        _0x365c84 = this.playerInfo.get(_0xdf36c2);
      if (!_0x365c84 || _0x365c84.state !== 'CONNECTED') continue;
      const _0x3944ea = {};
      if (this.settings.groups) {
        if (this.syncGroupForPlayer(_0x327de8, false)) _0x2be6a3 = true;
        const _0x151ffe = this.playerGroup.get(_0xdf36c2);
        if (_0x151ffe) _0x3944ea.group = _0x151ffe;
      }
      !this.settings.hearSpectators && this._isSpectator(_0x327de8) && (_0x3944ea.spectator = true);
      if (this.megaphonePlayers.has(_0xdf36c2)) _0x3944ea.megaphone = true;
      const _0x5e0a80 =
          this.playerSfx.get(_0xdf36c2) || this.environmentalSfx.get(_0xdf36c2) || 'normal',
        _0x54ee0e = _0x55d75b.idsByName[_0x5e0a80],
        _0x27b89f = this.sfxFallbackCode(_0x5e0a80);
      if (_0x27b89f >= 1 && _0x27b89f <= 4) _0x3944ea.sfx = _0x27b89f;
      if (_0x54ee0e >= 5 && _0x54ee0e <= 16) _0x3944ea.customSfx = _0x54ee0e;
      if (Object.keys(_0x3944ea).length > 0) _0x39aaf0[_0xdf36c2] = _0x3944ea;
      (!this.playerSettings.has(_0xdf36c2) ||
        (_0x365c84.connectedAt && _0x12d911 - _0x365c84.connectedAt < this.CONFIG_SETTLE_MS)) &&
        _0x3d7848.push(_0xdf36c2);
    }
    if (_0x2be6a3) this.saveGroups();
    const _0x3fc984 = [];
    for (const [_0x4a4d28, _0x32c044] of this.pendingMuteFlushes) {
      (_0x3fc984.push({ name: _0x4a4d28, muted: _0x32c044.muted }), _0x32c044.ticksLeft--);
      if (_0x32c044.ticksLeft <= 0) this.pendingMuteFlushes.delete(_0x4a4d28);
    }
    const _0x5ca612 = [];
    for (const [_0x462ef6, _0x17a9ec] of this.pendingSelfMutes) {
      (_0x5ca612.push({ name: _0x462ef6, muted: _0x17a9ec.muted }), _0x17a9ec.ticksLeft--);
      if (_0x17a9ec.ticksLeft <= 0) this.pendingSelfMutes.delete(_0x462ef6);
    }
    const _0xb1339b = {
      protocol: VERSION,
      worldId: this.worldId,
      roomSettings: this.roomSettingsSnapshot(),
      sfxCatalogRevision: String(this.sfxCatalogRevision),
      meta: _0x39aaf0,
    };
    if (_0x3fc984.length > 0) _0xb1339b.forceMutes = _0x3fc984;
    if (_0x5ca612.length > 0) _0xb1339b.selfMutes = _0x5ca612;
    if (_0x3d7848.length > 0) _0xb1339b.needConfig = _0x3d7848;
    this.pendingVerifications.length > 0 &&
      (_0xb1339b.verifications = this.pendingVerifications
        .filter((_0x4380b0) => !_0x4380b0.resolved)
        .map((_0x10d28b) => ({ name: _0x10d28b.name, code: _0x10d28b.code })));
    this.sfxCatalogDirty &&
      (_0xb1339b.sfxCatalog = {
        revision: String(this.sfxCatalogRevision),
        effects: _0x55d75b.effects,
      });
    this.bridgeSettingsQueue.size > 0 &&
      (_0xb1339b.settingsPushes = [...this.bridgeSettingsQueue.values()].map((_0x4bdbaf) => ({
        id: _0x4bdbaf.id,
        player: _0x4bdbaf.player,
        gamertag: _0x4bdbaf.gamertag,
        settings: _0x4bdbaf.settings,
      })));
    const _0x5dd5ad = JSON.stringify(_0xb1339b);
    if (_0x5dd5ad === this.bridgeSignature) return;
    const _0x34820b = base64urlEncode(utf8Encode(_0x5dd5ad)),
      _0x296f6d = Math.max(1, Math.ceil(_0x34820b.length / TICK_RATE_MS));
    if (_0x296f6d > MAX_CHUNK) {
      console.warn('[VCMC] WORLD bridge snapshot too large (' + _0x34820b.length + ' chars).');
      return;
    }
    ((this.bridgeSignature = _0x5dd5ad),
      (this.bridgeRevision = (this.bridgeRevision + 1) % 2147483647));
    const _0x143057 = this.bridgeRevision,
      _0x574e64 = [];
    for (let _0xa69cd5 = 0; _0xa69cd5 < _0x296f6d; _0xa69cd5++) {
      const _0x19daaf = _0x34820b.slice(_0xa69cd5 * TICK_RATE_MS, (_0xa69cd5 + 1) * TICK_RATE_MS);
      _0x574e64.push('VCMC2:' + _0x143057 + ':' + _0xa69cd5 + ':' + _0x296f6d + ':' + _0x19daaf);
    }
    this.bridgeFrames = _0x574e64;
  }
  static _refreshRadarFrame() {
    const _0x226cdb = [];
    for (const _0x522f32 of world.getPlayers().slice(0, 128)) {
      if (!_0x522f32.isValid) continue;
      const _0x233d77 = _0x522f32.location,
        _0x145463 = String(_0x522f32.dimension?.['id'] || '').toLowerCase();
      let _0x5116f0 = 0;
      try {
        const _0x417b20 = Number(_0x522f32.getRotation()?.['y']);
        if (Number.isFinite(_0x417b20)) _0x5116f0 = _0x417b20;
      } catch (_0x19068a) {}
      _0x226cdb.push([
        _0x522f32.name,
        Math.round(Number(_0x233d77.x) * 100) / 100,
        Math.round(Number(_0x233d77.y) * 100) / 100,
        Math.round(Number(_0x233d77.z) * 100) / 100,
        _0x145463 === 'minecraft:the_end' ? 1 : _0x145463 === 'minecraft:nether' ? 2 : 0,
        Math.round(_0x5116f0 * 10) / 10,
        _0x145463 || 'minecraft:overworld',
      ]);
    }
    const _0x2ff592 = base64urlEncode(
      utf8Encode(JSON.stringify({ p: _0x226cdb, m: this.bridgeRevision })),
    );
    ((this.radarRevision = (this.radarRevision + 1) % 2147483647),
      (this.radarFrame = 'VCMCR:' + this.radarRevision + ':' + _0x2ff592));
  }
  static bridgeFrame(_0x2631cf) {
    const _0x378804 = Math.max(0, Number(_0x2631cf) | 0);
    return this.bridgeFrames[_0x378804] || this.bridgeFrames[0] || 'VCMC2:0:0:1:e30';
  }
  static readBridgeFrame(_0xb73db6) {
    const _0x2e1952 = Math.max(0, Number(_0xb73db6) | 0);
    _0x2e1952 === 0 &&
      (this.bridgeReadLockUntil =
        Date.now() + Math.min(60000, Math.max(5000, this.bridgeFrames.length * 2500)));
    const _0xcb54ac = this.bridgeFrame(_0x2e1952);
    return (
      _0x2e1952 >= this.bridgeFrames.length - 1 &&
        system.run(() => {
          this.bridgeReadLockUntil = 0;
        }),
      _0xcb54ac
    );
  }
  static readRadarFrame() {
    return this.radarFrame;
  }
  static worldV3Frame(_0x267841) {
    const _0x4e6667 = String(this.radarFrame || '').match(/^VCMCR:(\d+):([A-Za-z0-9_-]+)$/),
      _0x46196c = _0x4e6667 ? Number(_0x4e6667[1]) : 0,
      _0x4ca922 = _0x4e6667?.[2] || 'eyJwIjpbXSwibSI6MH0',
      _0xd3f964 = Math.max(0, Number(_0x267841) | 0);
    let _0x531dc9 = this.bridgeRevision,
      _0x26a0f7 = -1,
      _0x16d46e = Math.max(1, this.bridgeFrames.length),
      _0x55cb89 = '';
    if (_0xd3f964 < this.bridgeFrames.length) {
      const _0x54f969 = this.readBridgeFrame(_0xd3f964),
        _0x10d4b5 = String(_0x54f969 || '').match(/^VCMC2:(\d+):(\d+):(\d+):([A-Za-z0-9_-]*)$/);
      _0x10d4b5 &&
        ((_0x531dc9 = Number(_0x10d4b5[1])),
        (_0x26a0f7 = Number(_0x10d4b5[2])),
        (_0x16d46e = Number(_0x10d4b5[3])),
        (_0x55cb89 = _0x10d4b5[4] || ''));
    }
    return [
      'VCMC3',
      _0x46196c,
      _0x531dc9,
      _0x26a0f7,
      _0x16d46e,
      this.worldV3AckSequence,
      this.worldV3AckPart,
      _0x4ca922,
      _0x55cb89,
    ].join(':');
  }
  static _worldV3Target(_0x2d8ac3) {
    const _0x1ef99e = this._norm(_0x2d8ac3 || '');
    if (!_0x1ef99e) return undefined;
    return world
      .getPlayers()
      .find((_0x2a1bac) => _0x2a1bac.isValid && this._norm(_0x2a1bac.name) === _0x1ef99e);
  }
  static applyWorldV3Event(_0x118082, _0x3d3e97, _0x1378b9) {
    try {
      const _0x4553ad = this._worldV3Target(_0x3d3e97);
      if (_0x118082 === 'ch') {
        const _0x3877fe = base64urlDecode(_0x1378b9);
        if (_0x4553ad && _0x3877fe) _0x4553ad.sendMessage(_0x3877fe);
        return;
      }
      if (_0x118082 === 'mu') {
        if (_0x4553ad)
          this.receiveVoiceState(
            _0x4553ad,
            String(_0x1378b9).toLowerCase() === 'off' ? 'off' : 'on',
          );
        return;
      }
      if (_0x118082 === 'di') {
        if (_0x4553ad) this.receiveVoiceState(_0x4553ad, 'disconnected');
        return;
      }
      if (_0x118082 === 'vl') {
        if (_0x4553ad) this.receiveVoiceLevel(_0x4553ad, _0x1378b9);
        return;
      }
      const _0x18d865 = {
          bh: 'vcmc:bridge_hello',
          cf: 'vcmc:bridge_config',
          vr: 'vcmc:bridge_verify_result',
          sr: 'vcmc:bridge_settings_result',
          ns: 'vcmc:bridge_need_sfx',
          sa: 'vcmc:bridge_sfx_ack',
          rr: 'vcmc:bridge_restart',
          nt: 'vcmc:bridge_notice',
        },
        _0x49b2c3 = _0x18d865[_0x118082];
      if (_0x49b2c3)
        this.applyBridgeEvent(_0x49b2c3, _0x4553ad, _0x1378b9 === '-' ? '' : _0x1378b9);
    } catch (_0x47077d) {
      console.warn('[VCMC] Invalid WORLD v3 downlink: ' + _0x47077d);
    }
  }
  static receiveWorldV3Sync(_0x442f4f, _0x559edd, _0x424961, _0x33220f) {
    const _0xaa2923 = String(_0x442f4f || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 12);
    if (_0xaa2923.length >= 4) this.roomId = _0xaa2923;
    this._markBridgeActivity(true);
    const _0xe8f49f = String(_0x424961 || '').match(
      /^(\d+)\.([a-z0-9]{2,4})\.([A-Za-z0-9-]{1,20}|-)\.(\d+)\.(\d+)$/,
    );
    if (_0xe8f49f) {
      const _0x1322e1 = Number(_0xe8f49f[1]),
        _0x46d8df = _0xe8f49f[2],
        _0x2ac99f = _0xe8f49f[3],
        _0x2c98bd = Number(_0xe8f49f[4]),
        _0x2e8837 = Number(_0xe8f49f[5]);
      if (_0x1322e1 === 0 && _0x46d8df === 'no') {
      } else {
        if (
          Number.isSafeInteger(_0x1322e1) &&
          _0x1322e1 > 0 &&
          Number.isSafeInteger(_0x2c98bd) &&
          _0x2c98bd >= 0 &&
          Number.isSafeInteger(_0x2e8837) &&
          _0x2e8837 >= 1 &&
          _0x2e8837 <= 160 &&
          _0x2c98bd < _0x2e8837
        ) {
          ((this.worldV3AckSequence = _0x1322e1), (this.worldV3AckPart = _0x2c98bd));
          if (!this.worldV3Applied.has(_0x1322e1)) {
            let _0x2c9056 = this.worldV3Assemblies.get(_0x1322e1);
            (!_0x2c9056 ||
              _0x2c9056.kind !== _0x46d8df ||
              _0x2c9056.target !== _0x2ac99f ||
              _0x2c9056.total !== _0x2e8837) &&
              ((_0x2c9056 = {
                kind: _0x46d8df,
                target: _0x2ac99f,
                total: _0x2e8837,
                chunks: new Array(_0x2e8837),
                bytes: 0,
                received: 0,
              }),
              this.worldV3Assemblies.set(_0x1322e1, _0x2c9056));
            if (typeof _0x2c9056.chunks[_0x2c98bd] !== 'string') {
              const _0x373004 = String(_0x33220f || '');
              ((_0x2c9056.chunks[_0x2c98bd] = _0x373004 === '-' ? '' : _0x373004),
                (_0x2c9056.bytes += _0x373004.length),
                _0x2c9056.received++);
            }
            if (_0x2c9056.bytes > 32 * 1024) this.worldV3Assemblies.delete(_0x1322e1);
            else {
              if (_0x2c9056.received === _0x2c9056.total) {
                const _0x1a7e02 = _0x2c9056.chunks.join('');
                (this.worldV3Assemblies.delete(_0x1322e1), this.worldV3Applied.add(_0x1322e1));
                while (this.worldV3Applied.size > 64) {
                  this.worldV3Applied.delete(this.worldV3Applied.values().next().value);
                }
                system.run(() => this.applyWorldV3Event(_0x46d8df, _0x2ac99f, _0x1a7e02));
              }
            }
            while (this.worldV3Assemblies.size > 8) {
              this.worldV3Assemblies.delete(this.worldV3Assemblies.keys().next().value);
            }
          }
        }
      }
    }
    return this.worldV3Frame(_0x559edd);
  }
  static receiveWorldSync(_0x4dfe01, _0x408b15) {
    const _0x426230 = String(_0x4dfe01 || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 12);
    if (_0x426230.length >= 4) this.roomId = _0x426230;
    this._markBridgeActivity(true);
    try {
      const _0x34f5c3 = _0x408b15 ? base64ToJson(String(_0x408b15).trim()) : undefined;
      for (const _0x23d65a of _0x34f5c3?.['commands']?.['slice'](0, 4) || []) {
        const _0x38a85c = String(_0x23d65a || '').trim(),
          _0x37ba5d = _0x38a85c.match(
            /^execute as "([^"]+)" run scriptevent ([^\s]+)(?:\s+([\s\S]*))?$/,
          );
        if (_0x37ba5d) {
          const _0x15f9b8 = this._norm(_0x37ba5d[1]),
            _0x54e112 = world
              .getPlayers()
              .find((_0x1aaa08) => _0x1aaa08.isValid && this._norm(_0x1aaa08.name) === _0x15f9b8);
          if (_0x54e112) this.applyBridgeEvent(_0x37ba5d[2], _0x54e112, _0x37ba5d[3] || '');
          continue;
        }
        const _0x3ff3f8 = _0x38a85c.match(/^scriptevent ([^\s]+)(?:\s+([\s\S]*))?$/);
        _0x3ff3f8 && this.applyBridgeEvent(_0x3ff3f8[1], undefined, _0x3ff3f8[2] || '');
      }
    } catch (_0x266c51) {
      console.warn('[VCMC] Invalid bridge-sync controls: ' + _0x266c51);
    }
    this.bridgeSignature = '';
  }
  static receiveWorldRadarSync(_0x2b58d4, _0x434557, _0x1d4442, _0x2533a5) {
    const _0x5c7adc = String(_0x2b58d4 || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 12);
    if (_0x5c7adc.length >= 4) this.roomId = _0x5c7adc;
    this._markBridgeActivity(true);
    const _0x14cef9 = this._norm(_0x434557 || ''),
      _0x544880 = String(_0x1d4442 || '').toLowerCase();
    if (!_0x14cef9 || !_0x544880) return;
    const _0x1a47c6 = world
      .getPlayers()
      .find((_0x3277cb) => _0x3277cb.isValid && this._norm(_0x3277cb.name) === _0x14cef9);
    if (!_0x1a47c6) return;
    if (_0x544880 === 'on' || _0x544880 === 'off') this.receiveVoiceState(_0x1a47c6, _0x544880);
    else {
      if (_0x544880 === 'di') this.receiveVoiceState(_0x1a47c6, 'disconnected');
      else
        _0x544880 === 'level' &&
          this.receiveVoiceLevel(_0x1a47c6, Math.max(0, Math.min(100, Number(_0x2533a5) | 0)));
    }
  }
  static applyBridgeEvent(_0x2d051f, _0x1b4c20, _0x1d2fbb) {
    try {
      if (_0x2d051f === 'vcmc:mute') {
        this.receiveVoiceState(
          _0x1b4c20,
          String(_0x1d2fbb || '').includes('vcmc_off') ? 'off' : 'on',
        );
        return;
      }
      if (_0x2d051f === 'vcmc:di') {
        this.receiveVoiceState(_0x1b4c20, 'disconnected');
        return;
      }
      if (_0x2d051f === 'vcmc:voice_level') {
        this.receiveVoiceLevel(_0x1b4c20, String(_0x1d2fbb || '').replace(/;.*$/, ''));
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_hello') {
        const _0x4ce3e6 = base64ToJson(String(_0x1d2fbb || '').trim()),
          _0x1aa72f = String(_0x4ce3e6?.['roomId'] || '')
            .replace(/[^A-Za-z0-9]/g, '')
            .slice(0, 12);
        if (_0x1aa72f.length >= 4) this.roomId = _0x1aa72f;
        (this._markBridgeActivity(false), (this.bridgeSignature = ''));
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_config') {
        this.receiveConfig(_0x1b4c20, String(_0x1d2fbb || '').trim());
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_verify_result') {
        this.receiveVerificationResult(_0x1b4c20, String(_0x1d2fbb || '').trim());
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_settings_result') {
        this.receiveSettingsResult(_0x1b4c20, String(_0x1d2fbb || '').trim());
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_need_sfx') {
        ((this.sfxCatalogDirty = true), (this.bridgeSignature = ''));
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_sfx_ack') {
        String(_0x1d2fbb || '').trim() === String(this.sfxCatalogRevision) &&
          ((this.sfxCatalogDirty = false), (this.bridgeSignature = ''));
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_restart') {
        for (const _0x3740e3 of world.getPlayers()) {
          _0x3740e3.isValid &&
            _0x3740e3.sendMessage(t(this.langOf(_0x3740e3), 'server_restart_notice'));
        }
        return;
      }
      if (_0x2d051f === 'vcmc:bridge_notice') {
        const _0x48ec4a = base64urlDecode(String(_0x1d2fbb || '').trim());
        if (_0x48ec4a) world.sendMessage(_0x48ec4a);
      }
    } catch (_0x217e97) {
      console.warn('[VCMC] Invalid WORLD bridge event ' + _0x2d051f + ': ' + _0x217e97);
    }
  }
  static receiveVoiceState(_0x13776b, _0x5c47c9) {
    if (!(_0x13776b instanceof Player) || !_0x13776b.isValid) return;
    const _0x16b19f = this._norm(_0x13776b.name);
    let _0x41a52d = this.playerInfo.get(_0x16b19f);
    if (!_0x41a52d) _0x41a52d = { state: 'PENDING', notified: false };
    if (_0x5c47c9 === 'disconnected')
      ((_0x41a52d.state = 'PENDING'),
        (_0x41a52d.connectedAt = 0),
        this.playerSettings.delete(_0x16b19f),
        this.megaphonePlayers.delete(_0x16b19f),
        this.appMuteState.delete(_0x16b19f),
        this._setVoiceState(_0x13776b, 'disconnected'),
        this._updateSpeakingIcon(_0x13776b, 0, false, false),
        this.setVoiceScore(_0x13776b, -2, true, true));
    else {
      const _0x4b960f = _0x41a52d.state !== 'CONNECTED';
      ((_0x41a52d.state = 'CONNECTED'), (_0x41a52d.notified = false));
      if (_0x4b960f) _0x41a52d.connectedAt = Date.now();
      const _0x188b25 = _0x5c47c9 === 'off';
      (this.appMuteState.set(_0x16b19f, _0x188b25),
        this._setVoiceState(_0x13776b, _0x188b25 ? 'off' : 'on'),
        this.setVoiceScore(_0x13776b, _0x188b25 ? -1 : 0, true, true),
        _0x4b960f && _0x13776b.sendMessage(t(this.langOf(_0x13776b), 'connected')));
    }
    (this.playerInfo.set(_0x16b19f, _0x41a52d), (this.bridgeSignature = ''));
  }
  static receiveVoiceLevel(_0x4f6d43, _0x4083ca) {
    if (!(_0x4f6d43 instanceof Player) || !_0x4f6d43.isValid) return;
    const _0xc16419 = this._norm(_0x4f6d43.name),
      _0x3ebea3 = this.playerInfo.get(_0xc16419)?.['state'] === 'CONNECTED',
      _0x53a519 = this.appMuteState.get(_0xc16419) === true,
      _0x475c11 = Math.max(0, Math.min(100, Number(_0x4083ca) | 0));
    (this._updateSpeakingIcon(_0x4f6d43, _0x475c11, _0x3ebea3, _0x53a519),
      this.setVoiceScore(
        _0x4f6d43,
        !_0x3ebea3 ? -2 : _0x53a519 ? -1 : _0x475c11,
        false,
        !_0x3ebea3 || _0x53a519,
      ));
    if (_0x475c11 > 5) {
      this.lastVoiceActivityMs = this.lastVoiceActivityMs || new Map();
      this.lastVoiceActivityMs.set(_0xc16419, Date.now());
    }
  }
  static receiveConfig(_0x354e08, _0x35290c) {
    if (!(_0x354e08 instanceof Player) || !_0x354e08.isValid) return;
    try {
      const _0x43f46c = base64ToJson(_0x35290c);
      if (!_0x43f46c || typeof _0x43f46c !== 'object' || Array.isArray(_0x43f46c)) return;
      (this.playerSettings.set(this._norm(_0x354e08.name), _0x43f46c), (this.bridgeSignature = ''));
    } catch (_0x1341df) {
      console.warn('[VCMC] Invalid WORLD config frame: ' + _0x1341df);
    }
  }
  static receiveVerificationResult(_0xbcfd1c, _0x188ec3) {
    if (!(_0xbcfd1c instanceof Player) || !_0xbcfd1c.isValid) return;
    try {
      const _0x41bb21 = base64ToJson(_0x188ec3),
        _0x1a0ed4 = String(_0x41bb21?.['code'] || ''),
        _0x14664a = this._norm(_0x41bb21?.['name'] || _0xbcfd1c.name),
        _0x4e5e4e = this.pendingVerifications.find(
          (_0x174523) =>
            !_0x174523.resolved &&
            _0x174523.code === _0x1a0ed4 &&
            this._norm(_0x174523.name) === _0x14664a,
        );
      if (!_0x4e5e4e) return;
      _0x4e5e4e.resolved = true;
      const _0x28d2d8 = {
        verified: 'verify_success',
        code_not_found: 'verify_code_not_found',
        gamertag_mismatch: 'verify_gamertag_mismatch',
        room_mismatch: 'verify_room_mismatch',
      };
      (_0xbcfd1c.sendMessage(
        t(this.langOf(_0xbcfd1c), _0x28d2d8[_0x41bb21?.['status']] || 'verify_failed'),
      ),
        (this.pendingVerifications = this.pendingVerifications.filter(
          (_0x2fd1ab) => !_0x2fd1ab.resolved,
        )),
        (this.bridgeSignature = ''));
    } catch (_0x3f6fb2) {
      console.warn('[VCMC] Invalid WORLD verification result: ' + _0x3f6fb2);
    }
  }
  static receiveSettingsResult(_0xdb7e1b, _0x5cd3d1) {
    if (!(_0xdb7e1b instanceof Player) || !_0xdb7e1b.isValid) return;
    try {
      const _0x2d5b80 = base64ToJson(_0x5cd3d1),
        _0x39ca6a = String(_0x2d5b80?.['id'] || ''),
        _0x541a2d = this.bridgeSettingsQueue.get(_0x39ca6a);
      if (!_0x541a2d) return;
      (this.bridgeSettingsQueue.delete(_0x39ca6a),
        (this.bridgeSignature = ''),
        _0xdb7e1b.sendMessage(
          t(
            this.langOf(_0xdb7e1b),
            _0x2d5b80?.['ok'] === true ? 'settings_applied' : 'cant_contact',
          ),
        ));
    } catch (_0x18f565) {
      console.warn('[VCMC] Invalid WORLD settings result: ' + _0x18f565);
    }
  }
  static async _sendCoords() {
    (this.bridgeRefreshTicks++,
      (!this.bridgeSignature || this.bridgeRefreshTicks >= 5) &&
        ((this.bridgeRefreshTicks = 0), this._refreshBridgeSnapshot()),
      this._refreshRadarFrame());
  }
  static _updatePlayer(_0x50b20c, _0x3bfbb9, _0x275ec5) {
    const _0x1170a4 = this._norm(_0x50b20c.name);
    let _0x38ff0f = this.playerInfo.get(_0x1170a4);
    !_0x38ff0f &&
      ((_0x38ff0f = { state: 'PENDING', notified: false }),
      this.playerInfo.set(_0x1170a4, _0x38ff0f));
    const _0x319d6f = _0x38ff0f.state === 'CONNECTED',
      _0x2ef4d6 = _0x3bfbb9.has(_0x1170a4);
    if (!_0x319d6f && _0x2ef4d6)
      ((_0x38ff0f.state = 'CONNECTED'),
        (_0x38ff0f.notified = false),
        (_0x38ff0f.connectedAt = Date.now()),
        this.playerInfo.set(_0x1170a4, _0x38ff0f),
        _0x50b20c.sendMessage(t(State.langOf(_0x50b20c), 'connected')),
        this._setVoiceState(_0x50b20c, _0x275ec5.has(_0x1170a4) ? 'off' : 'on'));
    else {
      if (_0x319d6f && !_0x2ef4d6) {
        ((_0x38ff0f.state = 'PENDING'),
          (_0x38ff0f.notified = true),
          (_0x38ff0f.connectedAt = 0),
          this.playerInfo.set(_0x1170a4, _0x38ff0f),
          this.lastSentPos.delete(_0x1170a4),
          this.playerSettings.delete(_0x1170a4));
        const _0xa6da7d = this.megaphonePlayers.delete(_0x1170a4);
        (this._setVoiceState(_0x50b20c, 'disconnected'),
          _0xa6da7d &&
            system.runTimeout(() => {
              if (!_0x50b20c.isValid || this.megaphonePlayers.has(_0x1170a4)) return;
              this._setMegaphoneHud(_0x50b20c, false);
            }, 1),
          _0x50b20c.sendMessage(t(State.langOf(_0x50b20c), 'app_disconnected')));
      } else
        !_0x2ef4d6
          ? !_0x38ff0f.notified &&
            ((_0x38ff0f.notified = true),
            this.playerInfo.set(_0x1170a4, _0x38ff0f),
            this._setVoiceState(_0x50b20c, 'disconnected'),
            _0x50b20c.sendMessage(t(State.langOf(_0x50b20c), 'not_in_app')))
          : this._setVoiceState(_0x50b20c, _0x275ec5.has(_0x1170a4) ? 'off' : 'on');
    }
    return !_0x319d6f && _0x2ef4d6;
  }
  static _setVoiceState(_0x4ce7bd, _0xc0df66, _0x240a29 = false) {
    if (!_0x4ce7bd || !_0x4ce7bd.isValid) return;
    if (this.bridgeUnavailable) _0xc0df66 = 'disconnected';
    const _0x166f50 = this._norm(_0x4ce7bd.name);
    if (!_0x240a29 && this.lastVoiceState.get(_0x166f50) === _0xc0df66) return;
    this.lastVoiceState.set(_0x166f50, _0xc0df66);
    const _0x4feba1 = _0xc0df66 === 'on' ? TAG_A : _0xc0df66 === 'off' ? TAG_B : TAG_C,
      _0xa91d53 = _0xc0df66 === 'on' ? 'vcmc_on;' : _0xc0df66 === 'off' ? 'vcmc_off;' : 'vcmc_di;';
    if (this.settings.showTitles) _0x4ce7bd.onScreenDisplay.setTitle(_0xa91d53);
    if (this.settings.showIcons) this._applyIcon(_0x4ce7bd, _0x4feba1);
    else this._stripIcon(_0x4ce7bd);
  }
  static _updateSpeakingIcon(_0x5d8d9f, _0x5266fd, _0x23ae9e, _0x530132) {
    if (!_0x5d8d9f?.['isValid']) return;
    this.bridgeUnavailable && ((_0x23ae9e = false), (_0x530132 = false));
    const _0x490b5a = this._norm(_0x5d8d9f.name),
      _0x57c683 = _0x23ae9e && !_0x530132 && _0x5266fd > 15,
      _0x788919 = this.lastSpeakingState.get(_0x490b5a) === true;
    if (_0x788919 === _0x57c683 && this.lastSpeakingState.has(_0x490b5a)) return;
    this.lastSpeakingState.set(_0x490b5a, _0x57c683);
    if (!this.settings.showIcons) return;
    const _0xdf80c9 = _0x57c683 ? TAG_D : !_0x23ae9e ? TAG_C : _0x530132 ? TAG_B : TAG_A;
    this._applyIcon(_0x5d8d9f, _0xdf80c9);
  }
  static _setMegaphoneHud(_0x33199e, _0x47e5b8) {
    if (!_0x33199e?.['isValid']) return;
    if (this.bridgeUnavailable) _0x47e5b8 = false;
    if (_0x47e5b8 && !this.settings.showTitles) return;
    _0x33199e.onScreenDisplay.setTitle(_0x47e5b8 ? CMD_MEG_ON : CMD_MEG_OFF);
  }
  static _stripIcon(_0x5297f6) {
    for (const _0x23d962 of BRIDGE_TAGS) {
      _0x5297f6.nameTag.includes(_0x23d962) &&
        (_0x5297f6.nameTag = _0x5297f6.nameTag.replace(_0x23d962 + ' ', '').replace(_0x23d962, ''));
    }
  }
  static applyDisplayToAll() {
    (this.lastVoiceState.clear(), this.lastSpeakingState.clear());
    for (const _0x144e33 of world.getPlayers()) {
      if (!_0x144e33.isValid) continue;
      if (this.bridgeUnavailable) this._setVoiceState(_0x144e33, 'disconnected', true);
      else {
        if (this.settings.showIcons) {
          const _0x139317 = this.playerInfo.get(this._norm(_0x144e33.name));
          this._applyIcon(_0x144e33, _0x139317?.['state'] === 'CONNECTED' ? TAG_A : TAG_C);
        } else this._stripIcon(_0x144e33);
      }
      this._setMegaphoneHud(
        _0x144e33,
        this.settings.showTitles && this.megaphonePlayers.has(this._norm(_0x144e33.name)),
      );
    }
  }
  static saveSettings() {
    this.roomSettingsCache = undefined;
    try {
      (world.setDynamicProperty(OBJ_SHOW_ICONS, this.settings.showIcons),
        world.setDynamicProperty(OBJ_SHOW_TITLES, this.settings.showTitles),
        world.setDynamicProperty(OBJ_GROUPS, this.settings.groups),
        world.setDynamicProperty(OBJ_HEAR_SPECTATORS, this.settings.hearSpectators),
        world.setDynamicProperty(OBJ_SPATIAL_AUDIO, this.settings.spatialAudio),
        world.setDynamicProperty(OBJ_REQUIRE_AUTH, this.settings.requireAuth),
        world.setDynamicProperty(OBJ_COORD_INTERVAL, this.settings.coordInterval),
        world.setDynamicProperty(OBJ_MAX_GROUPS_PP, this.settings.maxGroupsPerPlayer),
        world.setDynamicProperty(OBJ_ENV_SFX, this.settings.environmentalSfx),
        world.setDynamicProperty(OBJ_ENV_WATER, this.settings.environmentalWater),
        world.setDynamicProperty(OBJ_ENV_LAVA, this.settings.environmentalLava),
        world.setDynamicProperty(OBJ_ENV_DIMENSIONS, this.settings.environmentalDimensions),
        world.setDynamicProperty(OBJ_ENV_CAVES, this.settings.environmentalCaves));
    } catch (_0x2eeed2) {}
  }
  static roomSettingsSnapshot() {
    if (this.roomSettingsCache) return this.roomSettingsCache;
    const _0x456ecc = [],
      _0x56c401 = [];
    if (this.settings.groups)
      for (const _0x357513 of this.groups.values()) {
        if (!_0x357513.globalVoice) continue;
        _0x456ecc.push(_0x357513.number);
        if (_0x357513.proximityOutside) _0x56c401.push(_0x357513.number);
      }
    return (
      (this.roomSettingsCache = {
        groups: this.settings.groups,
        hearSpectators: this.settings.hearSpectators,
        requireAuth: this.settings.requireAuth,
        spatialAudio: this.settings.spatialAudio,
        coordInterval: this.settings.coordInterval,
        globalVoiceGroups: _0x456ecc,
        outsideProximityGroups: _0x56c401,
      }),
      this.roomSettingsCache
    );
  }
  static async pushPlayerSettings(_0x5626b7, _0xba133b) {
    if (!(_0x5626b7 instanceof Player) || !_0x5626b7.isValid) return;
    const _0x243baf = '' + Date.now().toString(36) + (++this.bridgeSettingsSequence).toString(36);
    this.bridgeSettingsQueue.set(_0x243baf, {
      id: _0x243baf,
      player: this._norm(_0x5626b7.name),
      gamertag: _0x5626b7.name,
      settings: _0xba133b,
    });
    while (this.bridgeSettingsQueue.size > 64) {
      const _0x254d24 = this.bridgeSettingsQueue.keys().next().value;
      this.bridgeSettingsQueue.delete(_0x254d24);
    }
    ((this.bridgeSignature = ''), this._refreshBridgeSnapshot());
  }
  static _applyIcon(_0x596185, _0x111be2) {
    let _0x36729f = false;
    for (const _0x29bdd7 of BRIDGE_TAGS) {
      if (_0x29bdd7 !== _0x111be2 && _0x596185.nameTag.includes(_0x29bdd7)) {
        ((_0x596185.nameTag = _0x596185.nameTag.replace(_0x29bdd7, _0x111be2)), (_0x36729f = true));
        break;
      }
    }
    !_0x36729f &&
      !_0x596185.nameTag.includes(_0x111be2) &&
      (_0x596185.nameTag = _0x111be2 + ' ' + _0x596185.nameTag);
  }
  static restorePlayerSfx() {
    this.playerSfx.clear();
    try {
      const _0x117b6c = world.getDynamicProperty(OBJ_PLAYER_SFX);
      if (typeof _0x117b6c !== 'string' || !_0x117b6c) return;
      const _0xa281e5 = JSON.parse(_0x117b6c);
      if (!_0xa281e5 || typeof _0xa281e5 !== 'object' || Array.isArray(_0xa281e5)) return;
      for (const [_0xe99dbd, _0x10e4ba] of Object.entries(_0xa281e5)) {
        const _0x3e8580 = this._norm(_0xe99dbd),
          _0x7889a9 = ['normal', 'cave', 'water', 'echo', 'radio'],
          _0x27317b =
            typeof _0x10e4ba === 'number'
              ? _0x7889a9[Number(_0x10e4ba) | 0]
              : this.normalizeSfxName(_0x10e4ba);
        _0x3e8580 &&
          _0x27317b &&
          (this.isBuiltinSfx(_0x27317b) || this.customSfx.has(_0x27317b)) &&
          this.playerSfx.set(_0x3e8580, _0x27317b);
      }
    } catch (_0x5b4cc6) {
      console.warn('[VCMC] Could not restore SFX assignments: ' + _0x5b4cc6);
    }
  }
  static savePlayerSfx() {
    try {
      world.setDynamicProperty(OBJ_PLAYER_SFX, JSON.stringify(Object.fromEntries(this.playerSfx)));
    } catch (_0x49c48b) {
      console.warn('[VCMC] Could not save SFX assignments: ' + _0x49c48b);
    }
  }
  static normalizeSfxName(_0x307b40) {
    return String(_0x307b40 || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 24);
  }
  static isBuiltinSfx(_0x53b31b) {
    return ['normal', 'cave', 'water', 'echo', 'radio', 'nether'].includes(_0x53b31b);
  }
  static sfxPreset(_0x1df7aa) {
    const _0x245937 = {
      normal: {
        base: 0,
        pitch: 0,
        gain: 0,
        lowpass: 0,
        highpass: 0,
        q: 0.707,
        distortion: 0,
        delay: 0,
        feedback: 0,
        wet: 0,
        dry: 1,
      },
      cave: {
        base: 1,
        pitch: 0,
        gain: 0,
        lowpass: 1800,
        highpass: 0,
        q: 0.707,
        distortion: 0,
        delay: 140,
        feedback: 0.5,
        wet: 0.55,
        dry: 0.7,
      },
      water: {
        base: 2,
        pitch: 0,
        gain: 0,
        lowpass: 500,
        highpass: 0,
        q: 1.2,
        distortion: 0,
        delay: 0,
        feedback: 0,
        wet: 0,
        dry: 1,
      },
      echo: {
        base: 3,
        pitch: 0,
        gain: 0,
        lowpass: 6000,
        highpass: 0,
        q: 0.707,
        distortion: 0,
        delay: 180,
        feedback: 0.28,
        wet: 0.4,
        dry: 0.85,
      },
      radio: {
        base: 4,
        pitch: 0,
        gain: 0,
        lowpass: 3000,
        highpass: 300,
        q: 0.707,
        distortion: 8,
        delay: 0,
        feedback: 0,
        wet: 0,
        dry: 1,
      },
      nether: { ...this.NETHER_SFX_DEFINITION, base: 3 },
    };
    return { ...(_0x245937[_0x1df7aa] || _0x245937.normal) };
  }
  static sanitizeSfxDefinition(_0x3ef966) {
    if (!_0x3ef966 || typeof _0x3ef966 !== 'object' || Array.isArray(_0x3ef966)) return undefined;
    const _0x3cc1b0 = ['normal', 'cave', 'water', 'echo', 'radio'],
      _0xac72ba =
        typeof _0x3ef966.base === 'number'
          ? _0x3cc1b0[Number(_0x3ef966.base) | 0] || 'normal'
          : this.normalizeSfxName(_0x3ef966.base || 'normal'),
      _0x4be1d3 = this.isBuiltinSfx(_0xac72ba) ? _0xac72ba : 'normal',
      _0x2aac0f = this.sfxPreset(_0x4be1d3),
      _0x1c7200 = (_0x279a31, _0x45b6fd, _0x5f5af8) => {
        if (_0x3ef966[_0x279a31] === undefined) return;
        const _0x236310 = Number(_0x3ef966[_0x279a31]);
        if (Number.isFinite(_0x236310))
          _0x2aac0f[_0x279a31] = Math.max(_0x45b6fd, Math.min(_0x5f5af8, _0x236310));
      };
    return (
      _0x1c7200('pitch', -6, 6),
      _0x1c7200('gain', -12, 6),
      _0x1c7200('lowpass', 0, 20000),
      _0x1c7200('highpass', 0, 10000),
      _0x1c7200('q', 0.1, 10),
      _0x1c7200('distortion', 0, 30),
      _0x1c7200('delay', 0, 500),
      _0x1c7200('feedback', 0, 0.85),
      _0x1c7200('wet', 0, 1),
      _0x1c7200('dry', 0, 1),
      _0x2aac0f.lowpass > 0 &&
        _0x2aac0f.highpass > 0 &&
        _0x2aac0f.highpass >= _0x2aac0f.lowpass &&
        (_0x2aac0f.highpass = Math.max(20, _0x2aac0f.lowpass - 20)),
      _0x2aac0f
    );
  }
  static restoreSfxCatalog() {
    (this.customSfx.clear(), (this.sfxCatalogDirty = true), (this.sfxRuntimeCache = undefined));
    try {
      const _0x20623d = world.getDynamicProperty(OBJ_SFX_CATALOG);
      if (typeof _0x20623d !== 'string' || !_0x20623d) return;
      const _0x197d33 = JSON.parse(_0x20623d),
        _0x59a334 = _0x197d33?.['effects'];
      if (!_0x59a334 || typeof _0x59a334 !== 'object' || Array.isArray(_0x59a334)) return;
      for (const [_0x5f3c42, _0x234218] of Object.entries(_0x59a334)) {
        if (this.customSfx.size >= this.SFX_MAX_CUSTOM) break;
        const _0x385934 = this.normalizeSfxName(_0x5f3c42),
          _0x42413c = this.sanitizeSfxDefinition(_0x234218);
        if (_0x385934 && _0x42413c) this.customSfx.set(_0x385934, _0x42413c);
      }
      const _0x48639a = Number(_0x197d33.revision);
      if (Number.isSafeInteger(_0x48639a) && _0x48639a > 0) this.sfxCatalogRevision = _0x48639a;
    } catch (_0x54247b) {
      console.warn('[VCMC] Could not restore the SFX catalog: ' + _0x54247b);
    }
  }
  static saveSfxCatalog() {
    try {
      world.setDynamicProperty(
        OBJ_SFX_CATALOG,
        JSON.stringify({
          revision: this.sfxCatalogRevision,
          effects: Object.fromEntries(this.customSfx),
        }),
      );
    } catch (_0x3a5e23) {
      console.warn('[VCMC] Could not save the SFX catalog: ' + _0x3a5e23);
    }
  }
  static touchSfxCatalog() {
    ((this.sfxCatalogRevision = (this.sfxCatalogRevision % 2147483646) + 1),
      (this.sfxCatalogDirty = true),
      (this.sfxRuntimeCache = undefined),
      this.saveSfxCatalog());
  }
  static buildSfxRuntimeCatalog() {
    if (this.sfxRuntimeCache) return this.sfxRuntimeCache;
    const _0x513d92 = { nether: 5 },
      _0x46f1a3 = { 5: this.NETHER_SFX_DEFINITION };
    return (
      [...this.customSfx.keys()].sort().forEach((_0x5da351, _0x59ec20) => {
        const _0x3390c4 = 6 + _0x59ec20;
        ((_0x513d92[_0x5da351] = _0x3390c4),
          (_0x46f1a3[String(_0x3390c4)] = this.customSfx.get(_0x5da351)));
      }),
      (this.sfxRuntimeCache = { idsByName: _0x513d92, effects: _0x46f1a3 }),
      this.sfxRuntimeCache
    );
  }
  static sfxFallbackCode(_0xbc7ead) {
    const _0x40c6ed = { normal: 0, cave: 1, water: 2, echo: 3, radio: 4, nether: 3 },
      _0x1e3b67 = this.customSfx.get(_0xbc7ead);
    return _0x1e3b67 ? Number(_0x1e3b67.base) | 0 : _0x40c6ed[_0xbc7ead] || 0;
  }
  static _setEnvironmentalSfx(_0x3e6c2b, _0x59baf9) {
    if (!_0x59baf9 || _0x59baf9 === 'normal') {
      this.environmentalSfx.delete(_0x3e6c2b);
      return;
    }
    this.environmentalSfx.get(_0x3e6c2b) !== _0x59baf9 &&
      this.environmentalSfx.set(_0x3e6c2b, _0x59baf9);
  }
  static _isCaveBiome(_0x2811bc, _0x56535a) {
    if (typeof _0x2811bc?.['getBiome'] !== 'function') return false;
    try {
      const _0xda552 = String(_0x2811bc.getBiome(_0x56535a)?.['id'] || '').toLowerCase();
      return _0xda552.includes('cave') || _0xda552.includes('deep_dark');
    } catch (_0x49aff1) {
      return false;
    }
  }
  static _isEnclosedByBlocks(_0x40de2d) {
    const _0x4f8b1f = _0x40de2d.dimension;
    if (typeof _0x4f8b1f?.['getBlockFromRay'] !== 'function') return false;
    const _0x271a6f = _0x40de2d.location,
      _0x55a79e = { x: _0x271a6f.x, y: _0x271a6f.y + 1.35, z: _0x271a6f.z },
      _0x42cc74 = [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
      ];
    let _0x111746 = 0;
    for (const _0x377daf of _0x42cc74) {
      try {
        const _0x2e4191 = _0x4f8b1f.getBlockFromRay(_0x55a79e, _0x377daf, {
          maxDistance: 10,
          includeLiquidBlocks: false,
          includePassableBlocks: false,
        });
        if (_0x2e4191 && ++_0x111746 >= 3) return true;
      } catch (_0x1105d3) {}
    }
    return false;
  }
  static _scanEnvironmentalSfx() {
    const _0x4a8b4f = this.settings;
    if (!_0x4a8b4f.environmentalSfx) {
      if (this.environmentalSfx.size > 0) this.environmentalSfx.clear();
      return;
    }
    const _0x1a410b = [];
    for (const _0x552a98 of world.getPlayers()) {
      if (!_0x552a98.isValid) continue;
      const _0x53341b = this._norm(_0x552a98.name),
        _0x4839ce = this.playerInfo.get(_0x53341b);
      if (
        this.playerSfx.has(_0x53341b) ||
        this.megaphonePlayers.has(_0x53341b) ||
        _0x4839ce?.['state'] !== 'CONNECTED'
      ) {
        this.environmentalSfx.delete(_0x53341b);
        continue;
      }
      const _0x5922b8 = this.settings.groups
        ? this.groups.get(this.playerGroup.get(_0x53341b))
        : undefined;
      if (_0x5922b8 && _0x5922b8.environmentalSfx !== true) {
        this.environmentalSfx.delete(_0x53341b);
        continue;
      }
      let _0x1457b6, _0x4a24dd;
      try {
        ((_0x1457b6 = _0x552a98.location), (_0x4a24dd = _0x552a98.dimension));
      } catch (_0x6c8488) {
        this.environmentalSfx.delete(_0x53341b);
        continue;
      }
      let _0x49ce3e = '';
      try {
        _0x49ce3e = String(
          _0x4a24dd.getBlock({
            x: Math.floor(_0x1457b6.x),
            y: Math.floor(_0x1457b6.y) + 1,
            z: Math.floor(_0x1457b6.z),
          })?.['typeId'] || '',
        ).toLowerCase();
      } catch (_0x3800e0) {}
      if (_0x4a8b4f.environmentalLava && _0x49ce3e.includes('lava')) {
        this._setEnvironmentalSfx(_0x53341b, 'water');
        continue;
      }
      if (_0x4a8b4f.environmentalWater && _0x49ce3e.includes('water')) {
        this._setEnvironmentalSfx(_0x53341b, 'water');
        continue;
      }
      const _0x41ad12 = String(_0x4a24dd.id || '').toLowerCase();
      if (_0x4a8b4f.environmentalDimensions && _0x41ad12 === 'minecraft:nether') {
        this._setEnvironmentalSfx(_0x53341b, 'nether');
        continue;
      }
      if (_0x4a8b4f.environmentalDimensions && _0x41ad12 === 'minecraft:the_end') {
        this._setEnvironmentalSfx(_0x53341b, 'echo');
        continue;
      }
      if (_0x4a8b4f.environmentalCaves && _0x41ad12 === 'minecraft:overworld') {
        const _0x2f9d2d = Math.floor(_0x1457b6.y);
        if (_0x2f9d2d <= 0) {
          this._setEnvironmentalSfx(_0x53341b, 'echo');
          continue;
        }
        if (_0x2f9d2d < 40) {
          if (this._isCaveBiome(_0x4a24dd, _0x1457b6)) {
            this._setEnvironmentalSfx(_0x53341b, 'echo');
            continue;
          }
          this.environmentalSfx.get(_0x53341b) !== 'echo' &&
            this.environmentalSfx.delete(_0x53341b);
          _0x1a410b.push({ player: _0x552a98, norm: _0x53341b });
          continue;
        }
      }
      this.environmentalSfx.delete(_0x53341b);
    }
    const _0xf758c3 = _0x1a410b.length;
    if (_0xf758c3 === 0) {
      this.environmentalRayCursor = 0;
      return;
    }
    const _0x3fb971 = Math.min(_0xf758c3, this.ENVIRONMENT_RAYCAST_BUDGET),
      _0x3ba444 = this.environmentalRayCursor % _0xf758c3;
    for (let _0x10b42c = 0; _0x10b42c < _0x3fb971; _0x10b42c++) {
      const _0xac2d8 = _0x1a410b[(_0x3ba444 + _0x10b42c) % _0xf758c3];
      if (!_0xac2d8.player.isValid || this.playerSfx.has(_0xac2d8.norm)) continue;
      this._setEnvironmentalSfx(
        _0xac2d8.norm,
        this._isEnclosedByBlocks(_0xac2d8.player) ? 'echo' : 'normal',
      );
    }
    this.environmentalRayCursor = (_0x3ba444 + _0x3fb971) % _0xf758c3;
  }
  static restoreGroups() {
    (this.groups.clear(), this.playerGroup.clear(), (this.roomSettingsCache = undefined));
    try {
      const _0x2a2a20 = world.getDynamicProperty(OBJ_VOICE_GROUPS);
      if (typeof _0x2a2a20 !== 'string' || !_0x2a2a20) return;
      const _0x78f5fa = JSON.parse(_0x2a2a20),
        _0x222931 = Array.isArray(_0x78f5fa?.['groups']) ? _0x78f5fa.groups : [];
      for (const _0x593ca3 of _0x222931) {
        const _0x3cb0fd = Number(_0x593ca3?.['number']) | 0;
        if (_0x3cb0fd < 1 || _0x3cb0fd > 255 || this.groups.has(_0x3cb0fd)) continue;
        const _0x3bc13d = new Set(
            (Array.isArray(_0x593ca3.members) ? _0x593ca3.members : [])
              .map((_0x20d41c) => this._norm(String(_0x20d41c)))
              .filter(Boolean),
          ),
          _0x38c85a = this._norm(_0x593ca3.ownerNorm || _0x593ca3.owner || ''),
          _0x1a7154 = _0x593ca3.globalVoice !== false,
          _0x117209 = {};
        if (_0x593ca3.memberNames && typeof _0x593ca3.memberNames === 'object')
          for (const [_0x39e402, _0x2487b2] of Object.entries(_0x593ca3.memberNames)) {
            const _0x468210 = this._norm(_0x39e402);
            if (_0x468210) _0x117209[_0x468210] = String(_0x2487b2).slice(0, 40);
          }
        const _0x5cdda2 = new Set(
            (Array.isArray(_0x593ca3.trustedMembers) ? _0x593ca3.trustedMembers : [..._0x3bc13d])
              .map((_0x55fd37) => this._norm(String(_0x55fd37)))
              .filter(Boolean),
          ),
          _0x353ba4 = new Set(
            (Array.isArray(_0x593ca3.invites) ? _0x593ca3.invites : [])
              .map((_0x4a2588) => this._norm(String(_0x4a2588)))
              .filter(Boolean),
          );
        for (const _0xdeea1d of _0x3bc13d) {
          (!_0x117209[_0xdeea1d] &&
            (_0x117209[_0xdeea1d] =
              _0xdeea1d === _0x38c85a
                ? String(_0x593ca3.owner || _0xdeea1d).slice(0, 40)
                : _0xdeea1d),
            _0x5cdda2.add(_0xdeea1d));
        }
        if (_0x38c85a) _0x5cdda2.add(_0x38c85a);
        const _0x2f39b8 = {
          number: _0x3cb0fd,
          name: String(_0x593ca3.name || 'Group ' + _0x3cb0fd).slice(0, 40),
          password: String(_0x593ca3.password || '').slice(0, 40),
          owner: String(_0x593ca3.owner || _0x593ca3.ownerNorm || 'Unknown').slice(0, 40),
          ownerNorm: _0x38c85a,
          members: _0x3bc13d,
          memberNames: _0x117209,
          trustedMembers: _0x5cdda2,
          invites: _0x353ba4,
          adminManaged: _0x593ca3.adminManaged === true,
          globalVoice: _0x1a7154,
          proximityOutside: _0x1a7154 && _0x593ca3.proximityOutside === true,
          environmentalSfx: _0x593ca3.environmentalSfx === true,
        };
        this.groups.set(_0x3cb0fd, _0x2f39b8);
        for (const _0x35aac1 of _0x3bc13d) this.playerGroup.set(_0x35aac1, _0x3cb0fd);
      }
    } catch (_0x28e6b8) {
      console.warn('[VCMC] Could not restore groups: ' + _0x28e6b8);
    }
  }
  static saveGroups() {
    this.roomSettingsCache = undefined;
    try {
      const _0x25621d = [...this.groups.values()].map((_0x34e077) => ({
        number: _0x34e077.number,
        name: _0x34e077.name,
        password: _0x34e077.password || '',
        owner: _0x34e077.owner,
        ownerNorm: _0x34e077.ownerNorm,
        members: [..._0x34e077.members],
        memberNames: _0x34e077.memberNames || {},
        trustedMembers: [...(_0x34e077.trustedMembers || new Set(_0x34e077.members))],
        invites: [...(_0x34e077.invites || new Set())],
        adminManaged: _0x34e077.adminManaged === true,
        globalVoice: _0x34e077.globalVoice !== false,
        proximityOutside: _0x34e077.globalVoice !== false && _0x34e077.proximityOutside === true,
        environmentalSfx: _0x34e077.environmentalSfx === true,
      }));
      world.setDynamicProperty(OBJ_VOICE_GROUPS, JSON.stringify({ version: 2, groups: _0x25621d }));
    } catch (_0x493503) {
      console.warn('[VCMC] Could not save groups: ' + _0x493503);
    }
  }
  static groupObjective() {
    if (this.groupObjectiveCache) return this.groupObjectiveCache;
    try {
      return (
        (this.groupObjectiveCache =
          world.scoreboard.getObjective(OBJ_VCMC_GROUP) ||
          world.scoreboard.addObjective(OBJ_VCMC_GROUP, 'VCMC Group')),
        this.groupObjectiveCache
      );
    } catch (_0x147361) {
      return ((this.groupObjectiveCache = undefined), undefined);
    }
  }
  static voiceObjective() {
    if (this.voiceObjectiveCache) return this.voiceObjectiveCache;
    try {
      return (
        (this.voiceObjectiveCache =
          world.scoreboard.getObjective(OBJ_VCMC_VOICE) ||
          world.scoreboard.addObjective(OBJ_VCMC_VOICE, 'VCMC Voice')),
        this.voiceObjectiveCache
      );
    } catch (_0xa83969) {
      return ((this.voiceObjectiveCache = undefined), undefined);
    }
  }
  static setObjectiveScoreByNorm(_0x535996, _0x20c206, _0x1b2c14) {
    if (!_0x535996) return false;
    try {
      const _0x243104 = _0x535996
        .getParticipants()
        .find((_0x5bbde7) => this._norm(_0x5bbde7.displayName || '') === _0x20c206);
      if (!_0x243104) return false;
      return (_0x535996.setScore(_0x243104, _0x1b2c14 | 0), true);
    } catch (_0x3576f) {
      return false;
    }
  }
  static setPlayerGroupScore(_0xb1ad9, _0x26c1a3) {
    try {
      const _0x3d7583 = this.groupObjective();
      if (_0xb1ad9?.['isValid'] && _0x3d7583) _0x3d7583.setScore(_0xb1ad9, _0x26c1a3 | 0);
    } catch (_0x440330) {
      this.groupObjectiveCache = undefined;
    }
  }
  static setVoiceScore(_0x3c404f, _0x58f1f1, _0xc16e81 = false, _0x80575e = false) {
    if (!_0x3c404f?.['isValid']) return;
    const _0x2a2c4c = this._norm(_0x3c404f.name),
      _0x23482d = Number(_0x58f1f1),
      _0xfa37f2 = this.bridgeUnavailable
        ? -2
        : Math.max(-2, Math.min(100, Math.round(Number.isFinite(_0x23482d) ? _0x23482d : 0)));
    let _0x3da41e = _0xfa37f2;
    if (_0x3da41e < 0) this.voiceScoreHoldUntil.delete(_0x2a2c4c);
    else {
      if (_0x3da41e > 0) this.voiceScoreHoldUntil.set(_0x2a2c4c, Date.now() + MS_PER_SECOND);
      else
        !_0xc16e81 && !_0x80575e && Date.now() < (this.voiceScoreHoldUntil.get(_0x2a2c4c) || 0)
          ? (_0x3da41e = this.lastVoiceScores.get(_0x2a2c4c) || 0)
          : this.voiceScoreHoldUntil.delete(_0x2a2c4c);
    }
    if (!_0xc16e81 && this.lastVoiceScores.get(_0x2a2c4c) === _0x3da41e) return;
    try {
      const _0xd6477c = this.voiceObjective();
      if (!_0xd6477c) throw new Error('scoreboard objective unavailable');
      (_0xd6477c.setScore(_0x3c404f, _0x3da41e),
        this.lastVoiceScores.set(_0x2a2c4c, _0x3da41e),
        (this.voiceScoreWriteErrorShown = false));
    } catch (_0x55e6d5) {
      ((this.voiceObjectiveCache = undefined),
        !this.voiceScoreWriteErrorShown &&
          ((this.voiceScoreWriteErrorShown = true),
          console.warn('[VCMC] Could not write ' + OBJ_VCMC_VOICE + ': ' + _0x55e6d5)));
    }
  }
  static syncGroupForPlayer(_0x136550, _0x58a7fd = true) {
    if (!_0x136550?.['isValid']) return false;
    const _0x59f63f = this._norm(_0x136550.name),
      _0x2f35fe = this.groupObjective();
    if (!_0x2f35fe) return false;
    let _0x85425c;
    try {
      _0x85425c = _0x2f35fe.getScore(_0x136550);
    } catch (_0x5b0222) {}
    if (_0x85425c === undefined)
      return (this.setPlayerGroupScore(_0x136550, this.playerGroup.get(_0x59f63f) || 0), false);
    const _0x3aa3bc = Number(_0x85425c) | 0,
      _0x452a97 = _0x3aa3bc > 0 && this.groups.has(_0x3aa3bc),
      _0x16d38c = _0x452a97 ? _0x3aa3bc : undefined,
      _0x440cf7 = this.playerGroup.get(_0x59f63f);
    if (_0x3aa3bc === 0 && this.groups.get(_0x440cf7)?.['adminManaged'] === true)
      return (this.setPlayerGroupScore(_0x136550, _0x440cf7), false);
    if (_0x3aa3bc !== 0 && !_0x452a97) this.setPlayerGroupScore(_0x136550, 0);
    if (_0x440cf7 === _0x16d38c) return false;
    if (_0x440cf7 !== undefined) this.groups.get(_0x440cf7)?.['members'].delete(_0x59f63f);
    if (_0x16d38c === undefined) this.playerGroup.delete(_0x59f63f);
    else {
      this.playerGroup.set(_0x59f63f, _0x16d38c);
      const _0x104319 = this.groups.get(_0x16d38c);
      (_0x104319.members.add(_0x59f63f),
        (_0x104319.memberNames[_0x59f63f] = _0x136550.name),
        _0x104319.trustedMembers.add(_0x59f63f),
        _0x104319.invites.delete(_0x59f63f));
    }
    if (_0x58a7fd) this.saveGroups();
    return true;
  }
  static nextGroupNumber() {
    let _0x239764 = 1;
    while (_0x239764 <= 255 && this.groups.has(_0x239764)) _0x239764++;
    return _0x239764 <= 255 ? _0x239764 : undefined;
  }
  static defaultGroupName(_0x5d819f) {
    return 'Group #' + _0x5d819f;
  }
  static ownedGroupCount(_0x7165c3) {
    let _0x1509f2 = 0;
    for (const _0x8a1cf of this.groups.values()) {
      if (_0x8a1cf.ownerNorm === _0x7165c3 && _0x8a1cf.adminManaged !== true) _0x1509f2++;
    }
    return _0x1509f2;
  }
  static createGroup(_0x281c82, _0x3fddd6, _0x3e8c53, _0x508248 = true, _0x19f7f3 = false) {
    const _0x2ee886 = this._norm(_0x281c82.name),
      _0xf2e13b = Math.max(1, Math.min(20, this.settings.maxGroupsPerPlayer | 0)) || 3;
    if (this.ownedGroupCount(_0x2ee886) >= _0xf2e13b) return 'limit_reached';
    this.leaveGroupByNorm(_0x2ee886, _0x281c82);
    const _0x2fffe7 = this.nextGroupNumber();
    if (_0x2fffe7 === undefined) return undefined;
    const _0x5ebb98 = _0x508248 !== false,
      _0xb4d1ca = _0x5ebb98 && _0x19f7f3 === true;
    return (
      this.groups.set(_0x2fffe7, {
        number: _0x2fffe7,
        name: _0x3fddd6,
        password: _0x3e8c53 || '',
        owner: _0x281c82.name,
        ownerNorm: _0x2ee886,
        members: new Set([_0x2ee886]),
        memberNames: { [_0x2ee886]: _0x281c82.name },
        trustedMembers: new Set([_0x2ee886]),
        invites: new Set(),
        adminManaged: false,
        globalVoice: _0x5ebb98,
        proximityOutside: _0xb4d1ca,
        environmentalSfx: false,
      }),
      this.playerGroup.set(_0x2ee886, _0x2fffe7),
      this.setPlayerGroupScore(_0x281c82, _0x2fffe7),
      this.saveGroups(),
      _0x2fffe7
    );
  }
  static createAdminGroup(_0x1259e8, _0x18e7e4) {
    const _0x2354bb = Number(_0x18e7e4);
    if (
      !Number.isInteger(_0x2354bb) ||
      _0x2354bb < 1 ||
      _0x2354bb > 255 ||
      this.groups.has(_0x2354bb)
    )
      return undefined;
    const _0xe6269f = this._norm(_0x1259e8.name);
    return (
      this.groups.set(_0x2354bb, {
        number: _0x2354bb,
        name: this.defaultGroupName(_0x2354bb),
        password: '',
        owner: _0x1259e8.name,
        ownerNorm: _0xe6269f,
        members: new Set(),
        memberNames: {},
        trustedMembers: new Set([_0xe6269f]),
        invites: new Set(),
        adminManaged: true,
        globalVoice: true,
        proximityOutside: false,
        environmentalSfx: false,
      }),
      this.saveGroups(),
      this.groups.get(_0x2354bb)
    );
  }
  static joinGroup(_0x3404e8, _0x3a87a0, _0x5f2016 = false) {
    const _0x59fe61 = this.groups.get(_0x3a87a0);
    if (!_0x59fe61 || (_0x59fe61.adminManaged === true && !_0x5f2016)) return false;
    const _0x575efd = this._norm(_0x3404e8.name);
    return (
      this.leaveGroupByNorm(_0x575efd, _0x3404e8),
      _0x59fe61.members.add(_0x575efd),
      (_0x59fe61.memberNames[_0x575efd] = _0x3404e8.name),
      _0x59fe61.trustedMembers.add(_0x575efd),
      _0x59fe61.invites.delete(_0x575efd),
      this.playerGroup.set(_0x575efd, _0x3a87a0),
      this.setPlayerGroupScore(_0x3404e8, _0x3a87a0),
      this.saveGroups(),
      true
    );
  }
  static assignPlayerToGroupByName(_0x38ac64, _0x44ca44) {
    const _0x501b17 = this.groups.get(Number(_0x44ca44) | 0),
      _0x21ad51 = String(_0x38ac64 || '')
        .trim()
        .slice(0, 40),
      _0x73c877 = this._norm(_0x21ad51);
    if (!_0x501b17 || !_0x73c877) return undefined;
    const _0x1363f3 = [...world.getPlayers()].find(
      (_0x472756) => _0x472756.isValid && this._norm(_0x472756.name) === _0x73c877,
    );
    if (_0x1363f3) {
      const _0x2754ec = this.playerGroup.get(_0x73c877);
      return (
        this.joinGroup(_0x1363f3, _0x501b17.number, true),
        { name: _0x1363f3.name, online: _0x1363f3, previousNum: _0x2754ec }
      );
    }
    const _0x1e9471 = this.playerGroup.get(_0x73c877);
    return (
      _0x1e9471 !== undefined &&
        _0x1e9471 !== _0x501b17.number &&
        this.groups.get(_0x1e9471)?.['members'].delete(_0x73c877),
      this.playerGroup.set(_0x73c877, _0x501b17.number),
      _0x501b17.members.add(_0x73c877),
      (_0x501b17.memberNames[_0x73c877] = _0x21ad51),
      _0x501b17.trustedMembers.add(_0x73c877),
      _0x501b17.invites.delete(_0x73c877),
      this.setObjectiveScoreByNorm(this.groupObjective(), _0x73c877, _0x501b17.number),
      this.saveGroups(),
      { name: _0x21ad51, online: undefined, previousNum: _0x1e9471 }
    );
  }
  static leaveGroupByNorm(_0x2660b3, _0xe6f9b4) {
    const _0x35a76d = this.playerGroup.get(_0x2660b3);
    if (_0x35a76d === undefined) return;
    (this.playerGroup.delete(_0x2660b3), this.groups.get(_0x35a76d)?.['members'].delete(_0x2660b3));
    if (_0xe6f9b4?.['isValid']) this.setPlayerGroupScore(_0xe6f9b4, 0);
    this.saveGroups();
  }
  static leaveGroup(_0x326875) {
    const _0x3fcc94 = this._norm(_0x326875.name),
      _0x209d0f = this.playerGroup.get(_0x3fcc94);
    (this.leaveGroupByNorm(_0x3fcc94, _0x326875),
      _0x209d0f !== undefined &&
        _0x326875?.['isValid'] &&
        _0x326875.sendMessage(t(State.langOf(_0x326875), 'left_group', { num: _0x209d0f })));
  }
  static updateGroupSettings(_0x332a7e, _0x1524dc, _0x5133da, _0x26a0a7) {
    const _0x5d7c56 = this._norm(_0x332a7e.name),
      _0x578676 = this.playerGroup.get(_0x5d7c56),
      _0x2689fa = this.groups.get(_0x578676);
    if (!_0x2689fa || _0x2689fa.ownerNorm !== _0x5d7c56) return false;
    ((_0x2689fa.globalVoice = _0x1524dc !== false),
      (_0x2689fa.proximityOutside = _0x2689fa.globalVoice && _0x5133da === true),
      (_0x2689fa.environmentalSfx = _0x26a0a7 === true));
    if (!_0x2689fa.environmentalSfx) {
      for (const _0x232d48 of _0x2689fa.members) this.environmentalSfx.delete(_0x232d48);
    }
    return (this.saveGroups(), true);
  }
  static updateGroupSettingsByNumber(_0x5495e2, _0x5e3aed, _0x13a0ed) {
    const _0x3982c = this.groups.get(Number(_0x5495e2) | 0);
    if (!_0x3982c) return false;
    return (
      (_0x3982c.globalVoice = _0x5e3aed !== false),
      (_0x3982c.proximityOutside = _0x3982c.globalVoice && _0x13a0ed === true),
      this.saveGroups(),
      true
    );
  }
  static renameGroupByNumber(_0x49c7e2, _0x4b4aea) {
    const _0x4e9caa = this.groups.get(Number(_0x49c7e2) | 0);
    if (!_0x4e9caa) return undefined;
    return (
      (_0x4e9caa.name =
        String(_0x4b4aea || '')
          .trim()
          .slice(0, 40) || this.defaultGroupName(_0x4e9caa.number)),
      this.saveGroups(),
      _0x4e9caa.name
    );
  }
  static removePlayerFromGroupByNorm(_0x156eb0, _0x2bf336) {
    const _0xab79d9 = this.groups.get(Number(_0x156eb0) | 0);
    if (!_0xab79d9 || !_0xab79d9.members.has(_0x2bf336)) return false;
    (_0xab79d9.members.delete(_0x2bf336), _0xab79d9.invites.delete(_0x2bf336));
    if (this.playerGroup.get(_0x2bf336) === _0xab79d9.number) this.playerGroup.delete(_0x2bf336);
    const _0x5ea22d = [...world.getPlayers()].find(
      (_0x1b9821) => _0x1b9821.isValid && this._norm(_0x1b9821.name) === _0x2bf336,
    );
    if (_0x5ea22d) this.setPlayerGroupScore(_0x5ea22d, 0);
    else this.setObjectiveScoreByNorm(this.groupObjective(), _0x2bf336, 0);
    return (this.saveGroups(), true);
  }
  static pendingInvitations(_0x47dbb0) {
    const _0x2f5e51 = [];
    for (const _0x2050b4 of this.groups.values()) {
      if (_0x2050b4.invites?.['has'](_0x47dbb0) && !_0x2050b4.members.has(_0x47dbb0))
        _0x2f5e51.push(_0x2050b4);
    }
    return _0x2f5e51.sort(
      (_0x4c7fde, _0x2f1003) =>
        _0x4c7fde.name.localeCompare(_0x2f1003.name) || _0x4c7fde.number - _0x2f1003.number,
    );
  }
  static inviteToGroup(_0x183040, _0x13f3d7) {
    const _0x54b104 = this._norm(_0x183040.name),
      _0x2c40fa = this.groups.get(this.playerGroup.get(_0x54b104));
    if (!_0x2c40fa || _0x2c40fa.ownerNorm !== _0x54b104 || _0x2c40fa.adminManaged === true)
      return 'not_owner';
    const _0x1826f0 = this._norm(_0x13f3d7.name);
    if (!_0x1826f0 || _0x2c40fa.members.has(_0x1826f0)) return 'already_member';
    if (_0x2c40fa.invites.has(_0x1826f0)) return 'already_invited';
    return (_0x2c40fa.invites.add(_0x1826f0), this.saveGroups(), 'invited');
  }
  static declineInvitation(_0x4f4f54, _0x2dc3d9) {
    const _0x30cdb1 = this.groups.get(_0x2dc3d9);
    if (!_0x30cdb1) return false;
    const _0xca7cce = _0x30cdb1.invites.delete(this._norm(_0x4f4f54.name));
    if (_0xca7cce) this.saveGroups();
    return _0xca7cce;
  }
  static hasRememberedAccess(_0x322b0c, _0x204c37) {
    return _0x204c37?.['trustedMembers']?.['has'](this._norm(_0x322b0c.name)) === true;
  }
  static deleteGroupByNumber(_0x5ccb5e) {
    const _0x9a476a = this.groups.get(Number(_0x5ccb5e) | 0);
    if (!_0x9a476a) return false;
    const _0x532ab0 = this.groupObjective(),
      _0xdc158f = new Map();
    for (const _0x493f12 of world.getPlayers()) {
      if (_0x493f12.isValid) _0xdc158f.set(this._norm(_0x493f12.name), _0x493f12);
    }
    const _0x939fd3 = new Map();
    try {
      for (const _0x1eb5cb of _0x532ab0?.['getParticipants']() || []) {
        _0x939fd3.set(this._norm(_0x1eb5cb.displayName || ''), _0x1eb5cb);
      }
    } catch (_0x2a83ff) {}
    for (const _0x309fdc of _0x9a476a.members) {
      this.playerGroup.delete(_0x309fdc);
      const _0x247e3f = _0xdc158f.get(_0x309fdc) || _0x939fd3.get(_0x309fdc);
      if (_0x532ab0 && _0x247e3f)
        try {
          _0x532ab0.setScore(_0x247e3f, 0);
        } catch (_0x533519) {}
    }
    return (this.groups.delete(_0x9a476a.number), this.saveGroups(), true);
  }
  static deleteGroup(_0x5ec02f) {
    const _0x13287e = this._norm(_0x5ec02f.name),
      _0x446c7d = this.playerGroup.get(_0x13287e),
      _0x5db754 = this.groups.get(_0x446c7d);
    if (!_0x5db754 || _0x5db754.ownerNorm !== _0x13287e) return false;
    return this.deleteGroupByNumber(_0x446c7d);
  }
  static _norm(_0x1959c9) {
    return _0x1959c9.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  static _isSpectator(_0x395d94) {
    try {
      const _0x5d1bdf =
        typeof _0x395d94.getGameMode === 'function' ? _0x395d94.getGameMode() : _0x395d94.gameMode;
      return String(_0x5d1bdf).toLowerCase() === 'spectator';
    } catch (_0x5bfd32) {
      return false;
    }
  }
  static langOf(_0x31d315) {
    try {
      return this.langOfNorm(this._norm(_0x31d315.name));
    } catch (_0x1f9d15) {
      return 'en';
    }
  }
  static langOfNorm(_0x213919) {
    const _0x2cbbde = this.playerSettings.get(_0x213919);
    if (_0x2cbbde && typeof _0x2cbbde.language === 'string' && STRINGS[_0x2cbbde.language])
      return _0x2cbbde.language;
    return 'en';
  }
}
class UI {
  static async _show(_0x2982ca, _0x33a73e) {
    for (let _0x4819e3 = 0; _0x4819e3 < 6; _0x4819e3++) {
      const _0x54460e = await _0x2982ca.show(_0x33a73e);
      if (_0x54460e.canceled && _0x54460e.cancelationReason === 'UserBusy') {
        await system.waitTicks(10);
        continue;
      }
      return _0x54460e;
    }
    return undefined;
  }
  static SEARCH_THRESHOLD = 50;
  static async pickFromList(_0x29fbf1, _0x1df83a) {
    const {
        items: _0x510345,
        labelOf: _0x394fc3,
        sortKeyOf: sortKeyOf = _0x394fc3,
        iconOf: iconOf = null,
        titleKey: _0x8ebf64,
        titleVars: _0x5b2970,
        bodyKey: bodyKey = null,
        bodyVars: _0x1dab76,
        extraTop: extraTop = [],
        searchLabelKey: searchLabelKey = 'btn_search_list',
      } = _0x1df83a,
      _0x3855b4 = State.langOf(_0x29fbf1),
      _0x37a4d7 = Math.max(1, this.SEARCH_THRESHOLD);
    if (_0x510345.length <= this.SEARCH_THRESHOLD) {
      const _0x478fa7 = new ActionFormData().title(
        t(_0x3855b4, _0x8ebf64, _0x5b2970) + COLOR_BLACK,
      );
      if (bodyKey) _0x478fa7.body(t(_0x3855b4, bodyKey, _0x1dab76));
      const _0x1ba92a = [];
      for (const _0x43df0e of extraTop) {
        (_0x478fa7.button(
          t(_0x3855b4, _0x43df0e.labelKey, _0x43df0e.labelVars) + COLOR_DARK_BLUE,
          _0x43df0e.icon,
        ),
          _0x1ba92a.push({ type: 'extra', id: _0x43df0e.id }));
      }
      for (const _0x43ce11 of _0x510345) {
        (_0x478fa7.button(_0x394fc3(_0x43ce11), iconOf ? iconOf(_0x43ce11) : undefined),
          _0x1ba92a.push({ type: 'item', item: _0x43ce11 }));
      }
      (_0x478fa7.button(t(_0x3855b4, 'btn_back') + COLOR_DARK_BLUE, 'textures/ui/vcmc/icon_back'),
        _0x1ba92a.push({ type: 'back' }));
      const _0x5cd5b8 = await this._show(_0x478fa7, _0x29fbf1);
      if (!_0x5cd5b8 || _0x5cd5b8.canceled) return null;
      const _0x428886 = _0x1ba92a[_0x5cd5b8.selection];
      if (!_0x428886) return null;
      if (_0x428886.type === 'item') return { item: _0x428886.item };
      if (_0x428886.type === 'extra') return { extra: _0x428886.id };
      return 'back';
    }
    const _0x49db3c = [..._0x510345].sort((_0x74c8b6, _0x20d315) =>
      String(sortKeyOf(_0x74c8b6))
        .toLowerCase()
        .localeCompare(String(sortKeyOf(_0x20d315)).toLowerCase()),
    );
    let _0x18d420 = '',
      _0x43a083 = 0;
    for (;;) {
      const _0x4f225f = _0x18d420
          ? _0x49db3c.filter(
              (_0x20a628) =>
                String(_0x394fc3(_0x20a628)).toLowerCase().includes(_0x18d420) ||
                String(sortKeyOf(_0x20a628)).toLowerCase().includes(_0x18d420),
            )
          : _0x49db3c,
        _0x4dd585 = Math.max(1, Math.ceil(_0x4f225f.length / _0x37a4d7));
      if (_0x43a083 >= _0x4dd585) _0x43a083 = _0x4dd585 - 1;
      const _0x3575eb = _0x43a083 * _0x37a4d7,
        _0x2621d0 = _0x4f225f.slice(_0x3575eb, _0x3575eb + _0x37a4d7),
        _0x3b5564 = new ActionFormData().title(t(_0x3855b4, _0x8ebf64, _0x5b2970));
      if (bodyKey) _0x3b5564.body(t(_0x3855b4, bodyKey, _0x1dab76));
      const _0x4e7829 = [];
      for (const _0x2f5d94 of extraTop) {
        (_0x3b5564.button(
          t(_0x3855b4, _0x2f5d94.labelKey, _0x2f5d94.labelVars) + COLOR_DARK_BLUE,
          _0x2f5d94.icon,
        ),
          _0x4e7829.push({ type: 'extra', id: _0x2f5d94.id }));
      }
      const _0x4b0e0b = _0x18d420
        ? t(_0x3855b4, searchLabelKey) + '\n§e\"' + _0x18d420 + '\" · ' + _0x4f225f.length
        : t(_0x3855b4, searchLabelKey);
      (_0x3b5564.button(_0x4b0e0b, 'textures/ui/vcmc/icon_search'),
        _0x4e7829.push({ type: 'search' }));
      for (const _0x2df473 of _0x2621d0) {
        (_0x3b5564.button(_0x394fc3(_0x2df473), iconOf ? iconOf(_0x2df473) : undefined),
          _0x4e7829.push({ type: 'item', item: _0x2df473 }));
      }
      _0x43a083 > 0 &&
        (_0x3b5564.button(
          t(_0x3855b4, 'btn_page_prev') + COLOR_DARK_BLUE,
          'textures/ui/vcmc/icon_back',
        ),
        _0x4e7829.push({ type: 'prev' }));
      _0x43a083 < _0x4dd585 - 1 &&
        (_0x3b5564.button(
          t(_0x3855b4, 'btn_page_next') +
            '\n§7' +
            (_0x43a083 + 2) +
            ' / ' +
            _0x4dd585 +
            COLOR_DARK_BLUE,
          'textures/ui/vcmc/icon_next',
        ),
        _0x4e7829.push({ type: 'next' }));
      (_0x3b5564.button(t(_0x3855b4, 'btn_back') + COLOR_DARK_BLUE, 'textures/ui/vcmc/icon_back'),
        _0x4e7829.push({ type: 'back' }));
      const _0x2482c9 = await this._show(_0x3b5564, _0x29fbf1);
      if (!_0x2482c9 || _0x2482c9.canceled) return null;
      const _0x3e464d = _0x4e7829[_0x2482c9.selection];
      if (!_0x3e464d) return null;
      if (_0x3e464d.type === 'item') return { item: _0x3e464d.item };
      if (_0x3e464d.type === 'extra') return { extra: _0x3e464d.id };
      if (_0x3e464d.type === 'back') return 'back';
      if (_0x3e464d.type === 'prev') {
        _0x43a083--;
        continue;
      }
      if (_0x3e464d.type === 'next') {
        _0x43a083++;
        continue;
      }
      const _0x2b4e98 = new ModalFormData()
          .title(t(_0x3855b4, _0x8ebf64, _0x5b2970))
          .textField(
            t(_0x3855b4, 'search_field_label', { count: _0x49db3c.length }),
            t(_0x3855b4, 'search_field_placeholder'),
          ),
        _0x481ba2 = await this._show(_0x2b4e98, _0x29fbf1);
      if (!_0x481ba2 || _0x481ba2.canceled || !_0x481ba2.formValues) continue;
      const _0x4c88c7 = String(_0x481ba2.formValues[0] ?? '')
        .trim()
        .toLowerCase();
      if (
        _0x4c88c7 &&
        !_0x49db3c.some(
          (_0x164767) =>
            String(_0x394fc3(_0x164767)).toLowerCase().includes(_0x4c88c7) ||
            String(sortKeyOf(_0x164767)).toLowerCase().includes(_0x4c88c7),
        )
      ) {
        _0x29fbf1.sendMessage(t(_0x3855b4, 'search_no_results', { query: _0x4c88c7 }));
        continue;
      }
      ((_0x18d420 = _0x4c88c7), (_0x43a083 = 0));
    }
  }
  static async openAdmin(_0x1852da) {
    const _0x283963 = State.langOf(_0x1852da);
    if (_0x1852da.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
      _0x1852da.sendMessage(t(_0x283963, 'admin_only'));
      return;
    }
    return this.openAdminSettings(_0x1852da);
  }
  static async openAdminSettings(_0x3aa2a0) {
    const _0x21503c = State.langOf(_0x3aa2a0),
      _0x8148be = State.settings,
      _0x1e84c6 = _0x8148be.environmentalSfx === true,
      _0x13e093 = _0x8148be.groups
        ? Math.max(1, Math.min(20, _0x8148be.maxGroupsPerPlayer | 0)) || 3
        : 0,
      _0x16cf83 = new ModalFormData()
        .title(t(_0x21503c, 'global_settings_title'))
        .header(t(_0x21503c, 'header_admin_display'))
        .toggle(t(_0x21503c, 'toggle_show_icons'), { defaultValue: _0x8148be.showIcons })
        .toggle(t(_0x21503c, 'toggle_show_titles'), { defaultValue: _0x8148be.showTitles })
        .header(t(_0x21503c, 'header_admin_voice'))
        .slider(t(_0x21503c, 'slider_group_limit'), 0, 20, {
          valueStep: 1,
          defaultValue: _0x13e093,
        })
        .toggle(t(_0x21503c, 'toggle_hear_spectators'), { defaultValue: _0x8148be.hearSpectators })
        .toggle(t(_0x21503c, 'toggle_spatial_audio'), { defaultValue: _0x8148be.spatialAudio })
        .header(t(_0x21503c, 'header_admin_environment'))
        .toggle(t(_0x21503c, 'toggle_environmental_sfx'), {
          defaultValue: _0x8148be.environmentalSfx,
        });
    _0x1e84c6 &&
      (_0x16cf83.toggle(t(_0x21503c, 'toggle_environment_water'), {
        defaultValue: _0x8148be.environmentalWater,
      }),
      _0x16cf83.toggle(t(_0x21503c, 'toggle_environment_lava'), {
        defaultValue: _0x8148be.environmentalLava,
      }),
      _0x16cf83.toggle(t(_0x21503c, 'toggle_environment_dimensions'), {
        defaultValue: _0x8148be.environmentalDimensions,
      }),
      _0x16cf83.toggle(t(_0x21503c, 'toggle_environment_caves'), {
        defaultValue: _0x8148be.environmentalCaves,
      }));
    (_0x16cf83.header(t(_0x21503c, 'header_admin_performance')),
      _0x16cf83.slider(t(_0x21503c, 'slider_coord_interval'), 4, 40, {
        valueStep: 2,
        defaultValue: _0x8148be.coordInterval,
      }));
    const _0xc24f68 = await this._show(_0x16cf83, _0x3aa2a0);
    if (!_0xc24f68 || _0xc24f68.canceled || !_0xc24f68.formValues) return;
    const _0x3c9223 = _0xc24f68.formValues.filter((_0x1ef76c) => _0x1ef76c !== undefined);
    let _0x425d74 = 0;
    const _0x284d17 = _0x3c9223[_0x425d74++],
      _0x35efa3 = _0x3c9223[_0x425d74++],
      _0x48a323 = Math.round(_0x3c9223[_0x425d74++]),
      _0x24de4d = _0x3c9223[_0x425d74++],
      _0x554559 = _0x3c9223[_0x425d74++],
      _0x1adff3 = _0x3c9223[_0x425d74++] === true;
    let _0x5be6e4 = _0x8148be.environmentalWater,
      _0xe0b03b = _0x8148be.environmentalLava,
      _0x2cdf22 = _0x8148be.environmentalDimensions,
      _0x73858e = _0x8148be.environmentalCaves;
    _0x1e84c6 &&
      ((_0x5be6e4 = _0x3c9223[_0x425d74++] === true),
      (_0xe0b03b = _0x3c9223[_0x425d74++] === true),
      (_0x2cdf22 = _0x3c9223[_0x425d74++] === true),
      (_0x73858e = _0x3c9223[_0x425d74++] === true));
    const _0xee964a = _0x3c9223[_0x425d74++],
      _0x27d6af = _0x48a323 > 0,
      _0x2fa1b6 = _0x8148be.spatialAudio !== _0x554559,
      _0x2bd09c = _0x8148be.environmentalSfx !== _0x1adff3;
    ((_0x8148be.showIcons = _0x284d17),
      (_0x8148be.showTitles = _0x35efa3),
      (_0x8148be.groups = _0x27d6af),
      (_0x8148be.hearSpectators = _0x24de4d),
      (_0x8148be.spatialAudio = _0x554559),
      (_0x8148be.environmentalSfx = _0x1adff3),
      (_0x8148be.environmentalWater = _0x5be6e4),
      (_0x8148be.environmentalLava = _0xe0b03b),
      (_0x8148be.environmentalDimensions = _0x2cdf22),
      (_0x8148be.environmentalCaves = _0x73858e),
      (_0x8148be.coordInterval = Math.max(4, Math.min(40, Math.round(_0xee964a)))));
    if (_0x48a323 >= 1) _0x8148be.maxGroupsPerPlayer = Math.min(20, _0x48a323);
    if (_0x2fa1b6) State.lastSentPos.clear();
    if (!_0x8148be.environmentalSfx) State.environmentalSfx.clear();
    (State.saveSettings(),
      State.applyDisplayToAll(),
      _0x3aa2a0.sendMessage(t(State.langOf(_0x3aa2a0), 'global_saved')));
    if (_0x2bd09c && _0x8148be.environmentalSfx && _0x3aa2a0.isValid)
      return this.openAdminSettings(_0x3aa2a0);
  }
  static async openAdminGroups(_0x22daaf) {
    const _0x1bd3d4 = State.langOf(_0x22daaf);
    if (_0x22daaf.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
      _0x22daaf.sendMessage(t(_0x1bd3d4, 'admin_only'));
      return;
    }
    const _0x3750eb = [...State.groups.values()].sort(
        (_0x256373, _0x44e205) => _0x256373.number - _0x44e205.number,
      ),
      _0xc4bc8a = t(
        _0x1bd3d4,
        State.settings.groups ? 'admin_groups_enabled' : 'admin_groups_disabled',
      ),
      _0x17e5b3 = await this.pickFromList(_0x22daaf, {
        items: _0x3750eb,
        labelOf: (_0x5598c2) =>
          '§l#' +
          _0x5598c2.number +
          ' ' +
          _0x5598c2.name +
          '\n§r§7' +
          t(
            _0x1bd3d4,
            _0x5598c2.adminManaged === true
              ? 'admin_groups_list_secret'
              : 'admin_groups_list_normal',
          ) +
          ' §8• §7' +
          t(_0x1bd3d4, 'admin_group_members_short', { count: _0x5598c2.members.size }),
        sortKeyOf: (_0x14d3d0) => _0x14d3d0.name + ' ' + _0x14d3d0.owner,
        iconOf: () => 'textures/ui/vcmc/icon_people',
        titleKey: 'admin_groups_title',
        bodyKey: 'admin_groups_body',
        bodyVars: { count: _0x3750eb.length, status: _0xc4bc8a },
        searchLabelKey: 'btn_search_group',
        extraTop: [
          { id: 'create', labelKey: 'btn_admin_create_group', icon: 'textures/ui/vcmc/icon_plus' },
        ],
      });
    if (_0x17e5b3 === null || _0x17e5b3 === 'back') return;
    if (_0x17e5b3.extra === 'create') return this.openAdminCreateGroup(_0x22daaf);
    return this.openAdminManageGroup(_0x22daaf, _0x17e5b3.item.number);
  }
  static async openAdminCreateGroup(_0x7c6864) {
    const _0x14b8f0 = State.langOf(_0x7c6864),
      _0x5a7036 = new ModalFormData()
        .title(t(_0x14b8f0, 'admin_create_group_title'))
        .textField(
          t(_0x14b8f0, 'admin_group_name_optional'),
          t(_0x14b8f0, 'admin_group_name_placeholder'),
        ),
      _0x12f735 = await this._show(_0x5a7036, _0x7c6864);
    if (!_0x12f735 || _0x12f735.canceled || !_0x12f735.formValues) return;
    const _0x7e6b32 = Number(
      String(_0x12f735.formValues[0] || '')
        .replace('#', '')
        .trim(),
    );
    if (!Number.isInteger(_0x7e6b32) || _0x7e6b32 < 1 || _0x7e6b32 > 255)
      return (
        _0x7c6864.sendMessage(t(_0x14b8f0, 'admin_groups_create_usage')),
        this.openAdminCreateGroup(_0x7c6864)
      );
    if (State.groups.has(_0x7e6b32))
      return (
        _0x7c6864.sendMessage(t(_0x14b8f0, 'admin_group_number_used', { num: _0x7e6b32 })),
        this.openAdminCreateGroup(_0x7c6864)
      );
    const _0x2fb9ce = State.createAdminGroup(_0x7c6864, _0x7e6b32);
    if (!_0x2fb9ce) {
      _0x7c6864.sendMessage(t(_0x14b8f0, 'group_limit_reached'));
      return;
    }
    return (
      _0x7c6864.sendMessage(
        t(_0x14b8f0, 'admin_group_created', { name: _0x2fb9ce.name, num: _0x2fb9ce.number }),
      ),
      this.openAdminManageGroup(_0x7c6864, _0x2fb9ce.number)
    );
  }
  static async openAdminManageGroup(_0x19f245, _0x27f7a0) {
    const _0x22a556 = State.langOf(_0x19f245),
      _0x517908 = State.groups.get(Number(_0x27f7a0) | 0);
    if (!_0x517908)
      return (
        _0x19f245.sendMessage(t(_0x22a556, 'admin_group_missing')),
        this.openAdminGroups(_0x19f245)
      );
    const _0x380978 = new ActionFormData()
        .title(t(_0x22a556, 'admin_manage_group_title', { name: _0x517908.name }))
        .body(
          t(_0x22a556, 'admin_manage_group_body', {
            num: _0x517908.number,
            count: _0x517908.members.size,
            owner: _0x517908.owner,
          }),
        )
        .button(t(_0x22a556, 'btn_admin_add_players'), 'textures/ui/vcmc/icon_plus')
        .button(t(_0x22a556, 'btn_admin_remove_players'), 'textures/ui/vcmc/icon_minus')
        .button(t(_0x22a556, 'btn_admin_rename_group'), 'textures/ui/vcmc/icon_pencil')
        .button(t(_0x22a556, 'btn_group_voice_settings'), 'textures/ui/vcmc/icon_gear')
        .button(t(_0x22a556, 'btn_delete_group'), 'textures/ui/vcmc/icon_x')
        .button(t(_0x22a556, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x23f32b = await this._show(_0x380978, _0x19f245);
    if (!_0x23f32b || _0x23f32b.canceled) return;
    if (_0x23f32b.selection === 0) return this.openAdminAddPlayer(_0x19f245, _0x517908.number);
    if (_0x23f32b.selection === 1) return this.openAdminRemovePlayer(_0x19f245, _0x517908.number);
    if (_0x23f32b.selection === 2) return this.openAdminRenameGroup(_0x19f245, _0x517908.number);
    if (_0x23f32b.selection === 3)
      return this.openAdminGroupVoiceSettings(_0x19f245, _0x517908.number);
    if (_0x23f32b.selection === 4) return this.openAdminDeleteGroup(_0x19f245, _0x517908.number);
    return this.openAdminGroups(_0x19f245);
  }
  static async openAdminAddPlayer(_0x154328, _0xbe7733) {
    const _0x2d1b22 = State.langOf(_0x154328),
      _0x54e9d9 = State.groups.get(Number(_0xbe7733) | 0);
    if (!_0x54e9d9) return this.openAdminGroups(_0x154328);
    const _0x13a618 = [...world.getPlayers()]
        .filter(
          (_0x320815) => _0x320815.isValid && !_0x54e9d9.members.has(State._norm(_0x320815.name)),
        )
        .sort((_0x56808b, _0xd45ba) => _0x56808b.name.localeCompare(_0xd45ba.name)),
      _0x5b7477 = new ActionFormData()
        .title(t(_0x2d1b22, 'btn_admin_add_players'))
        .button(t(_0x2d1b22, 'btn_admin_add_gamertag')),
      _0x2ce2d5 = [{ type: 'gamertag' }];
    for (const _0x5ec254 of _0x13a618) {
      const _0x19a5ba = State.playerGroup.get(State._norm(_0x5ec254.name)),
        _0x45daa3 = State.groups.get(_0x19a5ba);
      (_0x5b7477.button(
        _0x45daa3
          ? _0x5ec254.name + '\n§7' + _0x45daa3.name + ' (#' + _0x45daa3.number + ')'
          : _0x5ec254.name,
      ),
        _0x2ce2d5.push({ type: 'online', target: _0x5ec254 }));
    }
    (_0x5b7477.button(t(_0x2d1b22, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x2ce2d5.push({ type: 'back' }));
    const _0x43c20e = await this._show(_0x5b7477, _0x154328);
    if (!_0x43c20e || _0x43c20e.canceled) return;
    const _0x43a1f8 = _0x2ce2d5[_0x43c20e.selection];
    if (_0x43a1f8?.['type'] === 'gamertag')
      return this.openAdminAddGamertag(_0x154328, _0x54e9d9.number);
    if (_0x43a1f8?.['type'] !== 'online')
      return this.openAdminManageGroup(_0x154328, _0x54e9d9.number);
    const _0x3301aa = _0x43a1f8.target;
    if (!_0x3301aa?.['isValid'] || !State.groups.has(_0x54e9d9.number))
      return this.openAdminManageGroup(_0x154328, _0x54e9d9.number);
    return (
      State.joinGroup(_0x3301aa, _0x54e9d9.number, true),
      _0x154328.sendMessage(
        t(_0x2d1b22, 'admin_player_added', {
          name: _0x3301aa.name,
          group: _0x54e9d9.name,
          num: _0x54e9d9.number,
        }),
      ),
      _0x3301aa.sendMessage(
        t(State.langOf(_0x3301aa), 'admin_player_added_notice', {
          group: _0x54e9d9.name,
          num: _0x54e9d9.number,
        }),
      ),
      this.openAdminAddPlayer(_0x154328, _0x54e9d9.number)
    );
  }
  static async openAdminAddGamertag(_0xa2cbb, _0x4b32b6) {
    const _0x4f5eb8 = State.langOf(_0xa2cbb),
      _0xd723f0 = State.groups.get(Number(_0x4b32b6) | 0);
    if (!_0xd723f0) return this.openAdminGroups(_0xa2cbb);
    const _0x5527fc = new ModalFormData()
        .title(t(_0x4f5eb8, 'admin_add_gamertag_title'))
        .textField(
          t(_0x4f5eb8, 'admin_gamertag_field'),
          t(_0x4f5eb8, 'admin_gamertag_placeholder'),
        ),
      _0x2163d2 = await this._show(_0x5527fc, _0xa2cbb);
    if (!_0x2163d2 || _0x2163d2.canceled || !_0x2163d2.formValues) return;
    const _0x4ebb41 = State.assignPlayerToGroupByName(_0x2163d2.formValues[0], _0xd723f0.number);
    if (!_0x4ebb41)
      return (
        _0xa2cbb.sendMessage(t(_0x4f5eb8, 'admin_invalid_gamertag')),
        this.openAdminAddGamertag(_0xa2cbb, _0xd723f0.number)
      );
    return (
      _0xa2cbb.sendMessage(
        t(_0x4f5eb8, 'admin_player_added', {
          name: _0x4ebb41.name,
          group: _0xd723f0.name,
          num: _0xd723f0.number,
        }),
      ),
      _0x4ebb41.online?.['isValid'] &&
        _0x4ebb41.online.sendMessage(
          t(State.langOf(_0x4ebb41.online), 'admin_player_added_notice', {
            group: _0xd723f0.name,
            num: _0xd723f0.number,
          }),
        ),
      this.openAdminAddPlayer(_0xa2cbb, _0xd723f0.number)
    );
  }
  static async openAdminRemovePlayer(_0x4f86d5, _0x4528fb) {
    const _0x5ab265 = State.langOf(_0x4f86d5),
      _0x12c9af = State.groups.get(Number(_0x4528fb) | 0);
    if (!_0x12c9af) return this.openAdminGroups(_0x4f86d5);
    const _0x3b64ee = new Map();
    for (const _0xd61059 of world.getPlayers()) {
      if (_0xd61059.isValid) _0x3b64ee.set(State._norm(_0xd61059.name), _0xd61059);
    }
    const _0x375103 = [..._0x12c9af.members]
      .map((_0x276389) => ({
        norm: _0x276389,
        name:
          _0x3b64ee.get(_0x276389)?.['name'] ||
          (_0x276389 === _0x12c9af.ownerNorm
            ? _0x12c9af.owner
            : _0x12c9af.memberNames?.[_0x276389]) ||
          _0x276389,
      }))
      .sort((_0x337013, _0x3bb3bd) => _0x337013.name.localeCompare(_0x3bb3bd.name));
    if (_0x375103.length === 0)
      return (
        _0x4f86d5.sendMessage(t(_0x5ab265, 'admin_no_members')),
        this.openAdminManageGroup(_0x4f86d5, _0x12c9af.number)
      );
    const _0x2fd8d2 = new ActionFormData().title(t(_0x5ab265, 'btn_admin_remove_players'));
    for (const _0x258c2c of _0x375103) {
      const _0x186648 = _0x3b64ee.has(_0x258c2c.norm);
      _0x2fd8d2.button(
        '' +
          (_0x186648 ? '§a' : '§8') +
          t(_0x5ab265, _0x186648 ? 'group_member_online' : 'group_member_offline') +
          ': §f' +
          _0x258c2c.name,
      );
    }
    _0x2fd8d2.button(t(_0x5ab265, 'btn_back'), 'textures/ui/vcmc/icon_back');
    const _0x782b84 = await this._show(_0x2fd8d2, _0x4f86d5);
    if (!_0x782b84 || _0x782b84.canceled) return;
    if (_0x782b84.selection === _0x375103.length)
      return this.openAdminManageGroup(_0x4f86d5, _0x12c9af.number);
    const _0x45a43a = _0x375103[_0x782b84.selection];
    if (!_0x45a43a) return this.openAdminManageGroup(_0x4f86d5, _0x12c9af.number);
    const _0x5c47df = _0x3b64ee.get(_0x45a43a.norm);
    return (
      State.removePlayerFromGroupByNorm(_0x12c9af.number, _0x45a43a.norm) &&
        (_0x4f86d5.sendMessage(
          t(_0x5ab265, 'admin_player_removed', { name: _0x45a43a.name, group: _0x12c9af.name }),
        ),
        _0x5c47df?.['isValid'] &&
          _0x5c47df.sendMessage(
            t(State.langOf(_0x5c47df), 'admin_player_removed_notice', { group: _0x12c9af.name }),
          )),
      this.openAdminRemovePlayer(_0x4f86d5, _0x12c9af.number)
    );
  }
  static async openAdminRenameGroup(_0xaaebc, _0x401af8) {
    const _0x4797cf = State.langOf(_0xaaebc),
      _0x1158c6 = State.groups.get(Number(_0x401af8) | 0);
    if (!_0x1158c6) return this.openAdminGroups(_0xaaebc);
    const _0x4493ac = new ModalFormData()
        .title(t(_0x4797cf, 'admin_rename_group_title'))
        .textField(t(_0x4797cf, 'field_group_name'), t(_0x4797cf, 'field_group_name_ph'), {
          defaultValue: _0x1158c6.name,
        }),
      _0x21d670 = await this._show(_0x4493ac, _0xaaebc);
    if (!_0x21d670 || _0x21d670.canceled || !_0x21d670.formValues) return;
    const _0x1ec9f9 = State.renameGroupByNumber(_0x1158c6.number, _0x21d670.formValues[0]);
    if (!_0x1ec9f9) return this.openAdminGroups(_0xaaebc);
    return (
      _0xaaebc.sendMessage(t(_0x4797cf, 'admin_group_renamed', { name: _0x1ec9f9 })),
      this.openAdminManageGroup(_0xaaebc, _0x1158c6.number)
    );
  }
  static async openAdminGroupVoiceSettings(_0x469a3c, _0x39ee4d) {
    const _0x2f9aaf = State.langOf(_0x469a3c),
      _0x139e12 = State.groups.get(Number(_0x39ee4d) | 0);
    if (!_0x139e12) return this.openAdminGroups(_0x469a3c);
    const _0x35382a = new ModalFormData()
        .title(t(_0x2f9aaf, 'group_voice_settings_title'))
        .toggle(t(_0x2f9aaf, 'toggle_group_global_voice'), {
          defaultValue: _0x139e12.globalVoice !== false,
        })
        .toggle(t(_0x2f9aaf, 'toggle_group_outside_proximity'), {
          defaultValue: _0x139e12.proximityOutside === true,
        }),
      _0x217f5a = await this._show(_0x35382a, _0x469a3c);
    if (!_0x217f5a || _0x217f5a.canceled || !_0x217f5a.formValues) return;
    return (
      State.updateGroupSettingsByNumber(
        _0x139e12.number,
        _0x217f5a.formValues[0],
        _0x217f5a.formValues[1],
      ),
      _0x469a3c.sendMessage(t(_0x2f9aaf, 'admin_group_settings_saved')),
      this.openAdminManageGroup(_0x469a3c, _0x139e12.number)
    );
  }
  static async openAdminDeleteGroup(_0x2bac38, _0x321537) {
    const _0x40af28 = State.langOf(_0x2bac38),
      _0x305998 = State.groups.get(Number(_0x321537) | 0);
    if (!_0x305998) return this.openAdminGroups(_0x2bac38);
    const _0x4c77e1 = new ActionFormData()
        .title(t(_0x40af28, 'admin_delete_group_title'))
        .body(
          t(_0x40af28, 'admin_delete_group_body', {
            name: _0x305998.name,
            num: _0x305998.number,
            count: _0x305998.members.size,
          }),
        )
        .button(t(_0x40af28, 'btn_confirm_delete'))
        .button(t(_0x40af28, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x246843 = await this._show(_0x4c77e1, _0x2bac38);
    if (!_0x246843 || _0x246843.canceled) return;
    if (_0x246843.selection !== 0) return this.openAdminManageGroup(_0x2bac38, _0x305998.number);
    return (
      State.deleteGroupByNumber(_0x305998.number) &&
        _0x2bac38.sendMessage(
          t(_0x40af28, 'admin_group_deleted', { name: _0x305998.name, num: _0x305998.number }),
        ),
      this.openAdminGroups(_0x2bac38)
    );
  }
  static async openPlayer(_0x517e90) {
    const _0x154aae = State.langOf(_0x517e90);
    if (!State.roomId) {
      _0x517e90.sendMessage(t(_0x154aae, 'no_room_player'));
      return;
    }
    const _0x5e38ef = State._norm(_0x517e90.name),
      _0x253b98 = State.playerInfo.get(_0x5e38ef);
    if (!_0x253b98 || _0x253b98.state !== 'CONNECTED') {
      _0x517e90.sendMessage('§e[VCMC] §fYou are not connected to the VCMC app.');
      return;
    }
    const _0x5a46e1 = State.playerGroup.get(_0x5e38ef),
      _0x27b9f5 = _0x5a46e1 !== undefined ? State.groups.get(_0x5a46e1) : undefined,
      _0x24bdc4 = _0x27b9f5 && _0x27b9f5.adminManaged !== true,
      _0x37316d = _0x24bdc4 ? _0x27b9f5.name : '',
      _0x4af18b = new ActionFormData()
        .title('VCMC Menu')
        .body(
          _0x24bdc4
            ? t(_0x154aae, 'menu_in_group_body', { name: _0x37316d, num: _0x5a46e1 })
            : t(_0x154aae, 'menu_body'),
        ),
      _0x3aaefa = [];
    (_0x4af18b.button(t(_0x154aae, 'btn_my_settings'), 'textures/ui/vcmc/icon_gear'),
      _0x3aaefa.push('settings'));
    State.settings.groups &&
      _0x27b9f5?.['adminManaged'] !== true &&
      (_0x4af18b.button(t(_0x154aae, 'btn_groups'), 'textures/ui/vcmc/icon_people'),
      _0x3aaefa.push('groups'));
    const _0x4b692e = await this._show(_0x4af18b, _0x517e90);
    if (!_0x4b692e || _0x4b692e.canceled) return;
    const _0x2f64ae = _0x3aaefa[_0x4b692e.selection];
    if (_0x2f64ae === 'settings') return this.openMySettings(_0x517e90);
    if (_0x2f64ae === 'groups') return this.openGroups(_0x517e90);
  }
  static async openMySettings(_0x305a7c) {
    const _0x435767 = State.langOf(_0x305a7c),
      _0x3539b4 = new ActionFormData()
        .title(t(_0x435767, 'my_settings_title'))
        .body(t(_0x435767, 'menu_body'))
        .button(t(_0x435767, 'btn_general_settings'), 'textures/ui/vcmc/icon_gear')
        .button(t(_0x435767, 'btn_user_volumes'), 'textures/ui/vcmc/icon_speaker')
        .button(t(_0x435767, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x1e4dab = await this._show(_0x3539b4, _0x305a7c);
    if (!_0x1e4dab || _0x1e4dab.canceled) return;
    if (_0x1e4dab.selection === 0) return this.openPlayerSettings(_0x305a7c);
    if (_0x1e4dab.selection === 1) return this.openUserVolumes(_0x305a7c);
    if (_0x1e4dab.selection === 2) return this.openPlayer(_0x305a7c);
  }
  static async openUserVolumes(_0x51f629) {
    const _0x336ce2 = State.langOf(_0x51f629),
      _0x55023f = State._norm(_0x51f629.name),
      _0x4aa48c = [];
    for (const _0x17f567 of world.getPlayers()) {
      if (!_0x17f567.isValid) continue;
      const _0x16534b = State._norm(_0x17f567.name);
      if (_0x16534b === _0x55023f) continue;
      const _0xf02e97 = State.playerInfo.get(_0x16534b);
      if (!_0xf02e97 || _0xf02e97.state !== 'CONNECTED') continue;
      let _0x542d91 = Number.POSITIVE_INFINITY;
      try {
        if (_0x17f567.dimension.id === _0x51f629.dimension.id) {
          const _0x46a6d4 = _0x17f567.location.x - _0x51f629.location.x,
            _0x1173e6 = _0x17f567.location.y - _0x51f629.location.y,
            _0x1b54fe = _0x17f567.location.z - _0x51f629.location.z;
          _0x542d91 = Math.sqrt(
            _0x46a6d4 * _0x46a6d4 + _0x1173e6 * _0x1173e6 + _0x1b54fe * _0x1b54fe,
          );
        }
      } catch (_0xd94f6d) {}
      _0x4aa48c.push({ norm: _0x16534b, name: _0x17f567.name, dist: _0x542d91 });
    }
    _0x4aa48c.sort((_0x2940a0, _0x546f4c) => _0x2940a0.dist - _0x546f4c.dist);
    if (_0x4aa48c.length === 0) {
      _0x51f629.sendMessage(t(_0x336ce2, 'no_users_to_adjust'));
      return;
    }
    const _0xce9d6b = this._peerVolsOf(_0x55023f),
      _0x3e26ff = await this.pickFromList(_0x51f629, {
        items: _0x4aa48c,
        labelOf: (_0x5447d4) => {
          const _0x2b299a =
            typeof _0xce9d6b[_0x5447d4.norm] === 'number'
              ? Math.round(_0xce9d6b[_0x5447d4.norm] * 100)
              : 100;
          return _0x5447d4.name + '\n§r§7' + _0x2b299a + '%%';
        },
        sortKeyOf: (_0x10be3f) => _0x10be3f.name,
        iconOf: () => 'textures/ui/icon_steve',
        titleKey: 'user_volumes_title',
        bodyKey: 'user_volumes_body',
        searchLabelKey: 'btn_search_player',
      });
    if (_0x3e26ff === null) return;
    if (_0x3e26ff === 'back') return this.openMySettings(_0x51f629);
    return this.openUserVolumeSlider(_0x51f629, _0x3e26ff.item.norm, _0x3e26ff.item.name);
  }
  static async openUserVolumeSlider(_0x1bc394, _0x436b3b, _0x28d8a0) {
    const _0x5ccdea = State.langOf(_0x1bc394),
      _0x337169 = State._norm(_0x1bc394.name),
      _0x333a0b = this._peerVolsOf(_0x337169),
      _0x122bf1 =
        typeof _0x333a0b[_0x436b3b] === 'number' ? Math.round(_0x333a0b[_0x436b3b] * 100) : 100,
      _0x4162b0 = new ModalFormData()
        .title(t(_0x5ccdea, 'user_volume_title', { name: _0x28d8a0 }))
        .slider(t(_0x5ccdea, 'slider_user_volume'), 0, 100, {
          valueStep: 5,
          defaultValue: Math.min(100, _0x122bf1),
        }),
      _0x42c73a = await this._show(_0x4162b0, _0x1bc394);
    if (!_0x42c73a || _0x42c73a.canceled || !_0x42c73a.formValues) return;
    const _0x2a825c = _0x42c73a.formValues[0] / 100,
      _0x435399 = State.playerSettings.get(_0x337169) || {};
    if (!_0x435399.peerVolumes || typeof _0x435399.peerVolumes !== 'object')
      _0x435399.peerVolumes = {};
    ((_0x435399.peerVolumes[_0x436b3b] = _0x2a825c),
      State.playerSettings.set(_0x337169, _0x435399),
      _0x1bc394.sendMessage(t(_0x5ccdea, 'sending_settings')),
      State.pushPlayerSettings(_0x1bc394, { peerVolumes: { [_0x436b3b]: _0x2a825c } }));
  }
  static _peerVolsOf(_0x190acc) {
    const _0x2dfc99 = State.playerSettings.get(_0x190acc);
    return _0x2dfc99 && _0x2dfc99.peerVolumes && typeof _0x2dfc99.peerVolumes === 'object'
      ? _0x2dfc99.peerVolumes
      : {};
  }
  static _deviceOptions(_0x17c527, _0x345a24) {
    const _0x5c392c = [''],
      _0x17f4dc = [t(_0x345a24, 'device_default')];
    if (Array.isArray(_0x17c527))
      for (const _0xd44895 of _0x17c527) {
        if (!_0xd44895 || typeof _0xd44895.id !== 'string') continue;
        (_0x5c392c.push(_0xd44895.id),
          _0x17f4dc.push(
            _0xd44895.label && _0xd44895.label.length
              ? _0xd44895.label
              : t(_0x345a24, 'device_unknown'),
          ));
      }
    return {
      ids: _0x5c392c,
      labels: _0x17f4dc,
      indexOf(_0x414003) {
        const _0x1e1832 = _0x5c392c.indexOf(_0x414003 || '');
        return _0x1e1832 >= 0 ? _0x1e1832 : 0;
      },
    };
  }
  static async openPlayerSettings(_0x4d1237) {
    const _0x3208ab = State._norm(_0x4d1237.name),
      _0x2e2e24 = State.playerSettings.get(_0x3208ab) || {},
      _0x554ba8 = typeof _0x2e2e24.globalVolume === 'number' ? _0x2e2e24.globalVolume : 1,
      _0x284266 = typeof _0x2e2e24.maxPlayers === 'number' ? _0x2e2e24.maxPlayers : 10,
      _0x3db2fb = typeof _0x2e2e24.audioRadius === 'number' ? _0x2e2e24.audioRadius : 15,
      _0x4bfe77 = typeof _0x2e2e24.spatialIntensity === 'number' ? _0x2e2e24.spatialIntensity : 0.7,
      _0x14f93c = _0x2e2e24.monoAudio === true,
      _0x78fa46 = _0x2e2e24.noiseSuppression !== false,
      _0x3a4bbc = _0x2e2e24.audioToSpeaker !== false,
      _0x183436 = typeof _0x2e2e24.platform === 'string' ? _0x2e2e24.platform : 'unknown',
      _0x4e5dc8 = _0x183436 === 'windows' || _0x183436 === 'macos' || _0x183436 === 'linux',
      _0x515a6c = _0x183436 === 'ios' || _0x183436 === 'android',
      _0xe537f7 = _0x183436 === 'unknown',
      _0xa06fb9 = State.langOf(_0x4d1237);
    let _0x599ae1 = LANGS.findIndex((_0x518ec3) => _0x518ec3.code === _0x2e2e24.language);
    if (_0x599ae1 < 0) _0x599ae1 = 0;
    const _0x5e4b8a = new ModalFormData().title(t(_0xa06fb9, 'my_settings_title')),
      _0x2559a6 = [];
    (_0x5e4b8a.header(t(_0xa06fb9, 'header_general')),
      _0x5e4b8a.slider(t(_0xa06fb9, 'slider_global_volume'), 0, 100, {
        valueStep: 5,
        defaultValue: Math.round(_0x554ba8 * 100),
      }),
      _0x2559a6.push({ key: 'globalVolume', decode: (_0x39ac00) => _0x39ac00 / 100 }),
      _0x5e4b8a.slider(t(_0xa06fb9, 'slider_player_limit'), 10, 40, {
        valueStep: 1,
        defaultValue: Math.max(10, _0x284266),
      }),
      _0x2559a6.push({ key: 'maxPlayers', decode: (_0x46ec40) => _0x46ec40 }),
      _0x5e4b8a.header(t(_0xa06fb9, 'header_spatial_audio')),
      _0x5e4b8a.slider(t(_0xa06fb9, 'slider_audio_radius'), 1, 50, {
        valueStep: 1,
        defaultValue: Math.round(_0x3db2fb),
      }),
      _0x2559a6.push({ key: 'audioRadius', decode: (_0x2a1083) => _0x2a1083 }),
      _0x5e4b8a.slider(t(_0xa06fb9, 'slider_spatial_intensity'), 0, 100, {
        valueStep: 5,
        defaultValue: Math.round(_0x4bfe77 * 100),
      }),
      _0x2559a6.push({ key: 'spatialIntensity', decode: (_0x3371d4) => _0x3371d4 / 100 }),
      _0x5e4b8a.toggle(t(_0xa06fb9, 'toggle_mono_audio'), { defaultValue: _0x14f93c }),
      _0x2559a6.push({ key: 'monoAudio', decode: (_0x2ed332) => _0x2ed332 }),
      _0x5e4b8a.toggle(t(_0xa06fb9, 'toggle_noise_suppression'), { defaultValue: _0x78fa46 }),
      _0x2559a6.push({ key: 'noiseSuppression', decode: (_0x493d2f) => _0x493d2f }));
    (_0x515a6c || _0xe537f7 || _0x4e5dc8) && _0x5e4b8a.header(t(_0xa06fb9, 'header_output'));
    (_0x515a6c || _0xe537f7) &&
      (_0x5e4b8a.toggle(t(_0xa06fb9, 'toggle_speaker_output'), { defaultValue: _0x3a4bbc }),
      _0x2559a6.push({ key: 'audioToSpeaker', decode: (_0x34f883) => _0x34f883 }));
    if (_0x4e5dc8) {
      const _0x5192bc = this._deviceOptions(_0x2e2e24.micDevices, _0xa06fb9);
      (_0x5e4b8a.dropdown(t(_0xa06fb9, 'dropdown_input_device'), _0x5192bc.labels, {
        defaultValueIndex: _0x5192bc.indexOf(_0x2e2e24.selectedMicId),
      }),
        _0x2559a6.push({ key: 'selectedMicId', decode: (_0x35878b) => _0x5192bc.ids[_0x35878b] }),
        _0x5e4b8a.divider());
      const _0x3813f3 = this._deviceOptions(_0x2e2e24.speakerDevices, _0xa06fb9);
      (_0x5e4b8a.dropdown(t(_0xa06fb9, 'dropdown_output_device'), _0x3813f3.labels, {
        defaultValueIndex: _0x3813f3.indexOf(_0x2e2e24.selectedSpeakerId),
      }),
        _0x2559a6.push({
          key: 'selectedSpeakerId',
          decode: (_0x4aeb9a) => _0x3813f3.ids[_0x4aeb9a],
        }));
    }
    _0x5e4b8a.header(t(_0xa06fb9, 'header_other'));
    _0x183436 === 'ios' &&
      _0x2e2e24.callKitAvailable === true &&
      (_0x5e4b8a.toggle(t(_0xa06fb9, 'toggle_callkit'), {
        defaultValue: _0x2e2e24.callKitDisabled !== true,
      }),
      _0x2559a6.push({ key: 'callKitDisabled', decode: (_0x385a66) => !_0x385a66 }));
    (_0x5e4b8a.dropdown(
      t(_0xa06fb9, 'dropdown_language'),
      LANGS.map((_0x2c6293) => _0x2c6293.name),
      { defaultValueIndex: _0x599ae1 },
    ),
      _0x2559a6.push({ key: 'language', decode: (_0x2b233e) => LANGS[_0x2b233e].code }));
    if (_0x4e5dc8) _0x4d1237.sendMessage(t(_0xa06fb9, 'label_pc_keys_in_app'));
    const _0xde585a = await this._show(_0x5e4b8a, _0x4d1237);
    if (!_0xde585a || _0xde585a.canceled || !_0xde585a.formValues) return;
    const _0x2ca582 = _0xde585a.formValues.filter((_0xe96cb6) => _0xe96cb6 !== undefined);
    if (_0x2ca582.length !== _0x2559a6.length) {
      console.error(
        '[VCMC] openPlayerSettings: ' +
          _0x2ca582.length +
          ' valores para ' +
          _0x2559a6.length +
          ' controles; se descarta.',
      );
      return;
    }
    const _0x2f2c4f = {};
    for (let _0x572b5c = 0; _0x572b5c < _0x2559a6.length; _0x572b5c++) {
      _0x2f2c4f[_0x2559a6[_0x572b5c].key] = _0x2559a6[_0x572b5c].decode(_0x2ca582[_0x572b5c]);
    }
    const _0x536079 = Object.assign({}, _0x2e2e24, _0x2f2c4f);
    State.playerSettings.set(_0x3208ab, _0x536079);
    const _0x2cb770 = State.playerInfo.get(_0x3208ab);
    if (_0x2cb770) _0x2cb770.connectedAt = 0;
    (_0x4d1237.sendMessage(t(_0xa06fb9, 'sending_settings')),
      State.pushPlayerSettings(_0x4d1237, _0x2f2c4f));
  }
  static async openGroups(_0x3a0293) {
    const _0x19334c = State.langOf(_0x3a0293);
    if (!State.settings.groups) {
      _0x3a0293.sendMessage(t(_0x19334c, 'groups_disabled'));
      return;
    }
    const _0x3d1572 = State._norm(_0x3a0293.name),
      _0x4d3647 = State.playerGroup.get(_0x3d1572),
      _0x199e02 = State.groups.get(_0x4d3647);
    if (_0x199e02?.['adminManaged'] === true) {
      _0x3a0293.sendMessage(t(_0x19334c, 'managed_group_locked'));
      return;
    }
    const _0x2e19a9 = State.pendingInvitations(_0x3d1572),
      _0x3035d7 = new ActionFormData()
        .title(t(_0x19334c, 'groups_title'))
        .body(
          _0x199e02
            ? t(_0x19334c, 'groups_current_body', { name: _0x199e02.name, num: _0x199e02.number })
            : t(_0x19334c, 'groups_body'),
        ),
      _0xd43384 = [];
    _0x199e02
      ? (_0x3035d7.button(
          t(_0x19334c, 'btn_group_members', { name: _0x199e02.name }),
          'textures/ui/vcmc/icon_people',
        ),
        _0xd43384.push('members'),
        _0x199e02.ownerNorm === _0x3d1572 &&
          (_0x3035d7.button(t(_0x19334c, 'btn_invite_group'), 'textures/ui/vcmc/icon_plus'),
          _0xd43384.push('invite'),
          _0x3035d7.button(t(_0x19334c, 'btn_manage_group'), 'textures/ui/vcmc/icon_gear'),
          _0xd43384.push('manage')))
      : (_0x3035d7.button(t(_0x19334c, 'btn_create_group'), 'textures/ui/vcmc/icon_plus'),
        _0xd43384.push('create'),
        _0x3035d7.button(t(_0x19334c, 'btn_search_group'), 'textures/ui/vcmc/icon_search'),
        _0xd43384.push('search'));
    _0x2e19a9.length > 0 &&
      (_0x3035d7.button(
        t(_0x19334c, 'btn_pending_invitations', { count: _0x2e19a9.length }),
        'textures/ui/vcmc/icon_mail',
      ),
      _0xd43384.push('invitations'));
    _0x199e02 &&
      (_0x3035d7.button(
        t(_0x19334c, 'btn_leave_group', { num: _0x199e02.number }),
        'textures/ui/vcmc/icon_x',
      ),
      _0xd43384.push('leave'));
    (_0x3035d7.button(t(_0x19334c, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0xd43384.push('back'));
    const _0x2ef53b = await this._show(_0x3035d7, _0x3a0293);
    if (!_0x2ef53b || _0x2ef53b.canceled) return;
    const _0xcf9d89 = _0xd43384[_0x2ef53b.selection];
    if (_0xcf9d89 === 'members') return this.openGroupMembers(_0x3a0293);
    if (_0xcf9d89 === 'invite') return this.openInviteToGroup(_0x3a0293);
    if (_0xcf9d89 === 'manage') return this.openManageGroup(_0x3a0293);
    if (_0xcf9d89 === 'create') return this.openCreateGroup(_0x3a0293);
    if (_0xcf9d89 === 'search') return this.openSearchGroup(_0x3a0293);
    if (_0xcf9d89 === 'invitations') return this.openGroupInvitations(_0x3a0293);
    if (_0xcf9d89 === 'leave') return (State.leaveGroup(_0x3a0293), this.openGroups(_0x3a0293));
    return this.openPlayer(_0x3a0293);
  }
  static async openGroupMembers(_0x3d6210) {
    const _0x1957f6 = State.langOf(_0x3d6210),
      _0x206423 = State._norm(_0x3d6210.name),
      _0x3f30c9 = State.groups.get(State.playerGroup.get(_0x206423));
    if (!_0x3f30c9) return this.openGroups(_0x3d6210);
    const _0x147ea6 = new Map();
    for (const _0x2d54a8 of world.getPlayers()) {
      if (_0x2d54a8.isValid) _0x147ea6.set(State._norm(_0x2d54a8.name), _0x2d54a8.name);
    }
    const _0x18c2bc = [..._0x3f30c9.members]
        .map((_0x412611) => ({
          norm: _0x412611,
          name:
            _0x147ea6.get(_0x412611) ||
            (_0x412611 === _0x3f30c9.ownerNorm
              ? _0x3f30c9.owner
              : _0x3f30c9.memberNames?.[_0x412611]) ||
            _0x412611,
        }))
        .sort((_0x4259d5, _0x3861a3) => _0x4259d5.name.localeCompare(_0x3861a3.name)),
      _0x3ad088 = new ActionFormData()
        .title(t(_0x1957f6, 'group_members_title', { name: _0x3f30c9.name }))
        .body(t(_0x1957f6, 'group_members_body', { count: _0x18c2bc.length }));
    for (const _0x486d6b of _0x18c2bc) {
      const _0x291b13 = _0x486d6b.norm === _0x206423,
        _0x5a2787 = _0x147ea6.has(_0x486d6b.norm),
        _0x185d7e =
          _0x486d6b.norm === _0x3f30c9.ownerNorm ? t(_0x1957f6, 'group_owner_suffix') : '';
      if (_0x291b13) {
        _0x3ad088.button(
          '§8' + _0x486d6b.name + _0x185d7e + '\n§8' + t(_0x1957f6, 'group_member_you') + '§9',
          'textures/ui/icon_steve',
        );
        continue;
      }
      const _0x3f8508 = t(_0x1957f6, _0x5a2787 ? 'group_member_online' : 'group_member_offline'),
        _0x382118 = _0x5a2787 ? '§a' : '§8';
      _0x3ad088.button(
        '' + _0x486d6b.name + _0x185d7e + '\n' + _0x382118 + _0x3f8508,
        'textures/ui/icon_steve',
      );
    }
    _0x3ad088.button(t(_0x1957f6, 'btn_back'), 'textures/ui/vcmc/icon_back');
    const _0x2d891e = await this._show(_0x3ad088, _0x3d6210);
    if (!_0x2d891e || _0x2d891e.canceled) return;
    if (_0x2d891e.selection === _0x18c2bc.length) return this.openGroups(_0x3d6210);
    const _0x341c9d = _0x18c2bc[_0x2d891e.selection];
    if (!_0x341c9d || _0x341c9d.norm === _0x206423) return this.openGroupMembers(_0x3d6210);
    return this.openUserVolumeSlider(_0x3d6210, _0x341c9d.norm, _0x341c9d.name);
  }
  static async openInviteToGroup(_0x329260) {
    const _0x2a2ed6 = State.langOf(_0x329260),
      _0x383493 = State._norm(_0x329260.name),
      _0x539c1b = State.groups.get(State.playerGroup.get(_0x383493));
    if (!_0x539c1b || _0x539c1b.ownerNorm !== _0x383493) return this.openGroups(_0x329260);
    const _0x515fe9 = [...world.getPlayers()]
      .filter(
        (_0x2bff84) => _0x2bff84.isValid && !_0x539c1b.members.has(State._norm(_0x2bff84.name)),
      )
      .sort((_0x55da7a, _0x13db09) => _0x55da7a.name.localeCompare(_0x13db09.name));
    if (_0x515fe9.length === 0)
      return (
        _0x329260.sendMessage(t(_0x2a2ed6, 'no_players_to_invite')),
        this.openGroups(_0x329260)
      );
    const _0x360241 = await this.pickFromList(_0x329260, {
      items: _0x515fe9,
      labelOf: (_0x5835f6) =>
        _0x539c1b.invites.has(State._norm(_0x5835f6.name))
          ? t(_0x2a2ed6, 'player_already_invited', { name: _0x5835f6.name })
          : _0x5835f6.name,
      sortKeyOf: (_0x5f24a7) => _0x5f24a7.name,
      iconOf: () => 'textures/ui/icon_steve',
      titleKey: 'invite_group_title',
      titleVars: { name: _0x539c1b.name },
      bodyKey: 'invite_group_body',
      searchLabelKey: 'btn_search_player',
    });
    if (_0x360241 === null) return;
    if (_0x360241 === 'back') return this.openGroups(_0x329260);
    const _0x474e2f = _0x360241.item;
    if (!_0x474e2f?.['isValid']) return this.openInviteToGroup(_0x329260);
    const _0x9c21bf = State.inviteToGroup(_0x329260, _0x474e2f);
    if (_0x9c21bf === 'invited')
      (_0x329260.sendMessage(
        t(_0x2a2ed6, 'group_invite_sent', { name: _0x474e2f.name, group: _0x539c1b.name }),
      ),
        _0x474e2f.sendMessage(
          t(State.langOf(_0x474e2f), 'group_invite_received', {
            owner: _0x329260.name,
            group: _0x539c1b.name,
          }),
        ));
    else
      _0x9c21bf === 'already_invited' &&
        _0x329260.sendMessage(t(_0x2a2ed6, 'group_already_invited', { name: _0x474e2f.name }));
    return this.openInviteToGroup(_0x329260);
  }
  static async openGroupInvitations(_0x14bc0e) {
    const _0xd2f726 = State.langOf(_0x14bc0e),
      _0x42fbc3 = State._norm(_0x14bc0e.name),
      _0xaf9585 = State.pendingInvitations(_0x42fbc3);
    if (_0xaf9585.length === 0)
      return (
        _0x14bc0e.sendMessage(t(_0xd2f726, 'no_pending_invitations')),
        this.openGroups(_0x14bc0e)
      );
    const _0xb6e802 = await this.pickFromList(_0x14bc0e, {
      items: _0xaf9585,
      labelOf: (_0x507442) =>
        '§e§l' + _0x507442.name + '\n§r§7' + _0x507442.owner + ' - #' + _0x507442.number,
      sortKeyOf: (_0x81fb28) => _0x81fb28.name + ' ' + _0x81fb28.owner,
      iconOf: () => 'textures/ui/vcmc/icon_mail',
      titleKey: 'group_invitations_title',
      bodyKey: 'group_invitations_body',
      searchLabelKey: 'btn_search_invitation',
    });
    if (_0xb6e802 === null) return;
    if (_0xb6e802 === 'back') return this.openGroups(_0x14bc0e);
    const _0x4820b0 = _0xb6e802.item;
    if (!_0x4820b0 || !_0x4820b0.invites.has(_0x42fbc3))
      return this.openGroupInvitations(_0x14bc0e);
    return this.openInvitationDecision(_0x14bc0e, _0x4820b0.number);
  }
  static async openInvitationDecision(_0x44cbbe, _0x3f0e56) {
    const _0x357d48 = State.langOf(_0x44cbbe),
      _0x19c8c2 = State._norm(_0x44cbbe.name),
      _0x312faf = State.groups.get(_0x3f0e56);
    if (!_0x312faf || !_0x312faf.invites.has(_0x19c8c2))
      return this.openGroupInvitations(_0x44cbbe);
    const _0x36fd4e = State.groups.get(State.playerGroup.get(_0x19c8c2)),
      _0xba66a3 = new ActionFormData()
        .title(t(_0x357d48, 'group_invitation_title', { name: _0x312faf.name }))
        .body(
          _0x36fd4e
            ? t(_0x357d48, 'group_invitation_switch_body', {
                owner: _0x312faf.owner,
                current: _0x36fd4e.name,
              })
            : t(_0x357d48, 'group_invitation_body', { owner: _0x312faf.owner }),
        )
        .button(t(_0x357d48, 'btn_accept_invitation'))
        .button(t(_0x357d48, 'btn_decline_invitation'))
        .button(t(_0x357d48, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x2753c5 = await this._show(_0xba66a3, _0x44cbbe);
    if (!_0x2753c5 || _0x2753c5.canceled) return;
    if (_0x2753c5.selection === 0)
      return (
        State.joinGroup(_0x44cbbe, _0x312faf.number),
        _0x44cbbe.sendMessage(
          t(_0x357d48, 'joined_group', { name: _0x312faf.name, num: _0x312faf.number }),
        ),
        this.openGroups(_0x44cbbe)
      );
    if (_0x2753c5.selection === 1)
      return (
        State.declineInvitation(_0x44cbbe, _0x312faf.number),
        _0x44cbbe.sendMessage(t(_0x357d48, 'group_invitation_declined', { name: _0x312faf.name })),
        this.openGroupInvitations(_0x44cbbe)
      );
    return this.openGroupInvitations(_0x44cbbe);
  }
  static async openCreateGroup(_0x329514) {
    const _0x1425f9 = State.langOf(_0x329514),
      _0x36b083 = new ModalFormData()
        .title(t(_0x1425f9, 'create_group_title'))
        .textField(t(_0x1425f9, 'field_group_name'), t(_0x1425f9, 'field_group_name_ph'))
        .textField(t(_0x1425f9, 'field_password_opt'), t(_0x1425f9, 'field_password_opt_ph'))
        .toggle(t(_0x1425f9, 'toggle_group_global_voice'), { defaultValue: true })
        .toggle(t(_0x1425f9, 'toggle_group_outside_proximity'), { defaultValue: false }),
      _0x28cdc1 = await this._show(_0x36b083, _0x329514);
    if (!_0x28cdc1 || _0x28cdc1.canceled || !_0x28cdc1.formValues) return;
    const [_0x366a6b, _0x4e4b87, _0x219275, _0x4ac918] = _0x28cdc1.formValues,
      _0x4df83a = (_0x366a6b || '').trim();
    if (!_0x4df83a) {
      _0x329514.sendMessage(t(_0x1425f9, 'group_needs_name'));
      return;
    }
    if (!_0x219275 && _0x4ac918)
      return (
        _0x329514.sendMessage(t(_0x1425f9, 'group_invalid_outside_without_global')),
        this.openCreateGroup(_0x329514)
      );
    const _0x25f996 = State.createGroup(
      _0x329514,
      _0x4df83a,
      (_0x4e4b87 || '').trim(),
      _0x219275,
      _0x4ac918,
    );
    if (_0x25f996 === 'limit_reached') {
      _0x329514.sendMessage(
        t(_0x1425f9, 'group_own_limit_reached', { max: State.settings.maxGroupsPerPlayer }),
      );
      return;
    }
    if (_0x25f996 === undefined) {
      _0x329514.sendMessage(t(_0x1425f9, 'group_limit_reached'));
      return;
    }
    _0x329514.sendMessage(t(_0x1425f9, 'group_created', { name: _0x4df83a, num: _0x25f996 }));
  }
  static async openManageGroup(_0x4ec713) {
    const _0x3270e3 = State.langOf(_0x4ec713),
      _0x5312ad = State._norm(_0x4ec713.name),
      _0x780071 = State.playerGroup.get(_0x5312ad),
      _0x54dd0a = State.groups.get(_0x780071);
    if (!_0x54dd0a || _0x54dd0a.ownerNorm !== _0x5312ad) return this.openGroups(_0x4ec713);
    const _0x5a8687 = new ActionFormData()
        .title(t(_0x3270e3, 'manage_group_title', { name: _0x54dd0a.name }))
        .body(t(_0x3270e3, 'manage_group_body', { num: _0x54dd0a.number }))
        .button(t(_0x3270e3, 'btn_group_voice_settings'), 'textures/ui/vcmc/icon_gear')
        .button(t(_0x3270e3, 'btn_delete_group'), 'textures/ui/vcmc/icon_x')
        .button(t(_0x3270e3, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x54a570 = await this._show(_0x5a8687, _0x4ec713);
    if (!_0x54a570 || _0x54a570.canceled) return;
    if (_0x54a570.selection === 0) return this.openEditGroupSettings(_0x4ec713);
    if (_0x54a570.selection === 1) return this.openDeleteGroupConfirmation(_0x4ec713);
    return this.openGroups(_0x4ec713);
  }
  static async openEditGroupSettings(_0x4131a5) {
    const _0x173899 = State.langOf(_0x4131a5),
      _0x4eeaef = State._norm(_0x4131a5.name),
      _0x5b0573 = State.groups.get(State.playerGroup.get(_0x4eeaef));
    if (!_0x5b0573 || _0x5b0573.ownerNorm !== _0x4eeaef) return;
    const _0x35a9d6 = State.settings.environmentalSfx === true,
      _0x43fc24 = new ModalFormData()
        .title(t(_0x173899, 'group_voice_settings_title'))
        .toggle(t(_0x173899, 'toggle_group_global_voice'), {
          defaultValue: _0x5b0573.globalVoice !== false,
        })
        .toggle(t(_0x173899, 'toggle_group_outside_proximity'), {
          defaultValue: _0x5b0573.proximityOutside === true,
        });
    _0x35a9d6 &&
      _0x43fc24.toggle(t(_0x173899, 'toggle_group_environmental_sfx'), {
        defaultValue: _0x5b0573.environmentalSfx === true,
      });
    const _0x5ead2d = await this._show(_0x43fc24, _0x4131a5);
    if (!_0x5ead2d || _0x5ead2d.canceled || !_0x5ead2d.formValues) return;
    const [_0x1057f5, _0x8041e6] = _0x5ead2d.formValues,
      _0x4706de = _0x35a9d6
        ? _0x5ead2d.formValues[2] === true
        : _0x5b0573.environmentalSfx === true;
    if (!_0x1057f5 && _0x8041e6)
      return (
        _0x4131a5.sendMessage(t(_0x173899, 'group_invalid_outside_without_global')),
        this.openEditGroupSettings(_0x4131a5)
      );
    (State.updateGroupSettings(_0x4131a5, _0x1057f5, _0x8041e6, _0x4706de),
      _0x4131a5.sendMessage(t(_0x173899, 'group_settings_saved')));
  }
  static async openDeleteGroupConfirmation(_0x2b13f3) {
    const _0x1d4b7f = State.langOf(_0x2b13f3),
      _0x3f8233 = State._norm(_0x2b13f3.name),
      _0x3fa79b = State.playerGroup.get(_0x3f8233),
      _0x632bfd = State.groups.get(_0x3fa79b);
    if (!_0x632bfd || _0x632bfd.ownerNorm !== _0x3f8233) return;
    const _0x5d57f4 = new ActionFormData()
        .title(t(_0x1d4b7f, 'delete_group_title'))
        .body(t(_0x1d4b7f, 'delete_group_body', { name: _0x632bfd.name, num: _0x632bfd.number }))
        .button(t(_0x1d4b7f, 'btn_confirm_delete'))
        .button(t(_0x1d4b7f, 'btn_back'), 'textures/ui/vcmc/icon_back'),
      _0x59d52c = await this._show(_0x5d57f4, _0x2b13f3);
    if (!_0x59d52c || _0x59d52c.canceled) return;
    if (_0x59d52c.selection !== 0) return this.openManageGroup(_0x2b13f3);
    State.deleteGroup(_0x2b13f3) &&
      _0x2b13f3.sendMessage(
        t(_0x1d4b7f, 'group_deleted', { name: _0x632bfd.name, num: _0x632bfd.number }),
      );
  }
  static async openSearchGroup(_0x215cc5) {
    const _0x228956 = State.langOf(_0x215cc5),
      _0x231c57 = State._norm(_0x215cc5.name),
      _0x36fd04 = [...State.groups.values()].filter((_0x13570d) => _0x13570d.adminManaged !== true);
    if (_0x36fd04.length === 0) {
      _0x215cc5.sendMessage(t(_0x228956, 'no_active_groups'));
      return;
    }
    const _0xd32a57 = (_0xcafe95) => _0xcafe95.ownerNorm === _0x231c57;
    _0x36fd04.sort((_0x4009c3, _0x131842) => {
      const _0x20585e = _0xd32a57(_0x4009c3) ? 0 : 1,
        _0x181c89 = _0xd32a57(_0x131842) ? 0 : 1;
      if (_0x20585e !== _0x181c89) return _0x20585e - _0x181c89;
      return _0x4009c3.name.toLowerCase().localeCompare(_0x131842.name.toLowerCase());
    });
    const _0x3e6325 = await this.pickFromList(_0x215cc5, {
      items: _0x36fd04,
      labelOf: (_0x29499e) => {
        const _0x535642 = _0x29499e.password ? t(_0x228956, 'group_lock') : '',
          _0x35923c = _0xd32a57(_0x29499e) ? t(_0x228956, 'group_mine_suffix') : '',
          _0x4473bc = t(_0x228956, 'group_by', {
            owner: _0x29499e.owner,
            count: _0x29499e.members.size,
          }),
          _0x5e2b3d = _0xd32a57(_0x29499e)
            ? '§a§l#' + _0x29499e.number + ' ' + _0x29499e.name
            : '§l#' + _0x29499e.number + ' ' + _0x29499e.name;
        return '' + _0x5e2b3d + _0x535642 + _0x35923c + '\n' + _0x4473bc;
      },
      sortKeyOf: (_0x3bb7be) =>
        (_0xd32a57(_0x3bb7be) ? '0' : '1') + ' ' + _0x3bb7be.name + ' ' + _0x3bb7be.owner,
      iconOf: () => 'textures/ui/vcmc/icon_people',
      titleKey: 'search_group_title',
      bodyKey: 'search_group_body',
      searchLabelKey: 'btn_search_group',
    });
    if (_0x3e6325 === null) return;
    if (_0x3e6325 === 'back') return this.openGroups(_0x215cc5);
    const _0x3243a8 = _0x3e6325.item;
    if (!_0x3243a8 || !State.groups.has(_0x3243a8.number)) {
      _0x215cc5.sendMessage(t(_0x228956, 'group_no_longer'));
      return;
    }
    const _0x1f86fc = State._norm(_0x215cc5.name),
      _0x372c = _0x3243a8.invites?.['has'](_0x1f86fc) === true;
    let _0x3998f2;
    if (_0x3243a8.password && !_0x372c && !State.hasRememberedAccess(_0x215cc5, _0x3243a8)) {
      const _0x527abe = _0x215cc5.playerPermissionLevel === PlayerPermissionLevel.Operator;
      if (_0x527abe) {
        const _0x93be4c = new ActionFormData()
            .title(t(_0x228956, 'admin_password_warning_title', { name: _0x3243a8.name }))
            .body(t(_0x228956, 'admin_password_warning_body', { name: _0x3243a8.name }))
            .button(t(_0x228956, 'btn_admin_join_protected'), 'textures/ui/vcmc/icon_people')
            .button(t(_0x228956, 'btn_back'), 'textures/ui/vcmc/icon_back'),
          _0x59766a = await this._show(_0x93be4c, _0x215cc5);
        if (!_0x59766a || _0x59766a.canceled) return;
        if (_0x59766a.selection !== 0) return this.openSearchGroup(_0x215cc5);
      } else {
        const _0x30bd6c = new ModalFormData()
            .title(t(_0x228956, 'password_title', { name: _0x3243a8.name }))
            .textField(
              t(_0x228956, 'field_enter_password'),
              t(_0x228956, 'field_group_password_ph'),
            ),
          _0x3a5338 = await this._show(_0x30bd6c, _0x215cc5);
        if (!_0x3a5338 || _0x3a5338.canceled || !_0x3a5338.formValues) return;
        _0x3998f2 = (_0x3a5338.formValues[0] || '').trim();
        if (_0x3998f2 !== _0x3243a8.password) {
          _0x215cc5.sendMessage(t(_0x228956, 'wrong_password'));
          return;
        }
      }
    }
    const _0x132b86 = State.groups.get(_0x3243a8.number);
    if (!_0x132b86) {
      _0x215cc5.sendMessage(t(_0x228956, 'group_no_longer'));
      return;
    }
    const _0xfe8e00 = State._norm(_0x215cc5.name),
      _0x142741 =
        _0x132b86.password &&
        _0x132b86.password !== _0x3998f2 &&
        _0x132b86.invites?.['has'](_0xfe8e00) !== true &&
        !State.hasRememberedAccess(_0x215cc5, _0x132b86);
    if (_0x142741 && _0x215cc5.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
      _0x215cc5.sendMessage(t(_0x228956, 'wrong_password'));
      return;
    }
    if (!State.joinGroup(_0x215cc5, _0x132b86.number)) {
      _0x215cc5.sendMessage(t(_0x228956, 'group_no_longer'));
      return;
    }
    _0x215cc5.sendMessage(
      t(_0x228956, 'joined_group', { name: _0x132b86.name, num: _0x132b86.number }),
    );
  }
}
(system.beforeEvents.startup.subscribe((_0x53cd84) => {
  const _0x2367e6 = _0x53cd84.customCommandRegistry;
  (_0x2367e6.registerEnum('verity:sfx_catalog_action', ['add', 'delete', 'list']),
    _0x2367e6.registerEnum('verity:sfx_player_action', ['set', 'clear']),
    _0x2367e6.registerEnum('verity:groups_action', ['create', 'join', 'leave', 'list', 'delete']),
    _0x2367e6.registerEnum('verity:groups_admin_action', [
      'create',
      'move',
      'leave',
      'list',
      'delete',
    ]),
    _0x2367e6.registerEnum('verity:groups_setting', ['global', 'external', 'environmental']),
    _0x2367e6.registerEnum('verity:sfx_effect', [
      'normal',
      'cave',
      'water',
      'echo',
      'radio',
      'nether',
      'custom',
    ]),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:bridge-pull',
        description: 'Read one VCMC WORLD bridge frame',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [{ name: 'part', type: CustomCommandParamType.Integer }],
      },
      (_0x10d89d, _0xdc487a) => ({
        status: CustomCommandStatus.Success,
        message: State.readBridgeFrame(_0xdc487a),
      }),
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:bridge-sync',
        description: 'Synchronize one VCMC WORLD bridge frame',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: 'room_id', type: CustomCommandParamType.String },
          { name: 'part', type: CustomCommandParamType.Integer },
        ],
        optionalParameters: [{ name: 'controls', type: CustomCommandParamType.String }],
      },
      (_0x33f89f, _0x1ab8fe, _0x255f67, _0x4b71cd) => {
        return (
          system.run(() => State.receiveWorldSync(_0x1ab8fe, _0x4b71cd)),
          { status: CustomCommandStatus.Success, message: State.readBridgeFrame(_0x255f67) }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:world-sync',
        description: 'Bidirectional VCMC WORLD synchronization',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: 'room_id', type: CustomCommandParamType.String },
          { name: 'metadata_part', type: CustomCommandParamType.Integer },
          { name: 'downlink_envelope', type: CustomCommandParamType.String },
          { name: 'downlink_payload', type: CustomCommandParamType.String },
        ],
      },
      (_0x11787c, _0x183775, _0x515737, _0x238f41, _0x589100) => ({
        status: CustomCommandStatus.Success,
        message: State.receiveWorldV3Sync(_0x183775, _0x515737, _0x238f41, _0x589100),
      }),
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:radar-sync',
        description: 'Synchronize compact VCMC WORLD coordinates',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: 'room_id', type: CustomCommandParamType.String },
          { name: 'target', type: CustomCommandParamType.String },
          { name: 'voice_state', type: CustomCommandParamType.String },
          { name: 'voice_level', type: CustomCommandParamType.Integer },
        ],
      },
      (_0x50ed46, _0x583980, _0x30bda4, _0x57f4dc, _0x38c18f) => {
        return (
          system.run(() => State.receiveWorldRadarSync(_0x583980, _0x30bda4, _0x57f4dc, _0x38c18f)),
          { status: CustomCommandStatus.Success, message: State.readRadarFrame() }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:mute',
        description: 'Force-mute or unmute players in VCMC voice chat.',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
          { name: 'target', type: CustomCommandParamType.EntitySelector },
          { name: 'muted', type: CustomCommandParamType.Boolean },
        ],
      },
      (_0x39616e, _0x2c95f8, _0x5089b0) => {
        return (
          system.run(() => {
            for (const _0x5623fb of _0x2c95f8) {
              if (!_0x5623fb.isValid) continue;
              const _0x2f0100 = State._norm(_0x5623fb.name);
              (State.forceMuteState.set(_0x2f0100, _0x5089b0),
                State.pendingMuteFlushes.set(_0x2f0100, { muted: _0x5089b0, ticksLeft: 3 }));
              const _0x13d063 = State.playerInfo.get(_0x2f0100)?.['state'] === 'CONNECTED';
              State.setVoiceScore(_0x5623fb, !_0x13d063 ? -2 : _0x5089b0 ? -1 : 0, true, true);
            }
            ((State.bridgeSignature = ''), State._refreshBridgeSnapshot());
            const _0x12fadd = _0x39616e.sourceEntity;
            if (_0x12fadd?.['isValid']) {
              const _0x188d1c = State.langOf(_0x12fadd),
                _0x2cedde = _0x2c95f8.filter((_0xe0e1bc) => _0xe0e1bc.isValid).length;
              if (_0x2cedde > 0) {
                const _0x2d9ad5 = t(_0x188d1c, _0x5089b0 ? 'muted_word' : 'unmuted_word');
                _0x12fadd.sendMessage(
                  t(_0x188d1c, 'mute_result', { count: _0x2cedde, state: _0x2d9ad5 }),
                );
              } else _0x12fadd.sendMessage(t(_0x188d1c, 'no_matching'));
            }
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:sfx',
        description: 'Create, replace, delete or list custom VCMC voice effects.',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
          { name: 'verity:sfx_catalog_action', type: CustomCommandParamType.Enum },
        ],
        optionalParameters: [
          { name: 'name', type: CustomCommandParamType.String },
          { name: 'definition', type: CustomCommandParamType.String },
        ],
      },
      (_0x552461, _0xae817e, _0x1a934c, _0x481a44) => {
        return (
          system.run(() => {
            const _0x1e209d = _0x552461.sourceEntity,
              _0x5b55bc =
                _0x1e209d instanceof Player && _0x1e209d.isValid ? State.langOf(_0x1e209d) : 'en',
              _0x5a987b = (_0x2483b5) => {
                if (_0x1e209d instanceof Player && _0x1e209d.isValid)
                  _0x1e209d.sendMessage(_0x2483b5);
              };
            if (_0xae817e === 'list') {
              const _0x31b878 = [...State.customSfx.keys()].sort();
              _0x5a987b(
                _0x31b878.length > 0
                  ? t(_0x5b55bc, 'sfx_catalog_list', { names: _0x31b878.join(', ') })
                  : t(_0x5b55bc, 'sfx_catalog_empty'),
              );
              return;
            }
            const _0x10c2da = State.normalizeSfxName(_0x1a934c);
            if (!_0x10c2da) {
              _0x5a987b(t(_0x5b55bc, 'sfx_name_required'));
              return;
            }
            if (_0xae817e === 'delete') {
              const _0x5bee36 = State.customSfx.delete(_0x10c2da);
              if (_0x5bee36) {
                if (!State.isBuiltinSfx(_0x10c2da)) {
                  for (const [_0x43a7ae, _0x1c9358] of State.playerSfx) {
                    if (_0x1c9358 === _0x10c2da) State.playerSfx.delete(_0x43a7ae);
                  }
                  State.savePlayerSfx();
                }
                State.touchSfxCatalog();
              }
              _0x5a987b(
                _0x5bee36
                  ? t(_0x5b55bc, 'sfx_catalog_deleted', { name: _0x10c2da })
                  : t(_0x5b55bc, 'sfx_catalog_not_custom', { name: _0x10c2da }),
              );
              return;
            }
            if (typeof _0x481a44 !== 'string' || !_0x481a44.trim()) {
              _0x5a987b(t(_0x5b55bc, 'sfx_catalog_add_usage'));
              return;
            }
            try {
              const _0x181eba = JSON.parse(_0x481a44),
                _0x5dcf4b = State.sanitizeSfxDefinition(_0x181eba);
              if (!_0x5dcf4b) throw new Error('definition');
              if (!State.customSfx.has(_0x10c2da) && State.customSfx.size >= State.SFX_MAX_CUSTOM) {
                _0x5a987b(t(_0x5b55bc, 'sfx_catalog_limit', { max: State.SFX_MAX_CUSTOM }));
                return;
              }
              (State.customSfx.set(_0x10c2da, _0x5dcf4b),
                State.touchSfxCatalog(),
                _0x5a987b(t(_0x5b55bc, 'sfx_catalog_saved', { name: _0x10c2da })));
            } catch (_0xda9fc6) {
              _0x5a987b(t(_0x5b55bc, 'sfx_catalog_json_invalid'));
            }
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:sfx-player',
        description: 'Apply or clear a VCMC effect on selected players.',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
          { name: 'verity:sfx_player_action', type: CustomCommandParamType.Enum },
          { name: 'target', type: CustomCommandParamType.EntitySelector },
        ],
        optionalParameters: [
          { name: 'verity:sfx_effect', type: CustomCommandParamType.Enum },
          { name: 'custom_effect', type: CustomCommandParamType.String },
        ],
      },
      (_0x10a340, _0x44d1dd, _0x554e3f, _0x3b94c8, _0x386a2a) => {
        return (
          system.run(() => {
            const _0x12eb4c = _0x554e3f.filter(
                (_0x9fc3f) => _0x9fc3f instanceof Player && _0x9fc3f.isValid,
              ),
              _0x51d927 = _0x10a340.sourceEntity,
              _0x3022ff =
                _0x51d927 instanceof Player && _0x51d927.isValid ? State.langOf(_0x51d927) : 'en';
            if (_0x12eb4c.length === 0) {
              if (_0x51d927 instanceof Player && _0x51d927.isValid)
                _0x51d927.sendMessage(t(_0x3022ff, 'no_matching'));
              return;
            }
            if (_0x44d1dd === 'set') {
              if (!_0x3b94c8) {
                _0x51d927 instanceof Player &&
                  _0x51d927.isValid &&
                  _0x51d927.sendMessage(t(_0x3022ff, 'sfx_choose_effect'));
                return;
              }
              const _0xb01610 = State.normalizeSfxName(
                  _0x3b94c8 === 'custom' ? _0x386a2a : _0x3b94c8,
                ),
                _0x475b95 = [...State.customSfx.keys()].find(
                  (_0x8c85a1) => State.normalizeSfxName(_0x8c85a1) === _0xb01610,
                ),
                _0x3fbda4 =
                  _0x3b94c8 === 'custom'
                    ? _0x475b95
                    : State.isBuiltinSfx(_0xb01610)
                      ? _0xb01610
                      : undefined;
              if (!_0x3fbda4) {
                _0x51d927 instanceof Player &&
                  _0x51d927.isValid &&
                  _0x51d927.sendMessage(t(_0x3022ff, 'sfx_not_found', { name: _0xb01610 }));
                return;
              }
              for (const _0x2d53af of _0x12eb4c) {
                State.playerSfx.set(State._norm(_0x2d53af.name), _0x3fbda4);
              }
              (State.savePlayerSfx(),
                _0x51d927 instanceof Player &&
                  _0x51d927.isValid &&
                  _0x51d927.sendMessage(
                    t(_0x3022ff, 'sfx_result', { count: _0x12eb4c.length, effect: _0x3fbda4 }),
                  ));
            } else {
              let _0x469fe1 = 0;
              for (const _0x564e7e of _0x12eb4c) {
                if (State.playerSfx.delete(State._norm(_0x564e7e.name))) _0x469fe1++;
              }
              (State.savePlayerSfx(),
                _0x51d927 instanceof Player &&
                  _0x51d927.isValid &&
                  _0x51d927.sendMessage(t(_0x3022ff, 'sfx_cleared', { count: _0x469fe1 })));
            }
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:megaphone',
        description: 'Enable or disable the VCMC megaphone for selected players.',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
          { name: 'target', type: CustomCommandParamType.EntitySelector },
          { name: 'enabled', type: CustomCommandParamType.Boolean },
        ],
      },
      (_0x40469d, _0x359f64, _0x358277) => {
        return (
          system.run(() => {
            const _0x152a22 = _0x359f64.filter(
              (_0x5b9aba) => _0x5b9aba instanceof Player && _0x5b9aba.isValid,
            );
            let _0x5701f2 = 0,
              _0x5d0052 = 0,
              _0x3845b4 = 0;
            if (_0x358277) {
              let _0x4f97a6 = Math.max(0, State.MEGAPHONE_MAX - State.megaphonePlayers.size);
              for (const _0x1c2603 of _0x152a22) {
                const _0x338e89 = State._norm(_0x1c2603.name);
                if (State.megaphonePlayers.has(_0x338e89)) {
                  State._setMegaphoneHud(_0x1c2603, true);
                  continue;
                }
                const _0x16cd0e = State.playerInfo.get(_0x338e89);
                if (!_0x16cd0e || _0x16cd0e.state !== 'CONNECTED') {
                  _0x5d0052++;
                  continue;
                }
                if (_0x4f97a6 <= 0) {
                  _0x3845b4++;
                  continue;
                }
                (State.megaphonePlayers.add(_0x338e89),
                  State.environmentalSfx.delete(_0x338e89),
                  State._setMegaphoneHud(_0x1c2603, true),
                  _0x4f97a6--,
                  _0x5701f2++);
              }
            } else
              for (const _0x3216af of _0x152a22) {
                const _0x53910e = State._norm(_0x3216af.name);
                if (State.megaphonePlayers.delete(_0x53910e)) _0x5701f2++;
                State._setMegaphoneHud(_0x3216af, false);
              }
            const _0x260587 = _0x40469d.sourceEntity;
            if (_0x260587 instanceof Player && _0x260587.isValid) {
              const _0x2b3ac0 = State.langOf(_0x260587);
              (_0x260587.sendMessage(
                t(_0x2b3ac0, 'megaphone_result', {
                  count: _0x5701f2,
                  state: t(
                    _0x2b3ac0,
                    _0x358277 ? 'megaphone_enabled_word' : 'megaphone_disabled_word',
                  ),
                  active: State.megaphonePlayers.size,
                  max: State.MEGAPHONE_MAX,
                }),
              ),
                _0x5d0052 > 0 &&
                  _0x260587.sendMessage(
                    t(_0x2b3ac0, 'megaphone_not_connected', { count: _0x5d0052 }),
                  ),
                _0x3845b4 > 0 &&
                  _0x260587.sendMessage(
                    t(_0x2b3ac0, 'megaphone_limit', { count: _0x3845b4, max: State.MEGAPHONE_MAX }),
                  ));
            }
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:m',
        description: 'Mute or unmute your own mic in VCMC voice chat.',
        permissionLevel: CommandPermissionLevel.Any,
        optionalParameters: [{ name: 'muted', type: CustomCommandParamType.Boolean }],
      },
      (_0x24ea37, _0x3edb81) => {
        const _0x423096 = _0x24ea37.sourceEntity;
        if (!(_0x423096 instanceof Player)) return { status: CustomCommandStatus.Failure };
        return (
          system.run(() => {
            if (!_0x423096.isValid) return;
            const _0x26d22c = State.langOf(_0x423096),
              _0x37385f = State._norm(_0x423096.name),
              _0x37e194 = State.playerInfo.get(_0x37385f);
            if (!_0x37e194 || _0x37e194.state !== 'CONNECTED') {
              _0x423096.sendMessage(t(_0x26d22c, 'not_in_app'));
              return;
            }
            if (State.forceMuteState.get(_0x37385f) === true) {
              _0x423096.sendMessage(t(_0x26d22c, 'selfmute_forced'));
              return;
            }
            const _0x524d5d =
              typeof _0x3edb81 === 'boolean' ? _0x3edb81 : !State.appMuteState.get(_0x37385f);
            (State.appMuteState.set(_0x37385f, _0x524d5d),
              State.pendingSelfMutes.set(_0x37385f, { muted: _0x524d5d, ticksLeft: 3 }),
              (State.bridgeSignature = ''),
              State._refreshBridgeSnapshot(),
              State.setVoiceScore(_0x423096, _0x524d5d ? -1 : 0, true, true),
              _0x423096.sendMessage(t(_0x26d22c, _0x524d5d ? 'selfmute_on' : 'selfmute_off')));
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:verify',
        description: 'Verify your identity for VCMC voice chat',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [{ name: 'code', type: CustomCommandParamType.String }],
      },
      (_0x29e589, _0x5d500c) => {
        return (
          system.run(() => {
            const _0x15b8fc = _0x29e589.sourceEntity;
            if (!(_0x15b8fc instanceof Player)) return;
            const _0x59fc29 = _0x15b8fc,
              _0x4de38c = State.langOf(_0x59fc29),
              _0x57f455 = State._norm(_0x59fc29.name);
            if (State.playerInfo.get(_0x57f455)?.['state'] === 'CONNECTED') {
              _0x59fc29.sendMessage(t(_0x4de38c, 'verify_already_connected'));
              return;
            }
            const _0x36775c = (_0x5d500c || '').trim();
            if (!_0x36775c) {
              _0x59fc29.sendMessage(t(_0x4de38c, 'verify_usage'));
              return;
            }
            const _0x1652a1 = State.pendingVerifications.some(
              (_0x212c5f) =>
                State._norm(_0x212c5f.name) === _0x57f455 && _0x212c5f.code === _0x36775c,
            );
            (!_0x1652a1 &&
              ((State.pendingVerifications = State.pendingVerifications.filter(
                (_0x15ad29) => State._norm(_0x15ad29.name) !== _0x57f455,
              )),
              State.pendingVerifications.push({
                name: _0x59fc29.name,
                code: _0x36775c,
                ticksLeft: 3,
              }),
              (State.bridgeSignature = ''),
              State._refreshBridgeSnapshot()),
              _0x59fc29.sendMessage(t(_0x4de38c, 'verify_checking')));
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:menu',
        description: 'Open the VCMC player menu',
        permissionLevel: CommandPermissionLevel.Any,
      },
      (_0x3a4fdf) => {
        const _0x1ca52f = _0x3a4fdf.sourceEntity;
        return (
          system.run(() => {
            if (_0x1ca52f instanceof Player) UI.openPlayer(_0x1ca52f);
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:groups',
        description: 'Manage your VCMC voice group with commands',
        permissionLevel: CommandPermissionLevel.Any,
        optionalParameters: [
          { name: 'verity:groups_action', type: CustomCommandParamType.Enum },
          { name: 'value', type: CustomCommandParamType.String },
          { name: 'password', type: CustomCommandParamType.String },
        ],
      },
      (_0x5599c6, _0xfee555, _0x1b0584, _0x3cce9e) => {
        const _0x43861b = _0x5599c6.sourceEntity;
        if (!(_0x43861b instanceof Player)) return { status: CustomCommandStatus.Failure };
        return (
          system.run(() => {
            if (!_0x43861b.isValid) return;
            const _0x3cffbc = State.langOf(_0x43861b),
              _0x1024c7 = String(_0xfee555 || '').toLowerCase();
            if (!State.settings.groups && _0x1024c7 !== 'delete') {
              _0x43861b.sendMessage(t(_0x3cffbc, 'groups_disabled'));
              return;
            }
            const _0x252ac2 = State._norm(_0x43861b.name),
              _0x4153f6 = State.groups.get(State.playerGroup.get(_0x252ac2)),
              _0x8110d = _0x4153f6?.['adminManaged'] === true,
              _0x3d825f = _0x43861b.playerPermissionLevel === PlayerPermissionLevel.Operator,
              _0x36d2b1 = (_0x1436d2, _0x1e5c35 = false) => {
                const _0x36abee = String(_0x1436d2 || '').trim();
                if (!_0x36abee) return undefined;
                const _0x174bd3 = Number(_0x36abee.replace(/^#/, ''));
                let _0x505385 = Number.isInteger(_0x174bd3)
                  ? State.groups.get(_0x174bd3)
                  : undefined;
                if (!_0x505385) {
                  const _0x3b5cd4 = _0x36abee.toLowerCase();
                  _0x505385 = [...State.groups.values()].find(
                    (_0x464a48) =>
                      (_0x1e5c35 || _0x464a48.adminManaged !== true) &&
                      _0x464a48.name.toLowerCase() === _0x3b5cd4,
                  );
                }
                return _0x505385 && (_0x1e5c35 || _0x505385.adminManaged !== true)
                  ? _0x505385
                  : undefined;
              };
            if (!_0x1024c7) {
              (_0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_title')),
                _0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_create')),
                _0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_join')),
                _0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_leave')),
                _0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_list')),
                _0x43861b.sendMessage(t(_0x3cffbc, 'java_groups_help_delete')));
              return;
            }
            if (_0x1024c7 === 'create') {
              if (_0x8110d) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'managed_group_locked'));
                return;
              }
              const _0x385215 = State.nextGroupNumber();
              if (_0x385215 === undefined) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_limit_reached'));
                return;
              }
              const _0x30acf7 =
                  String(_0x1b0584 || '')
                    .trim()
                    .slice(0, 40) || State.defaultGroupName(_0x385215),
                _0x1020e8 = String(_0x3cce9e || '')
                  .trim()
                  .slice(0, 40),
                _0x37bebd = State.createGroup(_0x43861b, _0x30acf7, _0x1020e8, true, false);
              if (_0x37bebd === 'limit_reached') {
                _0x43861b.sendMessage(
                  t(_0x3cffbc, 'group_own_limit_reached', {
                    max: State.settings.maxGroupsPerPlayer,
                  }),
                );
                return;
              }
              if (_0x37bebd === undefined) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_limit_reached'));
                return;
              }
              _0x43861b.sendMessage(
                t(_0x3cffbc, 'group_created', { name: _0x30acf7, num: _0x37bebd }),
              );
              return;
            }
            if (_0x1024c7 === 'join') {
              if (_0x8110d) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'managed_group_locked'));
                return;
              }
              const _0x2ca63f = String(_0x1b0584 || '').trim();
              if (!_0x2ca63f) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_join_usage'));
                return;
              }
              const _0x56e1e9 = _0x36d2b1(_0x2ca63f, false);
              if (!_0x56e1e9) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_not_found'));
                return;
              }
              const _0x523494 = String(_0x3cce9e || '').trim(),
                _0x4d477e =
                  !_0x56e1e9.password ||
                  _0x56e1e9.password === _0x523494 ||
                  _0x56e1e9.invites?.['has'](_0x252ac2) === true ||
                  State.hasRememberedAccess(_0x43861b, _0x56e1e9);
              if (!_0x4d477e) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'wrong_password'));
                return;
              }
              if (!State.joinGroup(_0x43861b, _0x56e1e9.number)) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_no_longer'));
                return;
              }
              _0x43861b.sendMessage(
                t(_0x3cffbc, 'joined_group', { name: _0x56e1e9.name, num: _0x56e1e9.number }),
              );
              return;
            }
            if (_0x1024c7 === 'leave') {
              if (_0x8110d) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'managed_group_locked'));
                return;
              }
              (State.leaveGroupByNorm(_0x252ac2, _0x43861b),
                _0x43861b.sendMessage(t(_0x3cffbc, 'left_group_plain')));
              return;
            }
            if (_0x1024c7 === 'list') {
              const _0xa00d71 = [...State.groups.values()]
                .filter((_0x1f79c5) => _0x1f79c5.adminManaged !== true)
                .sort((_0x42a6d0, _0x29a4b2) => _0x42a6d0.number - _0x29a4b2.number);
              if (_0xa00d71.length === 0) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'groups_empty_command'));
                return;
              }
              _0x43861b.sendMessage(t(_0x3cffbc, 'groups_active_title'));
              for (const _0x21cd4f of _0xa00d71) {
                _0x43861b.sendMessage(
                  t(_0x3cffbc, 'group_list_line', {
                    num: _0x21cd4f.number,
                    name: _0x21cd4f.name,
                    lock: _0x21cd4f.password ? t(_0x3cffbc, 'group_lock_short') : '',
                    count: _0x21cd4f.members.size,
                  }),
                );
              }
              return;
            }
            if (_0x1024c7 === 'delete') {
              const _0x2aeafc = String(_0x1b0584 || '').trim(),
                _0x424ca5 = _0x2aeafc ? _0x36d2b1(_0x2aeafc, _0x3d825f) : _0x4153f6;
              if (!_0x424ca5) {
                _0x43861b.sendMessage(
                  _0x2aeafc ? t(_0x3cffbc, 'group_not_found') : t(_0x3cffbc, 'group_delete_usage'),
                );
                return;
              }
              if (!_0x3d825f && _0x424ca5.ownerNorm !== _0x252ac2) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_delete_forbidden'));
                return;
              }
              const _0x2bf7ea = State.deleteGroupByNumber(_0x424ca5.number);
              if (!_0x2bf7ea) {
                _0x43861b.sendMessage(t(_0x3cffbc, 'group_no_longer'));
                return;
              }
              _0x43861b.sendMessage(
                t(_0x3cffbc, 'group_deleted', { name: _0x424ca5.name, num: _0x424ca5.number }),
              );
              return;
            }
            _0x43861b.sendMessage(t(_0x3cffbc, 'groups_usage'));
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:groups-settings',
        description: 'Change VCMC voice-group settings as its creator or an operator',
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: 'group', type: CustomCommandParamType.Integer },
          { name: 'verity:groups_setting', type: CustomCommandParamType.Enum },
          { name: 'enabled', type: CustomCommandParamType.Boolean },
        ],
      },
      (_0x2a00f6, _0x521e47, _0x3661c0, _0x1cc1d8) => {
        const _0x2b26c0 = _0x2a00f6.sourceEntity;
        if (!(_0x2b26c0 instanceof Player)) return { status: CustomCommandStatus.Failure };
        return (
          system.run(() => {
            if (!_0x2b26c0.isValid) return;
            const _0x1c1825 = State.langOf(_0x2b26c0),
              _0x1e2514 = State.groups.get(Number(_0x521e47) | 0);
            if (!_0x1e2514) {
              _0x2b26c0.sendMessage(t(_0x1c1825, 'group_not_found'));
              return;
            }
            const _0x3d87c8 = State._norm(_0x2b26c0.name),
              _0x157b5a = _0x2b26c0.playerPermissionLevel === PlayerPermissionLevel.Operator;
            if (!_0x157b5a && _0x1e2514.ownerNorm !== _0x3d87c8) {
              _0x2b26c0.sendMessage(t(_0x1c1825, 'groups_settings_forbidden'));
              return;
            }
            const _0x1aa331 = String(_0x3661c0 || '').toLowerCase(),
              _0x3bba89 = _0x1cc1d8 === true;
            let _0x671ce5;
            if (_0x1aa331 === 'global') {
              ((_0x671ce5 = _0x1e2514.globalVoice !== false), (_0x1e2514.globalVoice = _0x3bba89));
              if (!_0x3bba89) _0x1e2514.proximityOutside = false;
            } else {
              if (_0x1aa331 === 'external') {
                if (_0x3bba89 && _0x1e2514.globalVoice === false) {
                  _0x2b26c0.sendMessage(t(_0x1c1825, 'group_invalid_outside_without_global'));
                  return;
                }
                ((_0x671ce5 = _0x1e2514.proximityOutside === true),
                  (_0x1e2514.proximityOutside = _0x3bba89));
              } else {
                if (_0x1aa331 === 'environmental') {
                  if (_0x3bba89 && State.settings.environmentalSfx !== true) {
                    _0x2b26c0.sendMessage(t(_0x1c1825, 'groups_settings_environment_disabled'));
                    return;
                  }
                  ((_0x671ce5 = _0x1e2514.environmentalSfx === true),
                    (_0x1e2514.environmentalSfx = _0x3bba89));
                  if (!_0x3bba89)
                    for (const _0x5e7e9f of _0x1e2514.members) {
                      State.environmentalSfx.delete(_0x5e7e9f);
                    }
                } else {
                  _0x2b26c0.sendMessage(t(_0x1c1825, 'groups_settings_usage'));
                  return;
                }
              }
            }
            (State.saveGroups(),
              _0x2b26c0.sendMessage(
                t(_0x1c1825, 'groups_settings_changed', {
                  num: _0x1e2514.number,
                  setting: _0x1aa331,
                  before: t(_0x1c1825, _0x671ce5 ? 'groups_settings_on' : 'groups_settings_off'),
                  after: t(_0x1c1825, _0x3bba89 ? 'groups_settings_on' : 'groups_settings_off'),
                }),
              ));
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:groups-admin',
        description: 'Create, list, delete, or force-move voice groups and players',
        permissionLevel: CommandPermissionLevel.GameDirectors,
        mandatoryParameters: [
          { name: 'verity:groups_admin_action', type: CustomCommandParamType.Enum },
        ],
        optionalParameters: [
          { name: 'value', type: CustomCommandParamType.String },
          { name: 'target', type: CustomCommandParamType.PlayerSelector },
        ],
      },
      (_0x148d81, _0x4ed6ff, _0x48b8e4, _0x25dff8) => {
        const _0xf15e50 = _0x148d81.sourceEntity;
        if (!(_0xf15e50 instanceof Player)) return { status: CustomCommandStatus.Failure };
        return (
          system.run(() => {
            if (!_0xf15e50.isValid) return;
            const _0x247c45 = State.langOf(_0xf15e50),
              _0x539f7d = String(_0x4ed6ff || '').toLowerCase();
            if (_0x539f7d === 'create') {
              const _0x4deb12 = Number(String(_0x48b8e4 ?? '').replace('#', ''));
              if (
                !Number.isInteger(_0x4deb12) ||
                _0x4deb12 < 1 ||
                _0x4deb12 > 255 ||
                (Array.isArray(_0x25dff8) && _0x25dff8.length > 0)
              ) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_create_usage'));
                return;
              }
              if (State.groups.has(_0x4deb12)) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_group_number_used', { num: _0x4deb12 }));
                return;
              }
              const _0x4eea56 = State.createAdminGroup(_0xf15e50, _0x4deb12);
              if (!_0x4eea56) return;
              _0xf15e50.sendMessage(
                t(_0x247c45, 'admin_group_created', {
                  name: _0x4eea56.name,
                  num: _0x4eea56.number,
                }),
              );
              return;
            }
            if (_0x539f7d === 'list') {
              if (_0x48b8e4 !== undefined || (Array.isArray(_0x25dff8) && _0x25dff8.length > 0)) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_list_usage'));
                return;
              }
              const _0x19c9b3 = [...State.groups.values()].sort(
                (_0x560cc6, _0x55816a) => _0x560cc6.number - _0x55816a.number,
              );
              if (_0x19c9b3.length === 0) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_list_empty'));
                return;
              }
              for (const _0x1b0788 of _0x19c9b3) {
                _0xf15e50.sendMessage(
                  t(_0x247c45, 'admin_groups_list_title', {
                    name: _0x1b0788.name,
                    num: _0x1b0788.number,
                    count: _0x1b0788.members.size,
                    type: t(
                      _0x247c45,
                      _0x1b0788.adminManaged === true
                        ? 'admin_groups_list_secret'
                        : 'admin_groups_list_normal',
                    ),
                  }),
                );
              }
              return;
            }
            if (_0x539f7d === 'move') {
              const _0x81070d = Number(String(_0x48b8e4 ?? '').replace('#', ''));
              if (
                !Array.isArray(_0x25dff8) ||
                _0x25dff8.length === 0 ||
                !Number.isInteger(_0x81070d) ||
                _0x81070d < 1
              ) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_move_usage'));
                return;
              }
              const _0x3d3e90 = State.groups.get(_0x81070d);
              if (!_0x3d3e90) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_group_missing'));
                return;
              }
              let _0x38118a = 0;
              for (const _0x3bfe63 of _0x25dff8) {
                if (!(_0x3bfe63 instanceof Player) || !_0x3bfe63.isValid) continue;
                const _0x52264b = State._norm(_0x3bfe63.name),
                  _0x52f080 = State.playerGroup.get(_0x52264b);
                if (_0x52f080 === _0x81070d) continue;
                if (State.joinGroup(_0x3bfe63, _0x81070d, true))
                  _0x3bfe63.sendMessage(
                    t(State.langOf(_0x3bfe63), 'admin_player_added_notice', {
                      group: _0x3d3e90.name,
                      num: _0x3d3e90.number,
                    }),
                  );
                else continue;
                _0x38118a++;
              }
              _0xf15e50.sendMessage(
                t(_0x247c45, 'admin_groups_move_result', {
                  count: _0x38118a,
                  group: _0x3d3e90.name + ' (#' + _0x3d3e90.number + ')',
                }),
              );
              return;
            }
            if (_0x539f7d === 'leave') {
              const _0xc010c5 = Array.isArray(_0x25dff8)
                  ? _0x25dff8.filter(
                      (_0x33074e) => _0x33074e instanceof Player && _0x33074e.isValid,
                    )
                  : [],
                _0x37fc56 = String(_0x48b8e4 ?? '').trim();
              if (_0xc010c5.length === 0 && _0x37fc56) {
                const _0x33da6e = [...world.getPlayers()].filter((_0x5c0ce4) => _0x5c0ce4.isValid);
                if (_0x37fc56 === '@a') _0xc010c5.push(..._0x33da6e);
                else {
                  if (_0x37fc56 === '@s' || _0x37fc56 === '@p') _0xc010c5.push(_0xf15e50);
                  else {
                    if (_0x37fc56 === '@r' && _0x33da6e.length > 0)
                      _0xc010c5.push(_0x33da6e[Math.floor(Math.random() * _0x33da6e.length)]);
                    else {
                      const _0x108e08 = _0x33da6e.find(
                        (_0x20f1e3) => State._norm(_0x20f1e3.name) === State._norm(_0x37fc56),
                      );
                      if (_0x108e08) _0xc010c5.push(_0x108e08);
                    }
                  }
                }
              }
              let _0x262146 = 0;
              const _0x3a3853 = new Set();
              for (const _0x17c6a0 of _0xc010c5) {
                const _0x48335a = State._norm(_0x17c6a0.name);
                if (_0x3a3853.has(_0x48335a)) continue;
                _0x3a3853.add(_0x48335a);
                const _0x2a1677 = State.playerGroup.get(_0x48335a),
                  _0x24b11b = State.groups.get(_0x2a1677);
                if (!_0x24b11b || !State.removePlayerFromGroupByNorm(_0x24b11b.number, _0x48335a))
                  continue;
                (_0xf15e50.sendMessage(
                  t(_0x247c45, 'admin_player_removed', {
                    name: _0x17c6a0.name,
                    group: _0x24b11b.name,
                  }),
                ),
                  _0x17c6a0.sendMessage(
                    t(State.langOf(_0x17c6a0), 'admin_player_removed_notice', {
                      group: _0x24b11b.name,
                    }),
                  ),
                  _0x262146++);
              }
              if (_0x262146 === 0 && _0x37fc56 && !_0x37fc56.startsWith('@')) {
                const _0x41af0c = State._norm(_0x37fc56),
                  _0x92b25e = State.playerGroup.get(_0x41af0c),
                  _0x506b5c = State.groups.get(_0x92b25e);
                _0x506b5c &&
                  State.removePlayerFromGroupByNorm(_0x506b5c.number, _0x41af0c) &&
                  (_0xf15e50.sendMessage(
                    t(_0x247c45, 'admin_player_removed', {
                      name: _0x506b5c.memberNames?.[_0x41af0c] || _0x37fc56,
                      group: _0x506b5c.name,
                    }),
                  ),
                  _0x262146++);
              }
              if (_0x262146 === 0) _0xf15e50.sendMessage(t(_0x247c45, 'no_matching'));
              return;
            }
            if (_0x539f7d === 'delete') {
              const _0x20ccec = Number(String(_0x48b8e4 ?? '').replace('#', ''));
              if (
                !Number.isInteger(_0x20ccec) ||
                _0x20ccec < 1 ||
                (Array.isArray(_0x25dff8) && _0x25dff8.length > 0)
              ) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_command_usage'));
                return;
              }
              const _0x451f8d = State.groups.get(_0x20ccec);
              if (!_0x451f8d) {
                _0xf15e50.sendMessage(t(_0x247c45, 'admin_group_missing'));
                return;
              }
              State.deleteGroupByNumber(_0x20ccec) &&
                _0xf15e50.sendMessage(
                  t(_0x247c45, 'admin_group_deleted', {
                    name: _0x451f8d.name,
                    num: _0x451f8d.number,
                  }),
                );
              return;
            }
            _0xf15e50.sendMessage(t(_0x247c45, 'admin_groups_command_usage'));
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ),
    _0x2367e6.registerCommand(
      {
        name: 'vcmc:admin',
        description: 'Open the VCMC admin panel',
        permissionLevel: CommandPermissionLevel.GameDirectors,
      },
      (_0x57ac19) => {
        const _0x39b078 = _0x57ac19.sourceEntity;
        return (
          system.run(() => {
            if (_0x39b078 instanceof Player) UI.openAdmin(_0x39b078);
          }),
          { status: CustomCommandStatus.Success }
        );
      },
    ));
}),
  system.afterEvents.scriptEventReceive.subscribe(
    ({ id: _0xa092f2, sourceEntity: _0x47f172, message: _0x3cefb2 }) => {
      State.applyBridgeEvent(_0xa092f2, _0x47f172, _0x3cefb2);
    },
  ),
  system.run(() => {
    State.init();
  }));
