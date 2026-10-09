'use strict';
/* Everything that touches the DOM. State comes from G (engine.js); render() redraws from it. */

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
const ucfirst = (s) => s[0].toUpperCase() + s.slice(1);

/* ---- icon tile component ----------------------------------------------------- */

/* opts: icon, tint, badge, badgeClass, count, key, disabled, tip (() => tooltip data), onclick, pressed, empty */
function iconTile(o) {
  const b = el(o.onclick ? 'button' : 'div', `tile tint-${o.tint || 'steel'}${o.disabled ? ' disabled' : ''}${o.pressed ? ' pressed' : ''}${o.empty ? ' empty' : ''}${o.size ? ' ' + o.size : ''}${o.cls ? ' ' + o.cls : ''}`);
  if (o.onclick) { b.type = 'button'; b.addEventListener('click', o.onclick); }
  b.innerHTML = iconSVG(o.icon);
  if (o.badge !== undefined && o.badge !== null) b.appendChild(el('span', `badge ${o.badgeClass || ''}`, o.badge));
  if (o.count !== undefined && o.count !== null) b.appendChild(el('span', 'count', o.count));
  if (o.key) b.appendChild(el('span', 'key', o.key));
  if (o.mark) b.appendChild(el('span', 'mark', o.mark));
  if (o.label) b.setAttribute('aria-label', o.label);
  if (o.tip) b._tip = o.tip;
  return b;
}

/* ---- tooltip ---------------------------------------------------------------------- */

const tooltip = { node: null, cur: null, x: 0, y: 0 };

