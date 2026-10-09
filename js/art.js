'use strict';
/* Character sprites, scenes and stage backdrops in the "Storybook Ink" style:
   flat colour, a crisp cel-shadow band and rim highlight on every shape, bold ink outlines.
   Shapes are plain data; renderInk() turns a shape list into an SVG string. */

const INK = '#1d140e';
let artSeq = 0;
const ac = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
/* part helpers: P = shaded shape, F = flat (no shading), N = flat without outline, Ln = ink/colour line, Raw = raw svg */
const P = (d, c, o = {}) => ({ d, c, ...o });
const F = (d, c, o = {}) => ({ d, c, flat: 1, ...o });
const N = (d, c, o = {}) => ({ d, c, flat: 1, noline: 1, ...o });
const Ln = (d, w = 2.4, c = null, o = {}) => ({ d, line: 1, w, c, ...o });
const Raw = (svg) => ({ raw: svg });

/* scale: shrinks shading offsets and outlines for small drawings */
function renderInk(parts, { vb = '0 0 240 340', ground = null, scale = 1, cls = 'sprite-svg', label = '' } = {}) {
  const id = 'ink' + (++artSeq);
  const defs = `<filter id="${id}c" x="-20%" y="-20%" width="140%" height="140%"><feOffset in="SourceAlpha" dx="${-7 * scale}" dy="${-6 * scale}" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="rim"/><feFlood flood-color="#1a0c06" flood-opacity=".42"/><feComposite in2="rim" operator="in" result="sh"/><feOffset in="SourceAlpha" dx="${3 * scale}" dy="${3 * scale}" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="rim2"/><feFlood flood-color="#fff" flood-opacity=".32"/><feComposite in2="rim2" operator="in" result="hl"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge></filter>`;
  let body = '';
  if (ground) { const [cx, cy, rx, ry] = ground; body += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(0,0,0,.45)"/>`; }
  const lw = 3.4 * scale;
  for (const p of parts) {
    if (p.raw) { body += p.raw; continue; }
    const tf = p.tf ? ` transform="${p.tf}"` : '';
    if (p.line) {
      body += `<path d="${p.d}" fill="none" stroke="${p.c || INK}" stroke-width="${p.w * scale}" stroke-linecap="round" stroke-linejoin="round"${p.op ? ` stroke-opacity="${p.op}"` : ''}${tf}/>`;
      continue;
    }
    const alpha = p.a !== undefined ? ` fill-opacity="${p.a}"` : '';
    body += `<path d="${p.d}" fill="${p.c}"${alpha}${p.flat ? '' : ` filter="url(#${id}c)"`}${tf}/>`;
    if (!p.noline) body += `<path d="${p.d}" fill="none" stroke="${INK}" stroke-width="${p.lw ? p.lw * scale : lw}" stroke-linejoin="round"${tf}/>`;
  }
  return `<svg viewBox="${vb}" class="${cls}" role="img"${label ? ` aria-label="${label}"` : ''} xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}

/* ---- palette ---- */
const K = {
  steel: '#c3ccd3', steelL: '#cfd7dd', steelD: '#8e99a2', bronze: '#d6a24a', red: '#a82e26', redD: '#6e1f1b', skin: '#e2b48c',
  leather: '#5a3a1e', blue: '#2f4f86', gob: '#8cb35c', gobD: '#7fa650', gobDD: '#6f9446',
};

/* ---------------------------------------------------------------- characters */
const KNIGHT_HEAD_PARTS = [
  P('M102 84 L138 84 L140 104 L100 104 Z', K.steelD),
  P(ac(120, 66, 20, 23), K.skin),
  P('M94 72 C92 34 104 20 120 20 C136 20 148 34 146 72 L140 78 L140 54 L100 54 L100 78 Z', K.steelL),
  P('M96 46 Q120 34 144 46 L145 56 L95 56 Z', K.steelD),
  P('M92 60 L102 60 L102 90 Q96 90 92 84 Z', K.steel), P('M148 60 L138 60 L138 90 Q144 90 148 84 Z', K.steel),
  P('M120 22 C108 0 142 -6 158 12 C146 10 136 16 130 28 Z', '#b0302a'),
  N(ac(112, 68, 2.6), INK), N(ac(128, 68, 2.6), INK),
  Ln('M106 61 q6 -3 11 0 M123 61 q6 -3 11 0 M120 70 l-2 8 l3 1 M113 83 q7 4 14 0', 2.2),
];

const CHARACTERS = {
  knight: { label: 'Knight in plate armour', ground: [120, 324, 82, 10], parts: [
    P('M86 100 C62 150 54 240 62 316 L180 316 C188 240 180 150 156 100 Z', K.redD),
    P('M92 206 L118 206 L117 298 L95 298 Z', K.steel), P('M124 206 L150 206 L147 298 L125 298 Z', K.steel),
    P(ac(106, 234, 10), K.bronze), P(ac(136, 234, 10), K.bronze),
    P('M84 296 L119 296 L121 314 L80 314 Q80 302 84 296 Z', '#5d6a74'), P('M124 296 L158 296 Q164 305 162 314 L123 314 Z', '#5d6a74'),
    P('M86 184 L154 184 L162 238 L134 242 L120 228 L106 242 L78 238 Z', K.red),
    P('M80 102 Q120 86 160 102 L155 192 L85 192 Z', K.steel),
    P('M98 108 L142 108 L139 190 L101 190 Z', K.red),
    F('M115 116 L125 116 L125 176 L115 176 Z', K.bronze), F('M104 132 L136 132 L136 141 L104 141 Z', K.bronze),
    P('M84 180 L156 180 L156 192 L84 192 Z', K.leather), P('M112 177 L128 177 L128 195 L112 195 Z', K.bronze),
    P('M150 110 L172 118 L178 168 L158 172 Z', K.steel),
    P('M170 46 L176 28 L182 46 L182 160 L170 160 Z', '#e8edf0', { tf: 'rotate(22 176 176)' }),
    Ln('M176 40 L176 156', 2, '#9aa6af', { tf: 'rotate(22 176 176)' }),
    P('M154 158 L198 158 L198 167 L154 167 Z', K.bronze, { tf: 'rotate(22 176 176)' }),
    P('M172 167 L180 167 L180 190 L172 190 Z', '#4a2e18', { tf: 'rotate(22 176 176)' }),
    P(ac(176, 196, 6), K.bronze, { tf: 'rotate(22 176 176)' }),
    P(ac(176, 170, 12, 11), K.steelD),
    P('M180 112 Q178 90 154 92 Q138 96 140 120 Q162 128 180 112 Z', K.steel),
    P('M60 116 L82 112 L84 160 L64 164 Z', K.steel),
    P('M24 118 L98 118 L98 182 Q98 228 61 252 Q24 228 24 182 Z', K.blue),
    Ln('M32 126 L90 126 L90 182 Q90 222 61 242 Q32 222 32 182 Z', 5, K.bronze),
    P('M36 170 L61 150 L86 170 L86 184 L61 164 L36 184 Z', '#dfe4e8'),
    P('M60 112 Q62 90 86 92 Q102 96 100 120 Q78 128 60 112 Z', K.steel),
    ...KNIGHT_HEAD_PARTS,
  ] },

  goblin: { label: 'Goblin cutpurse', ground: [118, 322, 76, 9], parts: [
    P('M128 250 L146 250 L150 300 L132 300 Z', K.gobDD), P('M130 298 L156 298 Q164 306 160 314 L128 314 Z', K.gobDD),
    P('M156 176 L180 214 L168 222 L146 190 Z', K.gobD), P(ac(172, 220, 9), K.gobD),
    P('M78 168 Q120 150 162 170 L170 256 Q120 266 70 256 Z', '#6b4a2b'),
    P('M92 216 L116 212 L118 236 L94 240 Z', '#8f6e44'), Ln('M95 219 L114 216 M96 236 L115 233', 1.6, '#3a2414'),
    P('M98 250 L116 250 L112 300 L94 300 Z', K.gobD), P('M86 298 L116 298 L118 314 L72 314 Q74 302 86 298 Z', K.gobD),
    Ln('M74 312 l-4 -6 M84 312 l-3 -7', 2),
    P('M72 218 Q120 228 168 218 L169 230 Q120 240 71 230 Z', '#3a2414'),
    P('M140 228 L158 226 L160 248 L142 250 Z', K.leather), P('M112 222 L126 222 L126 236 L112 236 Z', K.bronze),
    P('M84 158 Q120 174 158 158 L160 176 Q120 192 82 176 Z', '#8e2e28'), P('M148 168 L178 198 L164 204 L144 180 Z', '#8e2e28'),
    P('M84 176 L46 196 L52 210 L92 194 Z', K.gobD),
    P('M40 196 L14 142 L22 138 L48 190 Z', '#b9c0c4'), Ln('M24 160 l3 6 M30 172 l2 4', 3, '#8a5a30'),
    P('M28 198 L50 186 L54 193 L32 205 Z', K.leather),
    P(ac(44, 202, 11), K.gobD),
    P('M86 112 L20 84 L74 142 Z', K.gob), P('M154 112 L216 86 L164 142 Z', K.gob),
    N('M78 116 L42 96 L70 132 Z', '#d89a8a'), N('M162 116 L194 100 L168 132 Z', '#d89a8a'),
    P('M120 76 C88 76 76 100 78 124 C80 150 98 166 120 166 C142 166 160 150 162 124 C164 100 152 76 120 76 Z', K.gob),
    F(ac(104, 118, 11, 10), '#f4e27a'), F(ac(138, 118, 10, 9), '#f4e27a'),
    N(ac(101, 119, 3, 7.5), INK), N(ac(135, 119, 2.8, 7), INK),
    P('M120 116 L100 140 L124 142 Z', '#79a04a'),
    Ln('M98 150 Q120 162 144 150', 3),
    F('M104 152 l3 9 l3 -7 M130 153 l3 8 l3 -9', '#f2ead8'),
    P('M82 100 L92 50 L148 50 L158 100 Q120 110 82 100 Z', '#7d858b'),
    P(ac(120, 50, 28, 7), '#a9b1b6'),
    Ln('M108 62 l8 10 l-5 12 M130 58 q10 4 12 16', 2.4, '#4a5258'),
    N(ac(92, 88, 2.6), '#2c3236'), N(ac(148, 88, 2.6), '#2c3236'),
  ] },

  warden: { label: 'Barrow Warden', ground: [120, 324, 90, 10], parts: [
    P('M72 100 C50 170 46 250 52 318 L70 306 L86 320 L102 306 L120 320 L138 306 L154 320 L170 306 L188 318 C194 250 190 170 168 100 Z', '#2a3436'),
    P('M88 210 L114 210 L112 300 L90 300 Z', '#55666b'), P('M126 210 L152 210 L150 300 L128 300 Z', '#55666b'),
    P(ac(101, 238, 11), '#7a4a2a'), P(ac(139, 238, 11), '#7a4a2a'),
    P('M80 296 L116 296 L118 314 L76 314 Q76 302 80 296 Z', '#3a4448'), P('M124 296 L160 296 Q166 305 164 314 L122 314 Z', '#3a4448'),
    P('M76 186 L164 186 L174 230 L66 230 Z', '#4d5d61'), Ln('M98 196 l6 18 M138 194 l-4 20', 4, '#7a4a2a'),
    P('M70 100 Q120 82 170 100 L162 196 L78 196 Z', '#141a1c'),
    N(ac(120, 160, 26, 34), '#6fd3ff', { a: 0.28 }),
    Ln('M92 128 h56 M94 146 h52 M98 164 h44 M102 180 h36', 5, '#a8dce8', { op: 0.7 }),
    P('M74 102 Q120 86 166 102 L160 142 Q120 128 80 142 Z', '#5d7075'),
    N(ac(96, 116, 6, 4), '#7a4a2a'), N(ac(146, 122, 5, 3.5), '#7a4a2a'),
    P('M110 150 L130 150 L130 300 L120 318 L110 300 Z', '#8c8f86'), Ln('M120 156 L120 300', 2.4, '#5c5e57'),
    Ln('M112 200 l-5 8 M128 240 l5 8 M114 270 l-5 8', 4, '#7a4a2a'),
    P('M72 134 L168 134 L168 150 L72 150 Z', '#7a4a2a'),
    P('M114 104 L126 104 L126 134 L114 134 Z', '#3f2a18'), P(ac(120, 98, 11), '#7a4a2a'),
    P('M62 116 L100 136 L92 152 L52 132 Z', '#4d5d61'), P('M178 116 L140 136 L148 152 L188 132 Z', '#4d5d61'),
    P(ac(98, 142, 12), '#5d7075'), P(ac(142, 142, 12), '#5d7075'),
    P('M36 112 Q38 80 74 82 Q98 88 94 122 Q62 136 36 112 Z', '#5d7075'), P('M204 112 Q202 80 166 82 Q142 88 146 122 Q178 136 204 112 Z', '#5d7075'),
    N('M42 98 q12 -14 28 -12 q12 2 18 10 q-14 -4 -26 0 q-10 4 -20 2z', '#4f7a3a'), N('M152 94 q16 -12 32 -4 q8 6 12 14 q-12 -4 -24 -2 q-12 2 -20 -8z', '#4f7a3a'),
    P('M90 42 Q74 34 80 12 Q94 22 98 36 Z', '#7d8f94'), P('M150 42 Q166 34 160 12 Q146 22 142 36 Z', '#7d8f94'),
    P('M88 62 C88 28 102 12 120 12 C138 12 152 28 152 62 L152 84 L138 94 L102 94 L88 84 Z', '#5d7075'),
    P('M96 52 L144 52 L144 68 L136 78 L104 78 L96 68 Z', '#0c1012'),
    Ln('M120 16 L120 52', 3),
    N(ac(108, 62, 9, 6), '#6fd3ff', { a: 0.55 }), N(ac(132, 62, 9, 6), '#6fd3ff', { a: 0.55 }),
    N(ac(108, 62, 3.4), '#e8fbff'), N(ac(132, 62, 3.4), '#e8fbff'),
    N('M96 28 q8 -8 18 -6 q-6 6 -18 6z', '#4f7a3a'),
  ] },

  slime: { label: 'Bog slime', ground: [120, 304, 100, 10], parts: [
    P('M18 300 C6 246 30 158 120 144 C210 158 234 246 222 300 Z', '#7cc04e', { a: 0.96 }),
    N('M34 296 C30 260 46 222 80 206 C60 236 56 268 64 296 Z', '#5f9a3a', { a: 0.7 }),
    N('M126 254 l34 -10 l5 8 l-34 10 z', '#e8dcc0', { a: 0.75 }), N(ac(166, 246, 7), '#e8dcc0', { a: 0.75 }), N(ac(124, 262, 6), '#e8dcc0', { a: 0.75 }),
    N(ac(84, 270, 11), '#d8e6c0', { a: 0.7 }), N(ac(79, 268, 2.4), '#24401a'), N(ac(89, 268, 2.4), '#24401a'),
    N(ac(176, 206, 7), '#d8f5b0', { a: 0.6 }), N(ac(58, 236, 5), '#d8f5b0', { a: 0.6 }), N(ac(150, 282, 6), '#d8f5b0', { a: 0.5 }),
    N('M66 196 C70 176 90 164 108 166 C92 176 80 190 76 206 Z', '#e6ffc8', { a: 0.55 }),
    F(ac(84, 220, 20, 23), '#fbfff2'), F(ac(140, 214, 16, 19), '#fbfff2'),
    N(ac(77, 225, 8.5), INK), N(ac(134, 219, 7.5), INK), N(ac(73, 221, 3), '#fff'), N(ac(130, 215, 2.6), '#fff'),
    P('M86 258 Q112 276 138 258 Q130 270 112 272 Q96 270 86 258 Z', '#2c4a1c'),
    P('M92 152 q8 -18 18 -6 q8 -18 20 2 q-10 10 -38 4z', '#4f7a3a'),
    Ln('M42 230 q-6 20 2 30', 6, '#9ad870', { op: 0.75 }), Ln('M206 236 q6 18 -2 30', 6, '#9ad870', { op: 0.6 }),
  ] },

  boar: { label: 'Thornback boar', ground: [124, 306, 100, 10], parts: [
    P('M80 236 L74 296 L92 296 L98 242 Z', '#3e2a1c'), P('M174 236 L176 296 L194 296 L192 236 Z', '#3e2a1c'),
    P('M60 196 C60 156 104 130 156 134 C200 138 222 166 220 202 C218 238 190 256 144 256 L100 256 C74 256 60 232 60 196 Z', '#5a3b24'),
    N('M96 150 C130 136 180 138 208 160 C190 150 150 144 96 158 Z', '#7a5236', { a: 0.7 }),
    ...[[84, 156, 7, -28, 18], [102, 146, 10, -34, 20], [124, 140, 12, -36, 22], [148, 140, 13, -32, 22], [170, 148, 13, -28, 20], [190, 160, 14, -20, 18]].map(([x, y, dx, dy, w]) => P(`M${x} ${y} L${x + dx} ${y + dy} L${x + w} ${y + 3} Z`, '#3d5a2a')),
    P('M92 240 L88 298 L108 298 L112 244 Z', '#4a3220'), P('M152 244 L156 298 L176 298 L172 244 Z', '#4a3220'),
    P('M84 294 h26 v10 h-28z', '#1c120a'), P('M154 294 h24 l2 10 h-26z', '#1c120a'),
    P('M72 168 C42 170 18 192 14 218 C12 234 22 244 36 246 L70 250 C88 252 102 238 104 218 C106 190 96 166 72 168 Z', '#5a3b24'),
    P(ac(24, 230, 17, 15), '#b07a62'), N(ac(18, 228, 3.4), INK), N(ac(30, 230, 3.4), INK),
    P('M36 242 C22 246 10 238 4 222 C14 228 24 230 32 228 Z', '#efe4c8'),
    P('M46 238 C38 226 38 210 46 196 C48 210 52 222 60 230 Z', '#efe4c8'),
    P('M88 168 L104 142 L110 176 Z', '#4a3220'),
    P(ac(58, 198, 7, 6), '#ffcf4a'), N(ac(57, 198, 2.8), '#7a1a10'),
    Ln('M46 186 l20 6', 3.4),
    Ln('M218 198 q16 4 10 20', 4.5, '#3e2a1c'),
  ] },

  witch: { label: 'Hedge witch', ground: [118, 310, 84, 9], parts: [
    Raw('<circle cx="54" cy="84" r="26" fill="#9ae070" fill-opacity=".28"/>'),
    Ln('M46 302 C40 232 44 152 54 98', 9, '#5a3a1e'),
    Ln('M54 98 c-10 -8 -14 -20 -6 -30 M54 98 c10 -6 18 -4 22 6 M50 82 c-8 0 -12 -6 -10 -12', 5.5, '#5a3a1e'),
    P(ac(54, 84, 9), '#d8ffb0'),
    P('M82 152 C62 192 52 252 48 304 L198 304 C192 244 178 192 154 152 Z', '#4a3a5a'),
    N('M118 160 L120 300 L198 304 C192 244 178 192 154 152 Z', '#3a2c4a', { a: 0.6 }),
    Ln('M58 302 c10 -6 20 0 30 -4 s20 2 30 -2 s22 4 32 0 s22 2 34 2', 5, '#2c2238'),
    P('M94 208 L142 208 L142 218 L94 218 Z', '#5a3a1e'), P(ac(118, 213, 7.5), '#8fd060'),
    P('M100 236 l14 10 l-10 8 z', '#6b5a3a'), P('M150 252 l12 8 l-12 6 z', '#6b5a3a'),
    P('M96 168 C78 178 64 196 56 214 L68 222 C78 208 90 196 104 188 Z', '#4a3a5a'),
    P(ac(56, 214, 10), '#9aae86'),
    P('M84 116 C84 108 90 104 92 112 C82 146 82 182 80 200 C74 178 76 140 84 116 Z', '#d8d8d0'),
    P('M154 116 C156 108 150 104 148 112 C158 146 160 186 158 204 C166 180 164 140 154 116 Z', '#d8d8d0'),
    P('M86 108 C80 138 94 162 120 162 C146 162 158 138 152 108 Z', '#bccaa4'),
    P('M100 128 L72 136 L100 142 Z', '#a9b890'), N(ac(74, 136, 3), '#6b5a3a'),
    F(ac(108, 122, 5.5, 4.5), '#fff8b0'), N(ac(106, 122, 2.2), INK),
    F(ac(132, 122, 4.5, 4), '#fff8b0'), N(ac(130, 122, 2), INK),
    Ln('M102 114 l10 2 M126 115 l9 -2 M104 146 q10 6 22 -2', 2.4),
    N('M110 148 l2 6 l2 -5z', '#f2ead8'),
    P('M60 112 C90 98 154 98 182 114 C160 124 86 126 60 112 Z', '#2c2238'),
    P('M86 108 C88 72 100 42 132 20 C126 36 136 46 132 60 C128 76 138 92 140 108 Z', '#3a2e4a'),
    Ln('M90 102 q24 6 48 0', 6, '#8fd060'),
    P('M104 58 L120 56 L122 70 L106 72 Z', '#5a4a6a'), Ln('M107 60 l12 -1 M108 68 l12 -1', 1.4, '#120c18'),
    Ln('M132 20 c8 0 12 6 8 12', 2),
    Ln('M28 306 c20 -20 40 -14 50 -30 M196 306 c-14 -18 -30 -10 -40 -26', 5, '#4f7a3a'),
    Ln('M44 292 l-7 -4 M58 284 l2 -8 M178 290 l7 -4 M166 282 l-2 -8', 3, '#a7c47a'),
  ] },

  treant: { label: 'Ancient treant', ground: [120, 314, 104, 10], parts: [
    Ln('M70 296 c-20 4 -40 10 -58 14 M90 302 c-6 4 -16 8 -28 10 M152 296 c20 4 42 8 60 12 M138 302 c6 4 16 6 24 8', 12, '#3e2c1c'),
    Ln('M74 128 C44 122 26 104 14 78 M60 122 c-12 14 -22 34 -26 58', 18, '#4a3322'),
    Ln('M152 124 c30 -8 46 -26 54 -52 M164 132 c14 16 22 36 24 58', 18, '#4a3322'),
    Ln('M14 78 l-9 -12 M14 78 l-2 15 M34 180 l-11 6 M34 180 l2 13 M206 72 l9 -10 M206 72 l6 13 M188 190 l11 4 M188 190 l-2 13', 7, '#4a3322'),
    P(ac(16, 64, 20), '#4f7a3a'), P(ac(34, 52, 15), '#5a8a42'), P(ac(208, 56, 20), '#4f7a3a'), P(ac(192, 46, 15), '#5a8a42'),
    P(ac(30, 192, 13), '#4f7a3a'), P(ac(192, 202, 13), '#4f7a3a'),
    P('M64 304 C72 244 64 154 74 102 C80 72 96 50 114 40 C132 50 148 72 154 102 C164 154 156 244 164 304 Z', '#5a3e26'),
    N('M114 40 C132 50 148 72 154 102 C164 154 156 244 164 304 L128 304 C130 240 132 160 124 100 C120 74 118 56 114 40 Z', '#3e2a18', { a: 0.5 }),
    Ln('M92 292 c4 -50 -2 -120 6 -170 M130 292 c-4 -50 2 -120 -6 -170 M112 284 c2 -40 0 -80 2 -110', 3, '#2a1c12', { op: 0.75 }),
    P(ac(114, 40, 36), '#3f6a30'), P(ac(80, 58, 26), '#4f7a3a'), P(ac(148, 58, 26), '#4f7a3a'), P(ac(114, 14, 20), '#5a8a42'),
    N(ac(100, 30, 10), '#6f9a4a'), N(ac(140, 50, 8), '#6f9a4a'),
    Ln('M84 124 q10 -10 22 -2 M120 122 q12 -8 22 2', 6),
    N(ac(96, 138, 10, 8), INK), N(ac(130, 138, 10, 8), INK),
    N(ac(96, 138, 13), '#ffb030', { a: 0.35 }), N(ac(130, 138, 13), '#ffb030', { a: 0.35 }),
    N(ac(96, 138, 4.5), '#fff2b0'), N(ac(130, 138, 4.5), '#fff2b0'),
    P('M92 180 c8 10 36 10 44 0 c-6 14 -38 14 -44 0z', '#1e140c'),
    P('M86 188 c2 20 10 34 28 42 c18 -8 26 -22 28 -42 c-8 8 -20 10 -28 10 s-20 -2 -28 -10z', '#5a8a42'),
    Ln('M74 212 c-6 10 -4 20 2 26 M154 216 c6 10 4 20 -2 26', 6, '#5a8a42'),
  ] },
};

function spriteSVG(name) {
  const c = CHARACTERS[name] || CHARACTERS.knight;
  return renderInk(c.parts, { ground: c.ground, label: c.label });
}
const spriteFor = spriteSVG;

/* Knight head token for the map. */
function knightTokenSVG() {
  return renderInk([P(ac(120, 104, 30, 8), '#000', { a: 0 }), ...KNIGHT_HEAD_PARTS], { vb: '86 -6 74 116', scale: 0.55, cls: 'token-svg' });
}

/* ---------------------------------------------------------------- scenes */
const SCENES = {
  chestClosed: () => renderInk([
    P('M40 96 L220 96 L220 196 L40 196 Z', '#7a4e2a'), Ln('M40 122 h180 M40 150 h180 M40 176 h180', 3, '#5a3a1e'),
    P('M36 98 C36 50 80 30 130 30 C180 30 224 50 224 98 Z', '#8a5a30'), Ln('M60 46 c20 -8 50 -12 70 -12 M48 70 c40 -14 120 -14 164 0', 3, '#5a3a1e'),
    P('M62 36 L78 36 L78 196 L62 196 Z', '#4a4f55'), P('M182 36 L198 36 L198 196 L182 196 Z', '#4a4f55'), P('M34 92 L226 92 L226 106 L34 106 Z', '#4a4f55'),
    N(ac(70, 120, 3), '#d6a24a'), N(ac(70, 172, 3), '#d6a24a'), N(ac(190, 120, 3), '#d6a24a'), N(ac(190, 172, 3), '#d6a24a'),
    P('M110 86 L150 86 L150 134 L110 134 Z', '#d6a24a'), N(ac(130, 104, 5), INK), Ln('M130 108 v14', 4),
  ], { vb: '0 0 260 220', ground: [130, 202, 110, 12], cls: 'scene-svg chest-svg', label: 'A closed chest' }),

  chestOpen: () => renderInk([
    Raw('<defs><radialGradient id="chG" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#ffcf4a" stop-opacity=".8"/><stop offset="1" stop-color="#ffcf4a" stop-opacity="0"/></radialGradient></defs><ellipse cx="130" cy="92" rx="124" ry="88" fill="url(#chG)" class="chest-glow"/>'),
    P('M44 98 L54 30 C82 18 178 18 206 30 L216 98 Z', '#6a4424'), N('M58 94 L66 40 C90 32 170 32 194 40 L202 94 Z', '#3a2414'), Ln('M62 30 L60 96 M198 30 L200 96', 10, '#4a4f55'),
    P('M40 96 L220 96 L220 196 L40 196 Z', '#7a4e2a'), Ln('M40 122 h180 M40 150 h180 M40 176 h180', 3, '#5a3a1e'),
    N(ac(130, 98, 88, 13), '#2a1a0c'),
    F(ac(96, 96, 13, 5), '#ffcf4a'), F(ac(122, 91, 13, 5), '#ffcf4a'), F(ac(148, 94, 13, 5), '#ffcf4a'), F(ac(170, 98, 11, 4), '#ffcf4a'),
    P('M62 96 L78 96 L78 196 L62 196 Z', '#4a4f55'), P('M182 96 L198 96 L198 196 L182 196 Z', '#4a4f55'), P('M34 92 L226 92 L226 106 L34 106 Z', '#4a4f55'),
    P('M110 98 L150 98 L150 134 L110 134 Z', '#d6a24a'),
  ], { vb: '0 0 260 220', ground: [130, 202, 110, 12], cls: 'scene-svg chest-svg', label: 'An open chest' }),

  rest: () => renderInk([
    Raw(`<defs><linearGradient id="rsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1426"/><stop offset=".7" stop-color="#1f2a3e"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>
      <radialGradient id="rsGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".6"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs>
      <rect width="640" height="300" fill="url(#rsSky)"/>
      <g fill="#fff6d8"><circle cx="60" cy="40" r="1.6"/><circle cx="130" cy="70" r="1.2"/><circle cx="210" cy="30" r="1.8"/><circle cx="300" cy="60" r="1.2"/><circle cx="400" cy="24" r="1.6"/><circle cx="470" cy="80" r="1.2"/><circle cx="590" cy="44" r="1.8"/><circle cx="350" cy="100" r="1"/></g>
      <circle cx="540" cy="60" r="22" fill="#f4ecd0"/><circle cx="551" cy="53" r="20" fill="#152038"/>
      <path d="M0 210c80-30 160-36 240-20s180 10 260-14 110-10 140 0v124H0z" fill="#1a2418"/><path d="M0 232c120-16 260-8 400 0s180-8 240-6v74H0z" fill="#2a3420"/>
      <g fill="#122016"><path d="M30 214l26-70 26 70z"/><path d="M80 210l20-54 20 54z"/><path d="M590 206l22-60 22 60z"/></g>
      <ellipse cx="300" cy="244" rx="190" ry="74" fill="url(#rsGlow)" class="fire-glow"/>`),
    P('M400 250 L480 128 L560 250 Z', '#8a7650'), P('M480 128 L456 250 L504 250 Z', '#2a1e12'), Ln('M480 128 L450 250', 3, '#a89470'),
    Ln('M480 128 v-14', 4, '#5a3a1e'), P('M480 116 l16 6 l-16 6 z', '#a8322a', { lw: 2 }),
    Ln('M268 254 l64 -14 M268 240 l64 14', 10, '#4a3220'),
    Raw(`<g transform="translate(300 250)"><g class="flames"><path d="M0 -62c8 18 28 26 22 52a22 22 0 0 1-44 0c0-14 8-18 10-34 4 6 8 4 12-18z" fill="#f08a2c" stroke="${INK}" stroke-width="3"/><path d="M0 -34c4 12 14 16 12 28a12 12 0 0 1-24 0c0-8 6-12 12-28z" fill="#f4d35e"/></g><g fill="#ffcf4a" class="embers"><circle cx="-8" cy="-72" r="2.2"/><circle cx="12" cy="-86" r="1.8"/><circle cx="4" cy="-102" r="1.4"/></g></g>`),
    P('M140 238 L236 238 Q244 246 236 254 L140 254 Q132 246 140 238 Z', '#5a3a1e'),
    P('M116 206 h34 v30 c0 20 -17 30 -17 30 s-17 -10 -17 -30z', K.blue), Ln('M120 212 h26 v24 c0 15 -13 24 -13 24 s-13 -9 -13 -24z', 3, K.bronze),
    Ln('M104 272 l22 -116', 6, '#e8edf0'), Ln('M114 188 h22', 6, K.bronze),
    P('M184 224 h46 v18 h-46z', K.steel), P('M214 236 h18 v38 h-18z', K.steel), P('M208 270 h30 v10 h-32z', '#5d6a74'), P(ac(224, 232, 6), K.bronze),
    P('M166 162 q26 -10 44 2 l-2 66 h-40z', K.steel), P('M174 166 h28 v58 h-28z', K.red), F('M185 172 h6 v40 h-6z', K.bronze),
    P('M168 216 h40 v9 h-40z', K.leather),
    P('M196 172 l40 24 l-7 11 l-40 -20z', K.steel), P(ac(236, 200, 8), K.steelD),
    P(ac(198, 168, 15, 11), K.steel),
    ...KNIGHT_HEAD_PARTS.map((p) => ({ ...p, tf: 'translate(70 70) scale(.92)' })),
  ], { vb: '0 0 640 300', scale: 0.8, cls: 'scene-svg', label: 'The knight resting by a campfire beside a tent' }),

  victory: () => renderInk([
    Raw(`<defs><radialGradient id="vcGlow" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b0" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf4a" stop-opacity="0"/></radialGradient>
      <linearGradient id="vcGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#c8912a"/></linearGradient></defs>
      <rect width="640" height="340" fill="#1e1610"/><ellipse cx="320" cy="210" rx="320" ry="170" fill="url(#vcGlow)"/>`),
    P('M60 300 C100 200 200 130 320 120 C440 110 550 190 590 300 Z', '#f0c040'),
    ...[[200, 200], [240, 170], [300, 150], [360, 146], [420, 172], [470, 210], [150, 250], [520, 250], [330, 128], [270, 196], [390, 200]].map(([x, y]) => F(ac(x, y, 14, 6), '#ffd95a', { lw: 2 })),
    P('M440 150 h24 l-4 16 h-16z M448 166 h8 v12 h-8z M440 178 h24 v4 h-24z', '#e8b768', { lw: 2 }),
    P('M190 228 l6 -14 l8 8 l8 -12 l8 12 l8 -8 l6 14z', '#ffd95a', { lw: 2 }), N(ac(212, 222, 3), '#c4452f'),
    Raw('<g fill="#fff" class="sparkle"><path d="M260 120l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M420 110l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M520 200l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M120 220l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g><ellipse cx="320" cy="332" rx="200" ry="10" fill="rgba(0,0,0,.4)"/>'),
    /* princess */
    P('M330 220 C316 260 304 300 296 332 L404 332 C396 300 384 260 370 220 Z', '#b45a98'),
    N('M350 222 L370 220 C384 260 396 300 404 332 L360 332 Z', '#8a3a74', { a: 0.6 }),
    P('M332 214 q18 -10 36 0 l-2 26 h-32z', '#c46aa8'), Ln('M338 236 h24', 4, '#ffd95a'),
    P('M330 168 c-12 10 -14 40 -6 56 c10 -4 14 -10 16 -20z', '#e8b84a'),
    P(ac(350, 190, 18, 21), '#f0c8a8'),
    P('M332 182 c4 -18 30 -24 40 -6 c-6 0 -14 -2 -22 -8 c-4 6 -10 10 -18 14z', '#e8b84a'),
    Ln('M368 186 c10 14 10 34 2 44', 8, '#e8b84a'),
    P('M338 166 l4 -12 l6 8 l4 -10 l4 10 l6 -8 l2 12 z', '#ffd95a', { lw: 2 }),
    Ln('M340 190 q4 -3 8 0 M344 202 q4 3 8 0', 2), N(ac(358, 200, 3.4), '#e88a8a', { a: 0.6 }),
    Ln('M336 228 c-20 2 -34 6 -44 12', 10, '#f0c8a8'),
    /* knight */
    P('M262 270 h20 v56 h-20z', K.steel), P('M286 270 h20 v56 h-20z', K.steel),
    P('M256 322 h28 v10 h-30z', '#5d6a74'), P('M284 322 h28 l2 10 h-30z', '#5d6a74'),
    P('M254 256 h60 l4 22 h-68z', K.red),
    P('M252 196 q32 -12 64 0 l-4 64 h-56z', K.steel), P('M268 200 h32 v58 h-32z', K.red), F('M281 206 h6 v42 h-6z', K.bronze),
    P('M256 248 h56 v9 h-56z', K.leather),
    P(ac(256, 202, 16, 12), K.steel), P(ac(312, 202, 16, 12), K.steel),
    P('M244 214 h26 v24 c0 16 -13 24 -13 24 s-13 -8 -13 -24z', K.blue),
    Ln('M314 212 c16 14 36 20 54 16', 13, K.steel), Ln('M314 212 c16 14 36 20 54 16', 1.5, INK, { op: 0 }),
    P(ac(370, 227, 8), K.steelD),
    ...KNIGHT_HEAD_PARTS.map((p) => ({ ...p, tf: 'translate(172 102)' })),
    Raw('<g fill="#e05a6a" class="hearts"><path d="M322 132c-6-10-20-4-14 6l14 12 14-12c6-10-8-16-14-6z"/><path d="M372 118c-4-6-12-2-8 4l8 7 8-7c4-6-4-10-8-4z" opacity=".8"/></g>'),
  ], { vb: '0 0 640 340', scale: 0.75, cls: 'scene-svg', label: 'The knight hugging a princess in front of a pile of gold' }),
};

/* ---------------------------------------------------------------- stage backdrops */
const BIOMES = { grubnik: 'road', gloop: 'bog', boar: 'forest', witch: 'hedge', warden: 'crypt', treant: 'forest' };
const BACKDROPS = {
  road: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="bdR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2236"/><stop offset="1" stop-color="#4a3424"/></linearGradient></defs><rect width="400" height="300" fill="url(#bdR)"/><path d="M0 210 Q100 170 200 196 T400 186 V300 H0Z" fill="#2e2a1e"/><path d="M0 240 Q140 214 260 236 T400 228 V300 H0Z" fill="#3a3222"/><path d="M150 300 L190 230 L214 230 L250 300Z" fill="#5a4a32" opacity=".55"/><g fill="#1e1a14"><path d="M30 214 l18 -50 l18 50z"/><path d="M340 200 l14 -40 l14 40z"/></g></svg>`,
  bog: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="bdB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a22"/><stop offset="1" stop-color="#2e3a1e"/></linearGradient></defs><rect width="400" height="300" fill="url(#bdB)"/><ellipse cx="200" cy="268" rx="230" ry="40" fill="#2a3c2a"/><ellipse cx="160" cy="276" rx="120" ry="16" fill="#3c5a4a" opacity=".6"/><g stroke="#16201a" stroke-width="6" fill="none"><path d="M50 260 C46 200 60 170 40 120 M40 160 l-20 -20 M46 190 l22 -18"/><path d="M350 256 C356 210 340 180 360 130 M356 170 l20 -16"/></g><g stroke="#3a5a2a" stroke-width="3"><path d="M90 268 v-34 M96 268 v-24 M300 270 v-30 M306 270 v-22"/></g><rect width="400" height="300" fill="#9ac0a0" opacity=".07"/></svg>`,
  forest: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="bdF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14202a"/><stop offset="1" stop-color="#1e2a1a"/></linearGradient></defs><rect width="400" height="300" fill="url(#bdF)"/><circle cx="320" cy="60" r="18" fill="#e8e4c8" opacity=".5"/><g fill="#162418"><path d="M20 270 l30 -150 l30 150z"/><path d="M90 270 l24 -120 l24 120z"/><path d="M290 270 l26 -130 l26 130z"/><path d="M350 270 l30 -160 l30 160z"/></g><g fill="#0e1810"><path d="M-10 280 l40 -190 l40 190z"/><path d="M330 280 l36 -170 l36 170z"/></g><path d="M0 250 Q200 236 400 252 V300 H0Z" fill="#1a2414"/></svg>`,
  hedge: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="bdH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22182e"/><stop offset="1" stop-color="#22301e"/></linearGradient></defs><rect width="400" height="300" fill="url(#bdH)"/><g fill="#1a2a18"><circle cx="40" cy="236" r="56"/><circle cx="110" cy="250" r="44"/><circle cx="300" cy="246" r="50"/><circle cx="370" cy="232" r="56"/></g><g fill="#c8a0e0" opacity=".5"><circle cx="60" cy="210" r="3"/><circle cx="96" cy="230" r="2.4"/><circle cx="318" cy="220" r="3"/><circle cx="356" cy="200" r="2.4"/></g><path d="M0 262 Q200 250 400 264 V300 H0Z" fill="#1c2416"/></svg>`,
  crypt: `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="bdC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151a22"/><stop offset="1" stop-color="#22262c"/></linearGradient><radialGradient id="bdCg"><stop offset="0" stop-color="#ffb347" stop-opacity=".35"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#bdC)"/><g fill="none" stroke="#2e343c" stroke-width="16"><path d="M40 300 V130 Q40 70 100 70 Q160 70 160 130 V300"/><path d="M240 300 V130 Q240 70 300 70 Q360 70 360 130 V300"/></g><g stroke="#1e2228" stroke-width="2"><path d="M0 100 H400 M0 160 H400 M0 220 H400"/></g><circle cx="200" cy="150" r="60" fill="url(#bdCg)"/><rect x="194" y="150" width="12" height="30" fill="#e8dcc0"/><path d="M200 132 c4 6 6 10 0 16 c-6 -6 -4 -10 0 -16z" fill="#ffcf4a"/><path d="M0 262 H400 V300 H0Z" fill="#1a1e24"/></svg>`,
};
