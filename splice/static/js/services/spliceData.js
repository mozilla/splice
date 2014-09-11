"use strict";

(function() {
  angular.module('spliceApp').service("spliceData", function($http) {
    this.postTiles = function(data) {
      var csrfToken = document.querySelector('meta[name=csrf-token]').attributes['content'].value;

      return $http({
        method: 'POST',
        url: "/api/authoring/all_tiles",
        data: data,
        headers: {'X-CSRFToken': csrfToken}
      });
    }
  });
})();
