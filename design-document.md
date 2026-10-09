# Menu Fight — Design Document

Status: **v0 prototype scope.** This document records decisions made so far. Anything marked **(assumption)** was not stated explicitly and should be confirmed or changed.

## 1. Vision

A turn-based, purely UI-driven strategy prototype. No moving characters and no real-time action: buttons, gauges, menus, panels and a combat log. Heavily inspired by *Slay the Spire*. **A run** is a walk across a small branching map of fights, chests and rest sites, ending at the treasure (section 15).

Tone: mildly dark, cozy fantasy.

## 2. Tech

- Plain **HTML + CSS + vanilla JavaScript**, no build step, no dependencies.
- Browser only, desktop first, layout should scale down gracefully.
- Classic `<script>` tags sharing one global namespace, so `index.html` works when opened directly from disk **(assumption)**. Moving to ES modules later is a mechanical change.
- Game state is plain data. Actions are functions that change state. `render(state)` redraws the UI from state. No game logic lives in the DOM.

```
menu_fight/
├── index.html
├── style.css
├── design-document.md
├── js/
│   ├── data.js      # player, enemies, actions, statuses, items (pure data)
│   ├── state.js     # battle state + helpers
│   ├── engine.js    # turn loop, damage pipeline, status handling, enemy AI
│   ├── run.js       # the run: map, node outcomes, loot, save/load
│   ├── views.js     # map, chest, rest site, victory/game-over screens, top bar
│   ├── art.js       # Storybook Ink characters, scenes, stage backdrops
│   ├── settings.js  # settings, themes, generated textures, 1920x1080 canvas scaling
│   ├── ui.js        # battle screen: render, tooltips, inventory modal, input
│   ├── cli.js       # combat-log command line + debug commands
│   ├── audio.js     # procedural sound effects (Web Audio API, no audio files)
│   ├── fx.js        # visual effects + mapping engine events to sounds
│   └── icons.js     # Painted Classic icons (generated once into an SVG sprite sheet)
├── assets/          # fonts (Cinzel, Alegreya; OFL) + fonts.css
└── samples/         # style samples and dev galleries (icon-gallery.html, art-gallery.html)
```

## 3. Screen layout

The window is split horizontally into two cards over a shared combat log. **Both cards use the same row layout with fixed row heights**, so every section lines up across the screen and the sprite areas are the same size:

```
┌───────────────────────────────────┬───────────────────────────────────┐
│ [🎒]      Sir Aldric · Lv 1        │ [📖]   Grubnik the Cutpurse · Lv 1 │  name row
│            [ sprite ]             │            [ sprite ]             │  stage (fills the rest)
│ 🛡 HP      ████████░░             │ 🛡 HP      ██████░░░░             │
│    Mana    █████░░░░░             │                                   │  resources (enemy rows
│    Stamina ███████░░░             │                                   │  are left empty)
│ status icons                      │ status icons                      │  statuses
│ [⇄] [1][2][3][4][5][6]  [End Turn]│ [icon] NEXT MOVE: Jab · 10 damage │  action bar / intent
├───────────────────────────────────┴───────────────────────────────────┤
│ Combat log                                             [♪ Sound on]   │
│ > _  (command line)                                                   │
└───────────────────────────────────────────────────────────────────────┘
```

- **Corner buttons:** each card has a square icon button in its top-left corner.
  - Player: **Equipment & Backpack** (hotkey I) opens the inventory (section 9).
  - Enemy: **Enemy info** opens on hover (click to pin). It shows the creature's description, level, HP, all its moves and its traits.
- **Action bar:** one row holding:
  - a **toggle button** (left, hotkey Q) that swaps the bar between **Actions** and pinned **Items**. The current page fades out while the other slides in from the side;
  - up to 6 tiles, which shrink to fit narrow windows. Number keys 1–6 use the tiles of the page that is showing;
  - the **End Turn** button (hotkey E), anchored at the far right however many tiles are showing.
- **Enemy intent** fills the same row on the enemy card.
- **Block** is shown as a shield icon in front of the health bar, with the number on top of it. It is hidden at 0.
- **Buttons** are disabled (with the reason in the tooltip) when the player cannot afford them or it is not their turn.
- **Status effects** appear as small icons with stack count and remaining turns.

### 3.1 Icons and tooltips

