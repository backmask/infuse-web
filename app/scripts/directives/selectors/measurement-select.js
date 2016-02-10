'use strict';

angular.module('infuseWebApp')
  .directive('measurementSelect', function(baseSelector, gatewayManager, devices) {
    return baseSelector.build(function(scope) {
      var refreshMeasurements = function() {
        var gw = gatewayManager.getConnection();
        gw.doRequest('/watch/timeseries/measurement/get', {
            deviceId: scope.devicesId
          })
          .then(function (d) {
            scope.availableValues = d.data.map(function (m) {
              return {
                name: m.name,
                id: m.id
              }
            });
          });
      };

      scope.$watch('devicesId', refreshMeasurements);
      devices.onDevices(refreshMeasurements, scope);

    }, { devicesId: '='});
  });
