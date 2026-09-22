# Tokenbros project memory

Recorded 2026-09-22. Start here before changing the game or adding characters.

The user wants an Expendabros-inspired browser action game featuring personalities around the LLM/AI revolution. The immediate objective is a first playable prototype that establishes satisfying gameplay. The user explicitly requested that worthwhile research, lore, and design discussion be preserved before implementation details accumulate.

## Reading order

1. [Game bible](game-bible.md): premise, design pillars, world, roster, visual direction, and scope.
2. [Tibo character bible](characters/tibo.md): appearance, public persona, reset meme, proposed mechanics, and evolution of the design.
3. [Research and source register](research/sources.md): facts, links, evidence limitations, and technical recommendations.
4. [Supplied X research](research/tibo-x-report.md): the user's additional research from another model with X access, preserved as an attributed research input.
5. [Prototype brief](prototype.md): the first slice, testable outcomes, and deferred features.

## How to interpret these notes

- **User direction** means an explicit preference or request from the conversation.
- **Research** means a claim supported by the linked material. Source strength is recorded where relevant. We did not play Expendabros during the research pass or watch the full interview.
- **Supplied research** means material the user provided from another model. Preserve it, but do not silently upgrade it to independently verified fact.
- **Proposal** means a fictional mechanic, name, story, or dialogue idea. It is not a real-world claim, an endorsement, or a finalized requirement.
- **Prototype decision** is an implementation choice for testing the concept; it can change based on play.

The user authorized making the prototype, but has not separately approved every proposed ability or piece of lore. Keep the central intent stable; treat tuning and untested details as adjustable.

## Reference images

- [Expendabros gameplay reference](references/expendabros-gameplay.png): user-supplied screenshot, with its original watermark. Shows pale forest depth, dark destructible terrain, small soldiers, and dominant orange explosions.
- [Tibo before/after-reset meme](references/tibo-before-after-reset.png): user-supplied screenshot of a post attributed to Izzy / @israelfemijo. Left is the interview appearance under “Before reset”; right is the smiling profile image under “After reset.” Attribution and identity came from the user. The exact original post was not independently located.

These are research references, not production sprite sheets. The copies here preserve otherwise temporary attachment paths.

## External design review

- [Compact pitch sent to Claude](research/claude-gameplay-pitch.md)
- [Full Fable 5.1 critique](research/claude-fable-5.1-review.md)
- [Decisions after the critique](research/review-decisions.md)
- [Raw response and model metadata](research/claude-feedback-response.json)

The authorized review succeeded with `claude-fable-5-1`. Read the adopted decisions before treating earlier prototype suggestions as current.

## Latest playtest iteration

- [User feedback and iteration 002](playtest-feedback.md): verticality, distinct enemy behavior, Tibo's entrance, and satisfying robot destruction. These newer requests supersede scope cuts in the original prototype brief.
- [Generated portrait and exact prompt](research/image-generation.md): likeness references, generation provenance, and production asset.
- [Current controls and implementation](../README.md): live mechanics and how to run.
- [Expendabros entrance reference](references/expendabros-character-entrance.png): the user's character-reveal example.

- [Iteration 002 validation](testing.md): verified route, physics checks, and limits of automated playtesting.
- [Iteration 003 — mouse combat, thinking, and hand slam](iteration-003.md): newest user direction and implemented controls/abilities; supersedes previous input scope cuts.
- [Iteration 004 — continuous thinking and quiet robot effects](iteration-004.md): current scroll and enemy-audio behavior; supersedes iteration 003's discrete gestures and dialogue.
- [Iterations 005–006 — enemy awareness and finite tokens](iteration-005-006.md): sight/hearing/investigation, quiet walking, finite ammunition, reset refills, and recovery rules.

- [Iteration 007 — compact HUD, escalation, slam, and magnetic yoink](iteration-007.md): current F/E abilities and local alarm responses; supersedes previous overdrive and HOTFIX mechanics.
- [Peter / Clawfather character bible](characters/peter.md): primary-source research, user direction, current playable kit, reference photos, Fable 5.1 critique and decisions.
- [Iteration 008](iteration-008.md): Peter, throwable reset physics, neutral world and character accents.

