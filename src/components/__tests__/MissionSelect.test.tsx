import { describe, expect, it } from "vitest";
import { MissionSelect } from "../MissionSelect";

describe("MissionSelect Component", () => {
	it("should be a valid React component", () => {
		expect(typeof MissionSelect).toBe("function");
	});

	it("should be exported correctly", () => {
		expect(MissionSelect).toBeDefined();
	});
});
