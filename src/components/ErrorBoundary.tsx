import { Box, Text } from "ink";
import type React from "react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="red"
					padding={1}
					role="alert"
					aria-label="Application error"
				>
					<Text color="red" bold>
						⚠️ Something went wrong
					</Text>
					<Text color="white" marginTop={1}>
						An unexpected error occurred in the Detective Terminal.
					</Text>
					{this.state.error && (
						<Text color="gray" marginTop={1}>
							Error: {this.state.error.message}
						</Text>
					)}
					<Text color="yellow" marginTop={1}>
						Please restart the application.
					</Text>
				</Box>
			);
		}

		return this.props.children;
	}
}
