// main.js — entry point. Builds the `game` object and starts the loop.
// Phase R1: systems take `game` as their only constructor argument.

import * as THREE from 'three';

import { CONFIG }     from './core/config.js';
import { EVENTS }     from './core/constants.js';
import { EventBus }   from './core/event-bus.js';
import { state }      from './core/state.js';
import { HitStop }    from './core/hitstop.js';
import { transition, SCREEN } from './core/screen-state.js';
import { settings }   from './core/settings.js';
import { dailySeed, dailyIndex } from './utils/random.js';

import { Renderer }         from './engine/renderer.js';
import { createScene }      from './engine/scene.js';
import { createCamera }     from './engine/camera.js';
import { createLighting }   from './engine/lighting.js';
import { MaterialFactory }  from './engine/materials.js';
import { Input }            from './engine/input.js';
import { playSfx, playLayer, stopLayer, updateAudio } from './engine/audio.js';

import { buildWorld }     from './world/world-builder.js';
import { ParticleSystem } from './world/particles.js';
import { Minimap }        from './world/minimap.js';

import { Player }            from './entities/player.js';
import { NpcElder }          from './entities/npc-elder.js';
import { ProjectileSystem }  from './entities/projectile.js';
import { LootSystem }        from './entities/loot.js';

import { CombatSystem }      from './systems/combat-system.js';
import { EnemySystem }       from './systems/enemy-system.js';
import { BossSystem }        from './systems/boss-system.js';
import { QuestSystem }       from './systems/quest-system.js';
import { XpSystem }          from './systems/xp-system.js';
import { InventorySystem }   from './systems/inventory-system.js';
import { DialogueSystem }    from './systems/dialogue-system.js';
import { InteractionSystem } from './systems/interaction-system.js';
import { FeedbackSystem }    from './systems/feedback-system.js';
import { CodexSystem }       from './systems/codex-system.js';
import { SpawnSystem }       from './systems/spawn-system.js';

import { HUD }              from './ui/hud.js';
import { Menus }            from './ui/menus.js';
import { DialogPanel }      from './ui/dialog-panel.js';
import { QuestPanel }       from './ui/quest-panel.js';
import { XpPanel }          from './ui/xp-panel.js';
import { BossBar }          from './ui/boss-bar.js';
import { InventoryPanel }   from './ui/inventory-panel.js';
import { MobileControls }   from './ui/mobile-controls.js';
import { InteractionHint }  from './ui/interaction-hint.js';
import { ComboIndicator }   from './ui/combo-indicator.js';
import { DamageDirection }  from './ui/damage-direction.js';
import { Tutorial }         from './ui/tutorial.js';
import { CodexPanel }       from './ui/codex-panel.js';
import { SettingsPanel }    from './ui/settings-panel.js';

// ── Build the game object ──────────────────────────────────
const canvas = document.getElementById('game');

const game = {
  canvas,
  bus: new EventBus(),
  hitstop: new HitStop(),
  feedback: null, // assigned below after hitstop

  // Engine
  renderer: new Renderer(canvas),
  scene: createScene(),
  cameraRig: createCamera(),
  materials: null, // assigned below
  input: new Input(canvas),
  minimap: new Minimap(),

  // World + entities
  world: null, elder: null, player: null,
  projectiles: null, loot: null,
  particles: null,

  // Systems (assigned in dependency order)
  enemySystem: null, bossSystem: null, combatSystem: null,
  spawnSystem: null, codex: null,
  questSystem: null, xpSystem: null, inventorySystem: null,
  dialogueSystem: null, interactionSystem: null,
  hitstopSystem: null, // alias for feedback
};

game.materials = new MaterialFactory(game.renderer.renderer);
createLighting(game.scene);
game.particles = new ParticleSystem(game.scene);
game.world = buildWorld({ scene: game.scene, materials: game.materials });
game.elder = new NpcElder(game.scene, game.materials, new THREE.Vector3(2, 0, 0));
game.player = new Player(game.scene, game.materials, game.bus);
game.projectiles = new ProjectileSystem(game.scene);
game.loot = new LootSystem(game.scene, game.materials);

