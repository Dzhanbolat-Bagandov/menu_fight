'use strict';
/* Battle state, rules and turn loop. No DOM access here: the UI listens to
   Engine events and calls the exported functions. */

let G = null; // current battle
let battleSeq = 0;
const Engine = {
  listeners: [],
  delay: (fn, ms) => setTimeout(fn, ms), // tests can replace this with a synchronous version
  enemyDelay: 700,
};

const emit = (ev) => Engine.listeners.forEach((f) => f(ev));
function log(text, cls = '') { G.log.push({ text, cls }); emit({ type: 'log', text, cls }); }
const render = () => emit({ type: 'render' });
const sideOf = (c) => (c === G.player ? 'player' : 'enemy');
const nameOf = (c) => (c === G.player ? G.player.name : G.enemy.def.name);

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
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ---- core effects --------------------------------------------------------- */

function dealDamage(target, amount) {
  amount = Math.max(0, Math.round(amount));
  const absorbed = Math.min(target.block, amount);
  target.block -= absorbed;
  let dealt = amount - absorbed;
  if (target === G.player && G.god) dealt = 0;
  target.hp = Math.max(0, target.hp - dealt);
  emit({ type: 'damage', side: sideOf(target), dealt, absorbed });
  return { amount, dealt, absorbed };
}
const hitText = (r) => (r.amount === 0 ? 'no damage' : r.dealt === 0 ? `0 damage (${r.absorbed} blocked)` : r.absorbed ? `${r.dealt} damage (${r.absorbed} blocked)` : `${r.dealt} damage`);

function gainBlock(c, n) {
  c.block += n;
  emit({ type: 'block', side: sideOf(c), amount: n });
}

