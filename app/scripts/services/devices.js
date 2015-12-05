'use strict';

angular.module('infuseWebApp')
  .factory('devices', function($q, gatewayManager, dashboardConfig) {
    var r = {};
    var devices = [];
    var devicesRefreshedCallbacks = [];
    var dashboard = dashboardConfig.get();

    var updateColors = function() {
      var updated = false;
      devices.forEach(function(dev) {
        var devConfig = dashboard.config.devices[dev.deviceId];
        if (!devConfig) {
          dashboard.config.devices[dev.deviceId] = devConfig = {};
        }
        if (!devConfig.color) {
          devConfig.color = window.randomColor({ luminosity: 'light'});
          updated = true;
        }
        dev.color = devConfig.color;
      });

      if (updated && !dashboard.modified) {
        dashboardConfig.save();
      }
    };

    r.getDevices = function() {
      return devices;
    };

    r.refreshDevices = function() {
      var gw = gatewayManager.getConnection();
      if (gw) {
        return gw.doGetAllDevices().then(function (d) {
          devices = d.data.devices;
          updateColors();
          devicesRefreshedCallbacks.forEach(function(cb) { cb(devices); });
        });
      }
      return $q.reject("Not connected to gateway");
    };

    r.onDevices = function(cb, scope) {
      devicesRefreshedCallbacks.push(cb);

      var unsubscribe = function() {
        devicesRefreshedCallbacks.splice(devicesRefreshedCallbacks.indexOf(cb), 1);
      };

      if (scope) {
        scope.$on('$destroy', unsubscribe);
      }

      cb(devices);

      return {
        unsubscribe: unsubscribe
      };
    };

    gatewayManager.onConnection(r.refreshDevices);
    return r;
  })
  .factory('devicesIcon', function() {
    var r = {};
    var defaultIcon = '<i class="fa fa-question"></i>';
    var families = {
      'sensor': { name: 'Sensor', icon: '<i class="fa fa-wifi"></i>'},
      'sensor.temperature': { name: 'Thermometer', icon: '<img class="icon" src="images/thermometer.png" />' },
      'controller': { name: 'Controller', icon: '<i class="fa fa-gamepad"></i>' }
    };

    function toArray(obj) {
      var arr = [];
      for (var key in obj) {
        var val = angular.copy(obj[key]);
        val.id = key;
        arr.push(key);
      }

      return arr.sort(function(a, b) { return a.name > b.name; });;
    }

    r.getFamilyIcon = function(familyId) {
      var family = families[familyId];
      return family ? family.icon : defaultIcon;
    };

    r.families = families;
    r.familiesList = toArray(families);
    return r;
  });
