"use strict";

(function() {
  angular.module('spliceApp').directive("tilesToggle", function(){

    return {
      restrict: 'E',
      templateUrl: '/static/html/partials/tiles_toggle.html'
    };
  });
})();
