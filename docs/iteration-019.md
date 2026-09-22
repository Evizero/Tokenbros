# Iteration 019 — easier same-wall climbing

User direction: wall jumping pushes too far away to climb the same wall. Holding toward a wall should attach/slide with a visible hand-grip pose and give better control.

Wall contact now uses a small side probe against the torso, independent of whether the physics step produced a horizontal collision. Holding toward that wall caps downward speed at 55px/s (previously 100). Release direction to fall normally. Both characters draw a free hand gripping the physical wall and a bent knee/planted foot; weapon aim remains independent.

Jumping while holding toward the wall uses a 75px/s outward kick and just 25ms of input lock, replacing 265px/s and 160ms. The normal -520px/s vertical jump is preserved. Pressing away or using no direction gives a more deliberate 200px/s outward jump with 70ms lock. Contact has a 120ms grace window, consumed on jump; a 120ms re-grab interval prevents immediate retriggering. Restart/respawn clears wall state. Ladder and cable modes suppress the grip.

Build and 30 deterministic tests pass. `scripts/playtest-wall-climb.js` tests Tibo/Peter against left/right walls: three repeated same-wall jumps gain about 164px with maximum 3.2px sideways drift. It also checks the slow slide, release-to-fall, deliberate jump away, short wall grace without a later air jump, and respawn cleanup. Zero page errors. Inspected `output/playwright/wall-grip-v19.png`, showing grip while aiming away. No full-level traversal claim.
