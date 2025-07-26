import { Text } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface AnimatedLineProps {
	text: string;
	color?: string;
	bold?: boolean;
	speed?: number;
	onComplete?: () => void;
}

export const AnimatedLine: React.FC<AnimatedLineProps> = ({
	text,
	color = "white",
	bold = false,
	speed = 25,
	onComplete,
}) => {
	const [displayedText, setDisplayedText] = useState("");
	const onCompleteRef = useRef(onComplete);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		if (text.length === 0) {
			setDisplayedText("");
			onCompleteRef.current?.();
			return;
		}

		setDisplayedText("");
		let currentIndex = 0;

		const typeNextChar = () => {
			if (currentIndex >= text.length) {
				onCompleteRef.current?.();
				return;
			}

			currentIndex++;
			setDisplayedText(text.substring(0, currentIndex));

			const delay = Math.max(10, 1000 / speed);
			timeoutRef.current = setTimeout(typeNextChar, delay);
		};

		timeoutRef.current = setTimeout(typeNextChar, 50);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [text, speed]);

	return (
		<Text color={color} bold={bold}>
			{displayedText}
		</Text>
	);
};
