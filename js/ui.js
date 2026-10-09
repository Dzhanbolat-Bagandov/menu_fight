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
  b.innerHTML = iconSVG(o.icon, '', { tint: o.vt });
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
  return `<div class="tip-head"><div class="tile big">${iconSVG(t.icon, '', { tint: t.vt })}</div><div><div class="tip-name">${t.name}</div>${t.tag ? `<div class="tip-tag">${t.tag}</div>` : ''}</div></div>` +
    (lines ? `<ul class="tip-stats">${lines}</ul>` : '') + (t.desc ? `<p class="tip-desc">${t.desc}</p>` : '') + (t.hint ? `<p class="tip-hint">${t.hint}</p>` : '') + (t.warn ? `<p class="tip-warn">${t.warn}</p>` : '');
}
/* tooltip.x/y are window (client) coordinates; the tooltip lives in the scaled canvas */
function positionTip() {
  const n = tooltip.node, pad = 18;
  const p = Scale.toLocal(tooltip.x, tooltip.y);
  const w = n.offsetWidth, h = n.offsetHeight;
  let x = p.x + pad, y = p.y + pad;
  if (x + w > DESIGN_W - 8) x = p.x - w - pad;
  if (y + h > DESIGN_H - 8) y = DESIGN_H - h - 8;
  n.style.left = Math.max(8, x) + 'px'; n.style.top = Math.max(8, y) + 'px';
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
  const t = under && under.closest && under.closest('.tile, .has-tip');
  if (t && t._tip) showTip(t); else hideTip();
}
function initTooltips() {
  tooltip.node = $('tooltip');
  document.addEventListener('mousemove', (e) => {
    tooltip.x = e.clientX; tooltip.y = e.clientY;
    const t = e.target.closest && e.target.closest('.tile, .has-tip');
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
    const pinned = PLAYER.quickbar.includes(id);
    return {
      icon: it.icon, tint: it.tint, name: it.name, tag: `Consumable · ${PLAYER.items[id] || 0} left`, lines: fx, desc: it.desc,
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
    if (slotId) return { icon: it.icon, tint: it.tint, vt: it.tint, name: it.name, tag: `Equipped · ${slotLabel(slotId)}`, lines: bonusLines(it), desc: it.desc, hint: 'Click to move it to your backpack.', warn: gear.ok ? '' : gear.reason };
    const target = targetSlot(id), prev = PLAYER.equipment[target];
    return { icon: it.icon, tint: it.tint, vt: it.tint, name: it.name, tag: `Backpack · ${slotLabel(target)}`, lines: bonusLines(it), desc: it.desc, hint: `Click to equip${prev ? ` (replaces ${EQUIPMENT[prev].name})` : ''}.`, warn: gear.ok ? '' : gear.reason };
  };
}
const traitTip = (t) => () => ({ icon: t.icon, tint: t.tint, name: t.name, tag: 'Trait', desc: t.desc });

/* ---- render ------------------------------------------------------------------------- */

function setBar(prefix, cur, max) {
  $(`${prefix}-fill`).style.width = `${(100 * cur) / max}%`;
}
function renderBlock(node, n) {
  node.classList.toggle('on', n > 0);
  node.innerHTML = n > 0 ? `${iconSVG('block', '', { bare: true })}<span>${n}</span>` : '';
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
  return PLAYER.quickbar.map((id) => {
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
    icon: toItems ? 'flask_red' : 'sword', tint: 'bronze', cls: 'toggle-tile', key: 'Q', mark: iconSVG('swap', '', { bare: true }),
    label: toItems ? 'Show items' : 'Show actions', onclick: switchBar,
    tip: () => ({ icon: 'swap', tint: 'bronze', name: toItems ? 'Show items' : 'Show actions', tag: 'Action bar', desc: toItems ? 'Swap the bar to your pinned consumables.' : 'Swap the bar back to your actions.', hint: 'Hotkey: Q' }),
  }));
}
function renderActions() {
  renderToggle();
  fillPage($('bar-viewport').querySelector('.bar-page.current'));
  const et = $('end-turn');
  et.innerHTML = `${iconSVG('hourglass', 'mini', { bare: true })}<span>End Turn</span><kbd>E</kbd>`;
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
  if (!G || !RUN || RUN.view !== 'battle') return;
  const p = G.player, e = G.enemy;
  $('p-name').textContent = p.name; $('p-lv').textContent = `Lv ${p.level}`;
  $('e-name').textContent = e.def.name; $('e-lv').textContent = `Lv ${e.def.level}`;
  renderCorners();
  if ($('p-sprite').dataset.s !== 'knight') { $('p-sprite').innerHTML = spriteSVG('knight'); $('p-sprite').dataset.s = 'knight'; }
  if ($('e-sprite').dataset.s !== e.def.id) {
    $('e-sprite').innerHTML = spriteSVG(e.def.sprite); $('e-sprite').dataset.s = e.def.id; renderInfoPopup();
    const bd = BACKDROPS[BIOMES[e.def.id] || 'road'];
    $('p-bd').innerHTML = bd; $('e-bd').innerHTML = bd;
  }
  $('vignette').classList.toggle('on', !G.over && p.hp / p.maxHp <= 0.3);
  setBar('p-hp', p.hp, p.maxHp); setBar('p-mana', p.mana, p.maxMana); setBar('p-stam', p.stamina, p.maxStamina); setBar('e-hp', e.hp, e.maxHp);
  $('p-hp-txt').textContent = `${p.hp} / ${p.maxHp}`; $('p-mana-txt').textContent = `${p.mana} / ${p.maxMana}`; $('p-stam-txt').textContent = `${p.stamina} / ${p.maxStamina}`;
  $('e-hp-txt').textContent = `${e.hp} / ${e.maxHp}`;
  renderBlock($('p-block'), p.block); renderBlock($('e-block'), e.block);
  renderStatuses($('p-status'), p); renderStatuses($('e-status'), e);
  renderActions(); renderIntent();
  renderBanner();
  $('app').classList.toggle('enemy-turn', G.phase === 'enemy');
  renderStageStates();
  refreshTipAfterRender();
}

function renderBanner() {
  const b = $('banner'), e = G.enemy;
  b.hidden = !G.over;
  if (!G.over) return;
  const won = G.over === 'won';
  $('banner-title').textContent = won ? 'Victory!' : 'Defeat';
  $('banner-sub').textContent = won ? `${e.def.name} lies broken at your feet.` : 'Your journey ends here... for now.';
  const rw = $('banner-reward');
  rw.innerHTML = '';
  const reward = RUN && RUN.node && RUN.node.reward;
  if (won && reward) {
    const it = CONSUMABLES[reward];
    rw.appendChild(iconTile({ icon: it.icon, tint: it.tint, tip: itemTip(reward, true) }));
    rw.appendChild(el('span', '', `Found: <b>${it.name}</b>`));
  }
  const btn = $('banner-btn');
  btn.textContent = won ? 'Continue to the map' : 'See how it ended';
  btn.onclick = () => { Sfx.play('click'); if (won) backToMap(); else { G = null; RUN.view = 'gameover'; emit({ type: 'view' }); } };
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
  setTimeout(() => line.classList.add('old'), 7000);
  while (box.children.length > 300) box.firstChild.remove();
  box.scrollTop = box.scrollHeight;
}
function rebuildLog() { $('log').innerHTML = ''; LOG.forEach((l) => appendLog(l.text, l.cls)); }

/* ---- inventory modal: equipment + backpack ------------------------------------------- */

function closeModal() { $('modal').hidden = true; UI.inventoryOpen = false; UI.settingsOpen = false; hideTip(); }
function tryGear(fn) {
  const c = canChangeGear();
  if (!c.ok) { Fx.floatText('player', c.reason, 'blocked'); return; }
  try { fn(); } catch (err) { log(err.message, 'err'); }
  renderInventory();
}
function renderInventory() {
  const card = $("modal-card"), p = PLAYER;
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
      cell.appendChild(iconTile({ icon: id ? EQUIPMENT[id].icon : SLOT_ICONS[sid], tint: id ? EQUIPMENT[id].tint : 'steel', vt: id ? EQUIPMENT[id].tint : null, empty: !id, tip: equipTip(sid, id), onclick: id ? () => tryGear(() => unequip(sid)) : undefined }));
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
  p.backpack.forEach((id) => gear.appendChild(iconTile({ icon: EQUIPMENT[id].icon, tint: EQUIPMENT[id].tint, vt: EQUIPMENT[id].tint, tip: equipTip(null, id), onclick: () => tryGear(() => equip(id)) })));
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
  UI.settingsOpen = false;
  UI.inventoryOpen = true;
  renderInventory();
  $('modal').hidden = false;
}

/* ---- settings modal ------------------------------------------------------------------------- */

const THEME_SWATCH = {
  oak: ['repeating-linear-gradient(90deg,#1d1209 0 2px,transparent 2px 26px),repeating-linear-gradient(90deg,#4a3220 0 26px,#3f2a1a 26px 52px)', 'linear-gradient(160deg,#6a6b66,#4d4e4a)'],
  birch: ['var(--tex-birch)', 'var(--tex-cobble)'],
  castle: ['var(--tex-ashlar)', 'linear-gradient(160deg,#4a3020,#2e1c12)'],
  night: ['radial-gradient(1px 1px at 20% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 60%,#fff 50%,transparent 51%),linear-gradient(#0a1020,#16203a)', 'linear-gradient(160deg,#4a3428,#2a1c16)'],
};
function renderSettings() {
  const card = $('modal-card'), st = Settings.all();
  card.innerHTML = '<h3>Settings</h3>';
  const sec = (title) => { const d = el('div', 'set-section'); d.appendChild(el('h4', '', title)); card.appendChild(d); return d; };
  const themes = el('div', 'theme-grid');
  for (const [key, t] of Object.entries(THEMES)) {
    const b = el('button', `theme-card${st.theme === key ? ' on' : ''}`);
    b.type = 'button';
    const [bg, panel] = THEME_SWATCH[key];
    b.innerHTML = `<div class="theme-swatch" style="background:${bg}"><i style="background:${panel}"></i></div><b>${t.name}</b><span>${t.desc}</span>`;
    b.addEventListener('click', () => { Settings.set('theme', key); Sfx.play('click'); });
    themes.appendChild(b);
  }
  sec('Background').appendChild(themes);
  const seg = (opts, cur, onPick) => { const d = el('div', 'seg'); for (const [k, label] of Object.entries(opts)) { const b = el('button', `btn small${cur === k ? ' on' : ''}`, label); b.type = 'button'; b.addEventListener('click', () => { onPick(k); Sfx.play('click'); }); d.appendChild(b); } return d; };
  const logSec = sec('Combat log');
  logSec.appendChild(seg(LOG_MODES, st.log, (k) => Settings.set('log', k)));
  logSec.appendChild(el('p', 'set-note', 'Blend-in floats the log over the scene and fades old lines; hover it to read back. Hidden keeps it out of the way: press / to type a command. Hotkey: L.'));
  const scaleSec = sec('Interface size');
  const row = el('div', 'set-row');
  row.innerHTML = `<input type="range" min="70" max="100" step="5" value="${Math.round(st.scale * 100)}"><span>${Math.round(st.scale * 100)}% of window</span>`;
  row.querySelector('input').addEventListener('input', (e) => { Settings.set('scale', Number(e.target.value) / 100); row.querySelector('span').textContent = `${e.target.value}% of window`; });
  scaleSec.appendChild(row);
  scaleSec.appendChild(el('p', 'set-note', 'The game is laid out for 1920×1080 and scales to fit any window, keeping its proportions.'));
  const sound = sec('Sound');
  sound.appendChild(seg({ on: 'On', off: 'Off' }, Sfx.enabled ? 'on' : 'off', (k) => { Sfx.setEnabled(k === 'on'); renderSettings(); }));
  const vol = el('div', 'set-row');
  vol.style.marginTop = '12px';
  vol.innerHTML = `<input type="range" min="0" max="100" step="5" value="${Math.round(Sfx.volume * 100)}"><span>Volume ${Math.round(Sfx.volume * 100)}</span>`;
  vol.querySelector('input').addEventListener('input', (e) => { Sfx.setVolume(Number(e.target.value) / 100); vol.querySelector('span').textContent = `Volume ${e.target.value}`; });
  vol.querySelector('input').addEventListener('change', () => Sfx.play('hit'));
  sound.appendChild(vol);
  sec('Motion').appendChild(seg({ full: 'Full animation', reduced: 'Reduce motion' }, st.reduceMotion ? 'reduced' : 'full', (k) => Settings.set('reduceMotion', k === 'reduced')));
  const close = el('button', 'btn', 'Close <kbd>Esc</kbd>'); close.type = 'button'; close.addEventListener('click', closeModal);
  card.appendChild(close);
}
function openSettings() {
  UI.inventoryOpen = false;
  UI.settingsOpen = true;
  renderSettings();
  $('modal').hidden = false;
}

/* ---- wiring --------------------------------------------------------------------------- */

const UI = {};
function initUI() {
  initTooltips();
  Engine.listeners.push((ev) => {
    switch (ev.type) {
      case 'log': appendLog(ev.text, ev.cls); break;
      case 'new': renderAll(); break;
      case 'render': if (RUN && RUN.view === 'battle') renderAll(); else Views.refresh(); if (UI.inventoryOpen) renderInventory(); break;
      case 'view': Views.show(); if (UI.inventoryOpen) renderInventory(); break;
      default: Fx.handle(ev);
    }
  });
  $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
  UI.syncSound = () => { if (UI.settingsOpen) renderSettings(); };
  $('settings-btn').innerHTML = `<svg viewBox="0 0 48 48"><path d="M20 4h8l1.4 5.6a15 15 0 0 1 4.2 2.4l5.5-1.7 4 6.9-4.1 4a15 15 0 0 1 0 4.8l4.1 4-4 6.9-5.5-1.7a15 15 0 0 1-4.2 2.4L28 44h-8l-1.4-5.6a15 15 0 0 1-4.2-2.4l-5.5 1.7-4-6.9 4.1-4a15 15 0 0 1 0-4.8l-4.1-4 4-6.9 5.5 1.7a15 15 0 0 1 4.2-2.4z" fill="#e8b768" stroke="#2c2f33" stroke-width="2"/><circle cx="24" cy="24" r="6.5" fill="#2c2f33"/></svg>`;
  $('log-btn').innerHTML = `<svg viewBox="0 0 48 48"><path d="M10 6h24l6 6v30H10z" fill="#f2ead8" stroke="#2c2f33" stroke-width="2.4"/><path d="M15 16h18M15 23h18M15 30h12" stroke="#7a5218" stroke-width="3" stroke-linecap="round"/></svg>`;
  $('settings-btn').addEventListener('click', () => { Sfx.play('click'); if (UI.settingsOpen) closeModal(); else openSettings(); });
  $('log-btn').addEventListener('click', () => { Sfx.play('click'); cycleLogMode(); });
  for (const evt of ['pointerdown', 'keydown']) document.addEventListener(evt, () => Sfx.unlock(), { once: true });

  const wrap = $('e-corner'), pop = $('info-pop');
  let pinned = false;
  const setPop = (v) => { pop.hidden = !v; wrap.classList.toggle('open', v); };
  wrap.addEventListener('mouseenter', () => setPop(true));
  wrap.addEventListener('mouseleave', () => { if (!pinned) setPop(false); });
  UI.toggleInfo = () => { pinned = !pinned; setPop(pinned); };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); pinned = false; setPop(false); return; }
    if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'i' || e.key === 'I') { if ($('modal').hidden || UI.settingsOpen) openInventory(); else closeModal(); return; }
    if (e.key === 'o' || e.key === 'O') { if ($('modal').hidden || UI.inventoryOpen) openSettings(); else closeModal(); return; }
    if (e.key === 'l' || e.key === 'L') { cycleLogMode(); return; }
    if (!$('modal').hidden) return;
    if (!G || RUN.view !== 'battle') return;
    if (e.key === 'e' || e.key === 'E') endTurn();
    else if (e.key === 'q' || e.key === 'Q') switchBar();
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const entry = barEntries()[n - 1]; if (entry) entry.run(); }
  });
  $('end-turn').addEventListener('click', () => endTurn());
}
initUI();
