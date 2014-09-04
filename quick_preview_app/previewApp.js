var app = angular.module('tilesPreviewApp', []);
app.controller('PreviewController', function($scope, $http) {
    $scope.linkFile = null;
    $scope.tiles = [];
    $scope.data = {};
    $scope.downloadInProgress = false;

    $scope.choices = [
        'directoryLinks.json',
        'directoryLinks2.json',
        'directoryLinks3.json',
    ];

    $scope.$watch('linkFile', function(newValue, oldValue) {
      if (newValue == null) {
        return;
      }

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
    });
});
