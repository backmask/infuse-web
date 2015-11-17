'use strict';

angular.module('infuseWebApp')
  .controller('GraphCtrl', function ($scope) {
    $scope.data = [];
    $scope.setup = false;

    $scope.series = [{
      devicesId: [$scope.deviceId],
      name: 'temperature',
      value: 'celcius'
    }];

    var convertData = function(data) {
      var r = data.data.results[0].series[0].values.map(function(v) {
        return {
          date: new Date(v[0]),
          value: v[1]
        };
      }).filter(function(v) { return v.value; });

      return r;
    };

    var displayData = function(data) {
      $scope.data = data;
    };

    $scope.$watch('devices', function(d) {
      if (!d) { return; }
      $scope.series.forEach(function (s) {
        s._devices = d.map(function(dev) {
          return {
            name: dev.description.name + ' (' + dev.description.location + ')',
            id: dev.deviceId,
            ticked: s.devicesId.indexOf(dev.deviceId) !== -1
          };
        });
      });
      console.log('series', $scope.series);
    });

    $scope.refreshSerie = function(serie) {
      var rq = {
        deviceId: serie.devicesId,
        startTime: new Date(new Date() - 24 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        name: serie.name,
        tags: [],
        values: [serie.value],
        timeResolution: '15m'
      };

      $scope.doRequest('/timeseries/get', rq)
        .then(convertData)
        .then(displayData);
    };

    $scope.refreshAll = function() {
      $scope.series.forEach($scope.refreshSerie);
    };

    $scope.finishSetup = function() {
      $scope.series.forEach(function(s) {
        s.devicesId = s._device
          .filter(function(d) { return d.ticked; })
          .map(function(d) { return d.id; });
      });

      $scope.refreshAll();
    };

    $scope.refreshAll();
  });
