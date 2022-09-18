import {IWorkItemDetails} from '../types/work-items/work-item-details';
import {IFlippedCard} from '../types/flipped-card';
import {IPlayedCard} from '../types/played-card';

const SET_WORK_ITEM_DETAILS = 'SET_WORK_ITEM_DETAILS';
const SET_WORK_ITEM_ID = 'SET_WORK_ITEM_ID';
const SET_ACTIVE_WORK_ITEM_STORY_POINTS = 'SET_ACTIVE_WORK_ITEM_STORY_POINTS';
const SET_ROUND_ID = 'SET_ROUND_ID';
const SET_SELECTED_CARD_ID = 'SET_SELECTED_CARD_ID';
const SET_FLIPPED_CARDS = 'SET_FLIPPED_CARDS';
const SET_PLAYED_CARDS = 'SET_PLAYED_CARDS';
const SET_CARDS_WERE_FLIPPED = 'SET_CARDS_WERE_FLIPPED';
const INCREASE_CURRENT_HIDDEN_CARDS_COUNT = 'INCREASE_CURRENT_HIDDEN_CARDS_COUNT';
const DECREASE_CURRENT_HIDDEN_CARDS_COUNT = 'DECREASE_CURRENT_HIDDEN_CARDS_COUNT';
const SET_CURRENT_HIDDEN_CARDS_COUNT = 'SET_CURRENT_HIDDEN_CARDS_COUNT';
const RESET = 'RESET';

export interface CurrentRoundState {
	activeWorkItem: IWorkItemDetails | null;
	activeWorkItemId?: number;
	roundId: string;
	activeWorkItemStoryPoints?: number;
	selectedCardId?: string;
	cardsWereFlipped: boolean;
	flippedCards: IFlippedCard[];
	playedCards: IPlayedCard[];
	currentHiddenCardsCount: number;
}

interface SetWorkItemDetailsAction {
	type: typeof SET_WORK_ITEM_DETAILS;
	payload: IWorkItemDetails;
}

interface SetWorkItemIdAction {
	type: typeof SET_WORK_ITEM_ID;
	payload: number | null;
}

interface SetStoryPointsAction {
	type: typeof SET_ACTIVE_WORK_ITEM_STORY_POINTS;
	payload?: number;
}

interface SetRoundId {
	type: typeof SET_ROUND_ID;
	payload: string;
}

interface SetSelectedCardId {
	type: typeof SET_SELECTED_CARD_ID;
	payload: string | undefined;
}

interface SetFlippedCards {
	type: typeof SET_FLIPPED_CARDS;
	payload: IFlippedCard[];
}

interface SetCardsWereFlipped {
	type: typeof SET_CARDS_WERE_FLIPPED;
	payload: boolean;
}

interface SetPlayedCards {
	type: typeof SET_PLAYED_CARDS;
	payload: IPlayedCard[];
}

interface IncreaseCurrentHiddenCardsCount {
	type: typeof INCREASE_CURRENT_HIDDEN_CARDS_COUNT;
}

interface DecreaseCurrentHiddenCardsCount {
	type: typeof DECREASE_CURRENT_HIDDEN_CARDS_COUNT;
}

interface SetCurrentHiddenCardsCount {
	type: typeof SET_CURRENT_HIDDEN_CARDS_COUNT;
	payload: number;
}

interface Reset {
	type: typeof RESET;
}

export type ProjectInfoActionTypes =
	| SetWorkItemDetailsAction
	| SetWorkItemIdAction
	| SetStoryPointsAction
	| SetSelectedCardId
	| SetFlippedCards
	| SetCardsWereFlipped
	| SetPlayedCards
	| SetCurrentHiddenCardsCount
	| IncreaseCurrentHiddenCardsCount
	| DecreaseCurrentHiddenCardsCount
	| Reset
	| SetRoundId;

const initialState: CurrentRoundState = {
	activeWorkItem: null,
	roundId: '',
	flippedCards: [],
	cardsWereFlipped: false,
	playedCards: [],
	currentHiddenCardsCount: 0
};

export const actionCreators = {
	setActiveWorkItem: (details: IWorkItemDetails): ProjectInfoActionTypes => ({
		type: SET_WORK_ITEM_DETAILS,
		payload: details
	}),
	setActiveWorkItemId: (id: number | null): ProjectInfoActionTypes => ({
		type: SET_WORK_ITEM_ID,
		payload: id
	}),
	setActiveWorkItemStoryPoints: (value?: number): ProjectInfoActionTypes => ({
		type: SET_ACTIVE_WORK_ITEM_STORY_POINTS,
		payload: value
	}),
	setRoundId: (value: string): ProjectInfoActionTypes => ({
		type: SET_ROUND_ID,
		payload: value
	}),
	setFlippedCards: (value: IFlippedCard[]): ProjectInfoActionTypes => ({
		type: SET_FLIPPED_CARDS,
		payload: value
	}),
	setCardsWereFlipped: (value: boolean): ProjectInfoActionTypes => ({
		type: SET_CARDS_WERE_FLIPPED,
		payload: value
	}),
	setSelectedCardId: (value: string | undefined): ProjectInfoActionTypes => ({
		type: SET_SELECTED_CARD_ID,
		payload: value
	}),
	setPlayedCards: (value: IPlayedCard[]): ProjectInfoActionTypes => ({
		type: SET_PLAYED_CARDS,
		payload: value
	}),
	increaseCurrentHiddenCardsCount: (): ProjectInfoActionTypes => ({
		type: INCREASE_CURRENT_HIDDEN_CARDS_COUNT
	}),
	decreaseCurrentHiddenCardsCount: (): ProjectInfoActionTypes => ({
		type: DECREASE_CURRENT_HIDDEN_CARDS_COUNT
	}),
	setCurrentHiddenCardsCount: (value: number): ProjectInfoActionTypes => ({
		type: SET_CURRENT_HIDDEN_CARDS_COUNT,
		payload: value
	}),
	reset: (): ProjectInfoActionTypes => ({
		type: RESET
	})
};

export const reducer = (state = initialState, action: ProjectInfoActionTypes): CurrentRoundState => {
	switch (action.type) {
		case SET_WORK_ITEM_DETAILS:
			return {...state, activeWorkItem: action.payload};
		case SET_WORK_ITEM_ID:
			return {...state, activeWorkItemId: action.payload || undefined};
		case SET_ACTIVE_WORK_ITEM_STORY_POINTS:
			return {...state, activeWorkItemStoryPoints: action.payload};
		case SET_ROUND_ID:
			return {...state, roundId: action.payload};
		case SET_SELECTED_CARD_ID:
			return {...state, selectedCardId: action.payload};
		case SET_FLIPPED_CARDS:
			return {...state, flippedCards: action.payload};
		case SET_CARDS_WERE_FLIPPED:
			return {...state, cardsWereFlipped: action.payload};
		case SET_PLAYED_CARDS:
			return {...state, playedCards: action.payload};
		case INCREASE_CURRENT_HIDDEN_CARDS_COUNT:
			return {...state, currentHiddenCardsCount: state.currentHiddenCardsCount + 1};
		case DECREASE_CURRENT_HIDDEN_CARDS_COUNT:
			return {...state, currentHiddenCardsCount: Math.max(state.currentHiddenCardsCount - 1, 0)};
		case SET_CURRENT_HIDDEN_CARDS_COUNT:
			return {...state, currentHiddenCardsCount: action.payload};
		case RESET:
			return {...initialState};
		default:
			return state;
	}
};
