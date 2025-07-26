import { Box, Text } from "ink";
import type React from "react";
import type { TypewriterLine } from "../hooks/useTypewriter";
import { useTypewriter } from "../hooks/useTypewriter";

interface TypewriterTextProps {
	lines: string[];
	speed?: number;
	delay?: number;
	onComplete?: () => void;
}

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

export const TypewriterText: React.FC<TypewriterTextProps> = ({
	lines,
	speed = 30,
	delay = 0,
	onComplete,
}) => {
	const expandedLines = lines.flatMap((line) =>
		line.split("\n").map((splitLine) => splitLine),
	);

	const typedLines: TypewriterLine[] = expandedLines.map((line) => ({
		text: line,
		...getLineStyle(line),
	}));

	const { displayedLines } = useTypewriter(typedLines, {
		speed,
		delay,
		onComplete,
	});

	return (
		<>
			{displayedLines.map((line, index) => (
				<Box
					// biome-ignore lint/suspicious/noArrayIndexKey: Display array is append-only, index is stable
					key={`typewriter-${index}`}
					marginBottom={1}
				>
					<Text color={line.color} bold={line.bold}>
						{line.text}
					</Text>
				</Box>
			))}
		</>
	);
};
