// tests/skill-tree.test.mjs — 3-branch skill tree.
import './_setup.mjs';
import {
  BRANCHES, getNode, listNodes, listNodesByBranch,
  canAllocate, allocateNode, deallocateNode,
  getAllocatedBonuses, pointsSpentPerBranch, totalPointsSpent,
} from '../src/systems/skill-tree.js';
import { test, group, assert } from './_runner.mjs';

group('skill tree branches', () => {
  test('has 3 branches (Krieger, Magier, Schurke)', () => {
    assert.equal(Object.keys(BRANCHES).length, 3);
    for (const id of ['krieger', 'magier', 'schurke']) {
      assert.truthy(BRANCHES[id.toUpperCase()], `${id} missing`);
      assert.truthy(BRANCHES[id.toUpperCase()].focus);
    }
  });

  test('each branch has 8+ nodes (root + 6 middle + 1 capstone or 8 total)', () => {
    for (const b of Object.keys(BRANCHES)) {
      const nodes = listNodesByBranch(b.toLowerCase());
      assert.truthy(nodes.length >= 8, `${b} has ${nodes.length} nodes`);
    }
  });

  test('each branch has exactly 2 root nodes (prereq: null)', () => {
    for (const b of Object.keys(BRANCHES)) {
      const roots = listNodesByBranch(b.toLowerCase()).filter((n) => !n.prereq);
      assert.equal(roots.length, 2, `${b} should have 2 root nodes`);
    }
  });

  test('total node count is at least 24', () => {
    assert.truthy(listNodes().length >= 24);
  });
});

group('canAllocate', () => {
  test('root nodes can be allocated with 1 point', () => {
    const state = { skillPoints: 1, skillTree: { krieger: [], magier: [], schurke: [] } };
    const check = canAllocate('k_str_1', state);
    assert.truthy(check.canAllocate);
  });

  test('fails with no_points', () => {
    const state = { skillPoints: 0, skillTree: { krieger: [], magier: [], schurke: [] } };
    const check = canAllocate('k_str_1', state);
    assert.falsy(check.canAllocate);
    assert.equal(check.reason, 'no_points');
  });

  test('fails with prereq_not_met', () => {
    const state = { skillPoints: 5, skillTree: { krieger: [], magier: [], schurke: [] } };
    const check = canAllocate('k_vit_1', state);
    assert.falsy(check.canAllocate);
    assert.equal(check.reason, 'prereq_not_met');
  });

  test('fails with already_allocated', () => {
    const state = { skillPoints: 5, skillTree: { krieger: ['k_str_1'], magier: [], schurke: [] } };
    const check = canAllocate('k_str_1', state);
    assert.falsy(check.canAllocate);
    assert.equal(check.reason, 'already_allocated');
  });

  test('succeeds after prereq met', () => {
    const state = { skillPoints: 5, skillTree: { krieger: ['k_str_1'], magier: [], schurke: [] } };
    const check = canAllocate('k_vit_1', state);
    assert.truthy(check.canAllocate);
  });
});

group('allocateNode / deallocateNode', () => {
  test('allocate deducts 1 point and adds to branch', () => {
    const state = { skillPoints: 2, skillTree: { krieger: [], magier: [], schurke: [] } };
    const ok = allocateNode('k_str_1', state);
    assert.truthy(ok);
    assert.equal(state.skillPoints, 1);
    assert.truthy(state.skillTree.krieger.includes('k_str_1'));
  });

  test('allocate fails without prereq', () => {
    const state = { skillPoints: 5, skillTree: { krieger: [], magier: [], schurke: [] } };
    const ok = allocateNode('k_vit_1', state);
    assert.falsy(ok);
    assert.equal(state.skillPoints, 5);
  });

  test('deallocate refunds 1 point', () => {
    const state = { skillPoints: 0, skillTree: { krieger: ['k_str_1'], magier: [], schurke: [] } };
    const ok = deallocateNode('k_str_1', state);
    assert.truthy(ok);
    assert.equal(state.skillPoints, 1);
    assert.falsy(state.skillTree.krieger.includes('k_str_1'));
  });

  test('cannot deallocate a node with allocated children', () => {
    const state = { skillPoints: 0, skillTree: { krieger: ['k_str_1', 'k_vit_1'], magier: [], schurke: [] } };
    const ok = deallocateNode('k_str_1', state);
    assert.falsy(ok);
    assert.truthy(state.skillTree.krieger.includes('k_str_1'));
  });
});

group('getAllocatedBonuses', () => {
  test('sums stats across branches', () => {
    const state = { skillPoints: 0, skillTree: { krieger: ['k_str_1', 'k_str_2'], magier: ['m_int_1'], schurke: [] } };
    const b = getAllocatedBonuses(state);
    assert.equal(b.str, 3); // 1 + 2
    assert.equal(b.int, 1);
  });

  test('returns sane defaults for empty tree', () => {
    const state = { skillTree: { krieger: [], magier: [], schurke: [] } };
    const b = getAllocatedBonuses(state);
    assert.equal(b.str, 0);
    assert.equal(b.dodge, 0);
    assert.equal(b.spellCostMul, 1);
  });
});

group('pointsSpentPerBranch + totalPointsSpent', () => {
  test('counts allocated nodes per branch', () => {
    const state = { skillTree: { krieger: ['k_str_1', 'k_str_2'], magier: ['m_int_1', 'm_int_2', 'm_wis_1'], schurke: [] } };
    const p = pointsSpentPerBranch(state);
    assert.equal(p.krieger, 2);
    assert.equal(p.magier, 3);
    assert.equal(p.schurke, 0);
    assert.equal(totalPointsSpent(state), 5);
  });
});
