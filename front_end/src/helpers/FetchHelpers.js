/* eslint no-console:0 */

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
      dispatch(callback(json));
      resolve(json);
    }))
    .catch(function(e){
      dispatch(callback({}));
      console.log(e);
    });
}