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
        measurementId: 0
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

    $scope.refreshSerie = function(serie) {
      var rq = {
        startTime: new Date(new Date() - 24 * 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        measurementId: serie.measurementId,
        timeResolution: '15m'
      };

      $scope.doRequest('/timeseries/get/measurement', rq)
        .then(convertData)
        .then(displayData);
    };

    $scope.refreshAll = function() {
      $scope.settings.series.forEach($scope.refreshSerie);
    };

    $scope.finishSetup = function() {
      $scope.refreshAll();
      $scope.$emit('settingsUpdated');
    };

    $scope.refreshAll();
  });
