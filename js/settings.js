'use strict';
/* Settings: background theme, combat-log mode, UI scale, sound, reduced motion.
   Also owns the 1920x1080 design canvas: the whole UI is laid out at that size and
   scaled uniformly to fit the window (Scale.toLocal converts mouse coordinates). */

const DESIGN_W = 1920, DESIGN_H = 1080;

const Settings = (() => {
  const KEY = 'mf.settings.v1';
  const defaults = { theme: 'oak', log: 'docked', scale: 1, reduceMotion: false };
  let state = { ...defaults };
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
  return {
    get: (k) => state[k],
    set(k, v) { state[k] = v; save(); apply(); },
    all: () => ({ ...state }),
  };
})();

/* ---------------------------------------------------------------- scaling */
const Scale = { s: 1, ox: 0, oy: 0 };
function fitCanvas() {
  const root = document.getElementById('root');
  if (!root) return;
  const fit = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
  const s = fit * (Settings.get('scale') || 1);
  Scale.s = s;
  Scale.ox = Math.round((window.innerWidth - DESIGN_W * s) / 2);
  Scale.oy = Math.round((window.innerHeight - DESIGN_H * s) / 2);
  root.style.transform = `translate(${Scale.ox}px, ${Scale.oy}px) scale(${s})`;
}
Scale.toLocal = (x, y) => ({ x: (x - Scale.ox) / Scale.s, y: (y - Scale.oy) / Scale.s });
Scale.rectLocal = (r) => { const a = Scale.toLocal(r.left, r.top); return { left: a.x, top: a.y, width: r.width / Scale.s, height: r.height / Scale.s }; };

/* ---------------------------------------------------------------- generated textures */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const svgURI = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/* Minecraft-like cobblestone: a 16x16 pixel tile of irregular stones with dark mortar. */
function cobbleTexture(palette = ['#8a8a86', '#7a7a76', '#6c6c68', '#9a9a95', '#5e5e5a'], mortar = '#3a3a37', seed = 11) {
  const R = rng(seed), N = 16, seeds = [];
  for (let i = 0; i < 9; i++) seeds.push({ x: R() * N, y: R() * N, c: palette[Math.floor(R() * palette.length)] });
  const owner = (x, y) => {
    let best = 0, bd = 1e9;
    seeds.forEach((sd, i) => { for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) { const d = (x + 0.5 - sd.x - dx) ** 2 + (y + 0.5 - sd.y - dy) ** 2; if (d < bd) { bd = d; best = i; } } });
    return best;
  };
  const grid = [];
  for (let y = 0; y < N; y++) { grid.push([]); for (let x = 0; x < N; x++) grid[y].push(owner(x, y)); }
  let rects = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const o = grid[y][x];
    const edge = grid[y][(x + 1) % N] !== o || grid[(y + 1) % N][x] !== o;
    let c = edge ? mortar : seeds[o].c;
    if (!edge) { const r = R(); if (r < 0.12) c = cmix(c, '#ffffff', 0.12); else if (r < 0.24) c = cmix(c, '#000000', 0.12); }
    rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
  }
  return svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`);
}

/* Pale birch planks with grain and dark lenticel marks. */
function birchTexture(seed = 5) {
  const R = rng(seed), W = 132, H = 600;
  let marks = '';
  const shades = ['#e6d8b8', '#dccca6', '#e9dcc0', '#d6c49c'];
  let planks = '';
  for (let i = 0; i < 4; i++) {
    planks += `<rect x="${i * W}" y="0" width="${W}" height="${H}" fill="${shades[i]}"/>`;
    for (let k = 0; k < 7; k++) { const x = i * W + 10 + R() * (W - 40), y = R() * H, w = 8 + R() * 22; marks += `<rect x="${x}" y="${y}" width="${w}" height="${1.6 + R() * 2.2}" rx="1" fill="#3a3024" opacity="${0.35 + R() * 0.4}"/>`; }
    planks += `<rect x="${i * W}" y="0" width="3" height="${H}" fill="#9a8a68"/>`;
  }
  const grain = `<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.6 0.012" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .18  0 0 0 .35 -.05"/></filter>`;
  return svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="${W * 4}" height="${H}"><defs>${grain}</defs>${planks}<rect width="100%" height="100%" filter="url(#g)"/>${marks}</svg>`);
}

/* Large dressed stone blocks for the castle hall. */
function ashlarTexture() {
  const R = rng(3);
  let blocks = '';
  for (let row = 0; row < 6; row++) {
    const off = row % 2 ? -60 : 0;
    for (let col = 0; col < 5; col++) {
      const c = cmix('#3a4250', R() < 0.5 ? '#2a303a' : '#48505e', R() * 0.6);
      blocks += `<rect x="${off + col * 120 + 2}" y="${row * 70 + 2}" width="116" height="66" rx="3" fill="${c}"/>`;
    }
  }
  return svgURI(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="420"><rect width="480" height="420" fill="#1a1e26"/>${blocks}</svg>`);
}

const THEMES = {
  oak: { name: 'Dark Oak', desc: 'Dark planks, grey stone, iron and bronze.' },
  birch: { name: 'Birch & Cobblestone', desc: 'Pale birch planks and chunky cobblestone panels.' },
  castle: { name: 'Castle Hall', desc: 'Slate walls, tapestries and torchlight; walnut panels.' },
  night: { name: 'Night Camp', desc: 'Starry night sky and dark leather panels.' },
};
let texturesReady = false;
function buildTextures() {
  if (texturesReady) return;
  const r = document.documentElement.style;
  r.setProperty('--tex-cobble', cobbleTexture());
  r.setProperty('--tex-cobble-dark', cobbleTexture(['#5e5e5a', '#545450', '#4a4a47', '#66665f', '#424240'], '#262624', 23));
  r.setProperty('--tex-birch', birchTexture());
  r.setProperty('--tex-ashlar', ashlarTexture());
  texturesReady = true;
}

/* ---------------------------------------------------------------- apply */
const LOG_MODES = { docked: 'Docked', blend: 'Blend-in', hidden: 'Hidden' };
function apply() {
  buildTextures();
  const html = document.documentElement;
  html.dataset.theme = Settings.get('theme');
  html.classList.toggle('reduce-motion', !!Settings.get('reduceMotion'));
  const app = document.getElementById('app');
  if (app) { for (const m of Object.keys(LOG_MODES)) app.classList.toggle('log-' + m, Settings.get('log') === m); }
  fitCanvas();
  if (typeof renderSettings === 'function' && !document.getElementById('modal').hidden && UI.settingsOpen) renderSettings();
}
function cycleLogMode() {
  const order = Object.keys(LOG_MODES);
  const next = order[(order.indexOf(Settings.get('log')) + 1) % order.length];
  Settings.set('log', next);
  if (typeof Fx !== 'undefined') Fx.toast(`Combat log: ${LOG_MODES[next]}`);
}

window.addEventListener('resize', fitCanvas);
