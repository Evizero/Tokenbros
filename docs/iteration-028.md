# Iteration 028 — game-native balloons and environmental tips

User rejected the colored left border on reaction popups because it felt like a web tooltip. They also asked for tutorial tips to belong to the map as billboards, banners or other physical structures.

Hero dialogue now uses a single warm-paper pixel speech balloon with stepped corners, a dark ink outline and an integrated tail toward the character. The colored side stripe and character-name header are removed. Text remains short, wrapped and centred; the existing live region still identifies the speaker for accessibility. Balloons sit closer to the character and lift above temporary ability/resource feedback when needed. Event triggers and chatter timing are unchanged.

All nine tutorial signs are now world-space scenery with three treatments: framed billboards with poles, cross-bracing, lamps and bolts; hanging fabric banners with rope loops, gantry supports and subtle pixel sway; and weathered metal plates bolted to structural posts. Their support endpoints are placed at corresponding ground, roof or platform heights. Copy is preserved. The signs render over factory wall faces but behind terrain and actors, so the buildings do not hide them. Duplicate floating climb/cable/route hints were removed in favor of the physical signage. The signs are background decoration, not new collision surfaces. Gameplay showcases still suppress tutorial scenery.

Persistent visual preference: avoid colored left-edge accent stripes and web-tooltip styling for game popups. Use the game's pixel-art vocabulary and physical world cues.

Validation: production build passes; the existing hero-dialogue fixture still passes and refreshed balloon captures were inspected. `playtest-world-signs.js` captures four actual map regions (opening, tower, cable, second feed) with zero page errors; opening/tower/cable captures were inspected. These are visual changes; collision behavior was not changed and no redundant unit tests were added.
