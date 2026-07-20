# The Between ⚔

A turn-based dark fantasy RPG built entirely in React — no game engine, just state management taken seriously.

🔗 **Live:** [the-between-navy.vercel.app](https://the-between-navy.vercel.app)

> _A world between worlds. Neither alive nor dead. You do not know what you are. You know only that you are still here._

---

## What Is This?

The Between is an original dark fantasy world — a liminal space that collects things: people who were mid-thought when something ended, places half-built when someone stopped caring, creatures almost finished before whatever made them lost interest.

This is a React portfolio project documenting what happens when game design thinking meets frontend development.

---

## Characters

**Kaen — The Armoured**
Heavy combatant. Dark iron plate etched with amber runes. Greatsword. Has been here longer than memory. Does not know why. Knows only that he is still standing.

**Sable — The Unseen**
Precision assassin. Twin blades, crossbow, layered dark cloth with silver script. Speaks rarely. When she does, it sounds like she is reading from something written a long time ago.

---

## Enemies

**The Remnant** — What's left of someone who used to be a person. Attacks out of habit, not malice. Fighting one feels wrong in a way you can't name.

**The Unfinished** — Something being built when The Between swallowed it. Stone columns for legs, a single amber eye embedded in cracked stone that has never seen anything before. Floor II elite encounter.

**The Cartographer** — Someone who came to map The Between and stayed too long. The Between mapped them back. Gold ink lines shift across their skin like living terrain. Final boss.

---

## Game Structure

```
Title Screen → Character Select → Map → Combat → Win/Lose
```

- **3 floors, 5 encounters**
- Floor I — 2 Remnant encounters (tutorial, forgiving)
- Floor II — 1 Remnant + 1 Unfinished (elite)
- Floor III — The Cartographer (final boss)

---

## Combat Mechanics

Turn-based deckbuilder combat. Each fight is a duel of resources and reading intent.

**Three bars per combatant:**

- **HP** — lose this, the run ends
- **Stamina** — every card costs stamina to play. Partial regen each turn (up to 5 max), so what you spend now shapes next turn
- **Posture** — pressure meter. Builds as hits land. At 100, that combatant is staggered — the next attack against them lands with heavy bonus damage

**Cards** — you draw 4 per turn from your deck. Same hand never repeats twice in a row. Redraw once per turn for 2 stamina.

**Enemy Intent** — each turn the enemy telegraphs what they'll do next. Some intents hide their true damage. The Cartographer's whole second phase is hidden.

**Skip Turn** — when every card in hand is unplayable, a skip option appears. Passes your turn at a cost: posture damage and reduced stamina next turn. Character-specific penalties reinforce identity: Kaen's tank posture cracks under pressure, Sable's finesse rhythm breaks.

**Character-specific mechanics:**

- **Kaen's Resolve** — Sekiro-style. Damage scales with his own posture. The more pressure he's under, the harder he hits — but high posture means one hit from being staggered himself.
- **Sable's Chains** — Vanish → Slit Throat, Death Mark → Exploit, Ghost Step → discounted next attack. Her whole kit rewards setup-into-payoff play.

---

## Tech Stack

|            |                                                   |
| ---------- | ------------------------------------------------- |
| Framework  | React 19 (Vite)                                   |
| State      | `useReducer` for game state, `useState` for UI    |
| Styling    | Plain CSS with Google Fonts (Cinzel, Crimson Pro) |
| Animation  | canvas-confetti, CSS keyframes                    |
| Deployment | Vercel                                            |

---

## Project Status

🚧 **Work in progress** — actively expanding.

**Shipped:**

- ✅ Title screen
- ✅ Character select with 2 playable characters (Kaen, Sable)
- ✅ Map screen with 3-floor progression
- ✅ Full combat system (HP, Stamina, Posture, cards, redraw, skip turn)
- ✅ 26 cards across both characters + 3 Sable reward cards
- ✅ Card synergies and chain mechanics
- ✅ 3 enemies: Remnant (standard), Unfinished (elite), Cartographer (boss with hidden phase 2)
- ✅ Reward system (new cards, upgrades, stat boosts)
- ✅ Victory / defeat screens with enemy-specific art and defeat lines
- ✅ Compendium with world lore, character bios, bestiary, card index, synergies, how-to-play
- ✅ Posture Pressure tutorial (one-time contextual hint)
- ✅ Run persistence via localStorage
- ✅ Turn-based combat pacing with damage floaters, HP shake, intent telegraphing

**In progress:**

- ⏳ Phase 2 game-feel polish (screen shake on stagger break, boss phase transitions)
- ⏳ Mid-combat save/resume
- ⏳ Additional floors and enemies (post-launch expansion)

---

## License & Credits

This project is an original work in progress and is not open for public use, redistribution, or contribution at this time.

**Original character and world art** generated using AI tools (ChatGPT/DALL-E) and are exclusive to this project.

**Music** Music by Douglas Gustafson from Pixabay — track content ID 521614 <https://pixabay.com/users/psychronic-13092015/>

**World concept, characters, lore, and game design** — The Between, Kaen, Sable, The Remnant, The Unfinished, and The Cartographer — are original creations by Yogita Builds.

© 2026 Yogita Builds. All rights reserved.

---

## About

Built by [Yogita Builds](https://www.linkedin.com/in/yogita-m/) — Frontend developer documenting the build on [Medium](https://medium.com/@yogita27496) and [LinkedIn](https://www.linkedin.com/in/yogita-m/).

_No game engine. Just state management taken seriously._
