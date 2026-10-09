'use strict';
/* Non-combat views (map, chest, rest site, victory, game over) and the top bar.
   Views.show() switches to RUN.view; Views.refresh() redraws the current one. */

const Views = (() => {
  const VIEW_IDS = { battle: 'battle-view', map: 'map-view', chest: 'chest-view', rest: 'rest-view', victory: 'end-view', gameover: 'end-view' };
  const TOPBAR_VIEWS = new Set(['map', 'chest', 'rest']);
  let shown = null;
  let travelling = false;

  function show() {
    if (!RUN) return;
    const view = RUN.view, id = VIEW_IDS[view];
    for (const sec of document.querySelectorAll('#views > .view')) sec.hidden = sec.id !== id;
    $('topbar').hidden = !TOPBAR_VIEWS.has(view);
    if (shown !== view) {
      const sec = $(id);
      if (sec.animate) sec.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
      if (view === 'victory') Sfx.play('fanfare');
      shown = view;
    }
    travelling = false;
    hideTip();
    refresh();
  }

  function refresh() {
    if (!RUN) return;
    if (TOPBAR_VIEWS.has(RUN.view)) renderTopbar();
    switch (RUN.view) {
      case 'battle': renderAll(); break;
      case 'map': renderMap(); break;
      case 'chest': renderChest(); break;
      case 'rest': renderRest(); break;
      case 'victory': case 'gameover': renderEnd(); break;
    }
  }

  /* ---- top bar --------------------------------------------------------------- */
  let confirmTimer = null;
  function miniBar(cls, label, cur, max) {
    return `<div class="mini-bar ${cls}"><div class="fill" style="width:${(100 * cur) / max}%"></div><span><b>${label}</b> ${cur} / ${max}</span></div>`;
  }
  function renderTopbar() {
    const tb = $('topbar'), p = PLAYER;
    tb.innerHTML = '';
    tb.appendChild(iconTile({
      icon: 'backpack', tint: 'wood', size: 'sm', cls: 'corner-btn', label: 'Equipment and backpack', onclick: openInventory,
      tip: () => ({ icon: 'backpack', tint: 'wood', name: 'Equipment & Backpack', tag: 'Inventory', desc: 'Equip gear and pin consumables to the action bar.', hint: 'Hotkey: I' }),
    }));
    tb.appendChild(el('div', 'tb-name', `${p.name} <span class="lv">Lv ${p.level}</span>`));
    tb.appendChild(el('div', 'tb-bars', miniBar('hp', 'HP', p.hp, p.maxHp) + miniBar('mana', 'Mana', p.mana, p.maxMana)));
    const n = RUN.map.nodes[RUN.at];
    tb.appendChild(el('div', 'tb-depth', `Depth <b>${n.row}</b> / ${RUN.map.rows - 1}`));
    const nr = el('button', 'btn small', 'New run');
    nr.type = 'button';
    nr.addEventListener('click', () => {
      if (nr.classList.contains('confirm')) { clearTimeout(confirmTimer); newRun(); return; }
      nr.classList.add('confirm'); nr.textContent = 'Abandon this run?';
      confirmTimer = setTimeout(() => { nr.classList.remove('confirm'); nr.textContent = 'New run'; }, 3000);
    });
    tb.appendChild(nr);
  }

  /* ---- map ------------------------------------------------------------------- */
  function nodePos(n) {
    const rows = RUN.map.rows, cols = MAP_LAYOUT.rows[n.row].length;
    const y = 90 - n.row * (80 / (rows - 1));
    const x = cols === 1 ? 50 : 20 + (n.col - 1) * (60 / (cols - 1));
    // small, stable wobble so the map looks hand-drawn
    const h = [...n.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
    return { x: x + ((h % 7) - 3) * 0.8, y: y + (((h >> 3) % 5) - 2) * 0.8 };
  }
  function nodeTip(n) {
    return () => {
      const t = NODE_TYPES[n.type];
      const lines = [];
      if (n.type === 'fight') lines.push(`A level ${n.row} enemy`);
      const state = RUN.path.includes(n.id) ? (n.id === RUN.at ? 'You are here' : 'Visited') : reachable().includes(n.id) ? 'Click to travel here' : '';
      return { icon: t.icon, tint: n.type === 'fight' ? 'blood' : n.type === 'chest' ? 'bronze' : n.type === 'rest' ? 'fire' : 'steel', name: t.name, tag: `Node ${nodeLabel(n)}`, lines, desc: t.desc, hint: state };
    };
  }
  function renderMap() {
    const v = $('map-view');
    v.innerHTML = '';
    const board = el('div', 'map-board');
    board.appendChild(el('h2', 'map-title', 'The Old Road'));
    const field = el('div', 'map-field');
    const nodes = Object.values(RUN.map.nodes);
    const pos = Object.fromEntries(nodes.map((n) => [n.id, nodePos(n)]));
    const next = reachable();
    const walked = new Set(RUN.path.slice(1).map((id, i) => `${RUN.path[i]}>${id}`));
    const lines = RUN.map.edges.map(([a, b]) => {
      const cls = walked.has(`${a}>${b}`) ? 'walked' : a === RUN.at && next.includes(b) ? 'open' : '';
      return `<line class="${cls}" x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" vector-effect="non-scaling-stroke"/>`;
    }).join('');
    field.insertAdjacentHTML('beforeend', `<svg class="map-paths" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>`);
    for (const n of nodes) {
      const visited = RUN.path.includes(n.id) && n.id !== RUN.at;
      const can = next.includes(n.id);
      const b = el(can ? 'button' : 'div', `map-node has-tip type-${n.type}${can ? ' reachable' : ''}${visited ? ' visited' : ''}${n.id === RUN.at ? ' current' : ''}`);
      b.style.left = pos[n.id].x + '%'; b.style.top = pos[n.id].y + '%';
      b.innerHTML = `${iconSVG(NODE_TYPES[n.type].icon)}<span class="node-label">${nodeLabel(n)}</span>`;
      b._tip = nodeTip(n);
      if (can) { b.type = 'button'; b.addEventListener('click', () => goTo(n.id, pos[n.id])); }
      field.appendChild(b);
    }
    const tok = el('div', 'map-token', `<svg viewBox="-30 -56 60 84">${KNIGHT_HEAD(0, 0, 1)}</svg>`);
    tok.id = 'map-token';
    tok.style.left = pos[RUN.at].x + '%'; tok.style.top = pos[RUN.at].y + '%';
    field.appendChild(tok);
    board.appendChild(field);
    const legend = el('div', 'map-legend');
    for (const t of ['fight', 'chest', 'rest', 'goal']) legend.appendChild(el('span', '', `${iconSVG(NODE_TYPES[t].icon)} ${NODE_TYPES[t].name}`));
    board.appendChild(legend);
    board.appendChild(el('p', 'map-hint', next.length ? 'Choose where to go next. Glowing nodes are within reach.' : RUN.done ? 'Your journey is complete.' : ''));
    v.appendChild(board);
  }
  function goTo(id, p) {
    if (travelling) return;
    travelling = true;
    Sfx.play('step');
    const tok = $('map-token');
    tok.style.left = p.x + '%'; tok.style.top = p.y + '%';
    setTimeout(() => { try { travel(id); } catch (err) { log(err.message, 'err'); travelling = false; } }, 650);
  }

  /* ---- chest ------------------------------------------------------------------ */
  function gearCard(id) {
    const it = EQUIPMENT[id];
    const card = el('div', 'loot-card');
    card.appendChild(iconTile({ icon: it.icon, tint: it.tint, size: 'lg', tip: equipTip(null, id) }));
    const lines = Object.entries(it.bonus).map(([k, v]) => `+${v} ${BONUS_LABELS[k]}`).join(' · ') || 'No bonuses';
    card.appendChild(el('div', 'loot-text', `<b>${it.name}</b><span>${slotLabel(targetSlot(id))} · ${lines}</span><i>${it.desc}</i>`));
    const inPack = PLAYER.backpack.includes(id);
    const eq = el('button', 'btn', inPack ? 'Equip now' : 'Equipped');
    eq.type = 'button'; eq.disabled = !inPack;
    eq.addEventListener('click', () => { equip(id); refresh(); });
    card.appendChild(eq);
    return card;
  }
  function renderChest() {
    const v = $('chest-view'), st = RUN.node || {};
    v.innerHTML = '';
    const card = el('div', 'scene-card');
    card.appendChild(el('h2', '', st.opened ? 'The chest creaks open' : 'An old chest'));
    const stage = el('div', `chest-stage${st.opened ? ' open' : ''}`, st.opened ? SCENES.chestOpen : SCENES.chestClosed);
    if (!st.opened) {
      stage.classList.add('clickable');
      stage.title = 'Open the chest';
      stage.addEventListener('click', () => {
        Sfx.play('chestOpen');
        openChest();
        refresh();
        const lc = v.querySelector('.loot-card');
        if (lc && lc.animate) lc.animate([{ opacity: 0, transform: 'translateY(20px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1.2)' });
      });
    }
    card.appendChild(stage);
    if (st.opened) {
      card.appendChild(el('p', 'scene-text', 'Inside, wrapped in oilcloth:'));
      card.appendChild(gearCard(st.item));
    } else card.appendChild(el('p', 'scene-text', 'Iron-banded and half-sunk in moss. Click the chest to open it.'));
    const row = el('div', 'scene-actions');
    const go = el('button', `btn${st.opened ? ' primary' : ''}`, st.opened ? 'Continue' : 'Leave it');
    go.type = 'button';
    go.addEventListener('click', () => { Sfx.play('click'); backToMap(); });
    row.appendChild(go);
    card.appendChild(row);
    v.appendChild(card);
  }

  /* ---- rest site -------------------------------------------------------------- */
  function renderRest() {
    const v = $('rest-view'), st = RUN.node || {};
    v.innerHTML = '';
    const card = el('div', 'scene-card wide');
    card.appendChild(el('h2', '', 'Rest site'));
    card.appendChild(el('div', 'rest-stage', SCENES.rest));
    const opts = el('div', 'rest-options');
    for (const [key, o] of Object.entries(REST_OPTIONS)) {
      const chosen = st.choice === key;
      const b = el('button', `rest-option${chosen ? ' chosen' : ''}`);
      b.type = 'button';
      b.disabled = !!st.choice;
      b.innerHTML = `<div class="tile tint-${o.tint}">${iconSVG(o.icon)}</div><div class="ro-text"><b>${o.name}</b><span>${o.preview()}</span></div>`;
      b.addEventListener('click', () => {
        Sfx.play(key === 'rest' ? 'restHeal' : 'scavenge');
        restChoose(key);
        refresh();
      });
      opts.appendChild(b);
    }
    card.appendChild(opts);
    if (st.result) {
      const res = el('div', 'rest-result');
      res.appendChild(el('p', 'scene-text', st.result.text));
      if (st.result.items) {
        const row = el('div', 'loot-row');
        const counts = {};
        st.result.items.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
        for (const [id, n] of Object.entries(counts)) row.appendChild(iconTile({ icon: CONSUMABLES[id].icon, tint: CONSUMABLES[id].tint, count: `+${n}`, tip: itemTip(id, true) }));
        res.appendChild(row);
      }
      if (st.result.gear) res.appendChild(gearCard(st.result.gear));
      const go = el('button', 'btn primary', 'Continue');
      go.type = 'button';
      go.addEventListener('click', () => { Sfx.play('click'); backToMap(); });
      res.appendChild(go);
      card.appendChild(res);
    } else card.appendChild(el('p', 'scene-text', 'The fire crackles. You have time for one thing before moving on.'));
    v.appendChild(card);
  }

  /* ---- victory / game over ------------------------------------------------------ */
  function renderEnd() {
    const v = $('end-view'), won = RUN.view === 'victory', s = RUN.stats;
    v.innerHTML = '';
    const card = el('div', `scene-card wide end-card ${won ? 'won' : 'lost'}`);
    card.appendChild(el('h1', '', won ? 'Victory!' : 'Run over'));
    card.appendChild(el('div', 'end-stage', won ? SCENES.victory : `<div class="end-fallen">${SPRITES.knight}</div>`));
    card.appendChild(el('p', 'scene-text', won ? 'The treasure is yours, and so is the princess\'s gratitude. The realm will sing of Sir Aldric.' : 'Sir Aldric has fallen. The road will wait for another hero.'));
    card.appendChild(el('ul', 'end-stats', `<li><span>Fights won</span><b>${s.fights}</b></li><li><span>Chests opened</span><b>${s.chests}</b></li><li><span>Rests taken</span><b>${s.rests}</b></li><li><span>Gear found</span><b>${s.found.length}</b></li><li><span>HP left</span><b>${PLAYER.hp} / ${PLAYER.maxHp}</b></li>`));
    const b = el('button', 'btn big primary', 'Start a new run');
    b.type = 'button';
    b.addEventListener('click', () => { Sfx.play('click'); newRun(); });
    card.appendChild(b);
    v.appendChild(card);
  }

  return { show, refresh };
})();
