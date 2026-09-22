# Iteration 017 — stronger blue/yellow companions

User feedback: red is fun; blue/yellow feel weaker and less interesting. Give them the same long launch, reduce blue's first dash buildup, and make yellow walk faster with more brutal animation, damage, and knockback.

All pets now use the existing red throw: 620px/s horizontal at level aim, aimed vertical velocity plus lift, and ballistic movement until landing or attack interception. All can acquire local enemies away from Peter, within the existing bounded leash. Deployment alone still deals no damage.

Blue's first dash after recruitment charges for 100ms instead of 450ms, and may start during flight after the short 120ms deployment grace period. Later dashes retain the 450ms charge and 1.5-second recovery. Its 190px locked-direction dash, 4 damage, one hit per target, and wall collision remain intact. The charge gauge uses the actual current duration.

Yellow walks at 190px/s (was 115). In close range it plants for a 140ms windup, then slams a short forward area for 6 damage (was 3), strips armor and launches surviving robots at 430px/s horizontally and -220px/s vertically. Brief flung physics preserves the kick and allows the existing robot/barrel collisions. Attack recovery is 800ms (was 1.1s); exposed boss damage is 9. Enlarged pincers open and snap, the body squashes/recoils, and a hit gets gold sparks, an impact ring, heavier sound and a short effects-enabled hit pause. Digging remains directional and reinforced cover remains solid. Held primary damage is unchanged; its gold sprite benefits from the claw animation.

Build and all 30 deterministic tests pass. `scripts/playtest-pet-power.js` verifies equal 310px flight distance over 0.5s, blue first/subsequent charge timings, dash range and one-hit limits, wall collision, yellow walking speed/windup/damage/armor/knockback and actual displacement, one-hit destruction of an ordinary bot, digging, and a reinforced wall introduced during windup. Existing pet ability/threat browser fixtures pass with their old tuning expectations updated. Zero page errors. Inspected `output/playwright/crusher-slam-v17.png`. No new full-mission balance claim.
