'use strict';

angular.module('infuseWebAppDevice')
  .factory('connection', function() {
    var activeConnections = [];
    var r = {};

    r.connect = function(connection) {
      activeConnections.push(connection);
    };

    r.getAll = function() {
      return activeConnections;
    };

    return r;
  })
  .factory('device', function(localStorageService) {
    var registeredDevices = [];
    var registeredDeviceConfigurators = {};
    var r = {};

    r.register = function(configurator, settings) {
      registeredDevices.push(r.configure(configurator, settings));
      localStorageService.set('devices', registeredDevices);
    };

    r.unregister = function(device) {
      registeredDevices.splice(registeredDevices.indexOf(device), 1);
      localStorageService.set('devices', registeredDevices);
    }

    r.configure = function(configurator, settings) {
      var conf = r.getConfigurator(configurator);
      var fullSettings = angular.extend(angular.copy(conf.defaultSettings), settings);
      var dev = conf.buildDevice(fullSettings);
      dev.configurator = configurator;
      dev.settings = fullSettings;
      return dev;
    }

    r.reconfigure = function(device, settings) {
      angular.copy(r.configure(device.configurator, settings), device);
      localStorageService.set('devices', registeredDevices);
    }

    r.registerConfigurator = function(name, configurator) {
      registeredDeviceConfigurators[name] = configurator;
    };

    r.getRegisteredDevices = function() {
      return registeredDevices;
    };

    r.getRegisteredConfigurators = function() {
      return registeredDeviceConfigurators;
    };

    r.getConfigurator = function(name) {
      return registeredDeviceConfigurators[name];
    }

    return r;
  });