// main.js — entry point. Wires engine, world, entities, systems, UI into one
// requestAnimationFrame loop.

import * as THREE from 'three';

import { CONFIG } from './core/config.js';
import { EVENTS } from './core/constants.js';
import { EventBus } from './core/event-bus.js';
import { state, setPhase } from './core/state.js';

import { Renderer } from './engine/renderer.js';
import { createScene } from './engine/scene.js';
import { createCamera } from './engine/camera.js';
import { createLighting } from './engine/lighting.js';
import { MaterialFactory } from './engine/materials.js';
import { Input } from './engine/input.js';
import { playSfx } from './engine/audio.js';

import { buildWorld } from './world/world-builder.js';
import { ParticleSystem } from './world/particles.js';
import { Minimap } from './world/minimap.js';

import { Player } from './entities/player.js';
import { NpcElder } from './entities/npc-elder.js';
import { ProjectileSystem } from './entities/projectile.js';
import { LootSystem } from './entities/loot.js';

import { CombatSystem } from './systems/combat-system.js';
import { EnemySystem } from './systems/enemy-system.js';
import { BossSystem } from './systems/boss-system.js';
import { QuestSystem } from './systems/quest-system.js';
import { XpSystem } from './systems/xp-system.js';
import { InventorySystem } from './systems/inventory-system.js';
import { DialogueSystem } from './systems/dialogue-system.js';
import { InteractionSystem } from './systems/interaction-system.js';
import { UiSystem } from './systems/ui-system.js';
import { FeedbackSystem } from './systems/feedback-system.js';
import { HitStop } from './core/hitstop.js';

import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { DialogPanel } from './ui/dialog-panel.js';
import { QuestPanel } from './ui/quest-panel.js';
import { XpPanel } from './ui/xp-panel.js';
import { BossBar } from './ui/boss-bar.js';
import { InventoryPanel } from './ui/inventory-panel.js';
import { MobileControls } from './ui/mobile-controls.js';
import { InteractionHint } from './ui/interaction-hint.js';
import { ComboIndicator } from './ui/combo-indicator.js';
import { DamageDirection } from './ui/damage-direction.js';
import { Tutorial } from './ui/tutorial.js';
import { transition, SCREEN } from './core/screen-state.js';
import { playLayer, stopLayer, updateAudio } from './engine/audio.js';

// ── Bootstrap ──────────────────────────────────────────────
const canvas = document.getElementById('game');
const bus = new EventBus();
const renderer = new Renderer(canvas);
const scene = createScene();
const cameraRig = createCamera();
createLighting(scene);
const materials = new MaterialFactory(renderer.renderer);
const input = new Input(canvas);
const particles = new ParticleSystem(scene);
const minimap = new Minimap();

const world = buildWorld({ scene, materials });
const elder = new NpcElder(scene, materials, new THREE.Vector3(2, 0, 0));
const player = new Player(scene, materials, bus);

const projectiles = new ProjectileSystem(scene);
const loot = new LootSystem(scene, materials);
const enemySystem = new EnemySystem(scene, materials, projectiles);
const hitstop = new HitStop();
const feedback = new FeedbackSystem(bus, hitstop);
const bossSystem = new BossSystem(scene, materials, projectiles, particles, feedback);
const xpSystem = new XpSystem(bus, player);
const inventorySystem = new InventorySystem(bus, player);
const questSystem = new QuestSystem(bus, bossSystem);
const dialogueSystem = new DialogueSystem(bus);
const interactionSystem = new InteractionSystem({
  bus, player, shrine: world.shrine, elder, dialogueSystem, questSystem,
});
const combatSystem = new CombatSystem({ player, enemySystem, bossSystem, particleSystem: particles, audio: null, feedback, bus });

// UI panels
new HUD(bus, player);
new Menus(bus, { onStart, onRestart, onResume });
new DialogPanel(bus);
new QuestPanel(bus);
new XpPanel(bus);
new BossBar(bus);
new InventoryPanel(bus, inventorySystem);
new MobileControls();
new InteractionHint(bus, { player, interactionSystem });
new ComboIndicator(bus);
new DamageDirection(bus, { camera: cameraRig, player });
const tutorial = new Tutorial(bus);
tutorial.register('move',    (s) => s.time > 1 && s.time < 2, 'Bewege Aren mit WASD oder den Pfeiltasten.');
tutorial.register('attack',  (s) => s.time > 6 && s.time < 7, 'Drücke Leertaste oder klicke, um anzugreifen.');
tutorial.register('dodge',   (s) => s.time > 12 && s.time < 13, 'Shift = Ausweichrolle. Kurz unverwundbar!');
tutorial.register('interact',(s) => s.time > 18 && s.time < 19, 'Drücke E, um mit Personen und dem Schrein zu sprechen.');

