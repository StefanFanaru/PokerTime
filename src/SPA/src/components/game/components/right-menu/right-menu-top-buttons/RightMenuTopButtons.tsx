import * as React from 'react';
import { useState } from 'react';
import './right-menu-top-buttons.scss';
import { Button } from 'azure-devops-ui/Button';
import FullScreenService from '../../../../../services/fullScreenService';
import ShareGameDialog from '../../../../dialogs/share-game/ShareGameDialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../../store';
import EndGameDialog from '../../../../dialogs/end-game/EndGameDialog';
import { useHistory } from 'react-router-dom';
import HelpDialog from '../../../../dialogs/help-dialog/HelpDialog';
import { GameStatus } from '../../../../../types/game-status';
import { bindActionCreators } from 'redux';
import { actionCreators as currentGameActionsCreators } from '../../../../../store/CurrentGame';

interface Props {
	isExpanded: boolean;
	onExpandToggle: () => void;
}

interface State {
	isEndDialogOpen?: boolean;
	isHelpDialogOpen?: boolean;
	isShareDialogOpen?: boolean;
	isFullScreen: boolean;
}

const RightMenuTopButtons = (props: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		isFullScreen: FullScreenService.isFullScreen
	});

	const history = useHistory();
	const dispatch = useDispatch();
	const { gameDetails } = useSelector((state: AppState) => state.currentGame);
	const { setShouldRefreshGame } = bindActionCreators(currentGameActionsCreators, dispatch);

	function onFullScreenToggle() {
		FullScreenService.toggle();
		setState(prevState => ({ ...prevState, isFullScreen: FullScreenService.isFullScreen }));
	}

	function onShareDismiss() {
		setState(prevState => ({ ...prevState, isShareDialogOpen: false }));
	}

	function onHelpDismiss() {
		setState(prevState => ({ ...prevState, isHelpDialogOpen: false }));
	}

	function onEndGameDismiss() {
		setState(prevState => ({ ...prevState, isEndDialogOpen: false }));
	}

	function onEndGameSubmit() {
		setState(prevState => ({ ...prevState, isEndDialogOpen: false }));
		history.push('/');
	}

	function showShareDialog() {
		setState(prevState => ({ ...prevState, isShareDialogOpen: true }));
	}

	function onExitGameClick() {
		if (gameDetails?.status === GameStatus.Ended || !gameDetails?.isOwner) {
			history.push('/');
		}
		setState(prevState => ({ ...prevState, isEndDialogOpen: true }));
	}

	function onRefreshWorkItemsClick() {
		setShouldRefreshGame(true);
	}

	return (
		<div className="right-menu-top-buttons-wrapper">
			<Button
				className="expand-button"
				iconProps={{ iconName: props.isExpanded ? 'DoubleChevronRight' : 'DoubleChevronLeft' }}
				subtle={true}
				tooltipProps={{ text: 'Show less information', delayMs: 500 }}
				onClick={props.onExpandToggle}
			/>
			<Button
				className="action-button"
				iconProps={{ iconName: state.isFullScreen ? 'BackToWindow' : 'FullScreen' }}
				subtle={true}
				tooltipProps={{ text: 'Toggle fullscreen mode', delayMs: 500 }}
				onClick={onFullScreenToggle}
			/>
			<Button
				className="action-button"
				iconProps={{ iconName: 'Add' }}
				disabled={gameDetails?.status === GameStatus.Ended}
				subtle={true}
				tooltipProps={{ text: 'Invite user', delayMs: 500 }}
				onClick={showShareDialog}
			/>
			<Button
				className="action-button"
				iconProps={{ iconName: 'Refresh' }}
				disabled={gameDetails?.status === GameStatus.Ended}
				subtle={true}
				tooltipProps={{ text: 'Refresh information', delayMs: 500 }}
				onClick={onRefreshWorkItemsClick}
			/>
			<Button
				className="action-button"
				iconProps={{ iconName: 'ChromeClose', className: 'close-icon' }}
				subtle={true}
				tooltipProps={{ text: 'Exit this game', delayMs: 500 }}
				onClick={onExitGameClick}
			/>
			<div>
				{state.isShareDialogOpen && gameDetails && <ShareGameDialog onDismiss={onShareDismiss} gameId={gameDetails.id}/>}
				{state.isHelpDialogOpen && gameDetails && <HelpDialog onDismiss={onHelpDismiss}/>}
				{state.isEndDialogOpen && gameDetails && (
					<EndGameDialog
						onDismiss={onEndGameDismiss}
						onSubmit={onEndGameSubmit}
						gameId={gameDetails.id}
						gameTitle={gameDetails.gameTitle}
					/>
				)}
			</div>
		</div>
	);
};

export default RightMenuTopButtons;
