# Iteration 002 validation

2026-09-22. Automated browser input ran in a separate headless `tokenbros-qa` session so the user's visible browser remained theirs to play.

- `npm run build`: TypeScript and production Vite build pass.
- `npm test`: 10 passing tests covering fast collision, terrain destruction, reinforced floors, pits, independent uplink gates, tower landings, scrap settling/expiration, and debris count limits.
- Real keyboard playthrough completed the opening, ladder ascent, uplink 1, cable crossing, second combat court, uplink 2, two rescues, the boss, and extraction. Final state `won`, 15 bots scrapped, 126 blocks destroyed, 5 resets, 0 deaths, 1 health remaining. This establishes route connectivity and completion, not final difficulty balance.
- Visual checks: title, illustrated character entrance, tower RESET, cable traversal with shooting, second court, and completion screen at 1440×1000 browser viewport.
- The initial tower traversal test exposed unnecessarily tight mandatory jumps; ladders and wider landings resolved it. The final full route passed using these controls.
- Scrap uses ballistic rigid fragments with rotation, collision, bounce, and settling. It is not a full articulated skeletal ragdoll. Direction and launch strength come from the killing shot or explosion.
- Browser sound events execute without errors; perceptual audio balance still needs human playtesting.

The browser route driver is in `scripts/playtest-route.js`, intended for Playwright CLI `run-code`. Screenshots are local QA artifacts in `output/playwright/` (ignored by version control).

## Iteration 003 validation

- Production build and all **14** deterministic tests pass. New checks cover letterboxed mouse coordinates, trackpad inertia/reversal, shield counters, and thinking-level damage/recovery tradeoffs.
- Real browser input verified a quick tap fires once, held HIGH fire respects 850ms recovery, walking left can retain rightward mouse aim, scrolling selects levels without inertia skipping, changing levels preserves cooldown, and pause releases held fire.
- The F animation had no boost at 250ms and had struck/activated by 817ms. Visual captures confirm the tossed button, large hand, reticle, and thinking HUD.
- Isolated combat fixtures, operated with real mouse/keyboard input, verified LOW bouncing off intact armor, two MEDIUM shots removing the shield, HIGH penetrating it, E opening it to LOW shots, an upward mouse shot killing a drone, and the defeat-laughter reaction.
- Objective fixtures verified both uplinks stay closed before impact and open after the hand slam, including when aiming away while standing in the advertised activation zone. Death during wind-up cancels the pending slam.
- Test fixture access was injected only into the QA browser's module response; no writable gameplay/debug interface ships in the game.
- The experimental full-route mouse driver did not complete the mission reliably: it missed ladder approaches, dug into terrain with downward fire, and sometimes died while firing an empty weapon. Those attempts are not counted as successful end-to-end checks. The earlier iteration-002 completion is historical; current difficulty and free-aim traversal need human playtesting.
- Local spoken voice availability and perceived sound balance still depend on the actual browser/device. Electronic barks and caption state were exercised, but no claim of human auditory review is made.

Reproducible browser drivers: `scripts/playtest-controls.js`, `scripts/playtest-combat.js`, and `scripts/playtest-reset-objectives.js`. `scripts/playtest-mouse-route.js` is the experimental route driver described above.

## Iteration 004 validation

- Production build and 15 deterministic checks pass, including continuous scroll deltas and smooth tuning across category boundaries.
- Browser input: scroll moved 0→20%, small inertial samples continued to 30%, and a further scroll reached 50%/MEDIUM. Held-fire recovery, mode-switch cooldown preservation, backwards aiming, F/E, and pause release still pass.
- Slider keyboard input advanced by 0.1%; a pointer selection reached 43.2%/MEDIUM with 0.2894s recovery. The live slider/HUD was visually checked at this intermediate value.
- Source inspection confirms speech-synthesis calls and literal enemy dialogue have been removed. Robot effects are attenuated and panned in code; subjective audio balance remains for human listening.

## Iterations 005–006 validation

