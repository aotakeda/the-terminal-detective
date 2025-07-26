import { describe, expect, it } from "vitest";
import type { InputState, KeyAction } from "../terminal";
import {
	createKeyHandlers,
	handleBackspace,
	handleCharacterInput,
	handleDownArrow,
	handleEnter,
	handleTabCompletion,
	handleUpArrow,
	inputReducer,
} from "../terminal";

describe("Terminal Utils", () => {
	describe("inputReducer", () => {
		const initialState: InputState = {
			input: "",
			history: [],
			historyIndex: -1,
			completions: [],
			completionIndex: -1,
		};

		it("should handle SET_INPUT action", () => {
			const action: KeyAction = { type: "SET_INPUT", payload: "hello" };
			const result = inputReducer(initialState, action);

			expect(result.input).toBe("hello");
			expect(result.completions).toEqual([]);
			expect(result.completionIndex).toBe(-1);
		});

		it("should handle ADD_TO_HISTORY action", () => {
			const state: InputState = { ...initialState, input: "ls -l" };
			const action: KeyAction = { type: "ADD_TO_HISTORY", payload: "ls -l" };
			const result = inputReducer(state, action);

			expect(result.history).toEqual(["ls -l"]);
			expect(result.input).toBe("");
			expect(result.historyIndex).toBe(-1);
			expect(result.completions).toEqual([]);
			expect(result.completionIndex).toBe(-1);
		});

		it("should handle CLEAR_INPUT action", () => {
			const state: InputState = {
				...initialState,
				input: "some text",
				historyIndex: 2,
				completions: ["cat", "cd"],
				completionIndex: 0,
			};
			const action: KeyAction = { type: "CLEAR_INPUT" };
			const result = inputReducer(state, action);

			expect(result.input).toBe("");
			expect(result.historyIndex).toBe(-1);
			expect(result.completions).toEqual([]);
			expect(result.completionIndex).toBe(-1);
		});

		it("should handle SET_HISTORY_NAVIGATION action", () => {
			const action: KeyAction = {
				type: "SET_HISTORY_NAVIGATION",
				payload: { index: 1, input: "pwd" },
			};
			const result = inputReducer(initialState, action);

			expect(result.historyIndex).toBe(1);
			expect(result.input).toBe("pwd");
		});

		it("should handle SET_COMPLETIONS action", () => {
			const action: KeyAction = {
				type: "SET_COMPLETIONS",
				payload: {
					completions: ["cat", "cd"],
					index: 0,
					input: "cat",
				},
			};
			const result = inputReducer(initialState, action);

			expect(result.completions).toEqual(["cat", "cd"]);
			expect(result.completionIndex).toBe(0);
			expect(result.input).toBe("cat");
		});

		it("should handle CLEAR_COMPLETIONS action", () => {
			const state: InputState = {
				...initialState,
				completions: ["cat", "cd"],
				completionIndex: 0,
			};
			const action: KeyAction = { type: "CLEAR_COMPLETIONS" };
			const result = inputReducer(state, action);

			expect(result.completions).toEqual([]);
			expect(result.completionIndex).toBe(-1);
		});

		it("should return unchanged state for unknown action", () => {
			const action = { type: "UNKNOWN_ACTION" } as unknown as KeyAction;
			const result = inputReducer(initialState, action);

			expect(result).toEqual(initialState);
		});
	});

	describe("handleBackspace", () => {
		it("should remove last character", () => {
			const state: InputState = {
				input: "hello",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleBackspace(state);

			expect(action.type).toBe("SET_INPUT");
			expect(action.payload).toBe("hell");
		});

		it("should handle empty string", () => {
			const state: InputState = {
				input: "",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleBackspace(state);

			expect(action.type).toBe("SET_INPUT");
			expect(action.payload).toBe("");
		});
	});

	describe("handleCharacterInput", () => {
		it("should add character to input", () => {
			const state: InputState = {
				input: "hel",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleCharacterInput(state, "l");

			expect(action.type).toBe("SET_INPUT");
			expect(action.payload).toBe("hell");
		});

		it("should add character to empty input", () => {
			const state: InputState = {
				input: "",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleCharacterInput(state, "a");

			expect(action.type).toBe("SET_INPUT");
			expect(action.payload).toBe("a");
		});
	});

	describe("handleEnter", () => {
		it("should add non-empty input to history", () => {
			const state: InputState = {
				input: "ls -l",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleEnter(state);

			expect(action?.type).toBe("ADD_TO_HISTORY");
			expect(action?.payload).toBe("ls -l");
		});

		it("should return null for empty input", () => {
			const state: InputState = {
				input: "",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleEnter(state);

			expect(action).toBeNull();
		});

		it("should return null for whitespace-only input", () => {
			const state: InputState = {
				input: "   ",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleEnter(state);

			expect(action).toBeNull();
		});
	});

	describe("handleUpArrow", () => {
		it("should navigate to previous command", () => {
			const state: InputState = {
				input: "",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleUpArrow(state);

			expect(action?.type).toBe("SET_HISTORY_NAVIGATION");
			expect(action?.payload.index).toBe(0);
			expect(action?.payload.input).toBe("cat file.txt");
		});

		it("should continue navigating up in history", () => {
			const state: InputState = {
				input: "cat file.txt",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: 0,
				completions: [],
				completionIndex: -1,
			};

			const action = handleUpArrow(state);

			expect(action?.type).toBe("SET_HISTORY_NAVIGATION");
			expect(action?.payload.index).toBe(1);
			expect(action?.payload.input).toBe("pwd");
		});

		it("should return null when at beginning of history", () => {
			const state: InputState = {
				input: "ls",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: 2,
				completions: [],
				completionIndex: -1,
			};

			const action = handleUpArrow(state);

			expect(action).toBeNull();
		});
	});

	describe("handleDownArrow", () => {
		it("should navigate forward in history", () => {
			const state: InputState = {
				input: "ls",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: 2,
				completions: [],
				completionIndex: -1,
			};

			const action = handleDownArrow(state);

			expect(action?.type).toBe("SET_HISTORY_NAVIGATION");
			expect(action?.payload.index).toBe(1);
			expect(action?.payload.input).toBe("pwd");
		});

		it("should clear input when reaching current", () => {
			const state: InputState = {
				input: "pwd",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: 0,
				completions: [],
				completionIndex: -1,
			};

			const action = handleDownArrow(state);

			expect(action?.type).toBe("SET_HISTORY_NAVIGATION");
			expect(action?.payload.index).toBe(-1);
			expect(action?.payload.input).toBe("");
		});

		it("should return null when already at current", () => {
			const state: InputState = {
				input: "",
				history: ["ls", "pwd", "cat file.txt"],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleDownArrow(state);

			expect(action).toBeNull();
		});
	});

	describe("handleTabCompletion", () => {
		const mockGetCompletions = (input: string): string[] => {
			if (input.startsWith("c")) return ["cat", "cd"];
			if (input.startsWith("l")) return ["ls"];
			return [];
		};

		it("should return null for empty input", () => {
			const state: InputState = {
				input: "",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleTabCompletion(state, mockGetCompletions);

			expect(action).toBeNull();
		});

		it("should complete single match directly", () => {
			const state: InputState = {
				input: "l",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleTabCompletion(state, mockGetCompletions);

			expect(action?.type).toBe("SET_INPUT");
			expect(action?.payload).toBe("ls ");
		});

		it("should set completions for multiple matches", () => {
			const state: InputState = {
				input: "c",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleTabCompletion(state, mockGetCompletions);

			expect(action?.type).toBe("SET_COMPLETIONS");
			expect(action?.payload.completions).toEqual(["cat", "cd"]);
			expect(action?.payload.index).toBe(0);
			expect(action?.payload.input).toBe("cat ");
		});

		it("should cycle through completions", () => {
			const state: InputState = {
				input: "cat ",
				history: [],
				historyIndex: -1,
				completions: ["cat", "cd"],
				completionIndex: 0,
			};

			const action = handleTabCompletion(state, mockGetCompletions);

			expect(action?.type).toBe("SET_COMPLETIONS");
			expect(action?.payload.index).toBe(1);
			expect(action?.payload.input).toBe("cd ");
		});

		it("should return null for no completions", () => {
			const state: InputState = {
				input: "xyz",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const action = handleTabCompletion(state, mockGetCompletions);

			expect(action).toBeNull();
		});
	});

	describe("createKeyHandlers", () => {
		it("should create handler functions", () => {
			const mockGetCompletions = () => [];
			const handlers = createKeyHandlers(mockGetCompletions);

			expect(typeof handlers.backspace).toBe("function");
			expect(typeof handlers.delete).toBe("function");
			expect(typeof handlers.character).toBe("function");
			expect(typeof handlers.enter).toBe("function");
			expect(typeof handlers.upArrow).toBe("function");
			expect(typeof handlers.downArrow).toBe("function");
			expect(typeof handlers.tab).toBe("function");
		});

		it("should use provided completion function", () => {
			const mockGetCompletions = (_input: string) => ["test"];
			const handlers = createKeyHandlers(mockGetCompletions);

			const state: InputState = {
				input: "t",
				history: [],
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

			const result = handlers.tab(state);
			expect(result?.type).toBe("SET_INPUT");
			expect(result?.payload).toBe("test ");
		});
	});
});
