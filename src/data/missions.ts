import type { Mission } from "../types/mission";
import { LEVEL1_MISSIONS } from "./missions-level1";

export const MISSIONS: Mission[] = [...LEVEL1_MISSIONS];

export function getMissionById(id: string): Mission | undefined {
	return MISSIONS.find((mission) => mission.id === id);
}

export function getMissionsByDifficulty(difficulty: number): Mission[] {
	return MISSIONS.filter((mission) => mission.difficulty === difficulty);
}

export function getUnlockedMissions(): Mission[] {
	return MISSIONS.filter((mission) => mission.unlocked);
}

export function getCompletedMissions(): Mission[] {
	return MISSIONS.filter((mission) => mission.completed);
}

export { LEVEL1_MISSIONS };
