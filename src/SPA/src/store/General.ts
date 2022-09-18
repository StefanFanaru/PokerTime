const SET_IS_VIEWING_IMAGE = 'SET_IS_VIEWING_IMAGE';

export interface GeneralState {
  isViewingImage: boolean;
}

interface SetTokenAction {
  type: typeof SET_IS_VIEWING_IMAGE;
  payload: boolean;
}

export type GeneralActionTypes = SetTokenAction;

const initialState: GeneralState = {
  isViewingImage: false
};

export const actionCreators = {
  setIsViewingImage: (value: boolean): GeneralActionTypes => ({
    type: SET_IS_VIEWING_IMAGE,
    payload: value
  })
};

export const reducer = (state = initialState, action: GeneralActionTypes): GeneralState => {
  switch (action.type) {
    case SET_IS_VIEWING_IMAGE:
      return { ...state, isViewingImage: action.payload };
    default:
      return state;
  }
};
