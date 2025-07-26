import { describe, expect, it } from "vitest";
import type { MissionDirectory } from "../../types/mission";
import { createBaseCommandRegistry, filterCommandRegistry } from "../registry";
import type { GameState } from "../types";

const createMockGameState = (): GameState => {
	const filesystem: MissionDirectory = {
		name: "/",
		files: [
			{ name: "test.txt", content: "test content" },
			{ name: "data.log", content: "log data" },
		],
		subdirectories: [
			{
				name: "docs",
				files: [{ name: "readme.md", content: "readme" }],
			},
		],
	};

	return {
		currentDirectory: "/",
		filesystem,
		objectives: [],
		completedObjectives: [],
		missionCompleted: false,
	};
};

describe("Command Registry", () => {
	describe("createBaseCommandRegistry", () => {
		it("should create registry with all commands", () => {
			const commands = ["ls", "cd", "pwd"];
			const registry = createBaseCommandRegistry(commands);

			expect("ls" in registry).toBe(true);
			expect("cd" in registry).toBe(true);
			expect("pwd" in registry).toBe(true);
			expect("cat" in registry).toBe(true);
		});

		it("should include help command", () => {
			const commands = ["ls"];
			const registry = createBaseCommandRegistry(commands);

			expect("help" in registry).toBe(true);
		});

		it("should handle empty command list", () => {
			const registry = createBaseCommandRegistry([]);

			expect("help" in registry).toBe(true);
			expect(Object.keys(registry).length).toBeGreaterThan(1);
		});

		it("should provide all commands in base registry", () => {
			const commands = ["ls", "pwd"];
			const registry = createBaseCommandRegistry(commands);

			expect("ls" in registry).toBe(true);
			expect("pwd" in registry).toBe(true);
			expect("cat" in registry).toBe(true);
			expect("grep" in registry).toBe(true);
		});

		it("should execute valid command", () => {
			const registry = createBaseCommandRegistry(["pwd"]);
			const gameState = createMockGameState();

			const result = registry.pwd?.handler("", gameState);

			expect(Array.isArray(result?.output)).toBe(true);
			expect(result?.output?.[0]).toBe("/");
		});

		it("should handle command with arguments", () => {
			const registry = createBaseCommandRegistry(["cat"]);
			const gameState = createMockGameState();

			const result = registry.cat?.handler("test.txt", gameState);

			expect(Array.isArray(result?.output)).toBe(true);
			expect(result?.output).toEqual(["test content"]);
		});

		it("should provide command descriptions", () => {
			const registry = createBaseCommandRegistry(["ls", "pwd"]);

			expect(registry.ls?.description).toBe("List directory contents");
			expect(registry.pwd?.description).toBe("Print working directory");
		});

		it("should handle help command", () => {
			const registry = createBaseCommandRegistry(["ls", "pwd"]);
			const gameState = createMockGameState();

			const result = registry.help?.handler("", gameState);

			expect(Array.isArray(result?.output)).toBe(true);
			expect(result?.output?.[0]).toBe("Help Menu");
		});
	});

	describe("filterCommandRegistry", () => {
		it("should filter registry to only allowed commands", () => {
			const baseRegistry = createBaseCommandRegistry(["ls", "cat", "pwd"]);
			const allowedCommands = ["ls", "cat"];
			const filteredRegistry = filterCommandRegistry(
				baseRegistry,
				allowedCommands,
			);

			expect("ls" in filteredRegistry).toBe(true);
			expect("cat" in filteredRegistry).toBe(true);
			expect("pwd" in filteredRegistry).toBe(false);
			expect("grep" in filteredRegistry).toBe(false);
		});

		it("should include help command even if not explicitly allowed", () => {
			const baseRegistry = createBaseCommandRegistry(["ls"]);
			const allowedCommands = ["ls"];
			const filteredRegistry = filterCommandRegistry(
				baseRegistry,
				allowedCommands,
			);

			expect("ls" in filteredRegistry).toBe(true);
			expect("help" in filteredRegistry).toBe(false);
		});

		it("should handle empty allowed commands", () => {
			const baseRegistry = createBaseCommandRegistry(["ls", "pwd"]);
			const filteredRegistry = filterCommandRegistry(baseRegistry, []);

			expect(Object.keys(filteredRegistry)).toEqual([]);
		});
	});
});
