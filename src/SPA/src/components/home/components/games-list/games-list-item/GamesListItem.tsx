import * as React from 'react';
import { useState } from 'react';
import './games-list-item.scss';
import { IMenuItem, MenuButton } from 'azure-devops-ui/Menu';
import { Icon } from 'azure-devops-ui/Icon';
import { Tooltip } from 'azure-devops-ui/TooltipEx';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';
import { Ago } from 'azure-devops-ui/Ago';
import { AgoFormat } from 'azure-devops-ui/Utilities/Date';
import { IGameListItem } from '../../../../../types/game-list-item';
import { useHistory } from 'react-router-dom';
import { GameStatus } from '../../../../../types/game-status';
import { Dialog } from 'azure-devops-ui/Dialog';
import { MenuItemType } from '../helpers';
import ShareGameDialog from '../../../../dialogs/share-game/ShareGameDialog';
import EndGameDialog from '../../../../dialogs/end-game/EndGameDialog';

interface Props {
	game: IGameListItem;
	onGameMenuActivate: (menuItem: IMenuItem, id: string) => void;
}

interface State {
	isShareDialogOpen: boolean;
	isDeleteDialogOpen: boolean;
	isEndDialogOpen: boolean;
}

const GamesListItem = (props: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		isShareDialogOpen: false,
		isDeleteDialogOpen: false,
		isEndDialogOpen: false
	});
	const history = useHistory();

	function onDialogDismiss(isShareDialog: boolean, isEndGameDialog: boolean = false) {
		if (isShareDialog) {
			setState(prevState => ({ ...prevState, isShareDialogOpen: false }));
			return;
		}

		if (isEndGameDialog) {
			setState(prevState => ({ ...prevState, isEndDialogOpen: false }));
			return;
		}

		setState(prevState => ({ ...prevState, isDeleteDialogOpen: false }));
	}

	function onMenuItemActivate(menuItem: IMenuItem) {
		if (menuItem.id === MenuItemType.Share) {
			setState(prevState => ({ ...prevState, isShareDialogOpen: true }));
			return;
		}

		if (menuItem.id === MenuItemType.Open) {
			history.push(`/game/${props.game.id}`);
			return;
		}

		if (menuItem.id === MenuItemType.Delete) {
			setState(prevState => ({ ...prevState, isDeleteDialogOpen: true }));
			return;
		}

		if (menuItem.id === MenuItemType.End) {
			setState(prevState => ({ ...prevState, isEndDialogOpen: true }));
			return;
		}

		props.onGameMenuActivate(menuItem, props.game.id);
	}

	function onGameDelete() {
		setState(prevState => ({ ...prevState, isDeleteDialogOpen: false }));
		props.onGameMenuActivate({ id: 'delete' }, props.game.id);
	}

	function onGameEnd() {
		setState(prevState => ({ ...prevState, isEndDialogOpen: false }));
		props.onGameMenuActivate({ id: 'end' }, props.game.id);
	}

	return (
		<div className={'games-list-item-wrapper ' + (props.game.status === GameStatus.Active ? 'active' : '')}>
			<div className="top">
				<div className="game-title truncate" onClick={() => history.replace(`/game/${props.game.id}`)}>
					{props.game.gameTitle}
				</div>
				<MenuButton
					hideDropdownIcon={true}
					subtle={true}
					iconProps={{
						iconName: 'MoreVertical'
					}}
					contextualMenuProps={{
						menuProps: {
							id: 'actions',
							items: props.game.menuItems,
							onActivate: onMenuItemActivate
						}
					}}
				/>
			</div>
			<div className="middle">
				<div>
					<Icon ariaLabel="Video icon" iconName="Sprint" tooltipProps={{ text: 'Iteration' }}/>
					<span className="truncate">{props.game.iteration.name}</span>
				</div>
				<div>
					<Icon ariaLabel="Video icon" iconName="People" tooltipProps={{ text: 'Team' }}/>
					<span className="truncate">{props.game.team.name}</span>
				</div>
			</div>
			<div className="bottom">
				{props.game.status != GameStatus.Ended && (
					<div className="counts">
						<Tooltip delayMs={500} text={`${props.game.workItemsCount} included work items`}>
							<div>
								<Icon ariaLabel="Video icon" iconName="WorkItem"/>
								<span>{props.game.workItemsCount ?? <Spinner size={SpinnerSize.xSmall}/>}</span>
							</div>
						</Tooltip>
						<Tooltip delayMs={500} text={`${props.game.pendingWorkItemsCount} items left to play`}>
							<div>
								<Icon ariaLabel="Video icon" iconName="Clock"/>
								<span>{props.game.pendingWorkItemsCount ?? <Spinner size={SpinnerSize.xSmall}/>}</span>
							</div>
						</Tooltip>
					</div>
				)}
				<div className="created">
					<Ago date={props.game.endedAt ?? props.game.createdAt} format={AgoFormat.Compact}/>
				</div>
			</div>
			{state.isShareDialogOpen && <ShareGameDialog gameId={props.game.id} onDismiss={() => onDialogDismiss(true)}/>}
			{state.isDeleteDialogOpen && (
				<Dialog
					titleProps={{ text: 'Delete game' }}
					footerButtonProps={[
						{
							text: 'Cancel',
							onClick: () => onDialogDismiss(false)
						},
						{
							text: 'Delete',
							danger: true,
							onClick: onGameDelete
						}
					]}
					onDismiss={() => onDialogDismiss(false)}>
					<div className="delete-game-wrapper">
						<div>Are you sure you want to delete this game? You will not be able to recover it or it's data.</div>
						<br/>
						<span>
							Game title: <i>{props.game.gameTitle}</i>
						</span>
					</div>
				</Dialog>
			)}
			{state.isEndDialogOpen && (
				<EndGameDialog
					gameTitle={props.game.gameTitle}
					gameId={props.game.id}
					onDismiss={() => onDialogDismiss(false, true)}
					onSubmit={onGameEnd}
				/>
			)}
		</div>
	);
};

export default GamesListItem;