function addStatus(target, id, turns) {
  const def = STATUSES[id];
  turns = turns ?? RULES[id]?.turns ?? null;
  if (target === G.enemy && target.def.immune.includes(id)) {
    log(`${nameOf(target)} is immune to ${def.name}.`, 'status');
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
  return true;
}

function removeStatus(target, id) {
  const before = target.statuses.length;
  target.statuses = target.statuses.filter((s) => s.id !== id);
  return before !== target.statuses.length;
}

/* Burn damage, then durations count down. Called at the end of the owner's turn. */
function tickStatuses(c) {
  for (const s of c.statuses.filter((x) => x.id === 'burn')) {
    if (G.over) return;
    const r = dealDamage(c, RULES.burn.dmg);
    log(`Burn scorches ${nameOf(c)} for ${hitText(r)}.`, 'status');
    if (checkEnd()) return;
  }
  for (const s of c.statuses) if (s.turns !== null) s.turns--;
  const expired = c.statuses.filter((s) => s.turns !== null && s.turns <= 0);
  c.statuses = c.statuses.filter((s) => !expired.includes(s));
  for (const id of new Set(expired.map((s) => s.id))) {
    const n = expired.filter((s) => s.id === id).length;
    log(`${STATUSES[id].name}${n > 1 ? ` (x${n})` : ''} wears off ${nameOf(c)}.`, 'status');
  }
}

function checkEnd() {
  if (G.over) return true;
  if (G.enemy.hp <= 0) { G.over = 'won'; G.phase = 'over'; log(`${G.enemy.def.name} is defeated. Victory!`, 'win'); }
  else if (G.player.hp <= 0) { G.over = 'lost'; G.phase = 'over'; log('You have fallen. Defeat.', 'lose'); }
  else return false;
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
    id: ++battleSeq, enemyId, turn: 1, phase: 'player', over: null, god, log: [],
    player: {
      name: p.name, level: p.level, hp: p.maxHp, maxHp: p.maxHp, mana: p.maxMana, maxMana: p.maxMana,
      stamina: p.maxStamina, maxStamina: p.maxStamina, block: 0, statuses: [],
      equipment: { ...DEFAULT_EQUIPMENT },
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
}

function endTurn() {
  if (G.phase !== 'player' || G.over) return;
  const p = G.player, e = G.enemy;
  if (hasStatus(p, 'lightning')) {
    if (p.mana >= RULES.lightning.upkeep) {
      p.mana -= RULES.lightning.upkeep;
      const r = dealDamage(e, RULES.lightning.dmg + equipBonus('spellDamage'));
      log(`Lightning lashes ${e.def.name} for ${hitText(r)}.`, 'player');
    } else {
      removeStatus(p, 'lightning');
      log('Not enough mana: your Lightning Shield fizzles out.', 'status');
    }
    if (checkEnd()) return;
  }
  tickStatuses(p);
  if (checkEnd()) return;
  G.phase = 'enemy';
  render();
  const id = G.id;
  Engine.delay(() => { if (G && G.id === id && !G.over) enemyTurn(); }, Engine.enemyDelay);
}

function execMove(move) {
  const e = G.enemy, p = G.player;
  log(`${e.def.name} uses ${move.name}.`, 'enemy');
  if (move.block) { gainBlock(e, move.block); log(`${e.def.name} gains ${move.block} block.`, 'enemy'); }
  if (move.dmg) {
    const per = move.dmg * outMult(e);
    const total = { amount: 0, dealt: 0, absorbed: 0 };
    for (let i = 0; i < move.hits; i++) {
      const r = dealDamage(p, per);
      total.amount += r.amount; total.dealt += r.dealt; total.absorbed += r.absorbed;
    }
    log(`You take ${hitText(total)}.`, 'hurt');
  }
  if (move.drain) {
    const lost = Math.min(p.mana, move.drain);
    p.mana -= lost;
    log(`Your mana is drained by ${lost}.`, 'hurt');
  }
  if (move.followup) {
    e.followup = move.followup;
    log(`${e.def.name} raises its greatsword high...`, 'enemy');
  }
  e.history.push(move.id);
}

function enemyTurn() {
  const e = G.enemy;
  e.block = 0;
  const move = e.def.moves[e.intent];
  if (hasStatus(e, 'stunned')) {
    log(`${e.def.name} is stunned and loses its turn!${e.intent === 'overheadStrike' ? ' The wind-up is interrupted.' : ''}`, 'status');
  } else execMove(move);
  if (checkEnd()) return;
  tickStatuses(e);
  if (checkEnd()) return;
  chooseIntent();
  startPlayerTurn();
  render();
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

function useAction(id) {
  const check = canUse(id);
  if (!check.ok) return check;
  const a = ACTIONS[id], p = G.player, e = G.enemy, b = bonuses();
  if (id !== 'lightning') for (const [res, n] of Object.entries(a.cost)) p[res] -= n;
  switch (id) {
    case 'attack': {
      const bonus = hasStatus(e, 'staggered') ? RULES.staggered.lightBonus : 0;
      const r = dealDamage(e, 15 + b.lightDamage + bonus);
      log(`You strike ${e.def.name} for ${hitText(r)}.`, 'player');
      break;
    }
    case 'heavy': {
      const wasStaggered = hasStatus(e, 'staggered');
      const r = dealDamage(e, 25 + b.heavyDamage + e.def.heavyBonus);
      log(`You smash ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) {
        addStatus(e, 'staggered', RULES.staggered.turns);
        if (wasStaggered) addStatus(e, 'stunned', RULES.stunned.turns);
      }
      break;
    }
    case 'defend': {
      const n = 10 + b.defendBlock;
      gainBlock(p, n);
      log(`You raise your shield: +${n} block.`, 'player');
      break;
    }
    case 'fireball': {
      const r = dealDamage(e, 20 + b.spellDamage);
      log(`Your fireball hits ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) addStatus(e, 'burn');
      break;
    }
    case 'frost': {
      const r = dealDamage(e, 30 + b.spellDamage);
      log(`Your frost arrow hits ${e.def.name} for ${hitText(r)}.`, 'player');
      if (e.hp > 0) addStatus(e, 'frozen');
      break;
    }
    case 'lightning': {
      if (hasStatus(p, 'lightning')) { removeStatus(p, 'lightning'); log('Lightning Shield deactivated.', 'player'); }
      else { p.statuses.push({ id: 'lightning', turns: null }); log('Lightning Shield crackles around you.', 'player'); }
      break;
    }
  }
  checkEnd();
  render();
  return { ok: true };
}

function canUseItem(id) {
  if (G.over) return { ok: false, reason: 'The fight is over.' };
  if (G.phase !== 'player') return { ok: false, reason: 'It is not your turn.' };
  if (!G.player.items[id]) return { ok: false, reason: 'You have none left.' };
  return { ok: true };
}

function useItem(id) {
  const check = canUseItem(id);
  if (!check.ok) return check;
  const it = CONSUMABLES[id], p = G.player;
  const parts = [];
  for (const [res, n] of Object.entries(it.effect)) {
    const max = p['max' + res[0].toUpperCase() + res.slice(1)];
    const gained = Math.min(n, max - p[res]);
    p[res] += gained;
    parts.push(`${gained} ${res}`);
    if (res === 'hp') emit({ type: 'heal', side: 'player', amount: gained });
  }
  p.items[id]--;
  log(`You use ${it.name}: restored ${parts.join(', ')}.`, 'player');
  render();
  return { ok: true };
}

/* ---- equipment (used by CLI; UI menu is display-only) ----------------------- */

function equip(slot, itemId) {
  const it = EQUIPMENT[itemId];
  if (!SLOTS.some((s) => s.id === slot)) throw new Error(`Unknown slot "${slot}"`);
  if (!it) throw new Error(`Unknown item "${itemId}"`);
  if (!slotAccepts(it, slot)) throw new Error(`${it.name} does not fit in ${slot}`);
  G.player.equipment[slot] = itemId;
  render();
}
function unequip(slot) {
  if (!SLOTS.some((s) => s.id === slot)) throw new Error(`Unknown slot "${slot}"`);
  G.player.equipment[slot] = null;
  render();
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
