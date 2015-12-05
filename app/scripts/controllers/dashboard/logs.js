'use strict';

angular.module('infuseWebApp')
  .controller('LogsCtrl', function ($scope, gatewayManager, devices) {
    var gw = gatewayManager.getConnection();
    $scope.request = {
      deviceId: [],
      startTime: new Date(new Date() - 24 * 3600 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      limit: 10,
      offset: 0
    };

    $scope.logs = [];

    var mapLogEntries = function(rawLog) {
      var columns = rawLog.columns;
      return rawLog.values.map(function(v) {
        var o = {};
        for (var i = 0; i < v.length; ++i) {
          o[columns[i]] = v[i];
        }
        return o;
      });
    };

    $scope.fetchLogs = function() {
      gw.doRequest('/timeseries/get/logs', $scope.request)
        .then(function(d) {
          $scope.logs = mapLogEntries(d.data.results[0].series[0]);
        });
    };

    $scope.$watch('request', $scope.fetchLogs, true);

    var gotDevices = false;
    devices.onDevices(function(dev) {
      if (gotDevices || dev.length === 0) {
        return;
      }
      gotDevices = true;
      $scope.request.deviceId = dev.map(function (dev) {
        return dev.deviceId;
      });
      $scope.fetchLogs();
    });
  });
