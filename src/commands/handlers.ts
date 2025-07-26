import type { MissionDirectory, MissionFile } from "../types/mission";
import {
	directoryExists,
	filterByPrefix,
	findFileInDirectory,
	getDirectoriesOnly,
	listDirectory,
	listDirectoryDetailed,
	resolvePath,
} from "../utils/filesystem";
import type { CommandHandler, CompletionHandler } from "./types";

export const lsCommand: CommandHandler = (args, state) => {
	const flags = args.trim();
	const showHidden = flags.includes("-a");
	const showDetailed = flags.includes("-l");

	if (showDetailed) {
		return {
			output: listDirectoryDetailed(
				state.currentDirectory,
				state.filesystem,
				showHidden,
			),
		};
	} else {
		return {
			output: listDirectory(
				state.currentDirectory,
				state.filesystem,
				showHidden,
			),
		};
	}
};

export const pwdCommand: CommandHandler = (_args, state) => ({
	output: [state.currentDirectory === "/" ? "/" : state.currentDirectory],
});

export const cdCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return {
			output: [],
			newState: { currentDirectory: "/" },
		};
	}

	const targetPath = resolvePath(state.currentDirectory, args.trim());

	return directoryExists(targetPath, state.filesystem)
		? {
				output: [],
				newState: { currentDirectory: targetPath },
			}
		: {
				output: [`cd: ${args}: No such file or directory`],
				error: "Directory not found",
			};
};

export const catCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["cat: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);

	return file
		? { output: file.content.split("\n") }
		: { output: [`cat: ${args}: No such file or directory`] };
};

export const grepCommand: CommandHandler = (args, state) => {
	const parts = args.trim().split(" ");
	const [pattern, fileName] = parts;

	if (!pattern) {
		return { output: ["grep: missing pattern"] };
	}

	if (!fileName) {
		return { output: ["grep: missing file"] };
	}

	const filePath = resolvePath(state.currentDirectory, fileName);
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`grep: ${fileName}: No such file or directory`] };
	}

	const matches = file.content
		.split("\n")
		.filter((line) => line.toLowerCase().includes(pattern.toLowerCase()));

	return {
		output:
			matches.length > 0
				? matches
				: [`grep: no matches found for '${pattern}'`],
	};
};

export const headCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["head: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);

	return file
		? { output: file.content.split("\n").slice(0, 10) }
		: { output: [`head: ${args}: No such file or directory`] };
};

export const tailCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["tail: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`tail: ${args}: No such file or directory`] };
	}

	const lines = file.content.split("\n");
	return { output: lines.slice(-10) };
};

export const wcCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["wc: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`wc: ${args}: No such file or directory`] };
	}

	const lines = file.content.split("\n");
	const words = file.content.split(/\s+/).filter((word) => word.length > 0);
	const chars = file.content.length;

	return {
		output: [`${lines.length} ${words.length} ${chars} ${args.trim()}`],
	};
};

export const sortCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["sort: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`sort: ${args}: No such file or directory`] };
	}

	const lines = file.content.split("\n").sort();
	return { output: lines };
};

export const uniqCommand: CommandHandler = (args, state) => {
	const parts = args.trim().split(" ");
	const isDuplicatesOnly = parts.includes("-d");
	const filename = parts.find((part) => !part.startsWith("-"));

	if (!filename) {
		return { output: ["uniq: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, filename);
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`uniq: ${filename}: No such file or directory`] };
	}

	const lines = file.content.split("\n");
	const sortedLines = lines.sort();

	if (isDuplicatesOnly) {
		const duplicates: string[] = [];
		for (let i = 0; i < sortedLines.length - 1; i++) {
			const currentLine = sortedLines[i];
			const nextLine = sortedLines[i + 1];
			if (
				currentLine &&
				nextLine &&
				currentLine === nextLine &&
				!duplicates.includes(currentLine)
			) {
				duplicates.push(currentLine);
			}
		}
		return { output: duplicates };
	} else {
		return { output: [...new Set(sortedLines)] };
	}
};

export const findCommand: CommandHandler = (args, state) => {
	if (!args.trim()) {
		return { output: ["find: missing search pattern"] };
	}

	const searchPattern = args.trim();
	const allFiles: string[] = [];

	const collectFiles = (dir: MissionDirectory, currentPath: string) => {
		dir.files.forEach((file: MissionFile) => {
			const fullPath =
				currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
			if (file.name.toLowerCase().includes(searchPattern.toLowerCase())) {
				allFiles.push(fullPath);
			}
		});

		dir.subdirectories?.forEach((subdir: MissionDirectory) => {
			const subPath =
				currentPath === "/"
					? `/${subdir.name}`
					: `${currentPath}/${subdir.name}`;
			collectFiles(subdir, subPath);
		});
	};

	collectFiles(state.filesystem, "/");

	return {
		output:
			allFiles.length > 0
				? allFiles
				: [`find: no files matching '${searchPattern}' found`],
	};
};

export const cdCompletion: CompletionHandler = (input, state) => {
	const parts = input.trim().split(" ");
	const currentArg = parts[parts.length - 1] || "";

	const items = listDirectory(state.currentDirectory, state.filesystem);
	const directories = getDirectoriesOnly(items);

	return filterByPrefix(directories, currentArg);
};

export const fileCompletion: CompletionHandler = (input, state) => {
	const parts = input.trim().split(" ");
	const currentArg = parts[parts.length - 1] || "";

	const items = listDirectory(state.currentDirectory, state.filesystem);

	return filterByPrefix(items, currentArg);
};
