// systems/skill-tree.js — 3 class branches with 8 nodes each (24 total).
// Each node: passive bonus + tier (1-8) + prereq (parent node id or
// null for root). Players spend skill points to allocate nodes;
// prereqs must be met first.

export const BRANCHES = Object.freeze({
  KRIEGER:  { id: 'krieger',  name: 'Krieger',  color: '#F59E0B', icon: 'sword',   focus: 'STR + VIT' },
  MAGIER:   { id: 'magier',   name: 'Magier',   color: '#A78BFA', icon: 'sparkle', focus: 'INT + WIS' },
  SCHURKE:  { id: 'schurke',  name: 'Schurke',  color: '#34D399', icon: 'shield',  focus: 'DEX + crit' },
});

/**
 * Node tree. Each branch has 8 nodes in a tree shape:
 *   - Row 0: root (no prereq)
 *   - Rows 1-3: 2 children each
 *   - Row 4: capstone (requires all 3 row-3 nodes)
 */
const NODES = {
  // ── Krieger (8) ──
  k_str_1:    { id: 'k_str_1',    branch: 'krieger',  tier: 1, row: 0, prereq: null,       name: 'Stärke +1',     bonus: { str: 1 } },
  k_str_2:    { id: 'k_str_2',    branch: 'krieger',  tier: 1, row: 0, prereq: null,       name: 'Stärke +2',     bonus: { str: 2 } },
  k_vit_1:    { id: 'k_vit_1',    branch: 'krieger',  tier: 2, row: 1, prereq: 'k_str_1',  name: 'Vitalität +2',  bonus: { vit: 2 } },
  k_vit_2:    { id: 'k_vit_2',    branch: 'krieger',  tier: 2, row: 1, prereq: 'k_str_2',  name: 'Vitalität +3',  bonus: { vit: 3 } },
  k_str_3:    { id: 'k_str_3',    branch: 'krieger',  tier: 3, row: 2, prereq: 'k_vit_1',  name: 'Stärke +3',     bonus: { str: 3 } },
  k_hp:       { id: 'k_hp',       branch: 'krieger',  tier: 3, row: 2, prereq: 'k_vit_2',  name: 'Max HP +15',    bonus: { hp_flat: 15 } },
  k_cleave:   { id: 'k_cleave',   branch: 'krieger',  tier: 4, row: 3, prereq: 'k_str_3',  name: 'Cleave',        bonus: { cleave: 1 } },
  k_fortress: { id: 'k_fortress', branch: 'krieger',  tier: 4, row: 3, prereq: 'k_hp',     name: 'Festung',       bonus: { damageReduction: 0.15 } },
  k_capstone: { id: 'k_capstone', branch: 'krieger',  tier: 5, row: 4, prereq: 'k_cleave', name: 'Berserker',     bonus: { str: 5, vit: 3, hp_flat: 20 } },
  k_cap2:     { id: 'k_cap2',     branch: 'krieger',  tier: 5, row: 4, prereq: 'k_fortress',name: 'Unzerstörbar',  bonus: { vit: 8, damageReduction: 0.1 } },

  // ── Magier (8) ──
  m_int_1:    { id: 'm_int_1',    branch: 'magier',   tier: 1, row: 0, prereq: null,       name: 'Intellekt +1',  bonus: { int: 1 } },
  m_int_2:    { id: 'm_int_2',    branch: 'magier',   tier: 1, row: 0, prereq: null,       name: 'Intellekt +2',  bonus: { int: 2 } },
  m_wis_1:    { id: 'm_wis_1',    branch: 'magier',   tier: 2, row: 1, prereq: 'm_int_1',  name: 'Weisheit +2',   bonus: { wis: 2 } },
  m_wis_2:    { id: 'm_wis_2',    branch: 'magier',   tier: 2, row: 1, prereq: 'm_int_2',  name: 'Weisheit +3',   bonus: { wis: 3 } },
  m_mana:     { id: 'm_mana',     branch: 'magier',   tier: 3, row: 2, prereq: 'm_wis_1',  name: 'Max Mana +30',  bonus: { mana_flat: 30 } },
  m_regen:    { id: 'm_regen',    branch: 'magier',   tier: 3, row: 2, prereq: 'm_wis_2',  name: 'Mana-Regen +1', bonus: { manaRegen_flat: 1 } },
  m_spell_1:  { id: 'm_spell_1',  branch: 'magier',   tier: 4, row: 3, prereq: 'm_mana',   name: 'Spell Power +20%', bonus: { spellPower: 0.2 } },
  m_reduce:   { id: 'm_reduce',   branch: 'magier',   tier: 4, row: 3, prereq: 'm_regen',  name: 'Mana Cost -15%',bonus: { spellCostMul: 0.85 } },
  m_capstone: { id: 'm_capstone', branch: 'magier',   tier: 5, row: 4, prereq: 'm_spell_1',name: 'Arkane Meißter',bonus: { int: 5, wis: 3, spellPower: 0.3 } },
  m_cap2:     { id: 'm_cap2',     branch: 'magier',   tier: 5, row: 4, prereq: 'm_reduce', name: 'Ewiger Fluss',  bonus: { wis: 8, manaRegen_flat: 2 } },

  // ── Schurke (8) ──
  s_dex_1:    { id: 's_dex_1',    branch: 'schurke',  tier: 1, row: 0, prereq: null,       name: 'Geschick +1',   bonus: { dex: 1 } },
  s_dex_2:    { id: 's_dex_2',    branch: 'schurke',  tier: 1, row: 0, prereq: null,       name: 'Geschick +2',   bonus: { dex: 2 } },
  s_crit_1:   { id: 's_crit_1',   branch: 'schurke',  tier: 2, row: 1, prereq: 's_dex_1',  name: 'Crit +5%',      bonus: { critChance: 0.05 } },
  s_crit_2:   { id: 's_crit_2',   branch: 'schurke',  tier: 2, row: 1, prereq: 's_dex_2',  name: 'Crit +8%',      bonus: { critChance: 0.08 } },
  s_speed:    { id: 's_speed',    branch: 'schurke',  tier: 3, row: 2, prereq: 's_crit_1', name: 'Angriffstempo +20%', bonus: { attackSpeed: 0.2 } },
  s_dodge:    { id: 's_dodge',    branch: 'schurke',  tier: 3, row: 2, prereq: 's_crit_2', name: 'Ausweichchance 10%', bonus: { dodge: 0.1 } },
  s_backstab: { id: 's_backstab', branch: 'schurke',  tier: 4, row: 3, prereq: 's_speed',  name: 'Hinterhalt',    bonus: { backstab: 1 } },
  s_stealth:  { id: 's_stealth',  branch: 'schurke',  tier: 4, row: 3, prereq: 's_dodge',  name: 'Schleichen',    bonus: { stealth: 1 } },
  s_capstone: { id: 's_capstone', branch: 'schurke',  tier: 5, row: 4, prereq: 's_backstab',name: 'Meisterassassine', bonus: { dex: 5, critChance: 0.15, backstab: 1 } },
  s_cap2:     { id: 's_cap2',     branch: 'schurke',  tier: 5, row: 4, prereq: 's_stealth', name: 'Phantom',      bonus: { dex: 8, dodge: 0.15 } },
};