- 25 deterministic tests pass, adding view-cone boundaries, gradual turning, hearing/occlusion, non-omniscient memory, bounded searching, visual-contact priority, token costs, dry-fire, and free overdrive spending.
- Browser fixtures verified: standing and Shift-walking behind a guard stayed undetected; nearby running caused an investigation at the footstep position; front-facing sight progressed from suspicion to combat; a wall broke contact without updating to the hidden player's new location; an explosion caused investigation of the explosion location.
- Real click inputs spent 8 tokens on LOW and 72 on HIGH. Waiting did not regenerate tokens. An empty gun did not fire. F left the budget empty before impact and restored 1,000 at impact. A real 12.2-second wait restored one empty reset charge without refilling ammunition.
- Visual checks covered terrain-clipped perception cones, suspicion marker, token counter/drain, cost, remaining shots, and spend feedback. Fixtures are in `scripts/playtest-awareness-tokens.js` and use test-only module injection, not a shipped writable debug interface.

## Iteration 007 — compact HUD / escalation / physical abilities

- `npm run build`: passed (TypeScript + Vite).
- `npm test`: 25 passing checks; replaced the retired free-overdrive assumption with heavy-blast hearing coverage.
- `scripts/playtest-escalation.js`, isolated headless `tokenbros-qa`: passed. Fixtures cover an occluded guard ~980px from a blast, an out-of-range guard, a 2.4-second warning and exactly two drones per beacon, one response per beacon, ally investigation from confirmed visual contact, delayed F refill with local destruction, normal 8-token/95ms shooting immediately afterward, E shield stripping and wind-up cancellation, >50px physical pull, barrel activation, walls blocking the pull, short miss recovery, continuous wheel updates, and gauge dragging. No page errors.
- Normal uninstrumented controls smoke check: movement, held fire (10 shots), F (one reset), E, four seconds of simulation and alarm response; still playing with 24 live enemies and no page errors.
- Visual inspection: `output/playwright/escalation-v7.png` (HUD and warning beacons), `output/playwright/compact-v7.png` (800px viewport), `output/playwright/live-v7.png`. HUD containment check passed. User's visible browser was not controlled.
- This is feature/regression validation, not a new full-mission completion or a guarantee of balanced difficulty. The historical full-route pass belongs to iteration 002.

## Iteration 008 — Peter, ballistic RESET, and palette

- Production build and 27 deterministic tests pass. New reset physics tests cover long falls, wall collision, landing, and destroyed support.
- `scripts/playtest-peter.js` passes in isolated headless QA: thrown Crusher damages and strips armor; bounded four-pet swarm; six-claw reserve and regrowth; E orders; enemy bullets destroy pets; Crusher breaks route cover; claws hurt an exposed boss; timed Molt and melee kill; both Peter uplinks open their gates; Tibo's reset falls roughly 700px before arming, then refills and retains ordinary paid fire; character theme changes. Zero page errors.
- A normal uninstrumented Peter smoke run also exercised movement, held throw, E, and F. Screenshots checked entrance, base portrait, small sprite, companions, transformation, HUD and terminal effect.
- Visuals: `output/playwright/peter-title-v8.png`, `peter-intro-v8.png`, `peter-swarm-v8.png`, `peter-molt-v8.png`, `peter-compact-v8.png`. Neutral slate scene, coral Peter accent, compact HUD; narrow viewport inspected.
- External review came from `claude-fable-5-1` as requested. It critiqued the pitch, not gameplay. Raw response and adopted decisions are preserved in the Peter character bible.
- Bounds: companion movement is local steering/hopping, not full navigation of destructible platform networks. No new full-mission completion or human difficulty-balance claim. Browser fixtures were confined to the separate QA session; the user's visible browser was left alone.

## Iteration 009 — control swap / scroll feedback

- Build and all 27 deterministic tests pass.
- `scripts/playtest-controls-v9.js` uses actual mouse/keyboard/wheel events in isolated QA: click commands without consuming a claw, E tap throws exactly one, held E repeats within the four-pet cap, primary input does not alter throw recovery, Molt click punches and E still throws, Tibo primary still spends eight tokens. Continuous within-category scroll brings up feedback without a crossing pulse; category changes pulse; readout fades after 1.5 seconds. No page errors.
- Inspected `peter-scroll-v9.png` and `tibo-high-v9.png`: big type/role readout clear beside the character, large colored reticle shape, continuous gauge, no new permanent HUD panel. Reticle circle/diamond/square now persists after the temporary readout fades.

## Iteration 010 — persistent pack and held modes

