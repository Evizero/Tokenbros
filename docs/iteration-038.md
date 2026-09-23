# Theo: one physical deck

> Historical first Theo pass. [Iteration 039](iteration-039.md) supersedes the manual stances and timed parry described below.

The user approved a tall, skinny skater built around a single independent skateboard. His supplied report is background, not verified biography. This implementation uses the user's visual references and skating idea rather than the report's unrelated model-swapping powers.

## Controls and behavior

- Scroll / 1–2: Ride or Grip. Continuous scrolling stays visible, with two stance thresholds and a physical catch/regrip pose at the crossing.
- Ride: A/D accelerates to 470 px/s. Release to coast, countersteer to brake. Throwing retains speed during the chase on foot instead of dropping to the normal walking cap. Above 370 px/s, a cyan rush shows ram readiness: light bots are launched with little speed loss; armored enemies absorb more momentum. Ram collision is host-authoritative and runs after physical movement, never during client prediction. Shift slows to quiet movement. Aim remains independent of travel.
- Click in Ride: kick the board toward the mouse and hop off. Throw speed inherits momentum. One light bot can ride on top, flailing, until a collision throws and damages it. Heavy bots are shoved and lose guard temporarily. Outbound boards hit terrain, break cover and trigger barrels.
- Click in Grip: tap for a fast swat; hold to wind up a 650ms charged slam, then release. Heavy swings launch bots harder and damage cover and an exposed boss. A short lunge closes the gap; collision is evaluated from the swing origin so close targets are not skipped. Without the board, use a short kick.
- E: recall; nearby objective override retains priority. The board returns physically, with a translucent cyan trail, and passes through terrain without damaging it. Following user feedback, it hits each bot once on the return, knocking them back toward Theo. The first collision-based return could repeatedly collide with massive walls; the user caught this while playing and it was replaced.
- Catch: intercept or land on the moving board; Ride preserves the player’s intended travel direction, never the recalled deck’s backward velocity. Standing catches do not launch Theo. Successful hit/catch and kickflip/catch sequences build up to three small speed bonuses, expiring after five seconds without a clean catch. No distance-based automatic recall. Only leaving the playable bounds triggers safety recovery.
- Q: short directional timed parry, presented as a powerslide in Ride or board block in Grip. Initial 220ms deflection window; 1.15s recovery. Requires the board and costs skating momentum.
- Space: ordinary immediate jump/ollie. A fresh airborne press with the board pops Theo upward and sends the deck downward while preserving forward velocity. Air momentum is retained to allow landing back on the rolling deck. One air trick until landing, and the board must be present.
- F is deliberately reserved, omitted from Theo's HUD/control legend, and cannot accidentally trigger Tibo's reset.

## Presentation

Cyan accent, cyan-and-white deck. The user rejected the initial stick-like sprite; it now has a larger detailed face, angular jaw, shaggy layered hair, silver hoop, oversized shaded black tee, articulated clothed legs and sneakers. He stands tall during ordinary riding; pushing, sliding and heavy attacks adjust this upright pose. Body animation covers pushing, balancing, crouching, kick-offs, kickflips, board swings, parries and catches. A user-reported third-leg bug was fixed by posing exactly two legs rather than overlaying a kicking leg. Photos were revisited for a paler, longer face, darker hanging fringe and a taller, slimmer body. Collision body remains the shared 20×32 size; his taller silhouette is visual so existing passages remain usable.

Five silent selection-screen clips use real inputs and stop after their move lands: kick/carry/catch, high-speed ram, Grip brawl, timed reflection, and kickflip/catch. Character lines are fictional speech bubbles, not attributed quotations or synthesized speech.

## Assets

`public/assets/theo-intro-v1.png` is an image-generated cutout with verified transparent alpha, based on the two user-supplied photos and the Marcus portrait as a rendering reference. Generated image originals remain intact. Final portrait prompt:

> Create one TRANSPARENT BACKGROUND PNG character cutout for Tokenbros, a cinematic retro pixel-art run-and-gun character selection screen. Character is Theo Browne based on reference photos 1 and 2. Match detailed chunky pixel illustration rendering of reference 3, not photo realism. Tall very skinny long-limbed skater, shaggy black fringe, angular young face, small hoop earring, confident amused expression. Black loose T-shirt, dark slim trousers, white sneakers. Holding a distinctive cyan/white angular patterned skateboard vertically by the front truck at his side; visible wheels, curved deck ends. Dynamic lanky stance, knees loose, one shoulder tilted. Three-quarter front view facing slightly right. Full body visible, board visible, no cropping hands feet hair or deck. Cool cyan rim light, warm skin, strong silhouette and graphic shadows. No words, lettering, logos, scenery, panels, or background. Actual transparent alpha outside character, not checkerboard graphic. One polished sprite portrait, high resolution, ready as game cutout.

Cutout refinement prompt:

> Remove the entire background behind this character. Preserve the existing character illustration and skateboard exactly, but replace ALL black, brown and cyan background glow with genuinely transparent alpha pixels. No opaque backdrop whatsoever. Clean cutout around the hair, clothes, hands, skateboard and shoes. Transparent PNG for a game UI. Do not add shadows/glow outside the cutout. Preserve full body and all deck.

## Integration and validation

Per-player TheoKit owns the board and passenger reference; shared enemy AI skips carried bots. Teammates cannot simultaneously claim that bot. Snapshot replication retains board hit sets and passenger identity. Co-op protocol advances to 2 so old clients fail cleanly rather than receiving an unknown kit.

`playtest-theo.js` exercises acceleration/coasting, sustained speed after throwing, high-speed ram and its speed threshold, launch/carry/crash, catch, heavy armor, Grip tap/charged-release damage, a forward kickflip landing, intended-direction return catches, return damage, timed reflection, unique deck ownership, recall through massive walls without damage loops, death/respawn cleanup and HUD switching. `playtest-showcase.js` includes Theo's five reels. `playtest-coop-world.js` includes the sixth character and board/passenger replication. Assets and sprite are checked in the browser. Local development; no deployment requested.
