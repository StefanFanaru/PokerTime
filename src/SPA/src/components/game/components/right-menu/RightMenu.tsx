import * as React from 'react';
import {useEffect, useState} from 'react';
import './right-menu.scss';
import {Tooltip} from 'azure-devops-ui/TooltipEx';
import RightMenuItems from './right-menu-items/RightMenuItems';
import RightMenuAdminButton from './right-menu-admin-button/RightMenuAdminButton';
import GamePointsCard from './game-points-card/GamePointsCard';
import {isMobile} from '../../../../helpers/helpers';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../../../store';
import {IListWorkItem} from '../../../../types/work-items/list-work-item';
import {bindActionCreators} from 'redux';
import {actionCreators as currentRoundActionsCreators} from '../../../../store/CurrentRound';
import {actionCreators as gameInfoCardsActionCreators} from '../../../../store/GameInfoCards';
import RightMenuTopButtons from './right-menu-top-buttons/RightMenuTopButtons';
import useAxios from 'axios-hooks';
import {GameStatus} from '../../../../types/game-status';
import {IFlippedCard} from '../../../../types/flipped-card';
import * as SDK from 'azure-devops-extension-sdk';
import {IWorkItemFormNavigationService, WorkItemTrackingServiceIds} from 'azure-devops-extension-api/WorkItemTracking';
import {Spinner, SpinnerSize} from 'azure-devops-ui/Spinner';
import {sendSignalREvent} from '../../../../services/signalr';
import {ClientEventType} from '../../../../types/client-events/signalREvent';
import {IShouldRefreshGame} from '../../../../types/client-events/should-refresh-game';

interface IState {
	isAdmin: boolean;
	isExpanded: boolean;
	isPreviousDisabled?: boolean;
	isNextDisabled?: boolean;
	isEditDisabled?: boolean;
	isPaused?: boolean;
	isFlipDisabled?: boolean;
	areCardsFlipped?: boolean;
}

interface IProps {
	workItems: IListWorkItem[];
}

