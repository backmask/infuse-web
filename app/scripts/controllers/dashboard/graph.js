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
        measurementId: 0,
        watchId: []
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

    var convertSeries = function(data) {
      // No data-point returned
      if (!data.data || !data.data.results[0].series) {
        return [];
      }

      var r = data.data.results[0].series.map(function(s) {
        return s.values.map(function(v) {
          var o = {};
          for (var i = 0; i < s.columns.length; ++i) {
            var col = s.columns[i];
            if (col == 'time') {
              o.date = new Date(v[i]);
            } else {
              o[s.columns[i]] = v[i];
            }
          }
          return o;
        });
      });

      return r;
    };

    var displayData = function(data) {
      $scope.data = data;
    };

    var displayMarkers = function(data) {
      $scope.markers = data.length == 0 ? [] : data[0].map(function(m) {
        return {
          date: m.date,
          label: m.event
        };
      });
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

      if (angular.isArray(serie.watchId) && serie.watchId.length > 0) {
        var watchRq = angular.copy(rq);
        watchRq.watchId = serie.watchId;

        $scope.doRequest('/watch/timeseries/logs/get', watchRq)
          .then(convertSeries)
          .then(displayMarkers);
      }
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
