'use strict';
/* Pure game data: rules numbers, actions, statuses, items, equipment, enemies.
   Keep numbers here so tooltips, engine and docs never drift apart. */

const RULES = {
  player: { name: 'Sir Aldric', level: 1, maxHp: 250, maxMana: 400, maxStamina: 100, manaRegen: 10, staminaRegen: 50 },
  staggered: { turns: 3, lightBonus: 5, dmgMult: 0.85 },
  stunned: { turns: 1 },
  frozen: { turns: 1, dmgMult: 0.6 },
  burn: { dmg: 5, turns: 2, maxStacks: 3 },
  lightning: { upkeep: 10, dmg: 10 },
};

const pct = (m) => Math.round((1 - m) * 100);

const STATUSES = {
  staggered: {
    name: 'Staggered', icon: 'stagger', tint: 'bronze',
    stats: () => [`Duration: ${RULES.staggered.turns} turns`, `Deals ${pct(RULES.staggered.dmgMult)}% less damage`, `Takes +${RULES.staggered.lightBonus} from Attack`],
    desc: 'Off balance. Light attacks hit harder, and a Heavy Attack will stun it.',
  },
  stunned: {
    name: 'Stunned', icon: 'stun', tint: 'bronze',
    stats: () => [`Duration: ${RULES.stunned.turns} turn`],
    desc: 'Loses its next turn. Any wind-up is interrupted.',
  },
  burn: {
    name: 'Burn', icon: 'burn', tint: 'fire',
    stats: () => [`${RULES.burn.dmg} damage per stack at end of its turn`, `Lasts ${RULES.burn.turns} turns per stack`, `Stacks up to ${RULES.burn.maxStacks}`],
    desc: 'Each stack burns on its own timer. A fourth application replaces the oldest stack.',
  },
  frozen: {
    name: 'Frozen', icon: 'frozen', tint: 'ice',
    stats: () => [`Duration: ${RULES.frozen.turns} turn`, `Deals ${pct(RULES.frozen.dmgMult)}% less damage`],
    desc: 'Stiff with cold; its blows are weak.',
  },
  lightning: {
    name: 'Lightning Shield', icon: 'lightning_shield', tint: 'storm',
    stats: () => [`Upkeep: ${RULES.lightning.upkeep} mana per turn`, `${RULES.lightning.dmg} damage at end of your turn`],
    desc: 'Crackling energy lashes the enemy each turn. Switches off if you cannot pay.',
  },
};

/* ---- Equipment ---------------------------------------------------------- */

const SLOTS = [
  { id: 'head', label: 'Head' }, { id: 'chest', label: 'Chest' },
  { id: 'legs', label: 'Legs' }, { id: 'gloves', label: 'Gloves' },
  { id: 'mainHand', label: 'Main hand' }, { id: 'offHand', label: 'Off hand' },
  { id: 'ring1', label: 'Ring' }, { id: 'ring2', label: 'Ring' },
];

const BONUS_LABELS = {
  lightDamage: 'Attack damage', heavyDamage: 'Heavy Attack damage',
  defendBlock: 'Block from Defend', spellDamage: 'Spell damage',
};

const EQUIPMENT = {
  plain_helm: { name: 'Plain Helm', slot: 'head', icon: 'helm', tint: 'steel', bonus: {}, desc: 'A simple steel cap with an open visor.' },
  iron_sword: { name: 'Iron Sword', slot: 'mainHand', icon: 'sword', tint: 'steel', bonus: { lightDamage: 1, heavyDamage: 1 }, desc: 'Plain, well-balanced, a little nicked.' },
  wooden_shield: { name: 'Wooden Shield', slot: 'offHand', icon: 'shield', tint: 'wood', bonus: { defendBlock: 1 }, desc: 'Oak planks, iron-banded.' },
  iron_gauntlets: { name: 'Iron Gauntlets', slot: 'gloves', icon: 'gloves', tint: 'steel', bonus: { lightDamage: 2 }, desc: 'Riveted iron gloves that put weight behind every blow.' },
  bronze_ring: { name: 'Bronze Ring', slot: 'ring', icon: 'ring', tint: 'bronze', bonus: { spellDamage: 2 }, desc: 'A warm ring that hums faintly when spells are near.' },
};

