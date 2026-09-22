# Iteration 020 — held token-absorption shield

User direction: hold Tibo’s shield briefly, convert incoming shots into tokens, and increase the cooldown for each token recovered. This is the final choice after considering an energy-release attack.

Hold Q for up to two seconds. The directional shield follows Tibo and the cursor. Each intercepted hostile bullet disappears and restores up to 24 tokens without exceeding the 1,000-token budget. Releasing Q or reaching the hold limit ends the shield and starts a cooldown of two seconds plus 0.025 seconds per token actually gained. Four shots at a sufficient deficit yield 96 tokens and a 4.4-second cooldown. At full budget it blocks with only the base cooldown. Keeping Q pressed after timeout does not reactivate it.

The shield shows the accumulated token gain, projected cooldown, a growing energy core, and a shrinking hold-time strip. Release briefly shows the total and final cooldown. Restoring tokens clears empty-gun feedback. Pausing releases the shield and freezes the cooldown. Death/respawn retain their existing cleanup. Peter’s stationary Prism is unchanged.

Build and all 30 deterministic tests pass. The updated `scripts/playtest-defense.js` checks exact conversion and cooldown, token-cap accounting, full-budget blocking, no reflected damage, friendly/rear behavior, aim tracking, timeout without recast, pause handling, and vulnerability after release. Existing Peter position, companion protection, hit-limit, expiry, cooldown, and lifecycle checks also pass. Zero page errors; HUD containment passes at 800px. Inspected `output/playwright/tibo-absorb-v20.png`. These are feature fixtures, not a full-mission balance assessment.