Build and 27 deterministic tests pass. `scripts/playtest-pack-v10.js` passes: same four pet IDs after 20 seconds; full-pack deployment does not spend stock or replace pets; follow moving Peter; elevation catch-up; deployment does no impact damage; a commanded Pincher finishes its target then regroups; Crusher strips shields in close combat; pets die at zero health; click commands without spawning. No page errors. Visually inspected `tibo-weapon-2-v10.png`, `peter-weapon-2-v10.png`, and `persistent-pack-v10.png`; screenshots also cover the other held modes. Older v8 fixture assumptions about disposable impact pets are historical and superseded by this test.

A follow-up cover fixture caught Crusher hopping over destructible obstacles instead of crushing them. Ground movement now distinguishes breakable cover from climbable reinforced obstacles. Retest destroyed two crate blocks; a commanded Skipper reduced an exposed boss from 100 to 82 HP. Both regressions are included in the v10 browser script.

## Iteration 011 — Q parry / stationary Prism

Build and 30 deterministic tests pass. Three new geometry checks cover fast front crossings, rear/edge misses, vertical/diagonal aim, and reflected velocity. `scripts/playtest-defense.js` passes: Peter moves away while the stationary shield protects a companion; three-hit depletion; expiry; cooldown denial; rear/friendly behavior; early Tibo reflection hits its original shooter; late window absorbs; expired defense leaves player vulnerable; held Q does not repeat; death and respawn clear state. Zero page errors. HUD containment passes at 800px width. Screenshots: `peter-prism-v11.png`, `tibo-parry-v11.png`. These are targeted feature checks, not a new full-route run.

## Iteration 012 — hunting area and distinct pet attacks

Build and 30 deterministic tests pass. `scripts/playtest-pet-abilities.js` passes: area acquisition beyond the old near-Peter range; reacquisition after a target falls; Pincher visible fuse, consumed pet and bounded splash; Skipper charge, fixed 190px dash, one hit per enemy and wall interception; persistent Crusher armor-breaking melee; held claw attacks in normal form without spending stock/deploying, respects aim/cover and damages the exposed boss. `scripts/playtest-defense.js` still passes. Zero page errors. Inspected `pet-abilities-v12.png`. Earlier v10 Pincher survival/contact-damage assumptions are superseded by the user’s new attack designs; those checks are historical. These are feature fixtures, not a full mission run.

## Iterations 013–015 — pet combat, held primaries, token firing runs

Build and 30 deterministic tests pass. `playtest-pet-threats.js` verifies enemy target selection and actual shots at pets, cone/cover/dead/recall exclusions, contact grace and hostile blast damage, long red flight/autonomous detonation, Crusher horizontal/downward digging and reinforced-cover preservation, and boss pet targeting. `playtest-primary-feedback.js` verifies exact costs and failed-shot feedback, three held-crab attacks, red reflection direction/range/expiry/cover, blue projectile collision, gold armor break, command retention and Molt. The pet abilities and Q defense regression fixtures still pass (v12 primary expectations updated to red blast damage). `playtest-token-streak.js` checks actual held-input firing runs at low/high speeds, pause expiry, mixed costs, no dry-shot spend, and reset/respawn cleanup. Zero page errors. Screenshots inspected in `output/playwright/`: `tibo-spend-v14.png`, `tibo-empty-v14.png`, `peter-primary-0-v14.png`, `peter-primary-1-v14.png`, `tibo-token-streak-v15.png`. These are targeted feature fixtures, not full-mission balance tests.

## Iteration 016 — refill and quieter overlays

Build passes. `scripts/playtest-refill-feedback.js` checks the physical RESET impact starts the readout (not the throw), immediately restores spendable tokens, animates the nearby bar from the old balance, reaches RELOADED, expires, preserves paid firing and the new spending run during animation, and clears on respawn. The visual fill was slowed after user feedback to 1.35 seconds, with smoothstep easing and 2.2 seconds total display. Isolated render checks verify no cone without enemy hover and one cone at approximately 2.5% fill opacity on hover; the browser normalizes that alpha to 0.024. Empty-point commands show no terminal; clicking an enemy shows exactly one terminal. The label was then updated to the documented `openclaw onboard` command with a wider text-fitting terminal. Screenshots: `refill-selector-v16.png`, `openclaw-hover-v16.png`. User browser untouched.

