import { GameStatus } from './game-status';

export interface IGameDetails {
	id: string;
	iterationId: string;
	iterationName: string;
	teamId: string;
	teamName: string;
	gameTitle: string;
	isOwner: boolean;
	status: GameStatus;
	projectId: string;
	projectName: string;
	velocity: number;
	playedRoundsCount: number;
	startedAt: Date;
	endedAt: Date | null;
	activeWorkItemId: number;
}
