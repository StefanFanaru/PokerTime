import { IGameDetails } from '../types/game-details';
import { GameStatus } from '../types/game-status';
import { IPlayingCard } from '../types/card';

const SET_GAME_DETAILS = 'SET_GAME_DETAILS';
const SET_IS_PAUSED = 'SET_IS_PAUSED';
const SET_PLAYING_CARDS = 'SET_PLAYING_CARDS';
const SET_GAME_STATUS = 'SET_GAME_STATUS';
const SET_SHOULD_REFRESH_GAME = 'SET_SHOULD_REFRESH_GAME';
const RESET = 'RESET';

export interface CurrentGameState {
	gameDetails: IGameDetails | null;
	isPaused?: boolean;
	playingCards: IPlayingCard[];
	shouldRefreshGame?: boolean;
}

interface SetGameDetailsAction {
	type: typeof SET_GAME_DETAILS;
	payload: IGameDetails | null;
}

interface SetIsPausedAction {
	type: typeof SET_IS_PAUSED;
	payload: boolean;
}

interface SetPlayingCards {
	type: typeof SET_PLAYING_CARDS;
	payload: IPlayingCard[];
}

interface SetGameStatus {
	type: typeof SET_GAME_STATUS;
	payload: GameStatus;
}

interface SetShouldRefreshGame {
	type: typeof SET_SHOULD_REFRESH_GAME;
	payload: boolean;
}

interface Reset {
	type: typeof RESET;
}

export type ProjectInfoActionTypes =
	| SetGameDetailsAction
	| SetIsPausedAction
	| SetPlayingCards
	| SetGameStatus
	| SetShouldRefreshGame
	| Reset;

const initialState: CurrentGameState = {
	gameDetails: null,
	playingCards: []
};

export const actionCreators = {
	setGameDetails: (details: IGameDetails | null): ProjectInfoActionTypes => ({
		type: SET_GAME_DETAILS,
		payload: details
	}),
	setIsPaused: (value: boolean): ProjectInfoActionTypes => ({
		type: SET_IS_PAUSED,
		payload: value
	}),
	setPlayingCards: (value: IPlayingCard[]): ProjectInfoActionTypes => ({
		type: SET_PLAYING_CARDS,
		payload: value
	}),
	setGameStatus: (value: GameStatus): ProjectInfoActionTypes => ({
		type: SET_GAME_STATUS,
		payload: value
	}),
	setShouldRefreshGame: (value: boolean): ProjectInfoActionTypes => ({
		type: SET_SHOULD_REFRESH_GAME,
		payload: value
	}),
	reset: (): ProjectInfoActionTypes => ({
		type: RESET
	})
};

export const reducer = (state = initialState, action: ProjectInfoActionTypes): CurrentGameState => {
	switch (action.type) {
		case SET_GAME_DETAILS:
			return { ...state, gameDetails: action.payload };
		case SET_PLAYING_CARDS:
			return { ...state, playingCards: action.payload };
		case SET_GAME_STATUS:
			return { ...state, gameDetails: { ...state.gameDetails!, status: action.payload } };
		case SET_SHOULD_REFRESH_GAME:
			return { ...state, shouldRefreshGame: action.payload };
		case SET_IS_PAUSED:
			return {
				...state,
				gameDetails: {
					...state.gameDetails!,
					status:
						state.gameDetails?.status != GameStatus.Ended
							? action.payload
								? GameStatus.Paused
								: GameStatus.Active
							: state.gameDetails?.status
				}
			};
		case RESET:
			return { ...initialState };
		default:
			return state;
	}
};