## Iteration 017 — launch parity and heavier Crusher

Build and 30 deterministic tests pass. `playtest-pet-power.js` covers matching throws, fast first/normal subsequent blue charge, fixed dash/range/hit limits/cover, faster yellow movement, telegraphed slam, damage and shield stripping, actual sustained knockback, ordinary-bot kill, digging, and reinforced cover during windup. Updated `playtest-pet-abilities.js` and `playtest-pet-threats.js` pass against the new tuning. Zero page errors. Screenshot inspected: `crusher-slam-v17.png`.

## Iteration 018 — other Tibo

Build and 30 deterministic tests pass. `playtest-other-tibo.js` verifies E's independent aimed leap, grab/armor strip/throw and actual knockback travel, bounded range and wall collision, empty-space bodyguard placement, three-shot hostile blocking, friendly pass-through and vulnerability after break, expiry/cooldown, pause/death/respawn, and no token cost. Zero page errors. Inspected `other-tibo-v18.png`. The old yoink assertions in `playtest-escalation.js` are superseded; hearing/alarm behavior has not been changed here.

## Iteration 019 — same-wall climbing

Build and 30 deterministic tests pass. `playtest-wall-climb.js` verifies both characters on both wall sides, 55px/s slide, repeated same-wall height gain with only 3.2px maximum separation, release to fall, deliberate jump away, contact grace without stale air jumps, and respawn cleanup. Screenshot inspected: `wall-grip-v19.png`; hand remains on the wall while the weapon aims away. Zero page errors.

## Iteration 020 — held absorption shield

Build and 30 deterministic tests pass. Updated `playtest-defense.js` verifies four hits restore 96 tokens with no cooldown while held and 4.4 seconds on release; cap-limited gain adds only the actual recovered amount to cooldown; full-budget blocking uses the base cooldown; no reflected shooter damage; friendly/rear rejection; aim tracking; two-second timeout without held-key recast; pause release/frozen cooldown; and vulnerability after release. Existing Peter stationary protection, three-hit limit, expiry, cooldown, rear/friendly behavior, and lifecycle checks pass. Zero page errors, 800px HUD containment passes. Screenshot inspected: `tibo-absorb-v20.png`. Earlier Tibo parry expectations are superseded.

## Iteration 021 — catch and hit-token recovery

Build and 30 deterministic tests pass. `playtest-other-tibo-catch.js` checks contact catch and immediate rethrow, spawn immunity, normal cooldown on expiry, no catching through walls, six token flights before credit, homing to a moving player, exact 60-token recovery and cap, no repeated/miss rewards, pause and death/respawn cleanup. Existing `playtest-other-tibo.js` also passes. Zero page errors. Inspected `other-tibo-catch-v21.png`, showing the catch merge and incoming token stream. These are feature fixtures, not full-mission balance testing.

## Iterations 022–023 — Dimillian

Build and 30 deterministic tests pass. `playtest-dimillian.js` covers two connected sword slashes unlocking a finisher, miss handling, one hit per target, left/right launch vectors, attack recovery across transforms, fireball hold/release/full-charge explosion, unrestricted ascent/hover/descent and wall collision, shared shield HP with partial reuse and full-break lock, centred mage bubble/ally protection, directional ship rear exposure, stationary bunker restrictions with working Remote, form-specific E and F, shared cooldowns, uplinks and lifecycle. `playtest-dimillian-effects.js` verifies an actual moving robot is hit through all three sword steps and thrown across the scene. `playtest-dimillian-ui.js` checks real input events, generated portrait load, three roster options/cycle, and 800px layout. Zero reported page errors. Inspected `dimillian-*-v22.png` form/title/intro captures and the final `dimillian-bunker-v23.png`, `dimillian-bubble-v23.png`, `dimillian-deflector-v23.png`, `dimillian-fireball-sheep-v23.png`. Existing defense, Other Tibo catch, wall climbing and pet-power browser regressions passed during integration. Feature checks only; no full mission balance claim.

## Iteration 024 — shorter full-body sword and reflection

