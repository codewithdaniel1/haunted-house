# Haunted House — playable prototype plan

> **Status:** The original three-room milestone has been superseded. This document describes the current browser prototype and the next polish goals. For the larger design direction, see [the full mansion plan](FULL_MANSION_PLAN.md); for controls and implemented routes, see the [README](../README.md).

## Current experience

Haunted House is a solo, first-person 3D horror and puzzle game in a decaying Victorian-era estate. The player explores five levels: basement, floors 1–3, and attic. The foyer anchors navigation; one central stair connects floors 1–3. The basement and attic have locked entrances in separate halls and their own enclosed stair flights. Rooms and passages contain clues, keys, puzzle mechanisms, and alternate ways out.

The game has **one fixed mode**. There is no difficulty selector or Hard Mode toggle. The flashlight is an exploration and survival tool. Photography and a ghost-camera mechanic are not part of this game.

## Core loop

1. Search rooms and inspect objects, journals, and architectural details.
2. Record useful documents in the journal and connect clues across floors.
3. Solve mechanisms to reveal keys, release seals, open locked areas, and expose hidden passages.
4. Manage time and the Keeper's pursuit with movement, sprinting, crouching, darkness, and route choices.
5. Choose an available escape route and reach its final interaction before dawn.

## Implemented prototype systems

- **Clock and front door:** Read the diary, set the grandfather clock to 3:13, and take the key from its drawer. The front door has three family seals, with portrait, nursery, and archive clues across the estate.
- **Locked progression:** Keys and puzzle states open rooms, storage boxes, and the basement and attic gates. Found items persist in the current run and are not meant to reset after pickup.
- **Hidden spaces:** Loose books reveal rotating bookcases and concealed spaces on the floors.
- **Basement route:** Find the service key, reach the basement workshop, restore generator power with the fuse, and open the drainage escape.
- **Attic route:** Find the ward and relic, open the attic gate, and complete the ritual route.
- **Threat and time:** The Keeper patrols and pursues. The first capture returns the player to the foyer; a second capture or dawn ends the run. Active play advances a fixed 60-minute night. Journal and inspection screens pause it.
- **Interaction:** Inspect and open doors, puzzle objects, notes, and boxes; use the journal to revisit discovered documents.

The current version is a prototype, not a finished art or gameplay pass. Room furniture and lighting are initial implementations, the Keeper is a billboard apparition using waypoint movement, and online co-op is not implemented.

## Stair and landing design

The central stair runs directly from floor 1 to floor 3. At the south end of the floor 1 west hall, a locked service door opens into a vestibule and a separate stair descending east to a basement passage. On floor 3, a ward-marked door in the east hall wall leads to another enclosed stair rising north to the attic hall. Both have solid risers and sloped ceilings. The basement uses worn plaster and utility lights; the attic uses exposed timber, a runner, and an older boarded door. Their locations and finishes make them read as distinct routes through the house.

This direction follows historic-house examples of enclosed secondary stairs and separate attic access, including [Historic England's description of a panelled door enclosing a stair](https://historicengland.org.uk/listing/heritage-gateway/results/record/c30a9cd9-4500-41f0-acda-2ed4a4d72a681/MNA127358) and the [National Park Service's Lockwood House attic stair reference](https://www.nps.gov/media/photo/gallery-item.htm?gid=2D8FA290-EFD3-4049-8006-100347D105E1&id=5ce1183d-12b7-46c8-8481-8a99ac4e92e4&pg=7406854).

## Next gameplay and art priorities

1. Review the separate basement and attic flights in first person and tune their width, headroom, landing transitions, lighting, and door swing against the playable character.
2. Refine room-scale props and their placement so chairs, shelves, tables, clocks, keys, and journals read clearly and sit naturally on the floor or furniture.
3. Improve movement collision around doors, stairs, and large furniture so the player cannot pass through solid objects.
4. Strengthen the Keeper's readable pursuit cues, hiding, and capture flow.
5. Add surface detail, sound, and more distinct room lighting while keeping each required clue easy to find.

## Art priorities

1. **Architecture:** believable room proportions, a consistent central stair, enclosed basement and attic flights, service doors, paneling, trim, windows, and connected landings.
2. **Hero props:** grandfather clock and drawer, portraits, journals, keys, music box, observatory mechanism, doors, and hidden bookcases.
3. **Surfaces:** worn wood, plaster, wallpaper, stone, tile, rugs, fabric, iron, glass, and aged brass at a scale visible during first-person play.
4. **Lighting and atmosphere:** cold exterior moonlight, warm practical fixtures, flashlight falloff, restrained fog, and readable dark corners.
5. **Sound:** footsteps by surface, house creaks, clocks, distant movement, door mechanisms, and a clear Keeper pursuit cue.

The supplied screenshots define the target mood and composition. Build explorable geometry and props from them; do not use the screenshots as flat room backdrops. See [visual direction](VISUAL_DIRECTION.md).

## Long-term scope

The current playable build is solo. Cooperative play, teammate rescue, a complete exterior, more Keeper animation, replay variation, and the remaining rooms and puzzle branches are later goals. Expand them after the current five-level run is spatially clear and satisfying.
