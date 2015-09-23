import {
	REQUEST_ADD_TILE,
	RECEIVE_ADD_TILE,
	REQUEST_TILES,
	RECEIVE_TILES,
	REQUEST_TILE,
	RECEIVE_TILE
} from 'actions/Tiles/TileActions';

const initialState = {
	rows: [],
	details: [],
	isSaving: false,
	isFetching: false
};

export function Tile(state = initialState, action = null) {
	switch (action.type) {
		case REQUEST_ADD_TILE:
			return _.assign({}, state, {
				isSaving: true
			});
		case RECEIVE_ADD_TILE:
			return _.assign({}, state, {
				rows: [...state.rows, action.json],
				isSaving: false
			});
		case REQUEST_TILES:
			return _.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_TILES:
			return _.assign({}, state, {
				rows: action.rows,
				isFetching: false
			});
		case REQUEST_TILE:
			return _.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_TILE:
			return _.assign({}, state, {
				details: action.details,
				isFetching: false
			});
		default:
			return state;
	}
}
