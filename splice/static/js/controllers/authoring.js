"use strict";

angular.module('spliceApp').controller('authoringController', function($scope, spliceData, fileReader, initData) {

  /** Distribution select/choice setup **/

  $scope.distributions = null;
  $scope.channels = null;
  $scope.channelIndex = {};
  $scope.choices = [];
  $scope.source = {};
  $scope.deployFlag = false;

  $scope.setupChannels = function(chans) {
    $scope.channels = chans;
    for (var i=0; i < chans.length; i++) {
      var chan = chans[i];
      $scope.channelIndex[chan.id] = chan;
    }
  };

  $scope.setupDistributions = function(dists) {
    var choices = [];
    $scope.distributions = dists;

    if ($scope.channelSelect in dists) {
      $scope.choices = dists[$scope.channelSelect];
    }
  };

  $scope.refreshDistributions = function() {
    spliceData.getDistributions()
      .success(function(data) {
        $scope.setupChannels(data.d.chans);
        $scope.setupDistributions(data.d.dists);
      });
  };

  /** UI and tile data **/

  /**
   * Alerts is expected to be an array,
   * even though we only show 1 alert at a time.
   * This is due to how ui-bootstrap works
   */
  $scope.alerts = [];
  $scope.cache = {};
  $scope.tiles = {};
  $scope.downloadInProgress = false;
  $scope.versionSelect = null;
  $scope.channelSelect = null;

  $scope.loadPayload = function(data, source, cacheValue) {
    /**
     * Validate and load tiles payload
     */
    var cacheValue = cacheValue || false;
    var results = tv4.validateResult(data, $scope.payloadSchema);

    if (results.valid) {
      if (cacheValue) {
        $scope.cache[cacheValue] = data;
        $scope.tiles = $scope.cache[cacheValue];
      }
      else {
        $scope.tiles = data;
      }
      $scope.source = source;
      $scope.alerts = [];
    }
    else {
      $scope.alerts = [{
        type: 'danger',
        msg: '<strong>Error</strong>: Validation failed: ' + results.error.message + ' at ' + results.error.dataPath,
      }];
      $scope.tiles = {};
    }
    return results.valid;
  };

  $scope.tilesEmpty = function() {
    /**
     * angular template expression test for empty tiles
     */
    return Object.keys($scope.tiles).length == 0;
  };

  $scope.$watch('channelSelect', function(newValue, oldValue) {
    /**
     * Event handler for Channel selection
     */
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;

    $scope.downloadInProgress = false;
    $scope.tiles = [];
    $scope.source = {};
    $scope.choices = $scope.distributions[newValue];
    $scope.versionSelect = null;
  });

  $scope.$watch('versionSelect', function(newValue, oldValue) {
    /**
     * Event handler for Distribution selection
     */
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;
    var chanId = $scope.channelSelect;
    var cacheValue = chanId + newValue;

    if (!$scope.cache.hasOwnProperty(cacheValue)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON(newValue)
        .success(function(data) {
          if (data != null && data instanceof Object) {
            var cacheValue = chanId + newValue;
            $scope.loadPayload(data, {origin: newValue, type: 'remote'}, cacheValue);
          }
          else {
            $scope.alerts = [{
              type: 'danger',
              msg: '<strong>Error</strong>: Invalid file at <a href="' + newValue + '">' + newValue + '</a>',
            }];
            $scope.tiles = {};
          }
          $scope.downloadInProgress = false;
        });
    } else {
      var cacheValue = chanId + newValue;
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[cacheValue];
      $scope.source = {origin: newValue, type: 'remote'}
      $scope.alerts = [];
    }
  });

  $scope.readFile = function(fileInput) {
    /**
     * Load a tile payload locally for preview
     */
    fileReader.readAsText(fileInput, $scope)
      .then(function(result) {
        try {
          var data = JSON.parse(result);
          var valid = $scope.loadPayload(data, {origin: allTilesForm.newTiles.value, type: 'local'});
          if (valid) {
            $scope.versionSelect = null;
          }
        } catch(e) {
          $scope.alerts = [{
            type: 'danger',
            msg: '<strong>Error</strong>: Unable to parse file ' + fileInput,
          }];
          $scope.tiles = {};
        }
      })
  };

  $scope.closeAlert = function(index) {
    $scope.alerts = [];
  };

  $scope.publish = function(tiles, deploy) {
    /**
     * Send tiles to backend for publication.
     * Assumes data is correct.
     */
    var channel_name = $scope.channelIndex[$scope.channelSelect].name;
    var confirmation = confirm("Achtung!\nYou are about to publish tiles to ALL Firefoxen in channel " + channel_name + ". Are you sure?");
    if (confirmation) {
      spliceData.postTiles(tiles, $scope.deployFlag, $scope.channelSelect)
        .success(function(data) {
          var deployed = data.deployed;

          var msg;
          if (deployed) {
            msg = '<strong>Success!</strong><p>Tiles published and deployed:<ul>';
          }
          else {
            msg = '<strong>Success!</strong><p>Tiles published but <strong>NOT</strong> deployed:<ul>';
          }

          for (var url of data.urls) {
            msg += '<li><a href="' + url + '">' + url + '</a></li>';
          }
          msg += '</ul></p>'
          $scope.alerts = [{
            type: 'success',
            msg: msg
          }];
          var urls = data.urls;
          $scope.refreshDistributions();
        })
        .error(function(data, status, headers, config, statusText) {
          var errors = data.err;
          var msg = '<strong>Error</strong>: '+ status;
          if (statusText) {
            msg += ' ' + statusText;
          }
          if (errors != null) {
            msg += "<ul>";
            for (var error of errors) {
              if (error.path) {
                msg += "<li>In <strong>" + error.path + "</strong>: " + error.msg + "</li>";
              }
              else {
                msg += "<li>" + error.msg + "</li>";
              }
            }
            msg += "</ul>";
          }

          $scope.alerts = [{
            type: 'danger',
            msg: msg,
          }];
        });
    }
  };

  $scope.init = function() {
    $scope.payloadSchema = initData.schema;
    $scope.setupChannels(initData.chans);
    $scope.setupDistributions(initData.dists);
    $scope.channelSelect = initData.chans[0].id;
  };
  $scope.init();
});
