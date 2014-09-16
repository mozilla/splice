"use strict";
angular.module('spliceApp').controller('authoringController', function($scope, spliceData, fileReader) {

  /** Distribution select/choice setup **/
  $scope.distributions = null;
  $scope.choices = [];
  $scope.source = {};

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
  $scope.alertMsg = null;
  $scope.cache = {};
  $scope.tiles = {};
  $scope.downloadInProgress = false;
  $scope.versionSelect = null;

  $scope.tilesEmpty = function() {
    return Object.keys($scope.tiles).length == 0;
  };

  $scope.$watch('versionSelect', function(newValue, oldValue) {
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;

    if (!$scope.cache.hasOwnProperty(newValue) && $scope.distributions.hasOwnProperty(newValue)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON($scope.distributions[newValue])
        .success(function(data) {
          if (data != null && data instanceof Object) {
            $scope.cache[newValue] = data;
            $scope.tiles = $scope.cache[newValue];
            $scope.source = {origin: $scope.distributions[newValue], type: 'remote'}
            $scope.alertMsg = null;
          }
          else {
            $scope.alertMsg = {
              type: 'danger',
              msg: '<strong>Error</strong>: Invalid file at <a href="' + $scope.distributions[newValue] + '">' + $scope.distributions[newValue] + '</a>',
            };
            $scope.tiles = {};
          }
          $scope.downloadInProgress = false;
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[newValue];
      $scope.source = {origin: $scope.distributions[newValue], type: 'remote'}
      $scope.alertMsg = null;
    }
  });

  $scope.readFile = function(fileInput) {
    fileReader.readAsText(fileInput, $scope)
      .then(function(result) {
        try {
          $scope.tiles = JSON.parse(result);
          $scope.versionSelect = null;
          $scope.source = {origin: allTilesForm.newTiles.value, type: 'local'}
          $scope.alertMsg = null;
        } catch(e) {
          $scope.alertMsg = {
            type: 'danger',
            msg: '<strong>Error</strong>: Unable to parse file ' + fileInput,
          };
          $scope.tiles = {};
        }
      })
  };

  $scope.closeAlert = function(index) {
    $scope.alertMsg = null;
  };

  $scope.publish = function(tiles) {
    var confirmation = confirm("Achtung!\nYou are about to publish tiles to ALL Firefoxen. Are you sure?");
    if (confirmation) {
      spliceData.postTiles(tiles)
        .success(function(data) {
          var msg = '<strong>Success!</strong><p>Tiles published and deployed:<ul>'
          for (var url of data.urls) {
            msg += '<li><a href="' + url + '">' + url + '</a></li>';
          }
          msg += '</ul></p>'
          $scope.alertMsg = {
            type: 'success',
            msg: msg
          };
          var urls = data.urls;
          $scope.refreshDistributions();
        })
        .error(function(data, status, headers, config, statusText) {
          var errors = data.err;
          var msg = '<strong>Error</strong>: '+ status + ' ' + statusText;
          if (errors != null) {
            msg += "<ul>";
            for (var error of errors) {
              msg += "<li>In <strong>" + error.path + "</strong>: " + error.msg + "</li>";
            }
            msg += "</ul>";
          }

          $scope.alertMsg = {
            type: 'danger',
            msg: msg,
          };
        });
    }
  };
});
