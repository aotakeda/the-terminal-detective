#!/usr/bin/env bun
import { render } from "ink";
import { GameScreen } from "./src/components/GameScreen";

const app = render(<GameScreen />);

process.on("SIGINT", () => {
	app.unmount();
	process.exit(0);
});
