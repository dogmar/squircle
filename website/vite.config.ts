import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      dev: {
        command: "astro dev",
        dependsOn: ["@klinking/squircle#build"],
      },
      build: {
        command: "astro build",
        dependsOn: ["@klinking/squircle#build"],
      },
    },
  },
});
