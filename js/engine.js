'use strict';
/* Battle state, rules and turn loop. No DOM access here: the UI listens to
   Engine events and calls the exported functions.
   Actions run as timed step sequences (runSeq) so hits, ticks and statuses
   land one after another and the UI can animate and play sounds per step. */

let G = null; // current battle
let battleSeq = 0;
const Engine = {
  listeners: [],
  delay: (fn, ms) => setTimeout(fn, ms), // tests can replace this with a synchronous version
};

/* Step timings in ms. */
const T = {
  impact: 170,    // melee lunge -> hit lands
  spell: 340,     // cast -> projectile lands
  hitGap: 330,    // between hits of a multi-hit move
  short: 250,     // small beat between steps
  tick: 420,      // between status ticks
  enemyStart: 550,
  endTurn: 450,
};

const emit = (ev) => Engine.listeners.forEach((f) => f(ev));
function log(text, cls = '') { G.log.push({ text, cls }); emit({ type: 'log', text, cls }); }
const render = () => emit({ type: 'render' });
const sideOf = (c) => (c === G.player ? 'player' : 'enemy');
const nameOf = (c) => (c === G.player ? G.player.name : G.enemy.def.name);

/* ---- step sequencer ---------------------------------------------------------- */

/* steps: [[waitMs, fn], ...]. A step fn may return more steps, which run next.
   Sequences stop when the battle ends or is replaced (restart/spawn). */
function runSeq(steps) {
  const id = G.id;
  let i = 0;
  G.busy = true;
  const next = () => {
    if (!G || G.id !== id) return;
    if (G.over || i >= steps.length) { G.busy = false; render(); return; }
    const [wait, fn] = steps[i++];
    Engine.delay(() => {
      if (!G || G.id !== id) return;
      if (G.over) { G.busy = false; render(); return; }
      const more = fn();
      if (Array.isArray(more)) steps.splice(i, 0, ...more);
      render();
      next();
    }, wait);
  };
  next();
}

/* ---- helpers --------------------------------------------------------------- */

function equipBonus(key, p = G.player) {
  let sum = 0;
  for (const id of Object.values(p.equipment)) if (id) sum += EQUIPMENT[id].bonus[key] || 0;
  return sum;
}
function bonuses() {
  return { lightDamage: equipBonus('lightDamage'), heavyDamage: equipBonus('heavyDamage'), defendBlock: equipBonus('defendBlock'), spellDamage: equipBonus('spellDamage') };
}
const hasStatus = (c, id) => c.statuses.some((s) => s.id === id);
const getStatus = (c, id) => c.statuses.find((s) => s.id === id);
function outMult(c) {
  let m = 1;
  if (hasStatus(c, 'staggered')) m *= RULES.staggered.dmgMult;
  if (hasStatus(c, 'frozen')) m *= RULES.frozen.dmgMult;
  return m;
}

/* ---- core effects --------------------------------------------------------- */

/* kind: light | heavy | fire | frost | lightning | burn | raw */
function dealDamage(target, amount, kind = 'raw') {
  amount = Math.max(0, Math.round(amount));
  const hadBlock = target.block > 0;
  const absorbed = Math.min(target.block, amount);
  target.block -= absorbed;
  let dealt = amount - absorbed;
  if (target === G.player && G.god) dealt = 0;
  target.hp = Math.max(0, target.hp - dealt);
  const broke = hadBlock && target.block === 0;
  emit({ type: 'damage', side: sideOf(target), kind, dealt, absorbed, broke });
  return { amount, dealt, absorbed, broke };
}
const hitText = (r) => (r.amount === 0 ? 'no damage' : r.dealt === 0 ? `0 damage (${r.absorbed} blocked)` : r.absorbed ? `${r.dealt} damage (${r.absorbed} blocked)` : `${r.dealt} damage`);

function gainBlock(c, n) {
  c.block += n;
  emit({ type: 'block', side: sideOf(c), amount: n });
}

