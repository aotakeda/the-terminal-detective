import { useCallback, useEffect, useState } from "react";
import { MISSIONS } from "../data/missions";
import { loadProgress, saveProgress } from "../utils/progress";

export const useGameProgress = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [completedMissions, setCompletedMissions] = useState<string[]>([]);
	const [unlockedMissions, setUnlockedMissions] = useState<string[]>([]);

	useEffect(() => {
		const progress = loadProgress();
		const completedMissions = progress.completedMissions || [];

		const unlockedList = ["mission_01"];
		completedMissions.forEach((completedId) => {
			const missionIndex = MISSIONS.findIndex((m) => m.id === completedId);
			const nextMission = MISSIONS[missionIndex + 1];
			if (nextMission) {
				unlockedList.push(nextMission.id);
			}
		});

		setCompletedMissions(completedMissions);
		setUnlockedMissions(unlockedList);
		setIsLoading(false);
	}, []);

	const updateMissionProgress = useCallback(
		(missionId: string, shouldProceed: boolean, currentMissionId?: string) => {
			const newCompletedMissions = [...completedMissions, missionId];
			setCompletedMissions(newCompletedMissions);

			const missionIndex = MISSIONS.findIndex((m) => m.id === missionId);
			const nextMission = MISSIONS[missionIndex + 1];

			if (nextMission) {
				setUnlockedMissions((prev) => [...prev, nextMission.id]);
			}

			saveProgress({
				completedMissions: newCompletedMissions,
				currentMission:
					shouldProceed && nextMission ? nextMission.id : currentMissionId,
				lastPlayed: new Date().toISOString(),
			});

			return nextMission;
		},
		[completedMissions],
	);

	const proceedToNext = useCallback(
		(missionId: string) => {
			const missionIndex = MISSIONS.findIndex((m) => m.id === missionId);
			const nextMission = MISSIONS[missionIndex + 1];

			saveProgress({
				completedMissions,
				currentMission: nextMission ? nextMission.id : undefined,
				lastPlayed: new Date().toISOString(),
			});

			return nextMission;
		},
		[completedMissions],
	);

	return {
		completedMissions,
		unlockedMissions,
		isLoading,
		updateMissionProgress,
		proceedToNext,
	};
};
