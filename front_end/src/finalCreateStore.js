import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

export function finalCreateStore(reducer) {
  const loggerMiddleware = createLogger({
    level: 'info',
    collapsed: true
  });

  let result;
  if (typeof __DEVTOOLS__ !== 'undefined' && __DEVTOOLS__ === true) {
    const { devTools } = require('redux-devtools');
    result = compose(
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      ),
      devTools()
    )(createStore);
  } else if ((typeof __DEVTOOLS__ === 'undefined' || __DEVTOOLS__ === false) &&
    (typeof __DEVELOPMENT__ !== 'undefined' || __DEVELOPMENT__ === true)) {
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