/* style: melee | heavy | cast | windup | guard; element: fire | frost | chill (for casts) */
const act = (side, style, element) => emit({ type: 'act', side, style, element });

function addStatus(target, id, turns) {
  const def = STATUSES[id];
  turns = turns ?? RULES[id]?.turns ?? null;
  if (target === G.enemy && target.def.immune.includes(id)) {
    log(`${nameOf(target)} is immune to ${def.name}.`, 'status');
    emit({ type: 'status', side: sideOf(target), id, op: 'immune' });
    return false;
  }
  if (id === 'burn') {
    const stacks = target.statuses.filter((s) => s.id === 'burn');
    if (stacks.length >= RULES.burn.maxStacks) target.statuses.splice(target.statuses.indexOf(stacks[0]), 1);
    target.statuses.push({ id, turns });
  } else {
    const ex = getStatus(target, id);
    if (ex) ex.turns = ex.turns === null ? null : Math.max(ex.turns, turns);
    else target.statuses.push({ id, turns });
  }
  log(`${nameOf(target)} is ${id === 'burn' ? 'burning' : def.name}.`, 'status');
  emit({ type: 'status', side: sideOf(target), id, op: 'add' });
  return true;
}

function removeStatus(target, id) {
  const before = target.statuses.length;
  target.statuses = target.statuses.filter((s) => s.id !== id);
  const removed = before !== target.statuses.length;
  if (removed) emit({ type: 'status', side: sideOf(target), id, op: 'remove' });
  return removed;
}

/* End of the owner's turn: each burn stack ticks as its own step, then durations count down. */
function tickSteps(c) {
  const steps = c.statuses.filter((x) => x.id === 'burn').map(() => [T.tick, () => {
    const r = dealDamage(c, RULES.burn.dmg, 'burn');
    log(`Burn scorches ${nameOf(c)} for ${hitText(r)}.`, 'status');
    checkEnd();
  }]);
  steps.push([steps.length ? T.short : 0, () => {
    for (const s of c.statuses) if (s.turns !== null) s.turns--;
    const expired = c.statuses.filter((s) => s.turns !== null && s.turns <= 0);
    c.statuses = c.statuses.filter((s) => !expired.includes(s));
    for (const id of new Set(expired.map((s) => s.id))) {
      const n = expired.filter((s) => s.id === id).length;
      log(`${STATUSES[id].name}${n > 1 ? ` (x${n})` : ''} wears off ${nameOf(c)}.`, 'status');
      emit({ type: 'status', side: sideOf(c), id, op: 'expire' });
    }
  }]);
  return steps;
}

function checkEnd() {
  if (G.over) return true;
  if (G.enemy.hp <= 0) { G.over = 'won'; G.phase = 'over'; log(`${G.enemy.def.name} is defeated. Victory!`, 'win'); }
  else if (G.player.hp <= 0) { G.over = 'lost'; G.phase = 'over'; log('You have fallen. Defeat.', 'lose'); }
  else return false;
  emit({ type: 'end', result: G.over });
  render();
  return true;
}

/* ---- battle lifecycle ------------------------------------------------------ */

function newBattle(enemyId = 'grubnik') {
  const def = ENEMIES[enemyId];
  if (!def) throw new Error(`Unknown enemy "${enemyId}"`);
  const p = RULES.player;
  const god = G ? G.god : false;
  G = {
    id: ++battleSeq, enemyId, turn: 1, phase: 'player', over: null, busy: false, god, log: [],
    player: {
      name: p.name, level: p.level, hp: p.maxHp, maxHp: p.maxHp, mana: p.maxMana, maxMana: p.maxMana,
      stamina: p.maxStamina, maxStamina: p.maxStamina, block: 0, statuses: [],
      equipment: { ...DEFAULT_EQUIPMENT },
      backpack: [...DEFAULT_BACKPACK],
      quickbar: [...DEFAULT_QUICKBAR],
      items: Object.fromEntries(Object.entries(CONSUMABLES).map(([k, v]) => [k, v.count])),
    },
    enemy: { def, hp: def.maxHp, maxHp: def.maxHp, block: 0, statuses: [], intent: null, history: [], followup: null },
  };
  log(`${def.name} (Lv ${def.level}) bars your way.`, 'sys');
  chooseIntent();
  log('Turn 1', 'turn');
  emit({ type: 'new' });
}

