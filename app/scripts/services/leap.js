'use strict';

angular.module('infuseWebAppDevice')
  .run(function(device, leapDriverFactory) {
    device.register({
      name: 'Leap motion',
      description: 'Local connection',
      icon: 'images/leap.png',
      driverFactory: leapDriverFactory.build,
      configuration: {}
    });
  })
  .factory('leapDriverFactory', function() {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new Leap.Controller(configuration);
      scope.pristine = true;
      scope.connected = false;
      scope.error = false;
      scope.status = '';

      driver.on('connect', function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = true;
          scope.error = false;
          scope.status = '';
        });
      });

      driver.on('disconnect', function() {
        scope.$apply(function() {
          scope.connected = false;
        });
      });

      scope.onData = function(callback) {
        driver.on('frame', callback);
      }

      return scope;
    }

    return r;
  })
  .factory('Leap', function() {
    var leap = new Leap.Controller();
    return leap;
  });