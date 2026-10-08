'use strict';
/* Placeholder character sprites as inline SVG (viewBox 0 0 220 320). Swap for <img> when real art arrives. */

const SPRITES = {
  knight: `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Knight in plate armour">
  <defs>
    <linearGradient id="kPlate" x1="0" x2="1"><stop offset="0" stop-color="#9aa6af"/><stop offset=".45" stop-color="#e3e8eb"/><stop offset="1" stop-color="#7d8892"/></linearGradient>
    <linearGradient id="kDark" x1="0" x2="1"><stop offset="0" stop-color="#6c767f"/><stop offset=".5" stop-color="#a5afb7"/><stop offset="1" stop-color="#5b656d"/></linearGradient>
  </defs>
  <ellipse cx="112" cy="304" rx="74" ry="9" fill="rgba(0,0,0,.45)"/>
  <rect x="84" y="196" width="25" height="92" rx="7" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2"/>
  <rect x="115" y="196" width="25" height="92" rx="7" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2"/>
  <circle cx="96" cy="226" r="9" fill="#c8913a" stroke="#2e3236" stroke-width="2"/><circle cx="128" cy="226" r="9" fill="#c8913a" stroke="#2e3236" stroke-width="2"/>
  <path d="M76 288h38v14H72z M112 288h42l4 14h-46z" fill="#4a3322" stroke="#2e3236" stroke-width="2" stroke-linejoin="round"/>
  <path d="M76 176h72l6 32H70z" fill="url(#kDark)" stroke="#2e3236" stroke-width="2" stroke-linejoin="round"/>
  <path d="M112 178v30" stroke="#2e3236" stroke-width="2"/>
  <rect x="146" y="112" width="15" height="58" rx="7" transform="rotate(-12 150 112)" fill="url(#kDark)" stroke="#2e3236" stroke-width="2"/>
  <path d="M170 24l8 14v116h-16V38z" fill="#e6ebee" stroke="#2e3236" stroke-width="2" stroke-linejoin="round"/>
  <path d="M170 30v122" stroke="#9aa6af" stroke-width="2"/>
  <rect x="152" y="152" width="36" height="8" rx="3" fill="#c8913a" stroke="#2e3236" stroke-width="2"/>
  <rect x="166" y="160" width="8" height="22" fill="#5a3a1e" stroke="#2e3236" stroke-width="1.5"/>
  <circle cx="170" cy="186" r="6" fill="#c8913a" stroke="#2e3236" stroke-width="2"/>
  <circle cx="170" cy="164" r="10" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2"/>
  <path d="M72 100Q112 84 152 100L146 182H78Z" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M112 92V180M86 126Q112 138 138 126" stroke="#7d8892" stroke-width="2.4" fill="none"/>
  <rect x="78" y="168" width="68" height="10" fill="#c8913a" stroke="#2e3236" stroke-width="2"/>
  <rect x="106" y="166" width="12" height="14" rx="2" fill="#f4d35e" stroke="#2e3236" stroke-width="1.5"/>
  <ellipse cx="72" cy="106" rx="20" ry="16" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2.4"/>
  <ellipse cx="152" cy="106" rx="20" ry="16" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2.4"/>
  <path d="M54 110Q72 118 90 110M134 110Q152 118 170 110" stroke="#c8913a" stroke-width="3.5" fill="none"/>
  <rect x="52" y="116" width="17" height="54" rx="8" fill="url(#kDark)" stroke="#2e3236" stroke-width="2"/>
  <path d="M22 116h58v52c0 36-29 52-29 52S22 204 22 168z" fill="#8e2a22" stroke="#c8913a" stroke-width="5" stroke-linejoin="round"/>
  <path d="M51 124v88M30 150h42" stroke="#c8913a" stroke-width="7"/>
  <circle cx="51" cy="150" r="6" fill="#f4d35e" stroke="#2e3236" stroke-width="1.5"/>
  <rect x="99" y="84" width="26" height="18" fill="url(#kDark)" stroke="#2e3236" stroke-width="2"/>
  <ellipse cx="112" cy="64" rx="22" ry="26" fill="#e0b48c" stroke="#2e3236" stroke-width="2"/>
  <circle cx="102" cy="64" r="2.6" fill="#2e3236"/><circle cx="123" cy="64" r="2.6" fill="#2e3236"/>
  <path d="M97 58q5-4 10-1M118 57q5-3 10 1M112 66v9l-3 1M104 82q8 4 16 0" stroke="#5a3a1e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M86 70C84 34 98 18 112 18s28 16 26 52l-8 6V54H94v22z" fill="url(#kPlate)" stroke="#2e3236" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M90 44Q112 34 134 44" stroke="#c8913a" stroke-width="4" fill="none"/>
  <rect x="86" y="62" width="10" height="28" rx="4" fill="url(#kDark)" stroke="#2e3236" stroke-width="2"/>
  <rect x="128" y="62" width="10" height="28" rx="4" fill="url(#kDark)" stroke="#2e3236" stroke-width="2"/>
  <path d="M112 18C102 -2 132 -4 144 12C132 10 126 16 120 22z" fill="#a8322a" stroke="#2e3236" stroke-width="2" stroke-linejoin="round"/>
</svg>`,

  goblin: `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Goblin cutpurse">
  <ellipse cx="112" cy="304" rx="62" ry="8" fill="rgba(0,0,0,.45)"/>
  <path d="M92 238l-6 52h-14c-6 0-6 12 2 12h30l4-64z" fill="#6f9446" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M120 238l6 52h14c6 0 6 12-2 12h-30l-4-64z" fill="#6f9446" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M76 160Q112 140 148 162L156 248H68z" fill="#6b4a2b" stroke="#2c1d10" stroke-width="2.4" stroke-linejoin="round"/>
  <rect x="68" y="196" width="88" height="9" fill="#2c1d10"/><rect x="104" y="193" width="14" height="15" rx="2" fill="#c8913a" stroke="#2c1d10" stroke-width="1.5"/>
  <rect x="86" y="214" width="24" height="20" fill="#8a6a42" stroke="#2c1d10" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path d="M148 168l24 44-12 8-26-38z" fill="#6f9446" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M76 170l-40 18 6 14 44-12z" fill="#6f9446" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M30 188L8 140l-6 3 20 52z" fill="#b9bfc4" stroke="#2c3236" stroke-width="2" stroke-linejoin="round"/>
  <rect x="26" y="186" width="16" height="6" rx="2" fill="#5a3a1e" stroke="#2c1d10" transform="rotate(-20 34 189)"/>
  <circle cx="38" cy="194" r="9" fill="#6f9446" stroke="#2c3a1a" stroke-width="2.4"/>
  <path d="M82 112L26 82l36 56z" fill="#7fa650" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M142 112l56-30-36 56z" fill="#7fa650" stroke="#2c3a1a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M72 112l-24-18 20 28z M152 112l24-18-20 28z" fill="#d89a8a"/>
  <ellipse cx="112" cy="118" rx="36" ry="32" fill="#8cb35c" stroke="#2c3a1a" stroke-width="2.4"/>
  <ellipse cx="96" cy="112" rx="9" ry="8" fill="#f4e27a" stroke="#2c3a1a" stroke-width="2"/><ellipse cx="128" cy="112" rx="9" ry="8" fill="#f4e27a" stroke="#2c3a1a" stroke-width="2"/>
  <ellipse cx="97" cy="113" rx="2.4" ry="6" fill="#1b1b12"/><ellipse cx="127" cy="113" rx="2.4" ry="6" fill="#1b1b12"/>
  <path d="M112 112l-8 22h16z" fill="#7a9e4a" stroke="#2c3a1a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M92 140q20 12 40 0" stroke="#2c1d10" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M98 142l3 8 3-7M120 142l3 8 3-7" fill="#f2ead8" stroke="#2c1d10" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M82 92L90 50h44l8 42z" fill="#7d858b" stroke="#2c3236" stroke-width="2.4" stroke-linejoin="round"/>
  <ellipse cx="112" cy="50" rx="22" ry="6" fill="#a9b1b6" stroke="#2c3236" stroke-width="2"/>
  <path d="M84 90Q112 100 140 90" stroke="#2c3236" stroke-width="3" fill="none"/>
  <path d="M100 64l6 8-4 10M118 56q10 2 14 14" stroke="#555d63" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="94" cy="80" r="2.4" fill="#2c3236"/><circle cx="130" cy="80" r="2.4" fill="#2c3236"/>
</svg>`,

  warden: `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Barrow Warden">
  <defs>
    <radialGradient id="wGlow"><stop offset="0" stop-color="#c8f1ff"/><stop offset=".5" stop-color="#6fd3ff"/><stop offset="1" stop-color="#6fd3ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="wPlate" x1="0" x2="1"><stop offset="0" stop-color="#3b4a4e"/><stop offset=".5" stop-color="#65777b"/><stop offset="1" stop-color="#2f3b3f"/></linearGradient>
  </defs>
  <ellipse cx="112" cy="306" rx="84" ry="9" fill="rgba(0,0,0,.5)"/>
  <rect x="80" y="200" width="28" height="94" rx="6" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/>
  <rect x="118" y="200" width="28" height="94" rx="6" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/>
  <path d="M74 290h40v14H70z M116 290h42l4 14h-46z" fill="#2c3438" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="94" cy="230" r="10" fill="#7a4a2a" stroke="#1d2427" stroke-width="2"/><circle cx="132" cy="230" r="10" fill="#7a4a2a" stroke="#1d2427" stroke-width="2"/>
  <path d="M66 98Q112 80 158 98L152 204H72Z" fill="#14191b" stroke="#1d2427" stroke-width="2.4"/>
  <ellipse cx="112" cy="150" rx="22" ry="34" fill="url(#wGlow)" opacity=".55"/>
  <path d="M84 120h56M86 138h52M90 156h44M94 174h36" stroke="#cfd9dc" stroke-width="5" stroke-linecap="round" opacity=".55"/>
  <path d="M72 100Q112 84 152 100L146 140Q112 126 78 140Z" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M72 180h80l6 30H66z" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M96 188l6 14M124 186l-4 16" stroke="#7a4a2a" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="64" cy="106" rx="26" ry="20" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/>
  <ellipse cx="160" cy="106" rx="26" ry="20" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/>
  <path d="M42 100q10-10 22-8 8 2 14 8-10-2-18 2-8 2-18-2z" fill="#4f7a3a"/><path d="M146 96q12-8 24-2 6 4 12 10-10-3-18 0-10 2-18-8z" fill="#4f7a3a"/>
  <circle cx="52" cy="112" r="5" fill="#7a4a2a"/><circle cx="170" cy="112" r="5" fill="#7a4a2a"/>
  <path d="M60 116l-8 52 24 10 4-46z" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M164 116l8 52-24 10-4-46z" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M104 140h16v152l-8 12-8-12z" fill="#8c8f86" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M112 146v150" stroke="#5c5e57" stroke-width="2.4"/>
  <path d="M104 190l-6 10M120 232l5 8M106 260l-5 9" stroke="#7a4a2a" stroke-width="4" stroke-linecap="round"/>
  <rect x="80" y="130" width="64" height="11" rx="4" fill="#7a4a2a" stroke="#1d2427" stroke-width="2.4"/>
  <rect x="106" y="108" width="12" height="24" fill="#3f2a18" stroke="#1d2427" stroke-width="2"/>
  <circle cx="112" cy="104" r="8" fill="#7a4a2a" stroke="#1d2427" stroke-width="2.4"/>
  <circle cx="68" cy="176" r="11" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/><circle cx="156" cy="176" r="11" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4"/>
  <rect x="102" y="76" width="20" height="14" fill="#14191b"/>
  <path d="M84 60C84 30 96 14 112 14s28 16 28 46v24l-12 8H96l-12-8z" fill="url(#wPlate)" stroke="#1d2427" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M92 52h40v18l-6 10H98l-6-10z" fill="#0c1012" stroke="#1d2427" stroke-width="2"/>
  <ellipse cx="102" cy="62" rx="9" ry="6" fill="url(#wGlow)"/><ellipse cx="122" cy="62" rx="9" ry="6" fill="url(#wGlow)"/>
  <circle cx="102" cy="62" r="2.6" fill="#fff"/><circle cx="122" cy="62" r="2.6" fill="#fff"/>
  <path d="M112 20v32M98 76h28" stroke="#1d2427" stroke-width="2.4"/>
  <path d="M86 40q-10-6-6-20 8 6 10 14zM138 40q10-6 6-20-8 6-10 14z" fill="#65777b" stroke="#1d2427" stroke-width="2" stroke-linejoin="round"/>
  <path d="M94 28q6-6 14-4-4 6-14 4z" fill="#4f7a3a"/>
</svg>`,
};
const spriteFor = (name) => SPRITES[name] || SPRITES.knight;
