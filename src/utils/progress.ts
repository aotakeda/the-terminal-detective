import * as fs from "node:fs";
import * as path from "node:path";

interface ProgressData {
	completedMissions: string[];
	currentMission?: string;
	lastPlayed: string;
}

const PROGRESS_DIR = process.env.PROGRESS_DIR || process.cwd();
const PROGRESS_FILE = path.join(PROGRESS_DIR, "terminal_progress.txt");

export const loadProgress = (): ProgressData => {
	try {
		if (fs.existsSync(PROGRESS_FILE)) {
			const data = fs.readFileSync(PROGRESS_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch {}

	return {
		completedMissions: [],
		lastPlayed: new Date().toISOString(),
	};
};

export const saveProgress = (progress: ProgressData): void => {
	try {
		const progressWithTimestamp = {
			...progress,
			lastPlayed: new Date().toISOString(),
		};

		fs.writeFileSync(
			PROGRESS_FILE,
			JSON.stringify(progressWithTimestamp, null, 2),
		);
	} catch {}
};

export const resetProgress = (): void => {
	try {
		if (fs.existsSync(PROGRESS_FILE)) {
			fs.unlinkSync(PROGRESS_FILE);
		}
	} catch {}
};
