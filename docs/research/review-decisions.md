# Decisions after Fable 5.1 critique

2026-09-22. Full response: [Claude review](claude-fable-5.1-review.md). Actual model verified in response metadata: claude-fable-5-1. This was the user's requested external consultation, not a second hands-on playtest.

Adopt for the first prototype:

- Three hits to death with approximately 800ms invulnerability. Fast checkpoint retry.
- Keyboard eight-way aiming, Space jump, J fire, K RESET; arrows/WASD move/aim. No up-to-jump conflict.
- Wall slide/jump only; no separate climb input.
- USAGE depletion in roughly 3–4 seconds of full fire, fallback noticeably slower, recharge while not shooting.
- RESET has a qualitatively distinct wide/piercing burst, not just a resource refill. About three seconds initially.
- Consistent breakable-cover versus reinforced-platform appearance.
- One large turret boss built from the normal projectile/telegraph system; no elaborate scripted collapse in slice one.
- Preserve local keyboard play first. Mouse aiming, controller, co-op are deferred.

Adapt rather than adopt literally:

- RESET remains a separate charge, never restored by RESET itself. Refills at rescues/checkpoints plus a charge earned after a small number of kills encourage using it during the level. Display progress so replenishment is predictable.
- Cosmetic hair/portrait transformation is retained because the user explicitly requested the before/after meme. Keep it affectionate, exaggerated, and instant, with no health claims or control penalties.
- Destruction is meaningful but selected structural platforms remain indestructible. Their contrasting material/stripe language must make that obvious. This is a scope choice requiring playtesting, not a claim of full Broforce simulation.

Watch during playtests:

1. Does someone press RESET before the boss?
2. Does empty USAGE produce a useful tactical choice rather than boredom?
3. Is the reset satisfying without knowing the meme?
4. Can someone predict which surfaces break?
5. Are deaths understandable and retries immediate?

Tuning values are hypotheses. No review alone proves the game is fun.
