"use strict";

angular.module('spliceApp').controller('mainController', function($scope) {
    $scope.resolveProgressIndicator = true;
    $scope.stateName = {};
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (toState.resolve) {
        $scope.resolveProgressIndicator = true;
      }
    });
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      if (toState.resolve) {
        $scope.resolveProgressIndicator = false;
        $scope.stateName = {};
        $scope.stateName[toState.name] = true;
      }
    });
});
