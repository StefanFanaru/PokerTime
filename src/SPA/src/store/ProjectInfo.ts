import { IProjectInfo } from 'azure-devops-extension-api';

const SET_PROJECT_INFO = 'SET_PROJECT_INFO';

export interface ProjectInfoState {
	details: IProjectInfo | null;
}

interface SetProjectInfoAction {
	type: typeof SET_PROJECT_INFO;
	payload: IProjectInfo;
}

export type ProjectInfoActionTypes = SetProjectInfoAction;

const initialState: ProjectInfoState = {
	details: null
};

export const actionCreators = {
	setProjectInfo: (details: IProjectInfo): ProjectInfoActionTypes => ({
		type: SET_PROJECT_INFO,
		payload: details
	})
};

export const reducer = (state = initialState, action: ProjectInfoActionTypes): ProjectInfoState => {
	switch (action.type) {
		case SET_PROJECT_INFO:
			return { ...state, details: action.payload };
		default:
			return state;
	}
};