Every move, item, equipment piece and status effect is represented by a **square icon**. This is one reusable UI component.

- The icon is a square tile with an iron or bronze frame. It may carry small overlays: a cost badge, a stack count, a remaining-turns badge or a key hint.
- **Hovering** an icon opens a context pop-up (tooltip) that contains:
  - the same icon, enlarged;
  - the name;
  - the stats: cost, damage, block, duration, stacking rules and so on;
  - the description text;
  - for disabled actions, why they are disabled.
- The pop-up stays inside the viewport and follows the pointer. On click or tap it can be pinned.
- Icons are drawn as small inline SVGs (`icons.js`), so they can be replaced by real art later. Content comes from the data tables, so tooltips never need hand-written text per icon.

## 4. Visual style — cozy medieval

**Chosen styles** (from the samples in `samples/`):
- **Characters and scenes: Storybook Ink.** Flat colour, a crisp cel-shadow band and a rim highlight on every shape, bold ink outlines. Every character is shape data in `art.js`, rendered by one function.
- **Icons: Painted Classic** (WoW-like). Full-bleed square icons: a moody background in the icon's theme colour, the subject large and angled with painterly gradients, a glow behind it and a dark vignette, set in a gold bevelled frame. A "bare" version of each subject (no background) is used for badges, map nodes, projectiles and effects. Items that share an icon (rings, armour) get their background tinted by their colour.
- **Fonts: Cinzel** (carved Trajan-style capitals) for titles, buttons, labels and numbers; **Alegreya** (calligraphic book face) for body text, tooltips and the log. Both are bundled in `assets/fonts`.

**Layout.** The UI is designed on a fixed **1920×1080 canvas** that is scaled uniformly to fit the window, so it keeps its proportions at any resolution. Settings has an *Interface size* slider (70–100% of the window).

**Backgrounds** (Settings → Background, switch instantly without reloading):

| Theme | Page | Panels |
|---|---|---|
| Dark Oak (default) | dark planks | grey stone, iron frames |
| Birch & Cobblestone | pale birch planks with bark marks | chunky pixel cobblestone (Minecraft-like, generated in code) |
| Castle Hall | slate ashlar wall, red tapestries, torch glow | dark walnut, brass trim |
| Night Camp | starry night sky with campfire glow | dark leather |

Text-heavy cards (settings, inventory, tooltips, scenes) use a calmer surface where the panel texture is busy.

**Stage backdrops.** Each enemy has a biome drawn behind both characters: road (Grubnik), bog (Gloop), forest (Boar, Ironbark), hedgerow (Mother Nettle), crypt (Warden).

**Ambient touches.** Characters breathe with a slow idle animation, a red vignette pulses at the screen edges when your HP is at 30% or below, and *Reduce motion* turns idle and looping animations off.

