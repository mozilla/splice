"use strict";

(function() {
  angular.module('spliceApp').service("spliceData", function($http) {
    this.postTiles = function(data, deploy) {
      var csrfToken = document.querySelector('meta[name=csrf-token]').attributes['content'].value;

      return $http({
        method: 'POST',
        url: "/api/authoring/all_tiles",
        data: data,
        params: {'deploy': deploy},
        headers: {'X-CSRFToken': csrfToken}
      });
    };

    this.getDistributions = function() {
      return $http({
        method: 'GET',
        url: '/api/authoring/distributions',
      });
    };

    this.getJSON = function(url) {
      return $http({
        method: 'GET',
        url: url,
      });
    };

    this.getSchema = function() {
      return $http({
        method: 'GET',
        url: '/api/authoring/payload_schema',
      });
    };
  });
})();
