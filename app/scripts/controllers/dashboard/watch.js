'use strict';

angular.module('infuseWebApp')
  .controller('WatchCtrl', function ($scope, $q, gatewayManager, devices) {
    $scope.editingProbes = false;
    $scope.watch = [];
    $scope.probes = [];
    $scope.measurements = [];

    var availableProbes = [
      "MaxSpeed",
      "MinSpeed",
      "Max",
      "Min"
    ];

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

    var getProbes = function(probeType) {
      return availableProbes.map(function(p) {
        return { name: p, id: p, ticked: p === probeType };
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
        },
        measurements: getMeasurements()
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

    $scope.deleteWatch = function(w) {
      w.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/remove', w.val)
        .then(function() { $scope.watch.splice($scope.watch.indexOf(w), 1); })
        .finally(function() { w.loading = false; })
    };

    $scope.isWatchModified = function(w) {
      return !angular.equals(w.val, w.original) && w.val.measurementId > 0;
    };

    $scope.editProbes = function(w) {
      $scope.editingProbes = true;
      $scope.selectedWatch = w.val;
      $scope.refreshingProbes = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/probe/get', { watchId: w.val.id })
        .then(function(d) {
          $scope.probes = d.data[w.val.id].map(function(p) {
            var pp = angular.copy(p);
            pp.watchId = w.val.id;
            return {
              val: angular.copy(pp),
              original: pp,
              probesType: getProbes(pp.type)
            };
          });
        })
        .finally(function() { $scope.refreshingProbes = false; });
    };

    $scope.newProbe = function() {
      $scope.probes.push({
        val: {
          eventName: 'event.name',
          type: 'Max',
          threshold: 1.0,
          watchId: $scope.selectedWatch.id
        },
        probesType: getProbes('Max')
      });
    };

    $scope.refreshProbeValue = function(p) {
      if (p.probeType.length > 0) {
        p.val.probe = p.probeType[0].id;
      } else {
        p.val.probe = "";
      }
    };

    $scope.isProbeModified = function(p) {
      return !angular.equals(p.val, p.original);
    };

    $scope.saveProbe = function(p) {
      p.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/probe/add', p.val)
        .then(function(d) {
          p.val = angular.copy(d.data[0]);
          p.val.watchId = $scope.selectedWatch.id;
          p.original = angular.copy(p.val);
        })
        .finally(function() { p.loading = false; })
    };

    $scope.deleteProbe = function(p) {
      p.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/probe/remove', p.val)
        .then(function() { $scope.probes.splice($scope.probes.indexOf(p), 1); })
        .finally(function() { p.loading = false; })
    };

    $scope.$on('$destroy', gwListener.unsubscribe);
  });
