import _ from 'lodash';

import {
	GET_RECENTLY_VIEWED,
	FILE_UPLOADED
} from 'actions/AppActions';

const initialState = {
	recentlyViewed: [],
	files: null
};

export function App(state = initialState, action = null) {
	switch (action.type) {
		case GET_RECENTLY_VIEWED:
			let result;
			if (_.isEmpty(action.recentlyViewed)) {
				result = [];
			} else {
				result = action.recentlyViewed;
			}
			return _.assign({}, state, {
				recentlyViewed: result
			});
		case FILE_UPLOADED:
			return _.assign({}, state, {
				files: action.files
			});
		default:
			return state;
	}
}