const DEFAULT_EQUIPMENT = { head: 'plain_helm', chest: null, legs: null, gloves: null, mainHand: 'iron_sword', offHand: 'wooden_shield', ring1: null, ring2: null };

const slotAccepts = (item, slotId) => item.slot === slotId || (item.slot === 'ring' && slotId.startsWith('ring'));

/* ---- Consumables --------------------------------------------------------- */

const CONSUMABLES = {
  healing_draught: { name: 'Healing Draught', icon: 'flask_red', tint: 'blood', effect: { hp: 60 }, count: 2, desc: 'A bitter red tonic that knits wounds.' },
  mana_tonic: { name: 'Mana Tonic', icon: 'flask_blue', tint: 'mana', effect: { mana: 100 }, count: 1, desc: 'Tastes of cold spring water and copper.' },
  stamina_tincture: { name: 'Stamina Tincture', icon: 'flask_green', tint: 'stamina', effect: { stamina: 50 }, count: 1, desc: 'Sharp herbs that clear the head and warm the legs.' },
  elderberry_bread: { name: 'Elderberry Bread', icon: 'bread', tint: 'wood', effect: { hp: 25, stamina: 20 }, count: 3, desc: 'Dense, sweet and still a little warm.' },
};

/* Starting backpack (unequipped gear) and which consumables are pinned to the action bar. */
const DEFAULT_BACKPACK = ['iron_gauntlets', 'bronze_ring'];
const DEFAULT_QUICKBAR = ['healing_draught', 'mana_tonic', 'stamina_tincture'];
const QUICKBAR_MAX = 6;

/* ---- Player actions ------------------------------------------------------ */

const ACTIONS = {
  attack: {
    name: 'Attack', icon: 'sword', tint: 'steel', kind: 'Physical', cost: { stamina: 20 },
    stats: (b) => [`Damage: ${15 + b.lightDamage}${b.lightDamage ? ` (15 +${b.lightDamage} gear)` : ''}`, `+${RULES.staggered.lightBonus} vs Staggered`],
    desc: 'A quick, reliable strike.',
  },
  heavy: {
    name: 'Heavy Attack', icon: 'hammer', tint: 'steel', kind: 'Physical', cost: { stamina: 50 },
    stats: (b) => [`Damage: ${25 + b.heavyDamage}${b.heavyDamage ? ` (25 +${b.heavyDamage} gear)` : ''}`, `Applies Staggered (${RULES.staggered.turns} turns)`, 'Stuns an already Staggered target'],
    desc: 'A crushing blow that throws the enemy off balance.',
  },
  defend: {
    name: 'Defend', icon: 'shield', tint: 'steel', kind: 'Physical', cost: { stamina: 10 },
    stats: (b) => [`Block: ${10 + b.defendBlock}${b.defendBlock ? ` (10 +${b.defendBlock} gear)` : ''}`, '1 block absorbs 1 damage', 'Block is lost at the start of your next turn'],
    desc: 'Raise your shield.',
  },
  fireball: {
    name: 'Fireball', icon: 'fireball', tint: 'fire', kind: 'Spell', cost: { mana: 30 },
    stats: (b) => [`Damage: ${20 + b.spellDamage}${b.spellDamage ? ` (20 +${b.spellDamage} gear)` : ''}`, `Applies Burn: ${RULES.burn.dmg}/turn for ${RULES.burn.turns} turns`, `Stacks up to ${RULES.burn.maxStacks}`],
    desc: 'A roaring ball of flame.',
  },
  frost: {
    name: 'Frost Arrow', icon: 'frost_arrow', tint: 'ice', kind: 'Spell', cost: { mana: 40 },
    stats: (b) => [`Damage: ${30 + b.spellDamage}${b.spellDamage ? ` (30 +${b.spellDamage} gear)` : ''}`, `Applies Frozen (${RULES.frozen.turns} turn): enemy deals ${pct(RULES.frozen.dmgMult)}% less damage`],
    desc: 'A shard of winter, loosed from the bow of your will.',
  },
  lightning: {
    name: 'Lightning Shield', icon: 'lightning_shield', tint: 'storm', kind: 'Toggle', cost: { mana: RULES.lightning.upkeep }, costNote: 'per turn',
    stats: (b) => [`End of your turn: ${RULES.lightning.dmg + b.spellDamage} damage to the enemy`, `Upkeep: ${RULES.lightning.upkeep} mana per turn`, 'Free to toggle; switches off if you cannot pay'],
    desc: 'Wreathe yourself in crackling light.',
  },
};
const ACTION_ORDER = ['attack', 'heavy', 'defend', 'fireball', 'frost', 'lightning'];

