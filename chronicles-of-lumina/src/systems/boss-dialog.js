// systems/boss-dialog.js — boss intro/dialog/death lines, plus
// a small cinematics trigger system. Each boss has: id, name,
// zone, intro (text), taunts (random per phase), death text,
// defeatedBy text (when player kills it), quotes, stats.

const BOSSES = {
  // ── Story bosses (5) ──
  the_architect: {
    id: 'the_architect', name: 'Der Architekt', zone: 'void',
    title: 'Meister des Nichts',
    intro: 'Du wagst es, in meine Domäne zu treten? Ich erschuf diese Welten. Ich kann sie auch zerstören.',
    taunts: [
      'Du bist nur ein Splitter in meiner Vision.',
      'Der Nebel gehorcht mir, nicht dir.',
      'Ich habe Ewigkeiten gelenkt. Was ist schon ein Sterblicher?',
      'Knie nieder, oder ich zertrümmere deine Welt.',
    ],
    deathText: 'Nein... ich kann nicht... vergehen...',
    defeatedBy: 'Du hast den Architekten besiegt. Die Biome erstrahlen in neuem Licht.',
    stats: { hp: 50, damage: 8, range: 3, aggro: 18 },
  },
  mist_colossus: {
    id: 'mist_colossus', name: 'Nebel-Koloss', zone: 'verdant',
    title: 'Wächter des Schreins',
    intro: 'Der Schrein... ist MEIN. Niemand reinigt, was ich bewache.',
    taunts: ['Ich bin der Nebel selbst.', 'Deine Schritte verhallen in mir.'],
    deathText: 'Der Nebel... lichtet... sich...',
    defeatedBy: 'Der Koloss zerfällt. Die Lichtung erstrahlt.',
    stats: { hp: 40, damage: 6, range: 2, aggro: 14 },
  },
  frost_lord: {
    id: 'frost_lord', name: 'Frostfürst', zone: 'peaks',
    title: 'Herrscher der Kälte',
    intro: 'Eis ist unsterblich. Du wirst mein nächster Frost.',
    taunts: ['Spüre die Kälte des Todes.', 'Dein Atem wird gefrieren.'],
    deathText: 'Unmöglich... wie kann Feuer... Eis... schmelzen...',
    defeatedBy: 'Der Frostfürst zerbricht. Die Berge tausen auf.',
    stats: { hp: 25, damage: 5, range: 2, aggro: 13 },
  },
  mire_mother: {
    id: 'mire_mother', name: 'Sumpfmutter', zone: 'mire',
    title: 'Gebärerin des Morasts',
    intro: 'Meine Kinder werden dich verschlingen.',
    taunts: ['Der Sumpf ist mein Körper.', 'Du wirst eins mit mir.'],
    deathText: 'Meine Kinder... ohne mich...',
    defeatedBy: 'Die Sumpfmutter versinkt im Morast.',
    stats: { hp: 28, damage: 4, range: 2, aggro: 12 },
  },
  sand_king: {
    id: 'sand_king', name: 'Sandkönig', zone: 'dunes',
    title: 'Herrscher der Dünen',
    intro: 'Diese Wüste gehört mir. Jeder Sandkorn gehorcht meinem Wort.',
    taunts: ['Stirb, verdorrter Wurm.', 'Der Wind trägt dein Ende.'],
    deathText: 'Mein Reich... zerfällt...',
    defeatedBy: 'Der Sandkönig versinkt im Treibsand.',
    stats: { hp: 22, damage: 4, range: 2, aggro: 12 },
  },

  // ── Secret mini-bosses (10) ──
  ancient_treant: {
    id: 'ancient_treant', name: 'Uralter Baumgeist', zone: 'verdant',
    title: 'Hüter des Waldes',
    intro: 'Du störst die Ruhe des Waldes. Dafür wirst du bezahlen.',
    taunts: ['Meine Wurzeln reichen tief.', 'Der Wald vergisst nicht.'],
    deathText: 'Der Wald... schweigt...',
    defeatedBy: 'Der Baumgeist fällt. Die Blumen blühen wieder.',
    stats: { hp: 35, damage: 5, range: 2, aggro: 14 },
  },
  crystal_king: {
    id: 'crystal_king', name: 'Kristallkönig', zone: 'crystal',
    title: 'Herrscher der Kristallhöhlen',
    intro: 'Du betrittst mein Reich voller Schätze. Nimm sie — und stirb.',
    taunts: ['Meine Schätze sind mein Fluch.', 'Spiegle dich in meinem Glanz.'],
    deathText: 'Meine Kristalle... zerbrechen...',
    defeatedBy: 'Der Kristallkönig zerbirst. Die Höhle verstummt.',
    stats: { hp: 40, damage: 6, range: 2, aggro: 15 },
  },
  lava_forger: {
    id: 'lava_forger', name: 'Lavagolem Titan', zone: 'ember',
    title: 'Schmied der Glut',
    intro: 'Ich schmiede Welten aus Feuer. Du bist nur Schlacke.',
    taunts: ['Verbrenne.', 'Meine Esse lodert ewig.'],
    deathText: 'Asche... zu Asche...',
    defeatedBy: 'Der Titan erstarrt zu Stein.',
    stats: { hp: 45, damage: 7, range: 2, aggro: 16 },
  },
  sky_seraph: {
    id: 'sky_seraph', name: 'Himmelsseraph', zone: 'sky',
    title: 'Wächter der Lüfte',
    intro: 'Nur die Reinsten dürfen die Wolken berühren. Du bist unrein.',
    taunts: ['Wind trägt meine Stimme.', 'Du bist irdisch. Ich bin Licht.'],
    deathText: 'Licht... erlischt...',
    defeatedBy: 'Der Seraph sinkt hernieder.',
    stats: { hp: 38, damage: 6, range: 3, aggro: 14 },
  },
  kraken_lord: {
    id: 'kraken_lord', name: 'Kraken-Lord', zone: 'reef',
    title: 'Herrscher der Tiefe',
    intro: 'Die See gibt und nimmt. Heute nimmt sie nur.',
    taunts: ['Meine Tentakel sind überall.', 'Die Flut gehorcht mir.'],
    deathText: 'Die Tiefe... schweigt...',
    defeatedBy: 'Der Kraken sinkt in die Tiefe.',
    stats: { hp: 42, damage: 6, range: 2, aggro: 15 },
  },
  shadow_lord: {
    id: 'shadow_lord', name: 'Schatten-Lord', zone: 'haunted',
    title: 'Meister der Finsternis',
    intro: 'Licht wagt es, in meine Domäne zu kommen? Welch Ironie.',
    taunts: ['Ich bin, was du fürchtest.', 'Dein Schatten gehört mir.'],
    deathText: 'Licht... brennt...',
    defeatedBy: 'Der Schatten löst sich auf. Die Geister finden Ruhe.',
    stats: { hp: 36, damage: 5, range: 2, aggro: 13 },
  },
  shadow_self: {
    id: 'shadow_self', name: 'Dein Schatten-Selbst', zone: 'haunted',
    title: 'Spiegel der Seele',
    intro: 'Ich bin alles, was du bist. Und alles, was du verleugnest.',
    taunts: ['Erkenne dich selbst.', 'Du kannst nicht vor dir fliehen.'],
    deathText: 'Du... hast dich... besiegt...',
    defeatedBy: 'Du blickst in deinen Schatten — und lächelst.',
    stats: { hp: 32, damage: 5, range: 2, aggro: 13 },
  },
  void_treant: {
    id: 'void_treant', name: 'Leerentreant', zone: 'void',
    title: 'Baum der Leere',
    intro: 'Ich wachse im Nichts. Du wirst mein Dünger.',
    taunts: ['Wurzeln im Nichts.', 'Deine Seele nährt mich.'],
    deathText: 'Die Leere... war... genug...',
    defeatedBy: 'Der Leerentreant verwelkt.',
    stats: { hp: 40, damage: 6, range: 2, aggro: 14 },
  },
  crystal_warden: {
    id: 'crystal_warden', name: 'Kristallwächter', zone: 'crystal',
    title: 'Beschützer der Tiefen',
    intro: 'Keiner betritt mein Reich ungestraft.',
    taunts: ['Spüre meine Klingen.', 'Du bist zerbrechlich.'],
    deathText: 'Zerbrochen... wie... Glas...',
    defeatedBy: 'Der Wächter zerbirst.',
    stats: { hp: 30, damage: 4, range: 2, aggro: 12 },
  },
  temple_guardian: {
    id: 'temple_guardian', name: 'Tempelwächter', zone: 'sky',
    title: 'Hüter des Allerheiligsten',
    intro: 'Du hast den Tempel betreten. Jetzt gibt es kein Zurück.',
    taunts: ['Heiliger Boden.', 'Stirb in Frieden.'],
    deathText: 'Mein Tempel... fällt...',
    defeatedBy: 'Der Wächter sinkt in sich zusammen.',
    stats: { hp: 48, damage: 7, range: 2, aggro: 15 },
  },
};