**Combat log modes** (Settings, the log button at top right, or hotkey **L**):
- **Docked:** a framed panel along the bottom.
- **Blend-in:** frameless text floating over the scene (over your character's stage in fights). Lines fade after 7 seconds; hover the log to read back and type commands.
- **Hidden:** the log disappears and the stages get the full height. Press **/** to open the command line.

**Settings** (gear button at top right, hotkey **O**): background, log mode, interface size, sound on/off and volume, reduce motion. Settings are remembered in the browser.

## 4.1 Animation, effects and sound

**Timing.** Actions resolve as timed step sequences rather than instantly, so each beat is readable:
- A melee attack lunges, then the hit lands about 170 ms later.
- A spell is cast, a projectile flies across the panels, and it lands about 340 ms later.
- Each hit of a multi-hit move (e.g. Frenzied Flurry) is its own step, about 330 ms apart.
- Burn ticks, Lightning Shield and the enemy's turn are spaced out the same way.
- Input is ignored while a sequence plays. Timings live in one table (`T` in `engine.js`).

**Sprite motion** (Web Animations API, composited so motions stack):
- Melee: the attacker slides forward and back. Heavy attacks slide further, with a lean.
- Being hit: the target recoils away from the attacker and flashes white.
- Casting: a small forward lean and a hop.
- Raising a shield: a small step back.

**Visual effects:**
- Hit sparks coloured by damage type: steel/gold for physical, orange for fire, ice-blue for frost, violet for lightning.
- Fireball, Frost Arrow and Grave Chill fly as projectiles between the panels.
- Shield effects: a translucent shield appears in front of the defender when block is gained, flashes with a ring when a hit is absorbed, and splits in two when block is broken.
- A faint blue aura shows while a character has block.
- Persistent states: a violet flicker while Lightning Shield is on, an icy tint while Frozen, an ember glow while burning, orbiting stars while Stunned, a raised, red-glowing stance while the Warden winds up Crushing Overhead, and a greyed-out, slumped sprite on defeat.

**Sound.** All sounds are synthesized in code (oscillators and filtered noise), so there are no asset files. Enemy and player moves of the same nature share sounds:

| Sound | Used for |
|---|---|
| swing / heavySwing | light and heavy melee wind-ups (player and enemy) |
| hit / heavyHit (+ hurt for the player) | unblocked physical hits |
| defend | gaining block (Defend, Buckler, Bulwark) |
| block | a hit absorbed by block |
| shieldBreak | block reduced to 0 by a hit |
| fireCast / fireImpact / burn | Fireball and Burn ticks |
| frostCast / frostImpact | Frost Arrow, and the impact of Grave Chill |
| chill / drain | Grave Chill cast and mana drain |
| zap / lightningOn / lightningOff | Lightning Shield tick and toggles |
| stagger / stun / immune / windup | status cues and the Warden's wind-up |
| potion / turn / victory / defeat / click | items, start of your turn, fight end, UI |

Sound can be toggled with the button on the combat log or with the `sound` CLI command, which also sets the volume and plays any sound by name. The setting is remembered in the browser.

## 5. Sprites

Storybook Ink SVG characters in `art.js` (see section 4). Replacing one with real art later means swapping it for an `<img>`.

- **Player:** a knight in plate armour with an open-visored helm and red plume, a red tabard with a gold cross, a cape, a blue kite shield with a silver chevron, and the sword raised diagonally.
- **Enemies:** see section 10.

## 6. Core rules

### 6.1 Resources (player)

| Resource | Max | Start | Regeneration | Notes |
|---|---|---|---|---|
| Health | 250 | full | **none** during a fight | Restored only by skills, items, and resting outside battle (future). |
| Mana | 400 | full | +10 per turn | Large reserve, slow regeneration. Spent on spells. |
| Stamina | 100 | full | +50 per turn | Small reserve, fast regeneration. Spent on physical moves. |

Regeneration is capped at the maximum.

### 6.2 Turn structure (assumption: several actions per turn)

The player may take **multiple actions per turn** while they can afford them, then press **End Turn**. This is what makes a 50/turn stamina refill meaningful.

1. **Player turn start:** player's block is discarded, then mana and stamina regenerate. (On turn 1 resources are already full.)
2. **Player actions:** any number, limited by resources.
3. **Player turn end:** the player's status effects tick (lightning shield fires, the player's own damage-over-time ticks, durations decrease).
4. **Enemy turn start:** the enemy's block is discarded. If stunned, the enemy skips to step 6.
5. **Enemy action:** performs the move shown by its intent.
6. **Enemy turn end:** the enemy's status effects tick (burn deals damage, durations decrease). Then the enemy chooses and reveals its **next intent**.
7. Back to step 1. Win/loss is checked after every damage event. The fight ends when either side reaches 0 HP.

**Duration rule:** a status with duration *N* lasts through *N* of the **afflicted creature's own turns** and expires at the end of the last one. Example: *Frozen (1)* applied on the player's turn reduces the enemy's very next attack, then expires.

**Block discard rule:** all unspent block is discarded at the start of its owner's turn. Block gained on your own turn therefore protects you through the opponent's turn.

### 6.3 Damage pipeline

1. Base damage of the move.
2. Attacker bonuses (e.g. the *Staggered* bonus on the target adds to light attacks).
3. Attacker outgoing-damage reductions, multiplied together (e.g. enemy is *Staggered* ×0.85 and *Frozen* ×0.60 → ×0.51). Result is rounded to the nearest integer.
4. **Block absorbs 1:1**: block is reduced first, the remainder hits HP.
5. **Nothing ignores block.** Burn and Lightning Shield damage go through the same pipeline and are absorbed by block first.

## 7. Player actions

| Action | Cost | Effect |
|---|---|---|
| **Attack** (light) | 20 stamina | Deal 15 damage. |
| **Heavy Attack** | 50 stamina | Deal 25 damage. Apply **Staggered** for 3 turns. If the target is **already Staggered**, also **stun** it for 1 turn (it skips its next turn). |
| **Defend** | 10 stamina | Gain 10 block. |
| **Fireball** | 30 mana | Deal 20 damage. Apply **Burn**. |
| **Frost Arrow** | 40 mana | Deal 30 damage. Apply **Frozen** for 1 turn. |
| **Lightning Shield** | 10 mana per turn while active | **Toggle.** While active, at the end of each of your turns pay 10 mana and deal 10 damage to the enemy. If you cannot pay, it switches off. Toggling it on or off is free and does not use up a turn **(assumption: the 10 mana is a per-turn upkeep)**. |
| **End Turn** | — | Ends the player turn. |
| **Equipment** | — | Opens the equipment menu (section 9). Free, not an action. |
| **Items** | varies | Usable consumables are shown as icons in the actions panel next to the base actions (section 9). |

Resting is **not** an in-combat action. It belongs to future out-of-combat events.

## 8. Status effects

| Status | Where | Duration | Effect |
|---|---|---|---|
| **Staggered** | enemy | 3 turns | Light attacks against it deal **+5** damage. Heavy attacks against it **stun** it for 1 turn. It deals **15% less** damage. Reapplying refreshes the duration; it does not stack. |
| **Stunned** | enemy | 1 turn | The enemy skips its next turn; any telegraphed or charging move is cancelled. |
| **Burn** | enemy | 2 turns per stack | Deals **5 damage** at the end of the afflicted creature's turn per stack. Stacks up to **3**. Each stack keeps **its own independent duration**, so the 3rd Fireball does not refresh the 1st. A 4th application while at 3 stacks is wasted, or replaces the oldest stack **(assumption: replaces the oldest)**. |
| **Frozen** | enemy | 1 turn | The enemy deals **40% less** damage. Reapplying refreshes; it does not stack. |
| **Lightning Shield** | player | until toggled off | See section 7. |
| **Bleed** | player | 3 turns | 4 damage at the end of each of your turns (block applies). Reapplying refreshes. |
| **Weakened** | player | 2 turns | You deal 25% less damage (all attacks and spells). |
| **Slowed** | player | 1 turn | Stamina regenerates 50% slower at the start of your next turn. |
| **Enraged** | enemy | until its next attack | Its next attack deals +6 damage per hit, then Enraged is consumed. |
| **Thorns** | enemy | 2 turns | Each of your Attacks and Heavy Attacks takes 3 damage back (block applies). |

Statuses are defined as data in `data.js` (name, icon, description, stacking rule, hooks) so new ones can be added without touching the engine.

## 9. Items and equipment

### 9.1 Consumables

Consumables live in the backpack. Any of them can be **pinned** to the action bar's Items page (up to 6) from the inventory screen. Using one is an action that costs no resource and may be repeated within a turn. A pinned item with a count of 0 stays on the bar, disabled.

| Item | Effect | Count | Pinned at start |
|---|---|---|---|
| Healing Draught | Restore 60 HP | 2 | yes |
| Mana Tonic | Restore 100 mana | 1 | yes |
| Stamina Tincture | Restore 50 stamina | 1 | yes |
| Elderberry Bread | Restore 25 HP and 20 stamina | 3 | no |

### 9.2 Equipment & Backpack screen

The corner button on the player card (hotkey I) opens a modal with two columns:

- **Equipped:** a paper-doll with one square slot per piece (head, chest, legs, gloves, main hand, off hand, two rings), plus the total stat bonuses. Clicking an equipped item moves it to the backpack.
- **Backpack:** spare gear and consumables. Clicking gear equips it into its slot, and whatever was there goes back to the backpack. Rings fill the first free ring slot. Clicking a consumable pins or unpins it on the action bar (★ marks pinned items).
- Gear can be changed on your turn but not while the enemy is acting.

**Starting loadout**

| Where | Item | Stats |
|---|---|---|
| Head | Plain Helm | none |
| Main hand | Iron Sword | +1 damage on Attack and Heavy Attack |
| Off hand | Wooden Shield | +1 block from Defend |
| Backpack | Iron Gauntlets (gloves) | +2 damage on Attack |
| Backpack | Bronze Ring (ring) | +2 spell damage (Fireball, Frost Arrow, Lightning Shield) |

Stats are flat modifiers defined as data on the item (e.g. `{ lightDamage: 1, heavyDamage: 1 }`). The engine sums all equipped items when it calculates damage and block, at step 2 of the damage pipeline.

## 10. Enemies

Enemies have HP, a list of moves, and an **AI**. At the end of each of its turns an enemy chooses its **next move** and shows it as an **intent** (move name, icon, and the damage it would deal *with current debuffs applied*). The player therefore always decides with full knowledge of what is coming.

Every enemy has an **Enemy moves** window that lists all its moves with descriptions. Enemy AI is a function `chooseMove(self, player, history)` so each enemy can have its own personality.

### 10.1 Grubnik the Cutpurse — Lv 1 (tutorial enemy)

A scrappy goblin with a rusty knife, a patched hood and a too-big dented bucket on his head. Green skin, oversized ears, cowering hunch.

- **HP:** 120
- **Resistances:** none.

| Move | Effect |
|---|---|
| **Jab** | Deal 10 damage. |
| **Frenzied Flurry** | Deal 4 hits of 4 damage. Each hit is reduced by block separately, so big block still absorbs it all, but it punishes small block. |
| **Hide Behind Buckler** | Gain 12 block. |

**Intellect — "cowardly opportunist":**
- Never uses the same move three times in a row.
- If its HP is below 40% and it did not block last turn, it uses *Hide Behind Buckler*.
- If the player has **no block**, it prefers *Frenzied Flurry* (weighted 60%).
- Otherwise a weighted pick: Jab 50%, Flurry 30%, Buckler 20%.

### 10.2 Barrow Warden — Lv 3 (the "real" test)

An undead guardian of an old tomb, a hollow suit of corroded plate with a cold blue glow burning in its visor and a huge rusty greatsword planted point-down. Moss on the pauldrons.

- **HP:** 400
- **Cold-blooded:** immune to *Frozen* (Frost Arrow still deals its damage).
- **Brittle plate:** takes **+5** damage from heavy attacks.

| Move | Effect |
|---|---|
| **Rusted Cleave** | Deal 18 damage. |
| **Grave Chill** | Deal 12 damage and drain 40 mana. |
| **Bone Bulwark** | Gain 25 block. |
| **Crushing Overhead** | **Two-turn move.** This turn it *raises* the sword and does nothing else (the intent reads "Winding up: 45 damage next turn"). Next turn it deals 45 damage. A stun cancels the windup, so a Heavy Attack on a Staggered Warden is the answer. |

**Intellect — "patient and punishing":**
- Opens with *Bone Bulwark* on its first turn.
- Uses *Grave Chill* whenever the player's mana is above 250. Player mana is the player's biggest reserve and the Warden wants it spent or drained.
- Below 50% HP, *Crushing Overhead* becomes its preferred move, used every third turn.
- If the player has more than 15 block, it never starts a windup (to avoid wasting it) and uses *Rusted Cleave*.
- Otherwise: Cleave 60%, Chill 25%, Bulwark 15% (Bulwark is not repeated back to back).

### 10.3 Gloop, the Bog Slime: Lv 1

A quivering green heap with something old floating inside it. **HP 130.**

| Move | Effect |
|---|---|
| **Belly Slam** | 9 damage. |
| **Sticky Spit** | 6 damage and Slowed (thrown as a projectile). |
| **Ooze Together** | Heals 12 and gains 8 block. |

**Intellect:** pulls itself together below 50% HP (at most once every 3 turns). It spits less if you are already Slowed, and doesn't repeat a move three times.

### 10.4 Thornback Boar: Lv 2

A bristling boar with brambles grown into its back. **HP 210.**

| Move | Effect |
|---|---|
| **Tusk Rip** | 13 damage (heavy). |
| **Gore** | 9 damage and Bleed. |
| **Paw the Earth** | Gains 12 block and becomes Enraged. |

**Intellect:** after pawing it always charges, with Gore if you aren't bleeding and Tusk Rip if you are. It prefers Gore when you aren't bleeding.

### 10.5 Mother Nettle, the Hedge Witch: Lv 2

Pointed hat, nettle-green staff, no patience for visitors. **HP 180.**

| Move | Effect |
|---|---|
| **Thorn Bolt** | 15 damage (projectile). |
| **Hex of Frailty** | Weakened for 2 turns. |
| **Bramble Ward** | Gains 10 block and Thorns. |
| **Nettle Brew** | Heals 18. |

**Intellect:** opens with the Hex and re-hexes when it wears off. She brews below 45% HP (at most once every 3 turns) and never wards twice in a row.

### 10.6 Old Ironbark: Lv 3

An ancient oak with amber eyes and a moss beard. **HP 450.** Trait **Dry bark**: takes 50% more damage from Fireball and Burn.

| Move | Effect |
|---|---|
| **Branch Sweep** | 2 hits of 11 (heavy). |
| **Root Grasp** | 14 damage and Slowed. |
| **Bark Skin** | Gains 20 block and Thorns. |
| **Sap Mend** | Heals 30. |

**Intellect:** mends below 50% HP (at most once every 3 turns). Otherwise it favours Branch Sweep, grasps less if you are already Slowed, and never uses Bark Skin twice in a row.

**Enemy pools by level:** Lv 1 Grubnik, Gloop · Lv 2 Thornback Boar, Mother Nettle · Lv 3 Barrow Warden, Old Ironbark. `spawn <enemy>` in the CLI starts a practice fight against any of them.

## 11. Combat log and CLI

The log panel is a scrolling text feed of everything that happens (damage numbers, block, statuses applied and expired, intent changes). It has an **input line** at the bottom that accepts commands.

Initial command set (extensible; each command is a small entry in a table in `cli.js`):

| Command | Behaviour |
|---|---|
| `help` | List commands. |
| `restart` | Restart the current fight from its first turn (your state from when it began). |
| `spawn <enemy>` | Practice fight against any enemy (`grubnik`, `gloop`, `boar`, `witch`, `warden`, `treant`). |
| `goto <row> <col>` | Teleport to a map node and enter it (`goto 2 3`, `goto 4 1` for the treasure). |
| `map` / `nodes` / `newrun` | Return to the map / list nodes and their enemies / abandon the run. |
| `set <hp\|mana\|stamina\|block> <n>` | Set a player value. |
| `enemy set <hp\|block> <n>` | Set an enemy value. |
| `heal <n>` / `damage <n>` | Heal or damage the player. |
| `status <add\|remove> <player\|enemy> <id> [n]` | Apply or remove a status. |
| `give <item> [n]` | Add consumables or gear to the backpack. |
| `equip <item> [slot]` / `unequip <slot>` | Equip gear (conjured if not in the backpack) / move gear to the backpack. |
| `pin <item>` | Pin or unpin a consumable on the action bar. |
| `intent <moveId>` | Force the enemy's next move. |
| `god` | Toggle invulnerable player. |
| `sound [on\|off\|0-100\|name]` | Toggle sound, set volume, or play a sound. |
| `theme <oak\|birch\|castle\|night>` / `logmode <docked\|blend\|hidden>` | Change the background or the log mode. |
| `clear` | Clear the log. |
| `state` | Dump the current state as JSON. |

## 12. Build plan

1. **Static layout and theme:** panels, wood/stone/iron CSS, placeholder SVG sprites, bars, buttons. No logic.
2. **State, render and icons:** data model, `render(state)`, bars update from data, reusable square icon and tooltip component.
3. **Engine:** damage pipeline, block, statuses, turn loop, win/lose, restart.
4. **Actions:** all six player actions, costs, disabled states, tooltips.
5. **Enemies:** Grubnik and Warden with intent display, AI and moves window.
6. **Items and equipment:** consumable icons in the actions panel, equipment menu with the demo loadout.
7. **Combat log and CLI.**
8. **Polish:** bar transitions, floating damage numbers, hit flashes, keyboard shortcuts.

## 13. Out of scope for now

Procedurally generated maps, shops, gold, card/relic-style progression, levelling up, mobile layout.

## 14. Assumptions accepted so far

1. Several actions per turn plus an End Turn button (section 6.2).
2. Lightning Shield costs 10 mana **per turn** as upkeep, rather than once (section 7).
3. Heavy Attack only stuns when the target is *already* Staggered (section 7).
4. A fourth Burn stack replaces the oldest one (section 8).
5. Placeholder consumables (section 9.1) and the demo equipment stats: sword +1 attack damage, shield +1 block, helm none (section 9.2).
6. `index.html` opens straight from disk, using classic scripts rather than ES modules (section 2).

## 15. The run and the map

### 15.1 The map

The game starts on the **map view** with the knight on node 0. The map is drawn bottom to top, like *Slay the Spire*. Nodes are labelled **row·column**; row 0 is the start and the star is the goal.

```
row 4            ★
row 3    rest   fight   fight
row 2    rest   chest   fight
row 1    fight  fight   chest
row 0            0
```

- Node 0 leads to every node in row 1, and every row 3 node leads to the star.
- Every node leads to the node straight ahead (same column).
- Extra paths: **1·1 → 2·2**, **2·3 → 3·2**, **2·2 → 3·3**.
- Reachable nodes glow, the paths you can take are animated, the road you walked is inked red, and visited nodes get a check mark. Hovering a node shows its type and, for fights, the enemy level.
- Clicking a reachable node walks the knight token there, then opens the node.

**Node types** (map icons): **Fight** (monster head), **Chest** (chest), **Rest site** (campfire), **Treasure** (star).

**Enemies** are assigned when a run starts: each fight gets a random enemy from the pool whose level matches its row, without repeats within a row.

### 15.2 What carries over

- HP, mana, gear, backpack, consumables and pinned items persist across the run.
- At the start of every fight stamina is full. Block and status effects reset, and Lightning Shield starts off.
- Mana does **not** regenerate between fights. Only resting, Mana Tonics and the in-fight +10/turn restore it.
- Equipment and pins can be changed anywhere off the battle screen, or on your own turn in a fight.

### 15.3 Fights

- **Win:** the enemy drops **one random potion** (Healing Draught, Mana Tonic or Stamina Tincture), shown on the victory banner. "Continue to the map" returns to the map.
- **Lose:** the defeat banner leads to the **Run over** summary (fights won, chests, rests, gear found), then a new run.

### 15.4 Chest

The scene shows a closed chest. Clicking it opens it (creak and coin sounds, golden glow) and reveals **one random wearable** from the loot pool, preferring items you don't own yet. It goes into the backpack, and an **Equip now** button equips it on the spot. You can also leave without opening it.

### 15.5 Rest site

The scene shows the knight sitting on a log by a campfire, next to a tent. Choose **one** of:

| Option | Effect |
|---|---|
| **Rest** | Restore 30% of max HP and 30% of max mana (75 HP / 120 mana at base stats). |
| **Scavenge for supplies** | 2–3 random consumables. |
| **Scavenge for loot** | One random wearable (same rules as a chest). |

### 15.6 Victory

The star leads to the victory screen: the knight hugging a princess in front of a pile of gold, with a fanfare, the run summary and a "Start a new run" button.

### 15.7 Loot pool

Small bonuses using the existing stat types plus **Max HP** (raising max HP does not heal; removing the gear clamps HP).

| Item | Slot | Bonus |
|---|---|---|
| Hedge-Mage's Hood | Head | +1 spell damage, +5 max HP |
| Iron Barbute | Head | +15 max HP |
| Padded Gambeson | Chest | +20 max HP |
| Steel Cuirass | Chest | +30 max HP, +1 block from Defend |
| Leather Greaves | Legs | +15 max HP |
| Plated Greaves | Legs | +25 max HP |
| Iron Gauntlets | Gloves | +2 Attack damage |
| Duelist's Gloves | Gloves | +1 Attack, +1 Heavy Attack damage |
| Bastard Sword | Main hand | +2 Attack, +3 Heavy Attack damage |
| Kite Shield | Off hand | +3 block from Defend |
| Bronze Ring | Ring | +2 spell damage |
| Ring of Embers | Ring | +3 spell damage |
| Ring of Vigor | Ring | +15 max HP |

### 15.8 Saving

The run is saved to the browser (localStorage) whenever it changes outside a fight. Reloading the page resumes the run. A reload during a fight restarts that fight from the state you entered it with. **New run** in the top bar (click twice to confirm) or the `newrun` command starts over.

### 15.9 Screens

- **Top bar** (map, chest and rest screens): backpack button, name, HP and mana bars, depth, New run.
- **Combat log and CLI** stay at the bottom on every screen.
- Switching screens fades the new one in.
