"use strict";

angular.module('spliceApp').controller('authoringController', function($scope, $modal, spliceData, fileReader, initData) {

  /** Distribution select/choice setup **/

  $scope.distributions = null;
  $scope.channels = null;
  $scope.channelIndex = {};
  $scope.choices = [];
  $scope.source = {};
  $scope.deployFlag = false;
  $scope.channelSelect = null;
  $scope.scheduledDate = null;
  $scope.confirmationModal = $modal({scope: $scope, template: "template/confirmation.html", show: false});
  $scope.uploadModal = $modal({scope: $scope, template: "template/upload.html", show: false});

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
  $scope.uploadMessage = {};
  $scope.cache = {};
  $scope.tiles = {};
  $scope.downloadInProgress = false;
  $scope.uploadInProgress = false;
  $scope.versionSelect = null;

  $scope.hidePastDatetimes = function($view, $dates, $leftDate, $upDate, $rightDate) {
    for (var i=0; i< $dates.length; i++) {
      var d = $dates[i];
      var now = new Date();
      if (d.dateValue < now) {
        d.selectable = false;
      }
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
    $scope.choices = $scope.distributions[newValue.id];
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
    var cacheKey = chanId + newValue.url;

    if (!$scope.cache.hasOwnProperty(cacheKey)) {
      $scope.downloadInProgress = true;
      spliceData.getJSON(newValue.url)
        .success(function(data) {
          if (data != null && data instanceof Object) {
            $scope.loadPayload(data, {origin: newValue.url, type: 'remote'}, cacheKey);
          }
          else {
            $scope.alerts = [{
              type: 'danger',
              msg: '<strong>Error</strong>: Invalid file at <a href="' + newValue.url + '">' + newValue.url + '</a>',
            }];
            $scope.tiles = {};
          }
          $scope.downloadInProgress = false;
        });
    } else {
      $scope.downloadInProgress = false;
      $scope.tiles = $scope.cache[cacheKey];
      $scope.source = {origin: newValue.url, type: 'remote'}
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
    spliceData.postTiles(tiles, $scope.deployFlag, $scope.channelSelect.id)
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
        $scope.deployFlag = false;
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

  $scope.init = function() {
    $scope.payloadSchema = initData.schema;
    $scope.setupChannels(initData.chans);
    $scope.setupDistributions(initData.dists);
    $scope.channelSelect = initData.chans[0];
  };
  $scope.init();
});
