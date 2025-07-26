import { Box, Text } from "ink";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createBaseCommandRegistry,
	executeCommand,
	filterCommandRegistry,
	getCompletions,
} from "../commands/registry";
import type { GameState } from "../commands/types";
import type { Mission, MissionObjective } from "../types/mission";
import { validateObjective } from "../utils/objectives";
import { AnimatedLine } from "./AnimatedLine";
import { Terminal } from "./Terminal";

interface MissionGameProps {
	mission: Mission;
	onMissionComplete: (missionId: string) => void;
	onSaveMissionComplete: (missionId: string) => void;
	onProceedToNext: (missionId: string) => void;
	onExitMission: () => void;
}

const getDifficultyStars = (difficulty: number): string => {
	return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
};

export const MissionGame: React.FC<MissionGameProps> = ({
	mission,
	onSaveMissionComplete,
	onProceedToNext,
	onExitMission,
}) => {
	const [output, setOutput] = useState<string[]>([]);
	const [staticOutputCount, setStaticOutputCount] = useState(0);
	const [animatingLineIndex, setAnimatingLineIndex] = useState<number | null>(
		null,
	);

	const [currentDirectory, setCurrentDirectory] = useState("/");
	const [objectives, setObjectives] = useState<MissionObjective[]>([
		...mission.objectives,
	]);
	const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
	const [missionCompleted, setMissionCompleted] = useState(false);

	useEffect(() => {
		setOutput([]);
		setStaticOutputCount(0);
		setAnimatingLineIndex(null);
		setCurrentDirectory("/");
		setObjectives([...mission.objectives]);
		setCompletedObjectives([]);
		setMissionCompleted(false);
	}, [mission.objectives]);

	const createGameState = useCallback(
		(): GameState => ({
			currentDirectory,
			filesystem: mission.filesystem,
			objectives,
			completedObjectives,
			missionCompleted,
		}),
		[
			currentDirectory,
			mission.filesystem,
			objectives,
			completedObjectives,
			missionCompleted,
		],
	);

	const shouldAnimateOutput = useCallback(
		(command: string, output: string[]): boolean => {
			if (command === "cat") return true;

			if (output.some((line) => line.includes("OBJECTIVE COMPLETED")))
				return true;

			if (output.some((line) => line.includes("Mission Complete"))) return true;

			if (command === "help" || command === "objectives") return true;

			return false;
		},
		[],
	);

	const commandRegistry = useMemo(
		() =>
			filterCommandRegistry(
				createBaseCommandRegistry(mission.allowedCommands),
				mission.allowedCommands,
			),
		[mission.allowedCommands],
	);

	const handleCompletions = useCallback(
		(input: string): string[] => {
			return getCompletions(input, createGameState(), commandRegistry);
		},
		[commandRegistry, createGameState],
	);

	useEffect(() => {
		const allCompleted = objectives.every((obj) => obj.completed);
		if (
			objectives.length > 0 &&
			completedObjectives.length > 0 &&
			allCompleted &&
			completedObjectives.length === objectives.length &&
			!missionCompleted
		) {
			setMissionCompleted(true);
			onSaveMissionComplete(mission.id);
			setOutput((prev) => {
				const completionMessage = [
					"",
					"=".repeat(60),
					"Mission Complete!",
					"=".repeat(60),
					"",
					...mission.successMessage,
					"",
					"-".repeat(60),
					"What's Next?",
					"-".repeat(60),
					"",
					"Type 'continue' to proceed to the next mission.",
					"Type 'exit' to return to mission selection.",
					"",
					"",
				];
				const newOutput = [...prev, ...completionMessage];
				setAnimatingLineIndex(prev.length);
				return newOutput;
			});
		}
	}, [
		objectives,
		mission,
		completedObjectives,
		missionCompleted,
		onSaveMissionComplete,
	]);

	const checkObjectiveCompletion = useCallback(
		(command: string, args: string, output: string) => {
			setObjectives((currentObjectives) => {
				let hasUpdates = false;
				const updatedObjectives = currentObjectives.map((objective) => {
					const shouldComplete = validateObjective(
						objective,
						command,
						args,
						output,
					);

					if (shouldComplete && !objective.completed) {
						hasUpdates = true;
						setCompletedObjectives((prev) => [...prev, objective.id]);
						setOutput((prev) => {
							const completionMessage = [
								"",
								`[✓] OBJECTIVE COMPLETED: ${objective.description}`,
								"",
							];
							const newOutput = [...prev, ...completionMessage];
							if (animatingLineIndex === null) {
								setAnimatingLineIndex(prev.length);
							}
							return newOutput;
						});
						return { ...objective, completed: true };
					}

					return objective;
				});

				return hasUpdates ? updatedObjectives : currentObjectives;
			});
		},
		[animatingLineIndex],
	);

	const handleSpecialCommands = useCallback(
		(cmd: string): boolean => {
			switch (cmd) {
				case "objectives": {
					const objectivesOutput = [
						"Mission Status",
						"",
						"Objectives:",
						"",
						...objectives.map((obj, i) => {
							const status = obj.completed ? "[Complete]" : "[Pending]";
							return `${status} ${i + 1}. ${obj.description}`;
						}),
						"",
						`Progress: ${completedObjectives.length}/${
							objectives.length
						} (${Math.round(
							(completedObjectives.length / objectives.length) * 100,
						)}% Complete)`,
						"",
						completedObjectives.length === objectives.length
							? "All objectives completed! Mission ready for completion!"
							: "Keep investigating to complete remaining objectives!",
					];
					setOutput((prev) => {
						const newOutput = [...prev, ...objectivesOutput, ""];
						if (shouldAnimateOutput("objectives", objectivesOutput)) {
							setAnimatingLineIndex(prev.length);
						} else {
							setStaticOutputCount(newOutput.length);
						}
						return newOutput;
					});
					return true;
				}

				case "help": {
					const commandDescriptions: { [key: string]: string } = {
						ls: "List directory contents",
						cd: "Change directory",
						pwd: "Print working directory",
						cat: "Display file contents",
						grep: "Search text patterns",
						find: "Search for files",
						head: "Show first lines of file",
						tail: "Show last lines of file",
						sort: "Sort lines in file",
						uniq: "Remove duplicate lines",
						wc: "Count lines, words, characters",
						help: "Show this help message",
					};

					const helpOutput = [
						"=".repeat(60),
						"Help Menu",
						"=".repeat(60),
						"",
						"Available Commands:",
						"",
						...mission.allowedCommands.map((cmd) => {
							const description = commandDescriptions[cmd] || "Command utility";
							return `  ${cmd.padEnd(12)} - ${description}`;
						}),
						"",
						"-".repeat(60),
						"Game Commands:",
						"-".repeat(60),
						"",
						"  objectives   - Show current mission objectives",
						"  help         - Show this help menu",
						"  exit         - Return to mission selection",
						"",
						"=".repeat(60),
						"Tip: Use these commands to investigate and solve the mystery!",
						"=".repeat(60),
					];

					setOutput((prev) => {
						const newOutput = [...prev, ...helpOutput, ""];
						if (shouldAnimateOutput("help", helpOutput)) {
							setAnimatingLineIndex(prev.length);
						} else {
							setStaticOutputCount(newOutput.length);
						}
						return newOutput;
					});
					return true;
				}

				case "exit":
					onExitMission();
					return true;

				case "continue":
					if (missionCompleted) {
						onProceedToNext(mission.id);
						return true;
					}
					break;

				case "skip":
					if (animatingLineIndex !== null) {
						setStaticOutputCount(output.length);
						setAnimatingLineIndex(null);
					}
					return true;
			}
			return false;
		},
		[
			missionCompleted,
			objectives,
			completedObjectives,
			mission,
			onExitMission,
			onProceedToNext,
			animatingLineIndex,
			output.length,
			shouldAnimateOutput,
		],
	);

	const handleCommand = useCallback(
		(command: string) => {
			const trimmedCommand = command.trim();
			const [cmd, ...argArray] = trimmedCommand.split(" ");
			const args = argArray.join(" ");

			if (!cmd) return;

			if (cmd !== "skip") {
				setOutput((prev) => {
					const newOutput = [...prev, `$ ${command}`];
					setStaticOutputCount(newOutput.length);
					return newOutput;
				});
			}

			if (
				missionCompleted &&
				cmd !== "objectives" &&
				cmd !== "exit" &&
				cmd !== "continue" &&
				cmd !== "skip" &&
				cmd !== "help"
			) {
				setOutput((prev) => {
					const message = [
						"Mission completed!",
						"Type 'continue' to proceed to the next mission.",
						"Type 'exit' to return to mission selection.",
						"",
					];
					const newOutput = [...prev, ...message];
					setStaticOutputCount(newOutput.length);
					return newOutput;
				});
				return;
			}

			if (handleSpecialCommands(cmd)) {
				return;
			}
			if (!mission.allowedCommands.includes(cmd)) {
				setOutput((prev) => {
					const errorMessage = [
						`Command '${cmd}' not available in this mission.`,
						`Available commands: ${mission.allowedCommands.join(
							", ",
						)}, exit, objectives`,
						"",
					];
					const newOutput = [...prev, ...errorMessage];
					setStaticOutputCount(newOutput.length);
					return newOutput;
				});
				return;
			}

			const gameState = createGameState();
			const result = executeCommand(cmd, args, gameState, commandRegistry);

			if (result.newState) {
				if (result.newState.currentDirectory !== undefined) {
					setCurrentDirectory(result.newState.currentDirectory);
				}
			}

			const expandedOutput = result.output.flatMap((line) => line.split("\n"));
			const newLines = [...expandedOutput, ""];
			setOutput((prev) => {
				const newOutput = [...prev, ...newLines];
				if (shouldAnimateOutput(cmd, result.output)) {
					setStaticOutputCount(prev.length);
					setAnimatingLineIndex(prev.length);
				} else {
					setStaticOutputCount(newOutput.length);
				}
				return newOutput;
			});

			const outputString = result.output.join(" ");
			if (shouldAnimateOutput(cmd, result.output)) {
				setTimeout(() => {
					checkObjectiveCompletion(cmd, args, outputString);
				}, 100);
			} else {
				checkObjectiveCompletion(cmd, args, outputString);
			}
		},
		[
			missionCompleted,
			mission.allowedCommands,
			commandRegistry,
			checkObjectiveCompletion,
			createGameState,
			shouldAnimateOutput,
			handleSpecialCommands,
		],
	);

	const handleLineAnimationComplete = useCallback(() => {
		setStaticOutputCount((prev) => prev + 1);
	}, []);

	useEffect(() => {
		if (animatingLineIndex !== null && staticOutputCount > animatingLineIndex) {
			if (animatingLineIndex + 1 < output.length) {
				setAnimatingLineIndex(animatingLineIndex + 1);
			} else {
				setAnimatingLineIndex(null);
			}
		}
	}, [staticOutputCount, animatingLineIndex, output.length]);

	const getLineStyle = (line: string) => {
		let color = "white";
		let bold = false;

		if (line.startsWith("$")) {
			color = "green";
			bold = true;
		} else if (line.includes("COMPLETED")) {
			color = "green";
			bold = true;
		} else if (line === "Mission Complete!") {
			color = "green";
			bold = true;
		} else if (line === "Help Menu") {
			color = "cyan";
			bold = true;
		} else if (line === "Available Commands:" || line === "Game Commands:") {
			color = "yellow";
			bold = true;
		} else if (line.startsWith("  ") && line.includes(" - ")) {
			color = "white";
		} else if (line.startsWith("Tip:")) {
			color = "green";
			bold = true;
		} else if (line.startsWith("=".repeat(60))) {
			color = "green";
		} else if (line === "What's Next?") {
			color = "cyan";
			bold = true;
		} else if (line.startsWith("-".repeat(60))) {
			color = "cyan";
		} else if (line.startsWith("Skills Acquired:")) {
			color = "yellow";
			bold = true;
		} else if (line.startsWith("Next mission unlocked:")) {
			color = "magenta";
			bold = true;
		} else if (
			line.trim().startsWith("next ") ||
			line.trim().startsWith("home ")
		) {
			color = "green";
		} else if (line.includes("not found") || line.includes("No such file")) {
			color = "red";
		} else if (line.includes("ERROR") || line.includes("CRITICAL")) {
			color = "red";
			bold = true;
		} else if (line.includes("WARN")) {
			color = "yellow";
		} else if (line.includes(".txt") || line.includes(".log")) {
			color = "cyan";
		}

		return { color, bold };
	};

	const MissionHeader = () => (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="cyan"
			padding={1}
			marginBottom={1}
			aria-label="Mission header"
		>
			<Box justifyContent="center" marginBottom={1}>
				<Text color="cyan" bold>
					DETECTIVE TERMINAL - {mission.title.toUpperCase()}
				</Text>
			</Box>

			<Box justifyContent="center" marginBottom={1}>
				<Text color="white">
					Difficulty: {getDifficultyStars(mission.difficulty)} (
					{mission.difficulty}/5)
				</Text>
			</Box>

			<Box justifyContent="center">
				<Text
					color={
						completedObjectives.length === objectives.length
							? "green"
							: "yellow"
					}
					aria-label={`Mission status: ${completedObjectives.length === objectives.length ? "Completed" : "In Progress"}`}
				>
					Status:{" "}
					{completedObjectives.length === objectives.length
						? "Completed"
						: "In Progress"}
				</Text>
			</Box>
		</Box>
	);

	const MissionBriefing = () => {
		return (
			<Box
				flexDirection="column"
				borderStyle="single"
				borderColor="yellow"
				padding={1}
				marginBottom={1}
				aria-label="Mission briefing"
			>
				<Box marginBottom={1}>
					<Text color="yellow" bold aria-level={2}>
						Briefing
					</Text>
				</Box>

				{mission.briefing.story.map((line, index) => (
					<Box
						key={`story-${mission.id}-${index}`}
						marginBottom={line.trim() === "" ? 1 : 0}
					>
						<Text color="white">{line}</Text>
					</Box>
				))}

				<Box marginBottom={1} />
				<Box marginBottom={1}>
					<Text color="green" bold>
						Your task:{" "}
					</Text>
					<Text color="green">{mission.briefing.task}</Text>
				</Box>
				<Box marginBottom={1}>
					<Text color="cyan">Available commands: </Text>
					{mission.allowedCommands.map((cmd, index) => (
						<Text key={`cmd-${mission.id}-${cmd}`}>
							<Text color="blue" bold>
								{cmd}
							</Text>
							{index < mission.allowedCommands.length - 1 ? (
								<Text color="white">, </Text>
							) : null}
						</Text>
					))}
				</Box>
				<Box marginBottom={1}>
					<Text color="cyan">Required commands: </Text>
					{Array.from(
						new Set(mission.objectives.map((obj) => obj.requiredCommand)),
					).map((cmd, index, arr) => (
						<Text key={`req-cmd-${mission.id}-${cmd}`}>
							<Text color="yellow" bold>
								{cmd}
							</Text>
							{index < arr.length - 1 ? <Text color="white">, </Text> : null}
						</Text>
					))}
				</Box>
				{mission.briefing.instructions.map((instruction, index) => (
					<Box key={`instruction-${mission.id}-${index}`}>
						<Text color="yellow">{instruction}</Text>
					</Box>
				))}
			</Box>
		);
	};

	const ObjectivesPanel = () => (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor="green"
			padding={1}
			marginBottom={1}
		>
			<Box marginBottom={1}>
				<Text color="green" bold>
					Mission Objectives
				</Text>
			</Box>

			{objectives.map((obj, i) => (
				<Box key={obj.id} marginBottom={1}>
					<Text
						color={obj.completed ? "green" : "white"}
						strikethrough={obj.completed}
					>
						[{obj.completed ? "✓" : " "}] {i + 1}. {obj.description}
					</Text>
				</Box>
			))}

			<Box>
				<Text color="white" bold>
					Progress: [{"|".repeat(completedObjectives.length)}
					{"-".repeat(objectives.length - completedObjectives.length)}]{" "}
					{completedObjectives.length} of {objectives.length} complete
				</Text>
			</Box>
		</Box>
	);

	return (
		<Box flexDirection="column" height="100%">
			<Box flexDirection="column" flexShrink={0}>
				<MissionHeader />
				<MissionBriefing />
				<ObjectivesPanel />
			</Box>

			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor="white"
				padding={1}
				marginBottom={1}
			>
				<Box marginBottom={1}>
					<Text color="white" bold>
						Output
					</Text>
				</Box>
				{output.map((line, index) => {
					const { color, bold } = getLineStyle(line);

					if (index < staticOutputCount) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: Output array is append-only, index is stable
							<Box key={`mission-game-static-${index}`} marginBottom={1}>
								<Text color={color} bold={bold}>
									{line}
								</Text>
							</Box>
						);
					}

					if (index === animatingLineIndex) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: Output array is append-only, index is stable
							<Box key={`mission-game-animated-${index}`} marginBottom={1}>
								<AnimatedLine
									text={line}
									color={color}
									bold={bold}
									speed={25}
									onComplete={handleLineAnimationComplete}
								/>
							</Box>
						);
					}

					return null;
				})}
				<Text color="white" dimColor>
					Tip: Type "skip" to instantly display all remaining output
				</Text>
			</Box>

			<Terminal
				onCommand={handleCommand}
				availableCommands={[
					...mission.allowedCommands,
					"exit",
					"objectives",
					"help",
					"skip",
				]}
				getCompletions={handleCompletions}
			/>
		</Box>
	);
};
