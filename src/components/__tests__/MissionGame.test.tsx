import { describe, expect, it } from "vitest";
import { MissionGame } from "../MissionGame";

describe("MissionGame Component", () => {
	it("should be a valid React component", () => {
		expect(typeof MissionGame).toBe("function");
	});

	it("should be exported correctly", () => {
		expect(MissionGame).toBeDefined();
	});
});
