# Dimillian: charged lightning and expanding mage shield

Mage primary now charges a single hitscan lightning discharge at the staff gem. A tap releases a small bolt; holding never auto-fires, even at full charge. Release spends the charge. Charge reaches full in 1.15 seconds, increases damage from 3 to 12, and adds one chain hop per third of charge (four bots total). The first ray reaches 440px; hops select distinct nearby hostile bots within 150px and respect terrain. Friendly controlled bots are excluded. Pause, form changes, death and the meteor cancel the charge.

Feedback: inward sparks, growing electric gem, a nearby charge bar with chain unlock pips, a FULL CHARGE flash and two-tone ready chime. Release uses a jagged white-core violet bolt, sparks, a small expanding discharge ring, crack/bass sounds and charge-scaled hit feedback. HUD and the actual-gameplay roster reel describe and demonstrate charge/release.

Mage Q grows from the player's center to the existing 56px radius over 180ms. Its expanding rim shoves enemies, mobile barrels and grenades, with terrain occlusion and no friendly shove. Incoming shots caught during expansion reflect outward and become friendly. Each reflection uses 20 shield HP. Once expanded, the bubble absorbs using the existing damage-based shield cost. Shield regeneration, partial reuse and depletion lock remain unchanged. A reused bubble grows again. Baguette bunker and ship directional shield retain their behavior.

Validation: production build, unit suite, browser lightning/charge/shield checks, full Dimillian regression and all 27 roster previews. Visual captures in ignored output/playwright. Local only.

## Outfit and movement follow-up

Mage form wears a tall, slightly bent purple hat and an ankle-length purple robe with gold trim, shaded folds and a swaying hem. Glasses and beard remain visible. The small HUD portrait is reframed to fit the hat.

Duelist gets one immediate airborne double jump (Space). Mage keeps the instant ground jump; release that initial jump, then hold Space again in the air for 320ms to ready the portal. This freezes the fall for aiming, with a destination preview. Release teleports a fixed maximum 560px toward the cursor, with paired blue-violet oval portals, sparks and a rising/falling sound. Holding longer does not increase range. Teleport passes through intervening walls. Body-size destination checks search backward from the aimed endpoint when it is solid or outside the map; no valid landing leaves the player in place. Landing restores the shared duelist/mage air move; swapping forms does not reset it. Pilot retains continuous flight. HUD controls and roster tips are updated.

Additional checks: all existing vertical abilities, new double jump and teleport inputs, landing refill, terrain safety, pause cancellation, form-swap limits, ship flight, plus lightning-origin regression with the new outfit. Visuals inspected in the isolated browser.

Balance follow-up: lightning now deals 3 damage on a tap, scaling to 12 at full charge on every chained target, barrels and vulnerable bosses. Terrain takes the same damage; reinforced tiles remain indestructible.

## Body animation

Mage charging now bends the knees, leans back and raises the staff; the free hand gathers energy. Release leans and thrusts forward with robe and hat follow-through. Tap motion is intentionally subtle (22% of full-charge drive), while charged casts retain the full animation. The shared pose transform supplies the rendered staff gem and lightning origin; browser checks compare them across 42 combinations of facing, aim and animation.

Teleport readiness tucks the character into a pose. Departure leaves a brief shrinking character image at the entrance, and the arriving sprite stretches out of the exit and settles over 240ms. These are visual transforms only; movement timing and collision bodies stay unchanged.

## iPhone bunker and remote bodyguard

The handheld and deployed phones now share black glass, rounded titanium edges, camera pill and home indicator. Deployed Q unfolds into a tall iPhone, with Dimillian drawn as a sprite inside a miniature scene on its screen. The screen battery displays shield health. Protective bounds match the new taller phone.

Duelist Q is a toggle: tap to enter, tap again to leave. Releasing the key keeps the bunker active. Breakage automatically returns movement control. The phone now has 200 effective HP (damage costs half the shared 0–100% shield meter); regeneration/depletion lock stay shared. Mage and pilot Q still use hold/release.

E pairs through walls within the existing pairing range. One linked bot stays as a following bodyguard and automatically attacks nearby visible hostile bots; there is no six-second expiry. While bunkered, WASD drives the bot, Space/W jumps (or ascends for drones), mouse aims/fires, and the camera follows the bot. Toggling out returns camera and movement to Dimillian. Link ends on bot death, form change, player cleanup or excessive separation. Bullets still respect terrain. Pair replacement retains E cooldown.

