'use strict';
/* Everything that touches the DOM. State comes from G (engine.js); render() redraws from it. */

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
const ucfirst = (s) => s[0].toUpperCase() + s.slice(1);

/* ---- icon tile component ----------------------------------------------------- */

/* opts: icon, tint, badge, badgeClass, count, key, disabled, tip (() => tooltip data), onclick, pressed, empty */
function iconTile(o) {
  const b = el(o.onclick ? 'button' : 'div', `tile tint-${o.tint || 'steel'}${o.disabled ? ' disabled' : ''}${o.pressed ? ' pressed' : ''}${o.empty ? ' empty' : ''}${o.size ? ' ' + o.size : ''}`);
  if (o.onclick) { b.type = 'button'; b.addEventListener('click', o.onclick); }
  b.innerHTML = iconSVG(o.icon);
  if (o.badge !== undefined && o.badge !== null) b.appendChild(el('span', `badge ${o.badgeClass || ''}`, o.badge));
  if (o.count !== undefined && o.count !== null) b.appendChild(el('span', 'count', o.count));
  if (o.key) b.appendChild(el('span', 'key', o.key));
  if (o.tip) b._tip = o.tip;
  return b;
}

/* ---- tooltip ---------------------------------------------------------------------- */

const tooltip = { node: null, cur: null, x: 0, y: 0 };

function tipHTML(t) {
  const lines = (t.lines || []).map((l) => `<li>${l}</li>`).join('');
  return `<div class="tip-head"><div class="tile big tint-${t.tint || 'steel'}">${iconSVG(t.icon)}</div><div><div class="tip-name">${t.name}</div>${t.tag ? `<div class="tip-tag">${t.tag}</div>` : ''}</div></div>` +
    (lines ? `<ul class="tip-stats">${lines}</ul>` : '') + (t.desc ? `<p class="tip-desc">${t.desc}</p>` : '') + (t.warn ? `<p class="tip-warn">${t.warn}</p>` : '');
}
function positionTip() {
  const n = tooltip.node, pad = 14;
  let x = tooltip.x + pad, y = tooltip.y + pad;
  const r = n.getBoundingClientRect();
  if (x + r.width > innerWidth - 6) x = tooltip.x - r.width - pad;
  if (y + r.height > innerHeight - 6) y = innerHeight - r.height - 6;
  n.style.left = Math.max(6, x) + 'px'; n.style.top = Math.max(6, y) + 'px';
}
function showTip(target) {
  const t = target._tip();
  tooltip.cur = target;
  tooltip.node.innerHTML = tipHTML(t);
  tooltip.node.hidden = false;
  positionTip();
}
function hideTip() { tooltip.cur = null; tooltip.node.hidden = true; }
function refreshTipAfterRender() {
  const under = document.elementFromPoint(tooltip.x, tooltip.y);
  const t = under && under.closest && under.closest('.tile');
  if (t && t._tip) showTip(t); else hideTip();
}
function initTooltips() {
  tooltip.node = $('tooltip');
  document.addEventListener('mousemove', (e) => {
    tooltip.x = e.clientX; tooltip.y = e.clientY;
    const t = e.target.closest && e.target.closest('.tile');
    if (t && t._tip) { showTip(t); } else if (tooltip.cur) hideTip();
  });
  document.addEventListener('mouseleave', hideTip);
}

/* ---- tooltip content builders ----------------------------------------------------- */

