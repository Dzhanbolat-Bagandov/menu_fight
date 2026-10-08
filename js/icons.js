'use strict';
/* Inline SVG icons (48x48 viewBox). Every icon is a plain string so real art can replace any of them. */

const C = {
  steel: '#cfd5d9', steelD: '#8a949b', dark: '#2e3236', bronze: '#c8913a', bronzeD: '#8a5f1e',
  red: '#c4452f', orange: '#f08a2c', yellow: '#f4d35e', blue: '#5aa0e0', blueD: '#2f6aa8',
  green: '#6fae5a', wood: '#8a5a30', woodD: '#5a3a1e', parch: '#f2ead8', ice: '#bfe6ff', skin: '#d9a77c', purple: '#9b6bd1',
};

const SHIELD_PATH = 'M24 4 L40 9 V24 C40 34 33 41 24 45 C15 41 8 34 8 24 V9 Z';
const FLAME = `<path d="M24 4C26 14 38 18 38 30A14 14 0 0 1 10 30C10 22 16 20 18 12C20 16 22 14 24 4Z" fill="${C.orange}" stroke="${C.red}" stroke-width="1.5"/><path d="M24 22C26 28 32 30 30 36A6 6 0 0 1 18 36C18 31 22 29 24 22Z" fill="${C.yellow}"/>`;
const BOLT = `<polygon points="26,3 10,27 21,27 18,45 38,19 27,19" fill="${C.yellow}" stroke="${C.bronzeD}" stroke-width="1.5" stroke-linejoin="round"/>`;
const flask = (c) => `<path d="M19 6h10v3h-2v9l9 17c2 4-1 9-5 9H17c-4 0-7-5-5-9l9-17V9h-2z" fill="rgba(255,255,255,.18)" stroke="${C.dark}" stroke-width="1.5" stroke-linejoin="round"/><path d="M15 33h18l3 3c1.5 3-.5 7-4 7H16c-3.5 0-5.5-4-4-7z" fill="${c}"/><rect x="19" y="3" width="10" height="5" rx="1.5" fill="${C.wood}" stroke="${C.dark}"/>`;
const swordShape = (blade, len = 0) => `<path d="M24 3l3.5 5v${22 - len}h-7V8z" fill="${blade}" stroke="${C.dark}" stroke-width="1.4" stroke-linejoin="round"/><rect x="15" y="${30 - len}" width="18" height="4" rx="1.5" fill="${C.bronze}" stroke="${C.dark}"/><rect x="22" y="${34 - len}" width="4" height="9" fill="${C.wood}"/><circle cx="24" cy="${44 - len}" r="2.5" fill="${C.bronze}"/>`;
const star = (cx, cy, r, f) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${pts.join(' ')}" fill="${f}" stroke="${C.bronzeD}" stroke-width=".8"/>`; };
const flake = () => `<g stroke="${C.ice}" stroke-width="3" stroke-linecap="round" fill="none">${[0, 60, 120].map((r) => `<path d="M24 5V43" transform="rotate(${r} 24 24)"/>`).join('')}${[0, 60, 120, 180, 240, 300].map((r) => `<path d="M24 10l-4-4M24 10l4-4" transform="rotate(${r} 24 24)" stroke-width="2"/>`).join('')}</g><circle cx="24" cy="24" r="3" fill="#fff"/>`;

