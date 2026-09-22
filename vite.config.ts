import { defineConfig } from "vite";
import { execSync } from "node:child_process";
let revision = "development";
try {
  revision = execSync("git rev-parse --short HEAD", {
    encoding: "utf8",
  }).trim();
} catch {}
export default defineConfig(({ command }) => ({
  define: {
    __COOP_BUILD__: JSON.stringify(
      command === "serve" ? "development" : revision,
    ),
  },
}));
