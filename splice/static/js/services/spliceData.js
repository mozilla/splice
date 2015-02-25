"use strict";

(function() {
  angular.module('spliceApp').service("spliceData", function($http) {
    this.postTiles = function(data, channelId, deployConfig) {
      var csrfToken = document.querySelector('meta[name=csrf-token]').attributes['content'].value;

      var deployParam = 0;
      if (deployConfig.now) {
        deployParam = 1;
      }

      var scheduledTS = null;
      if (deployConfig.scheduled) {
        // timestamp in seconds
        scheduledTS = deployConfig.scheduled.getTime() / 1000 | 0;
      }

      return $http({
        method: 'POST',
        url: "/api/authoring/all_tiles",
        data: data,
        params: {'deploy': deployParam, 'channelId': channelId, 'scheduledTS': scheduledTS},
        headers: {'X-CSRFToken': csrfToken}
      });
    };

    this.getDistributions = function(limit) {
      return $http({
        method: 'GET',
        params: {limit: limit},
        url: '/api/authoring/distributions'
      });
    };

    this.getUpcomingDistributions = function(limit) {
      return $http({
        method: 'GET',
        params: {limit: limit},
        url: '/api/upcoming/distributions'
      });
    };

    this.getAuthoringInitialData = function() {
      return $http({
        method: 'GET',
        url: '/api/authoring/init_data',
      });
    };

    this.getUpcomingInitialData = function() {
      return $http({
        method: 'GET',
        url: '/api/upcoming/init_data',
      });
    };

    this.unscheduleDistribution = function(distId) {
      var csrfToken = document.querySelector('meta[name=csrf-token]').attributes['content'].value;
      return $http({
        method: 'POST',
        url: '/api/upcoming/unschedule',
        params: {'distId': distId},
        headers: {'X-CSRFToken': csrfToken}
      });
    };

    this.getJSON = function(url) {
      return $http({
        method: 'GET',
        url: url,
      });
    };
  });
})();
