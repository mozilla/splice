import fetch from 'isomorphic-fetch';

let apiUrl;
if (typeof __DEVELOPMENT__ !== 'undefined' && __DEVELOPMENT__ === true) {
  apiUrl = __DEVAPI__;
} else {
  apiUrl = __LIVEAPI__;
}

export const REQUEST_CREATE_TILE = 'REQUEST_CREATE_TILE';
export const RECEIVE_CREATE_TILE = 'RECEIVE_CREATE_TILE';

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

export function requestTile() {
  return {type: REQUEST_TILE};
}
export function receiveTile(json) {
  return {
    type: RECEIVE_TILE,
    details: json
  };
}

export function requestTiles() {
  return {type: REQUEST_TILES};
}
export function receiveTiles(json) {
  return {
    type: RECEIVE_TILES,
    rows: json
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
        dispatch(receiveTile(json.result));
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
      .then(json => {
        dispatch(receiveTiles(json.results));
      }
    );
  };
}

export function saveTile(data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestCreateTile());
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
     dispatch(receiveCreateAccount({
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
          dispatch(receiveCreateTile({
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
