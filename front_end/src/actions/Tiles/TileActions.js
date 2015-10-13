import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_CREATE_TILE = 'REQUEST_CREATE_TILE';
export const RECEIVE_CREATE_TILE = 'RECEIVE_CREATE_TILE';

export const REQUEST_UPDATE_TILE = 'REQUEST_UPDATE_TILE';
export const RECEIVE_UPDATE_TILE = 'RECEIVE_UPDATE_TILE';

export const REQUEST_TILES = 'REQUEST_TILES';
export const RECEIVE_TILES = 'RECEIVE_TILES';

export const REQUEST_TILE = 'REQUEST_TILE';
export const RECEIVE_TILE = 'RECEIVE_TILE';

export function requestCreateTile() {
  return {type: REQUEST_CREATE_TILE};
}

export function receiveCreateTile(json) {
  return {
    type: RECEIVE_CREATE_TILE,
    json: json
  };
}

export function requestUpdateTile() {
  return {type: REQUEST_UPDATE_TILE};
}

export function receiveUpdateTile(json) {
  return {
    type: RECEIVE_UPDATE_TILE,
    json: json
  };
}

export function requestTile() {
  return {type: REQUEST_TILE};
}
export function receiveTile(json) {
  return {
    type: RECEIVE_TILE,
    json: json
  };
}

export function requestTiles() {
  return {type: REQUEST_TILES};
}
export function receiveTiles(json) {
  return {
    type: RECEIVE_TILES,
    json: json
  };
}

export function createTile(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateTile());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/tiles', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveCreateTile(json));
        resolve(json);
      })
    );
  };
}

export function updateTile(tileId, data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestUpdateTile());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/tiles/' + tileId, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    })
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveUpdateTile(json));
        resolve(json);
      })
    );
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

export function fetchTiles(adGroupId = null) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestTiles());
    // Return a promise to wait for
    let params = '';
    if (adGroupId !== null) {
      params = '?adgroup_id=' + adGroupId;
    }

    return fetch(apiUrl + '/api/tiles' + params)
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveTiles(json));
        resolve();
      }));
  };
}