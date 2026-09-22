# Iteration 018 — the other Tibo replaces magnetic yoink

User direction: make E connected to the supplied tired/happy Tibo meme. A temporary other Tibo should jump toward the cursor, perform close combat, throw a robot, and also block bullets. A funny localized reset line should accompany it.

E summons the happier avatar-inspired Tibo as an unarmed brawler beside the interview-inspired playable gunner. He leaps up to 360px along a short arc toward the aimed point. Terrain stops the leap. The first robot he touches is briefly grabbed, interrupted, stripped of armor and thrown onward for 3 damage, with 640px/s horizontal-direction launch force and upward lift. Existing flung-robot collisions handle other robots and barrels. The comic-text bark is YOU GET RESET!; there is no new speech synthesis.

After the leap/throw he stays where he lands, falling under gravity, until his 1.8-second lifetime expires. His actual body blocks at most three hostile bullets; friendly bullets pass. He also participates in enemy target selection. A miss is still useful for placing temporary cover. E costs no tokens and has a 4.5-second cooldown. No laser/tether or old yoink marker remains. Restart/respawn resets the ability, death removes the double, and pause freezes the active duration.

Implementation is isolated in `src/other-tibo.ts`, with unarmed leap/grab/throw/guard poses in the existing Tibo pixel renderer. Player movement is independent of the double. HUD and controls name OTHER TIBO. Peter's E deployment is unchanged.

Build and 30 deterministic tests pass. `scripts/playtest-other-tibo.js` verifies E activation, independent movement, no token spend, actual grab/armor-strip/throw and target displacement, range and wall collision, empty-space guarding, three hostile blocks, friendly pass-through, vulnerability after disappearance, lifetime, cooldown, pause, death and respawn. Screenshot inspected: `output/playwright/other-tibo-v18.png`. Old yoink portions of `playtest-escalation.js` are historical and superseded by this fixture. No full-mission difficulty-balance claim.
