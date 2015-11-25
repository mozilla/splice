import fetch from 'isomorphic-fetch';
import { fetchHelper } from 'helpers/FetchHelpers';
import * as config from 'helpers/config';

const apiUrl = config.get('API_URL');

export const REQUEST_CREATE_TILE = 'REQUEST_CREATE_TILE';
export const RECEIVE_CREATE_TILE = 'RECEIVE_CREATE_TILE';

export const REQUEST_UPDATE_TILE = 'REQUEST_UPDATE_TILE';
export const RECEIVE_UPDATE_TILE = 'RECEIVE_UPDATE_TILE';

export const REQUEST_ENHANCED_IMAGE_UPLOAD = 'REQUEST_ENHANCED_IMAGE_UPLOAD';
export const RECEIVE_ENHANCED_IMAGE_UPLOAD = 'RECEIVE_ENHANCED_IMAGE_UPLOAD';

export const REQUEST_IMAGE_UPLOAD = 'REQUEST_IMAGE_UPLOAD';
export const RECEIVE_IMAGE_UPLOAD = 'RECEIVE_IMAGE_UPLOAD';

export const REQUEST_TILES = 'REQUEST_TILES';
export const RECEIVE_TILES = 'RECEIVE_TILES';

export const REQUEST_TILE = 'REQUEST_TILE';
export const RECEIVE_TILE = 'RECEIVE_TILE';

export const TILE_SET_DETAILS_VAR = 'TILE_SET_DETAILS_VAR';

export function tileSetDetailsVar(variable, value){
  return {type: TILE_SET_DETAILS_VAR, variable: variable, value: value};
}

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

export function requestImageUpload() {
  return {
    type: REQUEST_IMAGE_UPLOAD
  };
}

export function receiveImageUpload(json) {
  return {
    type: RECEIVE_IMAGE_UPLOAD,
    json: json
  };
}

export function requestEnhancedImageUpload() {
  return {
    type: REQUEST_ENHANCED_IMAGE_UPLOAD
  };
}

export function receiveEnhancedImageUpload(json) {
  return {
    type: RECEIVE_ENHANCED_IMAGE_UPLOAD,
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
    const url = apiUrl + '/api/tiles';
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveCreateTile, dispatch);
  };
}

export function updateTile(tileId, data) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestUpdateTile());
    // Return a promise to wait for
    const url = apiUrl + '/api/tiles/' + tileId;
    const options = {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveUpdateTile, dispatch);
  };
}

export function uploadEnhancedImage(data){
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestEnhancedImageUpload());
    // Return a promise to wait for
    const url = apiUrl + '/api/tiles/creative/upload';
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveEnhancedImageUpload, dispatch);
  };
}

export function uploadImage(data){
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestImageUpload());
    // Return a promise to wait for
    const url = apiUrl + '/api/tiles/creative/upload';
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json'
      },
      body: data
    };
    return fetchHelper(url, options, receiveImageUpload, dispatch);
  };
}

export function fetchTile(tileId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestTile());
    // Return a promise to wait for
    const url = apiUrl + '/api/tiles/' + tileId;
    return fetchHelper(url, null, receiveTile, dispatch);
  };
}

export function fetchTiles(adGroupId) {
  // thunk middleware knows how to handle functions
  return function next(dispatch) {
    dispatch(requestTiles());
    // Return a promise to wait for
    const url = apiUrl + '/api/tiles?adgroup_id=' + adGroupId;
    return fetchHelper(url, null, receiveTiles, dispatch);
  };
}
