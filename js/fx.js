'use strict';
/* Visual effects and sound cues. Fx.handle(ev) turns engine events into
   sprite lunges/recoils, sparks, projectiles, shield effects, floating numbers and sounds. */

const Fx = (() => {
  const spriteEl = (side) => $(side === 'player' ? 'p-sprite' : 'e-sprite');
  const layer = (side) => $(side === 'player' ? 'p-floats' : 'e-floats');
  const fwd = (side) => (side === 'player' ? 1 : -1); // direction towards the opponent
  const other = (side) => (side === 'player' ? 'enemy' : 'player');
  const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
  const anim = (node, frames, opts) => (node.animate ? node.animate(frames, opts) : null);

  /* ---- sprite motion ---- */
  function lunge(side, dist, rot = 0, dur = 320) {
    const d = fwd(side) * dist;
    anim(spriteEl(side), [
      { transform: 'translateX(0)' },
      { transform: `translateX(${d}px) rotate(${fwd(side) * rot}deg)`, offset: 0.4 },
      { transform: 'translateX(0)' },
    ], { duration: dur, easing: 'cubic-bezier(.25,.8,.35,1)', composite: 'add' });
  }
  function recoil(side, dist = 14) {
    anim(spriteEl(side), [
      { transform: 'translateX(0)' },
      { transform: `translateX(${-fwd(side) * dist}px)`, offset: 0.2 },
      { transform: 'translateX(0)' },
    ], { duration: 300, easing: 'ease-out', composite: 'add' });
  }
  function hop(side, up = 10, dur = 260) {
    anim(spriteEl(side), [{ transform: 'translateY(0)' }, { transform: `translateY(${-up}px)`, offset: 0.4 }, { transform: 'translateY(0)' }], { duration: dur, easing: 'ease-out', composite: 'add' });
  }
  function wobble(side) {
    anim(spriteEl(side), [0, -6, 6, -4, 4, 0].map((r) => ({ transform: `rotate(${r}deg)` })), { duration: 500, composite: 'add' });
  }
  function flash(side) {
    const s = spriteEl(side);
    s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit');
  }

  /* ---- overlays inside the stage ---- */
  function floatText(side, text, cls) {
    const f = el('span', 'float ' + cls, text);
    f.style.left = rnd(35, 65) + '%';
    layer(side).appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }
  function sparks(side, colors, n = 12, { spread = 80, size = 1, x = 50, y = 45 } = {}) {
    const host = layer(side);
    for (let i = 0; i < n; i++) {
      const s = el('i', 'spark');
      const c = colors[i % colors.length];
      s.style.left = x + rnd(-4, 4) + '%';
      s.style.top = y + rnd(-6, 6) + '%';
      s.style.background = c;
      s.style.boxShadow = `0 0 6px ${c}`;
      s.style.width = rnd(10, 22) * size + 'px';
      host.appendChild(s);
      const a = rnd(0, 360), dist = rnd(spread * 0.4, spread);
      const r = anim(s, [
        { transform: `rotate(${a}deg) translateX(0) scaleX(1)`, opacity: 1 },
        { transform: `rotate(${a + rnd(-20, 20)}deg) translateX(${dist}px) scaleX(.3)`, opacity: 0 },
      ], { duration: rnd(320, 560), easing: 'cubic-bezier(.1,.7,.3,1)' });
      if (r) r.onfinish = () => s.remove(); else setTimeout(() => s.remove(), 600);
    }
  }
  function overlay(side, cls, html, frames, dur, x) {
    const o = el('div', cls, html);
    if (x !== undefined) o.style.left = x + '%';
    layer(side).appendChild(o);
    const r = anim(o, frames, { duration: dur, easing: 'ease-out', fill: 'forwards' });
    if (r) r.onfinish = () => o.remove(); else setTimeout(() => o.remove(), dur);
    return o;
  }
  /* The shield appears in front of the defender (on the side facing the opponent). */
  const shieldX = (side) => (side === 'player' ? 64 : 36);
  function shieldFx(side, mode) {
    const x = shieldX(side), svg = iconSVG('block');
    if (mode === 'up') {
      overlay(side, 'shield-fx', svg, [
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
        { transform: 'translate(-50%,-50%) scale(1.08)', opacity: 0.95, offset: 0.35 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.8, offset: 0.7 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 },
      ], 800, x);
    } else if (mode === 'hit') {
      overlay(side, 'shield-fx', svg, [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, filter: 'brightness(2)' },
        { transform: 'translate(-50%,-50%) scale(1.12)', opacity: 0 },
      ], 380, x);
      overlay(side, 'shield-ring', '', [
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0.9 },
        { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 },
      ], 420, x);
      sparks(side, ['#fff7d6', '#ffd36b'], 8, { spread: 55, x: x + fwd(side) * 6 });
    } else if (mode === 'break') {
      for (const [half, dx, rot] of [['left', -50, -35], ['right', 50, 35]]) {
        overlay(side, `shield-fx half-${half}`, svg, [
          { transform: 'translate(-50%,-50%) translate(0,0) rotate(0)', opacity: 1 },
          { transform: `translate(-50%,-50%) translate(${dx}px,70px) rotate(${rot}deg)`, opacity: 0 },
        ], 650, x);
      }
      sparks(side, ['#cfd5d9', '#8a949b', '#ffffff'], 16, { spread: 90, size: 1.3, x });
    }
  }
  function iconPop(side, icon, cls = '') {
    overlay(side, 'icon-pop ' + cls, iconSVG(icon), [
      { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1.15)', opacity: 1, offset: 0.3 },
      { transform: 'translate(-50%,-70%) scale(1)', opacity: 0 },
    ], 700, rnd(42, 58));
  }
  function boltFx(side) {
    overlay(side, 'bolt-fx', `<svg viewBox="0 0 48 48">${ICONS.bolt}</svg>`, [
      { opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.2, offset: 0.25 }, { opacity: 1, offset: 0.4 }, { opacity: 0 },
    ], 380);
    sparks(side, ['#e8d4ff', '#9b6bd1', '#f4d35e'], 12, { spread: 70 });
  }

  /* ---- projectile flying from one sprite to the other ---- */
  function projectile(from, icon, glow) {
    const a = spriteEl(from).getBoundingClientRect(), b = spriteEl(other(from)).getBoundingClientRect();
    const x0 = a.left + a.width * 0.5, y0 = a.top + a.height * 0.45, x1 = b.left + b.width * 0.5, y1 = b.top + b.height * 0.45;
    const p = el('div', 'projectile', iconSVG(icon));
    p.style.setProperty('--glow', glow);
    document.body.appendChild(p);
    const flip = from === 'enemy' ? ' scaleX(-1)' : '';
    const r = anim(p, [
      { transform: `translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.5)${flip}`, opacity: 0 },
      { transform: `translate(${x0 + (x1 - x0) * 0.15}px,${y0 - 30}px) translate(-50%,-50%) scale(1)${flip}`, opacity: 1, offset: 0.2 },
      { transform: `translate(${x1}px,${y1}px) translate(-50%,-50%) scale(1.1)${flip}`, opacity: 1 },
    ], { duration: T.spell - 20, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
    if (r) r.onfinish = () => p.remove(); else setTimeout(() => p.remove(), T.spell);
  }

  /* ---- event -> effects + sound ---- */
  const HIT_SOUND = { light: 'hit', heavy: 'heavyHit', fire: 'fireImpact', frost: 'frostImpact', lightning: 'zap', burn: 'burn', bleed: 'hit', thorns: 'hit', raw: 'hit' };
  const SPARKS = {
    light: ['#fff3c4', '#ffd36b', '#ffffff'], heavy: ['#ffe08a', '#ff9b3d', '#ffffff'], raw: ['#ffd36b'],
    fire: ['#ffb347', '#ff6a2c', '#ffe27a'], burn: ['#ff8a3d', '#ffcc66'], bleed: ['#c4261e', '#ff6a5a'], thorns: ['#a7c47a', '#5b7a3a'], frost: ['#d6f3ff', '#8fd3ff', '#ffffff'], lightning: ['#e8d4ff', '#b48cff', '#f4d35e'],
  };
  const ELEMENTAL = new Set(['fire', 'frost', 'lightning', 'burn']);
  const play = (n) => Sfx.play(n);

  function onDamage({ side, kind, dealt, absorbed, broke }) {
    if (ELEMENTAL.has(kind) && dealt + absorbed > 0) play(HIT_SOUND[kind]);
    if (kind === 'lightning') boltFx(side);
    if (kind === 'fire') iconPop(side, 'fireball');
    if (kind === 'burn') iconPop(side, 'burn', 'small');
    if (kind === 'bleed') iconPop(side, 'bleed', 'small');
    if (kind === 'thorns') iconPop(side, 'thorns', 'small');
    if (kind === 'frost') iconPop(side, 'frozen');
    if (absorbed > 0) {
      if (broke) { play('shieldBreak'); shieldFx(side, 'break'); }
      else { if (!ELEMENTAL.has(kind)) play('block'); shieldFx(side, 'hit'); }
      floatText(side, `${absorbed} blocked`, 'blocked');
    }
    if (dealt > 0) {
      if (!ELEMENTAL.has(kind)) play(HIT_SOUND[kind] || 'hit');
      if (side === 'player' && !ELEMENTAL.has(kind)) play('hurt');
      sparks(side, SPARKS[kind] || SPARKS.raw, kind === 'heavy' ? 20 : kind === 'burn' || kind === 'bleed' ? 6 : 12, { spread: kind === 'heavy' ? 110 : 75, size: kind === 'heavy' ? 1.4 : 1 });
      recoil(side, kind === 'heavy' ? 26 : kind === 'burn' || kind === 'bleed' ? 5 : 13);
      flash(side);
      floatText(side, `-${dealt}`, 'dmg');
    }
  }

  function handle(ev) {
    const s = ev.side;
    switch (ev.type) {
      case 'act':
        if (ev.style === 'melee') { play('swing'); lunge(s, 70); }
        else if (ev.style === 'heavy') { play('heavySwing'); lunge(s, 100, 6, 380); }
        else if (ev.style === 'cast') {
          lunge(s, 18, 0, 300); hop(s, 8);
          if (ev.element === 'fire') { play('fireCast'); projectile(s, 'fireball', '#ff8a2c'); }
          else if (ev.element === 'frost') { play('frostCast'); projectile(s, 'frost_arrow', '#8fd3ff'); }
          else if (ev.element === 'chill') { play('chill'); projectile(s, 'skull', '#6fd3ff'); }
          else if (ev.element === 'slime') { play('slime'); projectile(s, 'slime', '#8fd060'); }
          else if (ev.element === 'thorn') { play('swing'); projectile(s, 'thorns', '#a7c47a'); }
          else if (ev.element === 'hex') { play('hex'); projectile(s, 'weakened', '#b48cff'); }
        } else if (ev.style === 'guard') lunge(s, -12, 0, 260);
        else if (ev.style === 'windup') { play('windup'); hop(s, 16, 500); }
        break;
      case 'damage': onDamage(ev); break;
      case 'block': play('defend'); shieldFx(s, 'up'); floatText(s, `+${ev.amount} block`, 'blocked'); break;
      case 'status':
        if (ev.op === 'add') {
          if (ev.id === 'stunned') { play('stun'); wobble(s); }
          else if (ev.id === 'staggered') { play('stagger'); wobble(s); }
          else if (ev.id === 'lightning') { play('lightningOn'); sparks(s, SPARKS.lightning, 14, { spread: 90 }); }
          else if (ev.id === 'enraged') { play('stagger'); hop(s, 14); sparks(s, ['#ff6a4a', '#ffcf4a'], 10, { spread: 70 }); }
          else if (ev.id === 'thorns') { play('scavenge'); sparks(s, SPARKS.thorns, 12, { spread: 80 }); }
          else if (ev.id === 'weakened' || ev.id === 'slowed' || ev.id === 'bleed') wobble(s);
        } else if (ev.op === 'remove' && ev.id === 'lightning') play('lightningOff');
        else if (ev.op === 'immune') { play('immune'); floatText(s, 'Immune', 'blocked'); }
        break;
      case 'stunSkip': play('stun'); wobble(s); floatText(s, 'Stunned!', 'blocked'); break;
      case 'drain': play('drain'); floatText(s, `-${ev.amount} mana`, 'mana'); sparks(s, ['#6fb0f2', '#bfe6ff'], 10, { spread: 60 }); break;
      case 'item': play('potion'); break;
      case 'restore':
        if (ev.side === 'enemy' && ev.res === 'hp') play('heal');
        if (ev.amount) floatText(s, `+${ev.amount}${ev.res === 'hp' ? '' : ' ' + ev.res}`, ev.res === 'hp' ? 'heal' : ev.res);
        sparks(s, ev.res === 'hp' ? ['#8be07a', '#d8ffcc'] : ev.res === 'mana' ? ['#6fb0f2', '#bfe6ff'] : ['#e6c75a', '#fff1b0'], 8, { spread: 50 });
        break;
      case 'turn': play('turn'); break;
      case 'equip': play('equip'); break;
      case 'unequip': play('unequip'); break;
      case 'end': play(ev.result === 'won' ? 'victory' : 'defeat'); break;
    }
  }

  return { handle, floatText };
})();
