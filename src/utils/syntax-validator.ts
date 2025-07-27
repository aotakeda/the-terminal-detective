/**
 * Syntax validation utility for terminal commands
 * Checks for common syntax errors like unmatched quotes, brackets, parentheses, etc.
 */

export interface SyntaxValidationResult {
	isValid: boolean;
	error?: string;
	position?: number;
}

export interface SyntaxValidationOptions {
	allowWildcards?: boolean;
	allowPipes?: boolean;
	allowRedirection?: boolean;
	strictQuoting?: boolean;
}

const DEFAULT_OPTIONS: SyntaxValidationOptions = {
	allowWildcards: true,
	allowPipes: true,
	allowRedirection: true,
	strictQuoting: true,
};

/**
 * Validates command syntax for common errors
 */
export function validateCommandSyntax(
	command: string,
	options: SyntaxValidationOptions = DEFAULT_OPTIONS,
): SyntaxValidationResult {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	if (!command || !command.trim()) {
		return {
			isValid: false,
			error: "Empty command",
		};
	}

	const trimmed = command.trim();

	const quoteValidation = validateQuotes(trimmed);
	if (!quoteValidation.isValid) {
		return quoteValidation;
	}

	const bracketValidation = validateBrackets(trimmed);
	if (!bracketValidation.isValid) {
		return bracketValidation;
	}

	const parenValidation = validateParentheses(trimmed);
	if (!parenValidation.isValid) {
		return parenValidation;
	}

	const escapeValidation = validateEscapeSequences(trimmed);
	if (!escapeValidation.isValid) {
		return escapeValidation;
	}

	if (opts.allowRedirection) {
		const redirectValidation = validateRedirections(trimmed);
		if (!redirectValidation.isValid) {
			return redirectValidation;
		}
	}

	if (opts.allowPipes) {
		const pipeValidation = validatePipes(trimmed);
		if (!pipeValidation.isValid) {
			return pipeValidation;
		}
	}

	const charValidation = validateCharacters(trimmed);
	if (!charValidation.isValid) {
		return charValidation;
	}

	return { isValid: true };
}

/**
 * Validates matching quotes (single and double)
 */
function validateQuotes(command: string): SyntaxValidationResult {
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let escaped = false;

	for (let i = 0; i < command.length; i++) {
		const char = command[i];

		if (escaped) {
			escaped = false;
			continue;
		}

		if (char === "\\") {
			escaped = true;
			continue;
		}

		if (char === '"' && !inSingleQuote) {
			inDoubleQuote = !inDoubleQuote;
		}

		if (char === "'" && !inDoubleQuote) {
			inSingleQuote = !inSingleQuote;
		}
	}

	if (inDoubleQuote) {
		return {
			isValid: false,
			error: "Unmatched double quote",
			position: command.lastIndexOf('"'),
		};
	}

	if (inSingleQuote) {
		return {
			isValid: false,
			error: "Unmatched single quote",
			position: command.lastIndexOf("'"),
		};
	}

	return { isValid: true };
}

/**
 * Validates matching square brackets
 */
function validateBrackets(command: string): SyntaxValidationResult {
	const stack: Array<{ char: string; pos: number }> = [];
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let escaped = false;

	for (let i = 0; i < command.length; i++) {
		const char = command[i];

		if (escaped) {
			escaped = false;
			continue;
		}

		if (char === "\\") {
			escaped = true;
			continue;
		}

		if (char === '"' && !inSingleQuote) {
			inDoubleQuote = !inDoubleQuote;
			continue;
		}

		if (char === "'" && !inDoubleQuote) {
			inSingleQuote = !inSingleQuote;
			continue;
		}

		if (inSingleQuote || inDoubleQuote) continue;

		if (char === "[") {
			stack.push({ char: "[", pos: i });
		} else if (char === "]") {
			if (stack.length === 0) {
				return {
					isValid: false,
					error: "Unmatched closing bracket ']'",
					position: i,
				};
			}

			const lastItem = stack[stack.length - 1];
			if (lastItem && lastItem.char !== "[") {
				return {
					isValid: false,
					error: "Unmatched closing bracket ']'",
					position: i,
				};
			}
			stack.pop();
		}
	}

	if (stack.length > 0) {
		const unmatched = stack[stack.length - 1];
		if (!unmatched) {
			return { isValid: false, error: "Bracket validation error" };
		}
		return {
			isValid: false,
			error: "Unmatched opening bracket '['",
			position: unmatched.pos,
		};
	}

	return { isValid: true };
}

