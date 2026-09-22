# Iteration 024 — baguette sword feel

User request: shorten the baguette, animate the whole character through hits, damage walls, and block/reflect bullets.

Normal weapon length is now 29px, 33px for the combo finisher, independent of the damage radius (43/50px plus target-body padding). F keeps its deliberately oversized Grand Slam. Each slash plants the feet, bends the knees, winds back, drives the hips and shoulder, carries the head and phone through the motion, and settles back to the ready pose. The three attack directions and hit-confirmed finisher remain. Light knockback drops from 105 to 65 so the shorter blade can maintain a chain against a moving robot; the finisher retains its heavy throw.

The active blade damages breakable terrain once per tile per swing: 2 for regular slashes, 8 for heavy strikes. Rays stop at cover and reinforced geometry survives. Horizontal swings preserve the floor to avoid accidentally excavating both fighters mid-combo; aiming down deliberately can dig.

Incoming bullets contacting the active blade are reflected with their speed preserved, become friendly, deal at least 2 damage, and get gold trails, sparks and a short metallic ping. Windup, recovery, the unseen rear, beyond-reach shots and cover do not provide reflection. This is a timed slash interaction; Q remains the iPhone bunker. Reflections and wall damage cannot unlock the robot-hit finisher.

Validation: production build and 30 deterministic tests pass. Existing Dimillian kit checks and live enemy-physics combo pass; the robot takes 10.5 damage and is launched from x244/y830 to x322/y744. New `scripts/playtest-dimillian-sword.js` checks cover destruction, once-per-swing damage, wall occlusion, reinforced geometry, deliberate downward digging, reflection in both directions, reflected damage to a robot, negative timing/range/cover cases, and the moving blade sweeping into a bullet. Zero page errors. The enlarged pose sequence was visually inspected at `output/playwright/dimillian-sword-poses-v24.png`. Testing uses the isolated browser, not the user's live play tab.
