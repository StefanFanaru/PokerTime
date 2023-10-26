import * as React from 'react';
import {useEffect, useState} from 'react';
import './game.scss';
import RightMenu from './components/right-menu/RightMenu';
import GameContent from './components/game-content/GameContent';
import {useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from '../../store';
import {IGameDetails} from '../../types/game-details';
import {bindActionCreators} from 'redux';
import {actionCreators as currentGameActionsCreators} from '../../store/CurrentGame';
import {actionCreators as currentRoundActionsCreators} from '../../store/CurrentRound';
import {actionCreators as gameInfoActionCreators} from '../../store/GameInfoCards';
import {getClient} from 'azure-devops-extension-api';
import {WorkRestClient} from 'azure-devops-extension-api/Work';
import {WorkItemErrorPolicy, WorkItemExpand, WorkItemTrackingRestClient} from 'azure-devops-extension-api/WorkItemTracking';
import {IListWorkItem} from '../../types/work-items/list-work-item';
import {IWorkItemDetails} from '../../types/work-items/work-item-details';
import {GameStatus} from '../../types/game-status';
import {IGameRoundInsertResponse} from '../../types/game-round/round-insert-response';
import {startSignalRConnection, subscribeToClientEvents} from '../../services/signalr';
import {ClientEventType} from '../../types/client-events/signalREvent';
import {PauseToggledEvent} from '../../types/client-events/pause-toggled-event';
import {GameEndedEvent} from '../../types/client-events/game-ended';
import GameEndedDialog from '../dialogs/game-ended/GameEndedDialog';
import {IShouldRefreshGame} from '../../types/client-events/should-refresh-game';
import {WorkItemType} from '../../types/work-items/work-item-type';

interface State {
	workItemsDetailed: IWorkItemDetails[];
	workItemLists: IListWorkItem[];
	gameDetails?: IGameDetails;
	isGameEndedDialogOpened?: boolean;
}

const Game = (): JSX.Element => {
	const {id} = useParams<{id: string}>();
	const dispatch = useDispatch();
	const {setGameDetails} = bindActionCreators(currentGameActionsCreators, dispatch);
	const {setActiveWorkItem, setActiveWorkItemId, setRoundId, setActiveWorkItemStoryPoints, setCardsWereFlipped} =
		bindActionCreators(currentRoundActionsCreators, dispatch);
	const {setIsPaused, setGameStatus, setShouldRefreshGame} = bindActionCreators(currentGameActionsCreators, dispatch);
	const {setCommitment, setPlayedRoundsCount, setVelocity, setTotalRoundsCount, setActivePlayersIds} = bindActionCreators(
		gameInfoActionCreators,
		dispatch
	);

	const {details: projectDetails} = useSelector((state: AppState) => state.projectInfo);
	const {activeWorkItem, activeWorkItemStoryPoints} = useSelector((state: AppState) => state.currentRound);
	const {gameDetails, shouldRefreshGame} = useSelector((state: AppState) => state.currentGame);
	const [state, setState] = useState<State>({
		workItemsDetailed: [],
		workItemLists: []
	});

	const [{}, getGameDetails] = useAxios<IGameDetails>(
		{
			url: '/api/game/details'
		},
		{manual: true}
	);

	const [{data: gameRoundInsertResponse, loading: isGameRoundInsertLoading}, postGameRoundInsert] =
		useAxios<IGameRoundInsertResponse>(
			{
				url: '/api/gameRound/insert',
				method: 'POST'
			},
			{manual: true}
		);

	useEffect(() => {
		if (gameRoundInsertResponse) {
			setRoundId(gameRoundInsertResponse.roundId);
			setActivePlayersIds(gameRoundInsertResponse.activePlayersIds);
			if (!gameRoundInsertResponse.cardsWereFlipped) {
				setTimeout(() => setCardsWereFlipped(gameRoundInsertResponse.cardsWereFlipped), 100);
				return;
			}
			setCardsWereFlipped(gameRoundInsertResponse.cardsWereFlipped);
		}
	}, [gameRoundInsertResponse]);

	useEffect(() => {
		if (!shouldRefreshGame) {
			return;
		}

		refreshGame();
	}, [shouldRefreshGame]);

	useEffect(() => {
		setGameDetails(null);
	}, []);

	useEffect(() => {
		if (id) {
			const token = localStorage.getItem('token');
			startSignalRConnection(token!, id);
		}

		if (projectDetails && id && !state.gameDetails) {
			getGameDetails({
				params: {
					projectId: projectDetails?.id,
					gameId: id
				}
			}).then(async response => {
				setState(prevState => ({...prevState, gameDetails: response.data}));
			});
		}
	}, [projectDetails, id]);

	useEffect(() => {
		if (!activeWorkItem) {
			return;
		}

		const workItemDetails = state.workItemsDetailed.find(x => x.id === activeWorkItem.id);
		if (!workItemDetails) {
			return;
		}

		if (!isGameRoundInsertLoading && gameRoundInsertResponse) {
			const currentWorkItemId = gameRoundInsertResponse.workItemId;
			if (currentWorkItemId !== activeWorkItem.id && !shouldRefreshGame) {
				postGameRoundInsert({
					data: {
						gameId: gameDetails?.id,
						workItemId: activeWorkItem.id
					}
				});
			}
		}

		if (activeWorkItem.description) {
			workItemDetails.description = activeWorkItem.description;
		}

		if (activeWorkItem.tags) {
			workItemDetails.tags = activeWorkItem.tags;
		}

		if (workItemDetails.description !== undefined && activeWorkItem.description === undefined) {
			setActiveWorkItem({
				...activeWorkItem,
				description: workItemDetails.description,
				tags: workItemDetails.tags
			});
		}
	}, [activeWorkItem]);

	useEffect(() => {
		setCommitment(state.workItemLists.map(x => x.points).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0);
	}, [activeWorkItemStoryPoints]);

	useEffect(() => {
		if (!state.gameDetails) {
			return;
		}

		setGameDetails(state.gameDetails);
		setVelocity(state.gameDetails.velocity);
		setIsPaused(state.gameDetails.status === GameStatus.Paused);

		if (gameDetails?.id === state.gameDetails.id) {
			return;
		}

		getWorkItems(state.gameDetails);

		subscribeToClientEvents<PauseToggledEvent>(event => {
			setIsPaused(event.isPaused);
		}, ClientEventType.PauseToggled);

		subscribeToClientEvents<IShouldRefreshGame>(() => {
			setShouldRefreshGame(true);
		}, ClientEventType.ShouldRefreshGame);

		subscribeToClientEvents<GameEndedEvent>(_ => {
			setGameStatus(GameStatus.Ended);
			setState(prevState => ({...prevState, isGameEndedDialogOpened: true}));
		}, ClientEventType.GameEnded);
	}, [state.gameDetails]);

	function onGameEndedDismiss() {
		setState(prevState => ({...prevState, isGameEndedDialogOpened: false}));
	}

	async function refreshGame() {
		const response = await getGameDetails({
			params: {
				projectId: projectDetails?.id,
				gameId: id
			}
		});

		setState(prevState => ({...prevState, gameDetails: response.data}));
		const currentActiveWorkItemId = activeWorkItem?.id!;
		await getWorkItems(state.gameDetails!);
		postGameRoundInsert({
			data: {
				gameId: gameDetails?.id,
				workItemId: currentActiveWorkItemId
			}
		});
		setActiveWorkItemId(response!.data.activeWorkItemId!);
		if (shouldRefreshGame) {
			setShouldRefreshGame(false);
		}
	}

	async function getWorkItems(gameDetails: IGameDetails) {
		const workRestClient = getClient(WorkRestClient);

		const response = await workRestClient.getIterationWorkItems(
			{
				teamId: gameDetails.teamId,
				team: gameDetails.teamName,
				projectId: gameDetails?.projectId!,
				project: gameDetails?.projectName!
			},
			gameDetails.iterationId
		);
		const iterationIds = response.workItemRelations.filter(x => !x.rel).map(x => x.target.id);
		if (iterationIds.length === 0) {
			return;
		}

		let workItemsListData = await getClient(WorkItemTrackingRestClient).getWorkItemsBatch(
			{
				ids: iterationIds,
				fields: [
					'Microsoft.VSTS.Scheduling.StoryPoints',
					'System.Title',
					'System.WorkItemType',
					'Microsoft.VSTS.Common.StackRank'
				],
				errorPolicy: WorkItemErrorPolicy.Fail,
				$expand: WorkItemExpand.None,
				asOf: new Date()
			},
			gameDetails?.projectId
		);

		// order by stack rank
		workItemsListData = workItemsListData.sort((a, b) => {
			const aStackRank = a.fields['Microsoft.VSTS.Common.StackRank'];
			const bStackRank = b.fields['Microsoft.VSTS.Common.StackRank'];
			if (aStackRank && bStackRank) {
				return aStackRank - bStackRank;
			}
			return 0;
		});
		setTotalRoundsCount(workItemsListData.length);

		const workItemLists = workItemsListData.map(workItem => {
			const points = workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints'];
			return {
				id: workItem.id,
				title: workItem.fields['System.Title'],
				type: workItem.fields['System.WorkItemType'],
				points: points ? Math.round(points * 100) / 100 : points,
				isActive: false
			} as IListWorkItem;
		});

		setState(prevState => ({...prevState, workItemLists}));
		setCommitment(workItemLists.map(x => x.points).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0);
		setPlayedRoundsCount(workItemLists.filter(x => x.points == 0 || (x.points && x.points > 0)).length);

		const workItemsData = await getClient(WorkItemTrackingRestClient).getWorkItemsBatch(
			{
				ids: iterationIds,
				fields: ['System.Tags', 'System.Description', 'Microsoft.VSTS.TCM.ReproSteps'],
				errorPolicy: WorkItemErrorPolicy.Fail,
				$expand: WorkItemExpand.None,
				asOf: new Date()
			},
			gameDetails?.projectId
		);

		let workItemsDetailed = workItemLists.map(workItem => {
			const workItemDataDetails = workItemsData.find(y => y.id === workItem.id)!;
			return {
				id: workItem.id,
				title: workItem.title,
				type: workItem.type,
				points: workItem.points,
				tags: workItemDataDetails.fields['System.Tags']?.split(';'),
				description:
					workItem.type == WorkItemType.UserStory
						? workItemDataDetails.fields['System.Description']
						: workItemDataDetails.fields['Microsoft.VSTS.TCM.ReproSteps']
			} as IWorkItemDetails;
		});

		// order wirkItemsDetailed by points
		workItemsDetailed = workItemsDetailed.sort((a, b) => (a.points ?? 0) - (b.points ?? 0));

		setState(prevState => ({...prevState, workItemsDetailed}));

		const activeWorkItem = workItemsDetailed.find(x => x.id === gameDetails.activeWorkItemId);

		let roundWorkItemId = workItemsDetailed[0].id;
		if (activeWorkItem) {
			roundWorkItemId = activeWorkItem.id;
			setActiveWorkItem(activeWorkItem);
			setActiveWorkItemId(activeWorkItem.id);
			setActiveWorkItemStoryPoints(activeWorkItem.points);
		} else {
			workItemLists[0].isActive = true;
			setState(prevState => ({...prevState, workItemLists}));
			setActiveWorkItem(workItemsDetailed[0]);
			setActiveWorkItemId(workItemsDetailed[0].id);
			setActiveWorkItemStoryPoints(workItemsDetailed[0].points);
		}

		if (shouldRefreshGame) {
			return;
		}

		postGameRoundInsert({
			data: {
				gameId: gameDetails?.id,
				workItemId: roundWorkItemId
			}
		});
	}

	return (
		<div className="game-wrapper">
			<RightMenu workItems={state.workItemLists} />
			<GameContent />
			{state.isGameEndedDialogOpened && <GameEndedDialog gameTitle={gameDetails?.gameTitle} onDismiss={onGameEndedDismiss} />}
		</div>
	);
};

export default Game;
