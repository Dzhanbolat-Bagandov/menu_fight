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
  bleed: { dmg: 4, turns: 3 },
  weakened: { turns: 2, dmgMult: 0.75 },
  slowed: { turns: 1, regenMult: 0.5 },
  enraged: { turns: 2, bonus: 6 },
  thorns: { turns: 2, dmg: 3 },
  rest: { hpPct: 0.3, manaPct: 0.3 },
};

const pct = (m) => Math.round((1 - m) * 100);

const STATUSES = {
  staggered: {
    name: 'Staggered', icon: 'stagger', tint: 'bronze', applied: 'is staggered',
    stats: () => [`Duration: ${RULES.staggered.turns} turns`, `Deals ${pct(RULES.staggered.dmgMult)}% less damage`, `Takes +${RULES.staggered.lightBonus} from Attack`],
    desc: 'Off balance. Light attacks hit harder, and a Heavy Attack will stun it.',
  },
  stunned: {
    name: 'Stunned', icon: 'stun', tint: 'bronze', applied: 'is stunned',
    stats: () => [`Duration: ${RULES.stunned.turns} turn`],
    desc: 'Loses its next turn. Any wind-up is interrupted.',
  },
  burn: {
    name: 'Burn', icon: 'burn', tint: 'fire', applied: 'is burning', dot: true, stacking: 'instances',
    stats: () => [`${RULES.burn.dmg} damage per stack at end of its turn`, `Lasts ${RULES.burn.turns} turns per stack`, `Stacks up to ${RULES.burn.maxStacks}`],
    desc: 'Each stack burns on its own timer. A fourth application replaces the oldest stack.',
  },
  frozen: {
    name: 'Frozen', icon: 'frozen', tint: 'ice', applied: 'is frozen',
    stats: () => [`Duration: ${RULES.frozen.turns} turn`, `Deals ${pct(RULES.frozen.dmgMult)}% less damage`],
    desc: 'Stiff with cold; its blows are weak.',
  },
  lightning: {
    name: 'Lightning Shield', icon: 'lightning_shield', tint: 'storm', applied: 'gains Lightning Shield',
    stats: () => [`Upkeep: ${RULES.lightning.upkeep} mana per turn`, `${RULES.lightning.dmg} damage at end of your turn`],
    desc: 'Crackling energy lashes the enemy each turn. Switches off if you cannot pay.',
  },
  bleed: {
    name: 'Bleed', icon: 'bleed', tint: 'blood', applied: 'is bleeding', dot: true,
    stats: () => [`${RULES.bleed.dmg} damage at the end of each of your turns`, `Duration: ${RULES.bleed.turns} turns`, 'Reapplying refreshes the duration'],
    desc: 'An open wound. Block still soaks the damage.',
  },
  weakened: {
    name: 'Weakened', icon: 'weakened', tint: 'storm', applied: 'is weakened',
    stats: () => [`Deals ${pct(RULES.weakened.dmgMult)}% less damage`, `Duration: ${RULES.weakened.turns} turns`],
    desc: 'A creeping hex saps the strength from your arms and your spells.',
  },
  slowed: {
    name: 'Slowed', icon: 'slowed', tint: 'stamina', applied: 'is slowed',
    stats: () => [`Stamina regeneration ${pct(RULES.slowed.regenMult)}% lower`, `Duration: ${RULES.slowed.turns} turn`],
    desc: 'Something sticky clings to your limbs.',
  },
  enraged: {
    name: 'Enraged', icon: 'enraged', tint: 'blood', applied: 'becomes enraged',
    stats: () => [`Next attack deals +${RULES.enraged.bonus} damage per hit`, 'Consumed by its next attack'],
    desc: 'Snorting, stamping, ready to charge.',
  },
  thorns: {
    name: 'Thorns', icon: 'thorns', tint: 'stamina', applied: 'grows thorns',
    stats: () => [`Your Attack and Heavy Attack take ${RULES.thorns.dmg} damage back per hit`, `Duration: ${RULES.thorns.turns} turns`],
    desc: 'Barbs that bite back at anyone who strikes in close.',
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
  defendBlock: 'Block from Defend', spellDamage: 'Spell damage', maxHp: 'Max HP',
};

const EQUIPMENT = {
  plain_helm: { name: 'Plain Helm', slot: 'head', icon: 'helm', tint: 'steel', bonus: {}, desc: 'A simple steel cap with an open visor.' },
  iron_sword: { name: 'Iron Sword', slot: 'mainHand', icon: 'sword', tint: 'steel', bonus: { lightDamage: 1, heavyDamage: 1 }, desc: 'Plain, well-balanced, a little nicked.' },
  wooden_shield: { name: 'Wooden Shield', slot: 'offHand', icon: 'shield', tint: 'wood', bonus: { defendBlock: 1 }, desc: 'Oak planks, iron-banded.' },
  iron_gauntlets: { name: 'Iron Gauntlets', slot: 'gloves', icon: 'gloves', tint: 'steel', bonus: { lightDamage: 2 }, desc: 'Riveted iron gloves that put weight behind every blow.' },
  bronze_ring: { name: 'Bronze Ring', slot: 'ring', icon: 'ring', tint: 'bronze', bonus: { spellDamage: 2 }, desc: 'A warm ring that hums faintly when spells are near.' },
  /* loot pool: found in chests and while scavenging */
  hedge_hood: { name: "Hedge-Mage's Hood", slot: 'head', icon: 'hood', tint: 'storm', bonus: { spellDamage: 1, maxHp: 5 }, desc: 'Patched wool that smells of rosemary and ozone.', loot: true },
  iron_barbute: { name: 'Iron Barbute', slot: 'head', icon: 'helm', tint: 'bronze', bonus: { maxHp: 15 }, desc: 'A heavier helm with a T-shaped opening.', loot: true },
  padded_gambeson: { name: 'Padded Gambeson', slot: 'chest', icon: 'armor', tint: 'wood', bonus: { maxHp: 20 }, desc: 'Quilted linen, warm and surprisingly tough.', loot: true },
  steel_cuirass: { name: 'Steel Cuirass', slot: 'chest', icon: 'armor', tint: 'steel', bonus: { maxHp: 30, defendBlock: 1 }, desc: 'Polished breastplate with a bronze trim.', loot: true },
  leather_greaves: { name: 'Leather Greaves', slot: 'legs', icon: 'legs', tint: 'wood', bonus: { maxHp: 15 }, desc: 'Boiled leather, laced at the knee.', loot: true },
  plated_greaves: { name: 'Plated Greaves', slot: 'legs', icon: 'legs', tint: 'steel', bonus: { maxHp: 25 }, desc: 'Steel plates over sturdy boots.', loot: true },
  duelist_gloves: { name: "Duelist's Gloves", slot: 'gloves', icon: 'gloves', tint: 'wood', bonus: { lightDamage: 1, heavyDamage: 1 }, desc: 'Supple gloves with a sure grip.', loot: true },
  bastard_sword: { name: 'Bastard Sword', slot: 'mainHand', icon: 'sword', tint: 'bronze', bonus: { lightDamage: 2, heavyDamage: 3 }, desc: 'Long enough for two hands, light enough for one.', loot: true },
  kite_shield: { name: 'Kite Shield', slot: 'offHand', icon: 'shield', tint: 'blood', bonus: { defendBlock: 3 }, desc: 'Tall, painted shield of a fallen order.', loot: true },
  ember_ring: { name: 'Ring of Embers', slot: 'ring', icon: 'ring', tint: 'fire', bonus: { spellDamage: 3 }, desc: 'A ruby that is always warm to the touch.', loot: true },
  vigor_ring: { name: 'Ring of Vigor', slot: 'ring', icon: 'ring', tint: 'stamina', bonus: { maxHp: 15 }, desc: 'A jade band carved with oak leaves.', loot: true },
};
EQUIPMENT.iron_gauntlets.loot = true;
EQUIPMENT.bronze_ring.loot = true;

const DEFAULT_EQUIPMENT = { head: 'plain_helm', chest: null, legs: null, gloves: null, mainHand: 'iron_sword', offHand: 'wooden_shield', ring1: null, ring2: null };

const slotAccepts = (item, slotId) => item.slot === slotId || (item.slot === 'ring' && slotId.startsWith('ring'));

/* ---- Consumables --------------------------------------------------------- */

const CONSUMABLES = {
  healing_draught: { name: 'Healing Draught', icon: 'flask_red', tint: 'blood', potion: true, effect: { hp: 60 }, count: 2, desc: 'A bitter red tonic that knits wounds.' },
  mana_tonic: { name: 'Mana Tonic', icon: 'flask_blue', tint: 'mana', potion: true, effect: { mana: 100 }, count: 1, desc: 'Tastes of cold spring water and copper.' },
  stamina_tincture: { name: 'Stamina Tincture', icon: 'flask_green', tint: 'stamina', potion: true, effect: { stamina: 50 }, count: 1, desc: 'Sharp herbs that clear the head and warm the legs.' },
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
  gloop: {
    id: 'gloop', name: 'Gloop, the Bog Slime', level: 1, maxHp: 130, sprite: 'slime',
    immune: [], heavyBonus: 0,
    blurb: 'A quivering heap of bog-water and bad decisions. Something old floats inside it.',
    moves: {
      slam: { id: 'slam', name: 'Belly Slam', icon: 'slime', tint: 'stamina', dmg: 9, hits: 1, kind: 'light', desc: 'Flops onto you. 9 damage.' },
      spit: { id: 'spit', name: 'Sticky Spit', icon: 'slowed', tint: 'stamina', dmg: 6, hits: 1, kind: 'light', cast: 'slime', applies: 'slowed', desc: 'A glob of goo. 6 damage and Slowed: your stamina regenerates half as fast next turn.' },
      ooze: { id: 'ooze', name: 'Ooze Together', icon: 'heal', tint: 'stamina', heal: 12, block: 8, desc: 'Pulls itself back together. Heals 12 and gains 8 block.' },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (e.hp / e.maxHp < 0.5 && last !== 'ooze' && !h.slice(-3).includes('ooze')) return 'ooze';
      const w = { slam: 50, spit: hasStatus(p, 'slowed') ? 10 : 35 };
      if (e.hp < e.maxHp * 0.8 && last !== 'ooze') w.ooze = 15;
      if (last && last === h[h.length - 2] && w[last]) delete w[last];
      return weighted(w);
    },
  },
  boar: {
    id: 'boar', name: 'Thornback Boar', level: 2, maxHp: 210, sprite: 'boar',
    immune: [], heavyBonus: 0,
    blurb: 'A bristling forest boar with brambles grown into its hide and tusks like sickles.',
    moves: {
      tusk: { id: 'tusk', name: 'Tusk Rip', icon: 'tusk', tint: 'blood', dmg: 13, hits: 1, kind: 'heavy', desc: 'A ripping upward slash. 13 damage.' },
      gore: { id: 'gore', name: 'Gore', icon: 'bleed', tint: 'blood', dmg: 9, hits: 1, kind: 'light', applies: 'bleed', desc: `9 damage and Bleed: ${RULES.bleed.dmg} damage at the end of your turns for ${RULES.bleed.turns} turns.` },
      paw: { id: 'paw', name: 'Paw the Earth', icon: 'enraged', tint: 'wood', block: 12, selfApplies: 'enraged', desc: `Gains 12 block and becomes Enraged: its next attack deals +${RULES.enraged.bonus} damage.` },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (last === 'paw') return hasStatus(p, 'bleed') ? 'tusk' : 'gore';
      const w = { tusk: 40, gore: hasStatus(p, 'bleed') ? 15 : 40, paw: 25 };
      if (last && last === h[h.length - 2]) delete w[last];
      return weighted(w);
    },
  },
  witch: {
    id: 'witch', name: 'Mother Nettle, the Hedge Witch', level: 2, maxHp: 180, sprite: 'witch',
    immune: [], heavyBonus: 0,
    blurb: 'She lives where the hedgerows grow wild, and she does not like visitors with swords.',
    moves: {
      bolt: { id: 'bolt', name: 'Thorn Bolt', icon: 'thorns', tint: 'stamina', dmg: 15, hits: 1, kind: 'light', cast: 'thorn', desc: 'A spray of enchanted thorns. 15 damage.' },
      hex: { id: 'hex', name: 'Hex of Frailty', icon: 'weakened', tint: 'storm', cast: 'hex', applies: 'weakened', desc: `Weakened for ${RULES.weakened.turns} turns: you deal ${pct(RULES.weakened.dmgMult)}% less damage.` },
      ward: { id: 'ward', name: 'Bramble Ward', icon: 'thorns', tint: 'wood', block: 10, selfApplies: 'thorns', desc: `Gains 10 block and Thorns: your Attack and Heavy Attack take ${RULES.thorns.dmg} damage back per hit.` },
      mend: { id: 'mend', name: 'Nettle Brew', icon: 'heal', tint: 'stamina', heal: 18, desc: 'Sips something green. Heals 18.' },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (h.length === 0) return 'hex';
      if (e.hp / e.maxHp < 0.45 && !h.slice(-3).includes('mend')) return 'mend';
      const w = { bolt: 50, ward: last === 'ward' ? 0 : 25, hex: hasStatus(p, 'weakened') || last === 'hex' ? 0 : 30 };
      return weighted(w);
    },
  },
  treant: {
    id: 'treant', name: 'Old Ironbark', level: 3, maxHp: 450, sprite: 'treant',
    immune: [], heavyBonus: 0, fireMult: 1.5,
    blurb: 'An ancient oak that woke up angry. Moss beard, amber eyes, roots like fists.',
    traits: [
      { icon: 'fireball', tint: 'fire', name: 'Dry bark', desc: 'Takes 50% more damage from Fireball and Burn.' },
    ],
    moves: {
      sweep: { id: 'sweep', name: 'Branch Sweep', icon: 'flurry', tint: 'wood', dmg: 11, hits: 2, kind: 'heavy', desc: 'Two great swings of its branches, 11 damage each.' },
      grasp: { id: 'grasp', name: 'Root Grasp', icon: 'slowed', tint: 'wood', dmg: 14, hits: 1, kind: 'light', applies: 'slowed', desc: '14 damage and Slowed: your stamina regenerates half as fast next turn.' },
      bark: { id: 'bark', name: 'Bark Skin', icon: 'tower', tint: 'wood', block: 20, selfApplies: 'thorns', desc: `Gains 20 block and Thorns: your Attack and Heavy Attack take ${RULES.thorns.dmg} damage back per hit.` },
      sap: { id: 'sap', name: 'Sap Mend', icon: 'heal', tint: 'stamina', heal: 30, desc: 'Amber sap seals its wounds. Heals 30.' },
    },
    chooseMove(e, p) {
      const h = e.history, last = h[h.length - 1];
      if (e.hp / e.maxHp < 0.5 && !h.slice(-3).includes('sap')) return 'sap';
      const w = { sweep: 45, grasp: hasStatus(p, 'slowed') ? 15 : 30, bark: last === 'bark' ? 0 : 25 };
      return weighted(w);
    },
  },
};

/* ---- Map ------------------------------------------------------------------ */
/* Nodes are named "row-col". Row 0 is the start, the last row is the goal.
   Every node links to the node straight ahead; EXTRA_EDGES adds the cross paths. */
const MAP_LAYOUT = {
  rows: [
    ['start'],
    ['fight', 'fight', 'chest'],
    ['rest', 'chest', 'fight'],
    ['rest', 'fight', 'fight'],
    ['goal'],
  ],
  extraEdges: [['1-1', '2-2'], ['2-3', '3-2'], ['2-2', '3-3']],
};
/* Enemy pools by level (= map row). */
const ENEMY_POOLS = { 1: ['grubnik', 'gloop'], 2: ['boar', 'witch'], 3: ['warden', 'treant'] };

const NODE_TYPES = {
  start: { name: 'Camp', icon: 'flag', desc: 'Where your journey begins.' },
  fight: { name: 'Fight', icon: 'monster', desc: 'A hostile creature blocks the way.' },
  chest: { name: 'Chest', icon: 'chest', desc: 'An old chest. Something useful may be inside.' },
  rest: { name: 'Rest site', icon: 'campfire', desc: 'A quiet clearing to catch your breath.' },
  goal: { name: 'The Treasure', icon: 'star', desc: 'The end of the road.' },
};
