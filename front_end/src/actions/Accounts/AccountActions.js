import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
	apiUrl = __DEVAPI__;
} else {
	apiUrl = __LIVEAPI__;
}

export const REQUEST_ADD_ACCOUNT = 'REQUEST_ADD_ACCOUNT';
export const RECEIVE_ADD_ACCOUNT = 'RECEIVE_ADD_ACCOUNT';

export const REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS';
export const RECEIVE_ACCOUNTS = 'RECEIVE_ACCOUNTS';

export const REQUEST_ACCOUNT_VIEW = 'REQUEST_ACCOUNT_VIEW';
export const RECEIVE_ACCOUNT_VIEW = 'RECEIVE_ACCOUNT_VIEW';

function requestAddAccount() {
	return {type: REQUEST_ADD_ACCOUNT};
}

function receiveAddAccount(json) {
	return {type: RECEIVE_ADD_ACCOUNT, json};
}

function requestAccounts() {
	return {type: REQUEST_ACCOUNTS};
}
function receiveAccounts(json) {
	return {
		type: RECEIVE_ACCOUNTS,
		accountRows: json.results
	};
}

function requestAccountView() {
	return {type: REQUEST_ACCOUNT_VIEW};
}
function receiveAccountView(json) {
	return {
		type: RECEIVE_ACCOUNT_VIEW,
		accountDetails: json.result
	};
}

export function fetchAccountView(accountId) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAccountView());
		// Return a promise to wait for
		//return fetch('http://localhost:9999/public/mock/account_' + accountId + '.json')
		return fetch(apiUrl + '/api/accounts/' + accountId)
			.then(response => response.json())
			.then(json => new Promise(resolve => {
				dispatch(receiveAccountView(json));
				resolve();
				})
			);
	};
}

export function fetchAccounts() {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAccounts());
		// Return a promise to wait for
		//return fetch('http://localhost:9999/public/mock/accounts.json')
		return fetch(apiUrl + '/api/accounts')
			.then(response => response.json())
			.then(json => {
					dispatch(receiveAccounts(json));
				}
			);
	};
}

export function saveAccount(data) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAddAccount());
		// Return a promise to wait for
		/*return fetch('http://localhost:9999/public/mock/accounts.json', {
			method: 'post',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: data.text
			})
		}).then(response => response.json())
			.then((json) => {
				dispatch(receiveAddAccount({
					'created_at': '',
					'email': 'test@gmail.com',
					'id': 99,
					'name': data.text,
					'phone': '+1(888)0000000'
				}));
			});*/

		return fetch('http://localhost:9999/public/mock/accounts.json')
			.then(response => response.json())
			.then(() => {
				setTimeout(() => {
					dispatch(receiveAddAccount({
						'created_at': '',
						'email': 'test@gmail.com',
						'id': 99,
						'name': data.text,
						'phone': '+1(888)0000000'
					}));
				}, 1000);
			}
		);
	};
}
