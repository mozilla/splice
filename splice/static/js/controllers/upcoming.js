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
    if (window.confirm("Really unschedule distribution " + id + "?")) {
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