// Phase 5: dialog choice wiring
bus.on(EVENTS.DIALOG_CHOICE_REQUEST, ({ id }) => dialogueSystem.pickChoice(id));

// Phase 5: inventory toggle on 'I' (drives SCREEN)
bus.on('inventory:toggle', () => {
  if (state.screen === SCREEN.INVENTORY) transition(SCREEN.PLAYING);
  else transition(SCREEN.INVENTORY);
});

// Adaptive music: ambient always, combat when enemies near
playLayer('ambient');

// ── Global event wiring ───────────────────────────────────
bus.on(EVENTS.PLAYER_DAMAGE, () => bus.emit(EVENTS.UI_REFRESH));
bus.on(EVENTS.PLAYER_HEAL,   () => bus.emit(EVENTS.UI_REFRESH));

bus.on(EVENTS.PLAYER_DIED, () => {
  player.respawn(world.village.respawn);
  dialogueSystem.say('System', 'Du wurdest am Brunnen wiederbelebt.');
  bus.emit(EVENTS.UI_REFRESH);
});

bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => {
  questSystem.addCrystal();
  inventorySystem.add('crystal');
  bus.emit(EVENTS.UI_REFRESH);
  playSfx('pickup');
  particles.burst(player.position, '#5ad1ff', 8);
});
bus.on(EVENTS.LOOT_PICKUP_BERRY, () => {
  inventorySystem.add('berry');
  playSfx('pickup');
  particles.burst(player.position, '#d94f4f', 8);
});

bus.on(EVENTS.ENEMY_DIED, (e) => {
  const spec = e.spec;
  state.killed[spec.id] = (state.killed[spec.id] || 0) + 1;
  player.kills = (player.kills || 0) + 1;
  xpSystem.gain(spec.hp * 5);
  particles.burst(e.position, '#' + spec.col.toString(16).padStart(6, '0'), 18);
  loot.drop(e.position);
});

bus.on(EVENTS.BOSS_DAMAGE, (hp) => {
  // Already updated by BossBar; we just relay for any other listeners.
});
bus.on(EVENTS.BOSS_DIED, () => {
  state.bossDefeated = true;
  for (let i = 0; i < 4; i++) {
    const p = bossSystem.boss.position;
    loot.drop(new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, 0, p.z + (Math.random() - 0.5) * 3));
  }
  xpSystem.gain(50);
  dialogueSystem.bossDefeated();
});

bus.on(EVENTS.SHRINE_CLEANSE, () => {
  state.shrineClean = true;
  const orb = world.shrine.orb;
  orb.material.color.set(0x5ad1ff);
  orb.material.emissive = new THREE.Color(0x2f7bff);
  particles.burst(world.shrine.position.clone().add(new THREE.Vector3(0, 4, 0)), '#5ad1ff', 40);
  scene.fog.color.set(0x9fd8f0);
  scene.background.set(0x9fd8f0);
  playSfx('shrine');
  dialogueSystem.victory();
  setTimeout(() => endGame(true), 1500);
});

bus.on(EVENTS.BOSS_SPAWN, () => dialogueSystem.bossWarning());

// EnemySystem: emit ENEMY_DIED on kill
const _origKill = enemySystem.kill.bind(enemySystem);
enemySystem.kill = (e) => {
  _origKill(e);
  bus.emit(EVENTS.ENEMY_DIED, e);
};

// BossSystem: emit BOSS_DAMAGE / BOSS_DIED
const _origBossDamage = bossSystem.damage.bind(bossSystem);
bossSystem.damage = (n) => {
  const dead = _origBossDamage(n);
  if (dead) {
    bus.emit(EVENTS.BOSS_DIED);
  } else {
    bus.emit(EVENTS.BOSS_DAMAGE, { hp: bossSystem.boss.hp, maxHp: bossSystem.boss.maxHp });
  }
  return dead;
};

// ── Menu actions ──────────────────────────────────────────
function onStart() {
  transition(SCREEN.PLAYING);
  state.startTime = state.time;
  enemySystem.spawnInitial();
  bus.emit(EVENTS.UI_REFRESH);
  dialogueSystem.startIntro();
}

function onResume() {
  transition(SCREEN.PLAYING);
}

function onRestart() { location.reload(); }

function endGame(win) {
  state.endTime = state.time;
  menus.showEndscreen({
    win,
    time: state.endTime - state.startTime,
    kills: player.kills,
    crystals: state.crystals,
  });
  transition(SCREEN.ENDScreen);
}

