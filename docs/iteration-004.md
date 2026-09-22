# Iteration 004: continuous thinking, understated robot effects

2026-09-22. User explicitly changed direction on speech and scroll behavior.

- Removed speech synthesis entirely and removed the literal dialogue bubbles. Detection, damage, blocking, attack, and defeat still trigger short nonverbal effects.
- Robot reactions use quieter triangle/sine chirps, descending glitches, and short electronic chuckles. Gain falls with distance, stereo position follows the visible source, and existing cooldowns limit repetition. Weapon/impact effects retain their existing mix.
- Thinking is a continuous 0–100% value. Every wheel delta contributes; there is no gesture latch or detent. Up increases intensity, down decreases it, and inertial tails keep moving it naturally. The full range corresponds to 600 normalized vertical scroll pixels.
- Added a directly draggable, keyboard-accessible slider, live percentage, live recovery readout, and continuously changing reticle/shot color. 1/2/3 and the labeled buttons remain 0/50/100 presets.
- Damage, recovery, and usage cost interpolate continuously. LOW/MEDIUM/HIGH label thirds of the range; penetration and shield-breaking behavior still follow those categories. Changing intensity does not reset a cooldown already in progress.

This supersedes iteration 003's one-step-per-gesture rule, dialogue captions, and local speech support. Earlier notes are preserved as design history.
