# Haunted House — full mansion plan

> **Current build:** The browser prototype has five levels, a central stair connecting floors 1–3, clue-driven locks, hidden bookcases, the Keeper, and three escape routes. The basement and attic use separate locked entrances and enclosed flights in other areas of the house. See the [README](../README.md) for what is playable and [the prototype plan](FIRST_PLAYABLE_PLAN.md) for current polish priorities.

## The promise

Explore a believable, decaying Victorian-era house with five explorable levels: **basement, floors 1–3, and attic**. The foyer is the navigation anchor. The ordinary floors connect through the main stair. The basement and attic entrances are locked behind clues and keys. Other rooms and hidden spaces also reward investigation with keys, evidence, shortcuts, and escape leads.

The full game can grow toward roughly **30 purposeful rooms**, including about **10 locked rooms and 6 hidden spaces**. These are planning targets, not requirements to fill the house with empty rooms. Each room should have a clear purpose: evidence, a puzzle, a hiding place, a threat, a shortcut, or a memorable story moment.

## Level layout

| Level | Early or connected spaces | Locked spaces | Hidden spaces and discoveries |
| --- | --- | --- | --- |
| **Basement** | Boiler room, workshop, landings | Generator cage and tunnel gate | False wine rack and drainage escape passage |
| **Floor 1** | Foyer, library, portrait hall, dining room | Estate office and service rooms | Rotating library shelves; concealed service access |
| **Floor 2** | Upper hall, bedrooms, nursery | Master bedroom and physician's room | Wardrobe passage between the nursery and suite |
| **Floor 3** | Servants' rooms, observatory, upper hall | Family archive and bell room | Chapel behind a mismatched wall |
| **Attic** | Trunk room and roof storage | Ritual chamber and mirror room | False-backed wardrobe concealing family relics |

The current code represents these levels at floor heights `-1` through `3`: basement, floor 1, floor 2, floor 3, and attic. The current room set is smaller than the long-term layout above; new rooms should be added with a clue, interaction, and reason to revisit them.

## Staircase and entrance design

The central stair is one continuous route through floors 1–3. The basement access branches from the south end of the floor 1 west hall: a plain service door opens to a short vestibule and a narrow stair descending east toward the basement hall. The attic access branches from the floor 3 east hall wall: an older, ward-marked boarded door opens to a separate timber stair rising north to the attic hall. These flights have solid risers, sloped overhead space, wall lights, and clear landings. Their door frames, jambs, and headers belong to the surrounding halls.

These are secondary house stairs, so they should feel tighter and more utilitarian than the central stair while remaining comfortable to traverse. Historic references include a [panelled door enclosing a house stair](https://historicengland.org.uk/listing/heritage-gateway/results/record/c30a9cd9-4500-41f0-acda-2ed4a4d72a681/MNA127358) and a [separate attic stair at Lockwood House](https://www.nps.gov/media/photo/gallery-item.htm?gid=2D8FA290-EFD3-4049-8006-100347D105E1&id=5ce1183d-12b7-46c8-8481-8a99ac4e92e4&pg=7406854). These guide the architectural read; the in-game house remains an original design.

## Locks, clues, and progression

| Find this | Evidence begins | Opens or reveals |
| --- | --- | --- |
| **Brass clock key** | Diary and grandfather clock | Front-door lock |
| **Family sequence** | Register and portraits | First family seal and the estate office lead |
| **Bedroom key** | Early keepsake box | Master bedroom and archive clue chain |
| **Archive key** | Bedroom evidence | Family archive and celestial mechanism |
| **Iron service key** | Estate office evidence | Basement stair door |
| **Generator fuse** | Workshop and service plans | Basement tunnel power |
| **Attic ward** | Family archive and hidden chapel clues | Attic stair door |
| **Family relic** | Hidden archive spaces | Attic ritual ending |

The front-door route uses the brass key and three family seals revealed by the portrait, nursery, and archive puzzles. The basement tunnel and attic ritual are independent escape routes. Players should have more than one lead to follow and should not need to clear every room to finish a run.

No required item should be discardable or reset after collection. The journal records found documents and puzzle evidence. A wrong answer can raise the haunting or trigger a local response, but it must not permanently close a required route. Keep mandatory clues reachable and every required puzzle solvable in solo play.

## Hidden-room rules

Each hidden entrance needs at least two discoverable signs: a draft, a sound behind a wall, a plan that does not match the room, a loose book, or a piece of furniture that sits too deep. The revealing action should make physical sense: rotate a shelf, turn a fixture, open a panel, or repair a mechanism.

Secrets should reward observation with evidence, a useful tool, a shortcut, or an alternate escape lead. They should remain navigable after discovery. Avoid unexplained walls that only respond to random clicking.

## The house and the Keeper

Lighting, sounds, selected doors, and occasional supernatural events can react to progress. Keep the floor plan readable: the foyer, main stair, and required puzzle rooms remain dependable landmarks. A change can reveal a secret or make a route feel unsafe, but cannot remove required evidence or trap the player without a way out.

The Keeper uses readable rules. It can investigate noise, pursue when it sees the player, and lose track after the player breaks line of sight. Darkness and crouching reduce detection. Make threat cues clear enough that a capture feels connected to the player's choices.

## One fixed mode

There is **one tuned experience**. Do not add an Easy/Normal/Hard selection, Hard Mode toggle, difficulty slider, or host-selected difficulty. Clock timing, haunting, puzzle clues, Keeper behavior, and failure rules use the same baseline every run. Player choices and noise can still change the danger of a particular night.

The target night runs from midnight to 6:00 AM over roughly 60 minutes of active play, followed by a short final escape window. Tune that single experience through play, rather than creating a second mode.

## Escape routes

1. **Front door:** Find the brass key and release the three family seals across floors 1–3.
2. **Basement tunnel:** Unlock the service stair, restore generator power, and open the concealed drainage route.
3. **Break the curse:** Discover the family history, open the attic, and complete the ritual with the relic.

The mirror and bargain endings from the imported concept can be considered after these routes work well. They should grow from the existing house and clues rather than add a separate maze.

## Build and polish order

1. Refine the current five-level route, especially stair/landing transitions, collision around doors and furniture, and item persistence.
2. Improve the Keeper's signals, chase, hiding, and capture flow.
3. Replace weak placeholder props with readable, correctly grounded furniture and story objects; improve room-specific lighting and sound.
4. Add the remaining planned rooms and clue chains without weakening the existing escape routes.
5. Consider online co-op and replay variation after the solo house plays clearly from beginning to ending.
