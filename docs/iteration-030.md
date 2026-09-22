# Field test 030 — a layered combat level

The prototype refinery is now a sequence of overlapping combat spaces. The visual direction stays neutral steel and industrial silhouettes, with warm marked decking and explosive barrels providing readable destruction targets. The level's main interactions are taking height, breaking a floor to drop a fight into the room below, and using physics/explosions to disrupt mixed patrols.

## Route and pacing

1. **The Loading Yard:** a ground lane through crate stacks, a middle deck with breakable sections, and a roof route reached from either side. Seven placed enemies mix riflemen, a shield, a runner, a grenadier and a drone. Barrels sit beside cover and on raised decks.
2. **Stack Overflow:** retain the climb to uplink one, with a second flank and crossovers on multiple floors. Players can climb around a shield, shoot through a broken deck, or pull a bot into open space. The uplink/roof remains on reinforced footing.
3. **Packet Loss:** the existing cable ride leads into aerial threats and a staggered landing compound. A lower service route and recovery shelves provide another way forward after a missed jump.
4. **The Demolition Pit:** climb either edge of a broad bowl, cross the high decks, or break through the crates below. The second uplink has a reinforced anchor. Grenadiers and a turret provide reasons to change height and attack from another angle.
5. **Rate Limiter:** flanking perches add height to the boss approach while leaving its core and stable arena floor usable.

The level contains 36 placed enemies and 30 explosive barrels. Four field kits restore health, tokens, a minimum reset charge and Peter's reserve, and advance the checkpoint when encountered farther forward. Each kit is consumed once per mission and remains used on death.

## Destruction and encounters

- New marked decking (block kind 5) takes three damage and breaks. Reinforced steel and gate tiles remain indestructible. Existing character weapons, explosions, Peter's digging and Pidalf's shockwave interact with it through the usual terrain damage system.
- Each combat sector has a finite response: two three-bot groups in the yard, tower and demolition pit; one three-bot group at the crossing. Existing one-time alarm responses remain.
- Fighting/deaths in the current sector activate its response. Reinforcements wait while ten or more live bots are nearby. Groups are separated by eleven seconds; individual arrivals are staggered after a visible warning of at least 1.8 seconds.
- Arrival locations are checked against current terrain, including destruction during the warning. Falling reinforcements have a brief parachute entry and cannot attack immediately. No infinite spawn loop or extra progression lock.
- Drops, shutter doors, sector signs and field kits are rendered in the world. The roster preview stays isolated from these systems.

Geometry lives in `src/world.ts`; encounter placements, facades and supplies in `src/level.ts`; finite wave scheduling and its scenery in `src/encounters.ts`.

## Validation and limits

The production build, deterministic tests and browser regressions cover terrain destruction, spawn/ladder clearance, valid drop entrances, telegraph timing, finite wave exhaustion, enemy cap, single-use field kits and checkpoint persistence. The route checker simulates the World movement integrator with walk/jump/fall/ladder connections; both uplinks and the boss approach are reachable with crates removed and with all breakable terrain removed. It does not simulate combat skill or exact human input.

All four character mechanic fixtures and all twelve roster combat showcases pass. A short invulnerable combat smoke run checks actual AI, physics, effects and abilities on the new map; it is not a difficulty benchmark. Final balance still needs player feedback on pressure, traversal and recovery.
