"use strict";

(function() {
  angular.module('spliceApp').directive("spliceEnvironment", function(){

    return {
      restrict: 'E',
      templateUrl: '/static/html/partials/splice_environment.html'
    };
  });
})();
