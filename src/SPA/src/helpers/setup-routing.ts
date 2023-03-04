import * as SDK from 'azure-devops-extension-sdk';
import {CommonServiceIds, IHostNavigationService} from 'azure-devops-extension-api';
import * as H from 'history';
import {stopSignalRConnection} from '../services/signalr';

export async function setupRouting(history: H.History) {
	const hostNavigationService = await SDK.getService<IHostNavigationService>(CommonServiceIds.HostNavigationService);

	history.listen(async location => {
		hostNavigationService.setHash(location.pathname);
	});

	let routeHash = await hostNavigationService.getHash();
	if (routeHash) {
		if (routeHash.includes('error')) {
			history.replace('/');
		} else {
			if (routeHash.includes('%')) {
				routeHash = decodeURIComponent(routeHash).replace('=', '');
			}
			history.replace(routeHash.substring(1));
		}
	}

	if (!routeHash) {
		hostNavigationService.replaceHash('/');
		history.replace('/');
	}

	history.listen(async location => {
		if (location.pathname === '/') {
			await stopSignalRConnection();
		}
	});

	hostNavigationService.onHashChanged(async (hash: string) => {
		if (!hash) {
			return;
		}

		const newLocation = hash ? hash.substring(1) : '';
		if (history.location.pathname !== newLocation) {
			history.replace(newLocation);
		}
	});
}
