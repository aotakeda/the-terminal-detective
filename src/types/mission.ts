export interface MissionFile {
	name: string;
	content: string;
	hidden?: boolean;
	permissions?: string;
}

export interface MissionDirectory {
	name: string;
	files: MissionFile[];
	subdirectories?: MissionDirectory[];
}

export interface MissionObjective {
	id: string;
	description: string;
	hint?: string;
	completed: boolean;
	requiredCommand?: string;
	targetFile?: string;
	expectedOutput?: string;
	validator?:
		| { type: "output"; fn: (output: string) => boolean }
		| { type: "args-output"; fn: (args: string, output: string) => boolean }
		| {
				type: "full";
				fn: (command: string, args: string, output: string) => boolean;
		  };
	allowedCommands?: string[];
}

export interface Mission {
	id: string;
	title: string;
	difficulty: 1 | 2 | 3 | 4 | 5;
	description: string;
	briefing: {
		story: string[];
		task: string;
		instructions: string[];
	};
	objectives: MissionObjective[];
	filesystem: MissionDirectory;
	allowedCommands: string[];
	newCommands: string[];
	unlocked: boolean;
	completed: boolean;
	successMessage: string[];
}

export interface GameState {
	currentMission: string | null;
	missions: Mission[];
	unlockedMissions: string[];
	completedMissions: string[];
	currentDirectory: string;
	commandHistory: string[];
}
