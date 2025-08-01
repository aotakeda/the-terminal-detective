import {
	catCommand,
	cdCommand,
	cdCompletion,
	fileCommand,
	fileCompletion,
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
} from "./handlers";
import type { CommandRegistry, GameState } from "./types";

const createHelpOutput = (availableCommands: string[]): string[] => [
	"Help Menu",
	"",
	"Available Commands:",
	"",
	...availableCommands.map((cmd) => {
		const description = commandDescriptions[cmd] || "Command utility";
		return `  ${cmd.padEnd(12)} - ${description}`;
	}),
	"",
	"Game Commands:",
	"  objectives   - Show current mission objectives",
	"  hint         - Show hint for current objective",
	"  help         - Show this help menu",
	"  exit         - Return to mission selection",
	"",
	"Tip: Use these commands to investigate and solve the mystery!",
];

const commandDescriptions: Record<string, string> = {
	ls: "List directory contents",
	cd: "Change directory",
	pwd: "Print working directory",
	cat: "Display file contents",
	grep: "Search text patterns",
	find: "Search for files",
	head: "Show first lines of file",
	tail: "Show last lines of file",
	sort: "Sort lines in file",
	uniq: "Remove duplicate lines",
	wc: "Count lines, words, characters",
	file: "Determine file type",
	hint: "Show hint for current objective",
	help: "Show this help message",
};

export const createBaseCommandRegistry = (
	allowedCommands: string[],
): CommandRegistry => ({
	ls: {
		handler: lsCommand,
		description: commandDescriptions.ls || "List directory contents",
	},
	pwd: {
		handler: pwdCommand,
		description: commandDescriptions.pwd || "Print working directory",
	},
	cd: {
		handler: cdCommand,
		completion: cdCompletion,
		description: commandDescriptions.cd || "Change directory",
	},
	cat: {
		handler: catCommand,
		completion: fileCompletion,
		description: commandDescriptions.cat || "Display file contents",
	},
	grep: {
		handler: grepCommand,
		completion: fileCompletion,
		description: commandDescriptions.grep || "Search text patterns",
	},
	find: {
		handler: findCommand,
		description: commandDescriptions.find || "Search for files",
	},
	head: {
		handler: headCommand,
		completion: fileCompletion,
		description: commandDescriptions.head || "Show first lines of file",
	},
	tail: {
		handler: tailCommand,
		completion: fileCompletion,
		description: commandDescriptions.tail || "Show last lines of file",
	},
	sort: {
		handler: sortCommand,
		completion: fileCompletion,
		description: commandDescriptions.sort || "Sort lines in file",
	},
	uniq: {
		handler: uniqCommand,
		completion: fileCompletion,
		description: commandDescriptions.uniq || "Remove duplicate lines",
	},
	wc: {
		handler: wcCommand,
		completion: fileCompletion,
		description: commandDescriptions.wc || "Count lines, words, characters",
	},
	file: {
		handler: fileCommand,
		completion: fileCompletion,
		description: commandDescriptions.file || "Determine file type",
	},
	hint: {
		handler: hintCommand,
		description: commandDescriptions.hint || "Show hint for current objective",
	},
	help: {
		handler: (_args, _state) => ({ output: createHelpOutput(allowedCommands) }),
		description: commandDescriptions.help || "Show this help message",
	},
});

export const filterCommandRegistry = (
	registry: CommandRegistry,
	allowedCommands: string[],
): CommandRegistry => {
	const alwaysAllowed = ["hint", "help"];
	const commandsToInclude = [...allowedCommands, ...alwaysAllowed];

	return Object.fromEntries(
		Object.entries(registry).filter(([cmd]) => commandsToInclude.includes(cmd)),
	);
};

export const executeCommand = (
	command: string,
	args: string,
	state: GameState,
	registry: CommandRegistry,
) => {
	const commandDef = registry[command];
	if (!commandDef) {
		return {
			output: [
				`Command not found: ${command}`,
				`Available commands: ${Object.keys(registry).join(", ")}`,
			],
			error: "Unknown command",
		};
	}
	return commandDef.handler(args, state);
};

export const executePipedCommand = (
	fullCommand: string,
	state: GameState,
	registry: CommandRegistry,
) => {
	const pipeParts = fullCommand.split("|").map((part) => part.trim());

	if (pipeParts.length === 1) {
		const firstPart = pipeParts[0];
		if (!firstPart) {
			return { output: ["Error: empty command"], error: "Empty command" };
		}
		const [command, ...argArray] = firstPart.split(" ");
		const args = argArray.join(" ");
		if (!command) {
			return { output: ["Error: no command specified"], error: "No command" };
		}
		return executeCommand(command, args, state, registry);
	}

	let currentOutput: string[] = [];

	for (let i = 0; i < pipeParts.length; i++) {
		const commandPart = pipeParts[i];
		if (!commandPart) {
			return {
				output: ["Error: empty command in pipe"],
				error: "Empty command in pipe",
			};
		}
		const [command, ...argArray] = commandPart.split(" ");
		const args = argArray.join(" ");

		if (!command) {
			return {
				output: ["Error: no command specified in pipe"],
				error: "No command in pipe",
			};
		}

		if (i === 0) {
			const result = executeCommand(command, args, state, registry);
			if (result.error) {
				return result;
			}
			currentOutput = result.output || [];
		} else {
			const simulatedInput = currentOutput.join("\n");

			const tempState = {
				...state,
				pipeInput: simulatedInput,
			};

			const result = executePipedCommandStep(
				command,
				args,
				tempState,
				registry,
				currentOutput,
			);
			if (result.error) {
				return result;
			}
			currentOutput = result.output || [];
		}
	}

	return { output: currentOutput };
};

const executePipedCommandStep = (
	command: string,
	args: string,
	state: GameState & { pipeInput?: string },
	registry: CommandRegistry,
	inputLines: string[],
) => {
	switch (command) {
		case "head": {
			const lines = args
				? parseInt(args.replace("-n", "").replace("-", "").trim())
				: 10;
			return { output: inputLines.slice(0, lines) };
		}
		case "tail": {
			const lines = args
				? parseInt(args.replace("-n", "").replace("-", "").trim())
				: 10;
			return { output: inputLines.slice(-lines) };
		}
		case "wc": {
			const content = inputLines.join("\n");
			const lineCount = inputLines.length;
			const words = content.split(/\s+/).filter((word) => word.length > 0);
			const chars = content.length;
			return { output: [`${lineCount} ${words.length} ${chars}`] };
		}
		case "grep": {
			const searchTerm = args.trim();
			const matchingLines = inputLines.filter((line) =>
				line.toLowerCase().includes(searchTerm.toLowerCase()),
			);
			return { output: matchingLines };
		}
		default: {
			return executeCommand(command, args, state, registry);
		}
	}
};

export const getCompletions = (
	input: string,
	state: GameState,
	registry: CommandRegistry,
): string[] => {
	const parts = input.trim().split(" ");
	const command = parts[0];
	if (!command) return [];

	if (parts.length === 1) {
		const availableCommands = Object.keys(registry);
		return availableCommands.filter((cmd) =>
			cmd.startsWith(command.toLowerCase()),
		);
	} else {
		const commandDef = registry[command];
		if (commandDef?.completion) {
			return commandDef.completion(input, state);
		}
	}
	return [];
};
