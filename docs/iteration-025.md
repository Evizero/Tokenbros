# Iteration 025 — character selection overview

User request: start with a proper overview screen showing the playable characters in a grid.

The title screen now presents Tibo, Peter and Dimillian together in three large selectable portrait tiles. Neutral charcoal surfaces keep their green, red and purple character accents distinct. Each portrait shows the name, role and playstyle; the selected character's short description and E/Q/F abilities appear beside Deploy. The existing local introduction portraits are reused without modification.

Selection does not deploy automatically. Clicking Deploy starts the selected bro's existing entrance. Arrow keys cycle the roster, Home/End jump to its ends, and native Space/Enter activate focused buttons. The initial menu accepts Enter/Space to deploy the current selection. Buttons expose the selected state to assistive technology; reduced-motion settings disable entrance and hover animation.

Pause → Switch Bro now returns to this grid with the current selection retained. Choosing and deploying another bro starts a fresh mission, as switching did before. Gameplay clears the roster sizing and restores its original aspect ratio. The menu remains usable at narrow widths with closer portrait crops, and the shared overlay continues to handle intro and pause normally.

Visual thesis: a game-roster poster of three recognizable operatives against a neutral charcoal field. Content: brand/selection heading, portrait grid, selected kit and Deploy. Motion: staggered entrance, portrait emphasis on hover/selection, and a short selected-color underline reveal.

Validation: production build passes. `scripts/playtest-roster.js` checks all three images, exclusive selection, correct deployment, return through pause, keyboard wrap/Space/End/Enter, and layouts at 1280×800, 800×700, 390×844 and 1280×600. Updated `playtest-dimillian-ui.js` passes actual mouse, wheel and keyboard gameplay after the new roster flow. Zero page errors. Desktop and narrow-screen captures inspected in `output/playwright/roster-*-v25.png`. All automation runs in the isolated QA browser.
