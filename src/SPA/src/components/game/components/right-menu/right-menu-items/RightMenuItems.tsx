﻿import * as React from 'react';
import {useEffect, useState} from 'react';
import './right-menu-items.scss';
import {Tooltip} from 'azure-devops-ui/TooltipEx';
import {WorkItemType} from '../../../../../types/work-items/work-item-type';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {IListWorkItem} from '../../../../../types/work-items/list-work-item';
import {actionCreators as currentRoundActionsCreators} from '../../../../../store/CurrentRound';
import {bindActionCreators} from 'redux';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import {GameStatus} from '../../../../../types/game-status';
import {sendSignalREvent, subscribeToClientEvents} from '../../../../../services/signalr';
import {RoundStoryPointsSetEvent} from '../../../../../types/client-events/round-story-points-set-event';
import {ClientEventType} from '../../../../../types/client-events/signalREvent';
import {IWorkItemSelectedEvent} from '../../../../../types/client-events/work-item-selecte';
import {bookIcon, bugIcon, eyeIcon} from '../../../../../helpers/svgIcons';
import {actionCreators as gameInfoActionCreators} from '../../../../../store/GameInfoCards';
import configureStore from '../../../../../store/Store';
import {IShouldRefreshGame} from '../../../../../types/client-events/should-refresh-game';

interface IProps {
	isAdmin: boolean;
	isExpanded: boolean;
	workItems: IListWorkItem[];
}

interface State {
	workItems: IListWorkItem[];
}

const RightMenuItems = (props: IProps): JSX.Element => {
	const [state, setState] = useState<State>({
		workItems: props.workItems
	});

	const dispatch = useDispatch();
	const {setCommitment, setPlayedRoundsCount} = bindActionCreators(gameInfoActionCreators, dispatch);
	const {setActiveWorkItem, setActiveWorkItemId, setActiveWorkItemStoryPoints} = bindActionCreators(
		currentRoundActionsCreators,
		dispatch
	);

	const {activeWorkItemId} = useSelector((state: AppState) => state.currentRound);
	const {gameDetails, shouldRefreshGame} = useSelector((state: AppState) => state.currentGame);

	useEffect(() => {
		if (!gameDetails?.id) {
			return;
		}
		subscribeToClientEvents<RoundStoryPointsSetEvent>(event => {
			setState(prevState => {
				const gameInfoCards = configureStore.getState().gameInfoCards;

				const workItem = prevState.workItems.find(item => item.id === event.workItemId)!;
				if (workItem.points === undefined || workItem.points === null) {
					setPlayedRoundsCount(gameInfoCards.playedRoundsCount + 1);
				}
				setCommitment(gameInfoCards.commitment + event.submittedStoryPoints - (workItem.points ?? 0));
				workItem.points = event.submittedStoryPoints;
				return {...prevState, workItems: [...prevState.workItems]};
			});
		}, ClientEventType.RoundStoryPointsSet);

		if (!gameDetails.isOwner) {
			subscribeToClientEvents<IWorkItemSelectedEvent>(event => {
				setState(prevState => {
					const index = prevState.workItems.findIndex(x => x.id === event.workItemId)!;
					if (index == -1) {
						sendSignalREvent({
							type: ClientEventType.ShouldRefreshGame,
							payload: {
								gameId: gameDetails?.id!
							} as IShouldRefreshGame
						});
						return prevState;
					}
					prevState.workItems.forEach(x => (x.isSelected = false));
					prevState.workItems[index].isSelected = true;
					setActiveWorkItemId(event.workItemId);

					return {
						...prevState,
						workItems: [...prevState.workItems]
					};
				});
			}, ClientEventType.WorkItemSelected);
		}
	}, [gameDetails?.id]);

	useEffect(() => {
		setState(prevState => {
			if (!props.workItems || !props.workItems.length) {
				return prevState;
			}

			if (gameDetails?.activeWorkItemId && !gameDetails?.isOwner) {
				const workItem = props.workItems.find(item => item.id === gameDetails.activeWorkItemId);
				if (workItem) {
					workItem.isSelected = true;
				}
			}

			if (activeWorkItemId) {
				const workItem = props.workItems.find(item => item.id === activeWorkItemId)!;
				workItem.isActive = true;
			}

			return {
				...prevState,
				workItems: [...props.workItems]
			};
		});
	}, [props.workItems]);

	useEffect(() => {
		if (!activeWorkItemId) {
			return;
		}

		const workItem = state.workItems.find(x => x.id === activeWorkItemId)!;
		if (!workItem) {
			return;
		}

		if (props.isAdmin && !shouldRefreshGame) {
			sendSignalREvent({
				type: ClientEventType.WorkItemSelected,
				payload: {
					workItemId: workItem.id,
					gameId: gameDetails!.id
				} as IWorkItemSelectedEvent
			});
		}

		setActiveWorkItem({
			id: workItem.id,
			points: workItem.points,
			title: workItem.title,
			url: workItem.url,
			type: workItem.type,
			tags: undefined,
			description: undefined
		});

		state.workItems.forEach(workItem => (workItem.isActive = false));
		workItem.isActive = true;

		setActiveWorkItemStoryPoints(workItem.points ? Math.round(workItem.points * 100) / 100 : workItem.points);

		setState(prevState => ({...prevState, workItems: [...state.workItems]}));
	}, [activeWorkItemId]);

	async function onItemClick(item: IListWorkItem) {
		const clickedItem = state.workItems.find(x => x.id === item.id)!;
		if (clickedItem.isActive) {
			return;
		}

		setActiveWorkItemId(item.id);
	}

	return (
		<div className={props.isAdmin && props.isExpanded ? 'right-menu-items-wrapper' : 'right-menu-items-wrapper full'}>
			<div className="header">
				<div className="row noSelect">
					<div className="col1">#</div>
					<div className="col2">Title</div>
					<div className="col3">Points</div>
				</div>
			</div>
			<PerfectScrollbar className={`body ${gameDetails?.status === GameStatus.Paused ? 'paused' : ''}`}>
				{state.workItems.map((item, index) => (
					<div key={index} className={item.isActive ? 'active row' : 'row'} onClick={() => onItemClick(item)}>
						<div className="col1">{index + 1}</div>
						<div className="col2 truncate">
							{item.type == WorkItemType.UserStory ? bookIcon : bugIcon}
							<Tooltip delayMs={500} text={item.title} overflowOnly={true}>
								<span>{item.title}</span>
							</Tooltip>
							{item.isSelected && eyeIcon}
						</div>
						<div className="col3">{item.points ?? '-'}</div>
					</div>
				))}
			</PerfectScrollbar>
		</div>
	);
};

export default RightMenuItems;