/**
 * Validates matching parentheses
 */
function validateParentheses(command: string): SyntaxValidationResult {
	const stack: Array<{ char: string; pos: number }> = [];
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let escaped = false;

	for (let i = 0; i < command.length; i++) {
		const char = command[i];

		if (escaped) {
			escaped = false;
			continue;
		}

		if (char === "\\") {
			escaped = true;
			continue;
		}

		if (char === '"' && !inSingleQuote) {
			inDoubleQuote = !inDoubleQuote;
			continue;
		}

		if (char === "'" && !inDoubleQuote) {
			inSingleQuote = !inSingleQuote;
			continue;
		}

		if (inSingleQuote || inDoubleQuote) continue;

		if (char === "(") {
			stack.push({ char: "(", pos: i });
		} else if (char === ")") {
			if (stack.length === 0) {
				return {
					isValid: false,
					error: "Unmatched closing parenthesis ')'",
					position: i,
				};
			}

			const lastItem = stack[stack.length - 1];
			if (lastItem && lastItem.char !== "(") {
				return {
					isValid: false,
					error: "Unmatched closing parenthesis ')'",
					position: i,
				};
			}
			stack.pop();
		}
	}

	if (stack.length > 0) {
		const unmatched = stack[stack.length - 1];
		if (!unmatched) {
			return { isValid: false, error: "Parenthesis validation error" };
		}
		return {
			isValid: false,
			error: "Unmatched opening parenthesis '('",
			position: unmatched.pos,
		};
	}

	return { isValid: true };
}

/**
 * Validates escape sequences
 */
function validateEscapeSequences(command: string): SyntaxValidationResult {
	for (let i = 0; i < command.length - 1; i++) {
		if (command[i] === "\\") {
			const nextChar = command[i + 1];
			if (!nextChar) {
				return {
					isValid: false,
					error: "Trailing backslash without escaped character",
					position: i,
				};
			}
			if (!/[\\'"nrtbf $`|&;<>(){}[\]*?]/.test(nextChar)) {
				return {
					isValid: false,
					error: `Invalid escape sequence: \\${nextChar}`,
					position: i,
				};
			}
		}
	}

	if (command.endsWith("\\")) {
		return {
			isValid: false,
			error: "Trailing backslash without escaped character",
			position: command.length - 1,
		};
	}

	return { isValid: true };
}

/**
 * Validates redirection operators
 */
function validateRedirections(command: string): SyntaxValidationResult {
	const redirections = [">", ">>", "<", "<<", "&>", "2>", "2>>"];

	for (const redirect of redirections) {
		const regex = new RegExp(`\\${redirect.split("").join("\\")}`, "g");
		let match: RegExpExecArray | null;

		// biome-ignore lint/suspicious/noAssignInExpressions: Standard pattern for regex matching
		while ((match = regex.exec(command)) !== null) {
			const pos = match.index;
			const afterRedirect = command.slice(pos + redirect.length).trim();

			if (
				!afterRedirect ||
				afterRedirect.startsWith("|") ||
				afterRedirect.startsWith(">") ||
				afterRedirect.startsWith("<")
			) {
				return {
					isValid: false,
					error: `Incomplete redirection: missing target after '${redirect}'`,
					position: pos,
				};
			}
		}
	}

	return { isValid: true };
}

/**
 * Validates pipe operators
 */
function validatePipes(command: string): SyntaxValidationResult {
	const parts = command.split("|");

	if (parts.length > 1) {
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part || !part.trim()) {
				return {
					isValid: false,
					error:
						i === 0
							? "Pipe cannot be at the beginning"
							: i === parts.length - 1
								? "Pipe cannot be at the end"
								: "Empty command between pipes",
					position: command.indexOf("|", i > 0 ? command.indexOf("|") + 1 : 0),
				};
			}
		}
	}

	return { isValid: true };
}