const ICONS = {
  sword: `<g transform="rotate(45 24 24)">${swordShape(C.steel)}</g>`,
  dagger: `<g transform="rotate(-45 24 24) translate(0 6) scale(1 .85)">${swordShape(C.steelD, 4)}</g>`,
  cleave: `<g transform="rotate(45 24 24)">${swordShape('#b9a089')}</g><path d="M6 36Q24 46 42 14" stroke="${C.red}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`,
  hammer: `<g transform="rotate(45 24 24)"><rect x="22" y="10" width="4" height="34" fill="${C.wood}" stroke="${C.dark}"/><rect x="11" y="3" width="26" height="13" rx="2" fill="${C.steel}" stroke="${C.dark}" stroke-width="1.4"/><rect x="11" y="7" width="26" height="3" fill="${C.bronze}"/></g>`,
  shield: `<path d="${SHIELD_PATH}" fill="#9aa8b3" stroke="${C.dark}" stroke-width="2" stroke-linejoin="round"/><path d="M24 9L36 13V24C36 31 31 37 24 40C17 37 12 31 12 24V13Z" fill="#6f7f8c"/><path d="M24 12V38M14 22H34" stroke="${C.bronze}" stroke-width="3"/>`,
  block: `<path d="${SHIELD_PATH}" fill="#aab8c2" stroke="${C.dark}" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 10L35 14V24C35 30 30 35 24 38Z" fill="#8795a0"/>`,
  buckler: `<circle cx="24" cy="24" r="19" fill="${C.wood}" stroke="${C.dark}" stroke-width="2"/><circle cx="24" cy="24" r="14" fill="none" stroke="${C.woodD}" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="${C.steelD}" stroke="${C.dark}" stroke-width="1.5"/>`,
  tower: `<path d="M10 6H38V28C38 38 31 43 24 46C17 43 10 38 10 28Z" fill="#6c7a74" stroke="${C.dark}" stroke-width="2"/><path d="M24 8V44M12 20H36" stroke="#3f4a45" stroke-width="3"/><circle cx="16" cy="12" r="3" fill="#5b8a45"/><circle cx="32" cy="30" r="3.5" fill="#5b8a45"/>`,
  fireball: FLAME,
  burn: `<g transform="translate(6 6) scale(.75)">${FLAME}</g>`,
  frost_arrow: `<g transform="rotate(45 24 24)"><rect x="22" y="12" width="4" height="26" fill="${C.ice}" stroke="${C.blueD}"/><path d="M24 1L33 14H15Z" fill="#e8f7ff" stroke="${C.blueD}" stroke-width="1.4"/><path d="M24 34L32 46L24 42L16 46Z" fill="${C.blue}" stroke="${C.blueD}"/></g>`,
  frozen: flake(),
  lightning_shield: `<path d="${SHIELD_PATH}" fill="#3a3f5c" stroke="${C.purple}" stroke-width="2.4" stroke-linejoin="round"/><g transform="translate(12 12) scale(.5)">${BOLT}</g>`,
  bolt: BOLT,
  flask_red: flask('#c0392b'), flask_blue: flask('#3d8fdc'), flask_green: flask('#58b24a'),
  hourglass: `<path d="M12 5h24v6c0 8-9 9-9 13s9 5 9 13v6H12v-6c0-8 9-9 9-13s-9-5-9-13z" fill="rgba(255,255,255,.16)" stroke="${C.steel}" stroke-width="2" stroke-linejoin="round"/><path d="M17 11h14c0 4-7 6-7 8 0-2-7-4-7-8z" fill="${C.yellow}"/><path d="M15 41h18c-1-5-9-7-9-9 0 2-8 4-9 9z" fill="${C.yellow}"/><rect x="10" y="3" width="28" height="3" fill="${C.bronze}"/><rect x="10" y="42" width="28" height="3" fill="${C.bronze}"/>`,
  armor: `<path d="M12 8L20 4h8l8 4 5 10-7 4v20H14V22L7 18z" fill="${C.steel}" stroke="${C.dark}" stroke-width="1.6" stroke-linejoin="round"/><path d="M24 8v34M16 24h16" stroke="${C.steelD}" stroke-width="2"/><rect x="14" y="36" width="20" height="3" fill="${C.bronze}"/>`,
  helm: `<path d="M9 30C9 14 16 5 24 5S39 14 39 30v8H9z" fill="${C.steel}" stroke="${C.dark}" stroke-width="1.6"/><path d="M16 24H32V40H16z" fill="${C.skin}" stroke="${C.dark}"/><circle cx="20.5" cy="29" r="1.6" fill="${C.dark}"/><circle cx="27.5" cy="29" r="1.6" fill="${C.dark}"/><path d="M24 29v5M21 36h6" stroke="${C.dark}" stroke-width="1.2"/><rect x="9" y="32" width="7" height="9" rx="2" fill="${C.steelD}" stroke="${C.dark}"/><rect x="32" y="32" width="7" height="9" rx="2" fill="${C.steelD}" stroke="${C.dark}"/><path d="M12 14Q24 8 36 14" stroke="${C.bronze}" stroke-width="3" fill="none"/>`,
  legs: `<path d="M12 5h24l3 10-6 28H26l-2-24-2 24H15L9 15z" fill="${C.steel}" stroke="${C.dark}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="17" cy="26" r="3.5" fill="${C.bronze}"/><circle cx="31" cy="26" r="3.5" fill="${C.bronze}"/>`,
  gloves: `<path d="M14 44V28L9 17l4-2 4 7V8h4v13V6h4v15V8h4v14l3-9 4 2-5 16v14z" fill="${C.steel}" stroke="${C.dark}" stroke-width="1.5" stroke-linejoin="round"/><rect x="13" y="36" width="22" height="5" fill="${C.bronze}"/>`,
  ring: `<circle cx="24" cy="29" r="12" fill="none" stroke="${C.bronze}" stroke-width="5"/><circle cx="24" cy="29" r="12" fill="none" stroke="${C.bronzeD}" stroke-width="1" opacity=".6"/><polygon points="24,5 31,12 24,19 17,12" fill="${C.blue}" stroke="${C.dark}"/>`,
  stagger: `<circle cx="24" cy="25" r="14" fill="#3a2f22" stroke="${C.bronze}" stroke-width="2"/>${star(24, 9, 7, C.yellow)}${star(10, 28, 6, C.yellow)}${star(38, 28, 6, C.yellow)}${star(24, 25, 5, '#fff3b0')}`,
  stun: `<circle cx="24" cy="24" r="19" fill="#2c2a3a" stroke="${C.bronze}" stroke-width="2"/><path d="M24 24c0-3 4-3 4 0s-6 5-8 0 4-9 10-6 6 12-2 15-17-4-14-15" fill="none" stroke="${C.yellow}" stroke-width="2.6" stroke-linecap="round"/>`,
  flurry: `<g stroke-linecap="round" fill="none"><path d="M8 8L38 40M20 4L44 28M4 22L26 44" stroke="${C.steel}" stroke-width="4"/><path d="M8 8L38 40M20 4L44 28M4 22L26 44" stroke="${C.red}" stroke-width="1.5"/></g>`,
  skull: `<path d="M24 4C14 4 8 11 8 20c0 6 3 9 6 11v7h20v-7c3-2 6-5 6-11C40 11 34 4 24 4z" fill="#d8e6ee" stroke="${C.dark}" stroke-width="1.6"/><circle cx="17" cy="21" r="5" fill="${C.blueD}"/><circle cx="31" cy="21" r="5" fill="${C.blueD}"/><circle cx="17" cy="21" r="2" fill="${C.ice}"/><circle cx="31" cy="21" r="2" fill="${C.ice}"/><path d="M22 28l2 4 2-4zM18 38v-4M24 38v-4M30 38v-4" stroke="${C.dark}" stroke-width="1.6"/>`,
  overhead: `<path d="M24 2l3.5 5v26h-7V7z" fill="#b9a089" stroke="${C.dark}" stroke-width="1.4"/><rect x="14" y="33" width="20" height="4" rx="1.5" fill="${C.bronze}" stroke="${C.dark}"/><rect x="22" y="37" width="4" height="8" fill="${C.wood}"/><path d="M6 18l5-6 5 6M32 18l5-6 5 6" stroke="${C.red}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  slam: `<g transform="rotate(180 24 24) scale(.8) translate(6 6)">${swordShape('#b9a089')}</g>${star(24, 40, 7, C.orange)}`,
};
ICONS.chest = ICONS.armor;

function iconSVG(name, extraClass = '') {
  const body = ICONS[name] || ICONS.shield;
  return `<svg class="ico ${extraClass}" viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
}
