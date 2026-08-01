// constants.js — game-wide constants: event names, layers, input bindings.

export const EVENTS = Object.freeze({
  GAME_INIT: 'game:init',
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  GAME_WIN: 'game:win',
  RESIZE: 'engine:resize',

  PLAYER_SPAWN: 'player:spawn',
  PLAYER_DAMAGE: 'player:damage',
  PLAYER_HEAL: 'player:heal',
  PLAYER_DIED: 'player:died',
  PLAYER_ATTACK: 'player:attack',
  PLAYER_DODGE: 'player:dodge',
  PLAYER_MOVE: 'player:move',
  PLAYER_LEVEL_UP: 'player:levelup',

  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_DAMAGE: 'enemy:damage',
  ENEMY_DIED: 'enemy:died',
  ENEMY_HIT: 'enemy:hit',

  BOSS_SPAWN: 'boss:spawn',
  BOSS_DAMAGE: 'boss:damage',
  BOSS_DIED: 'boss:died',
  BOSS_ATTACK: 'boss:attack',

  PROJECTILE_SPAWN: 'projectile:spawn',
  PROJECTILE_HIT: 'projectile:hit',

  LOOT_SPAWN: 'loot:spawn',
  LOOT_PICKUP: 'loot:pickup',
  LOOT_PICKUP_CRYSTAL: 'loot:pickup:crystal',
  LOOT_PICKUP_BERRY: 'loot:pickup:berry',

  QUEST_UPDATE: 'quest:update',
  QUEST_COMPLETE: 'quest:complete',
  QUEST_OBJECTIVE: 'quest:objective',

  XP_GAIN: 'xp:gain',
  XP_LEVELUP: 'xp:levelup',

  INVENTORY_CHANGE: 'inventory:change',

  DIALOG_OPEN: 'dialog:open',
  DIALOG_CLOSE: 'dialog:close',
  DIALOG_NEXT: 'dialog:next',

  INTERACT_PROMPT: 'interact:prompt',
  INTERACT_TRIGGER: 'interact:trigger',

  SHRINE_CLEANSE: 'shrine:cleanse',
  SHRINE_CLEAN: 'shrine:clean',

  UI_SHOW: 'ui:show',
  UI_HIDE: 'ui:hide',
  UI_REFRESH: 'ui:refresh',

  // Phase 1+ feedback events
  HITSTOP: 'feedback:hitstop',
  SHAKE:   'feedback:shake',
  FLASH:   'feedback:flash',
  SLOWMO:  'feedback:slowmo',

  // Phase 5+ UX events
  TUTORIAL_STEP: 'tutorial:step',
  TUTORIAL_DISMISS: 'tutorial:dismiss',
  DIALOG_CHOICE: 'dialog:choice',

  // Phase 6+ codex events
  CODEX_UNLOCK: 'codex:unlock',
});

export const LAYERS = Object.freeze({
  DEFAULT: 0,
  GROUND: 1,
  PROPS: 2,
  ENTITIES: 3,
  FX: 4,
  UI: 5,
});

export const INPUT = Object.freeze({
  FORWARD: 'forward',
  BACK: 'back',
  LEFT: 'left',
  RIGHT: 'right',
  ATTACK: 'attack',
  DODGE: 'dodge',
  INTERACT: 'interact',
  PAUSE: 'pause',
  INVENTORY: 'inventory',
  CAMERA: 'camera',
  JOYSTICK: 'joystick',
});

export const ENEMY_STATE = Object.freeze({
  IDLE: 'idle',
  ROAM: 'roam',
  CHASE: 'chase',
  ATTACK: 'attack',
  HIT: 'hit',
  DEAD: 'dead',
});

export const QUEST_IDS = Object.freeze({
  INTRO: 'q_intro',
  CRYSTALS: 'q_crystals',
  BOSS: 'q_boss',
  SHRINE: 'q_shrine',
});

export const UI_PANELS = Object.freeze({
  START: 'start',
  HUD: 'hud',
  PAUSE: 'pause',
  INVENTORY: 'inventory',
  DIALOG: 'dialog',
  ENDScreen: 'endscreen',
});

export const BIOMES = Object.freeze({
  VILLAGE: 'village',
  FOREST: 'forest',
  SHRINE: 'shrine',
});
