'use strict';
/* Painted icons (WoW-style "Painted Classic").
   Every icon is a subject (a list of shapes) painted over a full-bleed background in
   its theme colour. Icons are generated once into a hidden SVG sprite sheet and
   referenced with <use>, so drawing many tiles stays cheap.
   iconSVG(name)                  -> full square icon (tiles, tooltips)
   iconSVG(name, cls, {bare})     -> the subject alone on transparent (badges, effects, map)
   iconSVG(name, cls, {tint})     -> full icon with the background tinted (item variants) */

const C = {
  steel: '#cfd6db', steelD: '#8a949b', dark: '#2e3236', gold: '#e0aa48', bronze: '#c8913a', bronzeD: '#8a5f1e',
  red: '#c4452f', orange: '#f08a2c', yellow: '#f4d35e', blue: '#5aa0e0', blueD: '#2f6aa8', green: '#6fae5a',
  wood: '#8a5a30', woodD: '#5a3a1e', leather: '#6a3e1e', parch: '#f2ead8', ice: '#bfe6ff', skin: '#e0b48c', purple: '#9b6bd1',
};
const _hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const _toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const cmix = (a, b, t) => _toHex(_hex(a).map((v, i) => v + (_hex(b)[i] - v) * t));
const clight = (c, t) => cmix(c, '#ffffff', t);
const cdark = (c, t) => cmix(c, '#000000', t);
const circ = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
const starPath = (cx, cy, r, inner = 0.45, n = 5, rot = -90) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = ((rot + (i * 180) / n) * Math.PI) / 180, rr = i % 2 ? r * inner : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`); }
  return `M${pts.join(' L')}Z`;
};
const sparkle = (x, y, r) => `M${x} ${y - r * 3}L${x + r} ${y}L${x} ${y + r * 3}L${x - r} ${y}Z M${x - r * 3} ${y}L${x} ${y - r}L${x + r * 3} ${y}L${x} ${y + r}Z`;

/* part helpers: s(d, colour, opts) = shaded shape; f() = flat shape, no outline; ln() = stroke-only line */
const s = (d, c, o = {}) => ({ d, c, ...o });
const f = (d, c, o = {}) => ({ d, c, flat: 1, noline: 1, ...o });
const ln = (d, c, w = 1, o = {}) => ({ d, c, line: 1, w, ...o });
const ROT = 'rotate(45 32 32)';

/* ---- reusable subjects ---- */
const swordParts = (blade = '#e2e8ec', tf = ROT, gem = '#c8243a') => [
  s('M28.6 5 L32 0.6 L35.4 5 L35.8 39 L28.2 39 Z', blade, { tf }),
  f('M32 0.6 L35.4 5 L35.8 39 L32 39 Z', cdark(blade, 0.3), { tf }),
  ln('M32 6 L32 36.5', cdark(blade, 0.45), 1.1, { tf }),
  s('M17 39.5 Q32 36.5 47 39.5 L47 44.5 Q32 41.5 17 44.5 Z', C.gold, { tf }),
  s(circ(16.5, 42, 2.6), C.gold, { tf }), s(circ(47.5, 42, 2.6), C.gold, { tf }),
  s(circ(32, 41.6, 2.7), gem, { tf }),
  s('M29.3 44.5 L34.7 44.5 L34.7 56 L29.3 56 Z', C.leather, { tf }),
  ln('M29.3 46.5 L34.7 48.5 M29.3 49.5 L34.7 51.5 M29.3 52.5 L34.7 54.5', '#2e1a0c', 1, { tf }),
  s(circ(32, 59.2, 4), C.gold, { tf }), f(circ(32, 59.2, 1.6), '#4aa0e0', { tf }),
];
const flaskParts = (liquid, glow) => [
  s('M26.5 13 L37.5 13 L37.5 22 C48 25.5 55 33.5 55 43.5 C55 55 45 63 32 63 C19 63 9 55 9 43.5 C9 33.5 16 25.5 26.5 22 Z', '#d8eef4', { a: 0.3 }),
  s('M10.2 41 C17 36.5 25 43 32 38.5 C39 34 47 41 53.8 37.5 C54.6 39.4 55 41.4 55 43.5 C55 55 45 63 32 63 C19 63 9 55 9 43.5 C9 42.6 9.6 41.8 10.2 41 Z', liquid),
  ln('M13 42 C19 39 25 44 32 40.5 C39 37 46 42 51 40', glow, 1.4),
  f(circ(22, 50, 2), glow), f(circ(36, 55, 1.5), glow), f(circ(43, 47, 1.1), glow),
  ln('M26.5 13 L37.5 13 L37.5 22 C48 25.5 55 33.5 55 43.5 C55 55 45 63 32 63 C19 63 9 55 9 43.5 C9 33.5 16 25.5 26.5 22 Z', '#e8f6fa', 1.2, { op: 0.7 }),
  s('M24.5 11 L39.5 11 L39.5 15.5 L24.5 15.5 Z', '#b0bcc4'),
  s('M27 2.5 L37 2.5 L37.6 11 L26.4 11 Z', '#a8743c'),
  s('M25 3.5 Q32 -0.5 39 3.5 L39 6.5 Q32 3.6 25 6.5 Z', '#a0202a'),
  ln('M15.5 35 C16.5 29.5 20.5 26.5 25 25.5', '#ffffff', 2.4),
  f(circ(48, 50, 1.6), '#ffffff'),
];
const shieldOutline = 'M32 4 L54 10 L54 30 C54 46 44 56 32 61 C20 56 10 46 10 30 L10 10 Z';

/* theme: background hue · glow: light behind the subject */
const ICON_DEFS = {
  sword: { theme: '#3d5f86', glow: '#bfe0ff', parts: swordParts() },
  hammer: { theme: '#4a4f5e', glow: '#ffe0b0', parts: [
    s('M30 16 L34 16 L34 58 L30 58 Z', '#7a4a24', { tf: ROT }),
    ln('M30 40 L34 42 M30 44 L34 46 M30 48 L34 50 M30 52 L34 54', '#3a2210', 1, { tf: ROT }),
    s('M12 4 L52 4 Q55 11 52 18 L12 18 Q9 11 12 4 Z', '#c8d0d6', { tf: ROT }),
    f('M12 11 L52 11 Q55 11 52 18 L12 18 Q9 11 12 11 Z', '#8a949b', { tf: ROT }),
    s('M29 2.5 L35 2.5 L35 19.5 L29 19.5 Z', C.gold, { tf: ROT }),
    s(circ(32, 60, 3.4), C.gold, { tf: ROT }),
    ln('M14 7 L22 7', '#ffffff', 1.4, { tf: ROT, op: 0.7 }),
  ] },
  shield: { theme: '#3d4f6a', glow: '#cfe6ff', parts: [
    s(shieldOutline, '#34589a'),
    ln('M32 9 L49.5 14 L49.5 30 C49.5 43 41 51.5 32 56 C23 51.5 14.5 43 14.5 30 L14.5 14 Z', C.gold, 2.4),
    s('M16 36 L32 24 L48 36 L48 44 L32 32 L16 44 Z', '#e4e9ec'),
    s(circ(32, 18, 3.2), C.gold),
    ln('M14 12 L30 7', '#ffffff', 1.4, { op: 0.6 }),
  ] },
  block: { theme: '#4a5a6a', glow: '#d8ecff', parts: [
    s(shieldOutline, '#aab8c2'),
    f('M32 8 L50 13 L50 30 C50 44 42 52 32 57 Z', '#8795a0'),
    ln('M32 8 L32 57', '#6c7a86', 1.2),
    ln('M14 12 L30 7', '#ffffff', 1.6, { op: 0.7 }),
  ] },
  fireball: { theme: '#8a2a08', glow: '#ffb050', parts: [
    s('M40 5 C55 5 63 18 59 31 C56 41 47 47 37 47 C29 53 20 57 4 61 C13 52 17 46 19 40 C13 35 15 25 21 21 C24 11 30 5 40 5 Z', '#d8401a'),
    s('M40 11 C51 11 56 21 54 30 C52 38 45 42 37 42 C30 46 22 51 13 55 C19 48 22 43 23 37 C20 32 22 24 28 20 C30 14 34 11 40 11 Z', '#f08a2c'),
    s(circ(40, 26, 11), '#ffd25a'), f(circ(41, 25, 5.5), '#fffbe8'),
    ln('M30 30 C34 38 44 38 48 32 M27 23 C29 17 36 14 42 15', '#fff1b0', 1.4),
    f(circ(12, 44, 1.3), '#ffd25a'), f(circ(22, 56, 1), '#ffd25a'), f(circ(55, 46, 1.2), '#ffd25a'), f(circ(8, 34, 0.9), '#ffd25a'),
  ] },
  burn: { theme: '#7a2208', glow: '#ffa040', parts: [
    s('M32 2 C36 14 50 20 50 36 C50 50 42 60 32 60 C22 60 14 50 14 38 C14 28 20 24 22 16 C26 22 28 22 30 16 C31 11 31 7 32 2 Z', '#d8401a'),
    s('M32 18 C35 28 44 32 43 42 C42 51 37 55 32 55 C26 55 21 50 21 43 C21 35 28 32 32 18 Z', '#f08a2c'),
    s('M32 34 C34 40 38 42 37 47 C36 51 34 52 32 52 C29 52 27 50 27 47 C27 42 31 40 32 34 Z', '#ffe27a'),
    f(circ(18, 18, 1.2), '#ffd25a'), f(circ(48, 14, 1), '#ffd25a'), f(circ(52, 28, 0.9), '#ffd25a'),
  ] },
  frost_arrow: { theme: '#1f4f7a', glow: '#a8e4ff', parts: [
    s('M30.6 14 L33.4 14 L33.4 52 L30.6 52 Z', '#bfe6ff', { tf: ROT }),
    s('M32 0.5 L41 16 L32 12.5 L23 16 Z', '#eafaff', { tf: ROT }),
    ln('M32 1 L32 12.5', '#7ab8e0', 1, { tf: ROT }),
    s('M32 44 L41 60 L32 55.5 L23 60 Z', '#5aa0e0', { tf: ROT }),
    s('M10 52 L14 46 L18 52 L14 58 Z', '#dff4ff'), s('M48 8 L51 4 L54 8 L51 12 Z', '#dff4ff'), s('M50 48 L52.5 44 L55 48 L52.5 52 Z', '#dff4ff'),
    ln('M6 30 L14 30 M10 26 L10 34 M7 27 L13 33 M13 27 L7 33', '#eafaff', 1.2, { op: 0.8 }),
  ] },
  frozen: { theme: '#1f4f7a', glow: '#bfeaff', parts: [
    ...[0, 60, 120].map((r) => s('M30 4 L34 4 L34 60 L30 60 Z', '#d6f2ff', { tf: `rotate(${r} 32 32)` })),
    ...[0, 60, 120, 180, 240, 300].map((r) => s('M32 10 L39 4 L41 7 L32 15 L23 7 L25 4 Z', '#eafaff', { tf: `rotate(${r} 32 32)` })),
    s('M32 22 L41 27 L41 37 L32 42 L23 37 L23 27 Z', '#a8dcf8'), f(circ(32, 32, 4), '#ffffff'),
  ] },
  lightning_shield: { theme: '#3a1f6a', glow: '#c8a8ff', parts: [
    s(circ(32, 32, 27), '#3a2f6a'), ln(circ(32, 32, 22.5), '#b48cff', 1.6, { op: 0.8 }),
    ln('M10 22 Q4 32 10 42 M54 22 Q60 32 54 42', '#d8c4ff', 1.6),
    s('M35 7 L18 34 L29 34 L25 57 L46 27 L34.5 27 Z', '#f6dc6a'),
    f('M35 7 L29 25 L34.5 27 Z', '#fff6c8'),
  ] },
  bolt: { theme: '#3a1f6a', glow: '#c8a8ff', parts: [s('M35 3 L14 35 L28 35 L23 61 L50 25 L35.5 25 Z', '#f6dc6a'), f('M35 3 L27 27 L35.5 25 Z', '#fff6c8')] },
  flask_red: { theme: '#6a1a24', glow: '#ff9a9a', parts: flaskParts('#c8202e', '#ff9a9a') },
  flask_blue: { theme: '#1a3a7a', glow: '#a8d4ff', parts: flaskParts('#2f7fd8', '#a8d4ff') },
  flask_green: { theme: '#2a5a1a', glow: '#c0f0a0', parts: flaskParts('#4caa38', '#c0f0a0') },
  bread: { theme: '#5a3a1a', glow: '#ffd890', parts: [
    s('M5 40 C5 25 17 17 32 17 C47 17 59 25 59 40 L59 44 C59 48 55 51 51 51 L13 51 C9 51 5 48 5 44 Z', '#b8743a'),
    s('M7 38 C7 26 18 20 32 20 C46 20 57 26 57 38 C49 41 15 41 7 38 Z', '#dc9e54'),
    ln('M17 27 L13 35 M27 23 L25 33 M37 23 L39 33 M47 27 L51 35', '#7a4a1a', 2.2),
    f(circ(20, 45, 2.2), '#5b2a6e'), f(circ(30, 46.5, 2), '#5b2a6e'), f(circ(42, 45.5, 2.2), '#5b2a6e'),
    ln('M12 30 C16 25 22 23 26 22', '#fff0c8', 1.6, { op: 0.7 }),
  ] },
  helm: { theme: '#4a5a6a', glow: '#e0ecff', parts: [
    s('M32 6 C27 -1 44 -4 52 4 C46 4 41 6 37 11 Z', '#b0302a'),
    s('M14 36 C14 16 22 6 32 6 C42 6 50 16 50 36 L50 50 C50 54 46 58 42 58 L22 58 C18 58 14 54 14 50 Z', '#cfd7dd'),
    s('M21 30 L43 30 L43 52 L21 52 Z', '#e0b48c'),
    f(circ(27.5, 39, 1.8), '#2e1f14'), f(circ(36.5, 39, 1.8), '#2e1f14'), ln('M28 47 Q32 49 36 47', '#6a3e1e', 1.3),
    s('M16 24 Q32 16 48 24 L48 30.5 L16 30.5 Z', '#8a949b'),
    s('M14 32 L21 32 L21 54 L14 50 Z', '#aab4bc'), s('M50 32 L43 32 L43 54 L50 50 Z', '#aab4bc'),
    ln('M18 15 Q24 10 30 9', '#ffffff', 1.6, { op: 0.7 }),
  ] },
  armor: { theme: '#4a5a6a', glow: '#e0ecff', parts: [
    s('M14 12 L24 5 L40 5 L50 12 L59 24 L50 30 L50 57 L14 57 L14 30 L5 24 Z', '#c3ccd3'),
    s('M5 24 L14 12 L22 20 L14 30 Z', '#aab4bc'), s('M59 24 L50 12 L42 20 L50 30 Z', '#aab4bc'),
    s('M24 5 Q32 13 40 5 L40 9 Q32 17 24 9 Z', '#8a949b'),
    ln('M32 15 L32 47', '#7d8892', 1.6), ln('M20 30 Q32 36 44 30', '#7d8892', 1.4),
    s('M14 47 L50 47 L50 53 L14 53 Z', C.leather), s('M28.5 45.5 L35.5 45.5 L35.5 54.5 L28.5 54.5 Z', C.gold),
    ln('M18 16 L24 12', '#ffffff', 1.6, { op: 0.7 }),
  ] },
  legs: { theme: '#4a5a6a', glow: '#e0ecff', parts: [
    s('M13 5 L30 5 L28 50 L16 50 Z', '#c3ccd3'), s('M34 5 L51 5 L48 50 L36 50 Z', '#c3ccd3'),
    s('M12 5 L52 5 L52 11 L12 11 Z', C.leather),
    s(circ(22, 25, 4.6), C.gold), s(circ(42, 25, 4.6), C.gold),
    s('M11 48 L30 48 L31 59 L8 59 Q8 52 11 48 Z', '#6c7a86'), s('M34 48 L53 48 Q56 53 56 59 L33 59 Z', '#6c7a86'),
    ln('M17 14 L18 20 M38 14 L39 20', '#ffffff', 1.4, { op: 0.6 }),
  ] },
  gloves: { theme: '#4a5a6a', glow: '#e0ecff', parts: [
    s('M18 58 L18 40 L11 28 L16.5 24.5 L22 32 L22 13 C22 9 27.5 9 27.5 13 L27.5 30 L28.5 8 C28.5 4 34 4 34 8 L33.5 30 L35 10 C35 6 40.5 6 40.5 10 L39.5 32 L42 17 C42 13 47 13 47 17 L45.5 42 L44 58 Z', '#c3ccd3'),
    ln('M22 21 L27.5 21 M28.5 18 L34 18 M35 20 L40 20 M22 27 L27.5 27 M28.5 25 L33.6 25 M35 27 L39.6 27', '#7d8892', 1.2),
    s('M16.5 47 L45.5 47 L45 59 L17 59 Z', C.leather), ln('M17 51 L45 51', C.gold, 1.6),
  ] },
  ring: { theme: '#5a4a1a', glow: '#fff0b0', parts: [
    s('M11 41 a21 16 0 1 0 42 0 a21 16 0 1 0 -42 0 Z M17 41 a15 10.5 0 1 0 30 0 a15 10.5 0 1 0 -30 0 Z', C.gold, { rule: 1 }),
    s('M23 21 L41 21 L37 29.5 L27 29.5 Z', C.gold),
    s('M32 4 L43 15 L32 28 L21 15 Z', '#3a8ae0', { gem: 1 }),
    ln('M21 15 L43 15 M32 4 L27 15 L32 28 M32 4 L37 15 L32 28', '#ffffff', 0.9, { op: 0.6 }),
    ln('M15 38 C17 33 22 30 28 29', '#fff6c8', 1.6, { op: 0.7 }),
  ] },
  hood: { theme: '#3a2a5a', glow: '#d8c4ff', parts: [
    s('M32 4 C16 4 8 20 8 36 C8 46 12 54 16 60 L48 60 C52 54 56 46 56 36 C56 20 48 4 32 4 Z', '#4c3f78'),
    s('M8 36 C8 46 12 54 16 60 L24 60 C18 52 16 44 16 36 Z', '#3a2e5e'),
    f('M20 34 C20 21 25 15 32 15 C39 15 44 21 44 34 L44 56 L20 56 Z', '#140e20'),
    f(circ(27.5, 34, 2), '#f4d35e'), f(circ(36.5, 34, 2), '#f4d35e'),
    ln('M17 57 L47 57', C.gold, 2.4), ln('M18 20 C22 12 28 8 34 8', '#c8b4f0', 1.4, { op: 0.6 }),
  ] },
  backpack: { theme: '#5a3a1a', glow: '#ffd8a0', parts: [
    s(circ(32, 10, 18, 5), '#7a8a5a'), ln('M16 10 L48 10', '#4a5a2a', 1.4),
    s('M15 14 C15 8 20 5 32 5 C44 5 49 8 49 14', '#4a2e18', { line: 1, w: 3.5 }),
    s('M9 16 C9 13 11 12 14 12 L50 12 C53 12 55 13 55 16 L55 54 C55 58 52 60 48 60 L16 60 C12 60 9 58 9 54 Z', '#8a5a30'),
    s('M9 16 C9 13 11 12 14 12 L50 12 C53 12 55 13 55 16 L55 30 Q32 38 9 30 Z', '#6a4220'),
    s('M16 38 L48 38 L48 54 L16 54 Z', '#7a4c26'),
    s('M28 26 L36 26 L36 36 L28 36 Z', C.gold), f(circ(32, 31, 1.4), '#3a2210'),
    ln('M13 20 L13 52 M51 20 L51 52', '#4a2e18', 2.4),
  ] },
  lore: { theme: '#4a2a1a', glow: '#ffe0a0', parts: [
    s('M3 14 Q16 8 32 15 L32 56 Q16 49 3 55 Z', '#f2ead8'),
    s('M61 14 Q48 8 32 15 L32 56 Q48 49 61 55 Z', '#e6d8b8'),
    ln('M9 22 Q17 19 26 22 M9 29 Q17 26 26 29 M9 36 Q17 33 26 36 M38 22 Q46 19 55 22 M38 29 Q46 26 55 29', '#8a7a5c', 1.4),
    s('M44 15 L50 15 L50 60 L47 56 L44 60 Z', '#b0302a'),
    s(circ(41, 44, 5.5), '#a0202a'), ln(starPath(41, 44, 3, 0.45), '#ffb0a0', 0.8),
  ] },
  swap: { theme: '#5a4a2a', glow: '#ffe8b0', parts: [
    s('M8 22 L44 22 L44 14 L58 26 L44 38 L44 30 L8 30 Z', '#f2ead8'),
    s('M56 42 L20 42 L20 34 L6 46 L20 58 L20 50 L56 50 Z', '#e0aa48'),
  ] },
  hourglass: { theme: '#5a3a1a', glow: '#ffe0a0', parts: [
    s('M15 9 L49 9 C49 22 37 27 37 32 C37 37 49 42 49 55 L15 55 C15 42 27 37 27 32 C27 27 15 22 15 9 Z', '#d8eef4', { a: 0.35 }),
    s('M19 13 L45 13 C45 20 35 25 32 29 C29 25 19 20 19 13 Z', '#f4d35e'),
    s('M18 52 L46 52 C45 44 36 40 32 40 C28 40 19 44 18 52 Z', '#f4d35e'),
    ln('M32 30 L32 50', '#f4d35e', 1.4),
    s('M10 4 L54 4 L54 10 L10 10 Z', '#7a4a24'), s('M10 54 L54 54 L54 60 L10 60 Z', '#7a4a24'),
    s('M12 10 L15 10 L15 54 L12 54 Z', '#5a3a1e'), s('M49 10 L52 10 L52 54 L49 54 Z', '#5a3a1e'),
  ] },
  stagger: { theme: '#5a4a1a', glow: '#fff0a0', parts: [
    ln(circ(32, 34, 22, 9), '#f4d35e', 2, { op: 0.8 }),
    s(starPath(32, 18, 9), '#f4d35e'), s(starPath(12, 38, 7), '#f4d35e'), s(starPath(52, 38, 7), '#f4d35e'), s(starPath(32, 46, 5), '#fff3b0'),
  ] },
  stun: { theme: '#3a2a5a', glow: '#f4d35e', parts: [
    ln('M32 32 C32 28 37 28 37 32 C37 38 28 39 27 32 C26 23 40 21 42 31 C44 42 30 46 23 40 C14 32 20 15 33 15 C46 15 52 26 50 36', '#f4d35e', 3.4),
    s(starPath(52, 14, 6), '#fff3b0'), s(starPath(12, 50, 5), '#fff3b0'),
  ] },
  bleed: { theme: '#5a0a0a', glow: '#ff6a5a', parts: [
    s('M30 3 C25 16 13 25 13 37 A17 17 0 0 0 47 37 C47 25 35 16 30 3 Z', '#b3261e'),
    ln('M21 37 a9 9 0 0 0 9 9', '#ff8a7a', 2.6),
    s('M50 42 C48 47 45 49 45 52 a5 5 0 0 0 10 0 C55 49 52 47 50 42 Z', '#b3261e'),
    s('M52 18 C51 21 49 22 49 24 a3 3 0 0 0 6 0 C55 22 53 21 52 18 Z', '#b3261e'),
  ] },
  weakened: { theme: '#3a1f5a', glow: '#c8a8ff', parts: [
    s('M28.6 26 L35.4 26 L35.8 39 L28.2 39 Z', '#c8ced4', { tf: ROT }),
    s('M28.6 26 L31 23 L33 26.5 L35.4 24 L35.4 26 L28.6 26 Z', '#c8ced4', { tf: ROT }),
    ...swordParts('#c8ced4').slice(3).map((p) => ({ ...p })),
    s('M30 6 L33 2 L36 6 L36.5 18 L34 21 L32 18.5 L29.5 21 Z', '#c8ced4', { tf: 'rotate(45 32 32) translate(-3 -4) rotate(-14 32 12)' }),
    ln('M10 14 C14 10 18 12 20 8 M48 54 C52 52 54 56 58 52', '#c8a8ff', 1.6, { op: 0.8 }),
  ] },
  slowed: { theme: '#2a4a1a', glow: '#c8f0a0', parts: [
    s('M6 50 C6 44 12 42 18 42 L46 42 C50 42 54 40 56 36 L60 38 C58 46 54 52 46 52 L10 52 C8 52 6 51 6 50 Z', '#a8c870'),
    s(circ(32, 31, 16, 15), '#b8743a'),
    ln('M32 31 C32 27 37 27 37 31 C37 36 29 37 28 31 C27 24 39 22 41 30 C43 39 31 43 25 37', '#6a3e1e', 2.2),
    ln('M52 36 L50 26 M56 37 L57 27', '#a8c870', 2), f(circ(50, 25, 1.8), '#a8c870'), f(circ(57, 26, 1.8), '#a8c870'),
  ] },
  enraged: { theme: '#5a0a0a', glow: '#ff7a3a', parts: [
    s('M6 6 C10 18 14 22 20 24 L16 30 C10 26 6 18 6 6 Z', '#efe4c8'), s('M58 6 C54 18 50 22 44 24 L48 30 C54 26 58 18 58 6 Z', '#efe4c8'),
    s('M32 14 C18 14 12 26 14 38 C15 48 22 56 32 58 C42 56 49 48 50 38 C52 26 46 14 32 14 Z', '#5a1a14'),
    s('M18 33 L28 37 L26 41 L17 38 Z', '#ff5a2a'), s('M46 33 L36 37 L38 41 L47 38 Z', '#ff5a2a'),
    s('M24 48 L40 48 L37 53 L27 53 Z', '#2a0a06'), ln('M27 48 L28.5 51 L30 48 M34 48 L35.5 51 L37 48', '#efe4c8', 1),
    ln('M10 44 C6 46 4 50 6 54 M54 44 C58 46 60 50 58 54', '#ff9a5a', 1.6, { op: 0.8 }),
  ] },
  thorns: { theme: '#2a3a1a', glow: '#c8f0a0', parts: [
    s('M4 52 C14 40 22 34 30 30 C40 24 48 16 58 6 L60 9 C50 20 42 28 32 34 C24 38 16 44 7 55 Z', '#5b7a3a'),
    ...[[14, 43, -40], [22, 36, 10], [30, 31, -50], [38, 25, 20], [46, 18, -40], [52, 12, 30]].map(([x, y, r]) => s('M0 0 L-3 -9 L3 -1 Z', '#c8d89a', { tf: `translate(${x} ${y}) rotate(${r})` })),
    s(circ(50, 38, 7), '#c43a5a'), s(circ(50, 38, 3.4), '#e86a8a'), s('M44 44 L38 50 L46 47 Z', '#5b7a3a'),
  ] },
  dagger: { theme: '#4a4a4a', glow: '#e0e0e0', parts: [
    s('M29 18 L32 10 L35 18 L35.5 40 L28.5 40 Z', '#b9c0c4', { tf: ROT }), f('M32 10 L35 18 L35.5 40 L32 40 Z', '#8d959b', { tf: ROT }),
    f(circ(30.5, 27, 1.6), '#8a5a30', { tf: ROT }), f(circ(33, 33, 1.2), '#8a5a30', { tf: ROT }),
    s('M23 40 L41 40 L41 44 L23 44 Z', '#6a4220', { tf: ROT }), s('M29.5 44 L34.5 44 L34.5 54 L29.5 54 Z', '#4a2e18', { tf: ROT }), s(circ(32, 56.5, 3), '#6a4220', { tf: ROT }),
  ] },
  flurry: { theme: '#5a1a1a', glow: '#ffb0a0', parts: [
    ...[[-12, 0], [0, 0], [12, 0]].map(([dx]) => s(`M${14 + dx} 6 Q${30 + dx} 30 ${46 + dx} 58 L${42 + dx} 59 Q${26 + dx} 32 ${12 + dx} 8 Z`, '#f2ead8')),
    ...[[-12], [0], [12]].map(([dx]) => ln(`M${16 + dx} 10 Q${30 + dx} 32 ${43 + dx} 55`, '#c4261e', 1.6)),
  ] },
  buckler: { theme: '#5a3a1a', glow: '#ffd8a0', parts: [
    s(circ(32, 32, 27), '#8a5a30'), ln(circ(32, 32, 21), '#5a3a1e', 2), ln('M9 32 L55 32 M32 9 L32 55', '#5a3a1e', 1.6),
    s(circ(32, 32, 9), '#9aa6af'), f(circ(29, 29, 3), '#e4e9ec'),
    ...[0, 90, 180, 270].map((r) => f(circ(32, 8.5, 1.6), '#c8d0d6', { tf: `rotate(${r + 45} 32 32)` })),
  ] },
  cleave: { theme: '#4a2a2a', glow: '#ff8a7a', parts: [
    ...swordParts('#b9a089', 'rotate(45 32 32) translate(0 2)', '#5a8a3a'),
    s('M4 44 Q22 62 52 54 Q30 56 12 40 Z', '#e04a3a', { a: 0.9 }),
  ] },
  skull: { theme: '#1a3a5a', glow: '#9fe0ff', parts: [
    ln('M8 54 C14 46 10 38 16 30 M56 54 C50 46 54 38 48 30', '#9fe0ff', 1.6, { op: 0.6 }),
    s('M32 4 C19 4 11 13 11 25 C11 33 15 38 19 41 L19 51 L45 51 L45 41 C49 38 53 33 53 25 C53 13 45 4 32 4 Z', '#d8e6ee'),
    s(circ(23, 27, 6.5, 7), '#1a3a5a'), s(circ(41, 27, 6.5, 7), '#1a3a5a'), f(circ(23, 27, 2.6), '#bff0ff'), f(circ(41, 27, 2.6), '#bff0ff'),
    s('M29 35 L32 41 L35 35 Z', '#1a3a5a'), ln('M25 51 L25 45 M32 51 L32 45 M39 51 L39 45', '#2e3236', 1.6),
  ] },
  tower: { theme: '#2a3a2a', glow: '#d8f0c8', parts: [
    s('M10 5 L54 5 L54 34 C54 47 44 56 32 61 C20 56 10 47 10 34 Z', '#6c7a74'),
    ln('M32 7 L32 58 M12 22 L52 22', '#3f4a45', 3),
    s(circ(17, 12, 4), '#5b8a45'), s(circ(44, 38, 5), '#5b8a45'), s(circ(22, 44, 3), '#5b8a45'),
    f(circ(32, 22, 3.5), '#c8913a'), ln('M14 8 L28 8', '#e0ecf0', 1.4, { op: 0.6 }),
  ] },
  overhead: { theme: '#5a1a1a', glow: '#ff9a7a', parts: [
    ...swordParts('#b9a089', 'translate(0 2)', '#5a8a3a'),
    s('M6 22 L13 12 L20 22 L16 22 L16 30 L10 30 L10 22 Z', '#e04a3a'), s('M44 22 L51 12 L58 22 L54 22 L54 30 L48 30 L48 22 Z', '#e04a3a'),
  ] },
  slam: { theme: '#5a2a0a', glow: '#ffb050', parts: [
    s(starPath(32, 48, 18, 0.45, 8, -90), '#f08a2c'), s(starPath(32, 48, 10, 0.5, 8, -70), '#ffe27a'),
    ...swordParts('#b9a089', 'rotate(180 32 32) translate(0 18) scale(1 .75)', '#5a8a3a'),
  ] },
  slime: { theme: '#2a4a1a', glow: '#c8f0a0', parts: [
    s('M5 54 C5 32 16 16 32 16 C48 16 59 32 59 54 C59 58 56 60 52 60 L12 60 C8 60 5 58 5 54 Z', '#7cc04e', { a: 0.95 }),
    f(circ(19, 30, 6, 4.5), '#d8ffb8', { a: 0.7, tf: 'rotate(-30 19 30)' }),
    s(circ(24, 40, 6, 7), '#fbfff2'), s(circ(42, 40, 5, 6), '#fbfff2'), f(circ(22.5, 41.5, 2.6), '#1b1b12'), f(circ(40.5, 41.5, 2.3), '#1b1b12'),
    ln('M24 51 Q32 56 40 51', '#2c4a1c', 2), f(circ(48, 52, 2), '#c8f0a0', { a: 0.8 }),
  ] },
  heal: { theme: '#1a4a2a', glow: '#b8ffb0', parts: [
    s('M25 6 L39 6 L39 25 L58 25 L58 39 L39 39 L39 58 L25 58 L25 39 L6 39 L6 25 L25 25 Z', '#6ad460'),
    f('M25 6 L39 6 L39 25 L32 25 L32 58 L25 58 L25 39 L6 39 L6 25 L25 25 Z', '#9aec8a', { a: 0.6 }),
    f(sparkle(52, 12, 1.4), '#ffffff'), f(sparkle(12, 52, 1.1), '#ffffff'),
  ] },
  tusk: { theme: '#4a2a1a', glow: '#fff0d8', parts: [
    s('M8 58 C6 34 18 12 46 4 C34 16 28 32 28 58 Z', '#efe4c8'),
    f('M28 58 C28 32 34 16 46 4 C40 14 36 30 35 58 Z', '#d0c0a0'),
    s('M40 40 C44 44 48 46 54 46 C50 50 44 52 38 48 Z', '#b3261e'), f(circ(50, 54, 2.2), '#b3261e'),
  ] },
  monster: { theme: '#5a1a14', glow: '#ff8a5a', parts: [
    s('M8 4 C12 14 16 18 22 20 L18 26 C12 22 8 14 8 4 Z', '#e8dcc0'), s('M56 4 C52 14 48 18 42 20 L46 26 C52 22 56 14 56 4 Z', '#e8dcc0'),
    s('M32 12 C17 12 9 24 10 36 C11 48 20 58 32 58 C44 58 53 48 54 36 C55 24 47 12 32 12 Z', '#8a3a2c'),
    s('M16 30 L28 34 L26 39 L16 36 Z', '#f4d35e'), s('M48 30 L36 34 L38 39 L48 36 Z', '#f4d35e'),
    s('M20 45 Q32 54 44 45 L42 49 Q32 57 22 49 Z', '#2a0a06'),
    s('M24 46 L26 52 L28 47 Z', '#f2ead8'), s('M36 47 L38 52 L40 46 Z', '#f2ead8'),
  ] },
  chest: { theme: '#5a3a1a', glow: '#ffd890', parts: [
    s('M6 26 C6 14 16 8 32 8 C48 8 58 14 58 26 L58 30 L6 30 Z', '#9a6234'),
    s('M6 30 L58 30 L58 56 L6 56 Z', '#7a4a26'),
    ln('M6 40 L58 40 M6 48 L58 48', '#5a3a1e', 1.4),
    s('M14 9 L20 9 L20 56 L14 56 Z', '#5a6068'), s('M44 9 L50 9 L50 56 L44 56 Z', '#5a6068'), s('M5 27 L59 27 L59 32 L5 32 Z', '#5a6068'),
    s('M26 24 L38 24 L38 38 L26 38 Z', C.gold), f(circ(32, 30, 1.8), '#3a2210'),
    ln('M10 18 C14 13 22 11 28 11', '#ffe0b0', 1.4, { op: 0.6 }),
  ] },
  campfire: { theme: '#4a1a08', glow: '#ffb050', parts: [
    s('M8 54 L56 44 L57 50 L9 60 Z', '#6a4220'), s('M8 44 L56 54 L55 60 L7 50 Z', '#7a4c26'),
    s('M32 2 C36 13 48 18 47 32 C46 43 40 49 32 49 C24 49 17 43 17 34 C17 25 23 22 25 14 C28 19 30 18 31 13 C32 9 32 6 32 2 Z', '#e0561a'),
    s('M32 18 C35 27 42 30 41 38 C40 45 36 47 32 47 C27 47 23 44 23 38 C23 31 29 29 32 18 Z', '#f4a23a'),
    s('M32 32 C34 37 37 38 36 42 C35 45 33 46 32 46 C30 46 28 44 28 42 C28 38 31 37 32 32 Z', '#ffe7a0'),
  ] },
  star: { theme: '#6a4a0a', glow: '#fff0a0', parts: [s(starPath(32, 34, 28), '#f4c840'), s(starPath(32, 34, 14), '#fff1a8'), f(sparkle(52, 10, 1.4), '#ffffff')] },
  flag: { theme: '#4a2a1a', glow: '#ffd8a0', parts: [
    s('M12 4 L17 4 L17 60 L12 60 Z', '#7a4a24'), s(circ(14.5, 4, 3.5), C.gold),
    s('M17 8 L56 8 Q50 18 56 28 L17 28 Z', '#b0302a'),
    s(starPath(32, 18, 6), C.gold),
    f(circ(14.5, 60, 9, 2.5), '#000', { a: 0.3 }),
  ] },
};

/* ---- tint -> background hue for item variants ---- */
const TINT_BG = {
  steel: '#4a5a6a', wood: '#5a3a1a', fire: '#7a2208', ice: '#1f4f7a', storm: '#3a1f6a', blood: '#6a1414',
  mana: '#1a3a7a', stamina: '#2a5a1a', bronze: '#6a4a10',
};
/* ring gems follow their tint */
const TINT_GEM = { bronze: '#3a8ae0', fire: '#e0302a', stamina: '#3ac060', blood: '#c0203a', storm: '#9a5ae0', steel: '#9ad0f0' };

/* ---- rendering ---- */
const ICON_SHEET_ID = 'icon-sheet';
let iconSheet = null;
const iconCache = new Set();

function paintSubject(def, uid, overrides = {}) {
  let defs = '', body = '', n = 0;
  for (const p0 of def.parts) {
    const p = { ...p0 };
    if (p.gem && overrides.gem) p.c = overrides.gem;
    const tf = p.tf ? ` transform="${p.tf}"` : '';
    const op = p.op !== undefined ? ` stroke-opacity="${p.op}"` : '';
    if (p.line) {
      body += `<path d="${p.d}" fill="none" stroke="${p.c}" stroke-width="${p.w}" stroke-linecap="round" stroke-linejoin="round"${op}${tf}/>`;
      continue;
    }
    const gid = `${uid}g${n++}`;
    const alpha = p.a !== undefined ? ` fill-opacity="${p.a}"` : '';
    const rule = p.rule ? ' fill-rule="evenodd"' : '';
    let fill = p.c;
    if (!p.flat) {
      defs += `<linearGradient id="${gid}" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${clight(p.c, 0.3)}"/><stop offset=".5" stop-color="${p.c}"/><stop offset="1" stop-color="${cdark(p.c, 0.38)}"/></linearGradient>`;
      fill = `url(#${gid})`;
    }
    body += `<path d="${p.d}" fill="${fill}"${alpha}${rule}${tf}/>`;
    if (!p.noline) body += `<path d="${p.d}" fill="none" stroke="${cdark(p.c, 0.62)}" stroke-opacity=".9" stroke-width="1" stroke-linejoin="round"${rule}${tf}/>`;
  }
  return { defs, body };
}

