'use strict';

angular.module('infuseWebApp')
  .controller('GraphCtrl', function ($scope) {
    $scope.data = [];
    $scope.settings = $scope.settings || {
      name: 'New graph',
      series: []
    };
    $scope.setup = $scope.settings.series.length === 0;
    if ($scope.setup) {
      $scope.settings.series.push({
        devicesId: [],
        name: 'Measurement name',
        value: 'Measurement value'
      });
    }

    var convertData = function(data) {
      // No data-point returned
      if (!data.data) {
        return [];
      }

      var r = data.data.results[0].series.map(function(s) {
        return s.values.map(function(v) {
          return {
            date: new Date(v[0]),
            value: v[1]
          };
        }).filter(function(v) { return v.value; });
      });

      return r;
    };

    var displayData = function(data) {
      $scope.data = data;
    };

    $scope.$watch('devices', function(d) {
      if (!d) { return; }
      $scope.settings.series.forEach(function (s) {
        s._devices = d.map(function(dev) {
          return {
            name: dev.description.name + ' (' + dev.description.location + ')',
            id: dev.deviceId,
            ticked: s.devicesId.indexOf(dev.deviceId) !== -1
          };
        });
      });
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
      $scope.settings.series.forEach($scope.refreshSerie);
    };

    $scope.finishSetup = function() {
      $scope.settings.series.forEach(function(s) {
        s.devicesId = s._device
          .filter(function(d) { return d.ticked; })
          .map(function(d) { return d.id; });
      });

      $scope.refreshAll();
      $scope.$emit('settingsUpdated');
    };

    $scope.refreshAll();
  });
