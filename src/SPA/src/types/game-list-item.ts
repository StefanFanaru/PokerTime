import { GameStatus } from './game-status';
import { IMenuItem } from 'azure-devops-ui/Menu';

export interface IGameListItem {
	id: string;
	gameTitle: string;
	isOwner: boolean;
	createdAt: Date;
	endedAt?: Date;
	status: GameStatus;
	team: { id: string; name: string };
	iteration: { id: string; name: string };
	workItemsCount?: number;
	pendingWorkItemsCount?: number;
	menuItems: IMenuItem[];
	velocity?: number;
}
