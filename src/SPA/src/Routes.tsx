import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';
import {Route, Switch, useHistory} from 'react-router-dom';
import {AppState} from './store';
import {bindActionCreators, Dispatch} from 'redux';
import {ConnectedRouter, RouterLocation} from 'connected-react-router';
import {ToastContainer} from 'react-toastify';
import CornerSpinner from './components/core/corner-spinner/CornerSpinner';
import {actionCreators as appUserActionCreators} from './store/PlayerDetails';
import {actionCreators as projectInfoActionCreators} from './store/ProjectInfo';
import {actionCreators as authDataActionCreators} from './store/AuthData';
import {actionCreators as parentFrameDataActionCreators} from './store/ParentFrameData';
import {IUser} from './types/common/user';
import * as SDK from 'azure-devops-extension-sdk';
import {CommonServiceIds, IHostNavigationService, IProjectPageService} from 'azure-devops-extension-api';
import Game from './components/game/Game';
import FullScreenService from './services/fullScreenService';
import Home from './components/home/Home';
import AuthService from './services/auth/auth.service';
import Forbidden from './components/forbidden/Forbidden';
import LoadingScreen from './components/loading-screen/LoadingScreen';
import ErrorPage from './components/error-page/ErrorPage';
import {useInterval} from './services/hooks/useInterval';
import {parseJwt} from './helpers/helpers';
import axios from 'axios';
import {setupRouting} from './helpers/setup-routing';

interface State {
	isLoading: boolean;
	isForbidden: boolean;
	isError: boolean;
	loadingLabel: string;
}

const Routes = (): JSX.Element => {
	const [state, setState] = useState<State>({
		isLoading: true,
		isForbidden: false,
		isError: false,
		loadingLabel: 'Initializing extension...'
	});

	const firstUpdate = useRef(true);
	const dispatch = useDispatch();
	const {setUserDetails} = bindActionCreators(appUserActionCreators, dispatch);
	const {setProjectInfo} = bindActionCreators(projectInfoActionCreators, dispatch);
	const {setParentFrameBaseUrl} = bindActionCreators(parentFrameDataActionCreators, dispatch);
	const {setToken} = bindActionCreators(authDataActionCreators, dispatch);
	const authDataState = useSelector((state: AppState) => state.authData);

	const history = useHistory();

	function setLoadingLabel(label: string): void {
		setState(prevState => ({...prevState, loadingLabel: label}));
	}

	async function authenticateUser(): Promise<void> {
		let token = localStorage.getItem('token');
		if (token && isTokenExpired(token)) {
			localStorage.removeItem('token');
			await authenticateUser();
			return;
		}

		if (!token) {
			const authService = new AuthService();
			const response = await authService.connect();
			const isForbidden = response.statusCode === 401;
			token = response.token;
			if (!token) {
				history.push(isForbidden ? '/forbidden' : '/error');
				setState(prevState => ({...prevState, isLoading: false, isForbidden: isForbidden, isError: !isForbidden}));
				return;
			}
		}

		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		setToken(token);
		localStorage.setItem('token', token);
	}

	useEffect(() => {
		if (!firstUpdate.current) {
			return;
		}

		SDK.init().then(async () => {
			await SDK.notifyLoadSucceeded();

			await setupRouting(history);

			const hostNavigationService = await SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);
			const hostLocation = await hostNavigationService.getPageRoute();
			const host = SDK.getHost();
			setParentFrameBaseUrl(host.name, hostLocation.routeValues.project, hostLocation.routeValues.parameters);

			setLoadingLabel('Authorizing user...');
			await authenticateUser();
			const user = SDK.getUser();
			setUserDetails({
				id: user.id,
				name: user.displayName,
				imageUrl: user.imageUrl
			});

			setLoadingLabel('Reading Azure Project...');
			const projectPageService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
			const project = await projectPageService.getProject();

			if (project) {
				setProjectInfo({
					id: project.id,
					name: project.name
				});
			}

			await FullScreenService.init();
			setState(prevState => ({...prevState, isLoading: false}));
			firstUpdate.current = false;
		});

		window.addEventListener(
			'storage',
			function (event) {
				if (event.storageArea === localStorage) {
					if (event.key === 'token' || !event.key) {
						if (!event.key || (event.oldValue && !event.newValue)) {
							authenticateUser();
						}
					}
				}
			},
			false
		);
	}, []);

	useInterval(() => {
		if (!authDataState.token) {
			return;
		}

		if (isTokenExpired(authDataState.token)) {
			authenticateUser();
		}
	}, 30000);

	function isTokenExpired(token: string) {
		const parsedToken = parseJwt(token);
		const now = Date.now() / 1000;
		const secondsTillExpiration = parsedToken.exp - now;
		return secondsTillExpiration < 120;
	}

	return state.isLoading ? (
		<LoadingScreen label={state.loadingLabel} />
	) : (
		<React.Fragment>
			<ToastContainer limit={5} autoClose={3000} position="bottom-right" />
			<div className="page-container">
				<CornerSpinner />
				<ConnectedRouter history={history}>
					{state.isForbidden ? (
						<Forbidden userNotAuthenticated={true} />
					) : state.isError ? (
						<ErrorPage message="An unexpected error occured, please try again later." canGoHome={false} />
					) : (
						<Switch>
							<Route exact path="/" component={Home} />
							<Route exact path="/game/:id" component={Game} />
							<Route exact path="/error" component={ErrorPage} />
							<Route exact path="/forbidden" component={Forbidden} />
							<Route exact path="*" component={Home} />
						</Switch>
					)}
				</ConnectedRouter>
			</div>
		</React.Fragment>
	);
};

function mapStateToProps(state: AppState): {user: IUser | undefined; isLoadingUser: boolean; location: RouterLocation<unknown>} {
	return {
		user: undefined,
		isLoadingUser: false,
		location: state.router.location
	};
}

function mapDispatchToProps(dispatch: Dispatch): {
	dispatch: Dispatch;
} {
	return {
		dispatch
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
