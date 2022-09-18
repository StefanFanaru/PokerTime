import { CombinedState, combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';
import { PlayerDetails, reducer as appUserReducer } from './PlayerDetails';
import { ProjectInfoState, reducer as projectInfoReducer } from './ProjectInfo';
import { AuthDataState, reducer as authDataReducer } from './AuthData';
import { ParentFrameDataState, reducer as parentFrameDataReducer } from './ParentFrameData';
import { CurrentGameState, reducer as currentGameReducer } from './CurrentGame';
import { GameInfoCardsState, reducer as gameInfoCardsReducer } from './GameInfoCards';
import { CurrentRoundState, reducer as currentRoundReducer } from './CurrentRound';
import { GeneralState, reducer as generalReducer } from './General';

export interface AppState {
	router: RouterState<unknown>;
	playerDetails: PlayerDetails;
	projectInfo: ProjectInfoState;
	authData: AuthDataState;
	parentFrameData: ParentFrameDataState;
	currentGame: CurrentGameState;
	currentRound: CurrentRoundState;
	gameInfoCards: GameInfoCardsState;
	general: GeneralState;
}

const rootReducer = (history: History): Reducer<CombinedState<AppState>> =>
	combineReducers({
		router: connectRouter(history),
		playerDetails: appUserReducer,
		projectInfo: projectInfoReducer,
		authData: authDataReducer,
		parentFrameData: parentFrameDataReducer,
		currentGame: currentGameReducer,
		currentRound: currentRoundReducer,
		gameInfoCards: gameInfoCardsReducer,
		general: generalReducer
	});

export default rootReducer;
