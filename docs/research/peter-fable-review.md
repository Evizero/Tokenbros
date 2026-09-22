**Verdict:** the core is sound because a click still produces an immediate hit. The risk is everything layered on top of that click. Cut the kit to what a player can read in one second, and let the crabs be distraction tools rather than a second gun.

**What works**

- Impact damage on throw keeps Peter responsive and skill-based. Pets are a bonus, not the payoff, so aim matters. Keep this as the primary DPS source.
- Molt with glasses and beard intact is a good visual joke. The instant shirt tear reads from across the screen.
- Oldest pet expiring on replacement is the right call. No management, no failure state.

**Problems**

- **Scroll thirds are unreadable on a trackpad.** Inertial scrolling makes "which third am I in" a guess. Players will throw the wrong crab and blame the game.
- **Control overload.** Tibo has click, E, F. Peter adds a type selector, a command mark, a cooldown, and a transform. That is two more mental slots than the game currently asks for.
- **Pincher pathfinding is a trap.** A hopping melee crab on destructible terrain with ladders will get stuck constantly. Skipper flies and Crusher barely moves, so those two are cheap. The fast ground crab is the expensive one.
- **Molt creates dead time.** Five seconds active, fourteen cooldown. If Molt is the reliable cover breaker, boss fights become wait-for-F. Crusher must fully cover this role or the loop stalls.
- **E does two jobs.** Uplink interact near a terminal and pounce command elsewhere. Contextual E is fine, but the pounce needs no cooldown or players will press E at an uplink and get a crab command instead.
- **No resource.** Tibo has ammo. Unlimited crabs makes Peter strictly safer.

**Prototype recommendations**

1. Ship two claw types, not three. Tap throws Pincher, hold throws Crusher. Drop scroll entirely. Add Skipper later if the flying pet proves fun.
2. No pathfinding. Pincher hops toward the nearest enemy within a short radius of its landing point with a raycast line-of-sight check. If nothing is visible, it idles. If blocked for one second, it leaps once then expires. Trajectory decides everything.
3. Make crabs a stealth tool. Guards' sight cones detect crabs and turn toward them. Throwing a crab behind a guard pulls its cone. This is the unique fun Tibo cannot offer, and it costs nothing to build.
4. Crabs are the ammo. Peter carries eight. Expired crabs scuttle back to him and refund. Pickups refill. The recall animation doubles as the expiry signal.
5. E pounce with no cooldown, but crabs only pounce if the target is within their leash radius. Near an uplink, E interacts. Terminal window appears only on pounce and reads one line, "claw: exit 0" on expiry.
6. Molt gets an entry shockwave on F so the press feels instant. Kills during Molt extend it by one second. Reduce cooldown to ten. Crusher cracks cover and armor at full effect so Molt is a burst option, not a gate.
7. Molt lunge grants brief knockback on hit, or short-range melee against sight cones is suicide.
8. Rainbow: a thin arc trails the shirt tear for a few frames. Once, small, done.
9. HUD stays as proposed: crab count, E and F readiness. Nothing else.

Fold Skipper in only once Pincher's leash behavior feels good. If the leash crab is boring, the flying one will not save it.