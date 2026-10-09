'use strict';
/* The run: map, position, node outcomes and the persistent player. No DOM here;
   views.js renders RUN and calls these functions. The run is saved to
   localStorage whenever it changes outside a fight. */

let RUN = null;
const SAVE_KEY = 'mf.run.v1';

const runEmit = (type, extra = {}) => emit({ type, ...extra });
const clone = (o) => JSON.parse(JSON.stringify(o));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---- map ---------------------------------------------------------------------- */

function buildMap() {
  const nodes = {}, edges = [];
  const rows = MAP_LAYOUT.rows;
  rows.forEach((row, r) => {
    const pool = ENEMY_POOLS[r] ? shuffle(ENEMY_POOLS[r]) : [];
    let fightIdx = 0;
    row.forEach((type, i) => {
      const id = `${r}-${i + 1}`;
      nodes[id] = { id, row: r, col: i + 1, type, enemy: type === 'fight' ? pool[fightIdx++ % pool.length] : null };
    });
  });
  for (let r = 0; r < rows.length - 1; r++) {
    const here = rows[r].length, next = rows[r + 1].length;
    for (let c = 1; c <= here; c++) {
      if (here === 1) for (let n = 1; n <= next; n++) edges.push([`${r}-${c}`, `${r + 1}-${n}`]);       // fan out
      else if (next === 1) edges.push([`${r}-${c}`, `${r + 1}-1`]);                                       // converge
      else if (c <= next) edges.push([`${r}-${c}`, `${r + 1}-${c}`]);                                     // straight ahead
    }
  }
  for (const [a, b] of MAP_LAYOUT.extraEdges) edges.push([a, b]);
  return { nodes, edges, rows: rows.length };
}
const nodeLabel = (n) => (n.type === 'start' ? '0' : n.type === 'goal' ? '★' : `${n.row}·${n.col}`);
function reachable() {
  if (!RUN || !RUN.resolved || RUN.over || RUN.done) return [];
  return RUN.map.edges.filter(([a]) => a === RUN.at).map(([, b]) => b);
}

/* ---- run lifecycle -------------------------------------------------------------- */

function newRun() {
  PLAYER = newPlayer();
  G = null;
  RUN = {
    v: 1, map: buildMap(), at: '0-1', path: ['0-1'], resolved: true, view: 'map',
    player: PLAYER, over: null, done: false,
    node: null,       // per-node state (chest / rest / fight reward)
    snapshot: null,   // player state when the current fight began (for restart / reload)
    stats: { fights: 0, chests: 0, rests: 0, found: [] },
  };
  log('A new journey begins.', 'turn');
  saveRun();
  runEmit('view');
}

function saveRun() {
  if (!RUN) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(RUN)); } catch (e) { /* storage unavailable */ }
}
function loadRun() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { data = null; }
  if (!data || data.v !== 1 || !data.map || !data.player) return false;
  RUN = data;
  PLAYER = RUN.player;
  recalcPlayer(PLAYER);
  return true;
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

/* Restore the game after a page load: resume the run, or start a new one. */
function resumeOrStart() {
  if (!loadRun()) { newRun(); return; }
  log('Your journey continues.', 'turn');
  const n = RUN.map.nodes[RUN.at];
  if (RUN.view === 'battle') {
    if (RUN.resolved) RUN.view = 'map';
    else if (RUN.snapshot) { restoreSnapshot(); startFight(n.enemy, n.id); return; }
  }
  runEmit('view');
}

/* ---- moving on the map ----------------------------------------------------------- */

function travel(id) {
  if (!reachable().includes(id)) throw new Error(`You cannot reach ${id} from here.`);
  enterNode(id);
}
/* Enter a node. force: debug teleport that ignores paths. */
function enterNode(id, { force = false } = {}) {
  const n = RUN.map.nodes[id];
  if (!n) throw new Error(`No node "${id}"`);
  if (!force && !reachable().includes(id)) throw new Error(`You cannot reach ${id} from here.`);
  RUN.at = id;
  RUN.path.push(id);
  RUN.resolved = false;
  RUN.node = { type: n.type };
  log(`You travel to ${NODE_TYPES[n.type].name.toLowerCase()} ${nodeLabel(n)}.`, 'sys');
  if (n.type === 'fight') { startFight(n.enemy, id); return; }
  if (n.type === 'goal') { RUN.resolved = true; RUN.done = true; RUN.view = 'victory'; log('You have reached the treasure. Victory!', 'win'); }
  else RUN.view = n.type;
  saveRun();
  runEmit('view');
}

function backToMap() {
  if (!RUN.resolved) RUN.resolved = true;
  G = null;
  RUN.view = 'map';
  RUN.node = null;
  saveRun();
  runEmit('view');
}

/* ---- fights ------------------------------------------------------------------------- */

