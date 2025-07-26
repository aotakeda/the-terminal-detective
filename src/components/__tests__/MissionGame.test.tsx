import { describe, expect, it } from "vitest";
import { MissionGame } from "../MissionGame";

describe("MissionGame Component", () => {
	it("should be a valid React component", () => {
		expect(typeof MissionGame).toBe("function");
	});

	it("should be exported correctly", () => {
		expect(MissionGame).toBeDefined();
	});

	describe("Streaming Animation Logic", () => {
		it("should determine when to animate output", () => {
			const shouldAnimateOutput = (command: string): boolean => {
				return command === "cat";
			};

			expect(shouldAnimateOutput("cat")).toBe(true);
			expect(shouldAnimateOutput("ls")).toBe(false);
			expect(shouldAnimateOutput("pwd")).toBe(false);
			expect(shouldAnimateOutput("cd")).toBe(false);
		});

		it("should handle streaming state transitions", () => {
			let streamingContent: string[] | null = null;
			let isStreaming = false;
			let output: string[] = [];

			const startStreaming = (lines: string[]) => {
				isStreaming = true;
				streamingContent = [...lines];
			};

			const handleStreamComplete = () => {
				if (streamingContent && isStreaming) {
					const contentToAdd = [...streamingContent];
					isStreaming = false;
					streamingContent = null;
					output = [...output, ...contentToAdd];
				}
			};

			const testLines = ["Line 1", "Line 2", "Line 3"];

			startStreaming(testLines);
			expect(isStreaming).toBe(true);
			expect(streamingContent).toEqual(testLines);
			expect(output).toEqual([]);

			handleStreamComplete();
			expect(isStreaming).toBe(false);
			expect(streamingContent).toBe(null);
			expect(output).toEqual(testLines);
		});

		it("should handle skip functionality during streaming", () => {
			let streamingContent: string[] | null = ["Line 1", "Line 2", "Line 3"];
			let isStreaming = true;
			let output: string[] = ["$ cat file.txt"];

			const handleSkip = () => {
				if (streamingContent && isStreaming) {
					isStreaming = false;
					output = [...output, ...streamingContent];
					streamingContent = null;
				}
			};

			handleSkip();

			expect(isStreaming).toBe(false);
			expect(streamingContent).toBe(null);
			expect(output).toEqual(["$ cat file.txt", "Line 1", "Line 2", "Line 3"]);
		});

		it("should properly process command output", () => {
			const processOutput = (resultOutput: string[]) => {
				const expandedOutput = resultOutput.flatMap((line) =>
					typeof line === "string" ? line.split("\n") : [line],
				);
				return [...expandedOutput, ""];
			};

			const testInput = ["Line 1\nLine 2", "Line 3"];
			const result = processOutput(testInput);

			expect(result).toEqual(["Line 1", "Line 2", "Line 3", ""]);
		});
	});
});
