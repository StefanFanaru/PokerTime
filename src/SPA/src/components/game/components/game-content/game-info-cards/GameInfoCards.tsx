import * as React from 'react';
import {useEffect, useState} from 'react';
import './game-info-cards.scss';
import {useSelector} from 'react-redux';
import {AppState} from '../../../../../store';
import {getClient} from 'azure-devops-extension-api';
import {GraphRestClient} from 'azure-devops-extension-api/Graph';
import {Tooltip} from 'azure-devops-ui/TooltipEx';
import {subscribeToClientEvents} from '../../../../../services/signalr';
import {ClientEventType} from '../../../../../types/client-events/signalREvent';
import {IPlayerDisconnectedEvent} from '../../../../../types/client-events/user-disconnected';
import {IPlayerConnectedEvent} from '../../../../../types/client-events/user-connected';
import {getTimePlaying} from './helpers';
import {useInterval} from '../../../../../services/hooks/useInterval';
import {GameStatus} from '../../../../../types/game-status';

interface State {
	isActivePlayersOpened: boolean;
	timePlaying: string;
	players: {id: string; name: string; avatarBase64: string}[];
}

const GameInfoCards = (): JSX.Element => {
	const [state, setState] = useState<State>({
		isActivePlayersOpened: false,
		players: [],
		timePlaying: '00:00:00'
	});
	const {id: playerId} = useSelector((state: AppState) => state.playerDetails);
	const gameInfoCardsState = useSelector((state: AppState) => state.gameInfoCards);
	const {gameDetails} = useSelector((state: AppState) => state.currentGame);
	const {roundId} = useSelector((state: AppState) => state.currentRound);

	useEffect(() => {
		if (!gameInfoCardsState.activePlayersIds.length) {
			return;
		}

		getPlayersInfo();
	}, [gameInfoCardsState.activePlayersIds]);

	useEffect(() => {
		if (!gameDetails?.startedAt) {
			return;
		}
		setState(prevState => ({...prevState, timePlaying: getTimePlaying(gameDetails.startedAt!, gameDetails.endedAt, roundId)}));
	}, [gameDetails?.startedAt, gameDetails?.endedAt, roundId]);

	useEffect(() => {
		if (!gameDetails?.id) {
			return;
		}

		subscribeToClientEvents<IPlayerConnectedEvent>(async event => {
			const player = await getUserDetails(event.playerId);
			setState(prevState => {
				if (!prevState.players.find(player => player.id === event.playerId)) {
					return {
						...prevState,
						players: [...prevState.players, player]
					};
				}
				return {
					...prevState
				};
			});
		}, ClientEventType.PlayerConnected);

		subscribeToClientEvents<IPlayerDisconnectedEvent>(async event => {
			if (event.playerId === playerId) {
				return;
			}
			setState(prevState => ({...prevState, players: prevState.players.filter(player => player.id !== event.playerId)}));
		}, ClientEventType.PlayerDisconnected);
	}, [gameDetails?.id]);

	async function getPlayersInfo() {
		const playerIds = [...gameInfoCardsState.activePlayersIds.filter(id => id !== playerId)];
		playerIds.unshift(playerId!);
		const newPlayers = await Promise.all(playerIds.map(async playerId => await getUserDetails(playerId)));

		setState(prevState => ({...prevState, players: newPlayers}));
	}

	useInterval(() => {
		if (!state.timePlaying || gameDetails?.status === GameStatus.Ended) {
			return;
		}

		setState(prevState => ({
			...prevState,
			timePlaying: getTimePlaying(gameDetails?.startedAt!, gameDetails?.endedAt, roundId)
		}));
	}, 1000);

	function simpleCard(text: string, value: string | number, tooltip = ''): JSX.Element {
		return (
			<Tooltip delayMs={500} text={tooltip}>
				<div className="card default-cursor">
					<div className="title">{text}</div>
					<div className="value">{value}</div>
				</div>
			</Tooltip>
		);
	}

	function onActivePlayersClick() {
		setState(prevState => ({...prevState, isActivePlayersOpened: !prevState.isActivePlayersOpened}));
	}

	async function getUserDetails(playerId: string): Promise<{id: string; name: string; avatarBase64: string}> {
		const player = {id: playerId, name: '', avatarBase64: ''};

		const avatarSrc = sessionStorage.getItem(`${playerId}_avatar`);
		const displayName = sessionStorage.getItem(`${playerId}_displayName`);

		if (avatarSrc && displayName) {
			player.avatarBase64 = avatarSrc;
			player.name = displayName;
			return player;
		}

		const client = getClient(GraphRestClient);
		const descriptorResult = await client.getDescriptor(playerId);
		const user = await client.getUser(descriptorResult.value);

		const avatar = await client.getAvatar(descriptorResult.value);
		sessionStorage.setItem(`${playerId}_avatar`, avatar.value.toString());
		sessionStorage.setItem(`${playerId}_displayName`, user.displayName);

		player.avatarBase64 = avatar.value.toString();
		player.name = user.displayName;
		return player;
	}

	return (
		<div className="game-info-cards-wrapper">
			<Tooltip delayMs={500} text={`Difference: ${gameInfoCardsState.velocity - gameInfoCardsState.commitment}`}>
				<div className="card default-cursor">
					<div className="title">Commitment</div>
					<div
						className={`value ${
							gameInfoCardsState.velocity
								? gameInfoCardsState.commitment <= gameInfoCardsState.velocity * 0.85
									? 'green'
									: gameInfoCardsState.commitment <= gameInfoCardsState.velocity
									? 'orange'
									: 'red'
								: ''
						}`}>
						{gameInfoCardsState.commitment}
					</div>
				</div>
			</Tooltip>
			{gameInfoCardsState.velocity != undefined && simpleCard('Velocity', gameInfoCardsState.velocity)}
			{simpleCard(
				'Played rounds',
				`${gameInfoCardsState.playedRoundsCount}/${gameInfoCardsState.totalRoundsCount}`,
				`Remaining rounds: ${gameInfoCardsState.totalRoundsCount - gameInfoCardsState.playedRoundsCount}`
			)}
			{simpleCard(
				gameDetails?.status === GameStatus.Ended ? 'Time played' : 'Time playing',
				state.timePlaying,
				`Started at ${gameDetails?.startedAt?.toLocaleString()}`
			)}
			{gameDetails?.status !== GameStatus.Ended && (
				<div className="card active-players" onClick={onActivePlayersClick}>
					<div className="title">Active players</div>
					<div className="value">{state.players.length ?? 1}</div>
				</div>
			)}
			{state.isActivePlayersOpened && (
				<div className="active-players-hover">
					{state.players.map(player => (
						<div className="player" key={player.id}>
							<Tooltip delayMs={500} text={player.name}>
								<img
									className={gameInfoCardsState?.playersThatPlayedCards.includes(player.id) ? 'has-played-card' : ''}
									src={`data:image/png;base64, ${player.avatarBase64}`}
									alt=""
								/>
							</Tooltip>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default GameInfoCards;
