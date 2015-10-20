import { combineReducers } from 'redux';
import { Authoring } from './Authoring.js';
import { Upcoming } from './Upcoming.js';
import { WebtilesPreviewer } from './WebtilesPreviewer.js';

const rootReducer = combineReducers({
  Authoring,
  Upcoming,
  WebtilesPreviewer
});

export default rootReducer;
