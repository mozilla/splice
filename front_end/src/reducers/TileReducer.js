import {
  REQUEST_CREATE_TILE,
  RECEIVE_CREATE_TILE,
  REQUEST_UPDATE_TILE,
  RECEIVE_UPDATE_TILE,
  REQUEST_TILES,
  RECEIVE_TILES,
  REQUEST_TILE,
  RECEIVE_TILE
} from 'actions/Tiles/TileActions';

const initialState = {
  rows: [],
  details: {},
  isSaving: false,
  isFetching: false
};

export function Tile(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_CREATE_TILE:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_CREATE_TILE:
      let rows = state.rows;
      if(action.json.result !== null){
        rows = [action.json.result, ...state.rows];
      }
      return _.assign({}, state, {
        rows: rows,
        isSaving: false
      });
    case REQUEST_UPDATE_TILE:
      return _.assign({}, state, {
        isSaving: true
      });
    case RECEIVE_UPDATE_TILE:
      let details = state.details;
      if(action.json.result !== null){
        details = action.json.result;
      }
      return _.assign({}, state, {
        details: details,
        isSaving: false
      });
    case REQUEST_TILES:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_TILES:
      return _.assign({}, state, {
        rows: action.json.results,
        isFetching: false
      });
    case REQUEST_TILE:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_TILE:
      return _.assign({}, state, {
        details: action.json.result,
        isFetching: false
      });
    default:
      return state;
  }
}
