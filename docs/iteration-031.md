# Iteration 031 — Marcus, the Augmentor

The user approved the proposed retro trick-shot adventurer after the research pass. Implemented as the fifth playable character; the sixth roster slot remains classified.

## Presentation and controls

Visual thesis: cyan-lit arcade hardware, cream shirt, dark adventurer jacket and cartridge satchel, with a recognizable short-haired face and oversized slingshot.

Content plan: a fifth portrait card, three live ability clips, a transparent character entrance, compact disc-stock HUD and familiar controls.

Interaction thesis: a full-body elastic pull and release, trajectories that visibly turn on recall, and a sharp hand catch with local feedback. Q is an evasive flip with fading sprite afterimages. Existing neutral level art and speech-bubble cadence remain in use.

- Click/hold launches after a 100ms pullback. Three stock slots; each launch occupies one slot until its original disc(s) return or expire. No token drain. Holding repeats while stock permits.
- Continuous scroll / 1, 2, 3: **Rotate** (fast ricochet, 4 damage, 0.32s recovery), **Mirror** (two spread discs sharing one slot, 2.8 damage each, 0.46s recovery), **Zoom** (large armor-breaking disc, 8 damage, 0.74s recovery). Small continuous speed/radius adjustments supplement categorical differences. Selection changes the visible slingshot fork and loaded disc as well as the existing large scroll readout. In-flight discs retain their launch mode.
- E recalls all launched discs. Returns steer toward the moving player; targets can take one hit on each leg. Frontal shields bounce Rotate/Mirror and lose a little shield health; returning around the shield reaches exposed sides. Zoom strips the shield and knocks surviving bots backward/upward. E still prioritizes a nearby uplink override.
- Discs automatically return after roughly 0.72s (Zoom 0.85s). They collide with terrain using small swept steps. Steel never permits through-wall damage. Blocked discs expire after a bounded lifetime/bounce count and release stock rather than leaving the player permanently empty.
- Q flips in movement direction, or facing if no horizontal direction is held: 0.3s motion, approximately 0.245s protected, 1.45s cooldown. Physical movement preserves wall collision. Cannot fire during the flip; a pending pull is cancelled and its slot released.
- F enables **Batch Augment** for 4.5 seconds, with a 16-second activation cooldown. Each launch adds four half-damage transformed echoes. Echoes have no stock and cannot create catch refunds. Finite lifetime and stock limit bound the number in play.

Every mode damages props and interacts with the existing vulnerable boss core. Impacts use existing robot debris, hit pause and sound effects. Consecutive hits produce a short local counter; catches animate the body and display a brief CATCH cue. Catch and recall dialogue uses the existing cooldown-governed bubble system. No voice synthesis.

## Files and provenance

- [Marcus mechanics](../src/marcus.ts), [Canvas sprite and weapon art](../src/marcus-art.ts).
- Game lifecycle/input/HUD/render integration in `src/game.ts`; roster, actual-simulation previews, contextual dialogue and character theme updated.
- [Portrait](../public/assets/marcus-intro-v1.png), [exact generation prompt and references](research/marcus-image-generation.md). Generated using the built-in image-generation tool; copied into the project and visually inspected with transparent surroundings in the entrance.
- [Research and proposal history](characters/marcus-bloice.md). New speech bubbles are fictional except the separately sourced profile phrase.

## Validation

- TypeScript/Vite production build and all 31 existing deterministic tests pass.
- `scripts/playtest-marcus.js`: actual mouse/keyboard/wheel dispatch plus isolated checks for per-leg damage, return/catch stock, blocked return recovery, steel occlusion, ricochets, Mirror shared-slot accounting, in-flight mode lock, Zoom cover/armor damage, Q movement/protection/recovery, bounded Batch echoes, stock cap, death cleanup and respawn.
- `scripts/playtest-showcase.js`: all 15 clips have combat outcomes, remain isolated/silent, dispose/reopen correctly, respect reduced motion and fit desktop/tablet/phone widths. Five available cards and one placeholder.
- `scripts/playtest-level-combat.js`: all five heroes run 15 seconds of live level physics/AI without errors; Marcus engages, destroys cover and uses abilities. This fixture grants invulnerability and is not evidence of final difficulty balance or a full mission clear.
- Inspected `marcus-roster-v31.png`, `marcus-intro-v31.png`, `marcus-combat-v31.png` and `level-combat-marcus-v31.png` under `output/playwright/`.

Subjective feel and balance remain prototype questions, especially whether automatic return leaves enough time for deliberate repositioning and whether Batch's echo spread stays readable in dense encounters.
