import type { MissionDirectory, MissionObjective } from "../types/mission";

export interface GameState {
	readonly currentDirectory: string;
	readonly filesystem: MissionDirectory;
	readonly objectives: MissionObjective[];
	readonly completedObjectives: string[];
	readonly missionCompleted: boolean;
}

export interface CommandResult {
	readonly output: string[];
	readonly error?: string;
	readonly newState?: Partial<GameState>;
}

export type CommandHandler = (args: string, state: GameState) => CommandResult;

export type CompletionHandler = (input: string, state: GameState) => string[];

export interface CommandDefinition {
	readonly handler: CommandHandler;
	readonly completion?: CompletionHandler;
	readonly description: string;
}

export type CommandRegistry = Record<string, CommandDefinition>;
