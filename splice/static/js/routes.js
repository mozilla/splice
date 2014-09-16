"use strict";

(function() {
  angular.module('spliceApp').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/authoring/all_tiles');

    $stateProvider
      .state('authoring', {
        url: '/authoring/all_tiles',
        templateUrl: '/static/html/partials/authoring.html',
        resolve: {
          payloadSchema: function(spliceData){
            return spliceData.getSchema()
              .then(function(data) {
                return data.data;
              });
          }
        },
        controller: 'authoringController'
      })
  });
})();
