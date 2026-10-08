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
│   └── sprites.js   # inline SVG placeholder sprites
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
│ [Inventory][End Turn]     │                           │
├───────────────────────────┴───────────────────────────┤
│ Combat log                                            │
│ > _  (command line)                                   │
└───────────────────────────────────────────────────────┘
```

- **Block** is shown as a shield icon placed in front of the health bar, with the block number on top of it. It is hidden at 0.
- **Buttons** show cost, are disabled (with a reason in the tooltip) when the player cannot afford them or it is not their turn, and show a tooltip with the full description.
- **Status effects** appear as small icons under the bars with stack count and remaining turns.
- **Enemy moves button** opens a small window on hover or click listing every move the enemy can use and its description.
- **Inventory button** opens a modal listing items; using an item is an action.

## 4. Visual style — cozy medieval

- **Background:** dark wooden boards (CSS vertical plank gradients with subtle grain and board seams).
- **Panels:** carved stone slabs or leather-bound frames set into the wood, with inner shadows.
- **Trim and UI hardware:** sparse iron (buttons, rivets, frames) and bronze (accents, highlights, active states).
- **Bars:** recessed troughs of dark iron. HP red, mana blue, stamina amber/green, block steel-grey. Subtle gloss and animated width transitions.
- **Type:** serif or blackletter-adjacent system font stack with a warm off-white parchment text colour. Web fonts can be added later.
- **Lighting:** warm, candle-like vignette over the whole screen.
- All colours, spacing and textures are CSS custom properties (design tokens) in `:root` so the look is tweakable in one place.
- Textures are generated in CSS or inline SVG; no external image dependency for v0.

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
5. Damage-over-time effects (burn) and lightning shield **ignore block** and hit HP directly **(assumption)**.

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
| **Inventory** | — | Opens items; using an item is an action. |

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

## 9. Inventory (placeholder items for v0, assumption)

The three in-battle healing and recovery sources are skills, items and out-of-combat rest, so v0 ships a few simple consumables so the inventory button has something to show:

| Item | Effect | Count |
|---|---|---|
| Healing Draught | Restore 60 HP | 2 |
| Mana Tonic | Restore 100 mana | 1 |
| Stamina Tincture | Restore 50 stamina | 1 |

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
| `give <item> [n]` | Add items to the inventory. |
| `intent <moveId>` | Force the enemy's next move. |
| `god` | Toggle invulnerable player. |
| `clear` | Clear the log. |
| `state` | Dump the current state as JSON. |

## 12. Build plan

1. **Static layout and theme:** panels, wood/stone/iron CSS, placeholder SVG sprites, bars, buttons. No logic.
2. **State and render:** data model, `render(state)`, bars update from data.
3. **Engine:** damage pipeline, block, statuses, turn loop, win/lose, restart.
4. **Actions:** all six player actions, costs, disabled states, tooltips.
5. **Enemies:** Grubnik and Warden with intent display, AI and moves window.
6. **Inventory:** modal and the three placeholder items.
7. **Combat log and CLI.**
8. **Polish:** bar transitions, floating damage numbers, hit flashes, keyboard shortcuts.

## 13. Out of scope for v0

Map, multiple fights, out-of-combat events, rewards, deck/relic-style progression, saving, sound, mobile layout.

## 14. Open questions / assumptions to confirm

1. Several actions per turn plus an End Turn button (section 6.2).
2. Lightning Shield costs 10 mana **per turn** as upkeep, rather than once (section 7).
3. DoT and lightning shield ignore block (section 6.3).
4. Heavy Attack only stuns when the target is *already* Staggered (section 7).
5. A fourth Burn stack replaces the oldest one (section 8).
6. Placeholder inventory contents (section 9).
7. `index.html` opens straight from disk, using classic scripts rather than ES modules (section 2).
