'use strict';

angular.module('infuseWebApp')
  .controller('WatchCtrl', function ($scope, $q, gatewayManager, devices) {
    $scope.watch = [];
    $scope.measurements = [];

    var getMeasurements = function(measurementId) {
      return $scope.measurements.map(function(m) {
        if (m.id === measurementId) {
          var copy = angular.copy(m);
          copy.ticked = true;
          return copy;
        }
        return m;
      });
    };

    var gwListener = gatewayManager.onConnection(function(gw) {
      gw.doRequest('/watch/timeseries/get')
        .then(function(d) {
          $scope.watch = d.data.map(function(w) {
            return {
              val: angular.copy(w),
              original: w,
              measurements: getMeasurements(w.measurementId)
            }
          });
        });
    });

    devices.onDevices(function(dev) {
      var gw = gatewayManager.getConnection();
      if (gw) {
        gw.doRequest('/watch/timeseries/measurement/get', {
            deviceId: dev.map(function (d) {
              return d.deviceId;
            })
          })
          .then(function (d) {
            $scope.measurements = d.data.map(function (m) {
              var device = devices.get(m.deviceId);
              return {
                name: device.description.name + " (" + device.description.location + ") " + m.name,
                id: m.id
              }
            });
            $scope.watch.forEach(function(w) { w.measurements = getMeasurements(w.original.measurementId); });
          });
      }
    }, $scope);

    $scope.newWatch = function() {
      $scope.watch.push({
        val: {
          name: 'new.watch',
          measurementId: 0
        }
      });
    };

    $scope.refreshMesurementValue = function(w) {
      if (w.measurement.length > 0) {
        w.val.measurementId = w.measurement[0].id;
      } else {
        w.val.measurementId = 0;
      }
    };

    $scope.saveWatch = function(w) {
      w.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/add', w.val)
        .then(function(d) {
          w.val = angular.copy(d.data[0]);
          w.original = angular.copy(w.val);
        })
        .finally(function() { w.loading = false; })
    };

    $scope.isWatchModified = function(w) {
      return !angular.equals(w.val, w.original) && w.val.measurementId > 0;
    };

    $scope.$on('$destroy', gwListener.unsubscribe);
  });
