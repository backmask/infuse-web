'use strict';

angular.module('infuseWebAppActiveConnections', [
    'infuseWebAppNotification',
    'infuseWebAppInstrument',
    'infuseWebAppVisualization',
    'infuseWebAppCommon'
  ])
  .factory('connectionManager', function(notifier, instrumentConvert, visualizationManager, settingsManager) {
    var r = {};
    var managedConnections = [];

    r.handleConnection = function(connection) {
      managedConnections.push(connection);
      connection.downloadSpeed = instrumentConvert.toSpeed(connection, 'download');
      connection.uploadSpeed = instrumentConvert.toSpeed(connection, 'upload');
      connection.color = randomColor({ luminosity: 'bright'});

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
          visualizationManager.visualize(connection.defaultView, connection);
        }
      });

      connection.$watch('error', function(newValue) {
        if (newValue) {
          notifier.notify('error', 'Connection error on ' + connection.name + (connection.status ? ', reason: ' + connection.status : ''));
          if (!connection.pristine && !connection.connected) {
            managedConnections.splice(managedConnections.indexOf(connection), 1);
          }
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
  .controller('ActiveConnectionsCtrl', function($scope, $interval, connectionManager, visualizationManager) {
    $scope.connectedDevices = connectionManager.getManagedConnections();
    $scope.disconnect = connectionManager.closeConnection;

    $scope.visualize = function(connection, view) {
      visualizationManager.visualize(view, connection.$new());
    }

    $scope.getWatchedClients = function(connection) {
      var clients = connection.getClients();
      var r = {};
      for (var key in clients) {
        if (!clients[key].noWatch) {
          r[key] = clients[key];
        }
      }
      return r;
    }
  });