// ─────────────────────────────────────────────────────────────
// cards.js — all card definitions for The Between
// Imported by CombatScreen, RewardScreen, and App
// ─────────────────────────────────────────────────────────────

// ─── KAEN BASE POOL (12 cards) ───────────────────────────────
// Tank / endure / posture-break / attrition
export const KAEN_BASE_POOL = [
  {
    name: 'Greatsword Strike',
    cost: 3, dmg: 20, posture: 12,
    desc: '20 dmg · posture +12',
  },
  {
    name: 'Shield Bash',
    cost: 2, dmg: 8, posture: 18,
    desc: '8 dmg · posture +18',
  },
  {
    name: 'Endure',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Block incoming · posture −30',
    special: 'endure',
  },
  {
    name: 'Ruin Strike',
    cost: 4, dmg: 16, posture: 8,
    desc: 'Scales with missing HP',
    special: 'ruin',
  },
  {
    name: 'Cleave',
    cost: 3, dmg: 14, posture: 10,
    desc: '14 dmg · cuts through guard',
  },
  {
    name: 'Rally',
    cost: 2, dmg: 0, posture: 0,
    desc: 'Plant and breathe · posture −40',
    special: 'rally',
  },
  {
    name: 'Advance',
    cost: 1, dmg: 6, posture: 8,
    desc: '6 dmg · posture +8 · efficient',
  },
  {
    name: 'Shatter',
    cost: 5, dmg: 10, posture: 35,
    desc: '10 dmg · posture +35 · break focused',
  },
  // ── 4 new cards ──
  {
    name: 'Iron Will',
    cost: 2, dmg: 0, posture: 0,
    desc: 'Hold ground · posture −25',
    special: 'ironwill',
  },
  {
    name: 'Crushing Blow',
    cost: 3, dmg: 18, posture: 15,
    desc: '18 dmg · posture +15 · heavy and slow',
  },
  {
    name: 'Guard Break',
    cost: 2, dmg: 6, posture: 22,
    desc: '6 dmg · posture +22 · break focused',
  },
  {
    name: 'Retaliate',
    cost: 3, dmg: 12, posture: 10,
    desc: '12 dmg · bonus dmg if hit last turn',
    special: 'retaliate',
  },
]

// ─── SABLE BASE POOL (12 cards) ──────────────────────────────
// Evade / burst / exploit — glass cannon (65 HP)
export const SABLE_BASE_POOL = [
  {
    name: 'Shadow Strike',
    cost: 2, dmg: 18, posture: 6,
    desc: '18 dmg · fast and cheap',
  },
  {
    name: 'Vanish',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Sidestep — nullifies incoming hit',
    special: 'vanish',
  },
  {
    name: 'Exploit',
    cost: 3, dmg: 28, posture: 0,
    desc: '28 dmg · only when enemy staggered',
    special: 'exploit',
  },
  {
    name: 'Bleed Edge',
    cost: 2, dmg: 10, posture: 14,
    desc: '10 dmg · posture +14 · sets up stagger',
  },
  {
    name: 'Feint',
    cost: 1, dmg: 4, posture: 0,
    desc: '4 dmg · own posture −20',
    special: 'feint',
  },
  {
    name: 'Twin Fangs',
    cost: 4, dmg: 0, posture: 8,
    desc: '2 × 12 dmg · each stagger-checks',
    special: 'twin',
  },
  {
    name: 'Ghost Step',
    cost: 2, dmg: 0, posture: 0,
    desc: 'No dmg · own posture −15',
    special: 'ghost',
  },
  {
    name: 'Rupture',
    cost: 3, dmg: 14, posture: 20,
    desc: '14 dmg · posture +20 · commits to break',
  },
  // ── 4 new cards ──
  {
    name: 'Shadowmeld',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Go still · own posture −20',
    special: 'shadowmeld',
  },
  {
    name: 'Puncture',
    cost: 2, dmg: 12, posture: 10,
    desc: '12 dmg · posture +10 · reliable mid',
  },
  {
    name: 'Backstep',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Cheap reposition · own posture −10',
    special: 'backstep',
  },
  {
    name: 'Death Mark',
    cost: 3, dmg: 0, posture: 0,
    desc: 'Next attack deals +10 dmg',
    special: 'deathmark',
  },
]

