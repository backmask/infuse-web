'use strict';

angular.module('infuseWebAppDevice')
  .factory('leapDriverFactory', function() {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new Leap.Controller(configuration);
      var onDataCallbacks = [];
      scope.name = configuration.name;
      scope.description = configuration.description;
      scope.icon = configuration.icon;
      scope.pristine = true;
      scope.connected = false;
      scope.error = false;
      scope.status = '';
      scope.download = 0;
      scope.upload = 0;
      scope.unit = 'f';
      scope.noUpload = true;

      driver.on('connect', function() {
        console.log('connected');
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

      driver.on('frame', function(data) {
        scope.download++;
        angular.forEach(onDataCallbacks, function(cb) {
          cb(data);
        });
      })

      scope.onData = function(callback) {
        onDataCallbacks.push(callback);
      }

      scope.onSend = function(callback) {}

      scope.stream = {
        xyz: {
          name: 'xyz position',
          description: 'ranging from -1 to 1',
          subscribe: function(callback) {
            return scope.onData(function(frame) {
              if(frame.pointables.length > 0)
              {
                var pointable = frame.pointables[0];
                var interactionBox = frame.interactionBox;
                var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);
                callback({
                  x: normalizedPosition[0] * 2 - 1,
                  y: normalizedPosition[1] * 2 - 1,
                  z: normalizedPosition[2] * 2 - 1
                });
              }
            });
          }
        }
      };

      driver.connect();

      return scope;
    }

    return r;
  })
  .factory('Leap', function() {
    var leap = new Leap.Controller();
    return leap;
  });