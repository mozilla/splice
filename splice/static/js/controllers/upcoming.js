"use strict";

angular.module('spliceApp').controller('upcomingController', function($scope, $modal, spliceData, initData) {
  $scope.distributions = null;
  $scope.choices = [];
  $scope.channels = null;
  $scope.channelIndex = {};
  $scope.channelSelect = null;
  $scope.payloadSchema = null;
  $scope.cache = {};
  $scope.tiles = {};
  $scope.downloadInProgress = false;
  $scope.fileErrorMsg = null;
  $scope.previewModal = $modal({scope: $scope, template: "template/preview.html", show: false});

  $scope.setupChannels = function(chans) {
    $scope.channels = chans;
    for (var i = 0; i < chans.length; i++) {
      var chan = chans[i];
      $scope.channelIndex[chan.id] = chan;
    }
  };

  $scope.setupDistributions = function(dists) {
    var choices = [];
    $scope.distributions = dists;

    if ($scope.channelSelect != null) {
      // if already set, try to preserve the same selection
      // while the values are the same, it isn't the same object

      var oldId = $scope.channelSelect.id;
      $scope.channelSelect = null;

      for (var i = 0; i < $scope.channels.length; i++) {
        if (oldId == $scope.channels[i].id) {
          $scope.channelSelect = $scope.channels[i];
          break;
        }
      }
      // note that channelSelect could still be null after this
    }

    if ($scope.channelSelect == null) {
      $scope.channelSelect = $scope.channels[0];
    }

    if ($scope.channelSelect.id in dists) {
      $scope.choices = dists[$scope.channelSelect.id];
    }
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

  $scope.tilesEmpty = function() {
    /**
     * angular template expression test for empty tiles
     */
    return Object.keys($scope.tiles).length == 0;
  };

  $scope.previewDist = function(url) {
    $scope.openRemoteDistribution(url);
    $scope.previewModal.$promise.then($scope.previewModal.show);
  };

  $scope.unscheduleDist = function(url) {
    console.log("unschedule for " + url);
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
          $scope.fileErrorMsg = '<p>Could not download file at <a href="' + newValue.url + '">' + newValue.url + '</a></p>';
          $scope.fileErrorMsg += '<p>HTTP Error: ' + status + ' ' + statusText + '</p>';
          $scope.tiles = {};
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[cacheKey];
      $scope.source = {origin: url, type: 'remote'}
      $scope.fileErrorMsg = null;
    }
  };

  $scope.loadPayload = function(data, source, cacheKey) {
    /**
     * Validate and load tiles payload
     */
    var cacheKey = cacheKey || false;
    var results = tv4.validateResult(data, $scope.payloadSchema);

    if (results.valid) {
      if (cacheKey) {
        $scope.cache[cacheKey] = data;
        $scope.tiles = $scope.cache[cacheKey];
      }
      else {
        $scope.tiles = data;
      }
      $scope.source = source;
      $scope.fileErrorMsg = null;
    }
    else {
      $scope.fileErrorMsg = 'Validation failed: ' + results.error.message + ' at ' + results.error.dataPath;
      $scope.tiles = {};
    }
    return results.valid;
  };

  $scope.refreshDistributions = function() {
    spliceData.getDistributions()
      .success(function(data) {
        $scope.setupChannels(data.d.chans);
        $scope.setupDistributions(data.d.dists);
      });
  };

  $scope.init = function() {
    $scope.payloadSchema = initData.schema;
    $scope.setupChannels(initData.chans);
    $scope.setupDistributions(initData.dists);
    $scope.channelSelect = initData.chans[0];
  };
  $scope.init();
});