export function getBossDialog(id) { return BOSSES[id] || null; }
export function listBossDialogs() { return Object.values(BOSSES); }
export function listBossesByZone(zoneId) {
  return Object.values(BOSSES).filter((b) => b.zone === zoneId);
}
export function totalBosses() { return Object.keys(BOSSES).length; }

/**
 * Pick a random taunt for a boss. Returns null if no taunts.
 */
export function getRandomTaunt(bossId, rng = Math.random) {
  const boss = BOSSES[bossId];
  if (!boss || !boss.taunts || !boss.taunts.length) return null;
  return boss.taunts[Math.floor(rng() * boss.taunts.length)];
}

/**
 * Get the right dialog for a boss-fight phase.
 * phase: 'intro' | 'taunt' | 'death' | 'victory'
 */
export function getBossPhaseText(bossId, phase) {
  const boss = BOSSES[bossId];
  if (!boss) return null;
  if (phase === 'intro') return boss.intro;
  if (phase === 'death') return boss.deathText;
  if (phase === 'victory') return boss.defeatedBy;
  if (phase === 'taunt') return getRandomTaunt(bossId);
  return null;
}

/**
 * Difficulty tier: easy/medium/hard/story
 * Determined by stats: hp + damage * 2.
 */
export function bossTier(bossId) {
  const boss = BOSSES[bossId];
  if (!boss || !boss.stats) return 'unknown';
  const score = boss.stats.hp + boss.stats.damage * 2;
  if (score < 30) return 'easy';
  if (score < 50) return 'medium';
  if (score < 65) return 'hard';
  return 'story';
}

/**
 * All bosses sorted by difficulty.
 */
export function bossesByDifficulty() {
  return listBossDialogs().sort((a, b) => {
    const sa = a.stats.hp + a.stats.damage * 2;
    const sb = b.stats.hp + b.stats.damage * 2;
    return sa - sb;
  });
}
