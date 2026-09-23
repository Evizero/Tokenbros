# Iteration 041 — Looking, roster and options polish

- Every bro follows vertical mouse aim with their eyes before tilting their head. A small neutral neck range keeps normal glances level; larger angles produce a restrained tilt capped at about 26 degrees, independent of the weapon. Pupils shift by at most one native pixel. Hair, glasses and the mage hat remain attached to the head, including Dimillian's pilot form. This is visual only.
- Theo's jab and hook reach less far; the cross still comes from his rear shoulder and swings in front of his torso. Bare-handed hit range follows the shorter punches.
- Theo's new portrait uses the roster's mature pixel-painted style and holds the skateboard high enough to remain visible in the selection card. See `research/theo-portrait-v2.md` for image-generation provenance.
- Removed operation labels, ready counts, field-test labels, redundant instructions beneath the roster, and the co-op marketing sentence. Options sits at the upper right. Deploy is centered, substantially wider, and uses the selected bro's color; co-op remains secondary.
- The gameplay reel gets a character-colored frame, atmospheric heading and control strip. Switching bros briefly settles the selected card, brings in the new heading and scene, and pulses Deploy. Reduced-motion preferences disable these transitions. Preview gameplay and its key demonstrations remain unchanged.
- Options now separates sound, screen shake and display into rows. Sound and screen shake expose their current state as accessible switches. Closing returns focus to the visible Options button.

Validation: production/Pages build, 34 unit checks, all 32 showcase clips across four viewport sizes, 12 shared-world co-op checks, Theo gameplay scenarios, and visual inspection of desktop/mobile roster/options plus the eight-form head-angle contact sheet. `scripts/render-head-aim.js` checks both facings at three elevations without leaking canvas transforms.
