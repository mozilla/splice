import fetch from 'isomorphic-fetch';
import * as config from 'helpers/config';

const apiUrl = config.get('API_URL');

export const REQUEST_INIT = 'REQUEST_INIT';
export const RECEIVE_INIT = 'RECEIVE_INIT';

export function requestInit() {
  return {type: REQUEST_INIT};
}

export function receiveInit(json) {
  return {
    type: RECEIVE_INIT,
    json: json
  };
}

export function fetchInit() {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestInit());
    // Return a promise to wait for
    return fetch(apiUrl + '/api/init/all')
      .then(response => response.json())
      .then(json => new Promise(resolve => {
        dispatch(receiveInit(json));
        resolve();
      })
    );
  };
}

export function getChannel(id, rows){
  return rows.find(row => row.id === id);
}

export function getCountry(id, rows){
  return rows.find(row => row.country_code === id);
}

