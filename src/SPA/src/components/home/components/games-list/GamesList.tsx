import * as React from 'react';
import { useEffect, useState } from 'react';
import './games-list.scss';
import { IGameListResponseItem } from '../../../../types/game-list-response';
import { IMenuItem } from 'azure-devops-ui/Menu';
import { WorkRestClient } from 'azure-devops-extension-api/Work';
import { getClient } from 'azure-devops-extension-api';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store';
import { WorkItemErrorPolicy, WorkItemExpand, WorkItemTrackingRestClient } from 'azure-devops-extension-api/WorkItemTracking';
import { mapGameResponse, MenuItemType } from './helpers';
import { IGameListItem } from '../../../../types/game-list-item';
import GamesListItem from './games-list-item/GamesListItem';
import useAxios from 'axios-hooks';
import { IGamePanelItem } from '../../../../types/game-panel-item';

interface Props {
	listTitle: string;
	games: IGameListResponseItem[];
	areActiveGames?: boolean;
	onGameEnded?: (gameId: string) => void;
	onGameEdit?: (game: IGamePanelItem) => void;
	onAllGamesDeleted: () => void;
}

interface State {
	isIterationQueryInProgress?: boolean;
	games: IGameListItem[];
	iterationWorkItemsIds: Map<string, number[]>;
}

const GamesList = (props: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		games: mapGameResponse(props.games),
		iterationWorkItemsIds: new Map<string, number[]>()
	});
	const { details: projectDetails } = useSelector((state: AppState) => state.projectInfo);

	const [{ response }, sendDeleteGame] = useAxios(
		{
			method: 'DELETE',
			url: '/api/game'
		},
		{ manual: true }
	);

	useEffect(() => {
		if (!props.games.length) {
			return;
		}

		setState(prevState => {
			const newGames = mapGameResponse(props.games);
			newGames.forEach(game => {
				const existingIteration = prevState.games.find(g => g.iteration.id === game.iteration.id && g.team.id === game.team.id);
				if (existingIteration) {
					game.workItemsCount = existingIteration.workItemsCount;
					game.pendingWorkItemsCount = existingIteration.pendingWorkItemsCount;
				}
			});

			return {
				...prevState,
				games: newGames
			};
		});
	}, [props.games]);

	useEffect(() => {
		if (response) {
			const deletedGameId = JSON.parse(response.config.data).gameId;
			setState(prevState => ({ ...prevState, games: prevState.games.filter(game => game.id !== deletedGameId) }));
		}
	}, [response]);

	useEffect(() => {
		if (!state.games?.length) {
			props.onAllGamesDeleted();
			return;
		}

		if (!props.areActiveGames || state.isIterationQueryInProgress) {
			return;
		}

		const gamesToQuery = state.games
			.map(game => ({ iterationId: game.iteration.id, teamId: game.team.id }))
			.filter(game => !state.iterationWorkItemsIds.has(game.iterationId + game.teamId))
			.filter((value, index, self) => {
				return self.findIndex(g => g.iterationId === value.iterationId && g.teamId === value.teamId) === index;
			});

		if (gamesToQuery.length === 0) {
			return;
		}

		const workRestClient = getClient(WorkRestClient);
		const iterationWorkItemsIds = new Map<string, number[]>();
		const promises = gamesToQuery.map(async game => {
			if (state.iterationWorkItemsIds.has(game.iterationId + game.teamId)) {
				return;
			}
			const response = await workRestClient.getIterationWorkItems(
				{
					teamId: game.teamId,
					team: '',
					projectId: projectDetails?.id!,
					project: projectDetails?.name!
				},
				game.iterationId
			);

			const ids = response.workItemRelations.filter(x => !x.rel).map(x => x.target.id);
			iterationWorkItemsIds.set(game.iterationId + game.teamId, ids);
		});

		if (promises.length) {
			setState(prevState => ({ ...prevState, isIterationQueryInProgress: true }));
		}

		Promise.all(promises).then(() => {
			if (!iterationWorkItemsIds.size) {
				return;
			}

			setState(prevState => {
				return {
					...prevState,
					iterationWorkItemsIds: new Map<string, number[]>(iterationWorkItemsIds),
					isIterationQueryInProgress: false
				};
			});
		});
	}, [state.games]);

	useEffect(() => {
		if (!state.iterationWorkItemsIds.size || !state.games.length) {
			return;
		}

		if (!state.games.filter(x => x.workItemsCount === undefined || x.pendingWorkItemsCount === undefined).length) {
			return;
		}

		const currentGames = [...state.games];

		state.games
			.filter(x => x.workItemsCount === undefined)
			.forEach(game => {
				const iterationIds = state.iterationWorkItemsIds.get(game.iteration.id + game.team.id);
				const index = currentGames.indexOf(game);
				currentGames[index].workItemsCount = iterationIds?.length ?? 0;
				if (currentGames[index].workItemsCount == 0) {
					currentGames[index].pendingWorkItemsCount = 0;
				}
			});

		setState(prevState => ({ ...prevState, games: currentGames }));

		async function setPendingWorkItemsCount() {
			const gamesToProcess = state.games.filter(x => x.pendingWorkItemsCount === undefined);
			for (const game of gamesToProcess) {
				const iterationIds = state.iterationWorkItemsIds.get(game.iteration.id + game.team.id);
				if (!iterationIds || !iterationIds.length) {
					continue;
				}
				const workItemsData = await getClient(WorkItemTrackingRestClient).getWorkItemsBatch(
					{
						ids: iterationIds,
						fields: ['Microsoft.VSTS.Scheduling.StoryPoints'],
						errorPolicy: WorkItemErrorPolicy.Fail,
						$expand: WorkItemExpand.None,
						asOf: new Date()
					},
					projectDetails?.id
				);

				setState(prevState => {
					const currentGames = [...prevState.games];
					const index = currentGames.indexOf(game);
					currentGames[index].pendingWorkItemsCount = workItemsData.filter(
						x => !x.fields['Microsoft.VSTS.Scheduling.StoryPoints']
					).length;
					return {
						...prevState,
						games: currentGames
					};
				});
			}
		}

		setPendingWorkItemsCount();
	}, [state.iterationWorkItemsIds]);

	async function onGameMenuActivate(menuItem: IMenuItem, gameId: string) {
		if (menuItem.id === MenuItemType.End) {
			if (props.onGameEnded) {
				props.onGameEnded(gameId);
			}
		}

		if (menuItem.id === MenuItemType.Delete) {
			await sendDeleteGame({
				data: {
					gameId: gameId
				}
			});
		}

		if (menuItem.id === MenuItemType.Edit) {
			const game = state.games.find(x => x.id === gameId)!;

			props.onGameEdit!({
				id: gameId,
				title: game.gameTitle,
				selectedIterationId: game.iteration.id,
				selectedTeamId: game.team.id,
				velocity: game.velocity
			});
		}
	}

	return (
		<div className="games-list-wrapper">
			<div className="title">{props.listTitle}</div>
			<div className="list">
				{state.games.map((game: IGameListItem, index) => (
					<GamesListItem game={game} onGameMenuActivate={onGameMenuActivate} key={index}/>
				))}
			</div>
		</div>
	);
};

export default GamesList;
