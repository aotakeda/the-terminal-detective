import { describe, expect, it } from "vitest";
import type { MissionObjective } from "../../types/mission";
import {
	catCommand,
	cdCommand,
	findCommand,
	grepCommand,
	headCommand,
	hintCommand,
	lsCommand,
	pwdCommand,
	sortCommand,
	tailCommand,
	uniqCommand,
	wcCommand,
} from "../handlers";
import type { GameState } from "../types";

const createMockGameState = (
	objectives: MissionObjective[] = [],
): GameState => ({
	currentDirectory: "/",
	filesystem: { name: "/", files: [], subdirectories: [] },
	objectives,
	completedObjectives: [],
	missionCompleted: false,
});

describe("Command Handlers", () => {
	it("should export all command handlers", () => {
		expect(lsCommand).toBeDefined();
		expect(cdCommand).toBeDefined();
		expect(pwdCommand).toBeDefined();
		expect(catCommand).toBeDefined();
		expect(grepCommand).toBeDefined();
		expect(headCommand).toBeDefined();
		expect(tailCommand).toBeDefined();
		expect(wcCommand).toBeDefined();
		expect(sortCommand).toBeDefined();
		expect(uniqCommand).toBeDefined();
		expect(findCommand).toBeDefined();
		expect(hintCommand).toBeDefined();
	});

	it("should return array output for ls command", () => {
		const state = createMockGameState();
		const result = lsCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for pwd command", () => {
		const state = createMockGameState();
		const result = pwdCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for cd command", () => {
		const state = createMockGameState();
		const result = cdCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for cat command", () => {
		const state = createMockGameState();
		const result = catCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for grep command", () => {
		const state = createMockGameState();
		const result = grepCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for head command", () => {
		const state = createMockGameState();
		const result = headCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for tail command", () => {
		const state = createMockGameState();
		const result = tailCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for wc command", () => {
		const state = createMockGameState();
		const result = wcCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for sort command", () => {
		const state = createMockGameState();
		const result = sortCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for uniq command", () => {
		const state = createMockGameState();
		const result = uniqCommand("", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	it("should return array output for find command", () => {
		const state = createMockGameState();
		const result = findCommand(".", state);
		expect(Array.isArray(result.output)).toBe(true);
	});

	describe("hint command", () => {
		it("should return completion message when all objectives are completed", () => {
			const state = createMockGameState([
				{
					id: "obj1",
					description: "Test objective 1",
					completed: true,
					hint: "Test hint 1",
				},
				{
					id: "obj2",
					description: "Test objective 2",
					completed: true,
					hint: "Test hint 2",
				},
			]);

			const result = hintCommand("", state);
			expect(result.output).toEqual([
				"All objectives completed! Great work, Detective.",
			]);
		});

		it("should show hint for first incomplete objective with hint", () => {
			const state = createMockGameState([
				{
					id: "obj1",
					description: "Test objective 1",
					completed: true,
					hint: "Test hint 1",
				},
				{
					id: "obj2",
					description: "List directory contents",
					completed: false,
					hint: 'Use "ls" to see what files and folders are available',
				},
				{
					id: "obj3",
					description: "Test objective 3",
					completed: false,
					hint: "Test hint 3",
				},
			]);

			const result = hintCommand("", state);
			expect(result.output).toEqual([
				"HINT:",
				"",
				"Objective: List directory contents",
				"",
				'Use "ls" to see what files and folders are available',
				"",
			]);
		});

		it("should show no hint message when objective has no hint", () => {
			const state = createMockGameState([
				{
					id: "obj1",
					description: "Test objective without hint",
					completed: false,
				},
			]);

			const result = hintCommand("", state);
			expect(result.output).toEqual([
				"HINT:",
				"",
				"Objective: Test objective without hint",
				"",
				"No specific hint available for this objective.",
				"",
			]);
		});

		it("should show first incomplete objective when multiple incomplete exist", () => {
			const state = createMockGameState([
				{
					id: "obj1",
					description: "First incomplete",
					completed: false,
					hint: "First hint",
				},
				{
					id: "obj2",
					description: "Second incomplete",
					completed: false,
					hint: "Second hint",
				},
			]);

			const result = hintCommand("", state);
			expect(result.output).toContain("Objective: First incomplete");
			expect(result.output).toContain("First hint");
			expect(result.output).not.toContain("Second incomplete");
			expect(result.output).not.toContain("Second hint");
		});

		it("should handle empty objectives array", () => {
			const state = createMockGameState([]);

			const result = hintCommand("", state);
			expect(result.output).toEqual([
				"All objectives completed! Great work, Detective.",
			]);
		});

		it("should return array output", () => {
			const state = createMockGameState();
			const result = hintCommand("", state);
			expect(Array.isArray(result.output)).toBe(true);
		});
	});
});
