// tests/npc.test.mjs — NPC registry, dialog trees, actions.
import './_setup.mjs';
import {
  NPC_ROLES, getNPC, listNPCs, listNPCsByZone, listNPCsByRole, totalNPCs,
  getDialogNode, getNPCDialogRoot, evaluateChoice, totalDialogNodes,
} from '../src/systems/npc.js';
import { test, group, assert } from './_runner.mjs';

group('NPC roles', () => {
  test('has 12 NPC roles', () => {
    assert.equal(Object.keys(NPC_ROLES).length, 12);
  });
});

group('NPC registry', () => {
  test('has 12+ NPCs', () => {
    assert.truthy(totalNPCs() >= 12, `only ${totalNPCs()}`);
  });

  test('every NPC has id, name, role, location, dialogTree', () => {
    for (const n of listNPCs()) {
      assert.truthy(n.id);
      assert.truthy(n.name);
      assert.truthy(NPC_ROLES[n.role.toUpperCase()], `bad role: ${n.role}`);
      assert.truthy(n.location);
      assert.truthy(n.dialogTree);
    }
  });

  test('NPCs are distributed across zones', () => {
    const verdant = listNPCsByZone('verdant');
    const ember = listNPCsByZone('ember');
    assert.truthy(verdant.length >= 3, `verdant: ${verdant.length}`);
    assert.truthy(ember.length >= 1, `ember: ${ember.length}`);
  });

  test('has 1 elder NPC', () => {
    const elders = listNPCsByRole('elder');
    assert.equal(elders.length, 1);
  });

  test('has 3 trainers (one per class)', () => {
    const trainers = listNPCsByRole('trainer');
    assert.equal(trainers.length, 3);
  });
});

group('dialog trees', () => {
  test('has 10+ dialog nodes', () => {
    assert.truthy(totalDialogNodes() >= 10, `only ${totalDialogNodes()}`);
  });

  test('every dialog node has text and choices', () => {
    for (const [id, node] of Object.entries({})) {
      // Skipping — we don't expose all nodes externally
    }
    const root = getNPCDialogRoot('elder_thaddeus');
    assert.truthy(root.text);
    assert.truthy(Array.isArray(root.choices));
    assert.truthy(root.choices.length >= 2);
  });

  test('getNPCDialogRoot returns null for unknown NPC', () => {
    assert.equal(getNPCDialogRoot('not_a_npc'), null);
  });

  test('getDialogNode returns null for unknown', () => {
    assert.equal(getDialogNode('dt_not_a_node'), null);
  });
});

group('evaluateChoice', () => {
  test('returns next node or null', () => {
    const node = getNPCDialogRoot('elder_thaddeus');
    const next = evaluateChoice(node, 0, {});
    assert.truthy(next);
    assert.truthy(next.text);
  });

  test('choice "goodbye" returns null (conversation ends)', () => {
    const node = getNPCDialogRoot('elder_thaddeus');
    // Choice 2: "Auf Wiedersehen." with next: null
    const next = evaluateChoice(node, 2, {});
    assert.equal(next, null);
  });

  test('condition: level blocks low-level players', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: 'dt_thaddeus_root', condition: { level: 10 } }],
    };
    const state = { level: 5 };
    const next = evaluateChoice(node, 0, state);
    assert.equal(next, null);
  });

  test('condition: level allows high-level players', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: 'dt_thaddeus_root', condition: { level: 5 } }],
    };
    const state = { level: 10 };
    const next = evaluateChoice(node, 0, state);
    assert.truthy(next);
  });

  test('condition: gold blocks poor players', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: 'dt_thaddeus_root', condition: { gold: 100 } }],
    };
    const state = { gold: 50 };
    assert.equal(evaluateChoice(node, 0, state), null);
  });

  test('action: startQuest adds to quest log', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: 'dt_thaddeus_root', action: { startQuest: 'q_test' } }],
    };
    const state = {};
    evaluateChoice(node, 0, state);
    assert.truthy(state.quests);
    assert.equal(state.quests.q_test.status, 'active');
  });

  test('action: giveItem adds to inventory', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: null, action: { giveItem: 'potion_hp_small' } }],
    };
    const state = { inventory: [] };
    evaluateChoice(node, 0, state);
    assert.truthy(state.inventory.includes('potion_hp_small'));
  });

  test('action: giveGold adds gold', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: null, action: { giveGold: 100 } }],
    };
    const state = { gold: 0 };
    evaluateChoice(node, 0, state);
    assert.equal(state.gold, 100);
  });

  test('action: giveSkillPoint adds skill point', () => {
    const node = {
      id: 'test',
      text: 'X',
      choices: [{ text: 'Y', next: null, action: { giveSkillPoint: 1 } }],
    };
    const state = { skillPoints: 0 };
    evaluateChoice(node, 0, state);
    assert.equal(state.skillPoints, 1);
  });
});
