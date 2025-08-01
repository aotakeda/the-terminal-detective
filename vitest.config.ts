import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		globals: true,
	},
	esbuild: {
		jsx: "automatic",
	},
});
