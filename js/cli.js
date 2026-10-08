'use strict';
/* Command line under the combat log. Add a command by adding one entry to COMMANDS. */

const num = (s, name = 'value') => {
  const n = Number(s);
  if (!Number.isFinite(n)) throw new Error(`${name} must be a number, got "${s}"`);
  return Math.round(n);
};
const PLAYER_STATS = { hp: 'maxHp', mana: 'maxMana', stamina: 'maxStamina', block: null };
function setStat(c, stat, v) {
  if (!(stat in PLAYER_STATS)) throw new Error(`Unknown stat "${stat}" (hp, mana, stamina, block)`);
  const max = PLAYER_STATS[stat] && c[PLAYER_STATS[stat]];
  c[stat] = Math.max(0, max ? Math.min(max, v) : v);
}
const creatureOf = (who) => {
  if (who === 'player') return G.player;
  if (who === 'enemy') return G.enemy;
  throw new Error('Target must be "player" or "enemy"');
};

const COMMANDS = {
  help: { usage: 'help', desc: 'List commands.', run() { for (const [k, c] of Object.entries(COMMANDS)) log(`  ${c.usage.padEnd(38)} ${c.desc}`, 'sys'); } },
  restart: { usage: 'restart', desc: 'Restart the fight with the current enemy.', run() { newBattle(G.enemyId); } },
  spawn: { usage: 'spawn <enemy>', desc: `Start a fight (${Object.keys(ENEMIES).join(', ')}).`, run([id]) { newBattle(id); } },
  set: { usage: 'set <hp|mana|stamina|block> <n>', desc: 'Set a player value.', run([stat, n]) { setStat(G.player, stat, num(n)); log(`Player ${stat} set to ${G.player[stat]}.`, 'sys'); checkEnd(); render(); } },
  enemy: {
    usage: 'enemy set <hp|block> <n>', desc: 'Set an enemy value.',
    run([sub, stat, n]) {
      if (sub !== 'set' || !['hp', 'block'].includes(stat)) throw new Error('Usage: enemy set <hp|block> <n>');
      setStat(G.enemy, stat, num(n)); log(`Enemy ${stat} set to ${G.enemy[stat]}.`, 'sys'); checkEnd(); render();
    },
  },
  heal: { usage: 'heal <n>', desc: 'Heal the player.', run([n]) { const p = G.player; p.hp = Math.min(p.maxHp, p.hp + num(n)); log(`Healed to ${p.hp}.`, 'sys'); render(); } },
  damage: { usage: 'damage <n>', desc: 'Damage the player (block applies).', run([n]) { const r = dealDamage(G.player, num(n)); log(`Player takes ${hitText(r)}.`, 'sys'); checkEnd(); render(); } },
  status: {
    usage: 'status <add|remove> <player|enemy> <id> [turns]', desc: `Apply or remove a status (${Object.keys(STATUSES).join(', ')}).`,
    run([op, who, id, turns]) {
      const c = creatureOf(who);
      if (!STATUSES[id]) throw new Error(`Unknown status "${id}"`);
      if (op === 'add') {
        if (id === 'lightning') c.statuses.push({ id, turns: null });
        else addStatus(c, id, turns === undefined ? undefined : num(turns, 'turns'));
      } else if (op === 'remove') log(removeStatus(c, id) ? `Removed ${STATUSES[id].name}.` : 'Nothing to remove.', 'sys');
      else throw new Error('Use add or remove');
      render();
    },
  },
  give: { usage: 'give <item> [n]', desc: `Add consumables (${Object.keys(CONSUMABLES).join(', ')}).`, run([id, n = 1]) { if (!CONSUMABLES[id]) throw new Error(`Unknown item "${id}"`); G.player.items[id] += num(n); log(`Gave ${n} x ${CONSUMABLES[id].name}.`, 'sys'); render(); } },
  equip: { usage: 'equip <slot> <item>', desc: `Equip gear (slots: ${SLOTS.map((s) => s.id).join(', ')}; items: ${Object.keys(EQUIPMENT).join(', ')}).`, run([slot, id]) { equip(slot, id); log(`Equipped ${EQUIPMENT[id].name}.`, 'sys'); } },
  unequip: { usage: 'unequip <slot>', desc: 'Remove gear from a slot.', run([slot]) { unequip(slot); log(`Cleared ${slot}.`, 'sys'); } },
  intent: { usage: 'intent <moveId>', desc: 'Force the enemy\'s next move.', run([id]) { if (!G.enemy.def.moves[id]) throw new Error(`Unknown move "${id}" (${Object.keys(G.enemy.def.moves).join(', ')})`); G.enemy.intent = id; log(`Enemy intent set to ${id}.`, 'sys'); render(); } },
  god: { usage: 'god', desc: 'Toggle an invulnerable player.', run() { G.god = !G.god; log(`God mode ${G.god ? 'on' : 'off'}.`, 'sys'); } },
  sound: {
    usage: 'sound [on|off|<0-100>|<name>]', desc: 'Toggle sound, set volume, or play a sound by name.',
    run([arg]) {
      if (arg === undefined) { log(`Sound ${Sfx.enabled ? 'on' : 'off'}, volume ${Math.round(Sfx.volume * 100)}. Sounds: ${Sfx.names.join(', ')}`, 'sys'); return; }
      if (arg === 'on' || arg === 'off') { Sfx.setEnabled(arg === 'on'); UI.syncSound(); log(`Sound ${arg}.`, 'sys'); return; }
      if (/^\d+$/.test(arg)) { Sfx.setVolume(num(arg) / 100); log(`Volume ${Math.round(Sfx.volume * 100)}.`, 'sys'); return; }
      if (!Sfx.names.includes(arg)) throw new Error(`Unknown sound "${arg}"`);
      Sfx.play(arg);
    },
  },
  clear: { usage: 'clear', desc: 'Clear the log.', run() { G.log = []; $('log').innerHTML = ''; } },
  state: { usage: 'state', desc: 'Dump the battle state as JSON.', run() { const { log: _l, ...rest } = G; const s = JSON.stringify(rest, (k, v) => (k === 'def' ? v.id : v), 1); s.split('\n').forEach((l) => log(l, 'sys mono')); } },
};

function runCommand(line) {
  const parts = line.trim().split(/\s+/);
  const cmd = COMMANDS[parts[0].toLowerCase()];
  log(`> ${line}`, 'cmd');
  if (!cmd) { log(`Unknown command "${parts[0]}". Type help.`, 'err'); return; }
  try { cmd.run(parts.slice(1)); } catch (err) { log(err.message, 'err'); }
}

(function initCLI() {
  const form = $('cli'), input = $('cli-input'), hist = [];
  let idx = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    hist.push(v); idx = hist.length; input.value = '';
    runCommand(v);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); input.value = hist[idx] || ''; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { idx = Math.min(hist.length, idx + 1); input.value = hist[idx] || ''; e.preventDefault(); }
    else if (e.key === 'Escape') input.blur();
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || e.key === '`') && e.target.tagName !== 'INPUT' && $('modal').hidden) { e.preventDefault(); input.focus(); }
  });
})();
