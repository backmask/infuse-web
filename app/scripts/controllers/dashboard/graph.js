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

    var displayRegions = function(startTime, endTime) {
      return function(data) {
        if (data.length == 0) {
          $scope.regions = [];
          return;
        }

        // Events received are ordered by time from the most recent to the least recent
        // An event may only be received if the state changed
        // e.g. a 'Off' notification can only be followed by a 'On' for the same event
        var regions = {};

        data[0].forEach(function (m) {
          // Aggregate by event name
          // The event spans the whole graph by default because there
          // will not be a notification for events toggled outside of the graph window
          if (!regions[m.event]) {
            regions[m.event] = [{
              label: m.event,
              date: [startTime, endTime],
              gotLast: false
            }];
          }

          var reg = regions[m.event];

          // If we already have the On notification, create a second region,
          // this event have been toggled a new time
          if (reg[reg.length - 1].gotLast) {
            reg.push({
              label: m.event,
              date: [startTime, endTime],
              gotLast: false
            });
          }

          // Set toggle time
          reg[reg.length - 1].date[m.isOn ? 0 : 1] = m.date;
          reg[reg.length - 1].gotLast |= m.isOn;
        });

        var fmap = [];
        for (var key in regions) {
          fmap = fmap.concat(regions[key]);
        }

        $scope.regions = fmap;
      }
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
        timeResolution: '10m'
      };

      $scope.doRequest('/timeseries/get/measurement', rq)
        .then(convertData)
        .then(displayData);

      if (angular.isArray(serie.watchId) && serie.watchId.length > 0) {
        var watchRq = angular.copy(rq);
        watchRq.watchId = serie.watchId;

        $scope.doRequest('/watch/timeseries/logs/get', watchRq)
          .then(convertSeries)
          .then(displayRegions(rq.startTime, rq.endTime));
          //.then(displayMarkers);
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
