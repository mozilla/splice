"use strict";
angular.module('spliceApp').controller('authoringController', function($scope, spliceData, fileReader) {
  // TODO: obtain from data warehouse
  $scope.choices = [
    'directoryLinks.json',
    'directoryLinks2.json',
    'directoryLinks3.json',
  ];
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

  $scope.publish = function(tiles) {
    var confirmation = confirm("You are about to publish tiles to ALL Firefoxen. Are you sure?");
    if (confirmation) {
      spliceData.postTiles(tiles)
        .success(function(data) {
          console.log("success!");
        })
        .error(function(data, status) {
          console.error("status: " + status + " error: " + data);
        });
    }
  };
});
