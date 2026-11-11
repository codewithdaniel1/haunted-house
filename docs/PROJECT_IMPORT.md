# Project notes

This project contains the playable browser game in `rebuild3d/` and its current design and visual references.

## Current project

The game is **Haunted House**, set in Blackthorn Estate. It is a first-person browser horror and puzzle prototype with one fixed mode and five connected levels: basement, floors 1–3, and attic. The player investigates clues, collects keys, solves room puzzles, opens hidden spaces, avoids the Keeper, and can pursue the front door, basement tunnel, or attic ritual ending.

The current prototype includes the grandfather-clock puzzle and physical drawer/key pickup, three front-door seals, nursery and archive puzzles, locked doors and boxes, rotating hidden bookcases, the Keeper's waypoint pursuit, capture/loss/restart, and a run journal. Floors 1–3 share one main stair. The basement service door is at the south end of the floor 1 west hall; the attic door is off the floor 3 hall. Each leads to a separate enclosed flight with its own materials and lighting. This is a prototype furnishing and lighting pass; the Keeper is a billboard apparition and online co-op is not implemented.

## Current decisions

- **Platform:** browser, desktop controls.
- **Mode:** one tuned experience; no Easy/Normal/Hard choice, Hard Mode control, or difficulty slider.
- **Tools:** flashlight, journal, and puzzle/story items. No camera or ghost-photography mechanic.
- **Setting:** a familiar, lived-in Victorian-era haunted house, with five levels, locked rooms, and clue-driven hidden spaces.
- **Scope:** build and polish the solo experience first. Co-op and teammate rescue remain possible later goals, not current playable features.

## Source documents

- [README](../README.md): how to run the game, controls, and implemented progression.
- [Playable prototype plan](FIRST_PLAYABLE_PLAN.md): current game loop, systems, stairs, and next polish priorities.
- [Full mansion plan](FULL_MANSION_PLAN.md): room map, progression, fixed mode, and escape routes.
- [Visual direction](VISUAL_DIRECTION.md): supplied images and their translation into the environment.
- [Game Concept Development](Game%20Concept%20Development.md): current game design, progression, tools, threat, and escape routes.
