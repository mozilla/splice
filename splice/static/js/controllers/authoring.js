"use strict";

angular.module('spliceApp').controller('authoringController', function($scope, spliceData, fileReader, payloadSchema) {

  /** Distribution select/choice setup **/

  $scope.distributions = null;
  $scope.choices = [];
  $scope.source = {};
  $scope.deployFlag = false;

  $scope.setupDistributions = function(dists) {
    var choices = [];
    var distributions = {}
    for (var d of dists) {
      choices.push(d[1]);
      distributions[d[1]] = d[0];
    }
    $scope.choices = choices;
    $scope.distributions = distributions;
  }

  $scope.refreshDistributions = function() {
    spliceData.getDistributions()
      .success(function(data) {
        $scope.setupDistributions(data.d);
      })
  }
  $scope.refreshDistributions();

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


  $scope.loadPayload = function(data, source, cacheValue) {
    /**
     * Validate and load tiles payload
     */
    var cacheValue = cacheValue || false;
    var results = tv4.validateResult(data, payloadSchema);

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

  $scope.$watch('versionSelect', function(newValue, oldValue) {
    /**
     * Event handler for Distribution selection
     */
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;

    if (!$scope.cache.hasOwnProperty(newValue) && $scope.distributions.hasOwnProperty(newValue)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON($scope.distributions[newValue])
        .success(function(data) {
          if (data != null && data instanceof Object) {
            $scope.loadPayload(data, {origin: $scope.distributions[newValue], type: 'remote'}, newValue);
          }
          else {
            $scope.alerts = [{
              type: 'danger',
              msg: '<strong>Error</strong>: Invalid file at <a href="' + $scope.distributions[newValue] + '">' + $scope.distributions[newValue] + '</a>',
            }];
            $scope.tiles = {};
          }
          $scope.downloadInProgress = false;
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[newValue];
      $scope.source = {origin: $scope.distributions[newValue], type: 'remote'}
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
    var confirmation = confirm("Achtung!\nYou are about to publish tiles to ALL Firefoxen. Are you sure?");
    if (confirmation) {
      spliceData.postTiles(tiles, $scope.deployFlag)
        .success(function(data) {
          var msg = '<strong>Success!</strong><p>Tiles published and deployed:<ul>'
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
});
