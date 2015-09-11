import fetch from 'isomorphic-fetch';

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
		// (this is not required by thunk middleware, but it is convenient for us)
		//return fetch('http://localhost:9999/public/mock/account_' + accountId + '.json')
		return fetch('http://tbg-staging-1.thebuddygroup.com:5000/api/accounts/' + accountId)
			.then(response => response.json())
			.then(json => new Promise(resolve => {
				// We can dispatch many times!
				dispatch(receiveAccountView(json));
				resolve();
			}));
	};
}

export function fetchAccounts() {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAccounts());
		// Return a promise to wait for
		// (this is not required by thunk middleware, but it is convenient for us)
		//return fetch('http://localhost:9999/public/mock/accounts.json')
		return fetch('http://tbg-staging-1.thebuddygroup.com:5000/api/accounts')
			.then(response => response.json())
			.then(json => {
				// We can dispatch many times!
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
		// (this is not required by thunk middleware, but it is convenient for us)
		/*return fetch('http://localhost:9999/public/mock/accounts.json', {
		 method: 'post',
		 headers: {
		 'Accept': 'application/json',
		 'Content-Type': 'application/json'
		 },
		 body: JSON.stringify({
		 name: data.text
		 })
		 })*/
		return fetch('http://localhost:9999/public/mock/accounts.json')
			.then(response => response.json())
			.then(() =>
				// We can dispatch many times!
				setTimeout(() => {
					dispatch(receiveAddAccount({
						'created_at': '',
						'email': 'test@gmail.com',
						'id': 99,
						'name': data.text,
						'phone': '+1(888)0000000'
					}));
				}, 1000)
		);
	};
}