function chooseIntent() {
  const e = G.enemy;
  if (e.followup) { e.intent = e.followup; e.followup = null; }
  else e.intent = e.def.chooseMove(e, G.player);
}

function startPlayerTurn() {
  const p = G.player;
  G.turn++;
  p.block = 0;
  p.mana = Math.min(p.maxMana, p.mana + RULES.player.manaRegen);
  p.stamina = Math.min(p.maxStamina, p.stamina + RULES.player.staminaRegen);
  G.phase = 'player';
  log(`Turn ${G.turn}`, 'turn');
  emit({ type: 'turn', side: 'player' });
}

function endTurn() {
  if (G.phase !== 'player' || G.over || G.busy) return;
  const p = G.player;
  G.phase = 'enemy';
  const steps = [];
  if (hasStatus(p, 'lightning')) {
    steps.push([T.short, () => {
      if (p.mana >= RULES.lightning.upkeep) {
        p.mana -= RULES.lightning.upkeep;
        const r = dealDamage(G.enemy, RULES.lightning.dmg + equipBonus('spellDamage'), 'lightning');
        log(`Lightning lashes ${G.enemy.def.name} for ${hitText(r)}.`, 'player');
        checkEnd();
      } else {
        removeStatus(p, 'lightning');
        log('Not enough mana: your Lightning Shield fizzles out.', 'status');
      }
    }]);
  }
  steps.push([0, () => tickSteps(p)]);
  steps.push([T.enemyStart, enemyTurn]);
  runSeq(steps);
}

function moveSteps(move) {
  const e = G.enemy, p = G.player;
  const steps = [[0, () => { log(`${e.def.name} uses ${move.name}.`, 'enemy'); e.history.push(move.id); }]];
  if (move.block) {
    steps.push([T.short, () => { act('enemy', 'guard'); gainBlock(e, move.block); log(`${e.def.name} gains ${move.block} block.`, 'enemy'); }]);
  }
  if (move.dmg) {
    const kind = move.kind || 'light';
    for (let i = 0; i < move.hits; i++) {
      steps.push([i ? T.hitGap : T.short, () => act('enemy', move.cast ? 'cast' : kind === 'heavy' ? 'heavy' : 'melee', move.cast ? 'chill' : undefined)]);
      steps.push([move.cast ? T.spell : T.impact, () => {
        const r = dealDamage(p, move.dmg * outMult(e), kind);
        log(`${move.hits > 1 ? `Hit ${i + 1}: y` : 'Y'}ou take ${hitText(r)}.`, 'hurt');
        checkEnd();
      }]);
    }
  }
  if (move.drain) {
    steps.push([T.short, () => {
      const lost = Math.min(p.mana, move.drain);
      p.mana -= lost;
      log(`Your mana is drained by ${lost}.`, 'hurt');
      emit({ type: 'drain', side: 'player', amount: lost });
    }]);
  }
  if (move.followup) {
    steps.push([T.short, () => {
      e.followup = move.followup;
      act('enemy', 'windup');
      log(`${e.def.name} raises its greatsword high...`, 'enemy');
    }]);
  }
  return steps;
}

