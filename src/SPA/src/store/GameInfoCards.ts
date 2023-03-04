const SET_COMMITMENT = 'SET_COMMITMENT';
const SET_VELOCITY = 'SET_VELOCITY';
const SET_PLAYED_ROUNDS_COUNT = 'SET_PLAYED_ROUNDS_COUNT';
const INCREASE_PLAYED_ROUNDS_COUNT = 'INCREASE_PLAYED_ROUNDS_COUNT';
const SET_TOTAL_ROUNDS_COUNT = 'SET_TOTAL_ROUNDS_COUNT';
const SET_ACTIVE_PLAYERS_IDS = 'SET_ACTIVE_PLAYERS_IDS';
const SET_PLAYERS_THAT_PLAYED_CARDS = 'SET_PLAYERS_THAT_PLAYED_CARDS';
const RESET = 'RESET';

export interface GameInfoCardsState {
	commitment: number;
	velocity: number;
	playedRoundsCount: number;
	totalRoundsCount: number;
	activePlayersIds: string[];
	playersThatPlayedCards: string[];
}

interface SetCommitmentAction {
	type: typeof SET_COMMITMENT;
	payload: number;
}

interface SetVelocityAction {
	type: typeof SET_VELOCITY;
	payload: number;
}

interface SetPlayedRoundsCount {
	type: typeof SET_PLAYED_ROUNDS_COUNT;
	payload: number;
}

interface SetTotalRoundsCount {
	type: typeof SET_TOTAL_ROUNDS_COUNT;
	payload: number;
}

interface SetActivePlayersIds {
	type: typeof SET_ACTIVE_PLAYERS_IDS;
	payload: string[];
}

interface IncreasePlayedRoundsCount {
	type: typeof INCREASE_PLAYED_ROUNDS_COUNT;
}

interface SetPlayersThatPlayedCards {
	type: typeof SET_PLAYERS_THAT_PLAYED_CARDS;
	payload: string[];
}

interface Reset {
	type: typeof RESET;
}

export type ProjectInfoActionTypes =
	| SetCommitmentAction
	| SetVelocityAction
	| SetPlayedRoundsCount
	| SetTotalRoundsCount
	| Reset
	| IncreasePlayedRoundsCount
	| SetPlayersThatPlayedCards
	| SetActivePlayersIds;

const initialState: GameInfoCardsState = {
	commitment: 0,
	velocity: 0,
	playedRoundsCount: 0,
	totalRoundsCount: 0,
	activePlayersIds: [],
	playersThatPlayedCards: []
};

export const actionCreators = {
	setCommitment: (value: number): ProjectInfoActionTypes => ({
		type: SET_COMMITMENT,
		payload: value
	}),
	setVelocity: (value: number): ProjectInfoActionTypes => ({
		type: SET_VELOCITY,
		payload: value
	}),
	setPlayedRoundsCount: (value: number): ProjectInfoActionTypes => ({
		type: SET_PLAYED_ROUNDS_COUNT,
		payload: value
	}),
	setTotalRoundsCount: (value: number): ProjectInfoActionTypes => ({
		type: SET_TOTAL_ROUNDS_COUNT,
		payload: value
	}),
	setActivePlayersIds: (value: string[]): ProjectInfoActionTypes => ({
		type: SET_ACTIVE_PLAYERS_IDS,
		payload: value
	}),
	increasePlayedRoundsCount: (): ProjectInfoActionTypes => ({
		type: INCREASE_PLAYED_ROUNDS_COUNT
	}),
	setPlayersThatPlayedCards: (value: string[]): ProjectInfoActionTypes => ({
		type: SET_PLAYERS_THAT_PLAYED_CARDS,
		payload: value
	}),
	reset: (): ProjectInfoActionTypes => ({
		type: RESET
	})
};

export const reducer = (state = initialState, action: ProjectInfoActionTypes): GameInfoCardsState => {
	switch (action.type) {
		case SET_COMMITMENT:
			return {...state, commitment: Math.round(action.payload * 100) / 100};
		case SET_VELOCITY:
			return {...state, velocity: Math.round(action.payload * 100) / 100};
		case SET_PLAYED_ROUNDS_COUNT:
			return {...state, playedRoundsCount: action.payload};
		case SET_TOTAL_ROUNDS_COUNT:
			return {...state, totalRoundsCount: action.payload};
		case SET_ACTIVE_PLAYERS_IDS:
			return {...state, activePlayersIds: action.payload};
		case SET_PLAYERS_THAT_PLAYED_CARDS:
			return {...state, playersThatPlayedCards: action.payload};
		case INCREASE_PLAYED_ROUNDS_COUNT:
			return {...state, playedRoundsCount: state.playedRoundsCount + 1};
		case RESET:
			return {...initialState};
		default:
			return state;
	}
};
