# Iteration 032 — Zoom into a Space Invader

The user relayed Marcus's own suggestion: charge an increasingly large Space Invader, then have it fly and drop bombs. They approved trying this first and explicitly deferred redesigning the middle mode. Rotate and Mirror retain their existing attacks; the proposed pincer is not implemented.

## Implemented

- In Zoom, hold click/J to grow a two-frame pixel alien. Marcus leans back and raises the slingshot; the arms and fork rise with the growing load. A short in-world charge bar and 1 / 3 / 6 BOMB label show the payload, with pitch changes at thresholds. Full charge takes 1.35s; holding longer does not auto-launch.
- Release launches toward a point 65px above the cursor, clamped to 340px from the loaded craft. This lets aiming at ground enemies establish a useful bombing altitude. A faint row of projected drop markers appears while charging; no aiming tether. Horizontal pass direction follows the aim relative to Marcus.
- A quick shot carries one bomb; medium carries three; full carries six. The large craft is slower in transit and during the pass. Bombs drop every 0.23s, fall under gravity, bounce briefly on terrain, and explode after landing/contact. The existing friendly-explosion rules apply. Each release recoils the craft and removes one visible payload pip.
- After dropping its payload it retraces sampled points along its flight route, shrinks near Marcus, and produces the existing catch animation and sound. E initiates the return immediately and cancels undropped bombs. Already-dropped bombs remain live.
- One active/charging invader occupies one of three stock slots. The player can switch to Rotate/Mirror and fight while it flies. No additional invader can charge until the existing one returns or times out. A seven-second hard lifetime prevents stock loss when changing terrain or player movement obstructs return.
- Solid terrain blocks the craft; bombs use the existing swept body collision. The bomber turns back on obstruction rather than passing through ceilings. The charge illustration can extend into nearby scenery, but this does not grant a flight bypass.
- F Batch adds two bombs when the invader is launched, capped by its normal full payload at eight. It does not summon multiple bombers. Existing disc echoes remain unchanged.
- Switching mode, Q dodge, pause or death cancels an unfinished charge. Death also clears the craft and bombs. Mouse/keyboard input dispatch now supports hold/release for Marcus while preserving repeated fire in the first two modes.

## Integration

New flight/charge/bomb module: [marcus-invader.ts](../src/marcus-invader.ts). Pixel alien art and charge pose extend [marcus-art.ts](../src/marcus-art.ts); no new raster generation was needed. HUD, scroll icon/copy, accessibility labels, observations and the third actual-simulation roster preview use the new behavior. Field test label is 032.

## Verification

- Production build and 31 existing deterministic tests pass.
- `scripts/playtest-invader.js`: all three payload levels, exact finite drops/detonations, catch/refund, early recall, simultaneous disc use, single-bomber limit, solid ceiling obstruction and stock recovery, pause/mode/death cleanup, Batch's eight-bomb cap, dodge cancellation, and actual mouse hold/release in the level.
- Updated `playtest-marcus.js` passes for retained disc behavior, stock/dodge/Batch lifecycle and bombing cover/armored enemies.
- All 15 showcase clips have combat outcomes and retain isolated state, silent audio, cleanup, reduced-motion behavior and responsive layout.
- Charge, bombing pass and impact screenshots under `output/playwright/marcus-invader-*-v32.png` inspected. The larger alien and physical falling bombs read separately from disc attacks.

The next playtest should judge whether the aim-to-run offset feels natural and whether terrain obstructs too many intended bombing runs. This implementation does not establish final balance.