function enemyTurn() {
  const e = G.enemy;
  e.block = 0;
  const steps = [];
  if (hasStatus(e, 'stunned')) {
    log(`${e.def.name} is stunned and loses its turn!${e.intent === 'overheadStrike' ? ' The wind-up is interrupted.' : ''}`, 'status');
    emit({ type: 'stunSkip', side: 'enemy' });
  } else steps.push(...moveSteps(e.def.moves[e.intent]));
  steps.push([T.short, () => tickSteps(e)]);
  steps.push([T.endTurn, () => { chooseIntent(); startPlayerTurn(); }]);
  return steps;
}

/* ---- player actions -------------------------------------------------------- */

function canUse(id) {
  const a = ACTIONS[id];
  if (G.over) return { ok: false, reason: 'The fight is over.' };
  if (G.phase !== 'player') return { ok: false, reason: 'It is not your turn.' };
  if (id === 'lightning' && hasStatus(G.player, 'lightning')) return { ok: true };
  for (const [res, n] of Object.entries(a.cost)) {
    if (G.player[res] < n) return { ok: false, reason: `Not enough ${res} (need ${n}).` };
  }
  return { ok: true };
}

function actionSteps(id) {
  const p = G.player, e = G.enemy, b = bonuses();
  switch (id) {
    case 'attack': return [[0, () => act('player', 'melee')], [T.impact, () => {
      const bonus = hasStatus(e, 'staggered') ? RULES.staggered.lightBonus : 0;
      const r = dealDamage(e, 15 + b.lightDamage + bonus, 'light');
      log(`You strike ${e.def.name} for ${hitText(r)}.`, 'player');
    }]];
    case 'heavy': return [[0, () => act('player', 'heavy')], [T.impact, () => {
      const wasStaggered = hasStatus(e, 'staggered');
      const r = dealDamage(e, 25 + b.heavyDamage + e.def.heavyBonus, 'heavy');
      log(`You smash ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) {
        addStatus(e, 'staggered', RULES.staggered.turns);
        if (wasStaggered) addStatus(e, 'stunned', RULES.stunned.turns);
      }
    }]];
    case 'defend': return [[0, () => {
      const n = 10 + b.defendBlock;
      act('player', 'guard');
      gainBlock(p, n);
      log(`You raise your shield: +${n} block.`, 'player');
    }]];
    case 'fireball': return [[0, () => act('player', 'cast', 'fire')], [T.spell, () => {
      const r = dealDamage(e, 20 + b.spellDamage, 'fire');
      log(`Your fireball hits ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) addStatus(e, 'burn');
    }]];
    case 'frost': return [[0, () => act('player', 'cast', 'frost')], [T.spell, () => {
      const r = dealDamage(e, 30 + b.spellDamage, 'frost');
      log(`Your frost arrow hits ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) addStatus(e, 'frozen');
    }]];
    case 'lightning': return [[0, () => {
      if (hasStatus(p, 'lightning')) { removeStatus(p, 'lightning'); log('Lightning Shield deactivated.', 'player'); }
      else { p.statuses.push({ id: 'lightning', turns: null }); emit({ type: 'status', side: 'player', id: 'lightning', op: 'add' }); log('Lightning Shield crackles around you.', 'player'); }
    }]];
  }
  return [];
}

function useAction(id) {
  if (G.busy) return { ok: false, reason: 'busy' };
  const check = canUse(id);
  if (!check.ok) return check;
  const a = ACTIONS[id];
  if (id !== 'lightning') for (const [res, n] of Object.entries(a.cost)) G.player[res] -= n;
  render();
  runSeq([...actionSteps(id), [0, checkEnd]]);
  return { ok: true };
}

function canUseItem(id) {
  if (G.over) return { ok: false, reason: 'The fight is over.' };
  if (G.phase !== 'player') return { ok: false, reason: 'It is not your turn.' };
  if (!G.player.items[id]) return { ok: false, reason: 'You have none left.' };
  return { ok: true };
}

function useItem(id) {
  if (G.busy) return { ok: false, reason: 'busy' };
  const check = canUseItem(id);
  if (!check.ok) return check;
  const it = CONSUMABLES[id], p = G.player;
  const parts = [];
  for (const [res, n] of Object.entries(it.effect)) {
    const max = p['max' + res[0].toUpperCase() + res.slice(1)];
    const gained = Math.min(n, max - p[res]);
    p[res] += gained;
    parts.push(`${gained} ${res}`);
    emit({ type: 'restore', side: 'player', res, amount: gained });
  }
  p.items[id]--;
  emit({ type: 'item', side: 'player', id });
  log(`You use ${it.name}: restored ${parts.join(', ')}.`, 'player');
  render();
  return { ok: true };
}

/* ---- equipment & backpack ----------------------------------------------------- */

function canChangeGear() {
  if (G.phase === 'enemy' || G.busy) return { ok: false, reason: 'Wait for the enemy to finish its turn.' };
  return { ok: true };
}
const slotLabel = (slot) => SLOTS.find((s) => s.id === slot).label;
/* Slot an item goes into by default: its own slot, or the first free ring slot. */
function targetSlot(itemId) {
  const it = EQUIPMENT[itemId];
  if (it.slot !== 'ring') return it.slot;
  return ['ring1', 'ring2'].find((s) => !G.player.equipment[s]) || 'ring1';
}

/* Equip an item from the backpack (or, for the CLI, conjure one). The replaced item goes to the backpack. */
function equip(itemId, slot, { conjure = false } = {}) {
  const p = G.player, it = EQUIPMENT[itemId];
  if (!it) throw new Error(`Unknown item "${itemId}"`);
  slot = slot || targetSlot(itemId);
  if (!SLOTS.some((s) => s.id === slot)) throw new Error(`Unknown slot "${slot}"`);
  if (!slotAccepts(it, slot)) throw new Error(`${it.name} does not fit in ${slotLabel(slot)}`);
  const idx = p.backpack.indexOf(itemId);
  if (idx < 0 && !conjure) throw new Error(`${it.name} is not in your backpack`);
  if (idx >= 0) p.backpack.splice(idx, 1);
  const prev = p.equipment[slot];
  if (prev) p.backpack.push(prev);
  p.equipment[slot] = itemId;
  log(`You equip ${it.name}${prev ? ` (replacing ${EQUIPMENT[prev].name})` : ''}.`, 'player');
  emit({ type: 'equip', side: 'player', id: itemId });
  render();
}
function unequip(slot) {
  if (!SLOTS.some((s) => s.id === slot)) throw new Error(`Unknown slot "${slot}"`);
  const p = G.player, prev = p.equipment[slot];
  if (!prev) return;
  p.equipment[slot] = null;
  p.backpack.push(prev);
  log(`You stow ${EQUIPMENT[prev].name} in your backpack.`, 'player');
  emit({ type: 'unequip', side: 'player', id: prev });
  render();
}
/* Pin or unpin a consumable on the action bar. */
function toggleQuick(id) {
  const q = G.player.quickbar;
  if (!CONSUMABLES[id]) throw new Error(`Unknown item "${id}"`);
  if (q.includes(id)) q.splice(q.indexOf(id), 1);
  else if (q.length >= QUICKBAR_MAX) return { ok: false, reason: `The action bar holds at most ${QUICKBAR_MAX} items.` };
  else q.push(id);
  render();
  return { ok: true };
}

/* ---- intent preview (what the enemy will do, with current debuffs) ---------- */

function describeMove(move, mult = 1) {
  const parts = [];
  if (move.dmg) {
    const per = Math.round(move.dmg * mult);
    parts.push(move.hits > 1 ? `${move.hits} x ${per} damage` : `${per} damage`);
  }
  if (move.block) parts.push(`+${move.block} block`);
  if (move.drain) parts.push(`drains ${move.drain} mana`);
  if (move.followup) parts.push('winding up a heavy blow');
  return parts.join(', ');
}
