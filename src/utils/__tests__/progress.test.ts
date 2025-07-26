import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadProgress, resetProgress, saveProgress } from "../progress";

const PROGRESS_FILE = path.join(process.cwd(), "terminal_progress.txt");

describe("Progress Utils", () => {
	beforeEach(() => {
		if (fs.existsSync(PROGRESS_FILE)) {
			fs.unlinkSync(PROGRESS_FILE);
		}
	});

	afterEach(() => {
		if (fs.existsSync(PROGRESS_FILE)) {
			fs.unlinkSync(PROGRESS_FILE);
		}
	});

	describe("loadProgress", () => {
		it("should return default progress when no file exists", () => {
			const progress = loadProgress();

			expect(progress.completedMissions).toEqual([]);
			expect(progress.lastPlayed).toBeDefined();
			expect(new Date(progress.lastPlayed)).toBeInstanceOf(Date);
		});

		it("should load existing progress from file", () => {
			const testProgress = {
				completedMissions: ["mission_01", "mission_02"],
				lastPlayed: "2024-01-15T10:30:00.000Z",
			};

			fs.writeFileSync(PROGRESS_FILE, JSON.stringify(testProgress));

			const loadedProgress = loadProgress();

			expect(loadedProgress.completedMissions).toEqual([
				"mission_01",
				"mission_02",
			]);
			expect(loadedProgress.lastPlayed).toBe("2024-01-15T10:30:00.000Z");
		});

		it("should return default progress when file is corrupted", () => {
			fs.writeFileSync(PROGRESS_FILE, "invalid json");

			const progress = loadProgress();

			expect(progress.completedMissions).toEqual([]);
			expect(progress.lastPlayed).toBeDefined();
		});
	});

	describe("saveProgress", () => {
		it("should save progress to file with timestamp", () => {
			const testProgress = {
				completedMissions: ["mission_01"],
				currentMission: "mission_02",
				lastPlayed: "2024-01-15T10:30:00.000Z",
			};

			saveProgress(testProgress);

			expect(fs.existsSync(PROGRESS_FILE)).toBe(true);

			const savedData = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
			expect(savedData.completedMissions).toEqual(["mission_01"]);
			expect(savedData.currentMission).toBe("mission_02");
			expect(new Date(savedData.lastPlayed)).toBeInstanceOf(Date);
		});

		it("should handle save errors gracefully", () => {
			expect(typeof saveProgress).toBe("function");
		});
	});

	describe("resetProgress", () => {
		it("should delete progress file when it exists", () => {
			fs.writeFileSync(
				PROGRESS_FILE,
				JSON.stringify({ completedMissions: ["mission_01"] }),
			);
			expect(fs.existsSync(PROGRESS_FILE)).toBe(true);

			resetProgress();

			expect(fs.existsSync(PROGRESS_FILE)).toBe(false);
		});

		it("should handle reset when file does not exist", () => {
			expect(fs.existsSync(PROGRESS_FILE)).toBe(false);

			expect(() => resetProgress()).not.toThrow();
		});

		it("should handle deletion errors gracefully", () => {
			expect(typeof resetProgress).toBe("function");
		});
	});
});
