'use strict';

angular.module('infuseWebAppActiveConnections', [
    'infuseWebAppNotification'
  ])
  .factory('connectionManager', function(notifier) {
    var r = {};
    var managedConnections = [];

    r.handleConnection = function(connection) {
      managedConnections.push(connection);

      if (connection.pristine) {
        notifier.notify('verbose', 'Connecting to ' + connection.name);
      }

      connection.$watch('connected', function(newValue) {
        if (newValue) {
          notifier.notify('success', 'Connected to ' + connection.name);
        } else if (!connection.pristine) {
          notifier.notify('verbose emphasize', 'Disconnected from ' + connection.name);
        }
      });

      connection.$watch('error', function(newValue) {
        if (newValue) {
          notifier.notify('error', 'Connection error on ' + connection.name + ' ' + connection.status);
        }
      });
    };

    r.getManagedConnections = function() {
      return managedConnections;
    }

    return r;
  })
  .controller('ActiveConnectionsCtrl', function($scope, connectionManager) {
    $scope.connectedDevices = connectionManager.getManagedConnections();
  });