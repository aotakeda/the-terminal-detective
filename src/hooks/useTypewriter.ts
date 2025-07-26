import { useCallback, useEffect, useRef, useState } from "react";

interface TypewriterOptions {
	speed?: number;
	delay?: number;
	onComplete?: () => void;
}

export interface TypewriterLine {
	text: string;
	color?: string;
	bold?: boolean;
}

export const useTypewriter = (
	lines: TypewriterLine[],
	options: TypewriterOptions = {},
) => {
	const { speed = 30, delay = 0, onComplete } = options;
	const [displayedLines, setDisplayedLines] = useState<TypewriterLine[]>([]);
	const [isComplete, setIsComplete] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const currentLineIndexRef = useRef(0);
	const currentCharIndexRef = useRef(0);
	const linesRef = useRef(lines);
	const displayedLinesRef = useRef<TypewriterLine[]>([]);

	useEffect(() => {
		linesRef.current = lines;
	}, [lines]);

	const speedRef = useRef(speed);
	const delayRef = useRef(delay);
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		speedRef.current = speed;
		delayRef.current = delay;
		onCompleteRef.current = onComplete;
	}, [speed, delay, onComplete]);

	const typeNextCharacter = useCallback(() => {
		const currentLines = linesRef.current;
		const currentLineIndex = currentLineIndexRef.current;
		const currentCharIndex = currentCharIndexRef.current;

		if (currentLineIndex >= currentLines.length) {
			setIsComplete(true);
			onCompleteRef.current?.();
			return;
		}

		const currentLine = currentLines[currentLineIndex];
		if (!currentLine) {
			return;
		}

		const isLineComplete = currentCharIndex >= currentLine.text.length;

		if (isLineComplete) {
			currentLineIndexRef.current++;
			currentCharIndexRef.current = 0;

			timeoutRef.current = setTimeout(typeNextCharacter, 100);
		} else {
			const newDisplayedLines = [...displayedLinesRef.current];

			if (newDisplayedLines.length <= currentLineIndex) {
				newDisplayedLines.push({
					text: currentLine.text.substring(0, currentCharIndex + 1),
					color: currentLine.color,
					bold: currentLine.bold,
				});
			} else {
				newDisplayedLines[currentLineIndex] = {
					text: currentLine.text.substring(0, currentCharIndex + 1),
					color: currentLine.color,
					bold: currentLine.bold,
				};
			}

			displayedLinesRef.current = newDisplayedLines;
			currentCharIndexRef.current++;

			setDisplayedLines([...newDisplayedLines]);

			const charDelay = Math.max(10, 1000 / speedRef.current);
			timeoutRef.current = setTimeout(typeNextCharacter, charDelay);
		}
	}, []);

	useEffect(() => {
		setDisplayedLines([]);
		setIsComplete(false);
		currentLineIndexRef.current = 0;
		currentCharIndexRef.current = 0;
		displayedLinesRef.current = [];

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		if (lines.length === 0) {
			setIsComplete(true);
			return;
		}

		timeoutRef.current = setTimeout(typeNextCharacter, delayRef.current);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [lines, typeNextCharacter]);

	return {
		displayedLines,
		isComplete,
	};
};