function costText(a) {
  const parts = Object.entries(a.cost).map(([r, n]) => `${n} ${r}`);
  return `Cost: ${parts.join(', ')}${a.costNote ? ' ' + a.costNote : ''}`;
}
function actionTip(id) {
  return () => {
    const a = ACTIONS[id], c = canUse(id);
    const on = id === 'lightning' && hasStatus(G.player, 'lightning');
    return { icon: a.icon, tint: a.tint, name: a.name + (on ? ' (active)' : ''), tag: a.kind, lines: [costText(a), ...a.stats(bonuses())], desc: a.desc, warn: c.ok ? '' : c.reason };
  };
}
function itemTip(id) {
  return () => {
    const it = CONSUMABLES[id], c = canUseItem(id);
    const fx = Object.entries(it.effect).map(([r, n]) => `Restores ${n} ${r}`);
    return { icon: it.icon, tint: it.tint, name: it.name, tag: `Consumable · ${G.player.items[id]} left`, lines: fx, desc: it.desc, warn: c.ok ? '' : c.reason };
  };
}
function statusTip(creature, id) {
  return () => {
    const def = STATUSES[id];
    const insts = creature.statuses.filter((s) => s.id === id);
    const lines = def.stats();
    if (id === 'burn') insts.forEach((s, i) => lines.push(`Stack ${i + 1}: ${s.turns} turn${s.turns === 1 ? '' : 's'} left`));
    else if (insts[0] && insts[0].turns !== null) lines.push(`Remaining: ${insts[0].turns} turn${insts[0].turns === 1 ? '' : 's'}`);
    return { icon: def.icon, tint: def.tint, name: def.name, tag: 'Status effect', lines, desc: def.desc };
  };
}
function moveTip(move, interactive) {
  return () => ({ icon: move.icon, tint: move.tint, name: move.name, tag: interactive ? 'Enemy move' : 'Enemy intent', lines: [describeMove(move) ? ucfirst(describeMove(move)) : ''].filter(Boolean), desc: move.desc });
}
function equipTip(slot, id) {
  return () => {
    if (!id) return { icon: ({ head: 'helm', chest: 'armor', legs: 'legs', gloves: 'gloves', mainHand: 'sword', offHand: 'shield', ring1: 'ring', ring2: 'ring' })[slot.id], tint: 'steel', name: `${slot.label}: empty`, tag: 'Equipment slot', desc: 'Nothing equipped.' };
    const it = EQUIPMENT[id];
    const lines = Object.entries(it.bonus).map(([k, v]) => `+${v} ${BONUS_LABELS[k]}`);
    return { icon: it.icon, tint: it.tint, name: it.name, tag: `Equipment · ${slot.label}`, lines: lines.length ? lines : ['No bonuses'], desc: it.desc };
  };
}
const traitTip = (t) => () => ({ icon: t.icon, tint: t.tint, name: t.name, tag: 'Trait', desc: t.desc });

/* ---- render ------------------------------------------------------------------------- */

function setBar(prefix, cur, max) {
  $(`${prefix}-fill`).style.width = `${(100 * cur) / max}%`;
}
function renderBlock(node, n) {
  node.classList.toggle('on', n > 0);
  node.innerHTML = n > 0 ? `${iconSVG('block')}<span>${n}</span>` : '';
}

function renderStatuses(node, creature) {
  node.innerHTML = '';
  const ids = [...new Set(creature.statuses.map((s) => s.id))];
  if (!ids.length) { node.appendChild(el('span', 'none', 'No status effects')); return; }
  for (const id of ids) {
    const insts = creature.statuses.filter((s) => s.id === id);
    const def = STATUSES[id];
    const turns = Math.max(...insts.map((s) => s.turns ?? 0));
    node.appendChild(iconTile({
      icon: def.icon, tint: def.tint, size: 'sm',
      count: id === 'burn' ? `x${insts.length}` : null,
      badge: insts[0].turns === null ? 'ON' : turns, badgeClass: 'turns',
      tip: statusTip(creature, id),
    }));
  }
}

function renderActions() {
  const box = $('actions');
  box.innerHTML = '';
  const group = (label, cls) => { const g = el('div', 'group'); g.appendChild(el('div', 'group-label', label)); const row = el('div', 'tiles ' + (cls || '')); g.appendChild(row); box.appendChild(g); return row; };
  const row1 = group('Actions');
  const hot = [];
  ACTION_ORDER.forEach((id, i) => {
    const a = ACTIONS[id], c = canUse(id), key = String(i + 1);
    hot.push(id);
    const costs = Object.entries(a.cost).map(([r, n]) => n + (r === 'mana' ? 'M' : 'S')).join(' ');
    row1.appendChild(iconTile({
      icon: a.icon, tint: a.tint, disabled: !c.ok, key,
      pressed: id === 'lightning' && hasStatus(G.player, 'lightning'),
      badge: costs, badgeClass: Object.keys(a.cost)[0],
      tip: actionTip(id), onclick: () => { useAction(id); },
    }));
  });
  const row2 = group('Items');
  ITEM_ORDER.forEach((id, i) => {
    const it = CONSUMABLES[id], c = canUseItem(id);
    row2.appendChild(iconTile({ icon: it.icon, tint: it.tint, disabled: !c.ok, key: String(7 + i), count: G.player.items[id], tip: itemTip(id), onclick: () => { useItem(id); } }));
  });
  const foot = el('div', 'foot-btns');
  const eq = el('button', 'btn', `${iconSVG('armor', 'mini')} Equipment`); eq.type = 'button'; eq.addEventListener('click', openEquipment);
  const et = el('button', 'btn primary', `${iconSVG('hourglass', 'mini')} End Turn <kbd>E</kbd>`); et.type = 'button';
  et.disabled = G.phase !== 'player'; et.addEventListener('click', () => endTurn());
  foot.append(eq, et);
  box.appendChild(foot);
}

