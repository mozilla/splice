import { FILE_UPLOADED,
  LIST_TYPE_SELECT
} from 'actions/App/AppActions';

import { GET_RECENTLY_VIEWED } from 'actions/App/RecentlyViewedActions';

const initialState = {
  recentlyViewed: [],
  files: null,
  listType: 'accounts'
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
    case LIST_TYPE_SELECT:
      return _.assign({}, state, {
        listType: action.value
      });
    default:
      return state;
  }
}
