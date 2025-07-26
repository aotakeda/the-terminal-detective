import { Box, Text } from "ink";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMissionById, MISSIONS } from "../data/missions";
import type { Mission } from "../types/mission";
import { loadProgress, saveProgress } from "../utils/progress";
import { MissionGame } from "./MissionGame";
import { MissionSelect } from "./MissionSelect";

type GameMode = "mission-select" | "mission-play";

const initializeProgress = () => {
	const progress = loadProgress();
	const completedMissions = progress.completedMissions;

	const unlockedList = ["mission_01"];
	completedMissions.forEach((completedId) => {
		const missionIndex = MISSIONS.findIndex((m) => m.id === completedId);
		const nextMission = MISSIONS[missionIndex + 1];
		if (nextMission) {
			unlockedList.push(nextMission.id);
		}
	});

	return { completedMissions, unlockedMissions: unlockedList };
};

export const GameScreen: React.FC = () => {
	const [gameMode, setGameMode] = useState<GameMode>("mission-select");
	const [currentMission, setCurrentMission] = useState<Mission | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [completedMissions, setCompletedMissions] = useState<string[]>([]);
	const [unlockedMissions, setUnlockedMissions] = useState<string[]>([]);

	useEffect(() => {
		const { completedMissions, unlockedMissions } = initializeProgress();
		setCompletedMissions(completedMissions);
		setUnlockedMissions(unlockedMissions);
		setIsLoading(false);
	}, []);

	const availableMissions = useMemo((): Mission[] => {
		return MISSIONS.map((mission) => ({
			...mission,
			unlocked: unlockedMissions.includes(mission.id),
		}));
	}, [unlockedMissions]);

	const handleSelectMission = useCallback(
		(missionId: string) => {
			const mission = getMissionById(missionId);

			if (mission && unlockedMissions.includes(missionId)) {
				setCurrentMission(mission);
				setGameMode("mission-play");
			} else {
				console.log("Mission not found or not unlocked");
			}
		},
		[unlockedMissions],
	);

	const updateMissionProgress = useCallback(
		(missionId: string, shouldProceed: boolean) => {
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
					shouldProceed && nextMission ? nextMission.id : currentMission?.id,
				lastPlayed: new Date().toISOString(),
			});

			if (shouldProceed && nextMission) {
				setCurrentMission(nextMission);
			} else if (shouldProceed) {
				setGameMode("mission-select");
				setCurrentMission(null);
			}
		},
		[completedMissions, currentMission],
	);

	const handleMissionComplete = useCallback(
		(missionId: string) => {
			updateMissionProgress(missionId, true);
		},
		[updateMissionProgress],
	);

	const handleSaveMissionComplete = useCallback(
		(missionId: string) => {
			updateMissionProgress(missionId, false);
		},
		[updateMissionProgress],
	);

	const handleProceedToNext = useCallback(
		(missionId: string) => {
			const missionIndex = MISSIONS.findIndex((m) => m.id === missionId);
			const nextMission = MISSIONS[missionIndex + 1];

			saveProgress({
				completedMissions,
				currentMission: nextMission ? nextMission.id : undefined,
				lastPlayed: new Date().toISOString(),
			});

			if (nextMission) {
				setCurrentMission(nextMission);
			} else {
				setGameMode("mission-select");
				setCurrentMission(null);
			}
		},
		[completedMissions],
	);

	const handleExitMission = useCallback(() => {
		setGameMode("mission-select");
		setCurrentMission(null);
	}, []);

	if (isLoading) {
		return (
			<Box flexDirection="column" height="100%">
				<Box justifyContent="center" alignItems="center">
					<Text>Loading...</Text>
				</Box>
			</Box>
		);
	}

	if (gameMode === "mission-play" && currentMission) {
		return (
			<MissionGame
				mission={currentMission}
				onMissionComplete={handleMissionComplete}
				onSaveMissionComplete={handleSaveMissionComplete}
				onProceedToNext={handleProceedToNext}
				onExitMission={handleExitMission}
			/>
		);
	}

	return (
		<Box flexDirection="column" height="100%">
			<MissionSelect
				missions={availableMissions}
				onSelectMission={handleSelectMission}
				completedMissions={completedMissions}
			/>
		</Box>
	);
};