const RightMenu = (props: IProps): JSX.Element => {
	const [state, setState] = useState<IState>({
		isAdmin: false,
		isExpanded: !isMobile(),
		isPreviousDisabled: true
	});
	const dispatch = useDispatch();
	const {setActiveWorkItemId, setFlippedCards, setCardsWereFlipped} = bindActionCreators(currentRoundActionsCreators, dispatch);
	const {increasePlayedRoundsCount} = bindActionCreators(gameInfoCardsActionCreators, dispatch);

	const {gameDetails, shouldRefreshGame} = useSelector((state: AppState) => state.currentGame);
	const {isViewingImage} = useSelector((state: AppState) => state.general);
	const {roundId, cardsWereFlipped, currentHiddenCardsCount, activeWorkItemStoryPoints, activeWorkItemId} = useSelector(
		(state: AppState) => state.currentRound
	);
	const [{}, postGamePauseToggle] = useAxios(
		{
			method: 'POST',
			url: '/api/game/pause-toggle'
		},
		{manual: true}
	);
	const [{response: flipCardsResponse}, flipCardsRequest] = useAxios<IFlippedCard[]>(
		{
			method: 'POST',
			url: '/api/game/flip-cards'
		},
		{manual: true}
	);

	useEffect(() => {
		if (activeWorkItemStoryPoints === undefined) {
			return;
		}

		const workItem = props.workItems.find(x => x.id === activeWorkItemId)!;
		if (!workItem) {
			return;
		}

		workItem.points = activeWorkItemStoryPoints;
		setState(prevState => ({...prevState, workItems: [...props.workItems]}));
	}, [activeWorkItemStoryPoints]);

	useEffect(() => {
		if (!flipCardsResponse) {
			return;
		}
		setState(prevState => ({...prevState, areCardsFlipped: true}));
		setFlippedCards(flipCardsResponse.data);
		setCardsWereFlipped(true);
		increasePlayedRoundsCount();
	}, [flipCardsResponse]);

	useEffect(() => {
		setState(prevState => ({...prevState, areCardsFlipped: cardsWereFlipped}));
	}, [cardsWereFlipped]);

	useEffect(() => {
		const workItemIndex = props.workItems.findIndex(x => x.id === activeWorkItemId);

		if (gameDetails?.status === GameStatus.Ended) {
			setState(prevState => ({
				...prevState,
				isPaused: false,
				isPreviousDisabled: workItemIndex === 0,
				isNextDisabled: workItemIndex === props.workItems.length - 1,
				isEditDisabled: false,
				isFlipDisabled: true
			}));
			return;
		}

		const isPaused = gameDetails?.status === GameStatus.Paused;
		setState(prevState => ({
			...prevState,
			isPaused: isPaused,
			isPreviousDisabled: workItemIndex === 0 || isPaused,
			isNextDisabled: workItemIndex === props.workItems.length - 1 || isPaused,
			isFlipDisabled: isPaused
		}));
		return;
	}, [gameDetails?.status]);

	function onExpandToggle() {
		setState(prevState => ({...prevState, isExpanded: !prevState.isExpanded}));
	}

	useEffect(() => {
		setTimeout(function () {
			const element = document.getElementById('right-menu-retractable');
			if (element) {
				element.style.animationDuration = '0.2s';
			}
		}, 500);
	}, []);

	useEffect(() => {
		if (gameDetails) {
			setState(prevState => ({...prevState, isAdmin: gameDetails.isOwner}));
		}
	}, [gameDetails]);

	useEffect(() => {
		if (activeWorkItemId) {
			const index = props.workItems.findIndex(x => x.id === activeWorkItemId);
			setState(prevState => ({
				...prevState,
				isPreviousDisabled: index === 0 || prevState.isPaused,
				isNextDisabled: index === props.workItems.length - 1 || prevState.isPaused
			}));
		}
	}, [activeWorkItemId]);

	window.onresize = () => {
		if (isViewingImage) {
			return;
		}

		if (isMobile()) {
			return;
		}

		if (window.innerWidth > 1200 && !state.isExpanded) {
			setState(prevState => ({...prevState, isExpanded: true}));
		}

		if (window.innerWidth < 1200 && state.isExpanded) {
			setState(prevState => ({...prevState, isExpanded: false}));
		}
	};

	function onPreviousClick() {
		const workItemsReversed = [...props.workItems].reverse();
		const currentIndex = workItemsReversed.findIndex(x => x.id === activeWorkItemId);
		const previousIndex = workItemsReversed.findIndex(
			(x, i) => x.id !== activeWorkItemId && x.points === undefined && i > currentIndex
		);
		if (previousIndex === -1) {
			const previousIndex = props.workItems.findIndex(x => x.id === activeWorkItemId) - 1;
			setActiveWorkItemId(props.workItems[previousIndex].id);
		} else {
			setActiveWorkItemId(workItemsReversed[previousIndex].id);
		}
		setState(prevState => ({
			...prevState,
			isPreviousDisabled: previousIndex === 0,
			isNextDisabled: false,
			isEditDisabled: false
		}));
	}

	function onNextClick() {
		const currentIndex = props.workItems.findIndex(x => x.id === activeWorkItemId);
		let nextIndex = props.workItems.findIndex((x, i) => x.id !== activeWorkItemId && x.points === undefined && i > currentIndex);

		if (nextIndex === -1) {
			nextIndex = props.workItems.findIndex(x => x.id === activeWorkItemId) + 1;
		}
		setActiveWorkItemId(props.workItems[nextIndex].id);
		const shouldDisable = nextIndex === props.workItems.length - 1;
		setState(prevState => ({
			...prevState,
			isPreviousDisabled: false,
			isNextDisabled: shouldDisable
		}));
	}

	function onPauseToggle() {
		postGamePauseToggle({
			data: {
				isPaused: !state.isPaused,
				gameId: gameDetails?.id
			}
		});
	}

	function onFlipClick() {
		flipCardsRequest({
			data: {
				roundId: roundId!,
				gameId: gameDetails?.id
			}
		});
	}

	async function onEditClick() {
		setState(prevState => ({...prevState, isEditDisabled: true}));
		const service = await SDK.getService<IWorkItemFormNavigationService>(
			WorkItemTrackingServiceIds.WorkItemFormNavigationService
		);

		await service.openWorkItem(props.workItems.find(x => x.id === activeWorkItemId)!.id, false).then(() => {
			setState(prevState => ({...prevState, isEditDisabled: false}));
			setTimeout(() => {
				sendSignalREvent({
					type: ClientEventType.ShouldRefreshGame,
					payload: {
						gameId: gameDetails?.id!
					} as IShouldRefreshGame
				});
			}, 500);
		});
	}

	return (
		<div id="right-menu-retractable" className={`right-menu-wrapper ${state.isExpanded ? '' : 'retracted'}`}>
			{shouldRefreshGame && <Spinner size={SpinnerSize.medium} className="spinner-items" />}
			<div className="top">
				<div className="title">
					<Tooltip overflowOnly={true} delayMs={500} text={gameDetails?.gameTitle}>
						<span className="truncate">
							{(gameDetails?.status === GameStatus.Ended ? '(Ended) • ' : '') + gameDetails?.gameTitle}
						</span>
					</Tooltip>
				</div>
				<RightMenuTopButtons isExpanded={state.isExpanded} onExpandToggle={onExpandToggle} />
			</div>
			<div className="separator"></div>
			<RightMenuItems workItems={props.workItems} isAdmin={state.isAdmin} isExpanded={state.isExpanded} />
			{state.isAdmin && state.isExpanded && (
				<div className="admin-buttons-wrapper">
					<GamePointsCard />
					<div className="admin-buttons">
						<RightMenuAdminButton
							onClick={onPreviousClick}
							text="Previous"
							icon="Previous"
							isDisabled={state.isPreviousDisabled}
						/>
						<RightMenuAdminButton
							onClick={onPauseToggle}
							text={state.isPaused ? 'Resume' : 'Pause'}
							icon={state.isPaused ? 'Play' : 'Pause'}
						/>
						<RightMenuAdminButton onClick={onNextClick} text="Next" icon="Next" isDisabled={state.isNextDisabled} />
						<RightMenuAdminButton
							onClick={onEditClick}
							text="Edit"
							icon="Edit"
							isDisabled={state.isEditDisabled || state.isPaused}
						/>
						<RightMenuAdminButton
							onClick={onFlipClick}
							text="Flip"
							icon="Refresh"
							isDisabled={state.isFlipDisabled || state.areCardsFlipped || !roundId || !currentHiddenCardsCount}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default RightMenu;
