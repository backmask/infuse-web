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
  .factory('device', function() {
    var registeredDevices = [];
    var r = {};

    r.register = function(device) {
      registeredDevices.push(device);
    };

    r.getRegisteredDevices = function() {
      return registeredDevices;
    };

    return r;
  });