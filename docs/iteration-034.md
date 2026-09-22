# Iteration 034 — Pac-Man chain cartridge

The user approved the directed chain proposal: launch Pac-Man toward a nearby bot, click another target during each chomp, and finish four linked bites with a heavy crunch. The weapon remains a collection of games loaded by Marcus; Pac-Man is a projectile, not a new player transformation. Rotate cartridges, LCD self-launch and the Invader bomber remain.

## Play

- Scroll to the fourth category or press **4**. Marcus holds a small yellow chomper in his slingshot. The mode icon and aiming reticle also show the mouth.
- Click to launch. Find the nearest eligible bot within 170px of the aim point, within 480px of the launch position, with a clear line of sight. Both horizontal and vertical targets work. A miss still sends a short-lived projectile to the aimed position.
- The mouth homes to that bot and begins an exaggerated squash-and-chomp. Damage happens after 0.17s so the jaws visibly close before the impact. The bot cannot attack during this brief bite.
- The player has 0.85s from contact to click toward the next bot. A dotted pellet route and target outline show the eligible destination; clicking locks it in. Inputs can queue before the first damage frame, but the next flight starts no earlier than 0.3s. Clicking during ordinary flight is ignored. Holding does not auto-chain.
- Each target is bitten at most once per chain. The mouth grows from 12px radius by 4px per bite; speed rises from 570px/s by 135px/s per completed bite. Player movement and Q dodge remain independent.
- Base bite damage is 5 / 7 / 9 / 13. A well-timed queued click adds one damage; launching during F Batch adds two. Each normal bite strips three shield points. The fourth strips six and adds a 65px, line-of-sight checked shock impact for nearby unbitten enemies (four damage). Heavy bots can survive; bosses are not homing targets.
- Bite feedback includes jaw squash/stretch, escalating arcade tones, mechanical crunch, knockback, debris, brief hit pause, and escaping ghost eyes on kills. The fourth hit gets a larger ring and **CRUNCH!**. Feedback stays in the world rather than a web-style popup.
- No next click means Pac-Man disappears after the current bite window. A full chain disappears after its finishing animation. One active mouth consumes one of Marcus's three shared stock slots. Cleanup refunds the slot; a one-second digestion cooldown prevents immediate repeated launches. E recall also cancels the mouth.
- Terrain blocks selection and flight; the projectile steps through travel in at most 3px increments. It cannot tunnel through steel. Dead queued targets are discarded. Pause freezes the move, switching cartridges lets the current finite attack finish, and death clears it.

## Integration

Only Marcus has four categories. The wheel remains continuous, numeric shortcuts 1–4 select the four modes, and his range slider/feedback use four equal bands. Other characters keep their three categories. The roster has a fourth live simulation clip and cycles over each character's actual clip count.

`src/marcus-pacman.ts` owns the move, rendering, target selection and lifecycle. Shared player movement and existing projectile behavior are preserved. `scripts/playtest-pacman.js` checks directed four-target chains across elevations, input edges, once-only hits, no automatic chaining, armor, terrain obstruction, target loss, stock refund, recall, pause, switching and death. The existing Marcus/LCD/Invader and roster fixtures cover integration regressions.

## Validation and play feedback

Production build, 31 deterministic tests, the new Pac-Man fixture, retained Rotate/LCD/Invader fixtures, and all 16 live character previews pass. Narrow-screen preview tabs were adjusted to two rows for Marcus. Visual checks cover the pellet route and final crunch. The user played the implementation and reported that it feels great.