export function getNode(id) { return NODES[id] || null; }
export function listNodes() { return Object.values(NODES); }
export function listNodesByBranch(branchId) {
  return Object.values(NODES).filter((n) => n.branch === branchId);
}

/**
 * Check if a node can be allocated. Requires the prereq to be
 * allocated (or null for roots) AND points available.
 * @param {string} nodeId
 * @param {object} state — { skillTree: { branch: [nodeId,...] }, skillPoints }
 * @returns {{ canAllocate: boolean, reason: string|null }}
 */
export function canAllocate(nodeId, state) {
  const node = NODES[nodeId];
  if (!node) return { canAllocate: false, reason: 'unknown_node' };
  state.skillTree = state.skillTree || { krieger: [], magier: [], schurke: [] };
  const allocated = state.skillTree[node.branch] || [];
  if (allocated.includes(nodeId)) return { canAllocate: false, reason: 'already_allocated' };
  if (node.prereq && !allocated.includes(node.prereq)) {
    return { canAllocate: false, reason: 'prereq_not_met' };
  }
  if ((state.skillPoints || 0) < 1) {
    return { canAllocate: false, reason: 'no_points' };
  }
  return { canAllocate: true, reason: null };
}

/**
 * Allocate a node. Returns true on success.
 */
export function allocateNode(nodeId, state) {
  const check = canAllocate(nodeId, state);
  if (!check.canAllocate) return false;
  const node = NODES[nodeId];
  if (!node) return false;
  state.skillTree = state.skillTree || { krieger: [], magier: [], schurke: [] };
  state.skillTree[node.branch].push(nodeId);
  state.skillPoints = (state.skillPoints || 0) - 1;
  return true;
}

/**
 * Deallocate a node. Refunds 1 point. Only allowed if no descendants
 * of this node are allocated (to keep the tree connected).
 */
export function deallocateNode(nodeId, state) {
  const node = NODES[nodeId];
  if (!node) return false;
  state.skillTree = state.skillTree || { krieger: [], magier: [], schurke: [] };
  const allocated = state.skillTree[node.branch] || [];
  if (!allocated.includes(nodeId)) return false;
  // Check no descendants
  for (const n of Object.values(NODES)) {
    if (n.branch !== node.branch) continue;
    if (!allocated.includes(n.id)) continue;
    if (n.prereq === nodeId) return false; // has a child still allocated
  }
  state.skillTree[node.branch] = allocated.filter((id) => id !== nodeId);
  state.skillPoints = (state.skillPoints || 0) + 1;
  return true;
}

/**
 * Aggregate all bonus stats from allocated nodes.
 * @param {object} state
 * @returns {object} combined bonus object
 */
export function getAllocatedBonuses(state) {
  state.skillTree = state.skillTree || { krieger: [], magier: [], schurke: [] };
  const out = { str: 0, dex: 0, int: 0, vit: 0, wis: 0, hp_flat: 0, mana_flat: 0, manaRegen_flat: 0, critChance: 0, attackSpeed: 0, dodge: 0, damageReduction: 0, spellPower: 0, spellCostMul: 1, cleave: 0, backstab: 0, stealth: 0 };
  const all = [
    ...(state.skillTree.krieger || []),
    ...(state.skillTree.magier || []),
    ...(state.skillTree.schurke || []),
  ];
  for (const id of all) {
    const node = NODES[id];
    if (!node) continue;
    for (const [k, v] of Object.entries(node.bonus)) {
      if (typeof out[k] === 'number' && typeof v === 'number') {
        out[k] += v;
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}

/**
 * Total points spent per branch.
 */
export function pointsSpentPerBranch(state) {
  state.skillTree = state.skillTree || { krieger: [], magier: [], schurke: [] };
  return {
    krieger: (state.skillTree.krieger || []).length,
    magier:  (state.skillTree.magier  || []).length,
    schurke: (state.skillTree.schurke || []).length,
  };
}

/**
 * Total points spent across all branches.
 */
export function totalPointsSpent(state) {
  const p = pointsSpentPerBranch(state);
  return p.krieger + p.magier + p.schurke;
}
