'use strict';

angular.module('infuseWebAppDevice')
  .provider('device', function() {
    this.devices = [];

    this.$get = function() {
      var devices = this.devices;
      return {
        register: function(device) {
          devices.push(device);
        },
        getAll: function() {
          return devices;
        }
      };
    }
  })
  .run(function(device, infuseDriverFactory) {
    device.register({
      name: 'Infuse',
      description: 'ws://localhost:2935',
      icon: 'images/infuse.png',
      driverFactory: infuseDriverFactory.build,
      configuration: {
        url: 'ws://localhost:2935'
      }
    });
  })
  .factory('infuseDriverFactory', function() {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
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

      return scope;
    }

    return r;
  })