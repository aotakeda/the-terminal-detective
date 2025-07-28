import { describe, expect, it } from "vitest";
import { Terminal } from "../Terminal";

describe("Terminal Component", () => {
	it("should be a valid React component", () => {
		expect(typeof Terminal).toBe("function");
	});

	it("should be exported correctly", () => {
		expect(Terminal).toBeDefined();
	});
});
