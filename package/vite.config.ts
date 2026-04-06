import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    include: ["src/**/*.test.ts"],
  },
  pack: {
    entry: {
      plugin: "./src/plugin.ts",
      merge: "./src/merge.ts",
    },
    format: "esm",
    dts: true,
    copy: ["generated/squircle.css"],
  },
  run: {
    tasks: {
      "generate:css": {
        command: "tsx scripts/generate-squircle-css.ts",
      },
      build: {
        command: "vp pack",
        dependsOn: ["generate:css"],
      },
    },
  },
});
