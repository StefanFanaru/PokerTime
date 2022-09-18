import * as SDK from 'azure-devops-extension-sdk';
import axios, { AxiosError } from 'axios';

class AuthService {
	constructor() {
	}

	async connect(): Promise<{ token: string | null; statusCode?: number }> {
		const accessToken = await SDK.getAccessToken();
		const appToken = await SDK.getAppToken();

		// console.log('getAccessToken', accessToken);
		// console.log('getAppToken', appToken);

		return await axios
			.get('/api/Connect/token', {
				headers: {
					Authorization: 'Bearer ' + appToken
				},
				params: {
					organizationName: SDK.getHost().name,
					accessToken: accessToken
				},
				raxConfig: {
					disableToaster: true
				}
			})
			.then(response => ({ token: response.data.token as string, statusCode: response.status }))
			.catch((error: AxiosError) => {
				return { token: null, statusCode: error?.response?.status };
			});
	}
}

export default AuthService;
