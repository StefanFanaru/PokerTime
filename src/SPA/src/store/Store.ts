import { applyMiddleware, createStore, EmptyObject, Store } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import rootReducer, { AppState } from './index';
import logger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

export const history = createBrowserHistory();

const configureStore = (): Store<EmptyObject & AppState> & { dispatch: unknown } => {
	const allReducers = rootReducer(history);
	const middlewares = [thunkMiddleware, routerMiddleware(history)];
	if (process.env.LOG_REDUX == 'true') {
		middlewares.push(logger);
	}

	return createStore(allReducers, composeWithDevTools(applyMiddleware(...middlewares)));
};

export default configureStore();
