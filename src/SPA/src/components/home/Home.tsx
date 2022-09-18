import './home.scss';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Header } from 'azure-devops-ui/Header';
import { Page } from 'azure-devops-ui/Page';
import { IProjectInfo } from 'azure-devops-extension-api';
import NewGame from './components/new-game/NewGame';
import GamesList from './components/games-list/GamesList';
import PerfectScrollbar from 'react-perfect-scrollbar';
import FullScreenService from '../../services/fullScreenService';
import { WebApiTeam } from 'azure-devops-extension-api/Core';
import { TeamSettingsIteration } from 'azure-devops-extension-api/Work';
import Welcome from './components/welcome/Welcome';
import useAxios from 'axios-hooks';
import { IGameListResponse, IGameListResponseItem } from '../../types/game-list-response';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { GameStatus } from '../../types/game-status';
import { IGamePanelItem } from '../../types/game-panel-item';

interface State {
	panelShown: boolean;
	project?: IProjectInfo;
	activeGames?: IGameListResponseItem[];
	endedGames?: IGameListResponseItem[];
	gameUnderEdit?: IGamePanelItem;
	isFullScreen: boolean;
}

const Home = (): JSX.Element => {
	const [state, setState] = useState<State>({
		panelShown: false,
		isFullScreen: FullScreenService.isFullScreen
	});

	const { details: projectDetails } = useSelector((state: AppState) => state.projectInfo);

	const [{ data, loading }, getGamesList] = useAxios<IGameListResponse>(
		{
			url: '/api/game/list',
			params: {
				projectId: projectDetails?.id
			}
		},
		{ manual: true }
	);

	useEffect(() => {
		if (projectDetails) {
			getGamesList();
		}
	}, [projectDetails]);

	useEffect(() => {
		if (!data) {
			return;
		}
		setState(prevState => ({ ...prevState, activeGames: data.active, endedGames: data.ended }));
	}, [data]);

	function togglePanel(isShown: boolean): void {
		setState({
			...state,
			panelShown: isShown,
			gameUnderEdit: undefined
		});
	}

	async function onNewGameSubmit(
		id: string,
		title: string,
		team: WebApiTeam,
		iteration: TeamSettingsIteration,
		velocity?: number
	): Promise<void> {
		togglePanel(false);
		const submittedGame = {
			createdAt: new Date(),
			teamId: team.id,
			teamName: team.name,
			iterationId: iteration.id,
			iterationName: iteration.name,
			gameTitle: title,
			id: id,
			isOwner: true,
			status: GameStatus.Active,
			velocity: velocity
		};

		if (state.gameUnderEdit) {
			setState(prevState => {
				const currentGames = [...(prevState.activeGames ?? [])];
				const index = currentGames.findIndex(g => g.id === id);
				currentGames[index] = submittedGame;
				return {
					...prevState,
					activeGames: currentGames
				};
			});
			return;
		}
		setState(prevState => ({
			...prevState,
			activeGames: [submittedGame, ...(prevState.activeGames ?? [])]
		}));
	}

	function onGameEnded(gameId: string) {
		setState(prevState => {
			const currentEndedGames = [...(prevState.endedGames ?? [])];
			const game = state.activeGames!.find(x => x.id === gameId)!;
			game.status = GameStatus.Ended;
			game.endedAt = new Date();
			return {
				...prevState,
				activeGames: [...prevState.activeGames!.filter(x => x.id !== gameId)],
				endedGames: [game, ...currentEndedGames]
			};
		});
	}

	function onGameEdit(gameUnderEdit: IGamePanelItem) {
		setState(prevState => ({ ...prevState, gameUnderEdit, panelShown: true }));
	}

	function onAllGamesDeleted(areActiveGames: boolean = false) {
		if (areActiveGames && state.activeGames?.length) {
			setState(prevState => ({ ...prevState, activeGames: [] }));
			return;
		}

		if (state.endedGames?.length) {
			setState(prevState => ({ ...prevState, endedGames: [] }));
		}
	}

	function onFullScreenToggle() {
		FullScreenService.toggle();
		setState(prevState => ({ ...prevState, isFullScreen: FullScreenService.isFullScreen }));
	}

	return (
		<Page className="flex-grow home-wrapper">
			<Header
				title={state.project?.name}
				commandBarItems={[
					{
						id: 'panel-button',
						isPrimary: true,
						text: 'New game',
						iconProps: {
							iconName: 'Add'
						},
						onActivate: () => togglePanel(true)
					},
					{
						id: 'panel-button2',
						text: '',
						iconProps: {
							iconName: state.isFullScreen ? 'BackToWindow' : 'FullScreen'
						},
						onActivate: onFullScreenToggle
					}
				]}
			/>
			<PerfectScrollbar className="games-lists">
				{state.activeGames && state.activeGames.length > 0 && (
					<GamesList
						listTitle="Active games"
						games={state.activeGames}
						areActiveGames={true}
						onGameEnded={onGameEnded}
						onGameEdit={onGameEdit}
						onAllGamesDeleted={() => onAllGamesDeleted(true)}
					/>
				)}
				{state.endedGames && state.endedGames.length > 0 && (
					<GamesList listTitle="Ended games" games={state.endedGames} onAllGamesDeleted={() => onAllGamesDeleted()}/>
				)}
				{state.activeGames?.length === 0 && state.endedGames?.length === 0 && !loading && (
					<Welcome onNewGameClick={() => togglePanel(true)}/>
				)}
			</PerfectScrollbar>
			{state.panelShown && (
				<NewGame onSubmit={onNewGameSubmit} gameUnderEdit={state.gameUnderEdit} onClose={() => togglePanel(false)}/>
			)}
		</Page>
	);
};

export default Home;
