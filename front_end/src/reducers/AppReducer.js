import {
  DISPLAY_MESSAGE,
  SHOWN_MESSAGE,
  REMOVE_MESSAGE,
  SET_LIST_TYPE,
  SET_LIST_DATE_RANGE,
  FORM_CHANGED,
  FORM_SAVED,
  GET_LOCATION_LOG,
  SAVE_LOCATION_LOG
} from 'actions/App/AppActions';

import { GET_RECENTLY_VIEWED } from 'actions/App/RecentlyViewedActions';

const initialState = {
  recentlyViewed: [],
  locationLog: [],
  listType: 'accounts',
  listDateRange: '30days',
  message: {
    display: false,
    type: '',
    body: '',
    shown: false
  },
  formChanged: false
};

export function App(state = initialState, action = null) {
  switch (action.type) {
    case DISPLAY_MESSAGE:
      return _.assign({}, state, {
        message: {
          display: true,
          type: action.messageType,
          body: action.messageBody,
          shown: false
        }
      });
    case SHOWN_MESSAGE:
      return _.assign({}, state, {
        message: {
          display: state.message.display,
          type: state.message.type,
          body: state.message.body,
          shown: true
        }
      });
    case REMOVE_MESSAGE:
      return _.assign({}, state, {
        message: {
          display: false,
          type: '',
          body: '',
          shown: false
        }
      });
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
    case SET_LIST_TYPE:
      return _.assign({}, state, {
        listType: action.value
      });
    case SET_LIST_DATE_RANGE:
      return _.assign({}, state, {
        listDateRange: action.value
      });
    case FORM_CHANGED:
      return _.assign({}, state, {
        formChanged: true
      });
    case FORM_SAVED:
      return _.assign({}, state, {
        formChanged: false
      });
    case SAVE_LOCATION_LOG:
      return _.assign({}, state, {
        locationLog: action.log
      });
    default:
      return state;
  }
}
