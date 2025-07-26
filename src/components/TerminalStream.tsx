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
	speed = 25,
	onComplete,
}) => {
	const [displayText, setDisplayText] = useState<string>("");
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

		setDisplayText("");

		if (lines.length === 0) {
			onCompleteRef.current?.();
			return;
		}

		const fullText = lines.join("\n");
		let currentIndex = 0;
		const charsPerUpdate = Math.max(1, Math.floor(speed / 10));
		const delay = (1000 / speed) * charsPerUpdate;

		const typeChars = () => {
			if (currentIndex >= fullText.length) {
				onCompleteRef.current?.();
				return;
			}

			const nextIndex = Math.min(
				currentIndex + charsPerUpdate,
				fullText.length,
			);
			setDisplayText(fullText.substring(0, nextIndex));
			currentIndex = nextIndex;

			timeoutRef.current = setTimeout(typeChars, delay);
		};

		timeoutRef.current = setTimeout(typeChars, 50);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [lines, speed]);

	return (
		<Box marginBottom={1}>
			<Text color="white">{displayText}</Text>
		</Box>
	);
};