game.feedback = new FeedbackSystem(game);
game.enemySystem = new EnemySystem(game);
game.spawnSystem = new SpawnSystem(game);
game.enemySystem.attachSpawnSystem(game.spawnSystem);
game.bossSystem = new BossSystem(game);
game.combatSystem = new CombatSystem(game);
game.questSystem = new QuestSystem(game);
game.xpSystem = new XpSystem(game);
game.inventorySystem = new InventorySystem(game);
game.dialogueSystem = new DialogueSystem(game);
game.interactionSystem = new InteractionSystem(game);
game.codex = new CodexSystem(game);

// Daily seed
const urlSeed = new URLSearchParams(location.search).get('seed');
state.dailySeed  = urlSeed ? (Number(urlSeed) >>> 0) : dailySeed();
state.dailyIndex = dailyIndex();

// UI panels
new HUD(game.bus, game.player);
new Menus(game.bus, {
  onStart: handleStart,
  onRestart: () => location.reload(),
  onResume: () => transition(SCREEN.PLAYING),
  onOpenSettings: () => transition(SCREEN.PAUSED),
});
new DialogPanel(game.bus);
new QuestPanel(game.bus);
new XpPanel(game.bus);
new BossBar(game.bus);
new InventoryPanel(game.bus, game.inventorySystem);
new MobileControls();
new InteractionHint(game.bus, { player: game.player, interactionSystem: game.interactionSystem });
new ComboIndicator(game.bus);
new DamageDirection(game.bus, { camera: game.cameraRig, player: game.player });
new CodexPanel(game.bus, game.codex);
new SettingsPanel();
const tutorial = new Tutorial(game.bus);
tutorial.register('move',     (s) => s.time > 1  && s.time < 2,  'Bewege Aren mit WASD oder den Pfeiltasten.');
tutorial.register('attack',   (s) => s.time > 6  && s.time < 7,  'Drücke Leertaste oder klicke, um anzugreifen.');
tutorial.register('dodge',    (s) => s.time > 12 && s.time < 13, 'Shift = Ausweichrolle. Kurz unverwundbar!');
tutorial.register('interact', (s) => s.time > 18 && s.time < 19, 'Drücke E, um mit Personen und dem Schrein zu sprechen.');

game.bus.on(EVENTS.DIALOG_CHOICE_REQUEST, ({ id }) => game.dialogueSystem.pickChoice(id));
game.bus.on('inventory:toggle', () => {
  if (state.screen === SCREEN.INVENTORY) transition(SCREEN.PLAYING);
  else transition(SCREEN.INVENTORY);
});
game.bus.on('codex:toggle', () => game.bus.emit('inventory:toggle'));
game.bus.on('tick', () => {
  if (state.screen !== 'playing') return;
  const target = game.interactionSystem.nearestInteractable();
  if (target === 'shrine') game.bus.emit('shrine:visit');
  if (target === 'elder')  game.bus.emit('village:visit');
});

playLayer('ambient');

// ── Global event wiring ────────────────────────────────────
game.bus.on(EVENTS.PLAYER_DAMAGE, () => game.bus.emit(EVENTS.UI_REFRESH));
game.bus.on(EVENTS.PLAYER_HEAL,   () => game.bus.emit(EVENTS.UI_REFRESH));
game.bus.on(EVENTS.PLAYER_DIED, () => {
  game.player.respawn(game.world.village.respawn);
  game.dialogueSystem.say('System', 'Du wurdest am Brunnen wiederbelebt.');
  game.bus.emit(EVENTS.UI_REFRESH);
});

game.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => {
  game.questSystem.addCrystal();
  game.inventorySystem.add('crystal');
  game.bus.emit(EVENTS.UI_REFRESH);
  playSfx('pickup');
  game.particles.burst(game.player.position, '#5ad1ff', 8);
});
game.bus.on(EVENTS.LOOT_PICKUP_BERRY, () => {
  game.inventorySystem.add('berry');
  playSfx('pickup');
  game.particles.burst(game.player.position, '#d94f4f', 8);
});

