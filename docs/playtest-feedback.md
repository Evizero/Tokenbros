# User playtest feedback and iteration 002

2026-09-22. The user played the first prototype in the visible test browser. This explains unexpected input/state during our initial automation: the human and agent shared that browser. Future automation should use a separate headless session.

## User feedback

- Likes the graphic style; the basic game plays decently.
- Enemies and encounters feel too simplistic.
- Too much uninterrupted left-to-right running; wants Expendabros-like verticality and crossings.
- Feels like Mario with destructible terrain rather than a varied action playground.
- Tibo feels like a generic man with a gun; his distinguishing abilities need to come through.
- Small sprite does not sufficiently resemble Tibo.
- Wants an attractive character entrance/reveal, illustrated by the supplied Trent Broser screenshot.
- Explicitly suggests ImageGen for visual targets or detailed overlays, using the previously supplied Tibo photos.

## Next implementation direction

- Preserve the established pixel-art palette and punchy shooting.
- Expand the terrain vertically, with a required uplink-tower ascent, a zipline crossing, descent, and a second multi-level combat encounter.
- Make RESET interact with the installation: overload uplink terminals and temporarily turn nearby turrets friendly, in addition to its firepower/portrait payoff.
- Distinct shield, grenadier, and hovering enemies create positioning and aiming choices; patrol bots need line-of-sight and ledge awareness.
- Add a detailed generated likeness-based portrait and an animated, skippable character introduction. Keep the regular gameplay responsive; no long interruption on every reset.
- Give RESET a visible physical button animation.

These are responses to the user's playtest, superseding earlier scope cuts where needed. Keep the research/source records intact as history.

## Additional combat feedback

The user explicitly requested epic action, satisfying hit feedback, ragdolls, and the robot equivalent of gore. Implemented directional robot dismemberment with separate tumbling torso/head/limb/armor pieces, collision and bounces, oil spray and pools, shell casings, stronger metallic impact/death sounds, and stronger RESET launch force. This is arcade fragment physics rather than a full joint-constrained ragdoll simulation.

Traversal testing found that narrow platform jumps made the mandatory ascent unnecessarily fiddly. Added usable W/S ladders and widened their landings, retaining jumps and wall jumps as options. Climbing gives the combat spaces actual vertical traversal rather than relying entirely on platform-jump timing.