function tipHTML(t) {
  const lines = (t.lines || []).map((l) => `<li>${l}</li>`).join('');
  return `<div class="tip-head"><div class="tile big tint-${t.tint || 'steel'}">${iconSVG(t.icon)}</div><div><div class="tip-name">${t.name}</div>${t.tag ? `<div class="tip-tag">${t.tag}</div>` : ''}</div></div>` +
    (lines ? `<ul class="tip-stats">${lines}</ul>` : '') + (t.desc ? `<p class="tip-desc">${t.desc}</p>` : '') + (t.hint ? `<p class="tip-hint">${t.hint}</p>` : '') + (t.warn ? `<p class="tip-warn">${t.warn}</p>` : '');
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
function itemTip(id, inBackpack) {
  return () => {
    const it = CONSUMABLES[id], c = canUseItem(id);
    const fx = Object.entries(it.effect).map(([r, n]) => `Restores ${n} ${r}`);
    const pinned = G.player.quickbar.includes(id);
    return {
      icon: it.icon, tint: it.tint, name: it.name, tag: `Consumable · ${G.player.items[id] || 0} left`, lines: fx, desc: it.desc,
      hint: inBackpack ? (pinned ? 'Pinned to the action bar. Click to unpin.' : 'Click to pin to the action bar.') : '',
      warn: inBackpack ? '' : c.ok ? '' : c.reason,
    };
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
const SLOT_ICONS = { head: 'helm', chest: 'armor', legs: 'legs', gloves: 'gloves', mainHand: 'sword', offHand: 'shield', ring1: 'ring', ring2: 'ring' };
const bonusLines = (it) => { const l = Object.entries(it.bonus).map(([k, v]) => `+${v} ${BONUS_LABELS[k]}`); return l.length ? l : ['No bonuses']; };
/* slot: equipped slot id, or null for an item in the backpack */
function equipTip(slotId, id) {
  return () => {
    const gear = canChangeGear();
    if (!id) { const slot = SLOTS.find((s) => s.id === slotId); return { icon: SLOT_ICONS[slotId], tint: 'steel', name: `${slot.label}: empty`, tag: 'Equipment slot', desc: 'Nothing equipped. Click gear in your backpack to equip it.' }; }
    const it = EQUIPMENT[id];
    if (slotId) return { icon: it.icon, tint: it.tint, name: it.name, tag: `Equipped · ${slotLabel(slotId)}`, lines: bonusLines(it), desc: it.desc, hint: 'Click to move it to your backpack.', warn: gear.ok ? '' : gear.reason };
    const target = targetSlot(id), prev = G.player.equipment[target];
    return { icon: it.icon, tint: it.tint, name: it.name, tag: `Backpack · ${slotLabel(target)}`, lines: bonusLines(it), desc: it.desc, hint: `Click to equip${prev ? ` (replaces ${EQUIPMENT[prev].name})` : ''}.`, warn: gear.ok ? '' : gear.reason };
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

/* The action bar shows one page at a time: 'actions' or 'items' (pinned consumables). */
const UI_STATE = { bar: 'actions' };
function barEntries() {
  if (UI_STATE.bar === 'actions') {
    return ACTION_ORDER.map((id) => {
      const a = ACTIONS[id], c = canUse(id);
      const costs = Object.entries(a.cost).map(([r, n]) => n + (r === 'mana' ? 'M' : 'S')).join(' ');
      return { icon: a.icon, tint: a.tint, disabled: !c.ok, pressed: id === 'lightning' && hasStatus(G.player, 'lightning'), badge: costs, badgeClass: Object.keys(a.cost)[0], tip: actionTip(id), run: () => useAction(id) };
    });
  }
  return G.player.quickbar.map((id) => {
    const it = CONSUMABLES[id], c = canUseItem(id);
    return { icon: it.icon, tint: it.tint, disabled: !c.ok, count: G.player.items[id] || 0, tip: itemTip(id, false), run: () => useItem(id) };
  });
}
function fillPage(page) {
  page.innerHTML = '';
  const entries = barEntries();
  entries.forEach((e, i) => page.appendChild(iconTile({ ...e, key: i < 9 ? String(i + 1) : '', onclick: e.run })));
  if (!entries.length) page.appendChild(el('div', 'bar-empty', 'No items pinned. Open the backpack to pin consumables here.'));
}
function renderToggle() {
  const t = $('bar-toggle');
  const toItems = UI_STATE.bar === 'actions';
  t.innerHTML = '';
  t.appendChild(iconTile({
    icon: toItems ? 'flask_red' : 'sword', tint: 'bronze', cls: 'toggle-tile', key: 'Q', mark: iconSVG('swap'),
    label: toItems ? 'Show items' : 'Show actions', onclick: switchBar,
    tip: () => ({ icon: 'swap', tint: 'bronze', name: toItems ? 'Show items' : 'Show actions', tag: 'Action bar', desc: toItems ? 'Swap the bar to your pinned consumables.' : 'Swap the bar back to your actions.', hint: 'Hotkey: Q' }),
  }));
}
function renderActions() {
  renderToggle();
  fillPage($('bar-viewport').querySelector('.bar-page.current'));
  const et = $('end-turn');
  et.innerHTML = `${iconSVG('hourglass', 'mini')}<span>End Turn</span><kbd>E</kbd>`;
  et.disabled = G.phase !== 'player' || !!G.over;
}
function switchBar() {
  UI_STATE.bar = UI_STATE.bar === 'actions' ? 'items' : 'actions';
  const vp = $('bar-viewport'), old = vp.querySelector('.bar-page.current');
  const page = el('div', 'bar-page current');
  fillPage(page);
  vp.appendChild(page);
  if (old) {
    old.classList.remove('current');
    const out = old.animate ? old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' }) : null;
    if (out) out.onfinish = () => old.remove(); else old.remove();
  }
  const dir = UI_STATE.bar === 'items' ? 1 : -1;
  if (page.animate) page.animate([{ opacity: 0, transform: `translateX(${dir * 70}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 60, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
  Sfx.play('page');
  renderToggle();
  refreshTipAfterRender();
}

function renderIntent() {
  const box = $('intent'), e = G.enemy;
  box.innerHTML = '';
  if (G.over) { box.appendChild(el('div', 'intent-none', G.over === 'won' ? 'Defeated' : 'Victorious')); return; }
  const move = e.def.moves[e.intent];
  const stunned = hasStatus(e, 'stunned');
  const mult = outMult(e);
  const reduced = mult < 1 && (move.dmg);
  const line = el('div', 'intent-line');
  line.appendChild(iconTile({ icon: move.icon, tint: move.tint, tip: moveTip(move, false) }));
  const txt = el('div', 'intent-text');
  const name = el('div', 'intent-name', move.name + (e.intent === 'overheadStrike' ? ' <small>(strike)</small>' : move.followup ? ' <small>(wind-up)</small>' : ''));
  const sum = describeMove(move, mult);
  const detail = el('div', 'intent-detail', (stunned ? '<s>' : '') + ucfirst(sum || '...') + (stunned ? '</s> <b class="stunned-note">stunned!</b>' : ''));
  txt.append(el('div', 'intent-label', 'Next move'), name, detail);
  if (reduced && !stunned) txt.appendChild(el('div', 'intent-note', `Weakened by ${pct(mult)}%`));
  line.appendChild(txt);
  box.appendChild(line);
}

function renderInfoPopup() {
  const pop = $('info-pop'), e = G.enemy.def;
  pop.innerHTML = '';
  pop.appendChild(el('div', 'pop-head', `<b>${e.name}</b><span>Level ${e.level} · ${e.maxHp} HP</span>`));
  pop.appendChild(el('p', 'blurb', e.blurb));
  const section = (title, list) => {
    pop.appendChild(el('div', 'pop-title', title));
    for (const x of list) {
      const row = el('div', 'move-row');
      row.appendChild(iconTile({ icon: x.icon, tint: x.tint, size: 'sm', tip: x.tip }));
      row.appendChild(el('div', 'move-text', `<b>${x.name}</b><span>${x.desc}</span>`));
      pop.appendChild(row);
    }
  };
  section('Moves', Object.values(e.moves).filter((m) => !m.hidden).map((m) => ({ ...m, tip: moveTip(m, true) })));
  if (e.traits) section('Traits', e.traits.map((t) => ({ ...t, tip: traitTip(t) })));
}

function renderCorners() {
  const pc = $('p-corner');
  if (!pc.firstChild) {
    pc.appendChild(iconTile({
      icon: 'backpack', tint: 'wood', size: 'sm', cls: 'corner-btn', label: 'Equipment and backpack', onclick: openInventory,
      tip: () => ({ icon: 'backpack', tint: 'wood', name: 'Equipment & Backpack', tag: 'Inventory', desc: 'Equip gear and pin consumables to the action bar.', hint: 'Hotkey: I' }),
    }));
  }
  const ec = $('e-corner');
  if (!ec.querySelector('.corner-btn')) {
    ec.insertBefore(iconTile({ icon: 'lore', tint: 'bronze', size: 'sm', cls: 'corner-btn', label: 'Enemy info', onclick: () => UI.toggleInfo() }), ec.firstChild);
  }
}

function renderAll() {
  const p = G.player, e = G.enemy;
  $('p-name').textContent = p.name; $('p-lv').textContent = `Lv ${p.level}`;
  $('e-name').textContent = e.def.name; $('e-lv').textContent = `Lv ${e.def.level}`;
  renderCorners();
  if ($('p-sprite').dataset.s !== 'knight') { $('p-sprite').innerHTML = SPRITES.knight; $('p-sprite').dataset.s = 'knight'; }
  if ($('e-sprite').dataset.s !== e.def.sprite) { $('e-sprite').innerHTML = spriteFor(e.def.sprite); $('e-sprite').dataset.s = e.def.sprite; renderInfoPopup(); }
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
  renderStageStates();
  refreshTipAfterRender();
}

function renderStageStates() {
  const p = G.player, e = G.enemy;
  const set = (id, c) => { const st = $(id).closest('.stage'); for (const [k, v] of Object.entries(c)) st.classList.toggle(k, !!v); };
  set('p-sprite', { guarded: p.block > 0, charged: hasStatus(p, 'lightning'), dead: G.over === 'lost' });
  set('e-sprite', {
    guarded: e.block > 0, frozen: hasStatus(e, 'frozen'), burning: hasStatus(e, 'burn'), stunned: hasStatus(e, 'stunned'),
    winding: e.intent === 'overheadStrike' && !G.over, dead: G.over === 'won',
  });
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

/* ---- inventory modal: equipment + backpack ------------------------------------------- */

function closeModal() { $('modal').hidden = true; UI.inventoryOpen = false; hideTip(); }
function tryGear(fn) {
  const c = canChangeGear();
  if (!c.ok) { Fx.floatText('player', c.reason, 'blocked'); return; }
  try { fn(); } catch (err) { log(err.message, 'err'); }
  renderInventory();
}
function renderInventory() {
  const card = $('modal-card'), p = G.player;
  card.innerHTML = '<h3>Equipment &amp; Backpack</h3>';
  const cols = el('div', 'inv-cols');

  const left = el('div', 'inv-col');
  left.appendChild(el('h4', '', 'Equipped'));
  const grid = el('div', 'doll');
  const layout = [['ring1', 'head', 'ring2'], ['mainHand', 'chest', 'offHand'], ['gloves', 'legs', null]];
  for (const row of layout) for (const sid of row) {
    const cell = el('div', 'doll-cell');
    if (sid) {
      const id = p.equipment[sid];
      cell.appendChild(iconTile({ icon: id ? EQUIPMENT[id].icon : SLOT_ICONS[sid], tint: id ? EQUIPMENT[id].tint : 'steel', empty: !id, tip: equipTip(sid, id), onclick: id ? () => tryGear(() => unequip(sid)) : undefined }));
      cell.appendChild(el('div', 'slot-label', SLOTS.find((s) => s.id === sid).label));
    }
    grid.appendChild(cell);
  }
  left.appendChild(grid);
  const totals = bonuses();
  const lines = Object.entries(totals).filter(([, v]) => v).map(([k, v]) => `<li><span>${BONUS_LABELS[k]}</span><b>+${v}</b></li>`).join('');
  left.appendChild(el('div', 'totals', `<h4>Total bonuses</h4><ul>${lines || '<li><span>None</span></li>'}</ul>`));

  const right = el('div', 'inv-col');
  right.appendChild(el('h4', '', 'Backpack · Gear'));
  const gear = el('div', 'pack-grid');
  p.backpack.forEach((id) => gear.appendChild(iconTile({ icon: EQUIPMENT[id].icon, tint: EQUIPMENT[id].tint, tip: equipTip(null, id), onclick: () => tryGear(() => equip(id)) })));
  if (!p.backpack.length) gear.appendChild(el('div', 'pack-empty', 'No spare gear.'));
  right.appendChild(gear);
  right.appendChild(el('h4', '', `Backpack · Consumables <small>${p.quickbar.length}/${QUICKBAR_MAX} pinned</small>`));
  const cons = el('div', 'pack-grid');
  const owned = Object.keys(CONSUMABLES).filter((id) => (p.items[id] || 0) > 0 || p.quickbar.includes(id));
  owned.forEach((id) => {
    const pinned = p.quickbar.includes(id);
    cons.appendChild(iconTile({
      icon: CONSUMABLES[id].icon, tint: CONSUMABLES[id].tint, count: p.items[id] || 0, pressed: pinned, mark: pinned ? '★' : null, cls: pinned ? 'pinned' : '',
      tip: itemTip(id, true), onclick: () => { const r = toggleQuick(id); if (!r.ok) Fx.floatText('player', r.reason, 'blocked'); Sfx.play('click'); renderInventory(); },
    }));
  });
  if (!owned.length) cons.appendChild(el('div', 'pack-empty', 'No consumables.'));
  right.appendChild(cons);
  right.appendChild(el('p', 'pack-help', 'Click gear to equip or unequip it. Click a consumable to pin it to the action bar (★).'));

  cols.append(left, right);
  card.appendChild(cols);
  const close = el('button', 'btn', 'Close <kbd>Esc</kbd>'); close.type = 'button'; close.addEventListener('click', closeModal);
  card.appendChild(close);
  refreshTipAfterRender();
}
function openInventory() {
  UI.inventoryOpen = true;
  renderInventory();
  $('modal').hidden = false;
}

/* ---- wiring --------------------------------------------------------------------------- */

const UI = {};
function initUI() {
  initTooltips();
  Engine.listeners.push((ev) => {
    switch (ev.type) {
      case 'log': appendLog(ev.text, ev.cls); break;
      case 'new': rebuildLog(); renderAll(); break;
      case 'render': renderAll(); if (UI.inventoryOpen) renderInventory(); break;
      default: Fx.handle(ev);
    }
  });
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
  const sb = $('sound-btn');
  const syncSound = () => { sb.textContent = Sfx.enabled ? '♪ Sound on' : '♪ Sound off'; sb.classList.toggle('off', !Sfx.enabled); };
  sb.addEventListener('click', () => { Sfx.setEnabled(!Sfx.enabled); syncSound(); Sfx.play('click'); });
  syncSound();
  UI.syncSound = syncSound;
  for (const evt of ['pointerdown', 'keydown']) document.addEventListener(evt, () => Sfx.unlock(), { once: true });
  $('banner-restart').addEventListener('click', () => newBattle(G.enemyId));

  const wrap = $('e-corner'), pop = $('info-pop');
  let pinned = false;
  const setPop = (v) => { pop.hidden = !v; wrap.classList.toggle('open', v); };
  wrap.addEventListener('mouseenter', () => setPop(true));
  wrap.addEventListener('mouseleave', () => { if (!pinned) setPop(false); });
  UI.toggleInfo = () => { pinned = !pinned; setPop(pinned); };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); pinned = false; setPop(false); return; }
    if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'i' || e.key === 'I') { if ($('modal').hidden) openInventory(); else closeModal(); return; }
    if (!$('modal').hidden) return;
    if (e.key === 'e' || e.key === 'E') endTurn();
    else if (e.key === 'q' || e.key === 'Q') switchBar();
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const entry = barEntries()[n - 1]; if (entry) entry.run(); }
  });
  $('end-turn').addEventListener('click', () => endTurn());
}
initUI();