game.bus.on(EVENTS.ENEMY_DIED, (e) => {
  const spec = e.spec;
  state.killed[spec.id] = (state.killed[spec.id] || 0) + 1;
  game.player.kills = (game.player.kills || 0) + 1;
  game.xpSystem.gain(spec.hp * 5);
  game.particles.burst(e.position, '#' + spec.col.toString(16).padStart(6, '0'), 18);
  game.loot.drop(e.position);
});

game.bus.on(EVENTS.BOSS_DIED, () => {
  state.bossDefeated = true;
  for (let i = 0; i < 4; i++) {
    const p = game.bossSystem.boss.position;
    game.loot.drop(new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, 0, p.z + (Math.random() - 0.5) * 3));
  }
  game.xpSystem.gain(50);
  game.dialogueSystem.bossDefeated();
});

game.bus.on(EVENTS.SHRINE_CLEANSE, () => {
  state.shrineClean = true;
  const orb = game.world.shrine.orb;
  orb.material.color.set(0x5ad1ff);
  orb.material.emissive = new THREE.Color(0x2f7bff);
  game.particles.burst(game.world.shrine.position.clone().add(new THREE.Vector3(0, 4, 0)), '#5ad1ff', 40);
  game.scene.fog.color.set(0x9fd8f0);
  game.scene.background.set(0x9fd8f0);
  playSfx('shrine');
  game.dialogueSystem.victory();
  setTimeout(() => endGame(true), 1500);
});

game.bus.on(EVENTS.BOSS_SPAWN, () => game.dialogueSystem.bossWarning());

// ── Menu actions ───────────────────────────────────────────
function handleStart() {
  transition(SCREEN.PLAYING);
  state.startTime = state.time;
  game.enemySystem.spawnInitial();
  game.bus.emit(EVENTS.UI_REFRESH);
  game.dialogueSystem.startIntro();
}

function endGame(win) {
  state.endTime = state.time;
  const time = state.endTime - state.startTime;
  const score = Math.max(0, Math.round(
    state.crystals * 100
    + game.player.kills * 25
    + (win ? 500 : 0)
    - (state.damageTaken * 5)
    - Math.floor(time * 0.5)
  ));
  state.score = score;
  document.getElementById('end-time').textContent     = Math.round(time) + 's';
  document.getElementById('end-kills').textContent    = game.player.kills;
  document.getElementById('end-crystals').textContent = state.crystals;
  const seedEl = document.getElementById('end-seed');
  if (seedEl) seedEl.textContent = state.dailySeed ?? '—';
  const scoreEl = document.getElementById('end-score');
  if (scoreEl) scoreEl.textContent = score;
  const endScreen = document.getElementById('end-screen');
  if (endScreen) {
    endScreen.style.display = 'flex';
    const h1 = endScreen.querySelector('h1');
    if (h1) h1.innerHTML = win ? 'Demo <span>abgeschlossen</span>' : 'Demo <span>beendet</span>';
  }
  transition(SCREEN.ENDScreen);
}

function renderStartInfo() {
  const idx = document.getElementById('daily-index');
  const seed = document.getElementById('daily-seed');
  if (idx) idx.textContent = state.dailyIndex;
  if (seed) seed.textContent = state.dailySeed;
}
renderStartInfo();

// ── Resize ─────────────────────────────────────────────────
function onResize() {
  game.renderer.resize();
  game.cameraRig.setAspect(window.innerWidth / window.innerHeight);
}
window.addEventListener('resize', onResize);

// ── Feedback wiring (Phase 1) ──────────────────────────────
const _activeShakes = [];
game.bus.on(EVENTS.SHAKE, ({ intensity, duration }) => {
  _activeShakes.push({ intensity, remaining: duration, total: duration });
});
game.bus.on(EVENTS.CAMERA_KICK, ({ direction, intensity, duration }) => {
  game.cameraRig.kickToward(direction, intensity, duration);
});
game.bus.on(EVENTS.FLASH, ({ color, duration }) => {
  const f = document.getElementById('flash-overlay');
  if (f) {
    f.style.background = color;
    f.style.opacity = '0.5';
    setTimeout(() => { f.style.opacity = '0'; }, Math.max(50, duration * 1000));
  }
});

