'use strict';

angular.module('infuseWebApp')
  .factory('connectionManager', function($rootScope, $q, notifier, instrumentConvert, visualizationManager) {
      var r = {};
      var managedConnections = [];

      r.openConnection = function(device) {
        var deviceScope = $rootScope.$new();
        device.driverFactory(deviceScope, device);
        device.visualizationFactory(deviceScope);
        return r.handleConnection(deviceScope);
      };

      r.closeConnection = function(connection) {
        notifier.notify('verbose', 'Disconnecting from ' + connection.name);
        connection.close();
      };

      r.getManagedConnections = function() {
        return managedConnections;
      };

      r.handleConnection = function(connection) {
        var connectedDeferred = $q.defer();

        managedConnections.push(connection);
        connection.downloadSpeed = instrumentConvert.toSpeed(connection, 'download');
        connection.uploadSpeed = instrumentConvert.toSpeed(connection, 'upload');
        connection.color = window.randomColor({ luminosity: 'bright'});

        if (connection.pristine) {
          notifier.notify('verbose', 'Connecting to ' + connection.name);
        }

        connection.$watch('connected', function(newValue) {
          if (newValue) {
            connectedDeferred.resolve(connection);
            notifier.notify('success', 'Connected to ' + connection.name);
          } else if (!connection.pristine) {
            notifier.notify('verbose emphasize', 'Disconnected from ' + connection.name);
            managedConnections.splice(managedConnections.indexOf(connection), 1);
          }
        });

        connection.$watch('initialized', function(newValue) {
          if (newValue) {
            visualizationManager.visualize(connection.defaultView, connection);
          }
        });

        connection.$watch('error', function(newValue) {
          if (newValue) {
            connectedDeferred.reject(connection);
            notifier.notify('error', 'Connection error on ' + connection.name + (connection.status ? ', reason: ' + connection.status : ''));
            if (!connection.pristine && !connection.connected) {
              managedConnections.splice(managedConnections.indexOf(connection), 1);
            }
          }
        });

        return connectedDeferred.promise;
      };

      return r;
    });
