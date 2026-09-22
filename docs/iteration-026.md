# Iteration 026 — six-slot roster and combat showcases

User asked for a cooler character selection screen that shows gameplay for the selected bro, while retaining portrait cards and reserving space for three future characters.

Visual thesis: a compact roster of operatives beside a cinematic, character-colored combat reel. Content: brand and selection heading, a 3-column × 2-row portrait grid, selected character gameplay with ability chapters, selected kit and Deploy. Interaction: portrait emphasis on selection, automatically cycling combat scenes, manual chapter selection and pause. Three lower slots are disabled CLASSIFIED / COMING SOON placeholders with no invented identities.

The selected character's name and role sit over a larger gameplay viewport. Nine staged scenes use the actual game's update/render paths, damage, physics, enemies, pets, projectiles, terrain destruction and effects:

- Tibo: token gunfire, Other Tibo's leap/throw, physical reset-button slam and refill.
- Peter: red Pincher explosions, blue Skipper attacks, yellow Crusher with breakable cover.
- Dimillian: sword combo/Grand Slam, charged fireball/meteor, flying ship/cannons/bomb.

Each scene lasts approximately four seconds and starts after a short simulated lead-in. Ability labels below the viewport switch directly to a scene. The camera crop follows vertical movement so the ship remains visible in short windows. Tutorial signboards are hidden only in previews. Portraits and generated assets are unchanged. On narrow screens the roster, showcase and Deploy stack vertically; the page scrolls naturally.

Implementation: `src/showcase.ts` owns one silent, input-free `Game` instance, an offscreen render canvas and its animation loop. `Game` has an explicit preview flag to avoid registering global input listeners, creating an audio context, writing the page HUD, starting a mission overlay or changing root character colors. Staged heroes ignore damage so clips reliably demonstrate their abilities; previews are demonstrations, not unedited player recordings. The owner's score, tokens and mission progression are separate. Deployment disposes the showcase immediately; returning via Switch Bro creates a new one. The covered main game's render loop idles on the roster. Hidden-tab previews stop simulating/drawing; paused previews repaint only when resized. Reduced-motion users start on a still frame with Play available.

Validation: production build and 30 deterministic tests pass. `playtest-showcase.js` runs every clip and confirms actual enemy damage, observes pets/double/reset/fireball/sword/flight/bombs, verifies no owner progress or preview audio context, checks automatic chapter advancement, manual switching, pause, reduced motion, lifecycle disposal/reopening, all six slots and three disabled placeholders, and desktop/tablet/narrow layouts. Existing `playtest-roster.js` and `playtest-dimillian-ui.js` pass selections/deployment and real gameplay input. Zero page errors. Inspected final action/flight and responsive captures at `output/playwright/roster-showcase-*-v26.png`. QA uses an isolated browser, leaving the user's live tab alone.
