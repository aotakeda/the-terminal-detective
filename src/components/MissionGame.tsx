import { Box, Text } from "ink";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	createBaseCommandRegistry,
	executeCommand,
	executePipedCommand,
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
	const maxOutputLines = 20;

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
						streamingCommand.outputString,
					);
				}, 100);
				setStreamingCommand(null);
			}
		}
	}, [
		streamingContent,
		isStreaming,
		streamingCommand,
		checkObjectiveCompletion,
	]);

	const handleCommand = useCallback(
		(command: string) => {
			const trimmedCommand = command.trim();

			if (!trimmedCommand) return;

			setOutput((prev) => [...prev, `$ ${command}`]);

			const [cmd, ...argArray] = trimmedCommand.split(" ");
			const args = argArray.join(" ");

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
								streamingCommand.outputString,
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

			const isPipedCommand = trimmedCommand.includes("|");

			if (isPipedCommand) {
				const pipeCommands = trimmedCommand
					.split("|")
					.map((part) => part.trim().split(" ")[0])
					.filter((cmd): cmd is string => cmd !== undefined);
				const invalidCommands = pipeCommands.filter(
					(pipeCmd) =>
						!mission.allowedCommands.includes(pipeCmd) && pipeCmd !== "hint",
				);

				if (invalidCommands.length > 0) {
					const errorMessage = [
						`Command(s) '${invalidCommands.join(", ")}' not available in this mission.`,
						`Available commands: ${mission.allowedCommands.join(", ")}, hint, exit`,
						"",
					];
					setOutput((prev) => [...prev, ...errorMessage]);
					return;
				}

				const gameState = createGameState();
				const result = executePipedCommand(
					trimmedCommand,
					gameState,
					commandRegistry,
				);

				const firstCommand = pipeCommands[0] || "";
				const outputString = result.output ? result.output.join(" ") : "";

				if (result.error) {
					const errorOutput = result.output || [
						"Error executing piped command",
					];
					setOutput((prev) => [...prev, ...errorOutput, ""]);
					return;
				}

				const expandedOutput = result.output
					? result.output.flatMap((line) =>
							typeof line === "string" ? line.split("\n") : [line],
						)
					: [];
				const newLines = [...expandedOutput, ""];

				setOutput((prev) => [...prev, ...newLines]);

				if (firstCommand) {
					setTimeout(() => {
						checkObjectiveCompletion(
							firstCommand,
							trimmedCommand,
							outputString,
						);
					}, 100);
				}

				return;
			}

			if (!cmd) {
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
			streamingCommand,
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
		<Box flexDirection="column" height="100vh" padding={1}>
			<Box flexDirection="row" height="85%" marginBottom={1}>
				<Box flexDirection="column" width="35%" height="100%" marginRight={1}>
					<Box
						flexDirection="column"
						borderStyle="single"
						borderColor="cyan"
						padding={1}
						height="60%"
						overflow="hidden"
					>
						<Box marginBottom={1}>
							<Text color="cyan" bold>
								{mission.title.toUpperCase()}
							</Text>
							<Box marginLeft={2}>
								<Text color="white">
									{getDifficultyStars(mission.difficulty)} ({mission.difficulty}
									/5)
								</Text>
							</Box>
						</Box>
						{mission.briefing && (
							<Box
								flexDirection="column"
								marginBottom={1}
								flexGrow={1}
								overflow="hidden"
							>
								<Text color="yellow" bold>
									Mission Brief:
								</Text>
								<Box flexDirection="column" marginBottom={1}>
									{mission.briefing.story.map((line, index) => (
										<Text
											key={`story-${line.slice(0, 20)}-${index}`}
											color="white"
										>
											{line}
										</Text>
									))}
								</Box>
								<Box marginBottom={1}>
									<Text color="cyan" bold>
										Task:{" "}
									</Text>
									<Text color="white">{mission.briefing.task}</Text>
								</Box>
								<Box marginBottom={1}>
									<Text color="green" bold>
										Commands:{" "}
									</Text>
									<Text color="white">
										{mission.allowedCommands.join(", ")}
									</Text>
								</Box>
								{mission.briefing.instructions.length > 0 && (
									<Box flexDirection="column">
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
						height="40%"
					>
						<Box marginBottom={1} flexShrink={0}>
							<Text color="green" bold>
								Mission Objectives
							</Text>
						</Box>
						<Box flexDirection="column" flexGrow={1} overflow="hidden">
							{objectives.map((obj, i) => (
								<Box key={obj.id} paddingBottom={1} flexShrink={0}>
									<Text
										color={obj.completed ? "green" : "white"}
										strikethrough={obj.completed}
										wrap="wrap"
									>
										[{obj.completed ? "✓" : " "}] {i + 1}. {obj.description}
									</Text>
								</Box>
							))}
						</Box>
					</Box>
				</Box>

				<Box
					flexDirection="column"
					width="65%"
					height="100%"
					borderStyle="single"
					borderColor="white"
					padding={1}
					overflow="hidden"
				>
					<Box marginBottom={1} flexShrink={0}>
						<Text color="white" bold>
							Output
						</Text>
					</Box>

					<Box flexDirection="column" flexGrow={1} overflow="hidden">
						{output.slice(-maxOutputLines).map((line, index) => {
							const { color, bold, strikethrough } = getLineStyle(line);
							return (
								<Box
									key={`output-line-${output.length - maxOutputLines + index}`}
									flexShrink={0}
									height={1}
								>
									<Text color={color} bold={bold} strikethrough={strikethrough}>
										{line || " "}
									</Text>
								</Box>
							);
						})}

						{streamingContent && isStreaming && (
							<TerminalStream
								key={streamingContent.join("-")}
								lines={streamingContent}
								speed={1}
								onComplete={handleStreamComplete}
							/>
						)}
					</Box>

					<Box flexShrink={0} marginTop={1}>
						<Text color="white" dimColor>
							Tip: Type "skip" to instantly display output
						</Text>
					</Box>
				</Box>
			</Box>

			<Box height="15%" width="100%" flexShrink={0}>
				<Terminal
					onCommand={handleCommand}
					availableCommands={useMemo(
						() => [...mission.allowedCommands, "hint", "exit", "skip"],
						[mission.allowedCommands],
					)}
					getCompletions={handleCompletions}
				/>
			</Box>
		</Box>
	);
};
