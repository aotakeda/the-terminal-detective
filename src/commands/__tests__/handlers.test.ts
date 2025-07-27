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

	describe("find command", () => {
		it("should support -name flag syntax", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{
							name: "secret_evidence.txt",
							content: "secret content",
							hidden: false,
						},
						{ name: "report.txt", content: "report content", hidden: false },
					],
					subdirectories: [
						{
							name: "documents",
							files: [
								{
									name: "evidence_log.txt",
									content: "evidence content",
									hidden: false,
								},
							],
							subdirectories: [],
						},
					],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = findCommand(". -name evidence", state);
			expect(result.output).toContain("/secret_evidence.txt");
			expect(result.output).toContain("/documents/evidence_log.txt");
		});

		it("should work with simplified syntax for backward compatibility", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{
							name: "secret_evidence.txt",
							content: "secret content",
							hidden: false,
						},
					],
					subdirectories: [],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = findCommand("evidence", state);
			expect(result.output).toContain("/secret_evidence.txt");
		});
	});

	describe("grep command", () => {
		it("should support recursive search with -r flag", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{ name: "file1.txt", content: "password: admin123", hidden: false },
					],
					subdirectories: [
						{
							name: "documents",
							files: [
								{
									name: "file2.txt",
									content: "no password here",
									hidden: false,
								},
								{
									name: "secret.txt",
									content: "secret password: admin123",
									hidden: false,
								},
							],
							subdirectories: [],
						},
					],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = grepCommand("-r password", state);
			expect(result.output).toContain("/file1.txt:password: admin123");
			expect(result.output).toContain(
				"/documents/secret.txt:secret password: admin123",
			);
		});

		it("should support case insensitive search with -i flag", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{ name: "file1.txt", content: "CONFIDENTIAL data", hidden: false },
					],
					subdirectories: [],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = grepCommand("-ri confidential", state);
			expect(result.output).toContain("/file1.txt:CONFIDENTIAL data");
		});

		it("should support count with -c flag", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{
							name: "file1.txt",
							content: "suspect was here\nsuspect left clues\nno evidence",
							hidden: false,
						},
					],
					subdirectories: [],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = grepCommand("-rc suspect", state);
			expect(result.output).toContain("/file1.txt:2");
		});

		it("should find TOP SECRET with case insensitive search", () => {
			const state: GameState = {
				currentDirectory: "/",
				filesystem: {
					name: "/",
					files: [
						{
							name: "secret.txt",
							content: "CLASSIFIED - TOP SECRET\nThis is confidential",
							hidden: false,
						},
					],
					subdirectories: [],
				},
				objectives: [],
				completedObjectives: [],
				missionCompleted: false,
			};

			const result = grepCommand("-ri confidential", state);
			console.log("Grep output:", result.output);
			expect(result.output.length).toBeGreaterThan(0);
		});
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
