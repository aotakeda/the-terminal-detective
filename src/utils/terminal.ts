export interface InputState {
	readonly input: string;
	readonly cursorPosition: number;
	readonly history: string[];
	readonly historyIndex: number;
	readonly completions: string[];
	readonly completionIndex: number;
}

export type KeyAction =
	| {
			readonly type: "SET_INPUT";
			readonly payload: string;
			readonly cursorPosition?: number;
	  }
	| { readonly type: "ADD_TO_HISTORY"; readonly payload: string }
	| { readonly type: "CLEAR_INPUT" }
	| {
			readonly type: "SET_HISTORY_NAVIGATION";
			readonly payload: { index: number; input: string };
	  }
	| {
			readonly type: "SET_COMPLETIONS";
			readonly payload: { completions: string[]; index: number; input: string };
	  }
	| { readonly type: "CLEAR_COMPLETIONS" }
	| { readonly type: "MOVE_CURSOR"; readonly payload: number };

export const inputReducer = (
	state: InputState,
	action: KeyAction,
): InputState => {
	switch (action.type) {
		case "SET_INPUT":
			return {
				...state,
				input: action.payload,
				cursorPosition: action.cursorPosition ?? action.payload.length,
				completions: [],
				completionIndex: -1,
			};

		case "ADD_TO_HISTORY":
			return {
				...state,
				history: [...state.history, action.payload],
				input: "",
				cursorPosition: 0,
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

		case "CLEAR_INPUT":
			return {
				...state,
				input: "",
				cursorPosition: 0,
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

		case "SET_HISTORY_NAVIGATION":
			return {
				...state,
				historyIndex: action.payload.index,
				input: action.payload.input,
				cursorPosition: action.payload.input.length,
			};

		case "SET_COMPLETIONS":
			return {
				...state,
				completions: action.payload.completions,
				completionIndex: action.payload.index,
				input: action.payload.input,
				cursorPosition: action.payload.input.length,
			};

		case "CLEAR_COMPLETIONS":
			return {
				...state,
				completions: [],
				completionIndex: -1,
			};

		case "MOVE_CURSOR":
			return {
				...state,
				cursorPosition: Math.max(
					0,
					Math.min(action.payload, state.input.length),
				),
			};

		default:
			return state;
	}
};

export const handleBackspace = (state: InputState): KeyAction => {
	if (state.cursorPosition === 0)
		return { type: "SET_INPUT", payload: state.input, cursorPosition: 0 };

	const newInput =
		state.input.slice(0, state.cursorPosition - 1) +
		state.input.slice(state.cursorPosition);

	return {
		type: "SET_INPUT",
		payload: newInput,
		cursorPosition: state.cursorPosition - 1,
	};
};

export const handleCharacterInput = (
	state: InputState,
	char: string,
): KeyAction => {
	const newInput =
		state.input.slice(0, state.cursorPosition) +
		char +
		state.input.slice(state.cursorPosition);

	return {
		type: "SET_INPUT",
		payload: newInput,
		cursorPosition: state.cursorPosition + char.length,
	};
};

export const handleEnter = (state: InputState): KeyAction | null => {
	if (!state.input.trim()) return null;

	return {
		type: "ADD_TO_HISTORY",
		payload: state.input,
	};
};

export const handleUpArrow = (state: InputState): KeyAction | null => {
	if (state.historyIndex < state.history.length - 1) {
		const newIndex = state.historyIndex + 1;
		const input = state.history[state.history.length - 1 - newIndex] || "";

		return {
			type: "SET_HISTORY_NAVIGATION",
			payload: { index: newIndex, input },
		};
	}

	return null;
};

export const handleDownArrow = (state: InputState): KeyAction | null => {
	if (state.historyIndex > 0) {
		const newIndex = state.historyIndex - 1;
		const input = state.history[state.history.length - 1 - newIndex] || "";

		return {
			type: "SET_HISTORY_NAVIGATION",
			payload: { index: newIndex, input },
		};
	} else if (state.historyIndex === 0) {
		return {
			type: "SET_HISTORY_NAVIGATION",
			payload: { index: -1, input: "" },
		};
	}

	return null;
};

export const handleTabCompletion = (
	state: InputState,
	getCompletions: (input: string) => string[],
): KeyAction | null => {
	if (!state.input.trim()) return null;

	const parts = state.input.trim().split(" ");
	const possibleCompletions = getCompletions(state.input);

	if (possibleCompletions.length === 0) return null;

	if (possibleCompletions.length === 1) {
		const completion = possibleCompletions[0];
		const newInput = [...parts.slice(0, -1), completion].join(" ");
		const finalInput = newInput + (parts.length === 1 ? " " : "");

		return {
			type: "SET_INPUT",
			payload: finalInput,
		};
	} else {
		const isNewCompletionSet =
			state.completions.length === 0 ||
			JSON.stringify(state.completions) !== JSON.stringify(possibleCompletions);

		const nextIndex = isNewCompletionSet
			? 0
			: (state.completionIndex + 1) % state.completions.length;

		const selectedCompletion = possibleCompletions[nextIndex];
		const newInput = [...parts.slice(0, -1), selectedCompletion].join(" ");
		const finalInput = newInput + (parts.length === 1 ? " " : "");

		return {
			type: "SET_COMPLETIONS",
			payload: {
				completions: possibleCompletions,
				index: nextIndex,
				input: finalInput,
			},
		};
	}
};

export const handleLeftArrow = (state: InputState): KeyAction | null => {
	if (state.cursorPosition > 0) {
		return {
			type: "MOVE_CURSOR",
			payload: state.cursorPosition - 1,
		};
	}
	return null;
};

export const handleRightArrow = (state: InputState): KeyAction | null => {
	if (state.cursorPosition < state.input.length) {
		return {
			type: "MOVE_CURSOR",
			payload: state.cursorPosition + 1,
		};
	}
	return null;
};

export const createKeyHandlers = (
	getCompletions: (input: string) => string[],
) => ({
	backspace: handleBackspace,
	delete: handleBackspace,
	character: handleCharacterInput,
	enter: handleEnter,
	upArrow: handleUpArrow,
	downArrow: handleDownArrow,
	leftArrow: handleLeftArrow,
	rightArrow: handleRightArrow,
	tab: (state: InputState) => handleTabCompletion(state, getCompletions),
});
