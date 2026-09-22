# TOKENBROS

[Play in your browser](https://evizero.github.io/Tokenbros/)

A playable browser run-and-gun prototype starring Tibo, Peter Steinberger, Dimillian, Pidalf and Marcus Bloice. Climb the Rate-Limit Refinery, override its uplinks, cross by cable, rescue developers, and take out the Rate Limiter.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` validates TypeScript and creates `dist/`. `npm run preview` serves the production build. `npm test` runs collision and destructibility tests (Node 22.6+).

## The refinery

Four connected combat spaces lead to the boss: a stacked loading yard, a tower with two climbing routes, a cable landing with a lower service route, and a demolition pit with high flanks. Warm marked decking breaks; reinforced steel keeps the core routes usable. Explosions can drop fights to a lower floor.

There are 36 placed enemies, 30 barrels, seven finite reinforcement groups, and four single-use field kits that resupply and save checkpoints. Reinforcements have visible warnings and staggered arrivals, with a nearby-enemy cap. See [iteration 030](docs/iteration-030.md).

## Choose your bro

The game starts with a portrait grid for **Tibo**, **Peter**, **Dimillian** (initially selected), **Pidalf**, and **Marcus**. One additional slot is reserved for a future bro. Pick a character to watch a live combat showcase of their actual abilities, choose any of its three clips, or pause it; then **Deploy**. The silent preview uses separate game state and starts paused when reduced motion is preferred. Escape → **Switch Bro** returns to the grid; deployment starts a fresh mission. Arrow keys navigate, and Space/Enter activate the focused button. Each has an entrance portrait and a distinct pixel sprite. Peter uses coral red, Tibo lime, Dimillian purple, Pidalf amber, and Marcus cyan over a neutral slate/steel refinery.

## Marcus — the Augmentor

- **Click / hold:** pull and release the slingshot. Rotate uses three reusable disc slots; catches restore stock, and stranded discs time out so ammunition cannot be lost forever.
- **Scroll / 1, 2, 3, 4:** Rotate fires a spinning Game Boy-style cartridge with the same ricochet and return behavior; LCD turns Marcus into a flat handheld-game silhouette: hold to wind up, aim, and release to launch himself; Zoom now charges a growing arcade invader: hold click, then release for a bombing run. Charges carry 1 / 3 / 6 bombs; a full charge takes 1.35 seconds. Bigger craft fly more slowly. Rotate retains its launch mode in flight. Pac-Man seeks a bot near your aim; click another bot during each chomp to chain up to four bites, ending in a heavy crunch.
- **E — Recall:** curve airborne discs back toward Marcus. Reposition to hit exposed flanks on the return. Each disc can hit a bot once per outward/return leg; steel still blocks it. E also recalls the bomber early and cancels undropped bombs. E beside an uplink overrides it.
- **Q — Flip:** directional evasive tumble, using movement input or facing. A 0.3-second roll with roughly 0.245 seconds of protection and a 1.45-second activation cooldown. Walls still stop it.
- **F — Batch Augment:** 4.5 seconds of four weaker echo discs per launch; 16 seconds between activations. Echoes do not refund ammunition or become pets. A bomber launched during Batch carries two extra bombs, up to eight.

Full-body pullback, recoil and catches, distinct weapon silhouettes, spinning trails, a hit streak, cyan HUD, contextual speech bubbles and three live previews. The bomber occupies one stock slot, allowing Rotate fire or an LCD launch while it flies. Only one bomber can be active. It retraces its route and shrinks into Marcus’s hand; solid ceilings and walls stop it. LCD movement advances in crisp steps; holding attack arrests a fall while you aim. LCD has a 0.65s recovery and needs a landing before the next launch; strong launches breach crates and fling robots, while steel stops the body. See [iteration 033](docs/iteration-033.md) and [iteration 034](docs/iteration-034.md).

## Pidalf — the Slop Slayer

- **Click:** backhand a traveling shockwave through robots; small waves travel much faster; larger influence makes them slower, wider and able to hit more targets. Cover stops it, and heavy armor takes a stripping hit first.
- **Hold E:** grab bots, barrels, live grenades, crates or compacted scrap at the cursor—even through cover, drag them through the air, then release to throw with momentum.
- **While holding E, click:** compact the held bot(s), keep the resulting scrap suspended, then release E to throw. Pull targets into view first.
- **F:** aim directly at a bot to compact it into a cube at low scale; at larger scale, place a black hole in visible space to gather bots into a rolling scrap ball. Compaction requires line of sight. Grab and throw the result, or shatter it with SLOP.
- **Q:** raise and slam the π staff to repel nearby bots, scrap and projectiles. Reflected bullets become friendly; cover blocks the burst.
- **Scroll:** continuously scale influence and mass capacity, with heavier actions taking longer to recover.

See [iteration 029](docs/iteration-029.md) for details and [portrait provenance](docs/research/pidalf-image-generation.md).

## Peter — the Clawfather

- **E:** throw/deploy a lobster companion. All three types use the same long ballistic throw. They hunt locally near their landing; red behaves like a smart grenade, blue can interrupt its flight with its opening dash, and gold lands before brawling. A pack holds four pets; deploying when full preserves the existing pack. Six recruits in reserve, one regrows every 1.3 seconds. Deployment itself does no damage.
- **Scroll / 1, 2, 3:** red **Pincher** seeks a target, primes for 160ms, then sacrifices itself in a small explosion; cyan **Skipper** charges for just 100ms on its first dash (450ms afterward) and launches a straight 190px dash, then repositions; gold **Crusher** runs at 190px/s, digs through breakable cover, and winds up a heavy 6-damage slam that strips shields and sends surviving robots flying. Its 140ms windup, claw swing, sparks, impact pause and 800ms recovery make the hit readable. Peter visibly holds the selected type before deployment.
- **Left click — Attack / Command:** use the held claw’s attack and mark an enemy or hunting area for the pack. Red fires a short blast with a 100ms incoming-bullet deflection window (550ms recovery); blue shoots a small cyan projectile (220ms recovery); gold delivers an armor-breaking melee hit (420ms recovery). These attacks do not consume recruits. Pets seek visible enemies within 160px of the point for eight seconds, acquiring another when their target falls. Click near Peter to regroup. They also defend him against nearby visible threats. E beside an uplink overrides instead of deploying. Direct enemy clicks briefly show one `> openclaw onboard` terminal; ground/area clicks show no terminal.
- Pets follow Peter between fights, have health bars, and draw enemy fire. Guards choose visible Peter/pet targets using their cones and cover checks, keeping a target until a substantially closer one appears. Enemy bullets, contact, and grenades can hurt pets. The boss can also aim at a closer visible pet. They do not expire on a timer; only the Pincher’s attack consumes it. A visible recall bubble brings companions back if terrain or elevation leaves them stranded. The rainbow motif is now Peter’s deployed Q shield.
- **F — Molt:** tear the shirt and enter five seconds of exaggerated muscular melee. Click becomes a short aimed lunge/punch that breaks armor and cover. Existing pets keep fighting, and E can still throw more claws during Molt. Sixteen seconds between activations, including the active five seconds; ordinary claws remain available afterward.

The ripped form is a fictional action-game exaggeration from the user's reference photo. Peter's normal form keeps a blue shirt, glasses, short undercut, and beard. No conventional gun.

## Shared controls and Tibo kit

| Action | Controls |
| --- | --- |
| Move / climb ladders | WASD or arrow keys |
| Quiet walk | Hold Shift while moving |
| Aim independently of movement | Mouse / trackpad pointer, all directions |
| Fire | Left click / trackpad tap; hold to repeat |
| Thinking intensity | Continuous two-finger scroll, draggable slider; 1/2/3 are presets |
| Jump / wall jump | Space (release early for a shorter jump); hold toward the wall and tap Space to climb |
| Grab cable | W or ↑ near the cable |
| HARD RESET | F — toss button, then giant-hand slam |
| OTHER TIBO | E — throw the brawler; catch him to recharge; hits return tokens |
| Defend | Hold Q — Tibo token absorption / press Q — Peter deployed Prism |
| Pause | Escape |

Holding toward a wall grips it and limits sliding to 55px/s. The free hand and braced foot show contact even while aiming away. Repeated Space presses while holding toward the wall climb that same wall with only a small outward push; pressing away gives a stronger jump off. Release the direction to fall normally. A short wall-contact grace period makes the timing forgiving.

Scroll up increases thinking; scroll down decreases it. Every scroll sample changes the 0–100% intensity, including small movements and the inertial tail. The compact HUD gauge and reticle color update continuously; recovery is shown around the crosshair. Scrolling also brings up a large temporary arcade readout beside the character: an exact continuous gauge, category icon and role. Crossing categories changes the cursor outline from circle to diamond to square, with a short pulse and distinct tone. It fades 1.5 seconds after the last change. Peter uses the same feedback for claw types. Pinch zoom retains its browser behavior. Aim follows the cursor even while moving backward. Quick taps are buffered briefly; holding fire repeats at the current shot's recovery rate. Changing thinking does not cancel a recovery already in progress.

Keyboard-only fallback remains available: J fires using directional keyboard aim when the pointer is outside the canvas; K is a legacy alias for F. Touch buttons remain a basic fallback. Desktop mouse/trackpad + keyboard is the intended playtest target. Gamepad and multiplayer are deferred.

## Thinking and abilities

Damage, usage cost, and recovery interpolate smoothly across the whole range. LOW/MEDIUM/HIGH mark thirds of the range and select the shot behavior (shield breaking and penetration). The numbers below are the 0%, 50%, and 100% presets. Changing intensity preserves the current shot recovery. Tibo visibly equips a compact SMG, a forked pulse weapon, or a long twin-rail gun to match the tier.

| Thinking | Shot | Damage | Recovery | Role |
| --- | --- | --- | --- | --- |
| LOW | Token SMG | 1 | 95 ms | Fast unarmored targets; flank shields |
| MEDIUM | Reasoning pulse | 3 | 320 ms | Stagger enemies; two frontal hits break a shield |
| HIGH | Deep-think rail | 8 | 850 ms | Pierce armor and several aligned targets |

Tibo has a finite **1,000-token budget**, separate from firing cooldown. The 0/50/100% thinking presets cost **8/28/72 tokens per shot**; intermediate costs are interpolated and rounded up to whole tokens. The HUD shows tokens remaining, spend feedback, and shots affordable at the current setting. A small readout beside Tibo stacks the tokens burned during a continuous firing run, with shot count and latest per-shot cost beneath it. Each shot bumps the counter. A pause starts a fresh run; the grace period accounts for slower high-thinking shots. Dry attempts do not count. A local empty/insufficient-token warning, rattling empty magazine, and mechanical click make failed shots visible. Reset and respawn clear the counter. Waiting or releasing fire does not refill tokens. An unaffordable shot does not fire; lower thinking if enough tokens remain, or press F to reset. Every shot costs tokens, including immediately after RESET.

F restores all 1,000 tokens on impact. The local bar pops up and visibly refills over 1.35 seconds, briefly shows RELOADED, then fades; tokens are usable immediately and firing during the animation still spends them. Rescues and checkpoint respawns also restock. When reset charges are empty, one charge recovers after 12 seconds of active play; this recovers the ability, not ammo.

F consumes a charge and tosses a physical button ahead. The button follows an aimed ballistic arc with gravity and terrain collision, continuing down ledges until it lands. A huge pixel hand slams it 400ms after landing; a local 110px explosion, refill, and uplink overrides happen on impact. Movement and aiming continue during the wind-up. Dying before impact cancels the slam.

**E — OTHER TIBO:** summon the happier profile-picture double, who leaps up to 360px toward the cursor. On contact he grabs one robot, strips its shield, interrupts its attack, and hurls it onward for 3 damage. Flung robots can collide with other robots or trigger barrels. The double stays briefly where he lands and physically absorbs up to three hostile shots; friendly fire passes through. He lasts 1.8 seconds, costs no tokens, and has a 4.5-second cooldown. Catch him by touching him after landing or a completed throw, before he disappears, to immediately recharge E. He spins back into Tibo with a ring burst and “CAUGHT! · E READY” feedback. Each successful grab/throw releases six homing token sparks worth 10 tokens each; tokens become available as the sparks arrive, capped at 1,000. The local gain/bar and HUD meter glow confirm collection. Misses give no tokens, and expiry does not refund the cooldown. Solid terrain stops the leap. His short comic-text bark is ‘YOU GET RESET!’; no spoken narration.

## Q defenses

**Tibo — Absorb:** hold Q for up to two seconds to catch incoming shots in the aimed direction. The shield follows Tibo and tracks the mouse. Each blocked shot restores up to 24 tokens, capped at the 1,000-token budget. Releasing Q or reaching the hold limit starts a two-second cooldown plus 0.025 seconds per token actually recovered: four absorbed shots restore 96 tokens and produce a 4.4-second cooldown. The shield displays recovered tokens, the resulting cooldown, and remaining hold time. At full budget it still blocks, but adds no tokens or extra cooldown. Holding through expiry never automatically recasts it.

**Peter — Prism:** deploy a small rainbow barrier up to 60px ahead along the aim direction. Its position and angle remain fixed in world space. Peter can leave it; any companions behind that same barrier benefit from intercepted shots. It lasts 1.8 seconds or three hits, with a 6.5-second cooldown. Friendly shots pass through. Both defenses cover a limited front-facing span: flanks, contact damage, and explosions remain threats.

Q readiness/cooldown sits alongside E and F in the HUD. Death removes the active defense; respawning restores readiness. The rainbow is confined to the barrier, replacing the earlier terminal-closing glint.

## Enemy awareness

Guards have terrain-clipped sight cones and a short spotting delay. The cones are hidden during normal play; hovering on an enemy reveals only its cone, very faintly. Their facing follows patrols and observations rather than the player's hidden location. Hearing is separate: running has a short radius, guns are louder, and explosions/RESET travel farther. Ordinary explosions carry 1,300px, large blasts including RESET carry 1,600px; cover retains 80% of blast range versus 55% for quieter sounds. Blast investigations persist for up to eight seconds. A guard with confirmed visual contact alerts allies within 340px to investigate that last-seen point. Hold Shift for quiet movement; hard landings still make noise.

A sound triggers investigation of its location, not instant combat. Enemies retain the last seen/heard point, search briefly after losing contact, then return to patrol. A committed shot can finish toward its old aiming point. Ground bots do not pathfind across the entire platform network; they stop at walls/ledges and search. Drones investigate in two dimensions; turrets turn but stay in place. The final boss retains its dedicated arena behavior.

## The prototype

- Original pixel-art rendering, layered industrial scenery, generated likeness-based character portraits, and an animated, skippable character reveal.
- A vertical uplink tower with ladders and wall jumps, an aerial cable crossing, and a second combat court with multiple elevations.
- Mixed patrols guard several floors and the crossings. Gunners fire a narrow two-shot fan with faster projectiles. Shield bots advance behind armor. Drones strafe, stop to telegraph a locked firing line, then fire a three-shot fan. Damaged gunners retreat; heavier hits interrupt wind-ups. Grenadiers lob over cover; runners rush.
- Enemy reactions use short, quiet robot chirps, glitches, and electronic chuckles. They pan with the source and fade with distance. Spoken dialogue and narrative text bubbles have been removed.
- Directional dismemberment: rotating robot torsos, heads, limbs, armor, and spent casings bounce off terrain. Oil pools, sparks, hit flashes, short impact pauses, and layered synthesized sounds sell the hits. Fragments have bounded lifetimes and counts.
- Warm marked crates and earth break; ribbed reinforced metal remains solid.
- Coolant barrels chain-react. Friendly blasts do not directly hurt Tibo, but removed footing can be hazardous.
- The thinking selector changes shot force, penetration, color, sound, and recovery. Shots draw from a finite token budget; F replenishes it.
- RESET overloads nearby uplinks, restores tokens, clears nearby enemy shots, and creates a local explosion with debris and barrel chains. It no longer gives a power-up, free shots, faster firing, or turret conversion.
- Three security beacons each call two drones once per mission when a nearby blast trips them. Flashing lights and arrival markers give 2.4 seconds of warning. The response investigates the blast location; it does not automatically know the player’s position.
- Start with two reset charges. Five bot kills earn a charge; rescues refill one. If empty, one charge recovers in 12 seconds; kills can earn it sooner.
- Three-hit health, brief hit invulnerability, quick checkpoint respawns, two developer rescues, and a telegraphed boss with an orange exposed core.
- Final extraction and replay. Pause on focus loss. Sound and screen shake can be disabled.

Implementation: TypeScript + Vite, custom Canvas 2D renderer and fixed-step simulation. This first slice uses Canvas 2D rather than the earlier Phaser/WebGL recommendation to keep the feel experiment small. No live AI service, account, backend, or network gameplay dependency. Google Fonts are optional presentation assets with local font fallbacks.

## Project memory

Start at **[docs/README.md](docs/README.md)** for lore, design decisions, sources, the original visual references, and the complete user-supplied X research.

The user requested an independent design critique from Claude Code using Fable 5.1. See the [exact pitch](docs/research/claude-gameplay-pitch.md), [full review](docs/research/claude-fable-5.1-review.md), and [decisions adopted](docs/research/review-decisions.md). Actual returned model: `claude-fable-5-1`. The review was based on the pitch, not a playable build.

This is an independent fictional parody. Reference screenshots in `docs/references/` are research inputs. The running game uses its own rendering and an original generated character portrait; see [asset and prompt provenance](docs/research/image-generation.md).


## Dimillian — the Hot Reloader (field test 023)

Select **DIMILLIAN** on the title screen, or use Escape → Switch Bro to reopen character selection. Purple is his main accent. Scroll continuously or press **1 / 2 / 3** to switch game forms; the on-screen sprite, weapon and controls change with the form.

| Form | Click | E | Hold Q | F |
| --- | --- | --- | --- | --- |
| Duelist | Two different baguette sword slashes; connect both to unlock the heavy finisher | Remote Pair with a robot | Enlarge his iPhone into a stationary bunker; no movement or attacks inside, but Remote still works | Giant baguette Grand Slam |
| Mage | Hold fireball to charge, release to cast; full charge explodes on impact | Turn an enemy into a sheep | Bubble attached to his centre, protecting actors inside | Meteor |
| Mini spaceship | Twin cannons | Bomb straight down | Aim-directed shield | Cannon Overdrive |

**Flight is unrestricted:** A/D move, Space or W ascend, S descend; release vertical input to hover. Terrain still blocks the ship. There is no thrust reserve or flight cooldown.

**Shield health:** 100 HP shared across forms, with 20 HP per ordinary bullet. Release Q to recharge at 20 HP/s. You can raise it again immediately with partial health. A fully broken shield stays unavailable until all 100 HP regenerate. The mage bubble follows him; the ship shield leaves its rear exposed; the iPhone bunker stays planted and requires ground.

E/F cooldowns survive form changes. Active F finishes before another form can load. In all forms, E overrides a nearby uplink. Sheep transformation ends when damaged or after six seconds. These abilities are fictional game adaptations; current visual references, sources and tuning are in [Dimillian's character notes](docs/characters/dimillian.md).

### Character chatter

The bros react with short speech bubbles to deployment, death/respawn, signature moves, big fights and mission landmarks. Lines follow each character's personality, rotate where variants exist, and have cooldowns to avoid constant chatter. No spoken audio. Edit the dialogue in `src/hero-lines.json`; behavior and trigger notes are in `docs/iteration-027.md`.

## GitHub Pages

Pushes to `main` automatically run the tests, build the game and deploy `dist/` through [GitHub Actions](.github/workflows/deploy.yml). The live game is at **https://evizero.github.io/Tokenbros/**. You can also deploy manually from the Actions tab. Pages uses **GitHub Actions** as its publishing source in repository Settings → Pages.

`npm run build:pages` reproduces the hosted build, including the `/Tokenbros/` asset prefix. To preview that build locally, run `npm run preview -- --base=/Tokenbros/` and open the printed URL under `/Tokenbros/`. Development at the local root continues to work with `npm run dev`.

## License

[MIT](LICENSE), copyright 2026 Christof Salis. Third-party reference photographs and screenshots in `docs/references/` remain the property of their respective owners; they are not relicensed by this project.
