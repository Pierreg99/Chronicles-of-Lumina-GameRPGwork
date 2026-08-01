// game.js — top-level orchestrator. Wires engine, world, entities, systems, UI.

import * as THREE from 'three';

import { CONFIG } from './config.js';
import { EVENTS, UI_PANELS } from './constants.js';
import { EventBus } from './event-bus.js';
import { state, setPhase } from './state.js';
import { Loop } from './loop.js';

import { Renderer } from '../engine/renderer.js';
import { Scene } from '../engine/scene.js';
import { CameraRig } from '../engine/camera.js';
import { Lighting } from '../engine/lighting.js';
import { MaterialFactory } from '../engine/materials.js';
import { Audio } from '../engine/audio.js';
import { Input } from '../engine/input.js';
import { MobileInput } from '../engine/mobile-input.js';
import { Collision } from '../engine/collision.js';

import { buildWorld } from '../world/world-builder.js';
import { Player } from '../entities/player.js';
import { EnemySystem } from '../systems/enemy-system.js';
import { BossSystem } from '../systems/boss-system.js';
import { CombatSystem } from '../systems/combat-system.js';
import { ProjectileSystem } from '../entities/projectile.js';
import { LootSystem } from '../entities/loot.js';
import { QuestSystem } from '../systems/quest-system.js';
import { XpSystem } from '../systems/xp-system.js';
import { InventorySystem } from '../systems/inventory-system.js';
import { DialogueSystem } from '../systems/dialogue-system.js';
import { InteractionSystem } from '../systems/interaction-system.js';
import { SpawnSystem } from '../systems/spawn-system.js';
import { ParticleSystem } from '../world/particles.js';

import { HUD } from '../ui/hud.js';
import { Menus } from '../ui/menus.js';
import { DialogPanel } from '../ui/dialog-panel.js';
import { QuestPanel } from '../ui/quest-panel.js';
import { XpPanel } from '../ui/xp-panel.js';
import { BossBar } from '../ui/boss-bar.js';
import { InventoryPanel } from '../ui/inventory-panel.js';
import { MobileControls } from '../ui/mobile-controls.js';
import { Minimap } from '../world/minimap.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.bus = new EventBus();

    this._setup();
  }

  _setup() {
    // 1. Engine
    this.renderer = new Renderer(this.canvas);
    this.sceneMgr = new Scene();
    this.camera = new CameraRig(this.canvas, this.bus);
    this.lighting = new Lighting(this.sceneMgr.scene);
    this.materials = new MaterialFactory(this.renderer.renderer);
    this.audio = new Audio();
    this.input = new Input(this.canvas, this.bus);
    this.mobileInput = new MobileInput(this.bus);
    this.input.bindMobile(this.mobileInput);
    this.collision = new Collision();

    // 2. World
    this.particleSystem = new ParticleSystem(this.sceneMgr.scene, this.materials);
    this.minimap = new Minimap();
    this.world = buildWorld({
      scene: this.sceneMgr.scene,
      materials: this.materials,
      collision: this.collision,
      minimap: this.minimap,
    });

    // 3. Entities
    this.player = new Player({
      scene: this.sceneMgr.scene,
      materials: this.materials,
      bus: this.bus,
      input: this.input,
      collision: this.collision,
      spawn: CONFIG.world.wellPos,
    });
    state.player = this.player;

    // 4. Systems
    this.enemySystem = new EnemySystem(this);
    this.bossSystem = new BossSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.projectileSystem = new ProjectileSystem(this);
    this.lootSystem = new LootSystem(this);
    this.questSystem = new QuestSystem(this);
    this.xpSystem = new XpSystem(this);
    this.inventorySystem = new InventorySystem(this);
    this.dialogueSystem = new DialogueSystem(this);
    this.interactionSystem = new InteractionSystem(this);
    this.spawnSystem = new SpawnSystem(this);

    // 5. UI
    this.hud = new HUD(this);
    this.menus = new Menus(this);
    this.dialogPanel = new DialogPanel(this);
    this.questPanel = new QuestPanel(this);
    this.xpPanel = new XpPanel(this);
    this.bossBar = new BossBar(this);
    this.inventoryPanel = new InventoryPanel(this);
    this.mobileControls = new MobileControls(this);

    // 6. Loop
    this.loop = new Loop({
      update: (dt) => this.update(dt),
      render: (alpha) => this.render(alpha),
      onPauseChange: (p) => this.bus.emit(p ? EVENTS.GAME_PAUSE : EVENTS.GAME_RESUME),
    });

    this._wireGlobalEvents();
    this._spawnInitialEntities();

    setPhase('menu');
    this.menus.show(UI_PANELS.START);
    this.loop.start();
    this.bus.emit(EVENTS.GAME_INIT);
  }

  _spawnInitialEntities() {
    this.enemySystem.spawnInitial();
    this.world.elder.bind(this.dialogueSystem);
  }

  _wireGlobalEvents() {
    this.bus.on(EVENTS.GAME_START, () => {
      setPhase('playing');
      this.menus.hide(UI_PANELS.START);
      state.startTime = state.time;
      this.dialogueSystem.startIntro();
    });

    this.bus.on(EVENTS.GAME_OVER, () => {
      setPhase('endscreen');
      state.endTime = state.time;
      this.menus.showEndscreen({ win: false });
    });

    this.bus.on(EVENTS.GAME_WIN, () => {
      setPhase('endscreen');
      state.endTime = state.time;
      this.menus.showEndscreen({ win: true });
    });

    this.bus.on(EVENTS.GAME_PAUSE, () => {
      if (state.phase === 'playing') {
        setPhase('paused');
        this.menus.show(UI_PANELS.PAUSE);
        this.loop.setPaused(true);
      }
    });

    this.bus.on(EVENTS.GAME_RESUME, () => {
      if (state.phase === 'paused') {
        setPhase('playing');
        this.menus.hide(UI_PANELS.PAUSE);
        this.loop.setPaused(false);
      }
    });

    this.bus.on(EVENTS.DIALOG_OPEN, () => {
      if (state.phase === 'playing') setPhase('dialog');
    });
    this.bus.on(EVENTS.DIALOG_CLOSE, () => {
      if (state.phase === 'dialog') setPhase('playing');
    });

    this.bus.on(EVENTS.PLAYER_DIED, () => {
      this.player.respawn(CONFIG.world.wellPos);
    });

    window.addEventListener('resize', () => this.bus.emit(EVENTS.RESIZE, {
      w: window.innerWidth, h: window.innerHeight,
    }));
  }

  update(dt) {
    if (state.phase === 'menu' || state.phase === 'endscreen') return;
    if (state.phase === 'paused') return;

    this.input.poll();
    this.player.update(dt);
    this.enemySystem.update(dt);
    this.bossSystem.update(dt);
    this.projectileSystem.update(dt);
    this.lootSystem.update(dt);
    this.particleSystem.update(dt);
    this.spawnSystem.update(dt);
    this.interactionSystem.update(dt);
    this.world.update(dt);
    this.camera.update(dt, this.player, this.input);
    this.minimap.update(this.player, this.world, this.bossSystem);
  }

  render(alpha) {
    this.renderer.render(this.sceneMgr.scene, this.camera.camera);
  }
}
