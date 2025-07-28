import { describe, expect, it } from "vitest";
import { GameScreen } from "../GameScreen";

describe("GameScreen Component", () => {
	it("should be a valid React component", () => {
		expect(typeof GameScreen).toBe("function");
	});

	it("should be exported correctly", () => {
		expect(GameScreen).toBeDefined();
	});
});
