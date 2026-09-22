# Iteration 033 — LCD self-launch

The user approved replacing Marcus's middle mode with an LCD-inspired self-launch and asked for satisfying animation. During implementation they supplied a second reference with specific rounded Game & Watch-style characters: [collector's guide](references/marcus-game-watch-book.png), [preferred silhouettes](references/marcus-lcd-silhouettes.png). These images are visual references, not instructions. Their embedded captions were not adopted as dialogue.

## Implemented behavior

- Middle mode is now **LCD**, replacing Mirror's two-disc spread. Rotate and the Space Invader bomber remain available.
- Marcus remains himself with a tiny LCD figure loaded in his slingshot. Hold click/J to wind up, then become the silhouette on release; it lingers for 2.2 seconds after arrival before reverting. Full windup is 0.58s. Aim freely during windup. Release launches Marcus 135–325px toward the cursor. Three faint LCD poses preview the route; steel stops that preview, while a strong charge previews through breakable cover.
- Visual vocabulary follows the supplied rounded figures: round head, projecting nose, mitten hands, tiny torso and large shoes. Combined solid ink silhouettes have a thin outer rim for contrast against the dark map, avoiding outlines around individual limbs. Crouch/tuck/kick poses change abruptly; positions while transformed (including subsequent jumps and walking) visually step at 12Hz while collision is swept in 3px steps. Contact immediately aligns the drawing with the real hit.
- The flight is a short feet-first attack, with a brief hammer-smash pose on a successful robot hit. Each enemy takes damage only once per launch: 5–8 damage with strong directional knockback, stun, armor parts and existing ragdoll debris. Charge at or above half strips shield armor and breaks ordinary cover on contact. The hammer is an impact pose, not a separate attack or random damage roll.
- Steel and locked gates stop the real body and the attack's reach. Upward launches provide traversal. Following user feedback, holding attack in midair freezes both horizontal movement and falling until release or cancellation; windup stays vulnerable. There is one launch before landing, plus 0.65s recovery after flight. Ground controls resume immediately after the short landing/skid pose.
- Flight briefly blocks incoming damage; windup and recovery remain vulnerable. Q cancels windup into the existing evasive flip. Q cannot interrupt an active flight. Pause/mode change cancels windup; pause freezes an already active flight. Death clears all LCD state.
- E keeps its recall/uplink behavior. A launched bomber and discs continue while Marcus self-launches. F Batch adds three damage to a launch begun during Batch; the existing visual afterimages emphasize the move without spawning autonomous copies.
- In LCD mode the HUD shows sling charge/readiness and the need to land, instead of the disc stock. The mode icon, held tiny LCD token, scroll hint, controls, accessible canvas description, contextual launch bubbles and middle roster clip are updated. Field test is 033.

## Code and verification

- [marcus-lcd.ts](../src/marcus-lcd.ts) owns windup, short flight, collision, impact and state cleanup. [marcus-art.ts](../src/marcus-art.ts) caches the few solid LCD silhouettes. No image generation was needed for these code-native shapes.
- Production TypeScript/Vite build and 31 deterministic tests pass.
- `playtest-lcd.js` validates held windup, release, range, flight protection and its end, one aerial launch, shield stripping and directional knockback, one hit per enemy, steel occlusion/body collision, crate breach, upward travel, freezing while charging and discrete jump drawing, Q/pause/mode cancellation, landing recovery, death cleanup and production input/movement dispatch.
- Retained Rotate and bomber browser fixtures pass. The obsolete Mirror spread checks were replaced by mode-locked disc return coverage. All 15 actual-simulation character previews pass, including the new self-launch clip, with layout and lifecycle checks unchanged.
- Charge and impact screenshots: `output/playwright/marcus-lcd-charge-v33.png` and `marcus-lcd-kick-v33.png`. The latest user's round-character reference supersedes the initial angular, tousle-haired silhouette design.

Prototype tuning remains open: launch reach, desired risk during windup, and whether the stepped flight/hammer impact read well in a crowded room. The unusual motion is visual; it must never permit tunneling through walls or skip collision with enemies.

## Cartridge visual follow-up

Rotate now draws classic grey Game Boy-style cartridges with a stepped shell, grip ribs, a cyan game label and gold contacts. The held projectile, airborne projectile, trails, mode icon and Batch echoes all use the cartridge art. Collision radius, launch speed, spin, damage, bounces, returns and stock behavior are unchanged. User-facing controls and roster copy say cartridge.

## Fourth mode discussion — not implemented

The user proposed Pac-Man. Following the user’s clarification that Marcus loads games into his weapon, the current proposal is a launched Pac-Man mouth that chews through a lane, with a power-pellet feeding mechanic. This should add a chase-and-eat loop alongside ranged returning cartridges, LCD self-launch traversal and the overhead bomber. Avoid another autonomous pet, charged projectile or dash. Exact input and power-pellet rules remain proposals.