// ─── HP RESTORE CARDS (reward-only, not in base pool) ─────────
export const KAEN_HP_CARDS = [
  {
    name: 'Second Wind',
    cost: 2, dmg: 0, posture: 0,
    desc: 'Restore 15 HP',
    special: 'heal',
    healAmt: 15,
  },
  {
    name: 'Dig In',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Restore 10 HP · posture −20',
    special: 'heal',
    healAmt: 10,
    postureRelief: 20,
  },
  {
    name: 'Fortify',
    cost: 3, dmg: 0, posture: 0,
    desc: 'Restore 20 HP · posture −10',
    special: 'heal',
    healAmt: 20,
    postureRelief: 10,
  },
]

export const SABLE_HP_CARDS = [
  {
    name: 'Fade',
    cost: 1, dmg: 0, posture: 0,
    desc: 'Restore 8 HP · disappear briefly',
    special: 'heal',
    healAmt: 8,
  },
  {
    name: 'Still',
    cost: 2, dmg: 0, posture: 0,
    desc: 'Restore 12 HP · posture −30',
    special: 'heal',
    healAmt: 12,
    postureRelief: 30,
  },
  {
    name: 'Slip Away',
    cost: 3, dmg: 0, posture: 0,
    desc: 'Restore 18 HP · evade next hit',
    special: 'healevade',
    healAmt: 18,
  },
]

// ─── UPGRADES (random pool per card) ─────────────────────────
// Each entry: which card it upgrades, what changes, display label
// One random upgrade is picked per reward screen appearance
export const KAEN_UPGRADES = [
  { targets: 'Greatsword Strike', stat: 'dmg',     by: 5,  label: 'Greatsword Strike +5 dmg' },
  { targets: 'Greatsword Strike', stat: 'posture',  by: 5,  label: 'Greatsword Strike +5 posture' },
  { targets: 'Shield Bash',       stat: 'posture',  by: 8,  label: 'Shield Bash +8 posture' },
  { targets: 'Shield Bash',       stat: 'dmg',      by: 4,  label: 'Shield Bash +4 dmg' },
  { targets: 'Endure',            stat: 'cost',     by: -1, label: 'Endure costs 0 ST' },
  { targets: 'Ruin Strike',       stat: 'dmg',      by: 4,  label: 'Ruin Strike +4 base dmg' },
  { targets: 'Cleave',            stat: 'dmg',      by: 4,  label: 'Cleave +4 dmg' },
  { targets: 'Rally',             stat: 'cost',     by: -1, label: 'Rally costs 1 ST' },
  { targets: 'Advance',           stat: 'dmg',      by: 3,  label: 'Advance +3 dmg' },
  { targets: 'Shatter',           stat: 'posture',  by: 10, label: 'Shatter +10 posture' },
  { targets: 'Crushing Blow',     stat: 'dmg',      by: 4,  label: 'Crushing Blow +4 dmg' },
  { targets: 'Guard Break',       stat: 'posture',  by: 8,  label: 'Guard Break +8 posture' },
  { targets: 'Retaliate',         stat: 'dmg',      by: 5,  label: 'Retaliate +5 dmg' },
  { targets: 'Iron Will',         stat: 'cost',     by: -1, label: 'Iron Will costs 1 ST' },
]

export const SABLE_UPGRADES = [
  { targets: 'Shadow Strike',  stat: 'dmg',     by: 5,  label: 'Shadow Strike +5 dmg' },
  { targets: 'Shadow Strike',  stat: 'cost',    by: -1, label: 'Shadow Strike costs 1 ST' },
  { targets: 'Exploit',        stat: 'dmg',     by: 7,  label: 'Exploit +7 dmg' },
  { targets: 'Bleed Edge',     stat: 'posture', by: 6,  label: 'Bleed Edge +6 posture' },
  { targets: 'Bleed Edge',     stat: 'dmg',     by: 3,  label: 'Bleed Edge +3 dmg' },
  { targets: 'Feint',          stat: 'dmg',     by: 4,  label: 'Feint +4 dmg' },
  { targets: 'Twin Fangs',     stat: 'cost',    by: -1, label: 'Twin Fangs costs 3 ST' },
  { targets: 'Rupture',        stat: 'posture', by: 8,  label: 'Rupture +8 posture' },
  { targets: 'Puncture',       stat: 'dmg',     by: 4,  label: 'Puncture +4 dmg' },
  { targets: 'Death Mark',     stat: 'cost',    by: -1, label: 'Death Mark costs 2 ST' },
  { targets: 'Ghost Step',     stat: 'cost',    by: -1, label: 'Ghost Step costs 1 ST' },
  { targets: 'Shadowmeld',     stat: 'cost',    by: -1, label: 'Shadowmeld costs 0 ST' },
]