Build and 30 deterministic tests pass. `playtest-dimillian-sword.js` verifies two-hit breakable cover, one damage application per tile per slash, enemy/reflect occlusion, reinforced survival, floor preservation with intentional downward digging, active-sweep reflection both directions and actual returned damage, plus windup/recovery/rear/out-of-range rejection. Existing `playtest-dimillian.js` and live-physics `playtest-dimillian-effects.js` pass. Live combo still connects 0/1/2 for 10.5 damage, ending at x322/y744. Zero page errors. Inspected the enlarged windup/cut/follow-through/recovery sheet at `dimillian-sword-poses-v24.png` in the isolated QA browser.

## Iteration 025 — roster overview

Production build passes. `playtest-roster.js` exercises all three selections/deployments, image loading, return via Switch Bro, selected-state retention, arrow wrap, Space selection, End and Enter deployment, and layout containment at desktop, 800px, 390px and short desktop sizes. Updated `playtest-dimillian-ui.js` passes existing actual gameplay controls through the new pause→roster flow. Zero page errors. Inspected `roster-desktop-v25.png` and `roster-390-v25.png`. Isolated QA browser only.

## Iteration 026 — real combat showcases

Build and 30 deterministic tests pass. `playtest-showcase.js` covers nine staged fights using real combat code, positive enemy damage in every clip, isolated owner state, silent preview with no audio context, three ready plus three disabled slots, manual chapters and automatic cycling, pause, reduced motion, disposal on Deploy and recreation via Switch Bro, and 1440px/1280px/800px/390px layouts. Existing roster and Dimillian input fixtures pass. Zero page errors. Final action and flight framing visually inspected in `roster-showcase-*-v26.png`. The demos use invulnerable staged heroes and are not gameplay balance tests.

## Iteration 027 — situational speech bubbles

Build and 30 deterministic tests pass. `playtest-hero-barks.js` verifies spawn variants for all three heroes, global/per-event limits, variant rotation, death priority and deferred respawn, paused timing, real signature-ability hooks, multikill/low-health triggers, once-only tower line, boss/uplink/rescue/victory, roster cleanup and preview isolation. Zero page errors. Inspected `hero-bubble-tibo-v27.png` and `hero-bubble-dimillian-v27.png`; Peter capture also saved. Speech bubbles only; no voice assets or TTS were added.

## Iteration 028 — balloons and scenery signs

Build passes. Existing hero-dialogue fixture passes after the balloon-only rendering change, with updated `hero-bubble-*-v28.png` captures. `playtest-world-signs.js` captures four map regions with no page errors; opening, tower and cable visuals inspected. World signs remain scenery, and tutorial signs remain hidden in character showcases. No collision changes.


## Iteration 029 — Pidalf and physical manipulation

Production build and 30 deterministic tests pass. `playtest-pidalf.js` checks traveling shockwaves, aiming beyond a bot, armor stripping, cover blocking, force lift/yank velocity and hold limits, low/high compaction, scrap reuse and collision damage, cinematic staff repulsion and projectile reflection, lifecycle and uplinks. Barrel checks verify target feedback, safe lift, throwing momentum, hard-impact detonation and a burning fuse continuing while held. Portrait corner alpha is zero. All 12 character-showcase clips pass with isolated state and responsive layouts; no page errors. Roster and speech-bubble regressions passed during integration. The updated bidirectional pose strip confirms the light shirt facing the cursor and the reaching arm layered behind the chest. Screenshots are in `output/playwright/pidalf-*-v29.png`. These checks cover mechanics and visual presentation, not full-mission balance.


### Pidalf follow-up — scale, targeting and loose objects

Browser checks pass for continuous shockwave speed (small waves over 2.8 times faster than large), grabbing through cover while preserving physical wall collision, direct-target small compaction, empty-position large compaction and late-arriving targets, cover exclusion and separate E/F targeting feedback. Shockwave and staff-slam dialogue use normal bubble events, cooldowns and variant rotation; dedicated SLOP and YOU SHALL NOT PASS captions are removed. Grenade checks cover grab/move/throw with a live fuse and shockwave deflection without fuse reset. Crates detach from real terrain tiles and receive momentum from E, the traveling wave and Q. Existing barrel, scrap, combat showcase and dialogue checks remain in the regression pass.


The E + click combo is checked against a bot behind cover: failed compaction preserves the grab, lifting it into sight permits compaction, the resulting scrap stays held, and a yank/release throws it. Releasing E or pausing during the squeeze prevents automatic reacquisition.


