'use strict';

angular.module('infuseWebApp')
  .factory('devices', function($q, gatewayManager) {
    var r = {};
    var devices = [];
    var devicesRefreshedCallbacks = [];

    r.getDevices = function() {
      return devices;
    };

    r.refreshDevices = function() {
      var gw = gatewayManager.getConnection();
      if (gw) {
        return gw.doGetAllDevices().then(function (d) {
          devices = d.data.devices;
          devicesRefreshedCallbacks.forEach(function(cb) { cb(devices); });
        });
      }
      return $q.reject("Not connected to gateway");
    };

    r.onDevices = function(cb, scope) {
      devicesRefreshedCallbacks.push(cb);

      var unsubscribe = function() {
        devicesRefreshedCallbacks.splice(devicesRefreshedCallbacks.find(cb), 1);
      };

      if (scope) {
        scope.$on('destroy', unsubscribe);
      }

      cb(devices);

      return {
        unsubscribe: unsubscribe
      };
    };

    gatewayManager.onConnection(r.refreshDevices);
    return r;
  });
