import { ClientEventType } from './signalREvent';

export interface IClientEvent {
	innerEventJson: string;
	createdAt: string;
	type: ClientEventType;
	gameId: string;
}
