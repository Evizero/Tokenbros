import "./style.css";
import { Game } from "./game";
import { showRoster } from "./roster";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<section class="stage" aria-label="Tokenbros game"><canvas id="game" width="960" height="540" tabindex="0" aria-label="Tokenbros: use WASD or arrows to move and climb, mouse to aim, click to fire, scroll or 1 2 3 for thinking, Space to jump, F to reset, E to use your character ability, Escape to pause."></canvas><div class="scanlines"></div><div class="vignette"></div>
<div class="hud" hidden><div class="identity"><canvas class="portrait" width="64" height="64"></canvas><div><div class="name">TIBO</div><div class="role">THE RESET GUY</div><div class="health"><i></i><i></i><i></i></div></div></div><div class="status-mid">RATE-LIMIT REFINERY<strong id="objective">BREACH THE FACILITY →</strong></div><div class="resources"><div class="meter-label"><span id="resource-name">CLAWS</span><span id="usage">1,000 / 1,000</span></div><div class="meter-track"><div class="meter-trail"></div><div class="meter-fill"></div></div><div class="token-detail"><span id="token-cost">8 / SHOT · 125 SHOTS LEFT</span><span id="token-spend"></span></div><div class="thinking-control"><label for="thinking-slider"><span id="thinking-label">CLAW</span> <b id="thinking-level">LOW</b></label><input id="thinking-slider" type="range" min="0" max="100" step="0.1" value="0" aria-label="Thinking intensity"></div><div class="abilities"><div class="reset-label"><kbd>F</kbd><span id="reset-status">RESET ×2</span></div><span id="secondary-ready">E OTHER TIBO</span><span id="defense-ready">Q PRISM</span></div></div></div>
<div class="toast" aria-live="polite"></div><div id="hero-caption" class="sr-only" aria-live="polite" aria-atomic="true"></div>
<div class="overlay" id="overlay"></div>
<div class="touch"><div><button data-key="ArrowLeft" aria-label="Move left">←</button><button data-key="ArrowRight" aria-label="Move right">→</button></div><div><button data-key="ArrowUp" aria-label="Aim up or grab cable">↑</button><button data-key="Space" aria-label="Jump">JUMP</button><button data-key="KeyJ" aria-label="Fire">J</button><button data-key="KeyE" aria-label="Summon the other Tibo">E</button><button data-key="KeyQ" aria-label="Defend">Q</button><button data-key="KeyF" aria-label="Reset">F</button></div></div>
<button id="open-options" class="game-options">OPTIONS <span>☰</span></button>
<dialog id="options" aria-labelledby="options-title"><div class="options-heading"><div><div class="roster-kicker">TOKENBROS</div><h2 id="options-title">FIELD OPTIONS</h2></div><button id="close-options" class="text-btn">BACK ↩</button></div><div class="options-switches"><button id="sound">SOUND ON</button><button id="fullscreen">FULLSCREEN</button><button id="effects">SCREEN SHAKE: ON</button></div><h3>YOUR CONTROLS</h3><div class="controls"><span><kbd>W A S D</kbd> MOVE / CLIMB</span><span><kbd>SHIFT</kbd> QUIET WALK</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>MOUSE</kbd> <b id="control-fire">ATTACK / COMMAND</b></span><span><kbd>SCROLL ↑↓</kbd> <b id="control-scroll">CLAW TYPE</b></span><span><kbd>F</kbd> <b id="control-f">MOLT</b></span><span><kbd>E</kbd> <b id="control-e">THROW CLAW</b></span><span><kbd>Q</kbd> <b id="control-q">PRISM SHIELD</b></span><span><kbd>ESC</kbd> PAUSE</span></div><p class="options-note">ESC TO RETURN · Co-op keeps running while menus are open.</p></dialog></section>`;
const game = new Game(document.querySelector("#game")!);
showRoster(game);
document.querySelector("#effects")!.textContent =
  `SCREEN SHAKE: ${game.effects ? "ON" : "OFF"}`;
document.querySelector("#sound")!.addEventListener("click", () => {
  game.audio.start();
  game.audio.setMuted(!game.audio.muted);
  document.querySelector("#sound")!.textContent = game.audio.muted
    ? "SOUND OFF"
    : "SOUND ON";
});
document.querySelector("#effects")!.addEventListener("click", () => {
  game.effects = !game.effects;
  document.querySelector("#effects")!.textContent =
    `SCREEN SHAKE: ${game.effects ? "ON" : "OFF"}`;
});
document.querySelector("#fullscreen")!.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector(".stage")!.requestFullscreen();
  } catch {
    game.notify(
      "FULLSCREEN UNAVAILABLE",
      "Your browser can still play in this window.",
    );
  }
});
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-key]")) {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    game.press(b.dataset.key!);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(type, () => game.release(b.dataset.key!));
}
document
  .querySelector<HTMLInputElement>("#thinking-slider")!
  .addEventListener("input", (e) =>
    game.setThinking(
      (Number((e.target as HTMLInputElement).value) / 100) *
        (game.character === "marcus" ? 3 : 2),
    ),
  );
// Read-only observability for playtests; no gameplay cheats are exposed.
Object.defineProperty(window, "tokenbros", {
  value: { snapshot: () => game.snapshot() },
});

const options = document.querySelector<HTMLDialogElement>("#options")!;
const optionsButton =
  document.querySelector<HTMLButtonElement>("#open-options")!;
optionsButton.addEventListener("click", () => {
  if (game.state === "playing" && !game.coop.menu) game.pause();
  game.keys.clear();
  game.pointer.down = false;
  game.pendingShot = 0;
  game.hud();
  options.showModal();
});
document
  .querySelector("#close-options")!
  .addEventListener("click", () => options.close());
options.addEventListener("close", () => optionsButton.focus());
window.addEventListener(
  "keydown",
  (e) => {
    if (!options.open) return;
    e.stopImmediatePropagation();
    if (e.code === "Escape") {
      e.preventDefault();
      options.close();
    }
  },
  true,
);
document.addEventListener("fullscreenchange", () => {
  document.querySelector("#fullscreen")!.textContent =
    document.fullscreenElement ? "EXIT FULLSCREEN" : "FULLSCREEN";
});
