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

import { HUD } from './ui/hud.js';
import { Menus } from './ui/menus.js';
import { DialogPanel } from './ui/dialog-panel.js';
import { QuestPanel } from './ui/quest-panel.js';
import { XpPanel } from './ui/xp-panel.js';
import { BossBar } from './ui/boss-bar.js';
import { InventoryPanel } from './ui/inventory-panel.js';
import { MobileControls } from './ui/mobile-controls.js';

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
const player = new Player(scene, materials);

const projectiles = new ProjectileSystem(scene);
const loot = new LootSystem(scene, materials);
const enemySystem = new EnemySystem(scene, materials, projectiles);
const bossSystem = new BossSystem(scene, materials, projectiles, particles);
const xpSystem = new XpSystem(bus, player);
const inventorySystem = new InventorySystem(bus, player);
const questSystem = new QuestSystem(bus, bossSystem);
const dialogueSystem = new DialogueSystem(bus);
const interactionSystem = new InteractionSystem({
  bus, player, shrine: world.shrine, elder, dialogueSystem, questSystem,
});
const combatSystem = new CombatSystem({ player, enemySystem, bossSystem, particleSystem: particles, audio: null });

// UI panels
new HUD(bus);
new Menus(bus, onStart, onRestart, onResume);
new DialogPanel(bus);
new QuestPanel(bus);
new XpPanel(bus);
new BossBar(bus);
new InventoryPanel(bus, inventorySystem);
new MobileControls();

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
  menus.hide('start');
  setPhase('playing');
  state.startTime = state.time;
  enemySystem.spawnInitial();
  bus.emit(EVENTS.UI_REFRESH);
  dialogueSystem.startIntro();
}

function onResume() {
  menus.hide('pause');
  setPhase('playing');
}

function onRestart() { location.reload(); }

function endGame(win) {
  setPhase('endscreen');
  state.endTime = state.time;
  menus.showEndscreen({
    win,
    time: state.endTime - state.startTime,
    kills: player.kills,
    crystals: state.crystals,
  });
}

// ── Resize ────────────────────────────────────────────────
function onResize() {
  renderer.resize();
  cameraRig.setAspect(window.innerWidth / window.innerHeight);
}
window.addEventListener('resize', onResize);

// ── Main loop ─────────────────────────────────────────────
let lastT = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT = t;

  if (state.phase === 'playing' || state.phase === 'paused') {
    state.time += (state.phase === 'playing') ? dt : 0;
  }
  if (state.phase !== 'playing') {
    renderer.render(scene, cameraRig.camera);
    return;
  }

  const dYaw = input.consumeCameraYaw();
  if (dYaw !== 0) cameraRig.yaw += dYaw;
  state.cameraYaw = cameraRig.yaw;

  if (input.consumeAttack())    combatSystem.tryAttack();
  if (input.consumeDodge())     player.startDodge();
  if (input.consumeInteract())  interactionSystem.interact();
  if (input.consumePause())     { menus.show('pause'); setPhase('paused'); }

  // Player death check
  if (player.hp <= 0) bus.emit(EVENTS.PLAYER_DIED);

  player.update(dt, t, input);
  enemySystem.update(dt, player);
  bossSystem.update(dt, player);
  projectiles.update(dt, player, () => player.takeDamage(1));
  loot.update(dt, player,
    () => bus.emit(EVENTS.LOOT_PICKUP_CRYSTAL),
    () => bus.emit(EVENTS.LOOT_PICKUP_BERRY)
  );
  particles.update(dt);
  combatSystem.update(dt);
  dialogueSystem.update();
  cameraRig.update(dt, player.position);
  minimap.draw(player, world.shrine, state.crystals, state.bossActive);

  // Interact hint
  const target = interactionSystem.nearestInteractable();
  const hint = document.getElementById('hint');
  if (hint) {
    if (target === 'shrine')      { hint.style.display = 'block'; hint.textContent = '[E] Schrein reinigen'; }
    else if (target === 'elder')  { hint.style.display = 'block'; hint.textContent = '[E] Mit der Dorfältesten sprechen'; }
    else                          { hint.style.display = 'none'; }
  }

  renderer.render(scene, cameraRig.camera);
}

requestAnimationFrame(loop);
