import { describe, expect, it } from "vitest";
import type { MissionDirectory } from "../../types/mission";
import {
	createBaseCommandRegistry,
	executePipedCommand,
	filterCommandRegistry,
} from "../registry";
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

		it("should include help and hint commands even if not explicitly allowed", () => {
			const baseRegistry = createBaseCommandRegistry(["ls"]);
			const allowedCommands = ["ls"];
			const filteredRegistry = filterCommandRegistry(
				baseRegistry,
				allowedCommands,
			);

			expect("ls" in filteredRegistry).toBe(true);
			expect("help" in filteredRegistry).toBe(true);
			expect("hint" in filteredRegistry).toBe(true);
		});

		it("should handle empty allowed commands but still include hint and help", () => {
			const baseRegistry = createBaseCommandRegistry(["ls", "pwd"]);
			const filteredRegistry = filterCommandRegistry(baseRegistry, []);

			expect(Object.keys(filteredRegistry).sort()).toEqual(["help", "hint"]);
		});
	});

	describe("executePipedCommand", () => {
		it("should execute single command without pipes", () => {
			const registry = createBaseCommandRegistry(["pwd"]);
			const gameState = createMockGameState();

			const result = executePipedCommand("pwd", gameState, registry);

			expect(result.output).toEqual(["/"]);
		});

		it("should execute piped head | tail command", () => {
			const registry = createBaseCommandRegistry(["cat", "head", "tail"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content =
					"line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8";
			}

			const result = executePipedCommand(
				"cat test.txt | head -4 | tail -2",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["line3", "line4"]);
		});

		it("should handle head command with -n flag in pipe", () => {
			const registry = createBaseCommandRegistry(["cat", "head"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "line1\nline2\nline3\nline4\nline5";
			}

			const result = executePipedCommand(
				"cat test.txt | head -3",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["line1", "line2", "line3"]);
		});

		it("should handle tail command with -n flag in pipe", () => {
			const registry = createBaseCommandRegistry(["cat", "tail"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "line1\nline2\nline3\nline4\nline5";
			}

			const result = executePipedCommand(
				"cat test.txt | tail -2",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["line4", "line5"]);
		});

		it("should handle wc command in pipe", () => {
			const registry = createBaseCommandRegistry(["cat", "wc"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "word1 word2\nword3 word4";
			}

			const result = executePipedCommand(
				"cat test.txt | wc",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["2 4 23"]);
		});

		it("should handle grep command in pipe", () => {
			const registry = createBaseCommandRegistry(["cat", "grep"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "apple\nbanana\napricot\ncherry";
			}

			const result = executePipedCommand(
				"cat test.txt | grep ap",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["apple", "apricot"]);
		});

		it("should handle multiple pipes", () => {
			const registry = createBaseCommandRegistry([
				"cat",
				"head",
				"tail",
				"grep",
			]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content =
					"apple\nbanana\napricot\ncherry\navocado\nblueberry";
			}

			const result = executePipedCommand(
				"cat test.txt | head -5 | grep a",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["apple", "banana", "apricot", "avocado"]);
		});

		it("should return error when first command fails", () => {
			const registry = createBaseCommandRegistry(["cat", "head"]);
			const gameState = createMockGameState();

			const result = executePipedCommand(
				"cat nonexistent.txt | head -3",
				gameState,
				registry,
			);

			expect(result.output).toContain(
				"cat: nonexistent.txt: No such file or directory",
			);
		});

		it("should handle head command with different flag formats", () => {
			const registry = createBaseCommandRegistry(["cat", "head"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "line1\nline2\nline3\nline4\nline5";
			}

			const result1 = executePipedCommand(
				"cat test.txt | head -2",
				gameState,
				registry,
			);
			expect(result1.output).toEqual(["line1", "line2"]);

			const result2 = executePipedCommand(
				"cat test.txt | head -n2",
				gameState,
				registry,
			);
			expect(result2.output).toEqual(["line1", "line2"]);

			const result3 = executePipedCommand(
				"cat test.txt | head -n 2",
				gameState,
				registry,
			);
			expect(result3.output).toEqual(["line1", "line2"]);
		});

		it("should handle tail command with different flag formats", () => {
			const registry = createBaseCommandRegistry(["cat", "tail"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "line1\nline2\nline3\nline4\nline5";
			}

			const result1 = executePipedCommand(
				"cat test.txt | tail -2",
				gameState,
				registry,
			);
			expect(result1.output).toEqual(["line4", "line5"]);

			const result2 = executePipedCommand(
				"cat test.txt | tail -n2",
				gameState,
				registry,
			);
			expect(result2.output).toEqual(["line4", "line5"]);

			const result3 = executePipedCommand(
				"cat test.txt | tail -n 2",
				gameState,
				registry,
			);
			expect(result3.output).toEqual(["line4", "line5"]);
		});

		it("should handle edge case with empty file content", () => {
			const registry = createBaseCommandRegistry(["cat", "head"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "";
			}

			const result = executePipedCommand(
				"cat test.txt | head -5",
				gameState,
				registry,
			);

			expect(result.output).toEqual([""]);
		});

		it("should handle single line content", () => {
			const registry = createBaseCommandRegistry(["cat", "tail"]);
			const gameState = createMockGameState();
			const firstFile = gameState.filesystem.files[0];
			if (firstFile) {
				firstFile.content = "single line";
			}

			const result = executePipedCommand(
				"cat test.txt | tail -5",
				gameState,
				registry,
			);

			expect(result.output).toEqual(["single line"]);
		});
	});
});
