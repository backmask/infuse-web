'use strict';

angular.module('infuseWebAppActiveConnections', [
    'infuseWebAppNotification',
    'infuseWebAppInstrument',
    'infuseWebAppVisualization',
    'infuseWebAppCommon'
  ])
  .controller('ActiveConnectionsCtrl', function($scope, $interval, connectionManager, visualizationManager) {
    $scope.connectedDevices = connectionManager.getManagedConnections();
    $scope.disconnect = connectionManager.closeConnection;

    $scope.visualize = function(connection, view) {
      visualizationManager.visualize(view, connection.$new());
    };

    $scope.getWatchedClients = function(connection) {
      var clients = connection.client.getAll();
      var r = {};
      for (var key in clients) {
        if (!clients[key].noWatch) {
          r[key] = clients[key];
        }
      }
      return r;
    };
  });
