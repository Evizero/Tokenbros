# Iterations 005–006: awareness and finite tokens

2026-09-22. Both requests were implemented together; the ammo idea extends rather than replaces the perception work.

## Enemy senses

User direction: facing-based vision, blind rear approaches, sensible hearing ranges, and limited investigation.

- Ordinary guards: 360px sight, about 105° total cone. Drones: 420px / 120°. Turrets: 440px / 80°. Terrain occludes both actual visibility and the drawn cone.
- Turning has a finite rate; looking does not automatically follow an unseen player. A roughly 320ms sight confirmation fills the suspicion meter. `?` shows investigation/search, `!` shows combat; no dialogue bubbles return.
- Hearing radii: running footsteps 90px, hard landings 140px, hotfix 160px, LOW/MEDIUM/HIGH shots 330/430/570px, enemy gunfire 260px, ordinary explosions 650px, large explosions 850px, RESET 780px. Occlusion reduces effective range to 55%.
- Shift quiet-walks at 90px/s and suppresses footsteps, compared with normal 235px/s. Shooting and landing remain audible.
- Noise stores a location and begins investigation. It does not identify the player as a firing target. Losing sight preserves the last observation rather than reading the player's current position. Memory expires after four seconds; a short search then returns to patrol. Fresh visual contact takes priority over unrelated sounds.
- Ground movement investigates locally, respecting walls and ledges; drones can investigate in two dimensions; turrets rotate in place. There is no full cross-platform pursuit pathfinding. Committed shots use their stored target point. The boss retains its arena encounter logic.

## Token budget

User direction: two parallel limits—existing shot cooldown and a visible finite ammo-like usage budget restored by Tibo's reset.

- Capacity: 1,000 fictional gameplay tokens. This does not invoke an AI service or consume real account credits.
- Continuous thinking still controls damage and shot cooldown. Token costs interpolate between 8 / 28 / 72 at the 0% / 50% / 100% presets, rounded up to whole tokens.
- Tokens do not regenerate while idle. The weak infinite fallback has been removed. If the current shot is unaffordable, the gun dry-clicks; a lower thinking setting may still be affordable.
- F consumes a reset charge on toss and restores the token budget only when the hand impacts. The existing 3.2-second overdrive then fires for free. Rescues and checkpoint respawns restock for mission recovery.
- To prevent a permanent resource deadlock, empty reset charges recover to one after 12 seconds of active play. This restores the reset ability only; the player still presses F to refill tokens. Kill-earned charges, rescue refills, and objective-supplied charges remain.
- The top-right HUD now emphasizes remaining/capacity, an immediate drain bar with a trailing spent segment, per-shot cost, affordable shot count, and a small spend flash. The separate thinking control still displays shot recovery.

Earlier documentation describing passive token regeneration, an infinite fallback, omnidirectional enemy detection, or immediate player tracking is historical.
