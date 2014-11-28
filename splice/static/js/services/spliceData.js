"use strict";

(function() {
  angular.module('spliceApp').service("spliceData", function($http) {
    this.postTiles = function(data, deploy, channelId) {
      var csrfToken = document.querySelector('meta[name=csrf-token]').attributes['content'].value;

      var deployParam = 0;
      if (deploy) {
        deployParam = 1;
      }

      return $http({
        method: 'POST',
        url: "/api/authoring/all_tiles",
        data: data,
        params: {'deploy': deployParam, 'channelId': channelId},
        headers: {'X-CSRFToken': csrfToken}
      });
    };

    this.getDistributions = function(limit) {
      var config = {
        method: 'GET',
        params: {limit: limit},
        url: '/api/authoring/distributions',
      };

      return $http(config);
    };

    this.getChannels = function(limit) {
      return $http({
        method: 'GET',
        params: {limit: limit},
        url: '/api/authoring/channels',
      });
    };

    this.getInitialData = function() {
      return $http({
        method: 'GET',
        url: '/api/authoring/init_data',
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
