// game.js — top-level orchestrator. Wires engine, world, entities, systems, UI.
// Phase R6: replaces the 350-line main.js with a structured Game class.

import * as THREE from 'three';

import { CONFIG }  from './config.js';
import { EVENTS }  from './constants.js';
import { EventBus } from './event-bus.js';
import { state }   from './state.js';
import { Loop }    from './loop.js';
import { HitStop } from './hitstop.js';
import { transition, SCREEN } from './screen-state.js';
import { settings } from './settings.js';
import { dailySeed, dailyIndex } from '../utils/random.js';

import { Renderer }        from '../engine/renderer.js';
import { createScene }     from '../engine/scene.js';
import { createCamera }    from '../engine/camera.js';
import { createLighting }  from '../engine/lighting.js';
import { MaterialFactory } from '../engine/materials.js';
import { Input }           from '../engine/input.js';
import { playSfx, playLayer, stopLayer, updateAudio } from '../engine/audio.js';

import { buildWorld }     from '../world/world-builder.js';
import { ZONES, getZone, decodeMapCode } from '../world/zones/index.js';
import { ParticleSystem } from '../world/particles.js';
import { Minimap }        from '../world/minimap.js';

import { Player }           from '../entities/player.js';
import { NpcElder }         from '../entities/npc-elder.js';
import { ProjectileSystem } from '../entities/projectile.js';
import { LootSystem }       from '../entities/loot.js';

import { CombatSystem }      from '../systems/combat-system.js';
import { EnemySystem }       from '../systems/enemy-system.js';
import { BossSystem }        from '../systems/boss-system.js';
import { QuestSystem }       from '../systems/quest-system.js';
import { XpSystem }          from '../systems/xp-system.js';
import { InventorySystem }   from '../systems/inventory-system.js';
import { DialogueSystem }    from '../systems/dialogue-system.js';
import { InteractionSystem } from '../systems/interaction-system.js';
import { FeedbackSystem }    from '../systems/feedback-system.js';
import { CodexSystem }       from '../systems/codex-system.js';
import { SpawnSystem }       from '../systems/spawn-system.js';

import { HUD }             from '../ui/hud.js';
import { Menus }           from '../ui/menus.js';
import { DialogPanel }     from '../ui/dialog-panel.js';
import { QuestPanel }      from '../ui/quest-panel.js';
import { XpPanel }         from '../ui/xp-panel.js';
import { BossBar }         from '../ui/boss-bar.js';
import { InventoryPanel }  from '../ui/inventory-panel.js';
import { MobileControls }  from '../ui/mobile-controls.js';
import { InteractionHint } from '../ui/interaction-hint.js';
import { ComboIndicator }  from '../ui/combo-indicator.js';
import { DamageDirection } from '../ui/damage-direction.js';
import { Tutorial }        from '../ui/tutorial.js';
import { CodexPanel }      from '../ui/codex-panel.js';
import { SettingsPanel }   from '../ui/settings-panel.js';
import { ZonePicker }      from '../ui/zone-picker.js';
import { createPerfOverlay, wantsPerfOverlay } from '../ui/perf-overlay.js';
import { applyEraPostProcess, currentEra, ERAS, advanceEra } from './era.js';
import { EraPortal } from '../entities/era-portal.js';
import { EraIndicator } from '../ui/era-indicator.js';
import { tickEraInteraction } from '../utils/era-interaction.js';

