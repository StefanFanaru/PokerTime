import axios from 'axios';
import {parseISO} from 'date-fns';
import * as rax from './retry-axios';

function hideSpinner() {
	const spinner = document.getElementById('app-spinner');

	if (spinner) {
		spinner.style.opacity = '0';
	}
}

function showSpinner() {
	const spinner = document.getElementById('app-spinner');

	if (spinner) {
		spinner.style.opacity = '1';
	}
}

const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:[-+]\d{2}:?\d{2}|Z)?$/;

function isIsoDateString(value: any): boolean {
	return value && typeof value === 'string' && isoDateFormat.test(value);
}

export function handleDates(body: any) {
	if (body === null || body === undefined || typeof body !== 'object') return body;

	for (const key of Object.keys(body)) {
		const value = body[key];
		if (isIsoDateString(value)) body[key] = parseISO(value);
		else if (typeof value === 'object') handleDates(value);
	}
}

export const setupAxios = () => {
	rax.attach();

	axios.defaults.baseURL = process.env.API_URL;
	axios.defaults.timeout = process.env.ENVIRONMENT == 'local' ? 60000 : 10000;

	axios.interceptors.response.use(originalResponse => {
		handleDates(originalResponse.data);
		return originalResponse;
	});

	axios.interceptors.request.use(
		function (config) {
			// Do something before request is sent
			showSpinner();
			return config;
		},
		function (error) {
			// Do something with request error
			hideSpinner();
			console.error(error);
			return Promise.reject(error);
		}
	);

	// Add a response interceptor
	axios.interceptors.response.use(
		function (response) {
			// Any status code that lie within the range of 2xx cause this function to trigger
			hideSpinner();
			return response;
		},
		function (error) {
			// Any status codes that falls outside the range of 2xx cause this function to trigger
			hideSpinner();
			return Promise.reject(error);
		}
	);
};
