import { combineReducers } from 'redux';
import { Authoring } from './Authoring.js';
import { WebtilesPreviewer } from './WebtilesPreviewer.js';

const rootReducer = combineReducers({
  Authoring,
  WebtilesPreviewer
});

export default rootReducer;
