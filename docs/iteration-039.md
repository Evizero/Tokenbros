# Iteration 039 — Theo: automatic skating, physical defense, stronger kickflip

The user's revised direction makes the board's location and movement determine the kit. This supersedes the Ride/Grip modes in iteration 038.

- Start on foot holding the deck. Accelerating above 245 px/s mounts automatically, with a 220 ms hand-to-floor transition and body hop. Slowing below 135 px/s picks it up; separate thresholds avoid flicker. Holding melee keeps him on foot. Shift remains quiet movement.
- LMB on foot: alternating whole-body deck swings. Each connecting swing advances the combo; two hits earn the third-hit finisher. Damage 6/6/12, stronger directional launch on the finisher. A miss or 1.4 s pause breaks the chain. With no board, punches do 2 damage. Riding leaves left-click idle and uses the existing speed-dependent ram instead.
- E throws the board or recalls it if away. Nearby uplinks retain their E override. While the deck is away, movement uses 260 px/s running with prompt stopping and reversal; the original light-bot capture/crash remains. Returning boards phase through terrain, damage enemies once, and never transfer backward velocity into the rider.
- Q throws the same board broadside as physical cover. Bullets are absorbed using swept oriented collision; impact momentum shoves and rocks the deck. It obeys gravity and bounces, and contact deals 2 damage without capturing. The board protects teammates behind its actual position. No cooldown; it must be recovered before another throw. Friendly shots also shove it.
- Airborne Space kickflip launches Theo at -620 px/s (was -420). Releasing Space does not cut this impulse. The deck is kicked down with Theo's horizontal velocity, retaining the possibility of a forward landing catch. Ground jumps retain their usual variable height.
- Removed manual scroll controls and the old charged swing/parry indicators for Theo. Other characters' controls restore when selected. Updated all five selection previews; the melee reel demonstrates a real third-hit finisher. F remains unused.

## Validation

Production build, 34 unit checks, 22 Theo browser scenarios, all 32 character showcase reels and offline shared-world checks. Browser coverage includes automatic mount/pickup, combos, weaker punches, high-speed ram, physical shield interception and shove, contact/gravity, forward kickflip landing, responsive on-foot stopping/reversal and recall, massive-wall recall, ownership, death cleanup and HUD restoration. Visual inspection covers actual previews and a pose sheet; the board remains one object and limbs remain anatomically consistent.

Local changes only; not published.
