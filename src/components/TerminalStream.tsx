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
}) => {
	const [displayedLines, setDisplayedLines] = useState<string[]>([]);
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

		if (lines.length === 0) {
			onCompleteRef.current?.();
			return;
		}

		let currentLineIndex = 0;
		const delay = 600;

		const showNextLine = () => {
			if (currentLineIndex >= lines.length) {
				onCompleteRef.current?.();
				return;
			}

			const currentLine = lines[currentLineIndex];
			setDisplayedLines((prev) => [...prev, currentLine || ""]);
			currentLineIndex++;

			if (currentLineIndex < lines.length) {
				timeoutRef.current = setTimeout(showNextLine, delay);
			} else {
				onCompleteRef.current?.();
			}
		};

		timeoutRef.current = setTimeout(showNextLine, 50);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [lines]);

	return (
		<Box marginBottom={1} flexDirection="column">
			{displayedLines.map((line, index) => (
				<Text
					key={`line-${index}-${line?.slice(0, 10) || "empty"}`}
					color="white"
				>
					{line || " "}
				</Text>
			))}
		</Box>
	);
};
