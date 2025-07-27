import { describe, expect, it } from "vitest";
import type { MissionObjective } from "../../types/mission";
import { validateObjective } from "../objectives";

describe("Objectives Utils", () => {
	describe("validateObjective", () => {
		it("should validate objective with requiredCommand only", () => {
			const objective: MissionObjective = {
				id: "test_ls",
				description: "List files",
				hint: "Use ls",
				completed: false,
				requiredCommand: "ls",
			};

			expect(
				validateObjective(objective, "ls", "", "file1.txt file2.txt"),
			).toBe(true);
			expect(validateObjective(objective, "cat", "", "some content")).toBe(
				false,
			);
		});

		it("should validate objective with requiredCommand and targetFile", () => {
			const objective: MissionObjective = {
				id: "test_cat",
				description: "Read file",
				hint: "Use cat",
				completed: false,
				requiredCommand: "cat",
				targetFile: "test.txt",
			};

			expect(
				validateObjective(objective, "cat", "test.txt", "file content"),
			).toBe(true);
			expect(
				validateObjective(objective, "cat", "other.txt", "file content"),
			).toBe(false);
			expect(
				validateObjective(objective, "ls", "test.txt", "file content"),
			).toBe(false);
		});

		it("should validate objective with custom validator (1 parameter)", () => {
			const objective: MissionObjective = {
				id: "test_custom1",
				description: "Custom validation",
				hint: "Custom hint",
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "output",
					fn: (output: string) => output.includes("match"),
				},
			};

			expect(
				validateObjective(
					objective,
					"grep",
					"search-term file.txt",
					"match found",
				),
			).toBe(true);
			expect(
				validateObjective(
					objective,
					"grep",
					"other-term file.txt",
					"no result",
				),
			).toBe(false);
			expect(
				validateObjective(
					objective,
					"cat",
					"search-term file.txt",
					"match found",
				),
			).toBe(false);
		});

		it("should validate objective with custom validator (2 parameters)", () => {
			const objective: MissionObjective = {
				id: "test_custom2",
				description: "Custom validation",
				hint: "Custom hint",
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "args-output",
					fn: (args: string, output: string) => {
						return args.includes("pattern") && output.includes("match");
					},
				},
			};

			expect(
				validateObjective(objective, "grep", "pattern file.txt", "match found"),
			).toBe(true);
			expect(
				validateObjective(objective, "grep", "pattern file.txt", "no result"),
			).toBe(false);
			expect(
				validateObjective(objective, "grep", "other file.txt", "match found"),
			).toBe(false);
		});

		it("should validate objective with custom validator (3 parameters)", () => {
			const objective: MissionObjective = {
				id: "test_custom3",
				description: "Custom validation",
				hint: "Custom hint",
				completed: false,
				requiredCommand: "find",
				validator: {
					type: "full",
					fn: (command: string, args: string, output: string) => {
						return (
							command === "find" &&
							args.includes("-name") &&
							output.includes(".log")
						);
					},
				},
			};

			expect(
				validateObjective(
					objective,
					"find",
					'-name "*.log"',
					"access.log\nsecurity.log",
				),
			).toBe(true);
			expect(
				validateObjective(objective, "find", '-name "*.txt"', "access.log"),
			).toBe(true);
			expect(
				validateObjective(objective, "ls", '-name "*.log"', "access.log"),
			).toBe(false);
		});

		it("should handle validator that throws error", () => {
			const objective: MissionObjective = {
				id: "test_error",
				description: "Error validation",
				hint: "Error hint",
				completed: false,
				requiredCommand: "test",
				validator: {
					type: "output",
					fn: () => {
						throw new Error("Validator error");
					},
				},
			};

			expect(() =>
				validateObjective(objective, "test", "args", "output"),
			).toThrow("Validator error");
		});

		it("should return false for wrong command even with validator", () => {
			const objective: MissionObjective = {
				id: "test_wrong_cmd",
				description: "Wrong command test",
				hint: "Wrong command hint",
				completed: false,
				requiredCommand: "grep",
				validator: {
					type: "output",
					fn: () => true,
				},
			};

			expect(validateObjective(objective, "ls", "args", "output")).toBe(false);
		});

		it("should handle edge cases", () => {
			const objective: MissionObjective = {
				id: "test_edge",
				description: "Edge case test",
				hint: "Edge case hint",
				completed: false,
				requiredCommand: "cat",
				targetFile: "",
			};

			expect(validateObjective(objective, "cat", "", "content")).toBe(true);
			expect(validateObjective(objective, "cat", "file.txt", "content")).toBe(
				true,
			);
		});

		it("should handle path normalization for targetFile", () => {
			const objective: MissionObjective = {
				id: "test_path",
				description: "Path test",
				hint: "Path hint",
				completed: false,
				requiredCommand: "cat",
				targetFile: "work/project.txt",
			};

			expect(
				validateObjective(objective, "cat", "work/project.txt", "content"),
			).toBe(true);
			expect(
				validateObjective(objective, "cat", "project.txt", "content"),
			).toBe(true);
			expect(validateObjective(objective, "cat", "other.txt", "content")).toBe(
				false,
			);
		});
	});
});
