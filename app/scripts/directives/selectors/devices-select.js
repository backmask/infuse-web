'use strict';

angular.module('infuseWebApp')
  .directive('devicesSelect', function(baseSelector, devices) {
      return baseSelector.build(function(scope) {
        var refreshDevices = function(devices) {
          scope.availableValues = devices.map(function(dev) {
            return {
              name: dev.description.name + ' (' + dev.description.location + ')',
              id: dev.deviceId,
              ticked: false
            };
          });
        };

        devices.onDevices(refreshDevices, scope);
      });
    });
