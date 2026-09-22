# Dimillian — character proposal, 2026-09-22

Status: playable third character, field test 025. The current kit below supersedes the earlier proposals preserved afterward. Purple is the main accent (interpreting the user's “purpose” as purple from the stage photo).

## Current implemented kit

Scroll or 1/2/3 hot-reloads between Duelist, Mage and Pilot. He keeps recognizable tied-back hair, beard and glasses, plus an iPhone. The miniature ivory/violet spaceship seats him visibly in its cockpit. The generated entrance portrait and source prompt are preserved in [image-generation notes](../research/dimillian-image-generation.md).

| Form | Primary | E | Hold Q | F |
| --- | --- | --- | --- | --- |
| Duelist | Alternating sword-like baguette slashes; landing both unlocks a heavy third finisher | Remote Pair with an ordinary enemy | Stationary enlarged iPhone bunker; seated, no movement/primary/F, but remote pairing and remote fire still work | Grand Slam: resize baguette into a massive swept strike |
| Mage | Hold a growing fireball, release to cast; full charge adds impact explosion | Polymorph one enemy into a sheep | Bubble centred on the player, follows movement/jumps, intercepts incoming shots for actors inside | Targeted falling meteor |
| Pilot | Alternating twin cannons | Drop bomb straight down | Directional shield follows mouse aim; rear remains exposed | Four-second cannon Overdrive |

The first two sword slashes alternate even on misses, with opposite arcs. Only two connected slashes in the chain unlock the finisher. The chain expires after a pause. Damage happens during the swept active arc, not wind-up; each target is hit once per swing. Light slashes keep targets nearby; the finisher deals 7, strips armor, and launches along the swing. First/second damage is 1.5/2, so an ordinary 4HP robot can survive both and be finished dramatically. The iPhone stays in his other hand. Normal baguettes are now 29px long (33px on the finisher), with a planted-foot windup, hip/shoulder drive, head and phone follow-through, and recovery. Slashes deal 2 damage to breakable wall tiles once per swing (heavy swings: 8); reinforced geometry survives. Horizontal slashes preserve the floor; aiming down deliberately digs. During the active blade sweep only, incoming bullets can be reflected into friendly shots for at least 2 damage, with a metallic ping and sparks. Wall hits and reflections do not count toward the two-hit finisher. Q remains the iPhone bunker.

Mage fireball charges over 1.15 seconds, stays held at full charge until release, and has a growing fiery core, sparks and a flame trail. Smaller shots deal direct damage; a fully charged shot also bursts over an 88px radius on impact. This replaces the earlier gun-like auto-firing orb.

The ship can fly indefinitely: A/D horizontal, Space or W up, S down, release to hover. There is no fuel or flight cooldown. Existing terrain collision remains, and the ship cannot leave the top of the level. This explicitly supersedes the earlier limited-thrust proposal.

All Q shapes share 100 shield HP. Ordinary bullets consume 20, outside blasts 45. Released/inactive shields regenerate 20 HP per second. Partial HP can be used immediately; reaching zero locks the shield until fully regenerated. Holding Q through full recovery raises it again. Transforming does not reset HP. The mage bubble is attached to his centre; the ship shield is directional; only the bunker stays fixed in world space. Bunker deployment needs ground, and losing support drops it.

E is form-specific with a shared cooldown: Remote Pair scans for 350ms, lasts six seconds, and has a ten-second cooldown; sheep lasts six seconds or until damaged, cooldown 5.5 seconds; bomb cooldown 2.8 seconds. Switching away from duelist ends the remote connection without refunding cooldown. Remote targets resume normal enemy behavior after expiry. Pairing and polymorph require range, cursor targeting and line of sight, and do not take over the boss. E overrides nearby uplinks in every form so mission gates remain playable.

F has an 18-second shared cooldown; active F locks form switching until finished. No separate ammunition budget. The primary, E/F recovery and shield HP survive hot reload. Pause freezes combat; death/respawn clears active abilities and restores shield health. These are prototype tuning values subject to play feedback.


## Inputs and evidence

The user supplied a report identifying Thomas Ricouard (@Dimillian), a stage photo, and asked for character ideas. The report is secondary input: its claimed quotes, ADHD framing, boat-week lore, and exact career details have not been independently verified. Do not treat proposed catchphrases as authenticated quotations or infer a medical condition.

Verified primary-source hooks:
- https://www.dimillian.app/ — his own site identifies Codex Developer Experience at OpenAI, Apple/Swift/SwiftUI development and open-source building.
- https://github.com/Dimillian/IceCubesApp — his open-source SwiftUI Mastodon client, supporting the literal ice-cube visual/gameplay pun.
- https://github.com/Dimillian/Diablo2D — his Diablo-inspired Love2D/Lua action roguelike.
- https://github.com/Dimillian/Evergrow — his browser action RPG, supporting a playful action-game-builder persona.

User photo visual cues: tied-back hair, beard, glasses, dark blue shirt, headset microphone. Use these rather than a generic short-haired executive silhouette. Suggested accent: icy cyan with lavender shadows and warm skin tones, within the neutral game world.

## Earlier proposal: Ice Cubes / battlefield builder (superseded in direction)

An aggressive ice sculptor who freezes, slides, builds temporary footholds and shatters enemies. Core rhythm: chill a robot, freeze it into a physical object, then smash or slide it through the encounter. This introduces terrain manipulation and setup/payoff to the current gunner/summoner roster.

Proposed controls:
- Click, low thinking: short-range frost spray, fast chill buildup, modest damage.
- Click, medium: accurate ice shards, stronger direct damage, brittle-target payoff.
- Click, high: heavy ice cube, slow and weighty, bowls through enemies then rests briefly as a jumpable block.
- Scroll continuously controls mass/range/cadence within these three conspicuous weapon forms. All modes retain useful damage without requiring a freeze combo.
- E, Swift dash: short aimed dash; hitting a frozen robot or loose cube kicks it forward as a heavy collision projectile. Normal enemies get modest shove damage.
- Q, Ice Wall: small destructible physical ice slab. Blocks bullets, supports jumping, can be kicked with E. Limited lifetime and one wall at a time prevent permanent safety or level blockage.
- F, Ship It: optional comedy special inspired by the user-supplied boat theme. Build a small sailboat on a short moving ribbon of ice; briefly ride it through a lane, scattering robots. Keep local and collision-aware; no full-world water simulation.

First test should implement only spray, freezing, and the dash/kick. Require a satisfying one-enemy freeze-and-smash and a multi-enemy bowling collision before expanding the kit. No implementation requested yet.

Balance/feel requirements: quick visible chill response, brief freezes, boss slow/stagger rather than indefinite freeze, distinct frozen silhouettes, crunchy shards, strong collision feedback, bounded temporary blocks, and no required menu manipulation. Keep actual combat readable; UI jokes should be short visual accents.

Alternative: Worktree action echoes replay a short recent movement/attack sequence; more temporal-combo-oriented, but risks overlap with Tibo's double/Peter's agents and poor readability. Alternative: conjure temporary weapons from his game demos; funny but less cohesive. Avoid a screen full of functional windows or five unrelated resource systems.


## User steering: French, game development, iOS

The user requested a stronger French/game-dev/iOS identity after the ice proposal. The follow-up discussion proposed a tablet that manifests game assets: baguette fencing, sprite-projectile gun, heavy physical app icons, swipe-to-delete dash, app-switcher defense, and a comic game-demo ultimate. These remain proposals, not approved implementation. Keep the French humor to selected props, visual reactions, and short text rather than piling on every stereotype.

## Codex Remote research and proposed integration

Official page fetched on 2026-09-22: https://learn.chatgpt.com/docs/remote-connections

Verified feature facts: a phone can start, continue, steer, and approve work on a connected host; the host supplies the actual environment/tools. Users can switch connected hosts/chats. Initial mobile pairing uses a host QR code. Remote access requires an available host. Chat handoff can move chat/Git state to another configured host with a matching saved project. This verifies product behavior, not a claim about Thomas's personal authorship.

Recommended fictional adaptation: **E — Remote Pair.** Briefly scan a visible robot or turret with the phone, then temporarily redirect its weapon. WASD still moves Thomas; mouse aim and click now directly operate the paired machine's weapon from its position. This is direct remote control of existing battlefield hardware, with one host at a time and no autonomous pet army. Tap E on another eligible target to hand off (subject to a bounded shared session); E on empty space disconnects. Keep range modest, pairing visible and interruptible, sessions short, and bosses immune to full takeover. End of session restores normal click combat without a menu. HUD/reticle/link accents must make the active firing origin obvious. No camera pan away from the player.

Game-dev link: remote-controlled enemies are treated as live playtest actors, briefly showing a selection outline and rotation gizmo. iOS link: phone lift, camera-scan corners, short connected haptic-style sound and a minimal status indicator. French flourish: Thomas can hold a baguette in his free hand, or give a quick satisfied shrug after a successful remote shot. Those are fictional visual gags.

Example encounter: pair with a turret above a shield robot; keep moving Thomas below it while aiming the turret down into the shield robot's exposed side; hand off to a second visible machine before the session ends. Target a different shooting angle and environment interaction rather than raw damage inflation.

Alternative larger F ability: deploy a tiny arcade racing car/RC baguette kart controlled with mouse direction while Thomas keeps WASD movement. This could marry mobile Remote with a game demo, but would introduce two simultaneous movement tasks. Prefer testing the single-host remote weapon first. QR pairing, host dependency, and handoff are inspiration; taking over hostile robots is purely the game fiction.


## Latest direction — hot-reload into his own games

The user rejects Remote as a main mechanic: it is insufficiently satisfying and should not require bespoke world hardware. It can pair with ordinary enemies as a supporting ability. The prior reply proposed autonomous aim-support from one temporarily paired enemy while normal primary attacks continue; direct possession is no longer the recommended direction.

New explicit user idea: Dimillian edits the game itself and can become a character from a different genre, such as a mage or a spaceship from his games. The user supplied both references and identifies them as his game assets; this attribution is user-provided, not independently verified:
- ../references/dimillian-spaceship.png — cream/ivory angular hull, dark violet swept wings, teal canopy, twin cyan thrusters.
- ../references/dimillian-mage.png — stylized fantasy caster, staff and floating luminous orb with orbital rings, layered tunic/armor and boots.

Recommended design proposal (not approved implementation): hot-reload his player prefab. A brief editor selection frame/wireframe and phone swipe swap his silhouette, weapon and movement animation, without stopping movement or opening an actual menu. Keep the existing world's pixel rendering but let each form visibly belong to a different genre.

Possible scroll roster: action-game duelist (earlier French baguette fencing idea), fantasy mage (orb/staff, arcing or explosive magic), arcade spaceship (twin cannons, short thrust/dodge). These are sidegrades with a shared resource, not escalating universal upgrades. Character likeness remains recognizable where possible: beard/glasses in mage form; visible pilot or portrait for ship. Preserve the supplied ship palette and silhouette. Continuous scroll feedback should lead to conspicuous form changes at category boundaries; avoid resetting cooldowns on transformation.

Mage should remain mobile while charging/casting and have immediate low-charge feedback. Ship should have responsive controlled movement and limited powered ascent, retaining terrain collision, so it cannot fly past the mission. Switching forms must not refill flight energy. No genre-specific camera change or top-down control remap. Supporting E pairs ordinary robots; primary click remains the character's main satisfying attack.

Best first test: mage and ship, with a quick editable-player transformation between them, because these are the two user-supplied references. French/iOS elements should frame the transformations (phone swipe, playful tiny text, baguette staff optional), without overwhelming the game-dev identity. No gameplay changes made in this ideation turn.
