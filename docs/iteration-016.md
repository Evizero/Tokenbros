# Iteration 016 — refill feedback and quieter overlays

User direction: show the local token bar reloading when RESET lands, remove the scroll selector's top/left border accents, mute enemy cones and expose them on hover, and reduce Peter's terminals to one popup only on an enemy click. Follow-ups: refill animation should take longer even though tokens are usable immediately; terminal should use a real OpenClaw command, preferably onboard.

RESET instantly restores usable tokens at impact. The local readout reappears, fills from the previous balance over 1.35 seconds using smoothstep easing, then holds RELOADED briefly and fades (2.2 seconds total). A small highlight follows the leading edge. Firing during the animation still costs tokens, starts a new spending run, and the displayed bar converges to the actual remaining balance. Restart/respawn clears stale feedback.

Removed the two persistent top/left accent strips from the scroll selector; its existing category pulse and colored content remain. Enemy cones are hidden unless the pointer hovers on the robot body (with a small tolerance). Hovered cones use 2.5% fill and 6% outline alpha. Sensors and behavior are unchanged.

Peter displays just one terminal when the clicked point is directly on the selected enemy or boss. Clicking elsewhere still attacks/commands the hunting area without a terminal. Full-pack deployment, Molt, and uplink interactions no longer produce the command popup. Label: `> openclaw onboard`. The real command is documented in [OpenClaw's official CLI reference](https://docs.openclaw.ai/cli/onboard), checked 2026-09-22. It is flavor for the game's command animation, not an actual invocation. Width accommodates the text.

Build and isolated browser checks pass; details and screenshots in testing.md.
