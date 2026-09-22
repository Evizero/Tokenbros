# Iteration 010 — companions, not ammunition

User feedback: Peter's creatures felt like gun/grenade projectiles; the held weapon should reflect selected mode.

Implemented persistent four-pet pack with stable identities and visible health. E deployment is a short, harmless toss. No seven-second expiry or oldest-pet replacement. Pets follow and idle near Peter, independently engage nearby visible enemies, focus click-marked targets, then regroup after the target dies. Clicking near Peter recalls orders. Pincher clings/bites, Skipper orbits/darts, Crusher approaches and crushes. Enemy bullets can kill them. Distant/stuck pets visibly recall in a bubble to bridge platforms; this is intentional assistance rather than a full navigation graph.

The HUD now counts active pack slots. Reserve recruits still regrow, for replacing casualties. A full pack blocks new deployment without consuming reserves or replacing pets.

Held equipment follows mode: Tibo has compact SMG, forked pulse weapon, long twin-rail gun. Peter holds the matching colored/shaped creature; Molt still uses fists. The larger scroll feedback and swapped controls from iteration 009 are retained.

Validation: production build, 27 deterministic tests, browser fixtures for 20-second persistence/identity, full-pack protection, moving-owner following, elevation catch-up, harmless deployment, commanded target death and regroup, Crusher shield break, pet mortality, and command inputs. Screenshots cover all three held forms for both characters plus the idle pack. No full-mission completion claim.
