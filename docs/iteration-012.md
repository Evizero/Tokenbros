# Iteration 012 — hunting pack and distinct attacks

User direction: crabs should seek enemies around the commanded point; one type charges and shoots forward over a limited distance, the big type fights in close combat, and the small type sacrifices itself in a small explosion. Clicking should also attack with Peter’s held claw outside Molt.

Left click now combines an order with free directional melee. It does not deploy or consume a recruit. The held Pincher/Skipper snaps for 1.5 damage with 300ms recovery; Crusher hits for 2.5, strips armor, and recovers in 420ms. Cover blocks melee, including against the exposed boss. Molt retains its stronger lunge. E remains deployment.

Commands create a visible 160px hunting area for eight seconds. Pets prioritize a directly marked enemy, then search for visible enemies in the area when it dies. Near-player click regroups. Orders remain bounded by the leash; movement uses the existing local steering and visible catch-up assist, not full platform pathfinding.

- Pincher seeks close range, flashes a 400ms fuse, then dies in a small 52px, 5-damage blast. Cover blocks damage. Nearby barrels may chain. This explicit latest request supersedes its earlier persistent biting attack; deployment itself remains harmless.
- Skipper hovers into range, displays a 450ms charge and direction line, then dashes 190px at 720px/s. Direction locks at charge start. Terrain stops the dash, and each enemy is hit at most once per dash for 4 damage. It survives, repositions, and has 1.5 seconds of recovery.
- Crusher stays a durable melee companion, dealing 3 damage and breaking shields/cover. Surviving companions have no expiry timer.

Build and 30 deterministic tests pass. `scripts/playtest-pet-abilities.js` passes isolated browser fixtures for area search beyond the old defense radius, reacquisition, fuse/consumption/bounded splash, charge/dash/range/one-hit behavior, a wall inserted during charge, Crusher armor break, normal held-claw directional melee without deployment, cover, and exposed boss damage. `scripts/playtest-defense.js` also passes, including fixed world-position Prism protection of a companion after Peter moves away. Zero page errors. Screenshot inspected: `output/playwright/pet-abilities-v12.png`.

Older v10 assertions that a Pincher survives attacking and Skipper deals repeated contact damage are historical. No new full-mission completion or difficulty-balance claim.
