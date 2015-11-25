import {
  REQUEST_CREATE_TILE,
  RECEIVE_CREATE_TILE,
  REQUEST_UPDATE_TILE,
  RECEIVE_UPDATE_TILE,
  REQUEST_ENHANCED_IMAGE_UPLOAD,
  RECEIVE_ENHANCED_IMAGE_UPLOAD,
  REQUEST_IMAGE_UPLOAD,
  RECEIVE_IMAGE_UPLOAD,
  REQUEST_TILES,
  RECEIVE_TILES,
  REQUEST_TILE,
  RECEIVE_TILE,
  TILE_SET_DETAILS_VAR
} from 'actions/Tiles/TileActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false,
  isUploadingEnhancedImage: false,
  isUploadingImage: false
};

export function Tile(state = initialState, action = null) {
  let data;
  switch (action.type) {
    case TILE_SET_DETAILS_VAR:
      return _.assign({}, state, {
        details: _.assign({}, state.details, {
          [action.variable]: action.value
        })
      });
    case REQUEST_CREATE_TILE:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_TILE:
      data = state.rows;
      if(action.json.result !== undefined){
        data = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: data,
        isSaving: false
      });
    case REQUEST_UPDATE_TILE:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_TILE:
      data = state.details;
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isSaving: false
      });
    case REQUEST_ENHANCED_IMAGE_UPLOAD:
      return _.assign({}, state, {
        isUploadingEnhancedImage: true
      });
    case RECEIVE_ENHANCED_IMAGE_UPLOAD:
      return _.assign({}, state, {
        isUploadingEnhancedImage: false
      });
    case REQUEST_IMAGE_UPLOAD:
      return _.assign({}, state, {
        isUploadingImage: true
      });
    case RECEIVE_IMAGE_UPLOAD:
      return _.assign({}, state, {
        isUploadingImage: false
      });
    case REQUEST_TILES:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_TILES:
      data = [];
      if(action.json.results !== undefined){
        data = action.json.results;
      }
      return _.assign({}, state, {
        rows: data,
        isFetching: false
      });
    case REQUEST_TILE:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_TILE:
      data = {};
      if(action.json.result !== undefined){
        data = action.json.result;
      }
      return _.assign({}, state, {
        details: data,
        isFetching: false
      });
    default:
      return state;
  }
}