// ─── SABLE HIGH-DAMAGE REWARD CARDS ──────────────────────────
// These are new cards earned as rewards — not in base pool
// Floor 2+ only, fits her assassin identity
export const SABLE_REWARD_CARDS = [
  {
    name: 'Slit Throat',
    cost: 3, dmg: 35, posture: 0,
    desc: '35 dmg · only usable while evading',
    special: 'slitthroat',
  },
  {
    name: 'Jugular',
    cost: 4, dmg: 45, posture: 0,
    desc: '45 dmg · only when enemy staggered',
    special: 'jugular',
  },
  {
    name: 'Hemorrhage',
    cost: 2, dmg: 8, posture: 14,
    desc: '8 dmg now · bleeds 8 dmg next turn',
    special: 'hemorrhage',
  },
  {
    name: 'Death Stroke',
    cost: 3, dmg: 25, posture: 0,
    desc: '25 dmg · clean hit, no posture',
  },
]

// ─── STAT BOOSTS (character-specific) ────────────────────────
export const KAEN_STAT_BOOSTS = [
  { type: 'maxHP', amt: 15, label: '+15 Max HP', desc: 'Permanently increases max HP by 15.' },
  { type: 'maxST', amt: 1,  label: '+1 Stamina', desc: 'Adds one permanent stamina segment.' },
]

export const SABLE_STAT_BOOSTS = [
  { type: 'maxHP', amt: 20, label: '+20 Max HP', desc: 'Permanently increases max HP by 20.' },
  { type: 'maxST', amt: 1,  label: '+1 Stamina', desc: 'Adds one permanent stamina segment.' },
]

// ─── HP CARD BY FLOOR ─────────────────────────────────────────
// Each floor gets a specific HP card tier
const KAEN_HP_BY_FLOOR = {
  1: { name: 'Dig In',      cost: 1, dmg: 0, posture: 0, desc: 'Restore 10 HP · posture −20', special: 'heal', healAmt: 10, postureRelief: 20 },
  2: { name: 'Second Wind', cost: 2, dmg: 0, posture: 0, desc: 'Restore 15 HP',                special: 'heal', healAmt: 15 },
  3: { name: 'Fortify',     cost: 3, dmg: 0, posture: 0, desc: 'Restore 20 HP · posture −10', special: 'heal', healAmt: 20, postureRelief: 10 },
}

const SABLE_HP_BY_FLOOR = {
  1: { name: 'Fade',      cost: 1, dmg: 0, posture: 0, desc: 'Restore 8 HP · disappear briefly',  special: 'heal',      healAmt: 8  },
  2: { name: 'Still',     cost: 2, dmg: 0, posture: 0, desc: 'Restore 12 HP · posture −30',       special: 'heal',      healAmt: 12, postureRelief: 30 },
  3: { name: 'Slip Away', cost: 3, dmg: 0, posture: 0, desc: 'Restore 18 HP · evade next hit',    special: 'healevade', healAmt: 18 },
}

// ─── UPGRADE POOL BY FLOOR ────────────────────────────────────
// Floor 1: basic stat bumps
// Floor 2+: includes high-damage Sable cards as new card options
const KAEN_UPGRADES_F1 = [
  { targets: 'Greatsword Strike', stat: 'dmg',    by: 5,  label: 'Greatsword Strike +5 dmg' },
  { targets: 'Shield Bash',       stat: 'posture', by: 8,  label: 'Shield Bash +8 posture' },
  { targets: 'Advance',           stat: 'dmg',    by: 3,  label: 'Advance +3 dmg' },
  { targets: 'Endure',            stat: 'cost',   by: -1, label: 'Endure costs 0 ST' },
  { targets: 'Rally',             stat: 'cost',   by: -1, label: 'Rally costs 1 ST' },
]

const KAEN_UPGRADES_F2 = [
  ...KAEN_UPGRADES_F1,
  { targets: 'Ruin Strike',   stat: 'dmg',    by: 4,  label: 'Ruin Strike +4 base dmg' },
  { targets: 'Cleave',        stat: 'dmg',    by: 4,  label: 'Cleave +4 dmg' },
  { targets: 'Shatter',       stat: 'posture', by: 10, label: 'Shatter +10 posture' },
  { targets: 'Crushing Blow', stat: 'dmg',    by: 4,  label: 'Crushing Blow +4 dmg' },
  { targets: 'Guard Break',   stat: 'posture', by: 8,  label: 'Guard Break +8 posture' },
  { targets: 'Retaliate',     stat: 'dmg',    by: 5,  label: 'Retaliate +5 dmg' },
]

