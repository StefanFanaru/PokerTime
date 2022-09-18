import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IHostPageLayoutService } from 'azure-devops-extension-api';

class FullScreenService {
	private static _sdkService: IHostPageLayoutService;

	private static _isFullScreen = false;

	static get isFullScreen() {
		return FullScreenService._isFullScreen;
	}

	static init() {
		return SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService).then(service => {
			this._sdkService = service;
			// service.setFullScreenMode(true)
			service.getFullScreenMode().then(x => (this._isFullScreen = x));
			return service;
		});
	}

	static set(isFullScreen: boolean) {
		if (this._isFullScreen == isFullScreen) {
			return;
		}
		this._sdkService.setFullScreenMode(isFullScreen);
		FullScreenService._isFullScreen = isFullScreen;
	}

	static toggle() {
		this.set(!this._isFullScreen);
	}
}

export default FullScreenService;