function renderIntent() {
  const box = $('intent'), e = G.enemy;
  box.innerHTML = '';
  if (G.over) { box.appendChild(el('div', 'intent-none', G.over === 'won' ? 'Defeated' : 'Victorious')); return; }
  const move = e.def.moves[e.intent];
  const stunned = hasStatus(e, 'stunned');
  const mult = outMult(e);
  const reduced = mult < 1 && (move.dmg);
  box.appendChild(el('div', 'intent-label', 'Next move'));
  const line = el('div', 'intent-line');
  line.appendChild(iconTile({ icon: move.icon, tint: move.tint, size: 'lg', tip: moveTip(move, false) }));
  const txt = el('div', 'intent-text');
  const name = el('div', 'intent-name', move.name + (e.intent === 'overheadStrike' ? ' <small>(strike)</small>' : move.followup ? ' <small>(wind-up)</small>' : ''));
  const sum = describeMove(move, mult);
  const detail = el('div', 'intent-detail', (stunned ? '<s>' : '') + ucfirst(sum || '...') + (stunned ? '</s> <b class="stunned-note">stunned!</b>' : ''));
  txt.append(name, detail);
  if (reduced && !stunned) txt.appendChild(el('div', 'intent-note', `Weakened by ${pct(mult)}%`));
  line.appendChild(txt);
  box.appendChild(line);
}

function renderMovesPopup() {
  const pop = $('moves-pop');
  pop.innerHTML = '<div class="pop-title">Known moves</div>';
  const e = G.enemy.def;
  for (const m of Object.values(e.moves)) {
    if (m.hidden) continue;
    const row = el('div', 'move-row');
    row.appendChild(iconTile({ icon: m.icon, tint: m.tint, size: 'sm', tip: moveTip(m, true) }));
    row.appendChild(el('div', 'move-text', `<b>${m.name}</b><span>${m.desc}</span>`));
    pop.appendChild(row);
  }
  if (e.traits) {
    pop.appendChild(el('div', 'pop-title', 'Traits'));
    for (const t of e.traits) {
      const row = el('div', 'move-row');
      row.appendChild(iconTile({ icon: t.icon, tint: t.tint, size: 'sm', tip: traitTip(t) }));
      row.appendChild(el('div', 'move-text', `<b>${t.name}</b><span>${t.desc}</span>`));
      pop.appendChild(row);
    }
  }
}

function renderAll() {
  const p = G.player, e = G.enemy;
  $('p-name').textContent = p.name; $('p-lv').textContent = `Lv ${p.level}`;
  $('e-name').textContent = e.def.name; $('e-lv').textContent = `Lv ${e.def.level}`;
  $('e-blurb').textContent = e.def.blurb;
  if ($('p-sprite').dataset.s !== 'knight') { $('p-sprite').innerHTML = SPRITES.knight; $('p-sprite').dataset.s = 'knight'; }
  if ($('e-sprite').dataset.s !== e.def.sprite) { $('e-sprite').innerHTML = spriteFor(e.def.sprite); $('e-sprite').dataset.s = e.def.sprite; renderMovesPopup(); }
  setBar('p-hp', p.hp, p.maxHp); setBar('p-mana', p.mana, p.maxMana); setBar('p-stam', p.stamina, p.maxStamina); setBar('e-hp', e.hp, e.maxHp);
  $('p-hp-txt').textContent = `${p.hp} / ${p.maxHp}`; $('p-mana-txt').textContent = `${p.mana} / ${p.maxMana}`; $('p-stam-txt').textContent = `${p.stamina} / ${p.maxStamina}`;
  $('e-hp-txt').textContent = `${e.hp} / ${e.maxHp}`;
  renderBlock($('p-block'), p.block); renderBlock($('e-block'), e.block);
  renderStatuses($('p-status'), p); renderStatuses($('e-status'), e);
  renderActions(); renderIntent();
  const b = $('banner');
  b.hidden = !G.over;
  if (G.over) { $('banner-title').textContent = G.over === 'won' ? 'Victory!' : 'Defeat'; $('banner-sub').textContent = G.over === 'won' ? `${e.def.name} lies broken at your feet.` : 'Your journey ends here... for now.'; }
  $('app').classList.toggle('enemy-turn', G.phase === 'enemy');
  refreshTipAfterRender();
}

