'use strict';

angular.module('infuseWebApp')
  .controller('LogsCtrl', function ($scope, gatewayManager) {
    var gw = gatewayManager.getConnection();
    var rq = {
      deviceId: [],
      startTime: new Date(new Date() - 24 * 3600 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      limit: 10,
      offset: 0
    };

    $scope.devices = [];
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
      console.log('rq', rq);
      gw.doRequest('/timeseries/get/logs', rq)
        .then(function(d) {
          $scope.logs = mapLogEntries(d.data.results[0].series[0]);
        });
    };

    gw.doGetAllDevices()
      .then(function(d) {
        $scope.devices = d.data.devices;
        rq.deviceId = d.data.devices.map(function(dev) { return dev.deviceId; });
        $scope.fetchLogs();
      });
  });
