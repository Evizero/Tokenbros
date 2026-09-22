# Tokenbros — working game bible

Status: preproduction proposals and prototype direction, recorded 2026-09-22.

## User direction

Make a game with the look, feel, and playfulness of Expendabros / Broforce, featuring personalities associated with the current LLM revolution. Initial people named by the user: Sam Altman, Dario Amodei, Elon Musk, Thibault “Tibo” Sottiaux, the OpenClaw creator (Peter Steinberger), and Theo from T3 Chat (Theo Browne). Research the original game's loop, worlds, effects, and functionality before choosing abilities. Browser delivery is preferred; the user mentioned WebGL as a possibility rather than a requirement.

The user subsequently approved starting a gameplay prototype and asked to preserve research and lore before going deeper into implementation.

## Working identity

- Title: **TOKENBROS** (working name; matches the project folder).
- First mission: **Operation Hard Reset**.
- First location: **Rate-Limit Refinery**.
- First playable character: **Tibo**.
- Core fantasy: tiny recognizable AI personalities wield absurd firepower through physical, destructible industrial environments.
- Tone: affectionate, exaggerated action parody; readable physical jokes and brief barks. Do not replace the game with menus, topical exposition, or long dialogue.

## Design pillars

1. **Destruction makes choices.** A blast damages enemies, opens a route, and may remove useful cover or footing. Different weapons should alter the same encounter differently.
2. **Responsive movement supports chaos.** Running, jumping, and climbing must remain precise. Input buffering and coyote time are appropriate prototype techniques. Do not make Tibo sluggish to sell the appearance joke.
3. **Large power, real vulnerability.** Expendabros combines devastating attacks with one-hit deaths. Test how much forgiveness our version needs; fast, understandable retries matter more than copying the exact difficulty.
4. **Personalities become mechanics.** Tokens, resets, guardrails, agents, compute, and model routing become physical actions. Avoid reskinning the same gun for every character.
5. **Short loops, immediate reward.** Action begins quickly; weapon feedback is enjoyable before the player understands the meme.
6. **Readability survives spectacle.** Player, enemy shots, surfaces, and danger telegraphs remain legible through smoke and debris.

## Reference game lessons

Expendabros is the compact official Broforce / Expendables 3 crossover: ten missions, seven heroes with different primary weapons and specials, and up to four local players. Published material describes forests, industrial structures, lumber mills, soldiers, artillery, and saw hazards.

Loop: enter → assess terrain/enemies → fight or carve an alternate route → rescue a bro → reach a checkpoint/extraction → repeat. Rescues supply extra lives and character variety. Exact switching and restart details differ in secondary descriptions; see the source register before reproducing them precisely.

Portable lessons:

- Walls and floors participate in combat, rather than merely containing it.
- Barrels and machinery create cascading outcomes.
- Knife, explosive, automatic, and melee characters require different positioning.
- A short campaign gains replayability from character and destruction variations.
- The action-film presentation makes disproportionate force and sudden catastrophe funny.

Our prototype may simplify character switching, lives, and collapsing structures. It must preserve responsive shooting and consequential destruction.

## Proposed fiction

A runaway **Slop Engine** has taken over the infrastructure. The AI personalities form an uneasy rescue squad fighting fictional bots and machines. Developers and other bros are trapped behind rate-limit barriers. Deployment terminals serve as checkpoints; extraction takes the squad out as the facility falls apart.

This premise was proposed by the assistant, not explicitly selected by the user. Keep it light and easy to replace. No story needs to block starting a mission.

Environmental jokes proposed so far:

- A turret flashes **429** before overheating.
- A rescue cage is labeled **UNLIMITED***.
- A collapsing facility's billboard still says **ALL SYSTEMS OPERATIONAL**.
- Refill celebration: **RESET ALL PROPAGATED**.
- Original fictional announcer line: **USAGE RESTORED. YOUTH RESTORED.**

## Proposed worlds

| World | Look | Mechanical job |
| --- | --- | --- |
| Rate-Limit Refinery | Service roads, server bunkers, power cables, coolant tanks | Teach fire, barrel chains, rescuing, and destructible cover |
| Context Canyon | Archive towers, stacked memory blocks, bridges | Vertical routes, long sightlines, and removing one's own path |
| Agent Docks | Containers, conveyors, cranes, scuttling bots | Move explosive objects; turn machinery against either side |
| Slop Factory | Garish billboards, bot printers, assembly lines | Stop enemy production; finish with a cascading collapse |

Later successful runs should take roughly two to four minutes per mission. The first test level can be shorter. Prefer purposeful handmade encounters over procedural generation until combat is established.

## Character roster proposals

All attacks below are fictional. The source register records public associations, not evidence that these abilities or characterizations are real.