function ensureIcon(name, tint, bare) {
  const def = ICON_DEFS[name] || ICON_DEFS.shield;
  const key = bare ? `icb-${name}` : `ic-${name}-${tint || 'd'}`;
  if (iconCache.has(key)) return key;
  if (!iconSheet) {
    iconSheet = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSheet.id = ICON_SHEET_ID;
    iconSheet.setAttribute('width', '0'); iconSheet.setAttribute('height', '0');
    iconSheet.setAttribute('aria-hidden', 'true');
    iconSheet.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    iconSheet.innerHTML = `<defs>
      <filter id="icn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .32 0"/></filter>
      <radialGradient id="icvig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
      <filter id="icsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#000" flood-opacity=".75"/></filter>
      <clipPath id="icclip"><rect width="64" height="64" rx="2"/></clipPath></defs>`;
    document.body.appendChild(iconSheet);
  }
  const uid = key.replace(/[^a-z0-9]/gi, '');
  const gem = name === 'ring' && tint ? TINT_GEM[tint] : null;
  const { defs, body } = paintSubject(def, uid, { gem });
  let inner;
  if (bare) {
    inner = `<g filter="url(#icsh)">${body}</g>`;
  } else {
    const theme = (tint && TINT_BG[tint]) || def.theme;
    const glow = def.glow;
    const bgDefs = `<radialGradient id="${uid}bg" cx=".55" cy=".4" r=".85"><stop offset="0" stop-color="${clight(theme, 0.25)}"/><stop offset=".55" stop-color="${theme}"/><stop offset="1" stop-color="${cdark(theme, 0.78)}"/></radialGradient>
      <radialGradient id="${uid}gl"><stop offset="0" stop-color="${glow}" stop-opacity=".7"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>`;
    inner = `<defs>${bgDefs}</defs><g clip-path="url(#icclip)"><rect width="64" height="64" fill="url(#${uid}bg)"/><rect width="64" height="64" filter="url(#icn)"/>
      <ellipse cx="33" cy="31" rx="27" ry="25" fill="url(#${uid}gl)"/><g filter="url(#icsh)">${body}</g>
      <rect width="64" height="64" fill="url(#icvig)"/><path d="M2 22 L2 2 L22 2" stroke="rgba(255,255,255,.2)" stroke-width="1" fill="none"/></g>`;
  }
  const sym = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
  sym.id = key;
  sym.setAttribute('viewBox', '0 0 64 64');
  sym.innerHTML = `<defs>${defs}</defs>${inner}`;
  iconSheet.appendChild(sym);
  iconCache.add(key);
  return key;
}

function iconSVG(name, extraClass = '', opts = {}) {
  const key = ensureIcon(name, opts.tint, opts.bare);
  return `<svg class="ico ${extraClass}${opts.bare ? ' bare' : ''}" viewBox="0 0 64 64" aria-hidden="true"><use href="#${key}"/></svg>`;
}
/* Raw subject markup (for effects that need a standalone SVG, e.g. the lightning bolt flash). */
function iconBody(name) { return paintSubject(ICON_DEFS[name], 'raw' + name).body; }