const SABLE_UPGRADES_F1 = [
  { targets: 'Shadow Strike', stat: 'dmg',  by: 5,  label: 'Shadow Strike +5 dmg' },
  { targets: 'Bleed Edge',    stat: 'posture', by: 6, label: 'Bleed Edge +6 posture' },
  { targets: 'Feint',         stat: 'dmg',  by: 4,  label: 'Feint +4 dmg' },
  { targets: 'Puncture',      stat: 'dmg',  by: 4,  label: 'Puncture +4 dmg' },
  { targets: 'Rupture',       stat: 'posture', by: 8, label: 'Rupture +8 posture' },
]

const SABLE_UPGRADES_F2 = [
  ...SABLE_UPGRADES_F1,
  { targets: 'Exploit',    stat: 'dmg',  by: 7,  label: 'Exploit +7 dmg' },
  { targets: 'Twin Fangs', stat: 'cost', by: -1, label: 'Twin Fangs costs 3 ST' },
  { targets: 'Death Mark', stat: 'cost', by: -1, label: 'Death Mark costs 2 ST' },
  { targets: 'Ghost Step', stat: 'cost', by: -1, label: 'Ghost Step costs 1 ST' },
  { targets: 'Shadow Strike', stat: 'cost', by: -1, label: 'Shadow Strike costs 1 ST' },
]

// ─── REWARD POOL BUILDER ──────────────────────────────────────
// Floor 1: 1 HP card (weak) + 1 upgrade + 1 stat boost
// Floor 2: 1 HP card (mid) + 1 upgrade (stronger) + 1 stat boost
// Floor 3 (Unfinished): 1 HP card (strong) + 1 upgrade (strongest) + 1 stat boost
export function buildRewardOptions({ floor, isKaen, currentDeck }) {
  const upgradePool  = isKaen
    ? (floor >= 2 ? KAEN_UPGRADES_F2 : KAEN_UPGRADES_F1)
    : (floor >= 2 ? SABLE_UPGRADES_F2 : SABLE_UPGRADES_F1)
  const statBoosts   = isKaen ? KAEN_STAT_BOOSTS : SABLE_STAT_BOOSTS
  const hpByFloor    = isKaen ? KAEN_HP_BY_FLOOR  : SABLE_HP_BY_FLOOR
  const rewardCards  = isKaen ? [] : SABLE_REWARD_CARDS

  const options = []

  // ── 1. HP card for this floor (skip if already in deck) ──
  const floorKey  = Math.min(floor, 3)
  const hpCard    = hpByFloor[floorKey]
  if (hpCard && !currentDeck.includes(hpCard.name)) {
    options.push({ type: 'card', card: hpCard, label: hpCard.name, desc: hpCard.desc })
  } else {
    // Already have it — offer a Sable reward card or stat boost instead
    const fallback = rewardCards.find(c => !currentDeck.includes(c.name))
    if (fallback) {
      options.push({ type: 'card', card: fallback, label: fallback.name, desc: fallback.desc })
    } else {
      const boost = statBoosts[Math.floor(Math.random() * statBoosts.length)]
      options.push({ type: 'boost', boost, label: boost.label, desc: boost.desc })
    }
  }

  // ── 2. Upgrade card ──
  // On Floor 2+ also consider Sable reward cards as "new card" upgrade-tier options
  if (floor >= 2 && !isKaen) {
    const availableRewards = rewardCards.filter(c => !currentDeck.includes(c.name))
    if (availableRewards.length > 0) {
      const pick = availableRewards[Math.floor(Math.random() * availableRewards.length)]
      options.push({ type: 'card', card: pick, label: pick.name, desc: pick.desc })
    }
  } else {
    // Kaen or Floor 1 — standard upgrade
    const validUpgrades = upgradePool.filter(u => currentDeck.includes(u.targets))
    if (validUpgrades.length > 0) {
      const upgrade = validUpgrades[Math.floor(Math.random() * validUpgrades.length)]
      options.push({ type: 'upgrade', upgrade, label: upgrade.label, desc: `Permanently upgrades ${upgrade.targets}` })
    } else {
      // No valid upgrades yet — give a stat boost
      const boost = statBoosts[Math.floor(Math.random() * statBoosts.length)]
      options.push({ type: 'boost', boost, label: boost.label, desc: boost.desc })
    }
  }

  // ── 3. Stat boost ──
  const usedBoostTypes = new Set(options.filter(o => o.type === 'boost').map(o => o.boost?.type))
  const availableBoosts = statBoosts.filter(b => !usedBoostTypes.has(b.type))
  const boost = availableBoosts.length > 0
    ? availableBoosts[Math.floor(Math.random() * availableBoosts.length)]
    : statBoosts[0]
  options.push({ type: 'boost', boost, label: boost.label, desc: boost.desc })

  // Shuffle final order
  const a = [...options]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}