# Haunted House

A first-person browser horror and puzzle game set in Blackthorn Estate. Explore the basement, floors 1–3, and attic; follow clues, collect keys, solve puzzles, avoid the Keeper, and find a way out. The game has **one fixed mode** with no difficulty setting.

## Run the game

From the project folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Move |
| Mouse | Look |
| Shift | Sprint while stamina lasts |
| C | Crouch |
| F | Toggle flashlight |
| E / left click | Inspect, open, or pick up the targeted object |
| J | Open the journal |
| Esc | Pause |

## Start and progression

Begin in the foyer. The library is ahead, the portrait hall is to the right, and the main staircase is through the west arch. One continuous main stair connects floors 1–3. The basement service door is at the south end of the floor 1 west hall; the attic stair door is off the floor 3 hall. Each leads to its own enclosed flight away from the main stairwell.

Read the diary and use the clock inspection screen to set the grandfather clock to **3:13**. The clock opens its felt-lined drawer; look into it and take the key. The family register gives the portrait order. The nursery music box and observatory rings reveal further seals and keys. The journal keeps documents you have found.

The estate office contains the iron service key for the basement entrance. In the workshop, find the fuse to power the drainage tunnel. The attic entrance needs the ward; the family relic in the hidden archive chapel unlocks the ritual route. Press or interact with loose books to reveal rotating bookcases and hidden passages.

The three escape routes are:

1. **Front door:** find its key and release all three family seals.
2. **Basement tunnel:** unlock the service stair, find the fuse, and restore power.
3. **Attic ritual:** find the ward and relic, then complete the ritual.

## House and stair design

The central stair is a single route from floor 1 through floor 3. Floor 1 has a solid floor beneath it, with the underside boxed in; only floors 2 and 3 have stairwell openings and guards. Behind the floor 1 service door, a vestibule turns into a narrow stair descending toward a basement passage. The floor 3 attic door opens to a separate timber stair that rises to the attic hall. Both secondary flights have solid risers, sloped ceilings, lighting, and distinct finishes. See [visual direction](docs/VISUAL_DIRECTION.md) for the intended appearance and historical references.

The Keeper wakes after major discoveries and patrols the house. It pursues when it sees the player; crouching and darkness reduce detection. A first capture returns the player to the foyer and costs time. A second capture or reaching dawn ends the run. The night lasts 60 minutes of active play. Journal and inspection screens pause the timer.

## Current scope

This is a solo browser prototype with an initial furnishing and lighting pass. The Keeper is a billboard apparition using waypoint movement. The game has five connected levels, locked rooms and objects, hidden bookcases, a journal, and three escape routes. Multiplayer, a finished exterior, richer Keeper animation, and the complete reference-level art pass remain future work. Ghost photography is not part of the game.

The active game code is in `rebuild3d/src/`: `main.js` connects the player and game loop, `clock.js` builds the clock mechanism, and `mansion.js` builds the floors, doors, stairs, discoveries, and alternate exits.

## Project docs

- [Playable prototype plan](docs/FIRST_PLAYABLE_PLAN.md)
- [Full mansion plan](docs/FULL_MANSION_PLAN.md)
- [Visual direction and supplied references](docs/VISUAL_DIRECTION.md)
- [Project notes](docs/PROJECT_IMPORT.md)
- [Current game design](docs/Game%20Concept%20Development.md)

Existing PBR materials and prop models are from [Poly Haven](https://polyhaven.com/) under CC0; `rebuild3d/scripts/fetch_assets.py` lists them. The apparition and Blackthorn family portrait are generated artwork. The clock dial is drawn in code and used by its 3D face and inspection view.
