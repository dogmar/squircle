import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    cache: true,
    tasks: {
      fmt: {
        command:
          'bash -c \'OUT=$(vp fmt --check 2>&1); echo "$OUT"; ! echo "$OUT" | grep -q "Unable to load plugin"\'',
        dependsOn: ["@klinking/squircle#build"],
      },
      lint: {
        command: "vp lint",
      },
      ready: {
        command: "echo 'All checks passed'",
        dependsOn: ["fmt", "lint", "@klinking/squircle#test", "website#build"],
      },
      "sync-readme": {
        command: "bash scripts/sync-readme.sh",
        dependsOn: ["@klinking/squircle#build"],
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});
