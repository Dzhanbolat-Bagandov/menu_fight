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

SPRITES.slime = `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Bog slime">
  <defs>
    <radialGradient id="slG" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#b7e67a"/><stop offset=".55" stop-color="#6fae3e"/><stop offset="1" stop-color="#3d6e22"/></radialGradient>
  </defs>
  <ellipse cx="112" cy="300" rx="92" ry="10" fill="rgba(0,0,0,.45)"/>
  <path d="M22 298C10 250 30 170 112 150c82 20 102 100 90 148z" fill="url(#slG)" stroke="#24401a" stroke-width="3" opacity=".94"/>
  <path d="M40 290c-6 6-4 14 4 12M180 292c6 6 2 12-6 10" stroke="#3d6e22" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- things floating inside -->
  <g opacity=".55"><path d="M120 250l26-8 4 6-26 8z" fill="#efe4c8"/><circle cx="148" cy="244" r="6" fill="#efe4c8"/><circle cx="118" cy="256" r="5" fill="#efe4c8"/>
  <circle cx="78" cy="262" r="9" fill="#d8e6c0"/><circle cx="74" cy="260" r="2" fill="#24401a"/><circle cx="82" cy="260" r="2" fill="#24401a"/></g>
  <circle cx="160" cy="210" r="6" fill="#d8f5b0" opacity=".6"/><circle cx="60" cy="230" r="4" fill="#d8f5b0" opacity=".6"/><circle cx="140" cy="276" r="5" fill="#d8f5b0" opacity=".5"/>
  <ellipse cx="80" cy="190" rx="24" ry="14" fill="#e6ffc8" opacity=".45" transform="rotate(-25 80 190)"/>
  <!-- face, looking left -->
  <ellipse cx="82" cy="214" rx="17" ry="19" fill="#fbfff2" stroke="#24401a" stroke-width="2.5"/>
  <ellipse cx="130" cy="210" rx="14" ry="16" fill="#fbfff2" stroke="#24401a" stroke-width="2.5"/>
  <circle cx="76" cy="218" r="7" fill="#1b1b12"/><circle cx="125" cy="214" r="6" fill="#1b1b12"/>
  <circle cx="73" cy="215" r="2.4" fill="#fff"/><circle cx="122" cy="211" r="2" fill="#fff"/>
  <path d="M84 246q22 14 42 0" stroke="#24401a" stroke-width="4" fill="#2c4a1c" stroke-linecap="round"/>
  <!-- moss tuft + drip -->
  <path d="M96 156q8-14 16-4 8-14 18 2" fill="#4f7a3a" stroke="#24401a" stroke-width="2"/>
  <path d="M50 214q-4 18 4 26" stroke="#8fd060" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
</svg>`;

