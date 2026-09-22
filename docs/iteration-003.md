# Iteration 003: point, shoot, think, slap

2026-09-22. User-directed follow-up to the verticality/combat pass.

## User direction

- Mouse/trackpad aiming in all directions, independent of walking; backward movement while aiming.
- Trackpad taps fire. A scroll gesture chooses the model's thinking level, changing the shot and recovery.
- Defenses that reject weak shots; more interesting enemies and encounters.
- Enemy detection/reaction sounds, possible robotic speech, and laughter on killing the player.
- RESET should have a button toss and a giant hand slamming it, with delayed activation.
- F should replace K as the primary RESET binding. Add an interesting E action.

## Implemented decisions

Three thinking levels trade speed, per-shot force, penetration, and usage. LOW excels against unarmored targets; MEDIUM staggers and breaks shields in two frontal hits; HIGH penetrates with a much longer recovery. Switching mode preserves the existing recovery, so there is no free rapid-fire exploit. Empty usage retains the existing weak fallback.

Mouse aim controls facing and the weapon independently of movement. Pointer geometry accounts for canvas scaling and fullscreen letterboxing. One trackpad gesture advances one level, with a threshold and inertia latch. 1/2/3 and visible selector buttons provide deterministic alternatives. Pinch remains native browser zoom. Quick click taps survive falling between simulation ticks, and firing clears on pause, blur, death, cancellation, and pointer release.

F throws a button roughly 48px ahead. After a 660ms wind-up, a giant hand accelerates down into it. Impact triggers RESET's shockwave, unlimited firing burst, nearby turret hack, and uplink override. The slam originates at the button. Tibo can continue moving/aiming. It consumes its charge on toss and is canceled if Tibo dies before impact.

E is HOTFIX: a short-range aimed pulse with a 3.5-second cooldown. It interrupts a target, disables a shield temporarily, or turns a turret friendly. It complements the slower HIGH shot and gives low-thinking play another answer to armor.

Drones strafe and commit to a visible firing line before a three-shot fan. Gunners retreat briefly when hit. Heavy shots interrupt wind-ups. Shield bots advance behind shields that permanently block frontal LOW shots while intact; flanking, vertical fire, medium shield breaking, HIGH penetration, or HOTFIX provide counters. An early drone makes free aiming relevant before the tower climb.

Enemy lines are original fictional barks, not quotes from real people: HUMAN DETECTED, TARGET ACQUIRED, CATCH, ARMOR OFFLINE, DAMAGE DETECTED, REBOOTING, HA HA HA. Captions and synthesized electronic vocalizations always work; local installed English speech is used when available. Global/per-enemy cooldowns prevent a chorus, and muting/pause cancel speech.

## Technical references

- [MDN wheel event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event): trackpad wheel input, delta modes, cancellation, and Ctrl-modified zoom events.
- [MDN SpeechSynthesis.getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices): available system voices. Game selects a local English voice if one exists; it does not require an external speech provider.

This changes previous mouse-input scope cuts. See the project README for current controls and the original prototype brief for historical decisions.
