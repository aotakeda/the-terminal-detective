import { useCallback, useState } from "react";
import type { Mission } from "../types/mission";

interface UseMissionSelectCommandsProps {
	missions: Mission[];
	onSelectMission: (id: string) => void;
	completedMissions: string[];
}

export const useMissionSelectCommands = ({
	missions,
	onSelectMission,
	completedMissions,
}: UseMissionSelectCommandsProps) => {
	const [output, setOutput] = useState<string[]>([
		"Welcome to Detective Terminal",
		"=".repeat(40),
		"",
		"Available Missions:",
		"",
		...missions.map((mission) => {
			const status = completedMissions.includes(mission.id)
				? "[✓]"
				: mission.unlocked
					? "[ ]"
					: "[🔒]";
			const difficulty =
				"★".repeat(mission.difficulty) + "☆".repeat(5 - mission.difficulty);
			return `${status} ${mission.id} - ${mission.title} (${difficulty})`;
		}),
		"",
		"Commands:",
		"- select <mission_id>  : Start a mission",
		"- list                : Show available missions",
		"- help                : Show this help",
		"",
	]);

	const handleCommand = useCallback(
		(command: string) => {
			const trimmedCommand = command.trim();
			const [cmd, ...argArray] = trimmedCommand.split(" ");
			const args = argArray.join(" ");

			if (!cmd) return;

			setOutput((prev) => [...prev, `$ ${command}`]);

			switch (cmd) {
				case "select": {
					if (!args) {
						setOutput((prev) => [
							...prev,
							"Usage: select <mission_id>",
							"Example: select mission_01",
							"",
						]);
						return;
					}

					const mission = missions.find((m) => m.id === args);
					if (!mission) {
						setOutput((prev) => [
							...prev,
							`Mission '${args}' not found.`,
							"Use 'list' to see available missions.",
							"",
						]);
						return;
					}

					if (!mission.unlocked) {
						setOutput((prev) => [
							...prev,
							`Mission '${args}' is locked.`,
							"Complete previous missions to unlock it.",
							"",
						]);
						return;
					}

					setOutput((prev) => [
						...prev,
						`Starting mission: ${mission.title}`,
						"",
					]);
					onSelectMission(args);
					break;
				}

				case "list": {
					const missionList = missions.map((mission) => {
						const status = completedMissions.includes(mission.id)
							? "[✓]"
							: mission.unlocked
								? "[ ]"
								: "[🔒]";
						const difficulty =
							"★".repeat(mission.difficulty) +
							"☆".repeat(5 - mission.difficulty);
						return `${status} ${mission.id} - ${mission.title} (${difficulty})`;
					});

					setOutput((prev) => [
						...prev,
						"Available Missions:",
						"",
						...missionList,
						"",
					]);
					break;
				}

				case "help": {
					setOutput((prev) => [
						...prev,
						"Detective Terminal Commands:",
						"",
						"select <mission_id>  - Start a mission",
						"list                - Show available missions",
						"help                - Show this help",
						"",
						"Mission Status:",
						"[✓] - Completed",
						"[ ] - Available",
						"[🔒] - Locked",
						"",
					]);
					break;
				}

				default: {
					setOutput((prev) => [
						...prev,
						`Unknown command: ${cmd}`,
						"Type 'help' for available commands.",
						"",
					]);
					break;
				}
			}
		},
		[missions, onSelectMission, completedMissions],
	);

	return { output, handleCommand };
};
