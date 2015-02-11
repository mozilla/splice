"use strict";

angular.module('spliceApp').controller('authoringController', function($controller, $scope, $modal, spliceData, fileReader, initData) {
  $controller('distributionController', {$scope: $scope});

  /** Distribution select/choice setup **/
  $scope.source = {};
  $scope.deployConfig = {now: false, scheduled: null};
  $scope.scheduledDate = null;
  $scope.confirmationModal = $modal({scope: $scope, template: "template/confirmation.html", show: false});
  $scope.uploadModal = $modal({scope: $scope, template: "template/upload.html", show: false});

  /** UI and tile data **/
  $scope.uploadInProgress = false;
  $scope.versionSelect = null;
  $scope.uploadMessage = {};

  $scope.hidePastDatetimes = function($view, $dates, $leftDate, $upDate, $rightDate) {
    var now;
    if ($view == 'day') {
      now = new Date();
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      now.setMilliseconds(0);
    }
    else {
      var realNow = new Date();
      /*
       * $dates don't have TZ factored in, i.e. they think they are UTC,
       * but are local time. need to make comparator also TZ-agnostic
       */
      now = new Date(realNow.getTime() - realNow.getTimezoneOffset()*60000);
      if ($view == 'hour') {
        /*
         * Allow for time selection within the current hour
         */
        now.setMinutes(0);
        now.setTime(now.getTime() - 60000)
      }
    }

    for (var i=0; i< $dates.length; i++) {
      var d = $dates[i];
      if (d.dateValue < now.getTime()) {
        d.selectable = false;
      }
    }
  };

  $scope.$watch('versionSelect', function(newValue, oldValue) {
    /**
     * Event handler for Distribution selection
     */
    if (newValue == null) {
      return;
    }

    allTilesForm.newTiles.value = null;
    var chanId = $scope.channelSelect;
    var cacheKey = chanId + newValue.url;

    if (!$scope.cache.hasOwnProperty(cacheKey)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON(newValue.url)
        .success(function(data) {
          if (data != null && data instanceof Object) {
            $scope.loadPayload(data, {origin: newValue.url, type: 'remote'}, cacheKey);
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
      $scope.source = {origin: newValue.url, type: 'remote'}
      $scope.fileErrorMsg = null;
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
          $scope.fileErrorMsg = 'Unable to parse file ' + fileInput.name;
          $scope.tiles = {};
        }
      })
  };

  $scope.clearScheduledDate = function() {
    $scope.deployConfig.scheduled = null;
  };

  $scope.showConfirmationModal = function() {
    $scope.confirmationModal.$promise.then($scope.confirmationModal.show);
  };

  $scope.doConfirmPublish = function() {
    this.$hide();
    $scope.publish($scope.tiles);
  };

  $scope.publish = function(tiles) {
    /**
     * Send tiles to backend for publication.
     * Assumes data is correct.
     */
    $scope.uploadInProgress = true;
    $scope.uploadModal.$promise.then($scope.uploadModal.show);
    spliceData.postTiles(tiles, $scope.channelSelect.id, $scope.deployConfig)
      .success(function(data) {
        var deployed = data.deployed;
        var msg = '<ol>';
        for (var url of data.urls) {
          msg += '<li><a href="' + url + '">' + url + '</a></li>';
        }
        msg += '</ol>'
        $scope.uploadMessage = {
          success: true,
          deployed: deployed,
          msg: msg
        };

        var urls = data.urls;
        $scope.deployConfig.now = false;
        $scope.deployConfig.schedule = null;
        $scope.refreshDistributions();
      })
      .error(function(data, status, headers, config, statusText) {
        var errors = data.err;
        var msg = '<ol>';
        if (errors != null) {
          for (var error of errors) {
            if (error.path) {
              msg += "<li>In <strong>" + error.path + "</strong>: " + error.msg + "</li>";
            }
            else {
              msg += "<li>" + error.msg + "</li>";
            }
          }
        }
        msg += "</ol>";
        $scope.uploadMessage = {
          success: false,
          status: status,
          statusText: statusText,
          msg: msg,
        };
      }).finally(function() {
        $scope.uploadInProgress = false;
        $scope.uploadModal.$promise.then($scope.uploadModal.show);
      });
  };

  $scope.selectUploadResult = function() {
    var e = document.querySelector('#uploadResultSelectable');
    var selection = window.getSelection();
    selection.selectAllChildren(e);
  };

  $scope.refreshDistributions = function() {
    spliceData.getDistributions()
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
    $scope.source = {};
    allTilesForm.newTiles.value = null;
    $scope.versionSelect = null;
  });

  $scope.init(initData);
});