| Person / working codename | Primary | Special | Distinct decision / weakness |
| --- | --- | --- | --- |
| Tibo / The Reset Guy / Tokenburner | Token Hose; sustained fire consumes an empowered reserve | Reset refills resources, repels enemies, and triggers Profile-Picture Mode | Aggressive quartermaster; use the refill at a decisive moment |
| Sam Altman / The Scaler | Scaling Cannon; consecutive hits build toward a piercing shot | Stargate Drop; a server pod impacts and becomes a temporary emplacement/platform | Builds momentum; drop requires placement and delay |
| Dario Amodei / The Constitutional | Redaction Beam; narrow piercing shots cut precise holes | Guardrail; catch frontal projectiles and release a counterblast | Timing and frontal positioning; susceptible to flanks |
| Elon Musk / The Groketeer | Rocket Salvo; slow explosive shots with strong knockback | Launch Window; rocket ascent into an aimed descending impact | Explosive traversal; can destroy useful footing |
| Peter Steinberger / The Clawfather | Claw Cable; pull enemies/barrels, grapple designated anchors | Delegate; three lobster bots seek enemies, attach, then explode | Manipulation and setup; more complex implementation |
| Theo Browne / The Hot Swap | Router; switch between spread and piercing modes | Hot Take; short fire cone, knockback, prop ignition | Adaptable skirmisher; keep to two understandable modes |
| Jensen Huang / codename TBD | Green GPU beam grows wider while stationary | Temporary server-rack mech | Stand-ground heavy; strong silhouette and spectacle |
| Andrej Karpathy / codename TBD | Small nano blaster | Assemble a temporary bridge or turret, with a predictable choice | Builder; changes routes and defenses |
| Demis Hassabis / codename TBD | Bouncing Go-stone projectiles | Look Ahead; slow hostile shots and reveal trajectories | Tactical spatial control |

Initial suggested demo order: **Tibo → Dario → Peter**, exercising sustained fire, reactive defense, and physical manipulation. Jensen is the strongest extra pick for broad visual recognition. Mira Murati was briefly researched as a possible addition but no complete kit was proposed; do not treat her as a selected roster member.

Same-room test: Tibo drills through a wall; Dario reflects a turret; Elon removes the floor; Peter drags a barrel into the squad. If all four approaches feel the same, the roster is not differentiated enough.

The supplied X report suggests treating “safety leads” as brakes/red tape. That was the report's shorthand, not our chosen Dario design. Our earlier proposal makes Guardrail an active, powerful defense, avoiding a character whose joke is simply being unable to act.

## Art direction

Visual thesis: a dark, tactile industrial pixel-art battlefield; bright token fire and orange explosions against cool atmospheric depth.

- Pale distant scenery in multiple parallax layers; dark, textured foreground terrain.
- Small readable gameplay sprites with recognizable hair, clothing, weapon, and pose silhouettes.
- Larger expressive HUD portraits carry facial likeness and transformations.
- Original sprite art and environment construction; use the attached game image as composition reference.
- UI: sparse mission information, health, usage, RESET, and legible controls. The game is the dominant visual surface.
- Restrained off-white and acid-lime interface palette; combat can add oranges/reds for explosions and danger.

Content plan: title/mission briefing → full gameplay canvas → concise controls → clear death/retry and extraction/replay states.

Interaction thesis: layered parallax establishes depth; recoil, directional debris, and short camera impulses establish weight; the portrait transformation and outward RESET wave punctuate the power burst.

Feedback priorities:

- Distinct sharp muzzle flash and projectile trails.
- Short impact pause on major kills/blasts, not every automatic shot.
- Directional block fragments, sparks, and fast-clearing smoke.
- Camera shake scaled to event intensity, with a reduced-effects option.
- Layered weapon report, bass impact, and debris sounds; audio begins after user input.
- Strong enemy windups and projectile contrast. Screen clutter should not hide lethal information.

## Implementation direction

The research recommendation was TypeScript + Phaser with WebGL; Godot was the alternative for a visual editor/native distribution. The user did not mandate either. A lightweight Canvas 2D implementation is also acceptable for the first gameplay test if it delivers the interaction and art direction. Document the actual implementation separately from the earlier recommendation.

Terrain proposal: a collision grid of damageable blocks; visual particles for most debris; a few physical objects such as barrels; explicit collapse rules for selected structures. Do not begin with general rigid-body simulation for every pixel.

Gameplay is local and deterministic enough to tune without network services. No live LLM call is needed for combat. Browser delivery should be simple to launch and replay.

## Open decisions / deferred work

- Exact lethality: one hit versus a shield/health allowance.
- Whether rescues automatically switch character in a later roster build.
- Final names, dialogue, mission story, and additional characters.
- Local co-op after solo movement and destruction feel right; online co-op is substantial separate scope.
- More worlds, progression, controller tuning, production sprite sheets, and richer audio.
- Tune numbers through play; the original three-to-four-second RESET durations were proposals, not canon.
