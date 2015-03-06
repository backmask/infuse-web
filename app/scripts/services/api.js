'use strict';

angular.module('infuseWebApp')
  .run(function($window, $rootScope, $q, device, connectionManager, visualizationManager) {
    var r = {};

    r.device = device;
    r.connectionManager = connectionManager;
    r.visualizationManager = visualizationManager;

    r.devices = device.getRegisteredDevices();
    r.connect = connectionManager.openConnection;
    r.connections = connectionManager.getManagedConnections;
    r.view = visualizationManager.visualize;
    r.views = visualizationManager.getVisualizations;

    $window.api = r;
  });