function restoreSnapshot() {
  if (!RUN.snapshot) return;
  const snap = clone(RUN.snapshot);
  for (const k of Object.keys(snap)) PLAYER[k] = snap[k];
  RUN.player = PLAYER;
}
function startFight(enemyId, nodeId = null) {
  RUN.snapshot = clone(PLAYER);
  RUN.view = 'battle';
  RUN.node = { type: 'fight', nodeId, reward: null };
  saveRun(); // a reload during the fight restarts it from here
  newBattle(enemyId);
  G.nodeId = nodeId;
  runEmit('view');
}
function restartFight() {
  if (!G) throw new Error('Not in a fight.');
  const enemyId = G.enemyId, nodeId = G.nodeId;
  restoreSnapshot();
  newBattle(enemyId);
  G.nodeId = nodeId;
  runEmit('view');
}

/* Called when a fight ends (engine 'end' event). */
function onFightEnd(result) {
  if (!RUN || RUN.view !== 'battle') return;
  if (result === 'won') {
    RUN.stats.fights++;
    const potion = pick(Object.keys(CONSUMABLES).filter((k) => CONSUMABLES[k].potion));
    PLAYER.items[potion] = (PLAYER.items[potion] || 0) + 1;
    RUN.node.reward = potion;
    log(`You find a ${CONSUMABLES[potion].name} on the body.`, 'win');
    PLAYER.block = 0; PLAYER.statuses = [];
    RUN.resolved = true;
    RUN.snapshot = null;
    saveRun();
  } else {
    RUN.over = 'lost';
    RUN.resolved = true;
    // stay on the battle screen to show the defeat banner, but a reload lands on the summary
    RUN.view = 'gameover';
    saveRun();
    RUN.view = 'battle';
  }
}

/* ---- loot ------------------------------------------------------------------------- */

function ownedGear() { return new Set([...Object.values(PLAYER.equipment).filter(Boolean), ...PLAYER.backpack]); }
/* A random wearable from the loot pool, preferring items the player does not own yet. */
function rollLoot() {
  const pool = Object.keys(EQUIPMENT).filter((k) => EQUIPMENT[k].loot);
  const owned = ownedGear();
  const fresh = pool.filter((k) => !owned.has(k));
  const id = pick(fresh.length ? fresh : pool);
  PLAYER.backpack.push(id);
  RUN.stats.found.push(id);
  log(`Found ${EQUIPMENT[id].name}. It goes into your backpack.`, 'win');
  return id;
}

/* ---- chest ------------------------------------------------------------------------ */

function openChest() {
  if (RUN.view !== 'chest' || RUN.node.opened) return null;
  RUN.node.opened = true;
  RUN.node.item = rollLoot();
  RUN.stats.chests++;
  RUN.resolved = true;
  saveRun();
  return RUN.node.item;
}

/* ---- rest site ------------------------------------------------------------------------ */

const REST_OPTIONS = {
  rest: {
    name: 'Rest', icon: 'campfire', tint: 'fire',
    preview: () => `Restore ${Math.round(PLAYER.maxHp * RULES.rest.hpPct)} HP and ${Math.round(PLAYER.maxMana * RULES.rest.manaPct)} mana (30%).`,
    run() {
      const hp = Math.min(Math.round(PLAYER.maxHp * RULES.rest.hpPct), PLAYER.maxHp - PLAYER.hp);
      const mana = Math.min(Math.round(PLAYER.maxMana * RULES.rest.manaPct), PLAYER.maxMana - PLAYER.mana);
      PLAYER.hp += hp; PLAYER.mana += mana;
      log(`You rest by the fire: +${hp} HP, +${mana} mana.`, 'player');
      return { text: `You sleep by the fire and wake refreshed: +${hp} HP, +${mana} mana.`, hp, mana };
    },
  },
  supplies: {
    name: 'Scavenge for supplies', icon: 'bread', tint: 'wood',
    preview: () => 'Search the area for 2–3 random consumables.',
    run() {
      const n = 2 + (Math.random() < 0.5 ? 1 : 0);
      const got = [];
      for (let i = 0; i < n; i++) { const id = pick(Object.keys(CONSUMABLES)); PLAYER.items[id] = (PLAYER.items[id] || 0) + 1; got.push(id); }
      log(`You scavenge: ${got.map((id) => CONSUMABLES[id].name).join(', ')}.`, 'player');
      return { text: 'You search the hedges and abandoned packs nearby.', items: got };
    },
  },
  loot: {
    name: 'Scavenge for loot', icon: 'backpack', tint: 'bronze',
    preview: () => 'Search old camps for a random piece of gear.',
    run() {
      const id = rollLoot();
      return { text: 'Half-buried under leaves you find something worth keeping.', gear: id };
    },
  },
};
function restChoose(key) {
  if (RUN.view !== 'rest' || RUN.node.choice) return null;
  const opt = REST_OPTIONS[key];
  if (!opt) throw new Error(`Unknown rest option "${key}"`);
  RUN.node.choice = key;
  RUN.node.result = opt.run();
  RUN.stats.rests++;
  RUN.resolved = true;
  saveRun();
  return RUN.node.result;
}

/* Keep the save current when gear or pins change outside a fight. */
Engine.listeners.push((ev) => {
  if (ev.type === 'end') onFightEnd(ev.result);
  if (ev.type === 'player' && RUN && RUN.view !== 'battle') saveRun();
});