Compaction sprite animation and levitation presentation were visually checked in `pidalf-pose-strip-v29.png`, `pidalf-levitation-v29.png` and `pidalf-squeeze-v29.png`. The pose strip includes reach, draw-back, squeeze, fist, crunch and recovery. The existing Pidalf mechanic fixture still passes after the rendering change.

## Iteration 030 — layered level and encounter pacing

Production build and 31 deterministic tests pass. `playtest-level.js` checks all 36 enemy and 30 barrel starting positions, ladder exits, all twelve reinforcement entrances, warning-before-spawn, finite waves (6/6/3/6 bots across the four sectors), nearby-enemy pressure gating, one-use resupply/checkpoint persistence and stable uplink anchors after demolition. `check-level-routes.mjs` finds routes to both uplinks and the boss with normal breakables cleared and with all breakable terrain removed, using the actual movement integrator for jump/fall edges. This is traversal coverage, not a complete player-controlled mission run.

All twelve showcases plus Pidalf, Dimillian, pet-power, Other Tibo catch and both-defense browser fixtures pass. `playtest-level-combat.js` runs 15 seconds of live physics/AI for each hero in the new loading yard with invulnerability: all engage and destroy terrain, no page errors or invalid coordinates. Screenshots of each sector and all four combat runs are in `output/playwright/level-*-v30.png`; loading yard, tower, demolition and final combat captures were inspected. Difficulty and subjective fun remain a player-feedback question.

## Iteration 031 — Marcus

Production build and 31 deterministic tests pass. The new `playtest-marcus.js` browser fixture checks per-leg damage and catches, occlusion/ricochet/recovery at steel, Mirror stock and locked launch mode, Zoom breakables and armor, dodge movement/protection/cooldown, Batch echoes/cooldown, ammunition cap, death and respawn, plus real click, scroll and keyboard dispatch. All fifteen roster clips and three responsive widths pass. The 15-second live-combat fixture now covers all five heroes without page errors; Marcus recorded 15 kills and 71 broken blocks in the invulnerable run. These are integration results, not a balance benchmark. Final roster, entrance, controlled combat and level combat screenshots were visually inspected. See [iteration 031](iteration-031.md).

## Iteration 032 — Invader

Build and 31 deterministic tests pass. `playtest-invader.js` checks 1/3/6-bomb charge tiers, finite detonation counts, returns and stock recovery, early recall, a single active bomber while disc fire remains available, solid ceilings, pause/mode/dodge/death cancellation, Batch's eight-bomb cap and actual mouse hold/release input. The Marcus regression fixture now tests bombing cover/armor instead of the removed heavy disc. All 15 roster previews still produce combat outcomes and pass layout/lifecycle checks. Charge/pass/impact screenshots were inspected. See [iteration 032](iteration-032.md) for mechanics and subjective playtest questions.

## Iteration 033 — LCD

Build and all 31 deterministic tests pass. `playtest-lcd.js` covers charge/release, range, temporary protection, one aerial launch, once-per-enemy hits, shield knockback, steel collision/occlusion, breakable crates, upward traversal, midair windup freeze and discrete jump positions, Q/pause/mode/death cleanup and landing recovery. It also exercises the production input/movement path. Rotate and Invader browser fixtures and all fifteen showcase clips pass. New screenshots cover the charge and successful kick with the user's rounded silhouette direction. See [iteration 033](iteration-033.md).

## Iteration 034 — Pac-Man

Build and all 31 deterministic tests pass. The new Pac-Man browser fixture verifies a directed four-bite chain across elevations, one-shot input, no automatic chaining or repeat damage, correctly deferred timing bonus, armor, terrain blocking, target loss, recall, shared stock and lifecycle cleanup. Rotate, LCD and Invader fixtures pass. All 16 live roster clips pass with responsive layout at 1280, 800 and 390px; Marcus's four tabs use two rows on narrow screens. Chain and finisher screenshots were visually reviewed. User played the new mode and reported “ok feels great.”

## GitHub Pages deployment

`npm run build:pages` and all 31 deterministic tests pass. `scripts/playtest-pages.js` exercises the compiled game, with no development-only imports: all five roster portraits and entrances load under `/Tokenbros/`, each character reaches gameplay, and Marcus can select Pac-Man with 4. The local production preview passed with no page errors or failed site requests.
