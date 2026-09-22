# Marcus Bloice / The Augmentor — research and gameplay proposals

Recorded 2026-09-22. The user approved the returning-disc kit; it became playable in [iteration 031](../iteration-031.md). [Iteration 032](../iteration-032.md) replaces Zoom with the user-approved chargeable Space Invader bomber; Rotate remained unchanged. [Iteration 033](../iteration-033.md) subsequently replaces Mirror with the user-approved Game & Watch-inspired LCD self-launch. [Iteration 034](../iteration-034.md) adds a fourth Pac-Man cartridge: manually directed chains through up to four separate bots. The research and original proposals below are preserved as design history; the implementation document governs current tuning. The user supplied two photos, a Hobbit/Martin Freeman resemblance joke, and his interest in retro games. These personal hooks are user-provided context, not independently established public memes.

## Verified research

- His public spelling is **Marcus D. Bloice**, handle **mdbloice**. His [GitHub profile](https://github.com/mdbloice) identifies medical imaging, machine learning, and Medical University Graz. Its short status is “Steady as she goes...” This is a usable authentic phrase, but too little evidence to infer a whole personality.
- His [university-hosted page](https://user.medunigraz.at/marcus.bloice/) lists scientific programming and machine-learning teaching, alongside Augmentor, Pyrea (multiview clustering), and Labeller (image annotation tooling). This supports an image/data tooling and teaching background.
- [Augmentor's repository](https://github.com/mdbloice/Augmentor) describes a Python image augmentation pipeline. It chains transforms such as rotation, mirroring, zoom, crop, skew, elastic distortion and random erasing to create variants of existing images. It can transform corresponding masks together. The useful fictional hook is one source becoming many transformed versions, rather than generating images from prompts.
- The [2017 JOSS paper](https://joss.theoj.org/papers/10.21105/joss.00432) credits Marcus D. Bloice, Christof Stocker and Andreas Holzinger. Preserve collaborators when discussing the paper; do not portray the research as solely authored.
- His [university research profile](https://ris.medunigraz.at/en/persons/marcus-bloice-2/) lists work on medical-image analysis, clustering and privacy-preserving/federated learning. These are professional themes, not evidence of game preferences or social mannerisms.

Searches for public retro-game interests, interviews and the Hobbit joke did not yield reliable corroboration in this pass. Do not invent favorite consoles, game franchises, nationality, voice, age, completed doctorate, or signature gestures. The supplied personal context can still guide the fictional character. No interview was watched.

## Visual reference and tone

References: [sunglasses](../references/marcus-bloice-sunglasses.png), [front](../references/marcus-bloice-front.png). Likeness anchors visible in the supplied photos: short tousled dark hair, light stubble, dark casual clothes; aviators are optional costume flavor.

Proposal: a compact retro adventurer with a short jacket, satchel of cartridges and an oversized homemade slingshot. A small stature and adventurous silhouette can carry the Hobbit nod without making every reaction a height joke. Avoid another wizard outfit. Suggested accent: cyan/ice blue with cream and charcoal, distinct from the existing lime, coral, purple and amber. All costume, animation and personality direction here is invented.

## Recommended gameplay hypothesis: arcade trick-shot adventurer

**Fire a physical projectile, augment its path/shape, reposition, then recall it through enemies.** The core pleasure should be a clearly readable object ricocheting, splitting, knocking robots around, then snapping back into his hand. Use an exaggerated slingshot windup and full-body catch, crunchy impact sounds and tiny arcade combo numerals. The package vocabulary should explain a fun action, not require understanding machine learning.

An initial weapon could fire a chunky spinning disc from the slingshot. Reusable discs make the return mechanic coherent; final visual design is open. Tap immediately fires; avoid requiring a long charge for every ordinary attack. A small bounded disc stock and automatic eventual return prevent an ammo dead end.

### Candidate controls, all unapproved

- **Click:** launch the selected augmented disc toward the cursor. Stock recovers when a disc returns. One target can be hit on the outward and return legs, with per-leg hit tracking so overlap cannot cause unlimited damage.
- **Scroll — Rotate / Mirror / Zoom:** continuous feedback within categories, with conspicuously different silhouettes and behavior at category boundaries. Rotate is a quick ricochet disc; Mirror launches a weaker separated pair for spread; Zoom is a large slower disc with heavy knockback and breakable-cover damage. Neither higher scroll nor more copies should be universally superior. Total damage and available stock need tuning. A transform belongs to a disc at launch; scrolling should not unpredictably rewrite objects already airborne.
- **E — Recall:** turns airborne discs back toward Marcus immediately. Move before recalling to pull the return path through a second enemy or an exposed flank. Return motion must visibly curve, obey terrain and avoid teleport hits through steel. A blocked disc can expire/refund without causing through-wall damage. A clean catch gets a short snap animation; movement remains responsive.
- **Q — Flip:** a short directional evasive tumble, briefly turning him edge-on like a mirrored sprite with an afterimage. A bounded evade window and recovery prevent permanent invulnerability. This protects through movement rather than another held shield. Ordinary collision still applies; it is not a wall teleport.
- **F — Batch Augment:** a temporary arcade burst that adds a small bounded set of transformed echoes to attacks. Echoes fade after their pass and never become autonomous companions or replenish stock. Emphasize a readable fan, staggered impact rhythm and one strong finish rather than filling the screen with indistinguishable projectiles. Exact echo count and duration need testing.

Example encounter: bank a Rotate disc into an elevated guard, drop below the catwalk, recall through its flank; change to Zoom to smash a crate barricade; Flip through a telegraphed volley while discs return. The benefit of repositioning and a second hit must be obvious during ordinary combat, without a tutorial on angles.

## Why this occupies a different role

- **Tibo** manages token expenditure and recovery: firearm modes, a throwable reset, his physical double and bullet-to-token defense. Marcus would manage projectile paths and his own position. Reusable discs should not become another token meter.
- **Peter** places and commands persistent, vulnerable pets with autonomous behavior. Marcus's transformed copies are brief trajectories with no creature AI or target commands.
- **Dimillian** changes his own form, movement and entire kit between sword/phone, mage and ship. Marcus stays the same agile adventurer; augmentation changes attacks.
- **Pidalf** directly manipulates enemies and props with force, compaction and shockwaves. Marcus should not resize, drag or duplicate enemy bodies as his main loop; image transforms act on his own weapon.

These distinctions guide a proposal, not a ban on every shared action such as reflection or knockback.

## Other directions worth keeping

- **Snapshot/copy tool:** scan an existing barrel or projectile and produce an augmented temporary copy. Stronger literal image-tool connection, but depends on level props and is less immediately readable. Keep as an alternative secondary ability, not another simultaneous mechanic in the first prototype.
- **Retro save-state trick:** place a ghost of himself and rewind to it with Q. Potentially satisfying, but mainly justified by the supplied retro interest; it does not follow from Augmentor. More implementation complexity than an evade and potential overlap with Tibo's double. Not recommended for the first slice.

## Fictional speech bubbles

Original writing, not real quotations: “Same rock. More data.” / “Let's try another angle.” / “Second breakfast. Second hit.” / “One more credit.” The profile's “Steady as she goes...” is separately sourced above. Use existing contextual bubble cadence; no voiced lines or special-purpose caption UI.

## First thing to test if approved

Build one Rotate disc, E recall, and a full-body launch/catch animation against ordinary guards, a drone and destructible cover. Verify that bank hits and return hits feel good on a trackpad before committing to three modes and an ultimate. This is a proposed test sequence, not authorization to begin implementation in the research turn.
