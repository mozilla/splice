/* eslint no-console:0 */

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import fetch from 'isomorphic-fetch';

export function fetchHelper(url, options, callback, dispatch){
  return fetch(url, options)
    .then(function(response) {
      let json;
      if (response.status > 400) {
        console.log(response);
      }
      else{
        json = response.json();
      }

      return json;
    })
    .then(json => new Promise(resolve => {
      if(json !== undefined){
        dispatch(callback(json));
      }
      else{
        dispatch(callback({}));
      }
      resolve(json);
    }))
    .catch(function(e){
      dispatch(callback({}));
      dispatch(displayMessage('error', 'API error, the service could be offline. Please contact the system administrator') );
      dispatch(shownMessage());

      console.log(e);
    });
}