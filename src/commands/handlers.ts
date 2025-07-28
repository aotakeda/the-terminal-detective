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
import {
	validateCommandSyntax,
	validateSpecificCommand,
} from "../utils/syntax-validator";
import type { CommandHandler, CompletionHandler } from "./types";

export const lsCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `ls ${args}`;

		const lsValidation = validateSpecificCommand(fullCommand, "ls");
		if (!lsValidation.isValid) {
			return { output: [lsValidation.error || "ls: syntax error"] };
		}
	}

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

export const pwdCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `pwd ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`pwd: ${syntaxValidation.error}`] };
		}

		return { output: ["pwd: too many arguments"] };
	}

	return {
		output: [state.currentDirectory === "/" ? "/" : state.currentDirectory],
	};
};

export const cdCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `cd ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`cd: ${syntaxValidation.error}`] };
		}
	}

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
	if (args.trim()) {
		const fullCommand = `cat ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`cat: ${syntaxValidation.error}`] };
		}
	}

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
	const fullCommand = `grep ${args}`;

	const syntaxValidation = validateCommandSyntax(fullCommand);
	if (!syntaxValidation.isValid) {
		return { output: [`grep: ${syntaxValidation.error}`] };
	}

	const grepValidation = validateSpecificCommand(fullCommand, "grep");
	if (!grepValidation.isValid) {
		return { output: [grepValidation.error || "grep: syntax error"] };
	}

	const parts = args.trim().split(/\s+/);

	if (parts.length === 0) {
		return { output: ["grep: missing pattern"] };
	}

	const flags = parts.filter((part) => part.startsWith("-"));
	const nonFlags = parts.filter((part) => !part.startsWith("-"));

	const isRecursive = flags.some((flag) => flag.includes("r"));
	const isCaseInsensitive = flags.some((flag) => flag.includes("i"));
	const isCount = flags.some((flag) => flag.includes("c"));

	const pattern = nonFlags[0];
	const fileName = nonFlags[1];

	if (!pattern) {
		return { output: ["grep: missing pattern"] };
	}

	const searchInFile = (file: MissionFile, filePath: string) => {
		const searchPattern = isCaseInsensitive ? pattern.toLowerCase() : pattern;

		if (isCount) {
			const count = file.content.split("\n").filter((line) => {
				const searchLine = isCaseInsensitive ? line.toLowerCase() : line;
				return searchLine.includes(searchPattern);
			}).length;
			return count > 0 ? [`${filePath}:${count}`] : [];
		} else {
			const matches = file.content.split("\n").filter((line) => {
				const searchLine = isCaseInsensitive ? line.toLowerCase() : line;
				return searchLine.includes(searchPattern);
			});
			return matches.map((match) =>
				isRecursive ? `${filePath}:${match}` : match,
			);
		}
	};

	const searchAllFiles = (
		dir: MissionDirectory,
		currentPath: string,
	): string[] => {
		let results: string[] = [];

		dir.files.forEach((file: MissionFile) => {
			const fullPath =
				currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
			const matches = searchInFile(file, fullPath);
			results = results.concat(matches);
		});

		if (isRecursive) {
			dir.subdirectories?.forEach((subdir: MissionDirectory) => {
				const subPath =
					currentPath === "/"
						? `/${subdir.name}`
						: `${currentPath}/${subdir.name}`;
				const subResults = searchAllFiles(subdir, subPath);
				results = results.concat(subResults);
			});
		}

		return results;
	};

	if (isRecursive && !fileName) {
		const results = searchAllFiles(state.filesystem, "/");
		return {
			output:
				results.length > 0
					? results
					: [`grep: no matches found for '${pattern}'`],
		};
	} else if (fileName) {
		const filePath = resolvePath(state.currentDirectory, fileName);
		const file = findFileInDirectory(filePath, state.filesystem);

		if (!file) {
			return { output: [`grep: ${fileName}: No such file or directory`] };
		}

		const matches = searchInFile(file, fileName);
		return {
			output:
				matches.length > 0
					? matches
					: [`grep: no matches found for '${pattern}'`],
		};
	} else {
		return { output: ["grep: missing file"] };
	}
};

export const headCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `head ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`head: ${syntaxValidation.error}`] };
		}
	}

	if (!args.trim()) {
		return { output: ["head: missing file operand"] };
	}

	const argParts = args.trim().split(/\s+/);
	let lineCount = 10;
	let filename = "";

	for (let i = 0; i < argParts.length; i++) {
		const arg = argParts[i];
		if (arg === "-n" && i + 1 < argParts.length) {
			const nextArg = argParts[i + 1];
			if (nextArg) {
				lineCount = parseInt(nextArg) || 10;
			}
			i++;
		} else if (arg?.startsWith("-n")) {
			lineCount = parseInt(arg.substring(2)) || 10;
		} else if (arg?.startsWith("-") && /^-\d+$/.test(arg)) {
			lineCount = parseInt(arg.substring(1)) || 10;
		} else if (arg && !arg.startsWith("-")) {
			filename = arg;
		}
	}

	if (!filename) {
		return { output: ["head: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, filename);
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`head: ${filename}: No such file or directory`] };
	}

	const lines = file.content.split("\n");
	return { output: lines.slice(0, lineCount) };
};

