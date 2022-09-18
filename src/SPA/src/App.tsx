import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { FunctionComponent, ReactElement } from 'react';
import Routes from './Routes';
import configureStore, { history } from './store/Store';
import { ConnectedRouter } from 'connected-react-router';
import './styles/main.scss';
import { Provider } from 'react-redux';
import { isMobile, watchThemeValue } from './helpers/helpers';
import { setupAxios } from './helpers/setup-axios';

const App: FunctionComponent<unknown> = (): ReactElement => {
	setupAxios();
	watchThemeValue();
	if (isMobile()) {
		document.body.className = ' true-mobile';
	}

	return (
		<Provider store={configureStore}>
			<ConnectedRouter history={history}>
				<Routes/>
			</ConnectedRouter>
		</Provider>
	);
};

export default hot(App);
