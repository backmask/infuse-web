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
  .run(function(device, infuseDriverFactory) {
    device.register({
      name: 'Infuse',
      description: 'ws://localhost:2935',
      icon: 'images/infuse.png',
      driverFactory: infuseDriverFactory.build,
      url: 'ws://localhost:2935'
    });
  })
  .factory('infuseDriverFactory', function() {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
      scope.name = configuration.name;
      scope.description = configuration.description;
      scope.icon = configuration.icon;
      scope.pristine = true;
      scope.connected = false;
      scope.error = false;
      scope.status = '';

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

      scope.onData = function(callback) {
        driver.onmessage = callback;
      }

      scope.close = function() {
        driver.close();
      }

      return scope;
    }

    return r;
  })