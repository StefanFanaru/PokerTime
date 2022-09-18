const SET_PARENT_FRAME_BASE_URL = 'SET_PARENT_FRAME_BASE_URL';

export interface ParentFrameDataState {
  baseUrl: string | null;
}

interface SetParentFrameBaseUrl {
  type: typeof SET_PARENT_FRAME_BASE_URL;
  payload: string;
}

export type ProjectInfoActionTypes = SetParentFrameBaseUrl;

const initialState: ParentFrameDataState = {
  baseUrl: null
};

export const actionCreators = {
  setParentFrameBaseUrl: (
    organizationName: string,
    projectName: string,
    extensionRouteSegment: string
  ): ProjectInfoActionTypes => ({
    type: SET_PARENT_FRAME_BASE_URL,
    payload: `https://dev.azure.com/${organizationName}/${projectName}/_apps/hub/${extensionRouteSegment}`
  })
};

export const reducer = (state = initialState, action: ProjectInfoActionTypes): ParentFrameDataState => {
  switch (action.type) {
    case SET_PARENT_FRAME_BASE_URL:
      return { ...state, baseUrl: action.payload };
    default:
      return state;
  }
};
