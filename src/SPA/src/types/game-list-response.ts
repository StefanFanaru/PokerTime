import { GameStatus } from './game-status';

export interface IGameListResponse {
	active: IGameListResponseItem[];
	ended: IGameListResponseItem[];
}

export interface IGameListResponseItem {
	id: string;
	iterationId: string;
	iterationName: string;
	teamId: string;
	teamName: string;
	gameTitle: string;
	isOwner: boolean;
	createdAt: Date;
	endedAt?: Date;
	status: GameStatus;
	velocity?: number;
}
