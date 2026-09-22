# Iteration 011 — Q defense

User direction: add a non-permanent defensive ability, timing-based for one character and a deployable shield for another; Peter’s shield can carry the rainbow motif. Clarification: Peter’s shield must remain at its world position and protect whoever is behind it, rather than following him.

Tibo: directional 220ms parry, first 100ms reflects bullets with 3 damage and cleared hit history, later window absorbs. At most two shots; 2.2-second cooldown. Follows player position but locks aim angle. No added invulnerability, automatic repeat, or passive shield.

Peter: stationary Prism up to 60px forward (deployment center stops at terrain). A small six-color barrier lasts 1.8 seconds or three hits, cooldown 6.5 seconds. Interception occurs before pet/player collision, so it protects either behind the fixed plane. Moving Peter cannot move it. Limited front-facing span and one-way interception; friendly bullets pass. Explosions and contact damage are not intercepted. Replaces the earlier rainbow glint; no global palette change.

Geometry uses swept segment/plane intersection to handle fast shots and angled aim, finite width and front/back direction. Active defense clears on death/restart; readiness resets on respawn. Pausing does not consume active-play duration. HUD shows Q name, remaining hits while active, and cooldown.

Validation: build, 30 deterministic checks, isolated browser fixtures for stationary pet protection while Peter moves away, three-hit break, duration expiry, cooldown denial, rear/friendly shots, perfect reflection into original shooter, later block, expiry vulnerability, holding Q without repeat, and death/respawn cleanup. Narrow HUD containment checked. No full-mission completion claim.
