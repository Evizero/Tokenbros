# First playable slice

Status: authorized by the user on 2026-09-22; implementation not yet completed when these notes were created.

## Goal

Prove that moving, firing, destroying terrain, triggering chain reactions, and pressing Tibo's RESET are enjoyable in a browser. This is a gameplay test, not a full campaign or a roster showcase.

## Target content

- One playable character: Tibo.
- One handmade Rate-Limit Refinery mission, around 90 seconds to a few minutes for a successful run.
- Three readable enemy behaviors, such as patrol gunner, elevated turret, and rushing bot.
- Destructible soft walls/cover, durable structural terrain, and explosive coolant barrels.
- Alternate upper and lower routes.
- Rescue / checkpoint interactions that restore resources and reduce retry friction.
- One Rate Limiter boss with a visible windup, shield/overheat cycle, and damage opportunity.
- Extraction, death/respawn, pause, and replay.
- Punchy original pixel rendering, procedural or authored sound, and the reset portrait transformation.

## Proposed encounter sequence

1. Shoot a weak wall and one basic bot.
2. Discover that a coolant tank can destroy a cluster.
3. Choose a rooftop approach or a lower route under turret fire.
4. Rescue a trapped developer and gain another attempt/resource refill.
5. Fight the Rate Limiter; its shield drops when it overheats.
6. Extract as the installation breaks apart.

The prototype can adjust this arrangement. Make the opening seconds useful for trying movement and shooting without immediately dying.

## Resource / input expectations

- Tibo's sustained weapon has one USAGE meter; empty still permits a basic shot.
- RESET has a separate limited charge; it cannot regenerate itself.
- Reset grants a short empowered burst and avatar transformation.
- Keyboard controls must be visible and remappable in code. Mouse aiming is useful if it does not interfere with keyboard-only play.
- Controller support is desirable; do not hide basic controls behind it.
- Audio starts after player interaction. Pause on lost focus so changing tabs is safe.
- Stable movement and hitboxes through visual transformations.

## Success criteria

1. Shooting is satisfying before the player understands the jokes.
2. At least one destroyed wall/floor changes the player's path or enemy positioning.
3. One explosion can visibly trigger another object, with consistent damage behavior.
4. RESET changes the outcome of a pressured encounter and is unmistakable in sound/visuals.
5. Player and hostile shots remain readable during the largest effect.
6. Death leads quickly back to play; checkpoints do not spawn the player inside broken terrain or enemies.
7. The mission can actually be completed and replayed without reloading the browser.
8. Desktop browser runs without uncaught errors; performance remains bounded during debris-heavy fights.

## Technical guidance

Use a fixed simulation step, grid-based terrain collision/destruction, bounded particle counts, and swept or sub-stepped fast projectile collision. Make checkpoint/reset semantics explicit. Destroyed cover must not create an unrecoverable mandatory route.

The original stack recommendation was Phaser / TypeScript / WebGL. The initial project scaffold currently uses TypeScript and Vite; the rendering choice can be lighter for this slice. No multiplayer server, account, backend, or live LLM call is required.

## Deferred until the basic loop works

Multiple playable characters, progression, multiple worlds, online co-op, general physical simulation of every debris piece, procedural levels, live model integration, and extensive story.

Optional one-hit mode can test the original's lethality; the first pass can use a small health allowance to make combat feel testing more productive. Record the actual choice in the implementation README.
