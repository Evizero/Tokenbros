# Iteration 021 — catch the other Tibo and recover hit tokens

User direction: catching the other Tibo before he disappears should immediately recharge E; his hits should send tokens flying back to the player, and catching him needs clear animation.

Touch the double after his leap or grab/throw has finished to collect him. Catching removes the double, immediately clears E’s cooldown, and allows another throw. A 250ms minimum age plus having moved away or completed a throw prevents immediate pickup at spawn. Contact uses a small forgiving margin and a line-of-sight check; solid terrain prevents catches through walls. Expiry and destruction keep the normal cooldown.

Catching plays a 320ms shrinking/spinning merge toward the player, an expanding ring, particles, a rising two-note sound, and “CAUGHT! · E READY” text. Landed, separated doubles advertise “CATCH ME!” once the throw bark has finished.

A successful grab/throw releases six bright token sparks from the struck robot. They curve back to the moving player over 380–655ms and each restore up to 10 tokens on arrival, respecting the 1,000-token cap. The player gets a local accumulated gain and miniature usage bar; the main meter glows during collection. Misses and friendly contact give no reward. Rewards travel independently of the double, so catching him does not discard tokens already earned. This adds no projectile damage or ammo cost.

Build and all 30 deterministic tests pass. `scripts/playtest-other-tibo-catch.js` covers catch/refund/rethrow, spawn immunity, expiry without refund, wall exclusion, flight before credit, moving-player homing, exact 60-token reward, cap-limited reward, no repeat/miss rewards, pause, and death/respawn cleanup. The existing Other Tibo leap/throw/bodyguard regression also passes. Zero page errors. Inspected `output/playwright/other-tibo-catch-v21.png` in an isolated browser session; the user’s game was not controlled.