export const tailCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `tail ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`tail: ${syntaxValidation.error}`] };
		}
	}

	if (!args.trim()) {
		return { output: ["tail: missing file operand"] };
	}

	const argParts = args.trim().split(/\s+/);
	let lineCount = 10;
	let filename = "";

	for (let i = 0; i < argParts.length; i++) {
		const arg = argParts[i];
		if (arg === "-n" && i + 1 < argParts.length) {
			const nextArg = argParts[i + 1];
			if (nextArg) {
				lineCount = parseInt(nextArg) || 10;
			}
			i++;
		} else if (arg?.startsWith("-n")) {
			lineCount = parseInt(arg.substring(2)) || 10;
		} else if (arg?.startsWith("-") && /^-\d+$/.test(arg)) {
			lineCount = parseInt(arg.substring(1)) || 10;
		} else if (arg && !arg.startsWith("-")) {
			filename = arg;
		}
	}

	if (!filename) {
		return { output: ["tail: missing file operand"] };
	}

	const filePath = resolvePath(state.currentDirectory, filename);
	const file = findFileInDirectory(filePath, state.filesystem);

	if (!file) {
		return { output: [`tail: ${filename}: No such file or directory`] };
	}

	const lines = file.content.split("\n");
	return { output: lines.slice(-lineCount) };
};

export const wcCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `wc ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`wc: ${syntaxValidation.error}`] };
		}
	}

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
	if (args.trim()) {
		const fullCommand = `sort ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`sort: ${syntaxValidation.error}`] };
		}
	}

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
	if (args.trim()) {
		const fullCommand = `uniq ${args}`;

		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`uniq: ${syntaxValidation.error}`] };
		}
	}

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
	const fullCommand = `find ${args}`;

	const syntaxValidation = validateCommandSyntax(fullCommand);
	if (!syntaxValidation.isValid) {
		return { output: [`find: ${syntaxValidation.error}`] };
	}

	const findValidation = validateSpecificCommand(fullCommand, "find");
	if (!findValidation.isValid) {
		return { output: [findValidation.error || "find: syntax error"] };
	}

	if (!args.trim()) {
		return { output: ["find: missing path operand"] };
	}

	const argParts = args.trim().split(/\s+/);
	let searchPattern = "";

	if (argParts.includes("-name")) {
		const nameIndex = argParts.indexOf("-name");
		if (nameIndex < argParts.length - 1) {
			const rawPattern = argParts[nameIndex + 1];
			if (!rawPattern) {
				return { output: ["find: option '-name' requires an argument"] };
			}

			const patternValidation = validateCommandSyntax(rawPattern);
			if (!patternValidation.isValid) {
				return { output: [`find: ${patternValidation.error} in pattern`] };
			}

			searchPattern = rawPattern.replace(/[*"']/g, "");
		} else {
			return { output: ["find: option '-name' requires an argument"] };
		}
	} else {
		searchPattern = args.trim();
	}

	if (!searchPattern) {
		return { output: ["find: missing search pattern"] };
	}

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

export const hintCommand: CommandHandler = (_args, state) => {
	const incompleteObjectives = state.objectives.filter((obj) => !obj.completed);

	if (incompleteObjectives.length === 0) {
		return {
			output: ["All objectives completed! Great work, Detective."],
		};
	}

	const currentObjective = incompleteObjectives[0];

	if (!currentObjective) {
		return { output: ["No incomplete objectives found."] };
	}

	const output = [
		"HINT:",
		"",
		`Objective: ${currentObjective.description}`,
		"",
	];

	if (currentObjective.hint) {
		output.push(`${currentObjective.hint}`);
	} else {
		output.push("No specific hint available for this objective.");
	}

	output.push("");

	return { output };
};

export const fileCommand: CommandHandler = (args, state) => {
	if (args.trim()) {
		const fullCommand = `file ${args}`;
		const syntaxValidation = validateCommandSyntax(fullCommand);
		if (!syntaxValidation.isValid) {
			return { output: [`file: ${syntaxValidation.error}`] };
		}
	}
	if (!args.trim()) {
		return { output: ["file: missing file operand"] };
	}
	const filePath = resolvePath(state.currentDirectory, args.trim());
	const file = findFileInDirectory(filePath, state.filesystem);
	if (!file) {
		return { output: [`file: ${args}: No such file or directory`] };
	}

	let fileType = "text";
	const fileName = args.trim();
	const content = file.content;

	if (
		fileName.includes("suspicious_file") ||
		content.includes("#!/bin/bash") ||
		content.includes("#!/usr/bin/env")
	) {
		fileType = "executable";
	} else if (fileName.endsWith(".txt")) {
		fileType = "ASCII text";
	} else if (fileName.endsWith(".log")) {
		fileType = "log file";
	} else if (content.includes("{") && content.includes("}")) {
		fileType = "JSON data";
	} else if (content.includes("#!/")) {
		fileType = "executable script";
	}

	return {
		output: [`${args.trim()}: ${fileType}`],
	};
};
