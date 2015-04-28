"use strict";

(function() {
  angular.module('spliceApp').directive("tilesList", function(){

    return {
      restrict: 'E',
      scope: {
        tiles: '=data'
      },
      templateUrl: '/static/html/partials/tiles_list.html'
    };
  });
})();

