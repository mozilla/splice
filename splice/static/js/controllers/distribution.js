"use strict";

angular.module('spliceApp').controller('distributionController', function($scope, spliceData, fileReader) {

  $scope.env = {
    prod: false,
    stage: false,
    dev: false,
    test: false,
  };
  $scope.distributions = null;
  $scope.channels = null;
  $scope.channelIndex = {};
  $scope.choices = [];
  $scope.payloadSchema = null;
  $scope.channelSelect = null;
  $scope.fileErrorMsg = null;
  $scope.initErrorMsg = null;
  $scope.cache = {};
  $scope.tiles = {};
  $scope.downloadInProgress = false;

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

  $scope.tilesEmpty = function() {
    /**
     * angular template expression test for empty tiles
     */
    return Object.keys($scope.tiles).length == 0;
  };

  $scope.loadPayload = function(data, source, cacheKey) {
    /**
     * Validate and load tiles payload
     */
    var cacheKey = cacheKey || false;
    var payloadSchema, distributions, assets;

    if (data.hasOwnProperty("assets")) {
        payloadSchema = $scope.payloadSchema.compact;
        distributions = data.distributions;
        assets = data.assets;
    } else {
        payloadSchema = $scope.payloadSchema.default;
        distributions = data;
        assets = {};
    }
    var results = tv4.validateResult(data, payloadSchema);

    if (results.valid) {
      if (cacheKey) {
        $scope.cache[cacheKey] = $scope.separateTilesTypes(distributions, assets);
        $scope.tiles = $scope.cache[cacheKey];
      } else {
        $scope.tiles = $scope.separateTilesTypes(distributions, assets);
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

  $scope.separateTilesTypes = function(data, assets) {
    /**
     * Separate Tiles types from a list of tiles in 2 groups:
     * adgroups and default
     */
    var output = {raw: data, ui: {}};
    for (var locale in output.raw) {
      var tiles = data[locale];

      output.ui[locale] = {
        frecentSites: {},
        defaultTiles: [],
        frecentCount: 0,
        defaultCount: 0,
      };

      for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];

        // populate the imageURI and enhancedImageURI if tile is in compact format
        if (tile.hasOwnProperty("imageURI") && assets.hasOwnProperty(tile.imageURI)) {
          tile.imageURI = assets[tile.imageURI];
        }
        if (tile.hasOwnProperty("enhancedImageURI") && assets.hasOwnProperty(tile.enhancedImageURI)) {
          tile.enhancedImageURI = assets[tile.enhancedImageURI];
        }
        if (tile.frecent_sites) {
          tile.frecent_sites.sort();
          var label = JSON.stringify(tile.frecent_sites);
          if (!output.ui[locale].frecentSites[label]) {
            output.ui[locale].frecentSites[label] = [];
          }
          output.ui[locale].frecentSites[label].push(tile);
          output.ui[locale].frecentCount += 1;
        }
        else {
          output.ui[locale].defaultTiles.push(tile);
          output.ui[locale].defaultCount += 1;
        }
      }
    }

    return output;
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
        })
        .error(function(data, status, headers, config, statusText) {
          $scope.fileErrorMsg = '<p>Could not download file at <a href="' + newValue.url + '">' + newValue.url + '</a></p>';
          $scope.fileErrorMsg += '<p>HTTP Error: ' + status + ' ' + statusText + '</p>';
          $scope.tiles = {};
        })
        .finally(function() {
            $scope.downloadInProgress = false;
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[cacheKey];
      $scope.fileErrorMsg = null;
    }
  };

  $scope.init = function(initData) {
    if (initData.hasOwnProperty('chans') && initData.chans.length > 0) {
      $scope.env.prod = initData.env == 'prod';
      $scope.env.stage = initData.env == 'stage';
      $scope.env.dev = initData.env == 'dev';
      $scope.env.test = initData.env == 'test';

      $scope.channelSelect = initData.chans[0];
      $scope.payloadSchema = initData.schema;
      $scope.setupChannels(initData.chans);
      $scope.setupDistributions(initData.dists);
    }
    else {
      $scope.initErrorMsg = 'Error: Cannot continue. No channel provided in data payload.';
    }
  };
});
