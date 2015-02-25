"use strict";

(function() {
  angular.module('spliceApp').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/authoring/');

    $stateProvider
      .state('authoring', {
        url: '/authoring/',
        templateUrl: '/static/html/partials/authoring.html',
        resolve: {
          initData: function(spliceData) {
            return spliceData.getAuthoringInitialData()
              .then(function(data) {
                return data.data.d;
              });
          }
        },
        controller: 'authoringController'
      })
      .state('upcoming', {
        url: '/upcoming/',
        templateUrl: '/static/html/partials/upcoming.html',
        resolve: {
          initData: function(spliceData) {
            return spliceData.getUpcomingInitialData()
              .then(function(data) {
                return data.data.d;
              });
          }
        },
        controller: 'upcomingController'
      })
  });
})();
