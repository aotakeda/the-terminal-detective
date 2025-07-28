import type { MissionObjective } from "../types/mission";

export const validateObjective = (
	objective: MissionObjective,
	command: string,
	args: string,
	output: string,
): boolean => {
	if (objective.completed) return false;

	const isValidCommand = objective.allowedCommands
		? objective.allowedCommands.includes(command)
		: objective.requiredCommand === command;

	if (!isValidCommand) return false;

	if (objective.validator) {
		switch (objective.validator.type) {
			case "output":
				return objective.validator.fn(output);
			case "args-output":
				return objective.validator.fn(args, output);
			case "full":
				return objective.validator.fn(command, args, output);
			default:
				return false;
		}
	}

	if (objective.targetFile) {
		const targetFile = objective.targetFile;
		const fileName = targetFile.split("/").pop();
		const fileAccessed = args.includes(targetFile) || args === fileName;

		if (objective.expectedOutput) {
			return fileAccessed && output.includes(objective.expectedOutput);
		} else {
			return fileAccessed;
		}
	}

	if (objective.expectedOutput) {
		return output.includes(objective.expectedOutput);
	}

	return true;
};
