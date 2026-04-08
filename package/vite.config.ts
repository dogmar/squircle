import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    include: ["src/**/*.test.ts"],
  },
  pack: {
    entry: {
      "tw-plugin": "./src/tw-plugin.ts",
      "tw-merge-cfg": "./src/tw-merge-cfg.ts",
    },
    format: "esm",
    dts: true,
  },
  run: {
    tasks: {
      test: {
        command: "vp test run",
      },
      build: {
        command: "vp pack && tsx scripts/generate-squircle-css.ts",
      },
    },
  },
});