/**
 * @typedef {import('../systems/feedback-system.js').FeedbackSystem} TFeedbackSystem
 * @typedef {import('../systems/enemy-system.js').EnemySystem} TEnemySystem
 * @typedef {import('../systems/boss-system.js').BossSystem} TBossSystem
 * @typedef {import('../systems/combat-system.js').CombatSystem} TCombatSystem
 * @typedef {import('../systems/quest-system.js').QuestSystem} TQuestSystem
 * @typedef {import('../systems/xp-system.js').XpSystem} TXpSystem
 * @typedef {import('../systems/inventory-system.js').InventorySystem} TInventorySystem
 * @typedef {import('../systems/dialogue-system.js').DialogueSystem} TDialogueSystem
 * @typedef {import('../systems/interaction-system.js').InteractionSystem} TInteractionSystem
 * @typedef {import('../systems/spawn-system.js').SpawnSystem} TSpawnSystem
 * @typedef {import('../systems/codex-system.js').CodexSystem} TCodexSystem
 * @typedef {import('../core/settings.js').Settings} TSettings
 * @typedef {import('../engine/materials.js').MaterialFactory} TMaterialFactory
 * @typedef {import('./screen-state.js').screenBus} TscreenBus
 * @typedef {import('three').Scene} TThreeScene
 * @typedef {import('three').PerspectiveCamera} TThreeCamera
 * @typedef {import('three').WebGLRenderer} TThreeRenderer
 * @typedef {import('../entities/player.js').Player} TPlayer
 * @typedef {import('../entities/npc-elder.js').NpcElder} TNpcElder
 * @typedef {import('../entities/projectile.js').ProjectileSystem} TProjectileSystem
 * @typedef {import('../entities/loot.js').LootSystem} TLootSystem
 * @typedef {import('../world/particles.js').ParticleSystem} TParticleSystem
 * @typedef {import('../ui/settings-panel.js').SettingsPanel} TSettingsPanel
 * @typedef {{village:object, shrine:object}} TWorld
 * @typedef {{update:(dt:number)=>void, render:(alpha:number)=>void}} TLoopHooks
 */

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.bus = new EventBus();
    this.hitstop = new HitStop();
    this._build();
    this._wireUI();
    this._wireGlobalEvents();
    this._buildStartInfo();
    this._buildLoop();
    this._buildPauseWiring();
  }

  // 1. Build the game object — engine, entities, systems, UI in dependency order.
  _build() {
    // Engine
    this.renderer = new Renderer(this.canvas);
    this.scene = createScene();
    this.cameraRig = createCamera();
    createLighting(this.scene);
    this.materials = new MaterialFactory(this.renderer.renderer);
    this.input = new Input(this.canvas);
    this.minimap = new Minimap();
    this.particles = new ParticleSystem(this.scene);

    // World + entities
    this.world = buildWorld({ scene: this.scene, materials: this.materials, zoneId: state.currentZone });
    this.elder = new NpcElder(this.scene, this.materials, new THREE.Vector3(2, 0, 0));
    this.player = new Player(this.scene, this.materials, this.bus);
    this.projectiles = new ProjectileSystem(this.scene);
    this.loot = new LootSystem(this.scene, this.materials);
    this.eraPortal = new EraPortal(this.scene, { x: -10, z: 10 });
    this.eraIndicator = new EraIndicator(this.bus);

    // Settings singleton (used by FeedbackSystem for reduceMotion DI)
    this.settings = settings;

    // Systems (each takes `this`; feedback also gets settings for DI)
    this.feedback = new FeedbackSystem(this, this.settings);
    this.enemySystem = new EnemySystem(this);
    this.spawnSystem = new SpawnSystem(this);
    this.enemySystem.attachSpawnSystem(this.spawnSystem);
    this.bossSystem = new BossSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.questSystem = new QuestSystem(this);
    this.xpSystem = new XpSystem(this);
    this.inventorySystem = new InventorySystem(this);
    this.dialogueSystem = new DialogueSystem(this);
    this.interactionSystem = new InteractionSystem(this);
    this.codex = new CodexSystem(this);

    // Daily seed
    const urlSeed = new URLSearchParams(location.search).get('seed');
    state.dailySeed  = urlSeed ? (Number(urlSeed) >>> 0) : dailySeed();
    state.dailyIndex = dailyIndex();

    // Phase 19+: URL-based custom map load (?map=verdant:20473104)
    // Runs in priority over the daily seed when present.
    const urlMap = new URLSearchParams(location.search).get('map');
    if (urlMap) {
      const decoded = decodeMapCode(urlMap);
      if (decoded) {
        state.currentZone = decoded.zoneId;
        if (decoded.seed != null) state.dailySeed = decoded.seed >>> 0;
        state.mapCode = urlMap;
      }
    }
  }

  // 2. Wire UI panels (each manages its own DOM, no direct DOM in Game).
  _wireUI() {
    this.hud = new HUD(this.bus, this.player);
    this.menus = new Menus(this.bus, {
      onStart: () => this._handleStart(),
      onRestart: () => location.reload(),
      onResume: () => transition(SCREEN.PLAYING),
      onOpenSettings: () => this.settingsPanel.show(),
    });
    this.dialogPanel = new DialogPanel(this.bus);
    this.questPanel = new QuestPanel(this.bus);
    this.xpPanel = new XpPanel(this.bus);
    this.bossBar = new BossBar(this.bus);
    this.inventoryPanel = new InventoryPanel(this.bus, this.inventorySystem);
    this.mobileControls = new MobileControls();
    this.interactionHint = new InteractionHint(this.bus, { player: this.player, interactionSystem: this.interactionSystem });
    this.comboIndicator = new ComboIndicator(this.bus);
    this.damageDirection = new DamageDirection(this.bus, { camera: this.cameraRig, player: this.player });
    this.codexPanel = new CodexPanel(this.bus, this.codex);
    this.settingsPanel = new SettingsPanel();
    this.zonePicker = new ZonePicker(this.bus);

    const tutorial = new Tutorial(this.bus);
    tutorial.register('move',     (s) => s.time > 1  && s.time < 2,  'Bewege Aren mit WASD oder den Pfeiltasten.');
    tutorial.register('attack',   (s) => s.time > 6  && s.time < 7,  'Drücke Leertaste oder klicke, um anzugreifen.');
    tutorial.register('dodge',    (s) => s.time > 12 && s.time < 13, 'Shift = Ausweichrolle. Kurz unverwundbar!');
    tutorial.register('interact', (s) => s.time > 18 && s.time < 19, 'Drücke E, um mit Personen und dem Schrein zu sprechen.');
    this.tutorial = tutorial;

    this.bus.on(EVENTS.DIALOG_CHOICE_REQUEST, ({ id }) => this.dialogueSystem.pickChoice(id));
    this.bus.on('inventory:toggle', () => {
      if (state.screen === SCREEN.INVENTORY) transition(SCREEN.PLAYING);
      else transition(SCREEN.INVENTORY);
    });
    this.bus.on('codex:toggle', () => this.bus.emit('inventory:toggle'));
    this.bus.on('tick', () => {
      if (state.screen !== 'playing') return;
      const target = this.interactionSystem.nearestInteractable();
      if (target === 'shrine') this.bus.emit('shrine:visit');
      if (target === 'elder')  this.bus.emit('village:visit');
    });

    playLayer('ambient');
  }

  // 3. Global event wiring for player lifecycle + scene beats.
  _wireGlobalEvents() {
    this.bus.on(EVENTS.PLAYER_DAMAGE, () => this.bus.emit(EVENTS.UI_REFRESH));
    this.bus.on(EVENTS.PLAYER_HEAL,   () => this.bus.emit(EVENTS.UI_REFRESH));
    this.bus.on(EVENTS.PLAYER_DIED, () => {
      this.player.respawn(this.world.village.respawn);
      this.dialogueSystem.say('System', 'Du wurdest am Brunnen wiederbelebt.');
      this.bus.emit(EVENTS.UI_REFRESH);
    });

    this.bus.on(EVENTS.LOOT_PICKUP_CRYSTAL, () => {
      this.questSystem.addCrystal();
      this.inventorySystem.add('crystal');
      this.bus.emit(EVENTS.UI_REFRESH);
      playSfx('pickup');
      this.particles.burst(this.player.position, '#5ad1ff', 8);
    });
    this.bus.on(EVENTS.LOOT_PICKUP_BERRY, () => {
      this.inventorySystem.add('berry');
      playSfx('pickup');
      this.particles.burst(this.player.position, '#d94f4f', 8);
    });

    this.bus.on(EVENTS.ENEMY_DIED, (e) => {
      const spec = e.spec;
      state.killed[spec.id] = (state.killed[spec.id] || 0) + 1;
      this.player.kills = (this.player.kills || 0) + 1;
      this.xpSystem.gain(spec.hp * 5);
      this.particles.burst(e.position, '#' + spec.col.toString(16).padStart(6, '0'), 18);
      this.loot.drop(e.position);
    });

    this.bus.on(EVENTS.BOSS_DIED, () => {
      state.bossDefeated = true;
      for (let i = 0; i < 4; i++) {
        const p = this.bossSystem.boss.position;
        this.loot.drop(new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, 0, p.z + (Math.random() - 0.5) * 3));
      }
      this.xpSystem.gain(50);
      this.dialogueSystem.bossDefeated();
    });

    this.bus.on(EVENTS.SHRINE_CLEANSE, () => {
      state.shrineClean = true;
      const orb = this.world.shrine.orb;
      orb.material.color.set(0x5ad1ff);
      orb.material.emissive = new THREE.Color(0x2f7bff);
      this.particles.burst(this.world.shrine.position.clone().add(new THREE.Vector3(0, 4, 0)), '#5ad1ff', 40);
      // @ts-ignore — Three.js Color/Texture union: set() exists on both
      this.scene.fog.color.set(0x9fd8f0);
      // @ts-ignore
      this.scene.background.set(0x9fd8f0);
      playSfx('shrine');
      this.dialogueSystem.victory();
      setTimeout(() => this._endGame(true), 1500);
    });

    this.bus.on(EVENTS.BOSS_SPAWN, () => this.dialogueSystem.bossWarning());

    // Phase 19+: zone transitions. When the player steps through a
    // portal (or the URL/map-code loads a custom map), tear down the
    // current world and rebuild for the new zone. A short camera flash
    // hides the swap.
    this.bus.on(EVENTS.ZONE_CHANGE, (payload) => this._handleZoneChange(payload));
  }

  /**
   * Switch to a different zone. Tears down the existing world meshes,
   * rebuilds terrain/environment/props for the new biome, teleports
   * the player to the new hub, and refreshes the zone indicator.
   * @param {{ zoneId: string, source?: string, seed?: number }} payload
   */
  _handleZoneChange({ zoneId, source = 'code', seed = null }) {
    if (!ZONES[zoneId]) return;
    state.currentZone = zoneId;
    state.visitedZones = state.visitedZones || new Set();
    state.visitedZones.add(zoneId);
    if (seed != null) state.mapCode = `${zoneId}:${(seed >>> 0).toString(36)}`;

    // Trigger a quick screen flash (white) so the player doesn't see
    // the world re-build pop.
    this.bus.emit(EVENTS.FLASH, { color: 0xffffff, duration: 0.5 });
    this.bus.emit(EVENTS.HITSTOP, { frames: 6 });

    setTimeout(() => {
      // Tear down current world
      this._disposeWorld();
      // Rebuild for the new zone
      this.world = buildWorld({ scene: this.scene, materials: this.materials, zoneId });
      // Reposition player at the new hub
      const zone = getZone(zoneId);
      const hubKey = Object.keys(zone.spawns || {})[0];
      const hub = zone.spawns[hubKey] || { x: 0, z: 0 };
      if (this.player && this.player.group) {
        this.player.group.position.set(hub.x, 0, hub.z);
        if (typeof this.player.position?.set === 'function') {
          this.player.position.set(hub.x, 0, hub.z);
        }
      }
      // Refresh dependent systems
      if (this.interactionSystem) {
        this.interactionSystem.shrine = this.world.shrine;
        this.interactionSystem.portals = this.world.portals || [];
      }
      if (this.zonePicker) {
        this.zonePicker.showZoneIndicator(zoneId);
      }
      this.bus.emit(EVENTS.UI_REFRESH);
    }, 220);
  }

  _disposeWorld() {
    // Whitelist of types to preserve across zone transitions. Everything
    // else (village, forest, shrine, props, portals) is removed so the
    // new zone can be built on a clean slate.
    const preserved = new Set([
      this.player?.group,
      this.elder?.group,
      this.projectiles?.group,
    ].filter(Boolean));

    const toRemove = [];
    for (const child of this.scene.children) {
      if (preserved.has(child)) continue;
      if (child.isLight) continue;
      if (child.isCamera) continue;
      // Skip particle / projectile / loot roots if their system owns them
      toRemove.push(child);
    }
    for (const obj of toRemove) {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          for (const m of obj.material) m.dispose && m.dispose();
        } else {
          obj.material.dispose && obj.material.dispose();
        }
      }
    }
    // Clear enemy/loot systems since they're tied to the old zone
    if (this.enemySystem) this.enemySystem.clear();
    if (this.loot && this.loot.clear) this.loot.clear();
  }

  // 4. Render daily seed / index on the start overlay.
  _buildStartInfo() {
    const idx = document.getElementById('daily-index');
    const seed = document.getElementById('daily-seed');
    if (idx) idx.textContent = String(state.dailyIndex);
    if (seed) seed.textContent = state.dailySeed != null ? String(state.dailySeed) : '—';
  }

  // 5. Build the main loop and start it.
  _buildLoop() {
    /** @type {(alpha: number) => void} */
    let renderHook = () => this._render();
    if (wantsPerfOverlay()) {
      this.perfOverlay = createPerfOverlay(document);
      const inner = renderHook;
      renderHook = (alpha) => { inner(alpha); this.perfOverlay.tick(performance.now()); };
    }
    this.loop = new Loop({
      update: (dt) => this._update(dt),
      render: renderHook,
    });
    this.loop.start();
  }

  // 6. Pause wiring — Esc/Pause button flips screen state.
  _buildPauseWiring() {
    window.addEventListener('resize', () => {
      this.renderer.resize();
      this.cameraRig.setAspect(window.innerWidth / window.innerHeight);
    });
    this.bus.on(EVENTS.SHAKE,       ({ intensity, duration }) => this.cameraRig.addShake(intensity, duration));
    this.bus.on(EVENTS.CAMERA_KICK, ({ direction, intensity, duration }) => this.cameraRig.kickToward(direction, intensity, duration));
    this.bus.on(EVENTS.FLASH,       ({ color, duration }) => {
      const f = document.getElementById('flash-overlay');
      if (f) {
        f.style.background = color;
        f.style.opacity = '0.5';
        setTimeout(() => { f.style.opacity = '0'; }, Math.max(50, duration * 1000));
      }
    });
  }

  // ── Run-loop callbacks ────────────────────────────────────
  _update(dt) {
    // FPS counter (Phase 8, opt-in)
    this._fpsAccum = (this._fpsAccum || 0) + dt;
    this._fpsFrames = (this._fpsFrames || 0) + 1;
    if (this._fpsAccum >= 0.5) {
      const fps = Math.round(this._fpsFrames / this._fpsAccum);
      this._fpsAccum = 0; this._fpsFrames = 0;
      if (settings.get('showFPS')) document.documentElement.dataset.fps = String(fps);
      else delete document.documentElement.dataset.fps;
    }

    // Slowmo scales the game dt; UI animations tick on real dt.
    const gameDt = dt * this.feedback.timeScale;
    state.time += dt;
    state.cameraYaw = this.cameraRig.yaw;

    // Render the static menus even when not playing
    if (state.screen !== 'playing') return;

    // Camera yaw input
    const dYaw = this.input.consumeCameraYaw();
    if (dYaw !== 0) this.cameraRig.yaw += dYaw;
    state.cameraYaw = this.cameraRig.yaw;

    this.hitstop.update(dt);
    if (this.hitstop.active) return;

    if (this.input.consumeAttack())    this.combatSystem.tryAttack();
    if (this.input.consumeDodge())     this.player.startDodge();
    // Era-portal: check first (independent of zone portals)
    tickEraInteraction(this.eraPortal, this.input, this.bus);
    if (this.input.consumeInteract())  this.interactionSystem.interact();
    if (this.input.consumePause())     { transition(SCREEN.PAUSED); }
    if (this.input.consumeInventory()) { this.bus.emit('inventory:toggle'); }
    if (this.input.consumeCodex())     { this.bus.emit('codex:toggle'); }

    if (this.player.hp <= 0) this.bus.emit(EVENTS.PLAYER_DIED);

    this.player.update(gameDt, state.time, this.input);
    this.enemySystem.update(gameDt, this.player);
    this.bossSystem.update(gameDt, this.player);
    this.projectiles.update(gameDt, this.player, (shotPos) => this.player.takeDamage(1, shotPos));
    this.loot.update(gameDt, this.player,
      () => this.bus.emit(EVENTS.LOOT_PICKUP_CRYSTAL),
      () => this.bus.emit(EVENTS.LOOT_PICKUP_BERRY)
    );
    this.particles.update(gameDt);
    this.combatSystem.update(gameDt);
    this.dialogueSystem.update();
    this.feedback.update(dt);
    updateAudio(dt);

    // Adaptive music: combat layer fades in when an enemy is within 10 units.
    let enemiesNear = false;
    for (const e of this.enemySystem.enemies) {
      if (e.dead) continue;
      if (e.position.distanceTo(this.player.position) < 10) { enemiesNear = true; break; }
    }
    if (this.bossSystem.boss && this.bossSystem.boss.active && !this.bossSystem.boss.dead) enemiesNear = true;
    if (enemiesNear) playLayer('combat'); else stopLayer('combat');

    this.cameraRig.update(gameDt, this.player.position, this.player.velocity);
    this.minimap.draw(this.player, this.world.shrine, state.crystals, state.bossActive);
    this.bus.emit('tick');
  }

  _render() {
    this.renderer.render(this.scene, this.cameraRig.camera);
    if (this.eraCanvas) {
      applyEraPostProcess(this.canvas, this.eraCanvas);
      // Show the era canvas only when not in 3D era (which passes through directly)
      const showEra = currentEra() !== ERAS.THREE_D;
      this.eraCanvas.style.display = showEra ? 'block' : 'none';
    }
  }

  // ── Game actions ─────────────────────────────────────────
  _handleStart() {
    transition(SCREEN.PLAYING);
    state.startTime = state.time;
    this.enemySystem.spawnInitial();
    this.bus.emit(EVENTS.UI_REFRESH);
    this.dialogueSystem.startIntro();
  }

  _endGame(win) {
    state.endTime = state.time;
    const time = state.endTime - state.startTime;
    const score = Math.max(0, Math.round(
      state.crystals * 100
      + this.player.kills * 25
      + (win ? 500 : 0)
      - (state.damageTaken * 5)
      - Math.floor(time * 0.5)
    ));
    state.score = score;
    document.getElementById('end-time').textContent     = Math.round(time) + 's';
    document.getElementById('end-kills').textContent    = String(this.player.kills ?? 0);
    document.getElementById('end-crystals').textContent = String(state.crystals);
    const seedEl = document.getElementById('end-seed');
    if (seedEl) seedEl.textContent = state.dailySeed != null ? String(state.dailySeed) : '—';
    const scoreEl = document.getElementById('end-score');
    if (scoreEl) scoreEl.textContent = String(score);
    const endScreen = document.getElementById('end-screen');
    if (endScreen) {
      endScreen.style.display = 'flex';
      const h1 = endScreen.querySelector('h1');
      if (h1) h1.innerHTML = win ? 'Demo <span>abgeschlossen</span>' : 'Demo <span>beendet</span>';
    }
    transition(SCREEN.ENDSCREEN);
  }
}
