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
  })
  .factory('infuseDriverFactory', function() {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
      var onDataCallbacks = [];
      var onSendCallbacks = [];
      scope.name = configuration.name;
      scope.description = configuration.description;
      scope.icon = configuration.icon;
      scope.pristine = true;
      scope.connected = false;
      scope.error = false;
      scope.status = '';
      scope.download = 0;
      scope.upload = 0;
      scope.unit = 'B';

      driver.onopen = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = true;
          scope.error = false;
          scope.status = '';
        });
      }

      driver.onerror = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = true;
        });
      }

      driver.onclose = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = false;
        });
      }

      driver.onmessage = function(data) {
        scope.download += data.length;
        angular.forEach(onDataCallbacks, function(cb) {
          cb(data);
        });
      }

      scope.onData = function(callback) {
        onDataCallbacks.push(callback);
      }

      scope.onSend = function(callback) {
        onSendCallbacks.push(callback);
      }

      scope.send = function(data) {
        scope.upload += data.length;
        driver.send(data);
      }

      scope.close = function() {
        driver.close();
      }

      return scope;
    }

    return r;
  })