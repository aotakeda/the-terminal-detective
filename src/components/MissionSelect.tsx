import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import type React from "react";
import { useEffect, useState } from "react";
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
	const missionsPerPage = 3;

	const findFirstIncompletePageIndex = () => {
		const totalPages = Math.ceil(missions.length / missionsPerPage);

		for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
			const startIndex = pageIndex * missionsPerPage;
			const endIndex = Math.min(startIndex + missionsPerPage, missions.length);
			const pageMissions = missions.slice(startIndex, endIndex);

			const hasIncomplete = pageMissions.some(
				(mission) => !completedMissions.includes(mission.id),
			);

			if (hasIncomplete) {
				return pageIndex;
			}
		}

		return totalPages - 1;
	};

	const [currentPage, setCurrentPage] = useState(findFirstIncompletePageIndex);

	const totalPages = Math.ceil(missions.length / missionsPerPage);
	const startIndex = currentPage * missionsPerPage;
	const endIndex = Math.min(startIndex + missionsPerPage, missions.length);
	const currentMissions = missions.slice(startIndex, endIndex);

	const completionPercentage = Math.round(
		(completedMissions.length / missions.length) * 100,
	);

	useEffect(() => {
		const totalPages = Math.ceil(missions.length / missionsPerPage);

		for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
			const startIndex = pageIndex * missionsPerPage;
			const endIndex = Math.min(startIndex + missionsPerPage, missions.length);
			const pageMissions = missions.slice(startIndex, endIndex);

			const hasIncomplete = pageMissions.some(
				(mission) => !completedMissions.includes(mission.id),
			);

			if (hasIncomplete) {
				setCurrentPage(pageIndex);
				return;
			}
		}

		setCurrentPage(totalPages - 1);
	}, [completedMissions, missions]);

	useEffect(() => {
		if (completedMissions.length === missions.length && missions.length > 0) {
			const timer = setTimeout(() => {
				setOutput((prev) => [
					...prev,
					"",
					"CONGRATULATIONS!",
					"",
					"You have completed ALL missions! I hope you enjoyed it!",
					"I try to add new missions every week, so try to pull the latest version here and there!",
					"",
					"Thank you for playing The Terminal Detective!",
					"Feel free to replay any mission or explore the commands you've learned.",
					"",
					"Commands: list | reset | exit",
					"",
				]);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [completedMissions.length, missions.length]);

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
				return;

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
			<Gradient name="fruit">
				<BigText text="The Terminal" align="center" />
				<BigText text="Detective" align="center" />
			</Gradient>
			<Box flexDirection="column" alignItems="center" marginBottom={1}>
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
