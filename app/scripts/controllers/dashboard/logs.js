'use strict';

angular.module('infuseWebApp')
  .controller('LogsCtrl', function ($scope, $q, gatewayManager, devices) {
    var gw = gatewayManager.getConnection();
    $scope.request = {
      deviceId: [],
      startTime: "",
      endTime: "",
      limit: 30,
      offset: 0
    };

    var logFilters = {
      'message': ['message'],
      'io': ['input', 'output'],
      'event': []
    };

    $scope.logs = {
      'message': [],
      'io': [],
      'event': []
    };

    var getRequest = function(logType) {
      var copy = angular.copy($scope.request);
      if (logType) {
        copy.logType = logType;
      }
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

    var doLogsRequest = function(target, rq) {
      if (gw) {
        return gw.doRequest('/timeseries/get/logs', rq)
          .overrides(target)
          .then(function (d) {
            return d.data.results[0].series ? mapLogEntries(d.data.results[0].series[0]) : [];
          });
      }
      return $q.when([]);
    };

    var doEventLogsRequest = function(rq) {
      if (gw) {
        return gw.doRequest('/watch/timeseries/logs/get', rq)
          .overrides('event')
          .then(function (d) {
            return d.data.results[0].series ? mapLogEntries(d.data.results[0].series[0]) : [];
          });
      }
      return $q.when([]);
    };

    $scope.refresh = function () {
      $scope.request.startTime = new Date(new Date() - 24 * 3600 * 1000 * 30).toISOString();
      $scope.request.endTime = new Date().toISOString();
    };

    $scope.fetchMoreLogs = function(target) {
      var rq = getRequest(target == 'event' ? null : logFilters[target]);
      rq.offset = $scope.logs[target].length;

      var query = target == 'event'
        ? doEventLogsRequest(getRequest())
        : doLogsRequest(target, getRequest(logFilters[target]));

      query.then(function(log) { $scope.logs[target] = $scope.logs[target].concat(log); });
    };

    $scope.fetchLogs = function(target) {
      var rq = target == 'event'
        ? doEventLogsRequest(getRequest())
        : doLogsRequest(target, getRequest(logFilters[target]));

      rq.then(function(log) { $scope.logs[target] = log; });
    };

    $scope.refresh();
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