function applyShake() {
  let offX = 0, offY = 0, offZ = 0;
  for (let i = _activeShakes.length - 1; i >= 0; i--) {
    const s = _activeShakes[i];
    s.remaining -= 1 / 60;
    const decay = s.remaining / s.total;
    const k = s.intensity * decay;
    offX += (Math.random() - 0.5) * k;
    offY += (Math.random() - 0.5) * k;
    offZ += (Math.random() - 0.5) * k;
    if (s.remaining <= 0) _activeShakes.splice(i, 1);
  }
  game.cameraRig.camera.position.x += offX;
  game.cameraRig.camera.position.y += offY;
  game.cameraRig.camera.position.z += offZ;
}

// ── Main loop ──────────────────────────────────────────────
let lastT = 0;
let fpsAccum = 0, fpsFrames = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const rawDt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;

  fpsAccum += rawDt; fpsFrames++;
  if (fpsAccum >= 0.5) {
    const fps = Math.round(fpsFrames / fpsAccum);
    fpsAccum = 0; fpsFrames = 0;
    if (settings.get('showFPS')) document.documentElement.dataset.fps = String(fps);
    else delete document.documentElement.dataset.fps;
  }

  const dt = rawDt * game.feedback.timeScale;
  if (state.screen === 'playing' || state.screen === 'paused') {
    state.time += (state.screen === 'playing') ? rawDt : 0;
  }
  if (state.screen !== 'playing') {
    game.renderer.render(game.scene, game.cameraRig.camera);
    return;
  }

  const dYaw = game.input.consumeCameraYaw();
  if (dYaw !== 0) game.cameraRig.yaw += dYaw;
  state.cameraYaw = game.cameraRig.yaw;

  game.hitstop.update(rawDt);
  if (!game.hitstop.active) {
    if (game.input.consumeAttack())    game.combatSystem.tryAttack();
    if (game.input.consumeDodge())     game.player.startDodge();
    if (game.input.consumeInteract())  game.interactionSystem.interact();
    if (game.input.consumePause())     { transition(SCREEN.PAUSED); }
    if (game.input.consumeInventory()) { game.bus.emit('inventory:toggle'); }
    if (game.input.consumeCodex())     { game.bus.emit('codex:toggle'); }

    if (game.player.hp <= 0) game.bus.emit(EVENTS.PLAYER_DIED);

    game.player.update(dt, t, game.input);
    game.enemySystem.update(dt, game.player);
    game.bossSystem.update(dt, game.player);
    game.projectiles.update(dt, game.player, (shotPos) => game.player.takeDamage(1, shotPos));
    game.loot.update(dt, game.player,
      () => game.bus.emit(EVENTS.LOOT_PICKUP_CRYSTAL),
      () => game.bus.emit(EVENTS.LOOT_PICKUP_BERRY)
    );
    game.particles.update(dt);
    game.combatSystem.update(dt);
    game.dialogueSystem.update();
    game.feedback.update(rawDt);
    updateAudio(rawDt);

    let enemiesNear = false;
    for (const e of game.enemySystem.enemies) {
      if (e.dead) continue;
      if (e.position.distanceTo(game.player.position) < 10) { enemiesNear = true; break; }
    }
    if (game.bossSystem.boss && game.bossSystem.boss.active && !game.bossSystem.boss.dead) enemiesNear = true;
    if (enemiesNear) playLayer('combat'); else stopLayer('combat');
  }

  game.cameraRig.update(dt, game.player.position, game.player.velocity);
  applyShake();
  game.minimap.draw(game.player, game.world.shrine, state.crystals, state.bossActive);
  game.bus.emit('tick');

  game.renderer.render(game.scene, game.cameraRig.camera);
}

requestAnimationFrame(loop);
