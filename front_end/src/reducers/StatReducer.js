import {
  REQUEST_STATS,
  RECEIVE_STATS
} from 'actions/Stats/StatsActions';

const initialState = {
  rows: [],
  query: {},
  isFetching: false
};

export function Stat(state = initialState, action = null) {
  switch (action.type) {
    case REQUEST_STATS:
      return _.assign({}, state, {
        isFetching: true
      });
    case RECEIVE_STATS:
      return _.assign({}, state, {
        rows: action.json.results,
        query: action.query,
        isFetching: false
      });
    default:
      return state;
  }
}
