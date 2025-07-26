import { describe, expect, it } from "vitest";
import {
	catCommand,
	cdCommand,
	findCommand,
	grepCommand,
	headCommand,
	lsCommand,
	pwdCommand,
	sortCommand,
	tailCommand,
	uniqCommand,
	wcCommand,
} from "../handlers";
import type { GameState } from "../types";

const createMockGameState = (): GameState => ({
	currentDirectory: "/",
	filesystem: { name: "/", files: [], subdirectories: [] },
	objectives: [],
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
});
