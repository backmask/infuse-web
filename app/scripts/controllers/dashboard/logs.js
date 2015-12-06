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

    var logFilters = {
      'message': ['message'],
      'io': ['input', 'output']
    };

    $scope.logs = {};

    var getRequest = function(logType) {
      var copy = angular.copy($scope.request);
      copy.logType = logType;
      return copy;
    };

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

    var refreshAllLogs = function() {
      for (var key in logFilters) {
        $scope.fetchLogs(key);
      }
    };

    $scope.fetchLogs = function(target) {
      if (gw) {
        gw.doRequest('/timeseries/get/logs', getRequest(logFilters[target]))
          .then(function (d) {
            var log = d.data.results[0].series ? mapLogEntries(d.data.results[0].series[0]) : [];
            $scope.logs[target] = log;
          });
      }
    };

    $scope.$watch('request', refreshAllLogs, true);

    var gotDevices = false;
    devices.onDevices(function(dev) {
      if (gotDevices || dev.length === 0) {
        return;
      }
      gotDevices = true;
      $scope.request.deviceId = dev.map(function (dev) {
        return dev.deviceId;
      });

      refreshAllLogs();
    });
  });
