# Two-browser co-op implementation

Status: implementation and local production verification complete; ready for the GitHub Pages release. User authorized end-to-end delivery and deployment, including the required refactor. Preserve the five existing character kits and solo play.

## Accepted behavior

Two invite-only players, independent browser cameras and HUDs, no friendly fire, shields protect either teammate, individual deaths and a shared checkpoint. The host owns terrain, AI, damage, objectives and all gameplay entities. Host departure ends the room. Visual particles/decorative scrap and camera feedback are local. Host migration, accounts, matchmaking and more than two players are outside this iteration.

## Boundaries

1. **Player runtime:** one body, character, input, health, resources, cooldowns, abilities and lifecycle per actor. Existing ability algorithms operate against that actor's context and a shared world. Never swap one global active player to simulate somebody else.
2. **Shared world:** exactly one terrain, enemy list, projectile list, props, objectives, encounter controller and boss. Update world systems once per simulation tick. They consider all living players and all allied pets/controlled units.
3. **Browser presentation:** DOM, local input capture, local camera, HUD, menus and renderer. Remote actors cannot write the local HUD. Menus clear local controls while a co-op world continues.
4. **Session/protocol:** host/guest lifecycle and version handshake, bounded/validated input messages, ordered authoritative state updates, terrain updates and explicit disconnect/error UI. Full state transfer precedes play; stale inputs expire to neutral. Only host simulation may change the shared world.
5. **Replication:** stable object references for interactions (Pidalf holds, remote pairing, Pac-Man targets), allowlisted class state with local runtime methods retained. Cosmetic particles are reproduced locally from events, not streamed every frame. Input prediction uses the same player movement routine and reconciles with acknowledged host input.

## Transport and hosting

PeerJS/WebRTC with hosted signaling and explicit Google/Cloudflare STUN, compatible with the existing static GitHub Pages site. Room invite lives in the URL fragment and includes an unguessable join secret. Limit to one accepted guest; require matching game/protocol versions. No permanent TURN provider secret may be embedded in the static bundle. Detect connection failures with actionable retry UI; verify the shipped ICE configuration and document any relay limitation honestly.

## Delivery sequence

- Preserve baseline via existing tests and Git history; extract player/world/presentation boundaries.
- Run two independently controlled actors in one authoritative world, including duplicate character picks.
- Add host/join roster flow and actual WebRTC transport; synchronize initial state and ongoing state.
- Add local movement prediction, interpolation and cosmetic events without predicting enemy damage.
- Exercise all five kits from both seats, shared shield interception, no friendly fire, individual deaths, team wipe/checkpoints, host/guest disconnects, input timeout, reload/version mismatch, and movement under artificial delay.
- Run solo regression fixtures and production Pages smoke; commit/push and verify live co-op deployment.

## Important invariants

- Every physics/world tick occurs once, even with two actors.
- No UI or camera writes from a remote actor.
- Host validates actor identity, allowed controls, numeric ranges and packet sizes; guest does not send damage or world edits.
- No live object/class deserialization from arbitrary type names; decode only known state anchors and safe plain data.
- Ability ownership determines resource gain/kill rewards, including shared bullets and delayed effects.
- One player's death, menu or input loss does not reset the other player's controls or abilities.
- Held enemies, paired bots and projectiles have one owner; competing grabs/pairing resolve on the host.
- Falling/respawning does not erase the team's battle or reset a living teammate's boss.

## Verified implementation

- `PlayerRuntime` owns each bro and the existing ability instances. `SharedWorld` owns terrain, enemies, projectiles, objectives, encounters and shared checkpoints. `Game` provides local presentation and UI.
- The host steps gameplay at the existing 120 Hz. Guests send held controls, button edges, continuous mode value and world-space aim at 30 Hz. Inputs expire to neutral after 650 ms; connection loss ends the room after 15 seconds at most. Explicit departure messages end it immediately.
- Host snapshots run at up to 20 Hz with gzip compression and channel backpressure. Reference-preserving data graphs keep held enemies, hit sets, paired bots and targeted pets connected to their world entities. No constructors execute from the wire. Terrain is sent fully at join and by changed tile thereafter.
- Guest movement predicts using the same movement method and replays unacknowledged movement after a snapshot. LCD attacks remain authoritative because their movement destroys terrain and damages enemies. Remote bodies/enemies interpolate; particles, scrap and audio are generated locally from bounded events. A typical quiet test measured 25–35 KB/s, with the active opening map around 100 KB/s.
- Local menus neutralize controls while the shared fight continues. Cameras, HUDs and DOM writes belong to the local actor. Pairing/grabbing ownership resolves on the host. A dead host character does not disable enemy AI or reset the living guest's fight.

## Connectivity decision — 23 September 2026

PeerJS 1.5.5 bundles `eu-0.turn.peerjs.com` and `us-0.turn.peerjs.com`; both failed DNS lookup during actual forced-relay testing. The documented public Open Relay static-auth service also failed to produce a usable candidate in this environment. Do not imply these defaults provide reliable relay coverage.

The user explicitly chose **ship direct connections now; add a managed relay later**. The release therefore uses STUN and hosted signaling only. Some NAT/VPN/firewall combinations will fail and show an actionable error. No provider account was created, no payment plan was enabled, and no private credential is shipped. The `makePeer` connection configuration is the integration point for a future short-lived TURN credential service. Hosting remains GitHub Pages.

## Evidence

- 34 deterministic tests pass, including graph-reference preservation, malformed packet rejection and prototype protection.
- Two live WebRTC browser instances: invite, independent movement, guest crab deployment, identical shared state, independent HUD/camera, guest departure.
- All five characters tested from the guest seat with duplicate character choices, all scroll modes, attack input, defensive and special abilities; host departure ends the guest session.
- Shared-world fixture covers shields protecting teammates, no friendly fire, hostile damage to guest, AI during host death, individual respawn, nearby reset refill, kill attribution, competing grabs, full terrain/deltas, all five kit round trips and no predicted LCD damage.
- Injected 180 ms round-trip delay: immediate predicted movement, final host/guest positions matched, stale controls released correctly.
- Current solo regressions pass for pet power/threats/abilities, shields, Dimillian, Pidalf, Other Tibo, Marcus cartridges/LCD/invader/Pac-Man and wall climbing. The early `playtest-peter.js` fixture predates persistent pets/long throws and contains obsolete stock/order expectations; current Peter fixtures above are used instead.

- Production build under `/Tokenbros/`: all five portraits, intros and HUDs load without errors; a host Tibo / guest Peter session connects, moves, deploys a crab and handles departure. Fullscreen enters/exits from the lobby Options menu.

## Full-window game menus

Removed the surrounding website header, footer, control strip and frame. The roster fills the viewport; gameplay preserves its 16:9 camera with neutral letterboxing when needed, with HUD and pointer coordinates aligned to the actual play area. Sound, fullscreen, screen shake and character-specific controls live in a native modal Options menu accessible from the roster/lobby/pause screen. Escape closes it before other game shortcuts receive input. Mobile scroll stays inside the roster. Verified desktop and narrow-screen layout, sound toggling, and nested pause/options navigation.

## Deliberate limits

Two invited players, no host migration, no mid-mission rejoin, no internet-wide relay guarantee, and no background-host performance guarantee. This is cooperative play between friends, not an anti-cheat service: the host is authoritative and the invite holder is trusted to join the room. A build mismatch requires both friends to reload.