/* ---- combat log ---------------------------------------------------------------------- */

function appendLog(text, cls) {
  const box = $('log');
  const line = el('div', 'line ' + (cls || ''));
  line.textContent = text;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}
function rebuildLog() { $('log').innerHTML = ''; G.log.forEach((l) => appendLog(l.text, l.cls)); }

/* ---- floating numbers & hit flash ------------------------------------------------------ */

function floatText(side, text, cls) {
  const host = $(side === 'player' ? 'p-floats' : 'e-floats');
  const f = el('span', 'float ' + cls, text);
  f.style.left = 35 + Math.random() * 30 + '%';
  host.appendChild(f);
  setTimeout(() => f.remove(), 1300);
}
function flash(side) {
  const s = $(side === 'player' ? 'p-sprite' : 'e-sprite');
  s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit');
}

/* ---- equipment modal (display-only) ------------------------------------------------------ */

function closeModal() { $('modal').hidden = true; hideTip(); }
function openEquipment() {
  const card = $('modal-card');
  card.innerHTML = '<h3>Equipment</h3>';
  const grid = el('div', 'doll');
  const layout = [[null, 'head', null], ['mainHand', 'chest', 'offHand'], ['gloves', 'legs', null], ['ring1', null, 'ring2']];
  for (const row of layout) for (const sid of row) {
    const cell = el('div', 'doll-cell');
    if (sid) {
      const slot = SLOTS.find((s) => s.id === sid), id = G.player.equipment[sid];
      const iconName = id ? EQUIPMENT[id].icon : ({ head: 'helm', chest: 'armor', legs: 'legs', gloves: 'gloves', mainHand: 'sword', offHand: 'shield', ring1: 'ring', ring2: 'ring' })[sid];
      cell.appendChild(iconTile({ icon: iconName, tint: id ? EQUIPMENT[id].tint : 'steel', empty: !id, size: 'lg', tip: equipTip(slot, id) }));
      cell.appendChild(el('div', 'slot-label', slot.label));
    }
    grid.appendChild(cell);
  }
  card.appendChild(grid);
  const totals = bonuses();
  const lines = Object.entries(totals).filter(([, v]) => v).map(([k, v]) => `<li><span>${BONUS_LABELS[k]}</span><b>+${v}</b></li>`).join('');
  card.appendChild(el('div', 'totals', `<h4>Total bonuses</h4><ul>${lines || '<li><span>None</span></li>'}</ul>`));
  const close = el('button', 'btn', 'Close'); close.type = 'button'; close.addEventListener('click', closeModal);
  card.appendChild(close);
  $('modal').hidden = false;
}

/* ---- wiring --------------------------------------------------------------------------- */

function initUI() {
  initTooltips();
  Engine.listeners.push((ev) => {
    switch (ev.type) {
      case 'log': appendLog(ev.text, ev.cls); break;
      case 'new': rebuildLog(); renderAll(); break;
      case 'render': renderAll(); break;
      case 'damage':
        if (ev.dealt > 0) { floatText(ev.side, `-${ev.dealt}`, 'dmg'); flash(ev.side); }
        if (ev.absorbed > 0) floatText(ev.side, `${ev.absorbed} blocked`, 'blocked');
        break;
      case 'heal': if (ev.amount) floatText(ev.side, `+${ev.amount}`, 'heal'); break;
      case 'block': floatText(ev.side, `+${ev.amount} block`, 'blocked'); break;
    }
  });
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
  $('banner-restart').addEventListener('click', () => newBattle(G.enemyId));

  const wrap = document.querySelector('.moves-wrap'), pop = $('moves-pop'), btn = $('moves-btn');
  let pinned = false;
  const setPop = (v) => { pop.hidden = !v; };
  wrap.addEventListener('mouseenter', () => setPop(true));
  wrap.addEventListener('mouseleave', () => { if (!pinned) setPop(false); });
  btn.addEventListener('click', () => { pinned = !pinned; setPop(pinned); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); pinned = false; setPop(false); return; }
    if (e.target.tagName === 'INPUT' || !$('modal').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'e' || e.key === 'E') endTurn();
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 6) useAction(ACTION_ORDER[n - 1]);
    else if (n >= 7 && n <= 9) useItem(ITEM_ORDER[n - 7]);
  });
}
initUI();
