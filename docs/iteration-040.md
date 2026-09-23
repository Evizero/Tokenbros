# Iteration 040 — Theo boxing and roster art consistency

- Bare-handed attacks now cycle left jab, right cross, left hook. A 0.9-second pause resets the sequence. Damage is 2 / 2 / 3, with short early-hit knockback to let the combo connect and a stronger launch on the hook. Punches do not add movement momentum or change the responsive on-foot controls.
- Boxing uses an alternating lead/rear arm, guard hand, planted feet, shoulder twist and hook lift. The rear-arm cross draws across the front of the rotating torso while the lead hand retracts to his cheek, keeping the two punches visibly distinct. Catching the board clears the boxing action.
- Q keeps immediate physical protection but gets a 420 ms two-handed shove/follow-through, planted stance, head dip, ground dust and layered release sound. The projectile remains the same physical board, without an extra copy or cooldown.
- Comparing actual idle sprites revealed the previous Theo was much too large and used finer facial/limb rendering than the roster. His head and torso now use the same coarse pixel blocks and scale as the other characters; the extra height is primarily longer legs. No collision-body enlargement.
- `scripts/render-character-lineup.js` renders the six current default idle loadouts on a common ground baseline, uniformly enlarged 4× with nearest-neighbor sampling, and a native-size row. It does not normalize individual character sizes. Output: `output/playwright/character-idle-lineup.png`.

Validation: production build and Theo browser regression scenarios, including alternating punch damage, combo expiry, no punching movement drift, catch cleanup and immediate Q protection. Visual QA uses the uniform-scale roster contact sheet plus jab/cross/hook/shield pose frames.