/* ---- Enemies -------------------------------------------------------------- */

const weighted = (w) => {
  const entries = Object.entries(w);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of entries) { if ((r -= v) < 0) return k; }
  return entries[entries.length - 1][0];
};

const ENEMIES = {
  grubnik: {
    id: 'grubnik', name: 'Grubnik the Cutpurse', level: 1, maxHp: 120, sprite: 'goblin',
    immune: [], heavyBonus: 0,
    blurb: 'A scrappy goblin with a rusty knife and a dented bucket for a helmet.',
    moves: {
      jab: { id: 'jab', name: 'Jab', icon: 'dagger', tint: 'steel', dmg: 10, hits: 1, kind: 'light', desc: 'A quick jab with a rusty knife. 10 damage.' },
      flurry: { id: 'flurry', name: 'Frenzied Flurry', icon: 'flurry', tint: 'blood', dmg: 4, hits: 4, kind: 'light', desc: 'Four frantic stabs of 4 damage. Each hit is blocked separately.' },
      buckler: { id: 'buckler', name: 'Hide Behind Buckler', icon: 'buckler', tint: 'wood', block: 12, desc: 'Cowers behind a scrap-wood buckler. Gains 12 block.' },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (e.hp / e.maxHp < 0.4 && last !== 'buckler') return 'buckler';
      const w = p.block === 0 ? { jab: 25, flurry: 60, buckler: 15 } : { jab: 50, flurry: 30, buckler: 20 };
      if (last && last === h[h.length - 2]) delete w[last];
      return weighted(w);
    },
  },
  warden: {
    id: 'warden', name: 'Barrow Warden', level: 3, maxHp: 400, sprite: 'warden',
    immune: ['frozen'], heavyBonus: 5,
    blurb: 'A hollow suit of corroded plate, lit from within by a cold blue glow.',
    traits: [
      { icon: 'frozen', tint: 'ice', name: 'Cold-blooded', desc: 'Immune to Frozen. Frost Arrow still deals its damage.' },
      { icon: 'hammer', tint: 'bronze', name: 'Brittle plate', desc: 'Takes +5 damage from Heavy Attacks.' },
    ],
    moves: {
      cleave: { id: 'cleave', name: 'Rusted Cleave', icon: 'cleave', tint: 'steel', dmg: 18, hits: 1, kind: 'heavy', desc: 'A heavy, rusty sweep. 18 damage.' },
      chill: { id: 'chill', name: 'Grave Chill', icon: 'skull', tint: 'ice', dmg: 12, hits: 1, drain: 40, kind: 'frost', cast: true, desc: 'A breath of the grave. 12 damage and drains 40 mana.' },
      bulwark: { id: 'bulwark', name: 'Bone Bulwark', icon: 'tower', tint: 'steel', block: 25, desc: 'Braces behind old plate. Gains 25 block.' },
      overhead: { id: 'overhead', name: 'Crushing Overhead', icon: 'overhead', tint: 'blood', followup: 'overheadStrike', desc: 'Raises the greatsword high this turn, then brings it down next turn for 45 damage. A stun interrupts it.' },
      overheadStrike: { id: 'overheadStrike', name: 'Crushing Overhead', icon: 'slam', tint: 'blood', dmg: 45, hits: 1, kind: 'heavy', hidden: true, desc: 'The greatsword comes down. 45 damage.' },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (h.length === 0) return 'bulwark';
      const recentWindup = h.slice(-2).includes('overhead');
      if (e.hp / e.maxHp < 0.5 && !recentWindup) return p.block > 15 ? 'cleave' : 'overhead';
      if (p.mana > 250) return 'chill';
      const w = { cleave: 60, chill: 25, bulwark: 15 };
      if (last === 'bulwark') delete w.bulwark;
      return weighted(w);
    },
  },
};