- [Iteration 009](iteration-009.md): current Peter control mapping and conspicuous continuous/category scroll feedback.

- [Iteration 010](iteration-010.md): persistent companion pack and mode-specific held weapon silhouettes.

- [Iteration 011](iteration-011.md): Q parry and a stationary rainbow Prism shield.
- [Iteration 012](iteration-012.md): hunting areas, three distinct pet attacks, and held-claw melee outside Molt.
- [Iteration 013](iteration-013.md): enemies target pets, longer smart-grenade throws, and Crusher digging.
- [Iteration 014](iteration-014.md): local token/empty feedback and three held-crab primary attacks.
- [Iteration 015](iteration-015.md): stacking tokens-burned counter for continuous firing runs.
- [Iteration 016](iteration-016.md): slower local refill animation, borderless selector accents, faint hover-only cones, and one OpenClaw terminal on enemy clicks.
- [Iteration 017](iteration-017.md): equal long throws, fast opening blue dash, and faster, harder-hitting Crusher slams.
- [Iteration 018](iteration-018.md): Tibo’s meme double replaces E’s magnetic tether with a leap, grab/throw, and temporary bullet blocking.
- [Iteration 019](iteration-019.md): easier repeated same-wall jumps, controlled sliding, and visible hand/foot grip.

- [Iteration 020](iteration-020.md): held Tibo shield converts incoming shots to tokens, with recovery-dependent cooldown.
- [Iteration 021](iteration-021.md): catch the other Tibo to recharge E; successful throws send homing tokens back to the player.

- [Dimillian character bible](characters/dimillian.md): current playable forms, controls and tuning, verified sources, and historical proposals.

- [Iterations 022–023](iteration-022-023.md): purple Dimillian, hot-reload forms, sword combo, fireball, unlimited hover, form-specific E and rechargeable Q shapes.
- [Dimillian portrait generation](research/dimillian-image-generation.md): final asset, reference photo and exact built-in image-generation prompt.

- [Iteration 024](iteration-024.md): shorter baguette, full-body sword animation, wall damage and timed bullet reflection.
- [Iteration 025](iteration-025.md): portrait-grid start screen, selected kit overview, keyboard navigation and pause → character selection.
- [Iteration 026](iteration-026.md): six roster slots and a live, isolated combat showcase with nine selectable ability clips.
- [Iteration 027](iteration-027.md): speech-bubble-only character reactions, contextual triggers, editable line bank and anti-spam rules.
- [Iteration 028](iteration-028.md): pixel speech balloons without side stripes; tutorial billboards, hanging banners and mounted metal signs.
- [Pidalf / Mario Zechner research](characters/pidalf.md): primary sources, social evidence limits, written mannerisms, meme hooks and unimplemented gameplay proposals.

- [Iteration 029 — playable Pidalf](iteration-029.md): backhand dismantling, force throws, continuous scale and physical compaction; supersedes earlier Pidalf proposals. Includes transparent entrance portrait provenance.

- [Iteration 030 — layered combat refinery](iteration-030.md): multi-route arenas, destructible decking, finite reinforcements, field kits and route validation.

- [Marcus Bloice / The Augmentor research](characters/marcus-bloice.md): verified professional background, supplied retro/Hobbit context, preserved photos and original arcade trick-shot proposal.
- [Iteration 031 — playable Marcus](iteration-031.md): returning discs, Rotate/Mirror/Zoom, recall, flip dodge, Batch Augment, entrance portrait and five-character selection.
- [Iteration 032 — Space Invader bomber](iteration-032.md): Zoom hold/release charge, finite bombing pass, recall/shrinking catch; Rotate and Mirror preserved.
- [Iteration 033 — LCD self-launch](iteration-033.md): middle mode now launches Marcus himself, with rounded handheld-game silhouettes, stepped flight, heavy impacts and traversal.

- [Iteration 034 — Pac-Man chain](iteration-034.md): a fourth Marcus cartridge with directed homing bites, escalating impacts and four-mode controls.
