import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
	apiUrl = __DEVAPI__;
} else {
	apiUrl = __LIVEAPI__;
}

export const REQUEST_ADD_TILE = 'REQUEST_ADD_TILE';
export const RECEIVE_ADD_TILE = 'RECEIVE_ADD_TILE';

export const REQUEST_TILES = 'REQUEST_TILES';
export const RECEIVE_TILES = 'RECEIVE_TILES';

export const REQUEST_TILE = 'REQUEST_TILE';
export const RECEIVE_TILE = 'RECEIVE_TILE';

export function requestAddTile() {
	return {type: REQUEST_ADD_TILE};
}

export function receiveAddTile(json) {
	return {type: RECEIVE_ADD_TILE, json};
}

export function requestTiles() {
	return {type: REQUEST_TILES};
}
export function receiveTiles(json) {
	let rows = [];
	if(json.results !== undefined){
		rows = json.results;
	}

	return {
		type: RECEIVE_TILES,
		rows: rows
	};
}

export function requestTile() {
	return {type: REQUEST_TILE};
}
export function receiveTile(json) {
	return {
		type: RECEIVE_TILE,
		details: json.result
	};
}

export function fetchTile(tileId) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestTile());
		// Return a promise to wait for
		return fetch(apiUrl + '/api/tiles/' + tileId)
			.then(response => response.json())
			.then(json => new Promise(resolve => {
				dispatch(receiveTile(json));
				resolve();
			}));
	};
}

export function fetchTiles(id = null) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestTiles());
		// Return a promise to wait for
		let params = '';
		if(id !== null){
			params = '?adgroup_id=' + id;
		}

		return fetch(apiUrl + '/api/tiles' + params)
			.then(response => response.json())
			.then(json => {
				dispatch(receiveTiles(json));
			}
		);
	};
}

export function saveTile(data) {
	// thunk middleware knows how to handle functions
	return function next(dispatch) {
		dispatch(requestAddTile());
		// Return a promise to wait for
		/*return fetch(apiUrl + '/api/tiles', {
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
		return fetch('http://localhost:9999/public/mock/tiles.json')
			.then(response => response.json())
			.then(() =>
				setTimeout(() => {
					dispatch(receiveAddTile({
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
