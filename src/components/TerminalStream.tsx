import { Box, Text } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TerminalStreamProps {
	lines: string[];
	colors?: string[];
	bolds?: boolean[];
	speed?: number;
	onComplete?: () => void;
}

export const TerminalStream: React.FC<TerminalStreamProps> = ({
	lines,
	onComplete,
	speed = 30,
}) => {
	const [displayedLines, setDisplayedLines] = useState<string[]>([]);
	const [currentLineText, setCurrentLineText] = useState<string>("");
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setDisplayedLines([]);
		setCurrentLineText("");

		if (lines.length === 0) {
			onCompleteRef.current?.();
			return;
		}

		let currentLineIndex = 0;
		let currentCharIndex = 0;

		const typeNextChar = () => {
			if (currentLineIndex >= lines.length) {
				onCompleteRef.current?.();
				return;
			}

			const currentLine = lines[currentLineIndex] || "";

			if (currentCharIndex < currentLine.length) {
				setCurrentLineText(currentLine.slice(0, currentCharIndex + 1));
				currentCharIndex++;
				timeoutRef.current = setTimeout(typeNextChar, speed);
			} else {
				setDisplayedLines((prev) => [...prev, currentLine]);
				setCurrentLineText("");
				currentLineIndex++;
				currentCharIndex = 0;

				if (currentLineIndex < lines.length) {
					timeoutRef.current = setTimeout(typeNextChar, 1);
				} else {
					onCompleteRef.current?.();
				}
			}
		};

		timeoutRef.current = setTimeout(typeNextChar, 1);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [lines, speed]);

	return (
		<Box flexDirection="column">
			{displayedLines.map((line, index) => (
				<Box key={`line-${index}-${line?.slice(0, 10) || "empty"}`} height={1}>
					<Text color="white">{line || " "}</Text>
				</Box>
			))}
			{currentLineText && (
				<Box height={1}>
					<Text color="white">{currentLineText}</Text>
				</Box>
			)}
		</Box>
	);
};