SPRITES.boar = `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Thornback boar">
  <ellipse cx="116" cy="300" rx="96" ry="10" fill="rgba(0,0,0,.45)"/>
  <!-- far legs -->
  <path d="M74 236l-6 58h16l6-52zM168 236l2 58h16l-2-58z" fill="#3e2a1c" stroke="#1c120a" stroke-width="2.4" stroke-linejoin="round"/>
  <!-- body -->
  <path d="M60 196c0-38 40-64 92-60 40 3 62 30 60 66-2 34-30 52-74 52H96c-24 0-36-24-36-58z" fill="#5a3b24" stroke="#1c120a" stroke-width="3"/>
  <path d="M90 150c30-14 80-14 112 10" stroke="#7a5236" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/>
  <!-- thorny back ridge -->
  <g fill="#3d5a2a" stroke="#1c2a12" stroke-width="2" stroke-linejoin="round">
    <path d="M86 150l4-26 12 22z"/><path d="M106 142l8-30 10 28z"/><path d="M128 138l10-28 8 30z"/><path d="M150 140l12-24 4 28z"/><path d="M172 148l14-18 0 26z"/><path d="M190 160l16-10-4 22z"/>
  </g>
  <path d="M96 146c30-12 70-14 104 8" stroke="#4f7a3a" stroke-width="5" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/>
  <!-- near legs -->
  <path d="M92 240l-4 56h18l4-54zM150 244l4 52h18l-4-54z" fill="#4a3220" stroke="#1c120a" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M86 292h22v8H84zM152 292h22l2 8h-24z" fill="#1c120a"/>
  <!-- head facing left -->
  <path d="M70 168c-28 2-50 22-54 46-2 14 6 24 18 26l30 4c16 2 30-10 32-28 2-26-6-50-26-48z" fill="#5a3b24" stroke="#1c120a" stroke-width="3"/>
  <ellipse cx="24" cy="226" rx="16" ry="14" fill="#b07a62" stroke="#1c120a" stroke-width="2.4"/>
  <circle cx="18" cy="224" r="3" fill="#1c120a"/><circle cx="28" cy="226" r="3" fill="#1c120a"/>
  <path d="M34 238c-12 2-22-4-28-18 10 4 18 6 24 4z" fill="#efe4c8" stroke="#1c120a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42 234c-6-12-6-24 2-36 0 12 4 22 10 30z" fill="#efe4c8" stroke="#1c120a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M84 168l14-22 4 28z" fill="#4a3220" stroke="#1c120a" stroke-width="2.4" stroke-linejoin="round"/>
  <ellipse cx="54" cy="196" rx="6" ry="5" fill="#ffcf4a" stroke="#1c120a" stroke-width="2"/><circle cx="53" cy="196" r="2.4" fill="#7a1a10"/>
  <path d="M44 186l18 4" stroke="#1c120a" stroke-width="3" stroke-linecap="round"/>
  <path d="M206 196q14 4 8 18" stroke="#3e2a1c" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

SPRITES.witch = `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Hedge witch">
  <defs><radialGradient id="wtOrb"><stop offset="0" stop-color="#eaffc8"/><stop offset=".5" stop-color="#8fd060"/><stop offset="1" stop-color="#8fd060" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="116" cy="304" rx="78" ry="9" fill="rgba(0,0,0,.45)"/>
  <!-- staff (front, in her right hand toward the player) -->
  <path d="M46 300C40 230 44 150 54 96" stroke="#5a3a1e" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M54 96c-10-8-14-20-6-30M54 96c10-6 18-4 22 6M50 80c-8 0-12-6-10-12" stroke="#5a3a1e" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="54" cy="84" r="22" fill="url(#wtOrb)"/><circle cx="54" cy="84" r="8" fill="#d8ffb0" stroke="#4f7a3a" stroke-width="2"/>
  <!-- robe -->
  <path d="M84 150c-20 40-30 100-34 150h146c-6-60-20-112-44-150z" fill="#4a3a5a" stroke="#1e1626" stroke-width="3" stroke-linejoin="round"/>
  <path d="M60 300c10-6 20 0 30-4s20 2 30-2 22 4 32 0 22 2 34 2" stroke="#2c2238" stroke-width="5" fill="none"/>
  <path d="M118 160v136" stroke="#2c2238" stroke-width="3"/>
  <rect x="96" y="208" width="44" height="9" fill="#5a3a1e"/><circle cx="118" cy="212" r="7" fill="#8fd060" stroke="#1e1626" stroke-width="2"/>
  <path d="M100 236l14 10-10 8z" fill="#6b5a3a"/><path d="M150 250l12 8-12 6z" fill="#6b5a3a"/>
  <!-- arm holding staff -->
  <path d="M96 168c-18 10-32 28-40 46l12 8c10-14 22-26 36-34z" fill="#4a3a5a" stroke="#1e1626" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="56" cy="214" r="9" fill="#9aae86" stroke="#2c3a20" stroke-width="2.4"/>
  <!-- head -->
  <path d="M86 108c-6 30 8 52 34 52s38-22 32-52z" fill="#bccaa4" stroke="#2c3a20" stroke-width="2.6"/>
  <path d="M84 118c-10 30-10 60-2 80 4-24 8-46 16-64zM154 118c10 30 12 62 4 84-4-26-8-48-16-66z" fill="#d8d8d0" stroke="#7a7a72" stroke-width="2"/>
  <path d="M100 128l-26 8 26 6z" fill="#a9b890" stroke="#2c3a20" stroke-width="2.4" stroke-linejoin="round"/>
  <circle cx="74" cy="136" r="3" fill="#6b5a3a"/>
  <ellipse cx="108" cy="122" rx="5" ry="4" fill="#fff8b0" stroke="#2c3a20" stroke-width="2"/><circle cx="106" cy="122" r="2" fill="#1b1b12"/>
  <ellipse cx="130" cy="122" rx="4" ry="3.5" fill="#fff8b0" stroke="#2c3a20" stroke-width="2"/><circle cx="128" cy="122" r="1.8" fill="#1b1b12"/>
  <path d="M104 146q10 6 22-2" stroke="#2c3a20" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M110 148v5" stroke="#f2ead8" stroke-width="2"/>
  <!-- hat -->
  <path d="M62 112c30-14 96-14 118 2-22 8-94 10-118-2z" fill="#2c2238" stroke="#120c18" stroke-width="2.6"/>
  <path d="M86 106c2-34 14-64 46-84-6 16 4 26 0 40-4 16 6 30 8 44z" fill="#3a2e4a" stroke="#120c18" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M90 100c16 4 32 4 48 0" stroke="#8fd060" stroke-width="5"/><rect x="104" y="58" width="16" height="12" fill="#5a4a6a" stroke="#120c18" stroke-width="1.5" stroke-dasharray="3 2" transform="rotate(-8 112 64)"/>
  <path d="M132 22c8 0 12 6 8 12" stroke="#120c18" stroke-width="2" fill="none"/>
  <!-- bramble at her feet -->
  <path d="M30 304c20-20 40-14 50-30M190 304c-14-18-30-10-40-26" stroke="#4f7a3a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M46 290l-6-4M60 282l2-7M176 288l6-4M164 280l-2-7" stroke="#a7c47a" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

