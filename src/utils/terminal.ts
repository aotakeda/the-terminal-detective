export interface InputState {
	readonly input: string;
	readonly history: string[];
	readonly historyIndex: number;
	readonly completions: string[];
	readonly completionIndex: number;
}

export type KeyAction =
	| { readonly type: "SET_INPUT"; readonly payload: string }
	| { readonly type: "ADD_TO_HISTORY"; readonly payload: string }
	| { readonly type: "CLEAR_INPUT" }
	| { readonly type: "SET_HISTORY_NAVIGATION"; readonly payload: number }
	| { readonly type: "SET_COMPLETIONS"; readonly payload: string[] }
	| { readonly type: "CLEAR_COMPLETIONS" };

export const inputReducer = (
	state: InputState,
	action: KeyAction,
): InputState => {
	switch (action.type) {
		case "SET_INPUT":
			return {
				...state,
				input: action.payload,
				completions: [],
				completionIndex: -1,
			};

		case "ADD_TO_HISTORY":
			return {
				...state,
				history: [...state.history, action.payload],
				input: "",
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

		case "CLEAR_INPUT":
			return {
				...state,
				input: "",
				historyIndex: -1,
				completions: [],
				completionIndex: -1,
			};

		case "SET_HISTORY_NAVIGATION":
			return {
				...state,
				historyIndex: action.payload.index,
				input: action.payload.input,
			};

		case "SET_COMPLETIONS":
			return {
				...state,
				completions: action.payload.completions,
				completionIndex: action.payload.index,
				input: action.payload.input,
			};

		case "CLEAR_COMPLETIONS":
			return {
				...state,
				completions: [],
				completionIndex: -1,
			};

		default:
			return state;
	}
};

export const handleBackspace = (state: InputState): KeyAction => ({
	type: "SET_INPUT",
	payload: state.input.slice(0, -1),
});

export const handleCharacterInput = (
	state: InputState,
	char: string,
): KeyAction => ({
	type: "SET_INPUT",
	payload: state.input + char,
});

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

export const createKeyHandlers = (
	getCompletions: (input: string) => string[],
) => ({
	backspace: handleBackspace,
	delete: handleBackspace,
	character: handleCharacterInput,
	enter: handleEnter,
	upArrow: handleUpArrow,
	downArrow: handleDownArrow,
	tab: (state: InputState) => handleTabCompletion(state, getCompletions),
});
