# Independent gameplay critique request

Requested by the user on 2026-09-22 for Claude Code using Fable 5.1. This is a design review, not a request to implement or edit files.

## Compact pitch

We are prototyping **Tokenbros**, a browser 2D pixel-art run-and-gun inspired by Expendabros/Broforce. Playable characters are affectionate fictional exaggerations of AI personalities (Tibo Sottiaux, Sam Altman, Dario Amodei, Elon Musk, Peter Steinberger/OpenClaw, Theo/T3 Chat). Public associations become physical combat abilities. Tiny characters, huge explosions, destructible cover and alternate routes, short missions, rescue checkpoints, fast retries. Dark industrial foreground, cool atmospheric background, bright token fire and orange explosions. No live LLMs are required to run the game.

We want the mechanics to be fun even to players who miss the AI jokes. The target is punchy action, not a meme slideshow or a complicated resource-management game.

**First character: Tibo, the aggressive quartermaster.** He is associated with announcing usage-limit resets, engaging with users, and encouraging them to spend their tokens. A user supplied a meme comparing his longer-haired interview appearance with his smiling, shorter-haired profile photo: "before reset / after reset." Publicly mirrored posts show him joining the joke about regaining youth with button presses. In our fictional game he presses RESET and literally becomes his profile picture. The joke is an exaggerated transformation, not a claim about actual aging or health.

**Proposed kit:**
- Primary Token Hose: punchy automatic fire that spends a rechargeable USAGE reserve for strong sustained output. Empty reserve falls back to a usable basic shot; firing should never become frustratingly unavailable. This is one meter (not separate ammo, heat, and mana).
- RESET: a separate limited charge; slam an oversize physical button, push nearby enemies away, refill the weapon reserve, and enter roughly four seconds of maximum fire without resource drain. Portrait/sprite become fresh-haired and grinning, then revert. Stable movement speed throughout.
- Future local co-op: the pulse also refills nearby teammates' weapon resources, not health or ultimate charges. RESET cannot refill itself.
- Charges/resources can replenish at checkpoints/rescues. Exact economy is untested.

**Prototype mission:** Rate-Limit Refinery, roughly 90 seconds to a few minutes. Shoot soft cover and a basic bot; discover a coolant-barrel chain reaction; choose a rooftop or lower route past a turret; rescue a developer/checkpoint; defeat a Rate Limiter boss with a shield/overheat vulnerability cycle; extract during a facility collapse. Three enemy behaviors, one character, one boss. Handcrafted terrain tiles; most debris visual, selected objects physical. Avoid irrecoverably destroying mandatory routes.

**Controls/feel:** run, jump, shoot, RESET; potentially wall-jump/climb. Keyboard-only must work; mouse aiming and controller support are possibilities. Coyote time, jump buffering, quick acceleration, short major-hit pauses, restrained shake, strong shot telegraphs. Considering a small health allowance for the first slice versus the source game's one-hit deaths. Audio/effects should create weight while preserving readability.

Later contrast: Dario catches/returns frontal projectiles with Guardrail; Peter pulls barrels with a claw and delegates lobster bots; Elon uses rockets/rocket jumps; Sam drops a server emplacement; Theo switches between two weapon modes. They should solve the same room differently.

## Requested critique

Act as a candid action-game designer and playtest lead. You have only this pitch, not a playable build. Do not pretend to have tested it. Do not browse, inspect files, execute commands, or modify anything. Respond in about 700–1000 words, prioritizing concrete changes rather than adding features.

1. Does the central loop sound fun? What is the strongest mechanic and what is merely thematic decoration?
2. What are the three biggest design risks or contradictions (including the resource/RESET economy and terrain destruction)?
3. Does the humor land through play? How can the transformation be funny without becoming mean or obscuring the game?
4. Recommend one default control scheme. Address keyboard aiming versus mouse aiming, jumping, wall movement, responsiveness, recoil, and control overload.
5. What would you cut from the first prototype? Is the boss/mission scope appropriate for proving the feel?
6. Recommend concrete starting values/ranges for a few feel variables, clearly labeled as tuning hypotheses rather than authoritative numbers.
7. Give 5 observable playtest questions or pass/fail criteria, and one concise revised pitch.

Be willing to say if this sounds more amusing on paper than fun to play. Distinguish confident principles from hypotheses requiring hands-on testing.
