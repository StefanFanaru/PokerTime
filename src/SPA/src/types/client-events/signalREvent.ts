export interface SignalREvent<TPayload> {
	type: ClientEventType;
	payload: TPayload;
}

export enum ClientEventType {
	CardSelected = 'CardSelected',
	PlayerDisconnected = 'PlayerDisconnected',
	GameEnded = 'GameEnded',
	PlayerConnected = 'PlayerConnected',
	CardsWereFlipped = 'CardsWereFlipped',
	CardDeselected = 'CardDeselected',
	PauseToggled = 'PauseToggled',
	WorkItemSelected = 'WorkItemSelected',
	RoundStoryPointsSet = 'RoundStoryPointsSet',
	ShouldRefreshGame = 'ShouldRefreshGame'
}
