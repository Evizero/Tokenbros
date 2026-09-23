# Iteration 042 — Crouching and in-game menus

Control replaces Shift quiet-walk. Hold either Control key on the ground to crouch: the body shrinks from 32 to 18 pixels without moving the feet, and movement slows to 90 px/s. Bullets and perception use the lower body, so a single 20-pixel block can provide cover. Releasing stands up only when overhead space is clear. Jumping and climbing require leaving the crouch. Theo picks up his board; Dimillian's ship settles low and moves slowly. All six bros have folded-leg poses, with robes and equipment adjusted for the lower stance. Attacks and aiming use the lowered body origin. Control-click also fires on macOS rather than opening the context menu.

Fresh loads select Tibo, the first roster slot.

The pause screen now has one centered, character-colored action stack: Resume, Switch Bro, Restart Mission, and Options. Removed Operation Hard Reset and filler subtitles. Secondary actions have full-sized buttons, clear descriptions, and hover/press feedback. Options closes back to its visible menu control. Death uses a short BRO DOWN treatment with a checkpoint-return progress bar, preserving automatic respawn timing; it does not interrupt an already-open co-op menu.

The co-op input allowlist now includes both Control keys and excludes Shift. Protocol 3 prevents clients with the old input semantics from joining the new build. Crouch state is derived from the already-replicated player body height.

Validation: build, 34 unit tests, eight crouch/form browser scenarios (feet, speed, high/low bullets, one-block cover, ceiling clearance, standing and removed Shift behavior), 23 Theo gameplay checks, and 12 shared-world checks. Browser interaction checks cover pause, Options focus return, resume, real Control input, death/automatic respawn and Switch Bro. Desktop/mobile menu captures and a uniform-scale crouch pose sheet were inspected.

Follow-up polish: Peter and Dimillian keep pupils toward the front of their lenses while centering them vertically. Theo’s first reel now shows one stationary throw into one robot, with a wider view of the robot riding away. Notifications such as RESET BANKED use a centered event banner with an entrance pop, character-colored streaks and fade-out. Repeated messages restart the animation; expiry and reduced-motion behavior were browser-checked.
