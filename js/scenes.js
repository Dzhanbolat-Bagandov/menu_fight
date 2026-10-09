'use strict';
/* Scene illustrations for the non-combat views (inline SVG placeholders). */

const KNIGHT_HEAD = (x, y, s = 1, flip = false) => `
  <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="4" rx="17" ry="20" fill="#e0b48c" stroke="#2e3236" stroke-width="2"/>
    <circle cx="-7" cy="4" r="2.2" fill="#2e3236"/><circle cx="7" cy="4" r="2.2" fill="#2e3236"/>
    <path d="M-6 16q6 4 12 0" stroke="#5a3a1e" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M-20 8C-22 -20 -10 -32 0 -32s22 12 20 40l-6 4V-6H-14v18z" fill="#cfd5d9" stroke="#2e3236" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-16 -14Q0 -22 16 -14" stroke="#c8913a" stroke-width="3.5" fill="none"/>
    <path d="M0 -32C-8 -48 16 -50 24 -38C16 -40 10 -36 6 -30z" fill="#a8322a" stroke="#2e3236" stroke-width="1.8"/>
  </g>`;

const SCENES = {
  chestClosed: `
<svg viewBox="0 0 260 220" class="scene-svg chest-svg" role="img" aria-label="A closed chest">
  <ellipse cx="130" cy="200" rx="110" ry="12" fill="rgba(0,0,0,.45)"/>
  <rect x="40" y="96" width="180" height="100" rx="6" fill="#7a4e2a" stroke="#2a1a0c" stroke-width="4"/>
  <path d="M40 120h180M40 150h180M40 178h180" stroke="#5a3a1e" stroke-width="3"/>
  <path d="M36 98C36 50 80 30 130 30s94 20 94 68z" fill="#8a5a30" stroke="#2a1a0c" stroke-width="4"/>
  <path d="M60 46c20-8 50-12 70-12M48 70c40-14 120-14 164 0" stroke="#5a3a1e" stroke-width="3" fill="none"/>
  <g fill="#4a4f55" stroke="#1d2024" stroke-width="2.5"><rect x="62" y="36" width="16" height="160"/><rect x="182" y="36" width="16" height="160"/><rect x="36" y="92" width="188" height="12"/></g>
  <g fill="#c8913a"><circle cx="70" cy="110" r="3"/><circle cx="70" cy="170" r="3"/><circle cx="190" cy="110" r="3"/><circle cx="190" cy="170" r="3"/></g>
  <rect x="112" y="88" width="36" height="44" rx="5" fill="#c8913a" stroke="#2a1a0c" stroke-width="3"/>
  <circle cx="130" cy="106" r="5" fill="#2a1a0c"/><path d="M130 110v12" stroke="#2a1a0c" stroke-width="4"/>
</svg>`,
  chestOpen: `
<svg viewBox="0 0 260 220" class="scene-svg chest-svg" role="img" aria-label="An open chest">
  <defs><radialGradient id="chGlow" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#ffcf4a" stop-opacity=".8"/><stop offset="1" stop-color="#ffcf4a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="130" cy="200" rx="110" ry="12" fill="rgba(0,0,0,.45)"/>
  <ellipse cx="130" cy="96" rx="120" ry="86" fill="url(#chGlow)" class="chest-glow"/>
  <path d="M40 98C40 60 70 22 130 18s90 42 90 80z" fill="#5a3a1e" stroke="#2a1a0c" stroke-width="4" transform="translate(0 -6) scale(1 .55)"/>
  <rect x="44" y="40" width="172" height="20" rx="4" fill="#3a2414" stroke="#2a1a0c" stroke-width="3"/>
  <rect x="40" y="96" width="180" height="100" rx="6" fill="#7a4e2a" stroke="#2a1a0c" stroke-width="4"/>
  <path d="M40 120h180M40 150h180M40 178h180" stroke="#5a3a1e" stroke-width="3"/>
  <ellipse cx="130" cy="98" rx="86" ry="12" fill="#2a1a0c"/>
  <g fill="#ffcf4a" stroke="#a8741a" stroke-width="1.5"><ellipse cx="96" cy="96" rx="12" ry="5"/><ellipse cx="120" cy="92" rx="12" ry="5"/><ellipse cx="146" cy="95" rx="12" ry="5"/><ellipse cx="168" cy="98" rx="10" ry="4"/></g>
  <g fill="#4a4f55" stroke="#1d2024" stroke-width="2.5"><rect x="62" y="96" width="16" height="100"/><rect x="182" y="96" width="16" height="100"/><rect x="36" y="92" width="188" height="12"/></g>
  <rect x="112" y="98" width="36" height="34" rx="5" fill="#c8913a" stroke="#2a1a0c" stroke-width="3"/>
</svg>`,

  rest: `
<svg viewBox="0 0 640 300" class="scene-svg" role="img" aria-label="The knight resting by a campfire beside a tent">
  <defs>
    <linearGradient id="rsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1426"/><stop offset=".7" stop-color="#1f2a3e"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>
    <radialGradient id="rsGlow" cx=".5" cy=".5"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="640" height="300" fill="url(#rsSky)"/>
  <g fill="#fff6d8"><circle cx="60" cy="40" r="1.6"/><circle cx="130" cy="70" r="1.2"/><circle cx="210" cy="30" r="1.8"/><circle cx="300" cy="60" r="1.2"/><circle cx="400" cy="24" r="1.6"/><circle cx="470" cy="80" r="1.2"/><circle cx="590" cy="44" r="1.8"/><circle cx="350" cy="100" r="1"/></g>
  <circle cx="540" cy="60" r="22" fill="#f4ecd0"/><circle cx="550" cy="54" r="20" fill="url(#rsSky)"/>
  <path d="M0 210c80-30 160-36 240-20s180 10 260-14 110-10 140 0v124H0z" fill="#1a2418"/>
  <path d="M0 232c120-16 260-8 400 0s180-8 240-6v74H0z" fill="#2a3420"/>
  <!-- pines -->
  <g fill="#122016"><path d="M30 214l26-70 26 70z"/><path d="M80 210l20-54 20 54z"/><path d="M590 206l22-60 22 60z"/></g>
  <!-- tent -->
  <path d="M400 250l80-120 80 120z" fill="#8a7650" stroke="#2a2214" stroke-width="3" stroke-linejoin="round"/>
  <path d="M480 130l-24 120h48z" fill="#2a1e12"/><path d="M480 130l-30 120" stroke="#a89470" stroke-width="3"/>
  <path d="M480 130v-14" stroke="#5a3a1e" stroke-width="4"/><path d="M480 118l14 6-14 6z" fill="#a8322a"/>
  <path d="M400 250l-20 6M560 250l20 6" stroke="#5a3a1e" stroke-width="2"/>
  <!-- glow + campfire -->
  <ellipse cx="300" cy="244" rx="180" ry="70" fill="url(#rsGlow)" class="fire-glow"/>
  <g transform="translate(300 250)">
    <path d="M-34 4l68-14M-34 -10l68 14" stroke="#4a3220" stroke-width="10" stroke-linecap="round"/>
    <g class="flames">
      <path d="M0 -60c8 18 28 26 22 50a22 22 0 0 1-44 0c0-14 8-18 10-32 4 6 8 4 12-18z" fill="#f08a2c"/>
      <path d="M0 -34c4 12 14 16 12 28a12 12 0 0 1-24 0c0-8 6-12 12-28z" fill="#f4d35e"/>
    </g>
    <g fill="#ffcf4a" class="embers"><circle cx="-8" cy="-70" r="2"/><circle cx="12" cy="-84" r="1.6"/><circle cx="4" cy="-100" r="1.2"/></g>
  </g>
  <!-- knight sitting on a log, facing the fire -->
  <g transform="translate(176 0)">
    <rect x="-36" y="238" width="96" height="16" rx="8" fill="#5a3a1e" stroke="#2a1a0c" stroke-width="2"/>
    <!-- legs: thighs forward, shins down -->
    <path d="M8 224h44v18H8z" fill="#bfc8cf" stroke="#2e3236" stroke-width="2"/>
    <path d="M38 236h16v38H38z" fill="#bfc8cf" stroke="#2e3236" stroke-width="2"/>
    <path d="M34 270h28v10H32z" fill="#4a3322" stroke="#2e3236" stroke-width="2"/>
    <circle cx="48" cy="232" r="6" fill="#c8913a" stroke="#2e3236" stroke-width="1.5"/>
    <!-- torso -->
    <path d="M-8 160q24-10 40 2l-2 66H-6z" fill="#cfd5d9" stroke="#2e3236" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="-6" y="216" width="36" height="8" fill="#c8913a" stroke="#2e3236" stroke-width="1.5"/>
    <ellipse cx="22" cy="164" rx="14" ry="10" fill="#cfd5d9" stroke="#2e3236" stroke-width="2"/>
    <!-- arm reaching toward the fire -->
    <path d="M24 170l36 22-6 10-36-18z" fill="#aab4bc" stroke="#2e3236" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="60" cy="198" r="7" fill="#aab4bc" stroke="#2e3236" stroke-width="2"/>
    ${KNIGHT_HEAD(14, 136, 0.9)}
    <!-- shield + sword leaning on the log -->
    <path d="M-60 206h34v30c0 20-17 30-17 30s-17-10-17-30z" fill="#8e2a22" stroke="#c8913a" stroke-width="3.5"/>
    <path d="M-43 210v52M-56 228h26" stroke="#c8913a" stroke-width="4"/>
    <path d="M-70 270l20-110" stroke="#e6ebee" stroke-width="5"/><path d="M-56 186h20" stroke="#c8913a" stroke-width="5" transform="rotate(12 -46 186)"/>
  </g>
</svg>`,

  victory: `
<svg viewBox="0 0 640 340" class="scene-svg" role="img" aria-label="The knight hugging a princess in front of a pile of gold">
  <defs>
    <radialGradient id="vcGlow" cx=".5" cy=".6"><stop offset="0" stop-color="#fff2b0" stop-opacity=".7"/><stop offset="1" stop-color="#ffcf4a" stop-opacity="0"/></radialGradient>
    <linearGradient id="vcGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#c8912a"/></linearGradient>
    <linearGradient id="vcDress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c46aa8"/><stop offset="1" stop-color="#7a3a6e"/></linearGradient>
  </defs>
  <rect width="640" height="340" fill="#1e1610"/>
  <ellipse cx="320" cy="210" rx="320" ry="170" fill="url(#vcGlow)"/>
  <!-- gold pile -->
  <path d="M60 300C100 200 200 130 320 120s230 70 270 180z" fill="url(#vcGold)" stroke="#8a5f1e" stroke-width="3"/>
  <g fill="#ffd95a" stroke="#a8741a" stroke-width="1.5">
    <ellipse cx="200" cy="200" rx="14" ry="6"/><ellipse cx="240" cy="170" rx="14" ry="6"/><ellipse cx="300" cy="150" rx="14" ry="6"/><ellipse cx="360" cy="146" rx="14" ry="6"/>
    <ellipse cx="420" cy="172" rx="14" ry="6"/><ellipse cx="470" cy="210" rx="14" ry="6"/><ellipse cx="150" cy="250" rx="14" ry="6"/><ellipse cx="520" cy="250" rx="14" ry="6"/>
    <ellipse cx="330" cy="128" rx="12" ry="5"/><ellipse cx="270" cy="196" rx="12" ry="5"/><ellipse cx="390" cy="200" rx="12" ry="5"/>
  </g>
  <!-- goblet + crown on the pile -->
  <path d="M440 150h24l-4 16h-16z M448 166h8v12h-8z M440 178h24v4h-24z" fill="#e8b768" stroke="#8a5f1e" stroke-width="2"/>
  <path d="M190 228l6-14 8 8 8-12 8 12 8-8 6 14z" fill="#ffd95a" stroke="#8a5f1e" stroke-width="2"/><circle cx="212" cy="222" r="3" fill="#c4452f"/>
  <g fill="#fff" class="sparkle"><path d="M260 120l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M420 110l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M520 200l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M120 220l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></g>
  <ellipse cx="320" cy="332" rx="200" ry="10" fill="rgba(0,0,0,.4)"/>
  <!-- princess (right), facing the knight -->
  <g>
    <path d="M330 220c-14 40-26 80-34 112h108c-8-32-20-72-34-112z" fill="url(#vcDress)" stroke="#3a1a34" stroke-width="3" stroke-linejoin="round"/>
    <path d="M332 214q18 -10 36 0l-2 26h-32z" fill="#c46aa8" stroke="#3a1a34" stroke-width="2.4"/>
    <path d="M338 236h24" stroke="#ffd95a" stroke-width="4"/>
    <!-- her arms around the knight -->
    <path d="M336 228c-20 2-34 6-44 12" stroke="#f0c8a8" stroke-width="10" stroke-linecap="round" fill="none"/>
    <path d="M336 228c-20 2-34 6-44 12" stroke="#c46aa8" stroke-width="12" stroke-linecap="round" fill="none" stroke-dasharray="14 40"/>
    <!-- head -->
    <path d="M330 168c-12 10-14 40-6 56 10-4 14-10 16-20z" fill="#e8b84a" stroke="#8a5f1e" stroke-width="2"/>
    <ellipse cx="350" cy="190" rx="18" ry="21" fill="#f0c8a8" stroke="#3a1a34" stroke-width="2"/>
    <path d="M332 182c4-18 30-24 40-6-6 0-14-2-22-8-4 6-10 10-18 14z" fill="#e8b84a" stroke="#8a5f1e" stroke-width="2"/>
    <path d="M368 186c10 14 10 34 2 44" stroke="#e8b84a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M338 166l4-12 6 8 4-10 4 10 6-8 2 12z" fill="#ffd95a" stroke="#8a5f1e" stroke-width="1.8"/>
    <path d="M340 190q4-3 8 0" stroke="#3a1a34" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="356" cy="200" r="3" fill="#e88a8a" opacity=".6"/>
    <path d="M344 202q4 3 8 0" stroke="#a8322a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <!-- knight (left), facing the princess -->
  <g>
    <rect x="262" y="270" width="20" height="56" rx="6" fill="#cfd5d9" stroke="#2e3236" stroke-width="2"/>
    <rect x="286" y="270" width="20" height="56" rx="6" fill="#cfd5d9" stroke="#2e3236" stroke-width="2"/>
    <path d="M256 322h28v10h-30zM284 322h28l2 10h-30z" fill="#4a3322" stroke="#2e3236" stroke-width="2"/>
    <path d="M254 256h60l4 20h-68z" fill="#aab4bc" stroke="#2e3236" stroke-width="2"/>
    <path d="M252 196q32-12 64 0l-4 64h-56z" fill="#cfd5d9" stroke="#2e3236" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="256" y="248" width="56" height="8" fill="#c8913a" stroke="#2e3236" stroke-width="1.5"/>
    <ellipse cx="256" cy="202" rx="16" ry="12" fill="#cfd5d9" stroke="#2e3236" stroke-width="2"/>
    <ellipse cx="312" cy="202" rx="16" ry="12" fill="#cfd5d9" stroke="#2e3236" stroke-width="2"/>
    <!-- his arm around her back, below her shoulders -->
    <path d="M314 212c16 14 36 20 54 16" stroke="#2e3236" stroke-width="15" stroke-linecap="round" fill="none"/>
    <path d="M314 212c16 14 36 20 54 16" stroke="#cfd5d9" stroke-width="11" stroke-linecap="round" fill="none"/>
    <circle cx="370" cy="227" r="7.5" fill="#aab4bc" stroke="#2e3236" stroke-width="2"/>
    ${KNIGHT_HEAD(292, 168, 1)}
    <!-- sword sheathed, shield on back -->
    <path d="M244 214h26v24c0 16-13 24-13 24s-13-8-13-24z" fill="#8e2a22" stroke="#c8913a" stroke-width="3"/>
  </g>
  <!-- hearts -->
  <g fill="#e05a6a" class="hearts"><path d="M322 132c-6-10-20-4-14 6l14 12 14-12c6-10-8-16-14-6z"/><path d="M372 118c-4-6-12-2-8 4l8 7 8-7c4-6-4-10-8-4z" opacity=".8"/></g>
</svg>`,
};
