import { describe, expect, it } from "vitest";
import {
	validateCommandSyntax,
	validateSpecificCommand,
} from "../syntax-validator";

describe("Syntax Validator", () => {
	describe("validateCommandSyntax", () => {
		describe("quote validation", () => {
			it("should accept properly matched double quotes", () => {
				const result = validateCommandSyntax('find . -name "*.txt"');
				expect(result.isValid).toBe(true);
			});

			it("should accept properly matched single quotes", () => {
				const result = validateCommandSyntax("find . -name '*.txt'");
				expect(result.isValid).toBe(true);
			});

			it("should reject unmatched double quotes", () => {
				const result = validateCommandSyntax('find . -name "*.txt');
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched double quote");
			});

			it("should reject unmatched single quotes", () => {
				const result = validateCommandSyntax("find . -name '*.txt");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched single quote");
			});

			it("should handle escaped quotes", () => {
				const result = validateCommandSyntax('echo "He said \\"Hello\\""');
				expect(result.isValid).toBe(true);
			});
		});

		describe("bracket validation", () => {
			it("should accept properly matched brackets", () => {
				const result = validateCommandSyntax("grep 'test[0-9]' file.txt");
				expect(result.isValid).toBe(true);
			});

			it("should reject unmatched opening bracket", () => {
				const result = validateCommandSyntax("grep test[0-9 file.txt");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched opening bracket");
			});

			it("should reject unmatched closing bracket", () => {
				const result = validateCommandSyntax("grep test0-9] file.txt");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched closing bracket");
			});

			it("should ignore brackets inside quotes", () => {
				const result = validateCommandSyntax('echo "test[bracket"');
				expect(result.isValid).toBe(true);
			});
		});

		describe("parentheses validation", () => {
			it("should accept properly matched parentheses", () => {
				const result = validateCommandSyntax(
					"find . \\( -name '*.txt' -o -name '*.log' \\)",
				);
				expect(result.isValid).toBe(true);
			});

			it("should reject unmatched opening parenthesis", () => {
				const result = validateCommandSyntax("find . ( -name '*.txt'");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched opening parenthesis");
			});

			it("should reject unmatched closing parenthesis", () => {
				const result = validateCommandSyntax("find . -name '*.txt' )");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Unmatched closing parenthesis");
			});
		});

		describe("escape sequence validation", () => {
			it("should accept valid escape sequences", () => {
				const result = validateCommandSyntax("echo 'test\\n\\t\\r'");
				expect(result.isValid).toBe(true);
			});

			it("should reject invalid escape sequences", () => {
				const result = validateCommandSyntax("echo 'test\\x'");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Invalid escape sequence");
			});

			it("should reject trailing backslash", () => {
				const result = validateCommandSyntax("echo test\\");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Trailing backslash");
			});
		});

		describe("pipe validation", () => {
			it("should accept valid pipes", () => {
				const result = validateCommandSyntax("cat file.txt | grep pattern");
				expect(result.isValid).toBe(true);
			});

			it("should reject pipe at beginning", () => {
				const result = validateCommandSyntax("| grep pattern");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Pipe cannot be at the beginning");
			});

			it("should reject pipe at end", () => {
				const result = validateCommandSyntax("cat file.txt |");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Pipe cannot be at the end");
			});

			it("should reject empty command between pipes", () => {
				const result = validateCommandSyntax("cat file.txt || grep pattern");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Empty command between pipes");
			});
		});

		describe("redirection validation", () => {
			it("should accept valid redirections", () => {
				const result = validateCommandSyntax("cat file.txt > output.txt");
				expect(result.isValid).toBe(true);
			});

			it("should reject incomplete redirection", () => {
				const result = validateCommandSyntax("cat file.txt >");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Incomplete redirection");
			});
		});

		describe("empty command validation", () => {
			it("should reject empty commands", () => {
				const result = validateCommandSyntax("");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Empty command");
			});

			it("should reject whitespace-only commands", () => {
				const result = validateCommandSyntax("   ");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("Empty command");
			});
		});
	});

	describe("validateSpecificCommand", () => {
		describe("find command", () => {
			it("should accept valid find commands", () => {
				const result = validateSpecificCommand("find . -name '*.txt'", "find");
				expect(result.isValid).toBe(true);
			});

			it("should reject find without path", () => {
				const result = validateSpecificCommand("find", "find");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("missing path operand");
			});

			it("should reject -name without argument", () => {
				const result = validateSpecificCommand("find . -name", "find");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("option '-name' requires an argument");
			});

			it("should reject unsupported options", () => {
				const result = validateSpecificCommand("find . -invalid", "find");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("unsupported option");
			});

			it("should detect unmatched quotes in pattern", () => {
				const result = validateSpecificCommand("find . -name '*.txt", "find");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("quote in pattern");
			});
		});

		describe("grep command", () => {
			it("should accept valid grep commands", () => {
				const result = validateSpecificCommand("grep -r pattern", "grep");
				expect(result.isValid).toBe(true);
			});

			it("should reject grep without pattern", () => {
				const result = validateSpecificCommand("grep", "grep");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("missing pattern");
			});

			it("should accept combined flags", () => {
				const result = validateSpecificCommand("grep -ri pattern", "grep");
				expect(result.isValid).toBe(true);
			});

			it("should reject invalid flags", () => {
				const result = validateSpecificCommand("grep -x pattern", "grep");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("invalid option");
			});

			it("should reject invalid combined flags", () => {
				const result = validateSpecificCommand("grep -rx pattern", "grep");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("invalid option -- 'x'");
			});
		});

		describe("ls command", () => {
			it("should accept valid ls commands", () => {
				const result = validateSpecificCommand("ls -la", "ls");
				expect(result.isValid).toBe(true);
			});

			it("should accept ls without arguments", () => {
				const result = validateSpecificCommand("ls", "ls");
				expect(result.isValid).toBe(true);
			});

			it("should reject invalid flags", () => {
				const result = validateSpecificCommand("ls -x", "ls");
				expect(result.isValid).toBe(false);
				expect(result.error).toContain("invalid option");
			});
		});
	});

	describe("edge cases", () => {
		it("should handle mixed quotes correctly", () => {
			const result = validateCommandSyntax(`echo "It's a test"`);
			expect(result.isValid).toBe(true);
		});

		it("should handle nested structures", () => {
			const result = validateCommandSyntax(
				`find . -name "test*.txt" | grep "pattern"`,
			);
			expect(result.isValid).toBe(true);
		});

		it("should detect control characters", () => {
			const result = validateCommandSyntax("echo test\x00");
			expect(result.isValid).toBe(false);
			expect(result.error).toContain("Null byte not allowed");
		});
	});
});
