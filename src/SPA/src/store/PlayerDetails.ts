import { IUser } from '../types/common/user';

const SET_USER_DETAILS = 'SET_USER_DETAILS';

export interface PlayerDetails {
	id?: string;
	name?: string;
}

interface SetUserDetailsAction {
	type: typeof SET_USER_DETAILS;
	payload: IUser;
}

export type UserActionTypes = SetUserDetailsAction;

const initialState: PlayerDetails = {
	id: undefined,
	name: undefined
};

export const actionCreators = {
	setUserDetails: (details: IUser): UserActionTypes => ({
		type: SET_USER_DETAILS,
		payload: details
	})
};

export const reducer = (state = initialState, action: UserActionTypes): PlayerDetails => {
	switch (action.type) {
		case SET_USER_DETAILS:
			return { ...state, id: action.payload.id, name: action.payload.name };
		default:
			return state;
	}
};
