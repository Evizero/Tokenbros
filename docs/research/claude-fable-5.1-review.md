# Claude Code Fable 5.1 — gameplay review

Requested by the user, completed 2026-09-22. Confirmed model from response metadata: `claude-fable-5-1`. Tools were disabled. This is a critique of [the pitch](claude-gameplay-pitch.md), not a hands-on playtest. The first sandboxed attempt could not access authentication; the authorized retry succeeded.

---

I'll write the critique directly from the pitch, with no build inspection.

**Bottom line:** the loop sounds fun, and it is fun for reasons that have nothing to do with the jokes. Run, shoot, blow up a barrel chain, panic-slam a big button. That is a real game. The risk is not that it's a meme slideshow. The risk is that RESET's three effects overlap with things the base kit already does, so it never feels necessary.

## Loop, strongest mechanic, decoration

The strongest mechanic is RESET as a physical panic button: knockback plus a guaranteed burst. That is readable, teachable in one use, and it produces the "I survived that" moment run-and-guns live on. The coolant barrel chain is the second best thing and costs almost nothing.

Decoration: the portrait swap, the refill-teammates rule, and the word USAGE. The reserve refill inside RESET is also decoration if the reserve recharges on its own and the fallback shot is usable. Players will not notice a refill they were about to get anyway.

## Three biggest risks

- **RESET has no job.** Rechargeable reserve, usable fallback, and a four-second infinite burst all push the player toward "hold fire forever." If firing never becomes unavailable, RESET's refill is meaningless, and the burst competes with sustained fire the Hose already provides. Fix: make the reserve drain feel real, roughly three to four seconds of full Hose before fallback, make the fallback noticeably worse in fire rate and pierce, and make RESET's burst qualitatively different, not just longer. Wider spray, pierce, or barrel-igniting shots. Charge RESET by damage dealt or kills, not only at checkpoints, so hoarding it for the boss is not the dominant strategy.

- **Selective destructibility breaks the promise.** Broforce works because everything crumbles and levels are thick enough that digging never strands you. "Most debris visual, selected objects physical" means players learn which walls matter by dying. Fix with a strict visual grammar. Physical objects share one palette and outline. Never let a mandatory route depend on a destructible object. Let the player dig through soft ground so a "ruined" route can be tunneled around.

- **Undecided death model changes what RESET is.** With one-hit deaths, RESET is a panic escape and knockback is its core. With health, RESET is a DPS burst and knockback is trivia. Decide before tuning anything else. Recommendation: three hits with brief invulnerability, because browser input latency and keyboard aiming punish one-hit deaths harder than the source game did.

Related: a shield/overheat boss rewards sustained DPS, which the Hose already does. Make the overheat window the intended RESET moment, with the boss visibly weakest exactly when the burst is active.

## Humor through play

The joke lands if the transformation is felt in mechanics, not shown in a cutscene. Sprite swaps mid-frame, animation gets snappier, a short bark, a big "USAGE RESET" stamp, then he reverts with a sag. No pause, no unskippable animation. Keep the joke about the button and the grin, not about hair or age. He becomes happier and more energetic, not younger. That is affectionate. Put the second half of the joke on enemies: rate limiters overheat and melt when he goes over the limit. Jokes that are consequences of actions are funnier than jokes that are text.

Honest caveat: this is more amusing on paper than in play only if the four-second window is tuned so it feels the same as regular fire. Then it's a costume change.

## Default control scheme

Keyboard, eight-way aim, no mouse by default. Confident principle: 360-degree mouse aim makes encounter design loose, because every enemy must be placed for any angle, and it desyncs the game from a future controller layout. Eight-way keeps turrets, cover, and the barrel chain tight and readable.

- Move and aim: WASD or arrows. Down while airborne fires downward.
- Jump: Space. Never up-to-jump, it collides with aiming up.
- Fire: J. RESET: K. Four actions total, no overload.
- Wall: wall-slide and wall-jump only. Cut climbing.
- Recoil: visual kick and muzzle flash only. Never push aim or player position, except a small backward nudge during RESET's burst, which reads as power.

Mouse aim and controller are opt-in later.

## What to cut from the first slice

Cut wall-climb, mouse aim, controller, co-op refill rules, and the scripted facility collapse. Replace the collapse with a countdown and a visible exit. Keep the barrel chain, the two-route choice, the rescue, and the boss only if the boss is a big turret reusing the existing turret behavior. If the boss needs new AI, it belongs in slice two. Ninety seconds is the right length to prove feel. Three enemy behaviors is right.

## Tuning hypotheses

These are starting points to test, not answers.

| Variable | Start | Range |
|---|---|---|
| Full Hose fire before fallback | 3.5 s | 2.5 to 5 s |
| Reserve recharge to full, not firing | 4 s | 3 to 6 s |
| Fallback fire rate vs Hose | 45% | 30 to 60% |
| RESET burst duration | 3 s | 2.5 to 4 s |
| RESET knockback radius | 3 tiles | 2 to 4 |
| RESET charges per mission | 2 | 1 to 3 |
| Coyote time | 90 ms | 60 to 120 |
| Jump buffer | 120 ms | 80 to 150 |
| Time to max run speed | 80 ms | 50 to 120 |
| Major-hit pause | 60 ms | 40 to 100 |
| Player hits to death | 3 | 1 to 3 |
| Post-hit invulnerability | 800 ms | 500 to 1000 |

## Playtest pass/fail

1. Does a first-time player use RESET before the boss without being told? Pass if most do.
2. When the reserve empties, do players stop firing, or keep firing the fallback? Pass if they keep firing but visibly want RESET.
3. Do players who miss every AI reference laugh or grin at the first RESET? Pass if the physical moment lands on its own.
4. Do players correctly predict which walls break before shooting them? Pass if wrong guesses are rare.
5. On death, do players retry within a few seconds without complaint? Pass if retries feel like the player's fault.

## Revised pitch

Tokenbros is a pixel run-and-gun where each bro's public persona is a combat verb. Tibo hoses tokens until his usage runs dry, then slams a giant RESET button that shoves enemies back, restores his grin, and lets him go over the limit for a few glorious seconds. Small heroes, big explosions, breakable cover, short missions, instant retries.

**Recap:** the loop is sound and the humor works if it stays physical. The real problems are RESET overlapping with the base kit, unclear destructibility, and an undecided death model. Decide the death model, give RESET a distinct burst shape, adopt a strict physical-object palette, and cut the collapse setpiece and wall-climb from the first slice.
