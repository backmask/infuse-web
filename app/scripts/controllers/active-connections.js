'use strict';

angular.module('infuseWebAppActiveConnections', [
    'infuseWebAppNotification',
    'infuseWebAppInstrument',
    'infuseWebAppVisualization'
  ])
  .factory('connectionManager', function(notifier, instrumentConvert, visualizationManager) {
    var r = {};
    var managedConnections = [];

    r.handleConnection = function(connection) {
      managedConnections.push(connection);
      connection.downloadSpeed = instrumentConvert.toSpeed(connection, 'download');
      connection.uploadSpeed = instrumentConvert.toSpeed(connection, 'upload');

      if (connection.pristine) {
        notifier.notify('verbose', 'Connecting to ' + connection.name);
      }

      connection.$watch('connected', function(newValue) {
        if (newValue) {
          notifier.notify('success', 'Connected to ' + connection.name);
        } else if (!connection.pristine) {
          notifier.notify('verbose emphasize', 'Disconnected from ' + connection.name);
          managedConnections.splice(managedConnections.indexOf(connection), 1);
        }
      });

      connection.$watch('initialized', function(newValue) {
        if (newValue) {
          visualizationManager.visualize(connection.defaultView);
        }
      });

      connection.$watch('error', function(newValue) {
        if (newValue) {
          notifier.notify('error', 'Connection error on ' + connection.name + ' ' + connection.status);
        }
      });
    };

    r.closeConnection = function(connection) {
      notifier.notify('verbose', 'Disconnecting from ' + connection.name);
      connection.close();
    }

    r.getManagedConnections = function() {
      return managedConnections;
    }

    return r;
  })
  .controller('ActiveConnectionsCtrl', function($scope, $interval, connectionManager) {
    $scope.connectedDevices = connectionManager.getManagedConnections();
    $scope.disconnect = connectionManager.closeConnection;
  })
  .filter('shortNumber', function(numberFilter) {
    return function(input, unit) {
      unit = unit || 'B';
      if (input > 1000000000) {
        return numberFilter(input / 1000000000, 2) + 'G' + unit;
      } else if (input > 1000000) {
        return numberFilter(input / 1000000, 2) + 'M' + unit;
      } else if (input > 1000) {
        return numberFilter(input / 1000, 2) + 'K' + unit;
      } else {
        return numberFilter(input, 2) + unit;
      }
    };
  });