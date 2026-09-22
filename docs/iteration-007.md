# Iteration 007 — escalation and physical abilities

User direction: consolidate the thinking panel into a game HUD; explosions should alert much farther away; encounters need more activity and challenge; RESET should have a local explosion instead of a power-up; E was unclear and uninteresting.

Visual thesis: compact arcade ammunition and power gauges over the refinery, with the action taking most of the screen. Content: tokens and shots, one continuous thinking gauge, F/E readiness. Interaction: smooth scrolling and color response, spent-token trail, world-space arrival markers and a physical electric tether.

## Implemented for playtesting

- Removed the bottom-left thinking card, preset buttons, weapon description, percentage, and duplicate cooldown display. One small gauge beside ammo retains continuous wheel/drag control and keyboard presets. Recovery remains on the crosshair.
- Ordinary explosions hearable at 1,300px, large blasts/RESET at 1,600px. Cover reduces blast range to 80%; other noises retain 55%. Loud investigations retain the event location for eight seconds. Alerted distant guards keep updating; only distant idle patrols sleep.
- Confirmed sightings rally nearby allies within 340px to investigate the observed point. Allies still need their own sight confirmation to shoot.
- Four extra mixed patrol placements, faster enemy bullets (265px/s), a narrow two-projectile gunner fan, faster ground investigation (85px/s).
- Three fixed security beacons. The nearest beacon within 900px of a blast flashes and marks arrivals for 2.4 seconds, then sends two drones. Each responds once per mission. No endlessly spawning waves; no hidden tracking of Tibo. The world now reacts visibly to loud combat.
- F still throws the button and slams at 660ms. The impact restores 1,000 tokens and causes a 110px local explosion, terrain damage, debris, and barrel chains. It clears hostile bullets within 130px and still overrides nearby uplinks. No overdrive, free ammunition window, boosted cadence, transformation, or automatic turret conversion.
- E is now MAGNETIC YOINK (a prototype proposal prompted by the user's feedback): visible target bracket, electric tether, permanent armor removal, one damage, attack interruption, upward pull toward Tibo, three-second recovery. Range 280px with a narrow aiming cone and line of sight. Misses recover in 350ms. Pulled robots can trigger barrels and collide with other robots. It is free, so it remains useful when out of tokens.

The existing youth/profile-picture meme remains in the character lore; its former overdrive implementation is retired. Future visual uses must not silently reintroduce the rejected power-up.

## Validation

Build and 25 deterministic tests pass. Isolated browser fixtures verify distant blast hearing with cover and range cutoff; telegraphed, bounded reinforcements; ally investigation; delayed refill and local damage; normal paid shots immediately after RESET; physical shield stripping/pull; barrel collision; cover blocking E; continuous scroll and draggable HUD gauge. No runtime errors in that pass. See testing.md and scripts/playtest-escalation.js.

Difficulty tuning remains a playtest judgment. Ground bots still stop/search at ledges rather than navigating the whole platform network. This iteration is not a complete world rebuild or a fresh full-mission completion test.
