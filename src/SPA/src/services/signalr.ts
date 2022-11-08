import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr';
import {Observable} from 'azure-devops-ui/Core/Observable';
import {ClientEventType, SignalREvent} from '../types/client-events/signalREvent';
import {IClientEvent} from '../types/client-events/client-event';
import configureStore from '../store/Store';
import {GameStatus} from '../types/game-status';

let connection: HubConnection | null = null;
export const clientEventsMessages: Observable<any> = new Observable();
const subscribers: string[] = [];

export async function startSignalRConnection(token: string, gameId: string): Promise<void> {
	if (connection?.state === HubConnectionState.Connected) {
		return;
	}

	connect(token);
	const promise = connection!
		.start()
		.then(async () => {
			if (connection!.state !== HubConnectionState.Connected) {
				return;
			}
			await registerConnection(gameId);

			connection!.on('client-events', message => {
				const parsedMessage = JSON.parse(message) as IClientEvent;
				console.log('Received ClientEvent', parsedMessage.type, JSON.parse(message).innerEventJson);
				clientEventsMessages.notify(parsedMessage.innerEventJson, `${parsedMessage.type}-${parsedMessage.gameId}`);
			});
		})
		.catch(error => console.error(error));

	connection!.onreconnected(async () => {
		console.log('Reconnected to client events hub');
		await registerConnection(gameId);
	});

	return promise;
}

export async function stopSignalRConnection(): Promise<void> {
	if (connection) {
		console.log('Disconnected from client events hub');
		await connection.stop();
		configureStore.dispatch({type: 'RESET'});
	}
}

function connect(token: string) {
	connection = new HubConnectionBuilder()
		.withUrl(`${process.env.API_URL!}/hubs/client-events`, {
			accessTokenFactory: () => token!
		})
		.withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000, 300000])
		.configureLogging(LogLevel.Information)
		.build();

	connection.serverTimeoutInMilliseconds = 60 * 60 * 1000; // 1h
}

async function registerConnection(gameId: string): Promise<void> {
	return connection!
		.invoke('RegisterConnection', gameId)
		.then(connectionId => {
			console.log(`Connected to client events Hub. Connection Id: ${connectionId}`);
		})
		.catch(error => console.error(error));
}

export async function sendSignalREvent<TPayload>(message: SignalREvent<TPayload>) {
	if (!connection) {
		return;
	}
	const state = configureStore.getState();
	const isGameEnded = state.currentGame?.gameDetails?.status === GameStatus.Ended;
	if (isGameEnded) {
		return;
	}
	console.log('Send ClientEvent', message);
	await connection.invoke('ReceivedEvent', JSON.stringify({type: message.type, payload: JSON.stringify(message.payload)}));
}

export function subscribeToClientEvents<TEvent>(observer: (value: TEvent) => Promise<void> | void, eventType: ClientEventType) {
	if (connection?.state === HubConnectionState.Connecting) {
		setTimeout(() => subscribeToClientEvents(observer, eventType), 500);
	}
	const state = configureStore.getState();
	const gameId = state.currentGame?.gameDetails?.id;
	if (!gameId) {
		throw new Error('No game id found');
	}
	if (subscribers.includes(`${eventType}-${gameId}`)) {
		return;
	}
	clientEventsMessages.subscribe(observer, `${eventType}-${gameId}`);
	subscribers.push(`${eventType}-${gameId}`);
}
