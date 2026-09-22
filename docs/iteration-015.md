# Iteration 015 — tokens-burned firing run

User likes the local spend readout and wants the number to stack while firing, then start fresh after a short pause, like a score counter.

Each successful Tibo shot adds its actual paid token cost to the current firing run. The headline shows the accumulated negative total; a smaller line shows shot count and latest cost per shot. Each shot bumps the readout and long runs grow it slightly. The usage strip and main HUD still show actual budget. This is feedback, with no invented damage multiplier or bonus reward.

The run expires after max(700ms, the previous shot's cooldown + 300ms) without another shot. Thus held high-thinking fire remains one run despite its 850ms firing interval. Mode changes add their actual costs. Dry fire does not count and ends the run; reset, respawn, and a new mission clear it.

Build passes. Isolated `scripts/playtest-token-streak.js` passes held rapid fire (80 tokens), held high fire (288 tokens), pause/restart at both speeds, mixed costs (8 + 72 = 80), dry attempts, reset and respawn cleanup. Screenshot inspected: `output/playwright/tibo-token-streak-v15.png`. No user-browser automation.
