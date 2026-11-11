# Haunted House — current game design

This is the current design for the browser game. It replaces the earlier concept drafts. See the [README](../README.md) for how to run the game and its current controls.

## Game overview

**Haunted House** is a first-person horror and puzzle game set in Blackthorn Estate, a decaying Victorian-era mansion. Explore five levels, investigate family clues, find keys, open locked and hidden rooms, avoid the Keeper, and choose a way to escape.

| | Current direction |
| --- | --- |
| Platform | Desktop browser |
| Perspective | First-person 3D |
| Mode | One fixed experience; no difficulty setting |
| House | Basement, floors 1–3, and attic |
| Main tools | Flashlight, journal, keys, and puzzle objects |
| Escape routes | Front door, basement tunnel, attic ritual |

The camera is only the player's viewpoint. There is no ghost-camera or photography mechanic.

## Story

In 1926, the Blackthorn family vanished during an event remembered as the Thirteenth Hour. Edmund Blackthorn had been trying to escape death through an occult experiment. Instead, the family and the mansion became bound to the Keeper, a presence that now hunts anyone who enters.

The player wakes in the foyer at midnight. The front door is sealed, the house is quiet, and a diary points toward the grandfather clock. Clues left in the rooms reveal what happened to the family and how the player can get out. The story is told through journals, objects, portraits, rooms, and changes in the house.

## Player loop

1. Explore the rooms and inspect objects with the flashlight.
2. Read notes and keep discovered evidence in the journal.
3. Connect clues to solve mechanisms and find keys.
4. Unlock rooms and stairs, and investigate hidden spaces.
5. Avoid the Keeper and manage the time left before dawn.
6. Commit to an escape route and complete its final action.

## The mansion

| Level | Current role |
| --- | --- |
| Basement | Boiler room, workshop, generator, and drainage tunnel route |
| Floor 1 | Foyer, library, portrait hall, dining room, and estate-office clues |
| Floor 2 | Bedrooms and nursery; music-box clues and family evidence |
| Floor 3 | Observatory, archive, and the clues to the attic ward |
| Attic | Trunks, family relic, and the ritual route |

One central staircase connects floors 1–3 and acts as the main landmark. The locked basement service door sits at the south end of the floor 1 west hall, with a vestibule and a separate plastered stair leading down. The locked, ward-marked attic door is off the floor 3 hall and opens to a separate timber stair. Hidden spaces use physical clues such as loose books and mismatched walls, so the player can understand why a passage is there.

The long-term mansion target is about 30 purposeful rooms, with roughly 10 locked rooms and 6 hidden spaces. The current prototype has a smaller connected set. Add rooms when they contribute a clue, puzzle, hiding spot, shortcut, threat, or story beat.

## Puzzles and progression

- **Grandfather clock:** Edmund's diary points to 3:13. Set the clock, open its drawer, and take the key.
- **Family portraits:** Use dates and the family register to order the portraits and release a front-door seal.
- **Nursery music box:** Follow Clara's written sequence to reveal a family seal and more evidence.
- **Observatory rings:** Use the celestial notes to set the mechanism and open the archive clue chain.
- **Locked rooms:** Keys and puzzle outcomes open specific rooms, boxes, and the basement and attic gates.
- **Hidden bookcases:** Loose books provide a discoverable physical interaction that opens concealed passages.

Puzzles should use evidence found in the house, remain solvable alone, and avoid permanent failure states. Required keys should persist after pickup and never reset unexpectedly. The journal should preserve found documents, not solve puzzles automatically.

## The Keeper, time, and tools

The Keeper patrols the estate, investigates activity, and pursues the player when it sees them. Sprinting helps create distance but uses stamina. Crouching, turning off the flashlight, and breaking line of sight help the player avoid detection. A first capture returns the player to the foyer and costs time; a second capture ends the run.

The night lasts 60 minutes of active play, from midnight toward dawn. The game has one fixed tuning for every run. There is no Easy, Normal, Hard, or Hard Mode option. Journal and inspection screens pause the timer.

The flashlight helps with navigation and close inspection. The journal stores discovered documents. Keys and puzzle objects are used at their matching doors and mechanisms. Photography is not a tool.

## Escape routes

1. **Front door:** use the clock key and release the three family seals through the portrait, nursery, and archive clues.
2. **Basement tunnel:** find the service key, enter the basement, restore generator power with the fuse, and open the drainage route.
3. **Attic ritual:** discover the attic ward, find the family relic in the hidden archive space, and complete the ritual.

Each route should stand on its own as a complete ending. The player should not need to solve every puzzle in the house to finish a run.

## Visual direction

Use the supplied screenshots as atmosphere and composition references: fog outside, warm practical lights, rich dark wood, aged plaster, brass details, family objects, and threatening depth in long halls. Rooms should feel lived in and physically grounded. Chairs should read as chairs, books should rest on shelves, notes should sit on surfaces, and doors and stairs should align with the walls around them.

Keep supernatural cyan light rare. The mansion itself should carry most of the mood through architecture, shadows, distance, subtle movement, and sound. See [Visual Direction](VISUAL_DIRECTION.md) for the saved reference images and staircase references.

## Current build and next priorities

The browser prototype already contains the five-level layout, the clock and key, three seals, nursery and archive puzzles, locked rooms and boxes, hidden bookcases, the Keeper's waypoint pursuit, a journal, and three escape routes. The main stair serves floors 1–3; the basement and attic are reached through separate locked doors and enclosed secondary stairs in other parts of the house.

Next, improve the first-person readability and grounding of furniture and clues, collision around solid objects and doorways, stair landing transitions, and Keeper pursuit cues. Then deepen room art, sound, and the remaining planned rooms. Online multiplayer is outside the current playable scope.