// ── Resize ────────────────────────────────────────────────
function onResize() {
  renderer.resize();
  cameraRig.setAspect(window.innerWidth / window.innerHeight);
}
window.addEventListener('resize', onResize);

// ── Feedback wiring (Phase 1) ─────────────────────────────
const _activeShakes = [];   // { intensity, remaining, total }
const _cameraBasePos = new THREE.Vector3();
bus.on(EVENTS.SHAKE, ({ intensity, duration }) => {
  _activeShakes.push({ intensity, remaining: duration, total: duration });
});
bus.on(EVENTS.CAMERA_KICK, ({ direction, intensity, duration }) => {
  cameraRig.kickToward(direction, intensity, duration);
});
bus.on(EVENTS.FLASH, ({ color, duration }) => {
  // Minimal full-screen flash via CSS overlay; created lazily in index.html
  const f = document.getElementById('flash-overlay');
  if (f) {
    f.style.background = color;
    f.style.opacity = '0.5';
    setTimeout(() => { f.style.opacity = '0'; }, Math.max(50, duration * 1000));
  }
});

function applyShake() {
  // Reduce/clear all active shakes, sum residual offsets.
  _cameraBasePos.copy(cameraRig.camera.position);
  let offX = 0, offY = 0, offZ = 0;
  for (let i = _activeShakes.length - 1; i >= 0; i--) {
    const s = _activeShakes[i];
    s.remaining -= 1 / 60; // approx frame-time
    const decay = s.remaining / s.total;
    const k = s.intensity * decay;
    offX += (Math.random() - 0.5) * k;
    offY += (Math.random() - 0.5) * k;
    offZ += (Math.random() - 0.5) * k;
    if (s.remaining <= 0) _activeShakes.splice(i, 1);
  }
  cameraRig.camera.position.x += offX;
  cameraRig.camera.position.y += offY;
  cameraRig.camera.position.z += offZ;
}

// ── Main loop ─────────────────────────────────────────────
let lastT = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const rawDt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;

  // Time scale (Phase 1+ slowmo)
  const dt = rawDt * feedback.timeScale;

  if (state.screen === 'playing' || state.screen === 'paused') {
    state.time += (state.screen === 'playing') ? rawDt : 0;
  }
  if (state.screen !== 'playing') {
    renderer.render(scene, cameraRig.camera);
    return;
  }

  // Camera yaw input
  const dYaw = input.consumeCameraYaw();
  if (dYaw !== 0) cameraRig.yaw += dYaw;
  state.cameraYaw = cameraRig.yaw;

  // Hit-stop: skip game-logic updates but keep rendering.
  hitstop.update(rawDt);
  const skipUpdate = hitstop.active;

  if (!skipUpdate) {
    if (input.consumeAttack())    combatSystem.tryAttack();
    if (input.consumeDodge())     player.startDodge();
    if (input.consumeInteract())  interactionSystem.interact();
    if (input.consumePause())     { transition(SCREEN.PAUSED); }
    if (input.consumeInventory()) { bus.emit('inventory:toggle'); }

    // Player death check
    if (player.hp <= 0) bus.emit(EVENTS.PLAYER_DIED);

    player.update(dt, t, input);
    enemySystem.update(dt, player);
    bossSystem.update(dt, player);
    projectiles.update(dt, player, (shotPos) => player.takeDamage(1, shotPos));
    loot.update(dt, player,
      () => bus.emit(EVENTS.LOOT_PICKUP_CRYSTAL),
      () => bus.emit(EVENTS.LOOT_PICKUP_BERRY)
    );
    particles.update(dt);
    combatSystem.update(dt);
    dialogueSystem.update();
    feedback.update(rawDt);
    updateAudio(rawDt);

    // Adaptive music: combat layer fades in when an enemy is within 10 units.
    let enemiesNear = false;
    for (const e of enemySystem.enemies) {
      if (e.dead) continue;
      if (e.position.distanceTo(player.position) < 10) { enemiesNear = true; break; }
    }
    if (bossSystem.boss && bossSystem.boss.active && !bossSystem.boss.dead) enemiesNear = true;
    if (enemiesNear) playLayer('combat'); else stopLayer('combat');
  }

  cameraRig.update(dt, player.position, player.velocity);
  applyShake();
  minimap.draw(player, world.shrine, state.crystals, state.bossActive);
  bus.emit('tick'); // UI hooks (e.g., interaction-hint) read state every frame

  renderer.render(scene, cameraRig.camera);
}

requestAnimationFrame(loop);
