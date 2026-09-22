# Iteration 009 — direct swarm orders and visible scrolling

User direction: Peter left-click should order attacks and E should throw creatures. Scrolling on both characters needs continuous visible feedback and major differences between categories.

Implemented: left-click/held click sends the existing swarm toward the aimed point; during Molt it punches. E tap/hold throws the selected claw, including during Molt. Throw cooldown is separate from primary attack/command cadence. E near an uplink keeps interaction priority. Tibo's inputs are unchanged. Intro, HUD and control legend use the new mapping.

Every scroll change or preset brings up a temporary canvas-drawn arcade readout near the character, with a large category name, unique icon, role, exact percentage and three-band gauge. Cursor size responds continuously, while the tier changes outline shape (circle / diamond / square) and segment count. Category crossings add a brief expanding border pulse and distinct pitch; within-category changes use quieter rate-limited ticks. Feedback expires 1.5 seconds after adjustment. Reduced-motion/screen-shake-off mode suppresses the expanding pulse while retaining readable labels, gauge and shapes.

Verified with production build, 27 deterministic tests and real input tests in the isolated headless browser. See `scripts/playtest-controls-v9.js`. No new full-route completion claim.
