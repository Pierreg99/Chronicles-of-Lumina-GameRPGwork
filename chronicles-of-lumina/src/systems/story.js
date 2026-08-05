// systems/story.js — story chapters, cutscenes, scripted sequences.
// A chapter is a series of scenes. Each scene is a scripted event:
// dialog, camera move, fade, music change, etc. Player progression
// unlocks chapters.

export const CHAPTERS = {
  ch_intro: {
    id: 'ch_intro',
    name: 'Kapitel 1: Der Ruf',
    number: 1,
    summary: 'Du erwachst am Rande des Smaragdwalds. Thaddeus gibt dir deine erste Aufgabe.',
    unlockCondition: () => true, // always unlocked
    scenes: [
      { id: 'sc_intro_1', type: 'fade_in', duration: 1000 },
      { id: 'sc_intro_2', type: 'dialog', npc: 'elder_thaddeus', node: 'dt_thaddeus_root' },
      { id: 'sc_intro_3', type: 'quest_offer', quest: 'q_collect_crystals' },
    ],
  },
  ch_call: {
    id: 'ch_call',
    name: 'Kapitel 2: Der Ruf der Biome',
    number: 2,
    summary: 'Reise durch die Biome und sammle die verlorenen Kristalle.',
    unlockCondition: (state) => (state.crystals || 0) >= 3,
    scenes: [
      { id: 'sc_call_1', type: 'fade_in', duration: 800 },
      { id: 'sc_call_2', type: 'camera_move', target: 'first_zone' },
      { id: 'sc_call_3', type: 'music_change', track: 'verdant' },
    ],
  },
  ch_shrine: {
    id: 'ch_shrine',
    name: 'Kapitel 3: Der reine Schrein',
    number: 3,
    summary: 'Bringe die Kristalle zum Schrein und führe das Ritual durch.',
    unlockCondition: (state) => (state.crystals || 0) >= 10,
    scenes: [
      { id: 'sc_shrine_1', type: 'dialog', npc: 'elder_thaddeus', node: 'dt_thaddeus_quest' },
      { id: 'sc_shrine_2', type: 'ritual', target: 'shrine' },
      { id: 'sc_shrine_3', type: 'cinematic', text: 'Der Nebel lichtet sich...' },
    ],
  },
  ch_void: {
    id: 'ch_void',
    name: 'Kapitel 4: Der Leerenspalt',
    number: 4,
    summary: 'Der Architekt wartet im Herzen des Nichts.',
    unlockCondition: (state) => state.quests?.['q_purify_shrine']?.status === 'completed',
    scenes: [
      { id: 'sc_void_1', type: 'fade_out', duration: 1500 },
      { id: 'sc_void_2', type: 'teleport', zone: 'void' },
      { id: 'sc_void_3', type: 'boss_intro', boss: 'the_architect' },
    ],
  },
  ch_end: {
    id: 'ch_end',
    name: 'Kapitel 5: Ende und Anfang',
    number: 5,
    summary: 'Du hast den Architekten besiegt. Was wirst du als nächstes tun?',
    unlockCondition: (state) => state.defeatedBoss?.includes('the_architect'),
    scenes: [
      { id: 'sc_end_1', type: 'cinematic', text: 'Die Welt ist gerettet. Vorerst.' },
      { id: 'sc_end_2', type: 'credits' },
      { id: 'sc_end_3', type: 'new_game_plus_offer' },
    ],
  },
};

/** Cutscene types. Each is a scripted event with params. */
export const CUTSCENE_TYPES = {
  fade_in:      { name: 'Fade In',         params: ['duration'] },
  fade_out:     { name: 'Fade Out',        params: ['duration'] },
  dialog:       { name: 'Dialog',          params: ['npc', 'node'] },
  camera_move:  { name: 'Camera Move',     params: ['target'] },
  music_change: { name: 'Musik wechseln',  params: ['track'] },
  quest_offer:  { name: 'Quest anbieten',  params: ['quest'] },
  ritual:       { name: 'Ritual',          params: ['target'] },
  cinematic:    { name: 'Cinematic',       params: ['text'] },
  teleport:     { name: 'Teleport',        params: ['zone'] },
  boss_intro:   { name: 'Boss Intro',      params: ['boss'] },
  credits:      { name: 'Credits',         params: [] },
  new_game_plus_offer: { name: 'New Game+ anbieten', params: [] },
};

export function getChapter(id) { return CHAPTERS[id] || null; }
export function listChapters() { return Object.values(CHAPTERS); }
export function totalChapters() { return Object.keys(CHAPTERS).length; }

/** Get all unlocked chapters based on state. */
export function getUnlockedChapters(state) {
  return listChapters().filter((c) => {
    try { return c.unlockCondition(state); } catch (_) { return false; }
  });
}

/** Get the current chapter (latest unlocked). */
export function getCurrentChapter(state) {
  const unlocked = getUnlockedChapters(state);
  return unlocked.length ? unlocked[unlocked.length - 1] : null;
}

/** Check if a scene is valid (has required params for its type). */
export function validateScene(scene) {
  const type = CUTSCENE_TYPES[scene.type];
  if (!type) return { valid: false, reason: 'unknown_type' };
  for (const p of type.params) {
    if (scene[p] == null) return { valid: false, reason: `missing_${p}` };
  }
  return { valid: true };
}

/**
 * Compute a story progress percentage based on chapter completion.
 */
export function storyProgress(state) {
  const total = totalChapters();
  const unlocked = getUnlockedChapters(state).length;
  return total > 0 ? unlocked / total : 0;
}

/**
 * Cutscene player state. Just a state machine that advances
 * through scenes. The actual UI/animation is handled elsewhere.
 */
export class CutscenePlayer {
  constructor(chapter) {
    this.chapter = chapter;
    this.sceneIndex = 0;
    this.completed = false;
    this.scenes = chapter.scenes || [];
  }
  currentScene() { return this.scenes[this.sceneIndex] || null; }
  advance() {
    this.sceneIndex += 1;
    if (this.sceneIndex >= this.scenes.length) this.completed = true;
  }
  reset() { this.sceneIndex = 0; this.completed = false; }
  progress() {
    return this.scenes.length > 0 ? this.sceneIndex / this.scenes.length : 1;
  }
}
