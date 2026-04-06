import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    cache: true,
    tasks: {
      "sync-readme": {
        command: "bash scripts/sync-readme.sh",
        dependsOn: ["@klinking/tw-squircle#build", "@klinking/tw-squircle#generate:css"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});