SPRITES.treant = `
<svg viewBox="0 0 220 320" class="sprite-svg" role="img" aria-label="Ancient treant">
  <defs><radialGradient id="trEye"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ffb030"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient>
  <linearGradient id="trBark" x1="0" x2="1"><stop offset="0" stop-color="#3e2c1c"/><stop offset=".5" stop-color="#6b4a2e"/><stop offset="1" stop-color="#34241a"/></linearGradient></defs>
  <ellipse cx="112" cy="306" rx="100" ry="10" fill="rgba(0,0,0,.5)"/>
  <!-- roots -->
  <path d="M70 290c-20 4-40 10-56 14M90 296c-6 4-14 8-26 10M150 292c20 4 40 8 58 12M136 298c6 4 14 6 22 8" stroke="#3e2c1c" stroke-width="10" stroke-linecap="round" fill="none"/>
  <!-- branch arms -->
  <path d="M74 126C44 120 26 104 14 80M60 120c-12 14-22 34-26 58" stroke="#4a3322" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M150 124c30-8 46-26 54-52M162 132c14 16 22 36 24 58" stroke="#4a3322" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M14 80l-8-12M14 80l-2 14M34 178l-10 6M34 178l2 12M204 72l8-10M204 72l6 12M186 190l10 4M186 190l-2 12" stroke="#4a3322" stroke-width="6" stroke-linecap="round"/>
  <!-- leaf clusters -->
  <g fill="#4f7a3a" stroke="#22361a" stroke-width="2"><circle cx="16" cy="66" r="18"/><circle cx="32" cy="56" r="14"/><circle cx="206" cy="58" r="18"/><circle cx="190" cy="48" r="14"/><circle cx="30" cy="190" r="12"/><circle cx="190" cy="200" r="12"/></g>
  <g fill="#6f9a4a"><circle cx="12" cy="60" r="7"/><circle cx="200" cy="52" r="7"/></g>
  <!-- trunk -->
  <path d="M66 300c8-60 0-150 10-200 6-30 20-50 36-60 16 10 30 30 36 60 10 50 2 140 10 200z" fill="url(#trBark)" stroke="#1e140c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M92 290c4-50-2-120 6-170M128 290c-4-50 2-120-6-170M110 280c2-40 0-80 2-110" stroke="#2a1c12" stroke-width="3" fill="none" opacity=".7"/>
  <!-- crown -->
  <g fill="#3f6a30" stroke="#22361a" stroke-width="2.4"><circle cx="112" cy="40" r="34"/><circle cx="80" cy="56" r="24"/><circle cx="146" cy="56" r="24"/><circle cx="112" cy="16" r="18"/></g>
  <g fill="#5a8a42"><circle cx="100" cy="32" r="10"/><circle cx="136" cy="48" r="8"/></g>
  <!-- face carved in bark -->
  <path d="M84 124q10-10 22-2M118 122q12-8 22 2" stroke="#1e140c" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="96" cy="136" rx="9" ry="7" fill="#1e140c"/><ellipse cx="128" cy="136" rx="9" ry="7" fill="#1e140c"/>
  <circle cx="96" cy="136" r="10" fill="url(#trEye)"/><circle cx="128" cy="136" r="10" fill="url(#trEye)"/>
  <path d="M90 178c8 10 36 10 44 0-6 14-38 14-44 0z" fill="#1e140c"/>
  <path d="M96 182l4 6 4-5M116 183l4 5 4-6" stroke="#6b4a2e" stroke-width="2" fill="none"/>
  <!-- moss beard -->
  <path d="M86 186c2 20 10 34 26 42 16-8 24-22 26-42-8 8-18 10-26 10s-18-2-26-10z" fill="#5a8a42" stroke="#22361a" stroke-width="2" opacity=".9"/>
  <path d="M74 210c-6 10-4 20 2 26M150 214c6 10 4 20-2 26" stroke="#5a8a42" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;
