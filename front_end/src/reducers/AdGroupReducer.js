import {
	REQUEST_ADD_ADGROUP,
	RECEIVE_ADD_ADGROUP,
	REQUEST_ADGROUPS,
	RECEIVE_ADGROUPS,
	REQUEST_ADGROUP,
	RECEIVE_ADGROUP
} from 'actions/AdGroups/AdGroupActions';

const initialState = {
	rows: [],
	details: [],
	isSaving: false,
	isFetching: false
};

export function AdGroup(state = initialState, action = null) {
	switch (action.type) {
		case REQUEST_ADD_ADGROUP:
			return _.assign({}, state, {
				isSaving: true
			});
		case RECEIVE_ADD_ADGROUP:
			return _.assign({}, state, {
				rows: [...state.rows, action.json],
				isSaving: false
			});
		case REQUEST_ADGROUPS:
			return _.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_ADGROUPS:
			return _.assign({}, state, {
				rows: action.rows,
				isFetching: false
			});
		case REQUEST_ADGROUP:
			return _.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_ADGROUP:
			return _.assign({}, state, {
				details: action.details,
				isFetching: false
			});
		default:
			return state;
	}
}
