# Iteration 008 — Peter, physical throwables and character color

Peter is the second selectable character and default title-screen choice. Tibo remains available. Escape → Switch Bro restarts as the other character. See [Peter's character bible](characters/peter.md) and [current controls](../README.md).

User direction additionally changed Tibo's reset into a physical throwable. It is now an aimed, gravity-driven body colliding with world tiles. Side collisions reduce/reverse horizontal velocity. Falling continues until landing; the hand's 400ms wind-up starts at ground contact, then applies the existing refill/local explosion. If its support disappears before impact, it resumes falling. Buttons lost below the map expire without an airborne refill. Grounded hand animation is separate from flight. Normal fire remains unboosted.

The overall world/UI is neutral slate, steel and concrete, with warm marked breakable crates and orange explosives. Peter's UI/navigation accents are coral red; Tibo's are lime. Weapon-type colors remain functional. Peter's tiny rainbow glint appears only as command/transformation terminal windows close. No permanent rainbow outfit or sexuality joke.

Validation: production build and 27 deterministic tests; isolated browser fixtures and live input smoke checks. Pet navigation intentionally stays local and can be blocked by terrain. This is not a full-mission completion claim or settled difficulty balance.