Validated toggle entry/exit, shield break and doubled durability, pairing through walls, persistent following, autonomous fire, direct movement/jump/drone steering, mouse fire, camera return and lifecycle cleanup; full character regression and roster demos.

## Remote overclock, ladders and phone origin

Controlled ground bots climb existing ladders with W/S, hold their rung when released, exit at either end, and jump off with Space or detach sideways. Drones retain free flight. Direct control overclocks movement (285px/s ground), jump strength and weapons (1.75x projectile damage, 0.55x firing interval; stronger runner melee). Electric arcs, sparks and OVERCLOCK labeling distinguish direct control from the unchanged bodyguard strength. Leaving the bunker clears climbing and overclock state.

The bunker now grows from the position and dimensions of the phone in his off hand over 240ms. The outside body fades into the screen's miniature game scene, and the screen avatar has stowed weapons/phone: there is no duplicate handheld iPhone. Verified with transition frames and remote/character/roster gameplay checks.

## Sheep cast and pilot rocket

Mage E now starts with a staff flourish and launches a cream/lilac spell from its gem. It travels in a short arc to the selected bot before transforming it, with wool puffs, sparkles, a squash/bounce and soft rising/popping tones. Terrain can intercept it; dead or newly friendly targets cancel it. The existing six-second sheep effect and wake-on-damage remain.

Pilot F replaces Overdrive with one mouse-aimed heavy rocket: immediate recoil, accelerating flight, exhaust trail, 118px blast, 16 damage, heavy knockback and destructible terrain impact. Cooldown is nine seconds. Cannon cadence and damage remain normal during the shot. The roster preview demonstrates a single rocket breaking a clustered defense.

Pilot forward speed is 360px/s, reverse 205, vertical 245; diagonal input is normalized. Main exhaust drives forward movement, nose jets reverse/brake, and belly/roof jets handle vertical correction. Corrective flames have an intermediate size below the main engine's output. Belly jets maintain a visible softly fluctuating idle flame to convey hover support, growing stronger on ascent. Releasing movement brakes into a stable hover.

Validated sheep origin/travel/transformation/cleanup, rocket recoil/damage/collisions/friendly immunity, flight speeds/thruster direction, existing character and movement regressions, all 27 roster demonstrations, production build and 34 unit tests. Changes remain local.

## Forward surge, steering and ram ejection

Forward input now starts at 270px/s immediately and builds speed. A pressure wave appears after roughly 0.38 seconds; at 0.55 seconds the ship enters mouse-steered rocket flight, continuing toward 620px/s. The original held thrust direction remains latched across mouse turns. The nose turns smoothly, wings tuck, the pilot lowers beneath a canopy, exhaust grows and air streaks trail behind. Releasing thrust or pressing the opposite direction brakes back into an upright hover over a short animated transition.

While the pressure wave is active, cannons, E bombs and F rockets are locked. The nose sweeps collisions and deals 6–12 damage according to speed, with heavy knockback and destructible-cover damage. Each bot is hit once per continuous pass. Impacts spend momentum: drone 70px/s, ordinary bot 115, armored bot/turret 185, barrel 90, soft tile 45, hard breakable tile 85, vulnerable boss 300. Reinforced walls stop the hull. Friendly bots are skipped.

When impacts spend the ram below 390px/s, or the charged ship hits an immovable obstacle, an 88px burst deals 5 damage and knocks nearby enemies away. Ship panels scatter and Dimillian ejects upward into duelist form, with 0.3 seconds of contact grace. Automatic ejection suppresses the form-switch overlay and wireframe; normal manual form switching retains them. The player can immediately choose the ship again, starting a fresh acceleration. Open-air braking stays in pilot form.

Validated immediate motion, acceleration, the brief sonic-to-steering phase, mouse-facing reversals, brake/hover, weapon lock and recovery, momentum loss, multi-hit limits, explosive ejection, silent automatic form switching, returning to pilot, cover occlusion, friend safety, prediction safety and cleanup. Existing character, rocket and roster checks remain passing.
