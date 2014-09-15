"use strict";
angular.module('spliceApp').controller('authoringController', function($scope, spliceData, fileReader) {
  // TODO: obtain from data warehouse
  $scope.choices = [
    'directoryLinks.json',
    'directoryLinks2.json',
    'directoryLinks3.json',
  ];
  $scope.alerts = [];
  $scope.data = {};
  $scope.tiles = [];
  $scope.downloadInProgress = false;

  $scope.versionSelect = null;

  $scope.$watch('versionSelect', function(newValue, oldValue) {
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;

    /* TODO: download from S3
    if (!$scope.data.hasOwnProperty(newValue)) {
      $scope.downloadInProgress = true;
      $http({method: 'GET', url: $scope.linkFile})
        .success(function(data) {
          if (data != null) {
            $scope.data[newValue] = data["en-US"];
            $scope.downloadInProgress = false;
            $scope.tiles = $scope.data[newValue];
          }
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.data[newValue];
    }
    */
  });

  $scope.readFile = function(fileInput) {
    fileReader.readAsText(fileInput, $scope)
      .then(function(result) {
        try {
          $scope.tiles = JSON.parse(result);
          $scope.versionSelect = null;
        } catch(e) {
          console.error("Error!");
        }
      })
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
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
          $scope.alerts.push({
            type: 'success',
            msg: msg
          });
          var urls = data.urls;
        })
        .error(function(data, status, headers, config, statusText) {
          var errors = data.err;
          var msg = '<strong>Error: '+ status + ' ' + statusText + '</strong>';
          if (errors != null) {
            msg += "<ul>";
            for (var error of errors) {
              msg += "<li>In <strong>" + error.path + "</strong>: " + error.msg + "</li>";
            }
            msg += "</ul>";
          }

          $scope.alerts.push({
            type: 'danger',
            msg: msg,
          });
        });
    }
  };
});
