# Iteration 013 — pets draw fire, Pincher range, Crusher digging

User direction: enemies should attack crabs; blue dash already feels satisfying; red should throw farther like a smart grenade with a shorter fuse; big crab should dig toward enemies behind cover/shields.

Guard targeting now considers Peter and living, deployed pets within the existing sight cone and line of sight. A visible current target is retained unless another is substantially closer. Wind-ups lock the chosen target's position as before. Recall bubbles and dead pets are excluded. The boss may also select a closer visible pet. Enemy shots already collided with pets; contact now deals damage with a grace interval, and enemy grenade blasts deal three pet damage.

Red launch speed: 620px/s horizontal at level aim versus the other pets' 220px/s. Added lift and a landing-based deployment phase preserve the arc. It can arm near an enemy in flight after a short safe deployment interval, then detonates after 160ms (previously 400ms). It searches locally away from Peter even without a point command. Blue's charge/dash tuning is unchanged.

Crusher can acquire a target through breakable cover in the hunting area, but reinforced terrain blocks that detection. It repeatedly digs a small chunk in the target direction, including downward, then advances. Melee still requires a clear path and strips enemy armor. This is directional digging with local movement, not full platform pathfinding.

Isolated `scripts/playtest-pet-threats.js` passes: visible pet selected with Peter out of range; rear/cone, cover, dead and recall exclusions; aimed gunfire damages crab; contact grace; hostile blast damage; red travels 310px in 0.5s versus blue's approximately 108px in 0.49s; red acquires/detonates near a distant enemy without a command; Crusher tunnels thick cover and down, reaches/strips enemy armor, and leaves reinforced blocks intact; boss chooses closer visible pet.
