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

Each combatant has three bars:

- **HP** — lose this, you die
- **Stamina** — every action costs stamina, regenerates each turn
- **Posture** — builds as hits land; at 100, the combatant is staggered and takes massive bonus damage

**Enemy Intent** — each turn the enemy telegraphs their next move so you can strategize. Some moves hide this.

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

🚧 **Work in progress** — actively building.

- ✅ Title screen
- ✅ Character select
- ✅ Map screen with floor progression
- ⏳ Combat screen
- ⏳ Win/lose summary
- ⏳ Character carousel + victory transitions
- ⏳ Custom node icons

---

## License & Credits

This project is an original work in progress and is not open for public use, redistribution, or contribution at this time.

**Original character and world art** generated using AI tools (ChatGPT/DALL-E) and are exclusive to this project.

**World concept, characters, lore, and game design** — The Between, Kaen, Sable, The Remnant, The Unfinished, and The Cartographer — are original creations by Yogita M.

© 2026 Yogita M. All rights reserved.

---

## About

Built by [Yogita M.](https://www.linkedin.com/in/yogita-m/) — Frontend developer documenting the build on [Medium](https://medium.com/@yogita27496) and [LinkedIn](https://www.linkedin.com/in/yogita-m/).

_No game engine. Just state management taken seriously._
