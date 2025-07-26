import { Box, Text, useInput } from "ink";
import type React from "react";
import { useReducer } from "react";
import {
	createKeyHandlers,
	type InputState,
	inputReducer,
} from "../utils/terminal";

interface TerminalProps {
	onCommand: (command: string) => void;
	availableCommands?: string[];
	getCompletions?: (input: string) => string[];
}

const initialInputState: InputState = {
	input: "",
	history: [],
	historyIndex: -1,
	completions: [],
	completionIndex: -1,
};

export const Terminal: React.FC<TerminalProps> = ({
	onCommand,
	availableCommands = [],
	getCompletions,
}) => {
	const [inputState, dispatchInput] = useReducer(
		inputReducer,
		initialInputState,
	);

	const completionFunction = (input: string): string[] => {
		const parts = input.trim().split(" ");
		const firstPart = parts[0];

		if (!firstPart) return [];

		if (parts.length === 1) {
			return availableCommands.filter((cmd) =>
				cmd.startsWith(firstPart.toLowerCase()),
			);
		} else {
			return getCompletions ? getCompletions(input) : [];
		}
	};

	const keyHandlers = createKeyHandlers(completionFunction);

	useInput((inputChar, key) => {
		let action = null;

		if (key.return) {
			action = keyHandlers.enter(inputState);
			if (action && inputState.input.trim()) {
				onCommand(inputState.input);
			}
		} else if (key.tab) {
			action = keyHandlers.tab(inputState);
		} else if (key.backspace || key.delete) {
			action = keyHandlers.backspace(inputState);
		} else if (key.upArrow) {
			action = keyHandlers.upArrow(inputState);
		} else if (key.downArrow) {
			action = keyHandlers.downArrow(inputState);
		} else if (!key.ctrl && !key.meta) {
			action = keyHandlers.character(inputState, inputChar);
		}

		if (action) {
			dispatchInput(action);
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="gray"
			padding={1}
		>
			<Box aria-label="Terminal interface">
				<Text color="green" bold aria-label="Command prompt">
					${" "}
				</Text>
				<Text color="white" aria-label="Current input">
					{inputState.input}
				</Text>
				<Text color="white" bold aria-label="Cursor">
					{"█"}
				</Text>
			</Box>
			{inputState.completions.length > 1 && (
				<Box marginTop={1} aria-live="polite">
					<Text color="gray">
						Completions: {inputState.completions.join(", ")}
					</Text>
				</Box>
			)}
			<Box marginTop={1}>
				<Text color="gray">Tip: Use 'help' for available commands.</Text>
			</Box>
		</Box>
	);
};
