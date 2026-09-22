# Peter Steinberger / THE CLAWFATHER

Recorded 2026-09-22. User direction takes priority over the supplied model report and external review.

## User direction

OpenClaw's creator should be a beastmaster who throws little lobsters/crabs instead of carrying a regular gun. Different claws should do different things. Base appearance follows supplied interview photographs: glasses, undercut, short beard, blue shirt. The gym photograph inspires an exaggerated temporary ripped-shirt melee transformation, not a claim about his present body. A single terminal appears only when directly clicking an enemy, showing `> openclaw onboard` (the real CLI command, verified in the official docs). The user's subtle pride nod was refined to a tiny detail in one animation, not a persistent outfit accessory.

## Verified research and source strength

- [Peter: OpenClaw, OpenAI and the future](https://steipete.me/posts/2026/openclaw), 2026-02-14, read 2026-09-22. His own account describes joining OpenAI to bring agents to a wider audience and moving OpenClaw toward an independent foundation. This supports the agent-builder identity; it does not validate every claim in the supplied report.
- [OpenClaw official site](https://openclaw.ai/), read 2026-09-22. Presents an open-source personal assistant running on the user's machines and working through familiar messaging apps. Its lobster branding supports the companion motif.
- [Shipping at Inference-Speed](https://steipete.me/posts/2025/shipping-at-inference-speed), 2025-12-28. Peter describes CLI-driven workflows, working on several projects, and personal assistant tooling. This supports terminals and orchestration as visual motifs. His actual discussion is more nuanced than the report's blanket claim that he rejects planning; he describes iterative discussion and plans.
- [OpenClaw multi-agent routing documentation](https://docs.openclaw.ai/concepts/multi-agent), read 2026-09-22. Documents separate agent workspaces/routing. The game's fighting lobsters are fictional and do not run an AI service.

## Supplied report, not independently verified

The user supplied another model's colorful biography and ability ideas: Austrian developer, PSPDFKit/Nutrient founder, retirement/comeback, OpenClaw naming history, public nickname ClawFather, lobster humor, many simultaneous agents, own-machine independence. It also included specific financial, employment, education, legal, social-post and timeline claims. Preserve those as leads, not established facts; they are unnecessary for this prototype. Proposed abilities like Soul.md Rewrite and They Cannot Block You were not implemented. The user explicitly described the report as lower-confidence and prioritized their own ideas.

## Current fictional kit

E deploys a Pincher, Skipper or Crusher according to scroll intensity; Peter holds that type visibly. Deployment is now harmless. Up to four pets have individual health and stable identities, following Peter between fights. A full pack is never replaced by throw spam. The reserve supports recruiting replacements after pets die.

Left click both attacks with the selected held claw and marks a target/hunting area. Held red makes a short blast and briefly deflects incoming bullets; held blue fires a small projectile; held gold delivers the armor-breaking melee hit. None consumes a recruit. Pets search a 160px area for eight seconds, reacquiring after kills. All three types now share the long ballistic launch and can hunt near their landing without a command. Pincher and primes for 160ms before sacrificing itself in a small blast. Skipper charges for 100ms on its first attack and 450ms afterward, locks direction, dashes 190px, and repositions. Crusher senses enemies through breakable cover within its hunting area and digs toward them, including downward; reinforced terrain remains intact. It moves at 190px/s and uses a 140ms windup into a 6-damage armor-breaking slam, with 430px/s knockback and 800ms recovery. The sprite squashes and swings its enlarged pincers, with gold sparks and impact feedback. Surviving pets remain companions; deployment is still harmless. Normal guards can see and target the pets, using the same cone/cover rules as for Peter; the boss can target a closer visible pet. Pet health now also handles enemy contact and grenade damage. Clicking near Peter regroups. Stranded pets use a visible recall bubble to catch up; this is a deliberate navigation assist, not full platform pathfinding. E near uplinks retains override priority. F remains the five-second melee Molt; E can deploy while transformed. Q deploys a small rainbow Prism barrier fixed in world space: 1.8 seconds or three intercepted shots, 6.5-second cooldown. It protects anyone behind that finite span; Peter can move away. This replaces the terminal-closing rainbow glint per the latest user direction.

These latest user directions supersede the earlier timed projectile-pet experiment and the original review's impact-damage recommendation.

## Fable 5.1 review

[Exact pitch](../research/peter-gameplay-pitch.md), [full critique](../research/peter-fable-review.md), [response metadata](../research/peter-fable-response.json). Actual returned model: `claude-fable-5-1`. Read-only design critique, not an independent hands-on test.

Adopted immediate throw impact, bounded swarm, simple local movement, limited reserve, meaningful cover damage outside Molt, brief melee protection/knockback, contextual uplink priority, and incidental rainbow. Kept three color-coded types and existing continuous scroll rather than the review's tap/hold two-type recommendation, to preserve the established input scheme and test the user's different-creatures idea. Did not adopt automatic kill extensions for Molt or a complicated returning-ammo animation. These are deliberate prototype choices, subject to actual play feedback.

## References and assets

User-supplied [face / terminals](../references/peter-face-terminals.png), [interview](../references/peter-interview.png), [gym](../references/peter-gym.png). These are identity/design references, not production textures. Generated portrait: `public/assets/peter-intro-v1.png`. Gameplay Peter and lobster sprites are code-native pixel drawings in `src/peter-art.ts`. Image prompt/provenance: [Peter portrait](../research/peter-image-generation.md).
