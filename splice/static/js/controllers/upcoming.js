"use strict";

angular.module('spliceApp').controller('upcomingController', function($controller, $scope, $modal, spliceData, initData) {
  $controller('distributionController', {$scope: $scope});

  $scope.unscheduleErrorMsg = null;
  $scope.previewModal = $modal({scope: $scope, template: "template/preview.html", show: false});

  /** UI and tile data **/

  $scope.previewDist = function(url) {
    $scope.openRemoteDistribution(url);
    $scope.previewModal.$promise.then($scope.previewModal.show);
  };

  $scope.unscheduleDist = function(id) {
    spliceData.unscheduleDistribution(id)
      .success(function(data) {
        $scope.refreshDistributions();
      })
      .error(function(data, status, headers, config, statusText) {
          $scope.unscheduleErrorMsg = '<p>Could not unschedule distribution ' + id + '</p>';
          $scope.unscheduleErrorMsg += '<p>HTTP Error: ' + status + ' ' + statusText + '</p>';
          $scope.unscheduleErrorMsg += '<p>HTTP Error: ' + status + ' ' + statusText + '</p>';
          if (data && data.message) {
            $scope.unscheduleErrorMsg += '<p>' + data.message + '</p>';
          }
      });
  };

  $scope.openRemoteDistribution = function(url) {
    /**
     * Open a distribution file given a URL
     */
    var chanId = $scope.channelSelect;
    var cacheKey = chanId + url;

    if (!$scope.cache.hasOwnProperty(cacheKey)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON(url)
        .success(function(data) {
          if (data != null && data instanceof Object) {
            $scope.loadPayload(data, {origin: url, type: 'remote'}, cacheKey);
          }
          else {
            $scope.fileErrorMsg = 'Invalid file at <a href="' + newValue.url + '">' + newValue.url + '</a>';
            $scope.tiles = {};
          }
          $scope.downloadInProgress = false;
        })
        .error(function(data, status, headers, config, statusText) {
          console.log("download failed");
          $scope.fileErrorMsg = '<p>Could not download file at <a href="' + newValue.url + '">' + newValue.url + '</a></p>';
          $scope.fileErrorMsg += '<p>HTTP Error: ' + status + ' ' + statusText + '</p>';
          $scope.tiles = {};
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[cacheKey];
      $scope.fileErrorMsg = null;
    }
  };

  $scope.refreshDistributions = function() {
    spliceData.getUpcomingDistributions()
      .success(function(data) {
        $scope.setupChannels(data.d.chans);
        $scope.setupDistributions(data.d.dists);
      });
  };

  $scope.$watch('channelSelect', function(newValue, oldValue) {
    /**
     * Event handler for Channel selection
     */
    if (newValue == null) {
      return;
    }

    $scope.downloadInProgress = false;
    $scope.tiles = [];
    $scope.choices = $scope.distributions[newValue.id];
  });

  $scope.init(initData);
});
