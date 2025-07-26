import { Box, Text } from "ink";
import type React from "react";
import { useState } from "react";
import type { Mission } from "../types/mission";
import { resetProgress } from "../utils/progress";
import { Terminal } from "./Terminal";

interface MissionSelectProps {
	missions: Mission[];
	onSelectMission: (missionId: string) => void;
	completedMissions: string[];
}

const getDifficultyStars = (difficulty: number): string => {
	return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
};

const getMissionStatus = (
	mission: Mission,
	completedMissions: string[],
): string => {
	if (completedMissions.includes(mission.id)) {
		return "Completed";
	}
	if (mission.unlocked) {
		return "Available";
	}
	return "Locked";
};

export const MissionSelect: React.FC<MissionSelectProps> = ({
	missions,
	onSelectMission,
	completedMissions,
}) => {
	const [output, setOutput] = useState<string[]>([]);
	const [pendingReset, setPendingReset] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const missionsPerPage = 10;

	const totalPages = Math.ceil(missions.length / missionsPerPage);
	const startIndex = currentPage * missionsPerPage;
	const endIndex = Math.min(startIndex + missionsPerPage, missions.length);
	const currentMissions = missions.slice(startIndex, endIndex);

	const completionPercentage = Math.round(
		(completedMissions.length / missions.length) * 100,
	);

	const getLineStyle = (line: string) => {
		let color = "white";
		let bold = false;

		if (line.startsWith("$")) {
			color = "green";
			bold = true;
		} else if (line === "Mission Selection Help") {
			color = "cyan";
			bold = true;
		} else if (line === "Available Commands:") {
			color = "yellow";
			bold = true;
		} else if (line.startsWith("  ") && line.includes(" - ")) {
			color = "white";
		} else if (line.startsWith("Tip:")) {
			color = "green";
			bold = true;
		} else if (line.startsWith("=".repeat(60))) {
			color = "green";
		} else if (
			line.includes("[WARNING]") ||
			line.includes("[INFO]") ||
			line.includes("[SUCCESS]")
		) {
			if (line.includes("[WARNING]")) {
				color = "red";
				bold = true;
			} else if (line.includes("[SUCCESS]")) {
				color = "green";
				bold = true;
			} else {
				color = "cyan";
				bold = true;
			}
		}

		return { color, bold };
	};

	const handleCommand = (command: string) => {
		const trimmedCommand = command.trim();
		const [cmd, ...args] = trimmedCommand.split(" ");

		setOutput((prev) => [...prev, `$ ${command}`]);

		if (pendingReset && !(cmd === "reset" && args[0] === "confirm")) {
			setPendingReset(false);
			setOutput((prev) => [
				...prev,
				"[INFO] Reset cancelled. Your progress is safe.",
				"",
			]);
			if (cmd === "reset" && args[0] !== "confirm") {
				return;
			}
		}

		if (cmd === "next") {
			if (currentPage < totalPages - 1) {
				setCurrentPage(currentPage + 1);
				setOutput([]);
			} else {
				setOutput((prev) => [...prev, "Already on the last page.", ""]);
			}
			return;
		}

		if (cmd === "prev" || cmd === "previous") {
			if (currentPage > 0) {
				setCurrentPage(currentPage - 1);
				setOutput([]);
			} else {
				setOutput((prev) => [...prev, "Already on the first page.", ""]);
			}
			return;
		}

		if (cmd === "start" || /^\d+$/.test(cmd ?? "")) {
			let missionNumber = args[0];

			if (/^\d+$/.test(cmd ?? "")) {
				missionNumber = cmd;
			}

			if (!missionNumber) {
				setOutput((prev) => [
					...prev,
					"Usage: start [mission_number] or just type the mission number",
					"Example: start 1  or  1",
					"",
				]);
				return;
			}

			const globalMissionIndex = parseInt(missionNumber) - 1;
			const mission = missions[globalMissionIndex];

			if (!mission) {
				setOutput((prev) => [
					...prev,
					`Mission '${missionNumber}' not found.`,
					'Use "list" to see available missions.',
					"",
				]);
				return;
			}

			if (!mission.unlocked) {
				setOutput((prev) => [
					...prev,
					`Mission ${missionNumber} is locked.`,
					"Complete previous missions to unlock it.",
					"",
				]);
				return;
			}

			setOutput((prev) => [
				...prev,
				`Starting mission ${missionNumber}: ${mission.title}`,
				"",
			]);
			onSelectMission(mission.id);
			return;
		}

		switch (cmd) {
			case "list":
				setOutput((prev) => [
					...prev,
					"All missions:",
					...missions.map((m, index) => {
						const missionNumber = index + 1;
						const isCompleted = completedMissions.includes(m.id);
						const status = isCompleted
							? "[Completed]"
							: m.unlocked
								? "[Available]"
								: "[Locked]";
						const title = isCompleted ? `̶${m.title}̶` : m.title;
						return `${status} ${missionNumber}. ${title} - ${getDifficultyStars(m.difficulty)}`;
					}),
					"",
					"Type the mission number to start (e.g., '1' or 'start 1')",
					`Use 'next' and 'prev' to navigate pages (Page ${
						currentPage + 1
					}/${totalPages})`,
					"",
				]);
				break;

			case "help":
				setOutput((prev) => [
					...prev,
					"=".repeat(60),
					"Mission Selection Help",
					"=".repeat(60),
					"",
					"Available Commands:",
					"",
					"  [number]        - Start mission by number (e.g., 1, 2, 3...)",
					"  start [number]  - Start mission by number",
					"  list            - List all missions and their status",
					"  next            - Go to next page of missions",
					"  prev/previous   - Go to previous page of missions",
					"  help            - Show this help",
					"  clear           - Clear the screen",
					"  reset           - Reset all progress (requires confirmation)",
					"  exit            - Exit the game",
					"",
					"=".repeat(60),
					"Tip: Type a mission number to start investigating!",
					"=".repeat(60),
					"",
				]);
				break;

			case "clear":
				setOutput([]);
				break;

			case "reset":
				if (!pendingReset) {
					setPendingReset(true);
					setOutput((prev) => [
						...prev,
						"[WARNING] This will permanently delete all your progress!",
						"",
						"Are you sure you want to reset all mission progress?",
						"Type 'reset confirm' to proceed or any other command to cancel.",
						"",
					]);
				} else if (args[0] === "confirm") {
					setPendingReset(false);
					setOutput((prev) => [
						...prev,
						"[SUCCESS] Progress reset! All mission progress has been cleared.",
						"Restart the application to see the changes.",
						"",
					]);
					resetProgress();
				} else {
					setPendingReset(false);
					setOutput((prev) => [
						...prev,
						"[INFO] Reset cancelled. Your progress is safe.",
						"",
					]);
				}
				break;

			case "exit":
				process.exit(0);
				break;

			default:
				setOutput((prev) => [
					...prev,
					`Command not found: ${cmd}`,
					"Available commands: 1, 2, 3, start, list, help, clear, reset, exit",
					"",
				]);
		}
	};

	return (
		<Box flexDirection="column" height="100%">
			<Box flexDirection="column" alignItems="center" marginBottom={1}>
				<Box flexDirection="column" alignItems="center">
					{[
						"+-----------------------------------------------------------------+",
						"|    _____ _            _____                   _             _   |",
						"|   |_   _| |__   ___  |_   _|__ _ __ _ __ ___ (_)_ __   __ _| |  |",
						"|     | | | '_ \\ / _ \\   | |/ _ \\ '__| '_ ` _ \\| | '_ \\ / _` | |  |",
						"|     | | | | | |  __/   | |  __/ |  | | | | | | | | | | (_| | |  |",
						"|    _|_| |_| |_|\\___|   |_|\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|  |",
						"|   |  _ \\  ___| |_ ___  ___| |_(_)_   _____                      |",
						"|   | | | |/ _ \\ __/ _ \\/ __| __| \\ \\ / / _ \\                     |",
						"|   | |_| |  __/ ||  __/ (__| |_| |\\ V /  __/                     |",
						"|   |____/ \\___|\\_\\____|\\___|\\__|_| \\_/ \\___|                     |",
						"|                                                                 |",
						"+-----------------------------------------------------------------+",
					].map((line, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Static ASCII art, order never changes
						<Text key={`ascii-art-${index}`} color="cyan" bold>
							{line}
						</Text>
					))}
				</Box>
				<Box marginTop={1} alignItems="center">
					<Text color="yellow" bold>
						Mission Selection
					</Text>
				</Box>
				<Text color="white">Choose your investigation</Text>

				<Box
					marginTop={1}
					marginBottom={1}
					flexDirection="column"
					alignItems="center"
				>
					<Text color="green" bold>
						Progress: {completedMissions.length}/{missions.length} (
						{completionPercentage}%)
					</Text>
					<Box marginTop={1}>
						<Text color="green">
							{"█".repeat(Math.floor(completionPercentage / 5))}
						</Text>
						<Text color="gray">
							{"░".repeat(20 - Math.floor(completionPercentage / 5))}
						</Text>
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" flexGrow={1}>
				{output.length === 0 && (
					<>
						<Box flexDirection="column" marginBottom={1}>
							{currentMissions.map((mission, index) => {
								const globalIndex = startIndex + index;
								const missionNumber = globalIndex + 1;
								const status = getMissionStatus(mission, completedMissions);
								const isAvailable =
									mission.unlocked && !completedMissions.includes(mission.id);
								const isCompleted = completedMissions.includes(mission.id);

								return (
									<Box key={mission.id} flexDirection="column" marginBottom={1}>
										<Box flexDirection="row" alignItems="center">
											<Text
												color={
													isCompleted ? "green" : isAvailable ? "cyan" : "gray"
												}
												bold
												strikethrough={isCompleted}
											>
												{missionNumber}. {mission.title}
											</Text>
											<Text color="white"> - </Text>
											<Text
												color={
													status === "Completed"
														? "green"
														: status === "Available"
															? "cyan"
															: "gray"
												}
											>
												{getDifficultyStars(mission.difficulty)} {status}
											</Text>
										</Box>

										<Box marginLeft={2}>
											<Text color={isAvailable ? "white" : "gray"}>
												{mission.description}
											</Text>
										</Box>

										{isAvailable && (
											<Box marginLeft={2}>
												<Text color="green">
													To start, type: {missionNumber}
												</Text>
											</Box>
										)}
									</Box>
								);
							})}
						</Box>

						{totalPages > 1 && (
							<Box flexDirection="column" alignItems="center" marginBottom={1}>
								<Text color="yellow">
									Page {currentPage + 1} of {totalPages}
								</Text>
								<Text color="gray">
									{currentPage > 0 && "prev"}
									{currentPage > 0 && currentPage < totalPages - 1 && " | "}
									{currentPage < totalPages - 1 && "next"}
								</Text>
							</Box>
						)}

						<Box flexDirection="column" alignItems="center">
							<Text color="gray">
								Commands: [number] | list | next/prev | help | reset | exit
							</Text>
						</Box>
					</>
				)}

				{output.map((line, index) => {
					const { color, bold } = getLineStyle(line);
					return (
						<Text
							// biome-ignore lint/suspicious/noArrayIndexKey: Output array is append-only, index is stable
							key={`mission-select-output-${index}`}
							color={color}
							bold={bold}
						>
							{line}
						</Text>
					);
				})}
			</Box>

			<Terminal
				onCommand={handleCommand}
				availableCommands={[
					"start",
					"1",
					"2",
					"3",
					"list",
					"help",
					"clear",
					"reset",
					"exit",
				]}
			/>
		</Box>
	);
};
