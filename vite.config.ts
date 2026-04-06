import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    cache: true,
    tasks: {
      "sync-readme": {
        command: "bash scripts/sync-readme.sh",
        dependsOn: ["@klinking/tw-squircle#build"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});
