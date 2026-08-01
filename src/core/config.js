// config.js — all balancing numbers in one place. No magic values elsewhere.

export const CONFIG = {
  // ── World ────────────────────────────────────────────────
  world: {
    size: 96,                 // square world extent (X / Z)
    tileSize: 2,              // ground tile size in world units
    villageCenter: { x: -22, z: 18 },
    forestCenter: { x: 18, z: -10 },
    shrinePos: { x: 30, z: -28 },
    wellPos: { x: -22, z: 18 },
  },

  // ── Player ───────────────────────────────────────────────
  player: {
    name: 'Aren',
    maxHp: 6,
    hp: 6,
    moveSpeed: 6.5,
    turnLerp: 12,
    attackDamage: 1,
    attackComboWindow: 0.45,   // seconds between hits to continue combo
    attackRange: 2.2,
    attackArc: Math.PI * 0.55,
    attackCooldown: 0.18,
    hitIFrames: 0.9,            // invuln after taking damage
    dodgeSpeed: 14,
    dodgeDuration: 0.35,
    dodgeCooldown: 0.6,
    respawnInvuln: 2.0,
    swordTipOffset: 1.05,
    bodyRadius: 0.55,
  },

  // ── Enemies ──────────────────────────────────────────────
  enemies: {
    slimeBlue: {
      id: 'slime_blue',
      name: 'Wiesen-Schleim',
      hp: 2,
      speed: 1.8,
      damage: 1,
      aggroRange: 7,
      attackRange: 1.2,
      attackCooldown: 1.4,
      xp: 10,
      bodyRadius: 0.6,
    },
    slimeGreen: {
      id: 'slime_green',
      name: 'Blatt-Schleim',
      hp: 3,
      speed: 2.6,
      damage: 1,
      aggroRange: 9,
      attackRange: 1.3,
      attackCooldown: 1.1,
      jumpInterval: 1.4,
      jumpHeight: 1.2,
      xp: 15,
      bodyRadius: 0.55,
    },
    slimePurple: {
      id: 'slime_purple',
      name: 'Nebel-Schleim',
      hp: 3,
      speed: 1.4,
      damage: 1,
      aggroRange: 10,
      attackRange: 7,
      projectileSpeed: 5.5,
      projectileDamage: 1,
      attackCooldown: 2.2,
      xp: 15,
      bodyRadius: 0.6,
    },
  },

  // ── Boss ─────────────────────────────────────────────────
  boss: {
    id: 'boss_nebelkoloss',
    name: 'Nebel-Koloss',
    hp: 25,
    speed: 1.6,
    damage: 2,
    bodyRadius: 1.6,
    projectileSpeed: 6,
    projectileCount: 3,
    projectileSpread: 0.45,
    projectileDamage: 1,
    slamRadius: 4.5,
    slamDamage: 2,
    slamCooldown: 4,
    projectileCooldown: 2.4,
    xp: 50,
  },

  // ── Loot ─────────────────────────────────────────────────
  loot: {
    crystal: { id: 'crystal', name: 'Lichtkristall', heal: 0, xp: 0, weight: 70 },
    berry:   { id: 'berry',   name: 'Heilbeere',     heal: 2, xp: 0, weight: 30 },
  },

  // ── Quest / XP ───────────────────────────────────────────
  quest: {
    crystalTarget: 10,
    elderIntro: [
      'Aren, ein dunkler Nebel verdirbt den Schrein im Smaragdwald.',
      'Bringe mir zehn Lichtkristalle — sie reinigen das Land.',
      'Ich spüre, dass etwas Schlimmes im Schrein erwacht. Sei vorsichtig.',
    ],
    bossWarning: [
      'Der Nebel verdichtet sich… der Koloss erwacht!',
      'Besiege ihn, bevor du den Schrein berühren kannst!',
    ],
    shrineClean: [
      'Du spürst, wie das Licht in den Schrein zurückströmt.',
      'Der Smaragdwald atmet wieder.',
    ],
    victory: [
      'Du hast den Schrein gereinigt, Aren.',
      'Die Lichtkristalle erstrahlen — die Welt ist heil.',
    ],
  },

  xp: {
    baseNext: 30,
    growth: 1.5,                 // next = baseNext * growth^(level-1)
    hpPerLevel: 1,
    damageEveryNLevels: 2,
    damagePerStep: 1,
  },

  // ── Camera ───────────────────────────────────────────────
  camera: {
    fov: 55,
    near: 0.1,
    far: 220,
    offset: { x: 0, y: 8, z: 11 },
    lookOffset: { x: 0, y: 1.4, z: -2 },
    minPolar: 0.2,
    maxPolar: 1.35,
    rotateSpeed: 0.0028,
    followLerp: 8,
  },

  // ── Audio ────────────────────────────────────────────────
  audio: {
    masterGain: 0.7,
    sfxGain: 0.7,
    musicGain: 0.35,
  },

  // ── Misc ─────────────────────────────────────────────────
  spawn: {
    maxEnemies: 14,
    respawnDelay: 1.2,
  },

  particle: {
    poolHit: 64,
    poolMagic: 48,
    poolAmbient: 32,
    poolLoot: 24,
  },

  // ── Feedback (Phase 1+) ───────────────────────────────────
  feedback: {
    hitstopSmall: 0.05,   // seconds; small enemy hit
    hitstopBig:   0.12,   // seconds; boss hit / slam
    hitstopBoss:  0.18,   // seconds; boss death
    shakeSmall:   { intensity: 0.15, duration: 0.18 },
    shakeMedium:  { intensity: 0.30, duration: 0.25 },
    shakeBig:     { intensity: 0.60, duration: 0.40 },
    flashDamage:  { color: '#ff5555', duration: 0.15 },
    slowmoSlam:   { factor: 0.35, duration: 0.30 },
  },

  // ── Phase 4: combo + adaptive music + damage direction ──
  combo: {
    maxSteps:     3,
    windowSec:    0.45,  // hits within this window chain the combo
    decayPerStep: 0.35,  // visual decay per missed window
  },

  damageDirection: {
    duration: 1.2,
    edgeMargin: 60,      // px from viewport edge
  },

  music: {
    ambientGain: 0.18,
    combatGain:  0.10,
    crossfadeSec: 0.6,
  },
};
