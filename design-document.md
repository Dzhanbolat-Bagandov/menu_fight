# Menu Fight — Design Document

Status: **v0 prototype scope.** This document records decisions made so far. Anything marked **(assumption)** was not stated explicitly and should be confirmed or changed.

## 1. Vision

A turn-based, purely UI-driven strategy prototype. No moving characters and no real-time action: buttons, gauges, menus, panels and a combat log. Heavily inspired by *Slay the Spire*. The long-term shape is a run of multiple fights, out-of-combat events and a map. **The prototype is a single fight.**

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
│   ├── ui.js        # render(state), tooltips, modals, input wiring
│   ├── cli.js       # combat-log command line + debug commands
│   ├── audio.js     # procedural sound effects (Web Audio API, no audio files)
│   ├── fx.js        # visual effects + mapping engine events to sounds
│   ├── sprites.js   # inline SVG placeholder sprites
│   └── icons.js     # inline SVG square icons for moves, items, equipment, statuses
└── assets/          # reserved for real art later
```

## 3. Screen layout

The window is split horizontally into two panels over a shared combat log.

```
┌───────────────────────────┬───────────────────────────┐
│ PLAYER                    │ OPPONENT                  │
│ [ sprite ]                │ [ sprite ]                │
│ Name · Lv                 │ Name · Lv                 │
│ 🛡12 HP ████████░░ 180/250│ 🛡 HP ██████░░░░ 240/400  │
│ Mana    █████░░░░░        │ Status icons              │
│ Stamina ███████░░░        │ INTENT: icon + move + dmg │
│ Status icons              │ [ Enemy moves ⓘ ]         │
│ [Attack][Heavy][Defend]   │                           │
│ [Fireball][Frost][Shield] │                           │
│ [Potion][Tonic] (items)   │                           │
│ [Equipment][End Turn]     │                           │
├───────────────────────────┴───────────────────────────┤
│ Combat log                                            │
│ > _  (command line)                                   │
└───────────────────────────────────────────────────────┘
```

- **Block** is shown as a shield icon placed in front of the health bar, with the block number on top of it. It is hidden at 0.
- **Buttons** are disabled (with the reason in the tooltip) when the player cannot afford them or it is not their turn.
- **Status effects** appear as small icons under the bars with stack count and remaining turns.
- **Enemy moves button** opens a small window on hover or click listing every move the enemy can use and its description (using the same square icons and tooltips).
- **Equipment button** opens the equipment menu (section 9).
- **Usable items** (consumables) sit in the actions panel next to the base actions, as icons (section 9).

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

- **Background:** dark wooden boards (CSS vertical plank gradients with subtle grain and board seams).
- **Panels:** carved stone slabs or leather-bound frames set into the wood, with inner shadows.
- **Trim and UI hardware:** sparse iron (buttons, rivets, frames) and bronze (accents, highlights, active states).
- **Bars:** recessed troughs of dark iron. HP red, mana blue, stamina amber/green, block steel-grey. Subtle gloss and animated width transitions.
- **Type:** serif or blackletter-adjacent system font stack with a warm off-white parchment text colour. Web fonts can be added later.
- **Lighting:** warm, candle-like vignette over the whole screen.
- All colours, spacing and textures are CSS custom properties (design tokens) in `:root` so the look is tweakable in one place.
- Textures are generated in CSS or inline SVG; no external image dependency for v0.

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

Simple hand-drawn **inline SVG placeholders**, one function per character in `sprites.js`. Replacing one with real art later means swapping it for an `<img>`.

- **Player:** a generic knight in plate armour with a helmet with an open visor (face visible), sword and kite shield, standing in a three-quarter pose facing right.
- **Enemies:** see section 9.

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

Statuses are defined as data in `data.js` (name, icon, description, stacking rule, hooks) so new ones can be added without touching the engine.

## 9. Items and equipment

### 9.1 Consumables

Usable items are shown as **icons in the actions panel**, alongside the base actions, with a count badge. Using one is an action (it costs no resource, and may be used several times per turn). An item with a count of 0 is disabled. v0 ships a few placeholder consumables **(assumption)**:

| Item | Effect | Count |
|---|---|---|
| Healing Draught | Restore 60 HP | 2 |
| Mana Tonic | Restore 100 mana | 1 |
| Stamina Tincture | Restore 50 stamina | 1 |

### 9.2 Equipment menu

A button in the actions panel opens the **equipment menu**: a modal laid out as a paper-doll with one square slot per piece. It shows wearable items only, not consumables.

Slots: **head, chest, legs, gloves, main hand (weapon), off hand (weapon or shield), ring 1, ring 2**.

- Each slot shows the equipped item's icon, or an empty frame. Hovering a slot shows the tooltip from section 3.1.
- Below the doll, a summary lists the total stat bonuses from all equipped items.
- v0 is **display-only** **(assumption)**: the menu shows what is equipped, but swapping items is not implemented. The data model already supports it (`equipment[slot] = itemId`), so adding an item list and equip/unequip later is an extension, not a rewrite. The CLI can change equipment for testing.

**Demo loadout** (small, basic stats; other slots empty) **(assumption on the exact stats)**:

| Slot | Item | Stats |
|---|---|---|
| Head | Plain Helm | none |
| Main hand | Iron Sword | +1 damage on Attack and Heavy Attack |
| Off hand | Wooden Shield | +1 block from Defend |
| Chest, legs, gloves, ring 1, ring 2 | empty | — |

Stats are flat modifiers defined as data on the item (e.g. `{ lightDamage: 1, heavyDamage: 1 }`). The engine sums all equipped items when it calculates damage and block, at step 2 of the damage pipeline, where they add to the *Staggered* bonus.

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

The v0 fight uses **Grubnik** by default. `spawn warden` in the CLI switches to the Warden (see below).

## 11. Combat log and CLI

The log panel is a scrolling text feed of everything that happens (damage numbers, block, statuses applied and expired, intent changes). It has an **input line** at the bottom that accepts commands.

Initial command set (extensible; each command is a small entry in a table in `cli.js`):

| Command | Behaviour |
|---|---|
| `help` | List commands. |
| `restart` | Restart the fight with the current enemy. |
| `spawn <enemy>` | Start a new fight against an enemy id (`grubnik`, `warden`). |
| `set <hp\|mana\|stamina\|block> <n>` | Set a player value. |
| `enemy set <hp\|block> <n>` | Set an enemy value. |
| `heal <n>` / `damage <n>` | Heal or damage the player. |
| `status <add\|remove> <player\|enemy> <id> [n]` | Apply or remove a status. |
| `give <item> [n]` | Add consumables to the inventory. |
| `equip <slot> <item>` / `unequip <slot>` | Change equipment. |
| `intent <moveId>` | Force the enemy's next move. |
| `god` | Toggle invulnerable player. |
| `sound [on\|off\|0-100\|name]` | Toggle sound, set volume, or play a sound. |
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

## 13. Out of scope for v0

Map, multiple fights, out-of-combat events, rewards, deck/relic-style progression, saving, sound, mobile layout.

## 14. Open questions / assumptions to confirm

1. Several actions per turn plus an End Turn button (section 6.2).
2. Lightning Shield costs 10 mana **per turn** as upkeep, rather than once (section 7).
3. Heavy Attack only stuns when the target is *already* Staggered (section 7).
4. A fourth Burn stack replaces the oldest one (section 8).
5. Placeholder consumables (section 9.1) and the demo equipment stats: sword +1 attack damage, shield +1 block, helm none (section 9.2).
6. The equipment menu is display-only in v0 (section 9.2).
7. `index.html` opens straight from disk, using classic scripts rather than ES modules (section 2).
