import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import * as config from 'helpers/config';

export function finalCreateStore(reducer) {
  const loggerMiddleware = createLogger({
    level: 'info',
    collapsed: true
  });

  let result;
  if (config.get('DEVTOOLS') === true) {
    const { devTools } = require('redux-devtools');
    result = compose(
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      ),
      devTools()
    )(createStore);
  } else if (config.get('DEVTOOLS') === false && config.get('DEVELOPMENT') === true) {
    result = compose(
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      )
    )(createStore);
  } else {
    result = compose(
      applyMiddleware(
        thunkMiddleware
      )
    )(createStore);
  }
  return result(reducer);
}

