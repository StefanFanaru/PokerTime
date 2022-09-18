import { IGameListResponseItem } from '../../../../types/game-list-response';
import { IMenuItem } from 'azure-devops-ui/Menu';
import { IGameListItem } from '../../../../types/game-list-item';
import { GameStatus } from '../../../../types/game-status';

export function mapGameResponse(games: IGameListResponseItem[]): IGameListItem[] {
	return games.map(game => ({
		...game,
		team: { id: game.teamId, name: game.teamName },
		iteration: { id: game.iterationId, name: game.iterationName },
		menuItems: getGameMenuItems(game.isOwner, game.status === GameStatus.Ended)
	}));
}

function getGameMenuItems(isOwner: boolean, isEnded: boolean): IMenuItem[] {
	let menuItems: IMenuItem[] = [
		{ id: 'open', text: 'Open' },
		{ id: 'share', text: 'Share' }
	];

	if (isOwner) {
		menuItems.push({ id: 'delete', text: 'Delete' });

		if (!isEnded) {
			menuItems.push({ id: 'edit', text: 'Edit' });
			menuItems.push({ id: 'end', text: 'End' });
		}
	}

	return menuItems;
}

export enum MenuItemType {
	Open = 'open',
	Share = 'share',
	Edit = 'edit',
	End = 'end',
	Delete = 'delete'
}