/**
 * Validates characters that might be problematic
 */
function validateCharacters(command: string): SyntaxValidationResult {
	if (command.includes("\0")) {
		return {
			isValid: false,
			error: "Null byte not allowed in command",
			position: command.indexOf("\0"),
		};
	}

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		if (!char) continue;
		const charCode = char.charCodeAt(0);

		if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
			return {
				isValid: false,
				error: `Invalid control character (code: ${charCode})`,
				position: i,
			};
		}
	}

	return { isValid: true };
}

/**
 * Validates specific command syntax based on command type
 */
export function validateSpecificCommand(
	command: string,
	commandType: string,
): SyntaxValidationResult {
	const parts = command.trim().split(/\s+/);
	const cmd = parts[0];

	if (cmd !== commandType) {
		return { isValid: true };
	}

	switch (commandType) {
		case "find":
			return validateFindCommand(parts);
		case "grep":
			return validateGrepCommand(parts);
		case "ls":
			return validateLsCommand(parts);
		default:
			return { isValid: true };
	}
}

/**
 * Validates find command syntax
 */
function validateFindCommand(parts: string[]): SyntaxValidationResult {
	if (parts.length < 2) {
		return {
			isValid: false,
			error: "find: missing path operand",
		};
	}

	const nameIndex = parts.indexOf("-name");
	if (nameIndex !== -1) {
		if (nameIndex === parts.length - 1) {
			return {
				isValid: false,
				error: "find: option '-name' requires an argument",
			};
		}

		const pattern = parts[nameIndex + 1];
		if (!pattern) {
			return {
				isValid: false,
				error: "find: option '-name' requires an argument",
			};
		}
		const quoteValidation = validateQuotes(pattern);
		if (!quoteValidation.isValid) {
			return {
				isValid: false,
				error: `find: ${quoteValidation.error} in pattern`,
			};
		}
	}

	const supportedFlags = ["-name", "-type"];
	for (const part of parts) {
		if (part.startsWith("-") && !supportedFlags.includes(part)) {
			return {
				isValid: false,
				error: `find: unsupported option '${part}'`,
			};
		}
	}

	return { isValid: true };
}

/**
 * Validates grep command syntax
 */
function validateGrepCommand(parts: string[]): SyntaxValidationResult {
	if (parts.length < 2) {
		return {
			isValid: false,
			error: "grep: missing pattern",
		};
	}

	const flags = parts.filter((part) => part.startsWith("-"));
	const supportedFlags = ["-r", "-i", "-c", "-n", "-v", "-l"];

	for (const flag of flags) {
		if (flag.length > 2 && flag.startsWith("-") && !flag.startsWith("--")) {
			const chars = flag.slice(1).split("");
			for (const char of chars) {
				if (!supportedFlags.some((sf) => sf === `-${char}`)) {
					return {
						isValid: false,
						error: `grep: invalid option -- '${char}'`,
					};
				}
			}
		} else if (!supportedFlags.includes(flag)) {
			return {
				isValid: false,
				error: `grep: invalid option '${flag}'`,
			};
		}
	}

	return { isValid: true };
}

/**
 * Validates ls command syntax
 */
function validateLsCommand(parts: string[]): SyntaxValidationResult {
	const flags = parts.filter((part) => part.startsWith("-"));
	const supportedFlags = ["-l", "-a", "-h", "-t", "-r"];

	for (const flag of flags) {
		if (flag.length > 2 && flag.startsWith("-") && !flag.startsWith("--")) {
			const chars = flag.slice(1).split("");
			for (const char of chars) {
				if (!supportedFlags.some((sf) => sf === `-${char}`)) {
					return {
						isValid: false,
						error: `ls: invalid option -- '${char}'`,
					};
				}
			}
		} else if (!supportedFlags.includes(flag)) {
			return {
				isValid: false,
				error: `ls: invalid option '${flag}'`,
			};
		}
	}

	return { isValid: true };
}
