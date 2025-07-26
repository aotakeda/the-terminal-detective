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
import { Terminal } from "./Terminal";
import { TerminalStream } from "./TerminalStream";

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
	const [streamingContent, setStreamingContent] = useState<string[] | null>(
		null,
	);
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamingCommand, setStreamingCommand] = useState<{
		command: string;
		args: string;
		outputString: string;
	} | null>(null);

	const [currentDirectory, setCurrentDirectory] = useState("/");
	const [objectives, setObjectives] = useState<MissionObjective[]>([
		...mission.objectives,
	]);
	const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
	const [missionCompleted, setMissionCompleted] = useState(false);

	useEffect(() => {
		setOutput([]);
		setStreamingContent(null);
		setIsStreaming(false);
		setStreamingCommand(null);
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

	const shouldAnimateOutput = useCallback((command: string): boolean => {
		return command === "cat";
	}, []);

	const getLineStyle = (line: string) => {
		let color = "white";
		let bold = false;
		let strikethrough = false;

		if (line.startsWith("$")) {
			color = "green";
			bold = true;
		} else if (line.includes("COMPLETED")) {
			color = "green";
			bold = true;
			strikethrough = true;
		} else if (line.includes("PENDING")) {
			color = "white";
			bold = false;
		} else if (line === "Mission Complete!") {
			color = "green";
			bold = true;
		} else if (line.includes("not found") || line.includes("No such file")) {
			color = "red";
		} else if (line.includes(".txt") || line.includes(".log")) {
			color = "cyan";
		}

		return { color, bold, strikethrough };
	};

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

						return { ...objective, completed: true };
					}

					return objective;
				});

				if (hasUpdates) {
					const objectiveStatusMessage = [
						"",
						"MISSION OBJECTIVES STATUS:",
						"═".repeat(40),
					];
					
					updatedObjectives.forEach((obj, index) => {
						const status = obj.completed ? "✓" : " ";
						const color = obj.completed ? "COMPLETED" : "PENDING";
						objectiveStatusMessage.push(`[${status}] ${index + 1}. ${obj.description} - ${color}`);
					});
					
					objectiveStatusMessage.push("═".repeat(40), "");
					
					setOutput((prev) => [...prev, ...objectiveStatusMessage]);
				}

				return hasUpdates ? updatedObjectives : currentObjectives;
			});
		},
		[],
	);

	const handleStreamComplete = useCallback(() => {
		if (streamingContent && isStreaming) {
			const contentToAdd = [...streamingContent];
			setIsStreaming(false);
			setStreamingContent(null);
			setOutput((prev) => [...prev, ...contentToAdd]);
			
			if (streamingCommand) {
				setTimeout(() => {
					checkObjectiveCompletion(
						streamingCommand.command,
						streamingCommand.args,
						streamingCommand.outputString
					);
				}, 100);
				setStreamingCommand(null);
			}
		}
	}, [streamingContent, isStreaming, streamingCommand, checkObjectiveCompletion]);

	const handleCommand = useCallback(
		(command: string) => {
			const trimmedCommand = command.trim();
			const [cmd, ...argArray] = trimmedCommand.split(" ");
			const args = argArray.join(" ");

			if (!cmd) return;

			setOutput((prev) => [...prev, `$ ${command}`]);

			if (cmd === "skip") {
				if (streamingContent && isStreaming) {
					setIsStreaming(false);
					setOutput((prev) => [...prev, ...streamingContent]);
					setStreamingContent(null);
					
					if (streamingCommand) {
						setTimeout(() => {
							checkObjectiveCompletion(
								streamingCommand.command,
								streamingCommand.args,
								streamingCommand.outputString
							);
						}, 100);
						setStreamingCommand(null);
					}
				}
				return;
			}

			if (cmd === "exit") {
				onExitMission();
				return;
			}

			if (cmd === "continue" && missionCompleted) {
				onProceedToNext(mission.id);
				return;
			}

			if (cmd === "hint") {
				const gameState = createGameState();
				const result = executeCommand(cmd, args, gameState, commandRegistry);
				const newLines = [...result.output, ""];
				setOutput((prev) => [...prev, ...newLines]);
				return;
			}

			if (!mission.allowedCommands.includes(cmd)) {
				const errorMessage = [
					`Command '${cmd}' not available in this mission.`,
					`Available commands: ${mission.allowedCommands.join(", ")}, hint, exit`,
					"",
				];
				setOutput((prev) => [...prev, ...errorMessage]);
				return;
			}

			const gameState = createGameState();
			const result = executeCommand(cmd, args, gameState, commandRegistry);

			if (result.newState?.currentDirectory !== undefined) {
				setCurrentDirectory(result.newState.currentDirectory);
			}

			const expandedOutput = result.output.flatMap((line) =>
				typeof line === "string" ? line.split("\n") : [line],
			);
			const newLines = [...expandedOutput, ""];

			const outputString = result.output.join(" ");
			
			if (shouldAnimateOutput(cmd)) {
				setIsStreaming(true);
				setStreamingContent([...newLines]);
				setStreamingCommand({ command: cmd, args, outputString });
			} else {
				setOutput((prev) => [...prev, ...newLines]);
				setTimeout(() => {
					checkObjectiveCompletion(cmd, args, outputString);
				}, 100);
			}
		},
		[
			mission.allowedCommands,
			mission.id,
			commandRegistry,
			checkObjectiveCompletion,
			createGameState,
			shouldAnimateOutput,
			onExitMission,
			onProceedToNext,
			streamingContent,
			isStreaming,
			missionCompleted,
		],
	);

	useEffect(() => {
		const allCompleted = objectives.every((obj) => obj.completed);
		if (
			objectives.length > 0 &&
			completedObjectives.length > 0 &&
			allCompleted &&
			!missionCompleted
		) {
			setMissionCompleted(true);
			onSaveMissionComplete(mission.id);

			const completionMessage = [
				"",
				"=".repeat(60),
				"Mission Complete!",
				"=".repeat(60),
				"",
				"Type 'continue' to proceed or 'exit' to return to menu.",
				"",
			];
			setOutput((prev) => [...prev, ...completionMessage]);
		}
	}, [
		objectives,
		completedObjectives,
		missionCompleted,
		mission.id,
		onSaveMissionComplete,
	]);

	return (
		<Box flexDirection="column" height="100%">
			<Box flexDirection="column" flexShrink={0}>
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="cyan"
					padding={1}
					marginBottom={1}
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
					{mission.briefing && (
						<Box flexDirection="column" marginBottom={1}>
							<Text color="yellow" bold>
								Mission Brief:
							</Text>
							{mission.briefing.story.map((line, index) => (
								<Text key={`story-${line.slice(0, 20)}-${index}`} color="white">
									{line}
								</Text>
							))}
							<Box marginTop={1}>
								<Text color="cyan" bold>
									Task:{" "}
								</Text>
								<Text color="white">{mission.briefing.task}</Text>
							</Box>
							<Box marginTop={1}>
								<Text color="green" bold>
									Available Commands:{" "}
								</Text>
								<Text color="white">{mission.allowedCommands.join(", ")}</Text>
							</Box>
							{mission.briefing.instructions.length > 0 && (
								<Box flexDirection="column" marginTop={1}>
									<Text color="magenta" bold>
										Instructions:
									</Text>
									{mission.briefing.instructions.map((instruction, index) => (
										<Text
											key={`instruction-${instruction.slice(0, 20)}-${index}`}
											color="white"
										>
											• {instruction}
										</Text>
									))}
								</Box>
							)}
						</Box>
					)}
				</Box>

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
							<Text color={obj.completed ? "green" : "white"}>
								[{obj.completed ? "✓" : " "}] {i + 1}. {obj.description}
							</Text>
						</Box>
					))}
				</Box>
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
					const { color, bold, strikethrough } = getLineStyle(line);
					return (
						<Box
							key={`static-output-${line.slice(0, 30)}-${index}`}
							marginBottom={1}
						>
							<Text color={color} bold={bold} strikethrough={strikethrough}>
								{line}
							</Text>
						</Box>
					);
				})}

				{streamingContent && isStreaming && (
					<TerminalStream
						lines={streamingContent}
						speed={60}
						onComplete={handleStreamComplete}
					/>
				)}

				<Text color="white" dimColor>
					Tip: Type "skip" to instantly display output
				</Text>
			</Box>

			<Terminal
				onCommand={handleCommand}
				availableCommands={[...mission.allowedCommands, "hint", "exit", "skip"]}
				getCompletions={handleCompletions}
			/>
		</Box>
	);
};
