const SET_AUTH_TOKEN = 'SET_AUTH_TOKEN';

export interface AuthDataState {
  token: string | null;
}

interface SetTokenAction {
  type: typeof SET_AUTH_TOKEN;
  payload: string;
}

export type AuthDataActionTypes = SetTokenAction;

const initialState: AuthDataState = {
  token: null
};

export const actionCreators = {
  setToken: (token: string): AuthDataActionTypes => ({
    type: SET_AUTH_TOKEN,
    payload: token
  })
};

export const reducer = (state = initialState, action: AuthDataActionTypes): AuthDataState => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return { ...state, token: action.payload };
    default:
      return state;
  }
};
