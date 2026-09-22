# Iteration 014 — local ammo feedback and held-crab primary attacks

User direction: show token usage near Tibo on each shot and a visible empty-gun response; held red claw gets a small blast that deflects incoming projectiles, blue a simple pistol-like shot, gold a melee hit.

Tibo gets a compact world-adjacent spend readout and usage strip. Failed shots visibly rattle the gun/magazine, click mechanically, and show EMPTY or NOT ENOUGH with remaining/needed tokens as appropriate. They emit no projectile or muzzle flash. Reset/respawn clears the feedback. Iteration 015 replaces the single-shot headline with a running total.

Peter's click still commands the pack alongside the primary attack, with no recruit cost:
- Red: 2-damage small forward blast, 550ms recovery. A 100ms local pulse reflects incoming hostile bullets; cover blocks it. It is not a persistent guard and does not replace Q.
- Blue: cyan projectile, 1.5 damage, 220ms recovery, approximately 476px maximum travel. Normal bullet terrain/shield rules apply.
- Gold: 2.5-damage directional armor-breaking melee, 420ms recovery. Molt keeps its stronger lunge.

Updated held animations and scrolling hints communicate the differences. Isolated `scripts/playtest-primary-feedback.js` passes exact shot costs, dry attempts, mode affordability, reset cleanup, red local/rear/range behavior and deflection expiry, cover blocking, blue ranged hits/collision, gold melee/armor, command retention, no stock consumption, and Molt regression. Screenshots inspected for local spent/empty readouts and held red/blue attacks. Existing pet hunting/dash and Q-defense fixtures also pass. Build and all 30 deterministic checks pass. No full-route or difficulty-balance claim.
