'use strict';

angular.module('infuseWebAppConnect', [
    'infuseWebAppRemote',
    'infuseWebAppNotification',
    'infuseWebAppCommon',
    'infuseWebAppDevice',
    'infuseWebAppActiveConnections'
  ])
  .controller('DeviceCtrl', function ($scope, notifier, device, connectionManager) {
    $scope.devices = device.getRegisteredDevices();
    $scope.deviceConfigurators = device.getRegisteredConfigurators();

    $scope.connect = function(dev) {
      dev.connecting = true;

      connectionManager.openConnection(dev)
        .then(function() { dev.connecting = false; });
    };

    $scope.add = function(configurator) {
      device.register(configurator);
    };

    $scope.remove = function(dev) {
      device.unregister(dev);
    };

    $scope.configure = function(dev) {
      dev.editableSettings = angular.copy(dev.settings);
      dev.configMode = true;
    };

    $scope.saveModifications = function(dev) {
      device.reconfigure(dev, dev.editableSettings);
      dev.configMode = false;
    };

    $scope.cancelModifications = function(dev) {
      dev.configMode = false;
    };
  })
  .controller('ManualCtrl', function ($scope, socket, notifier) {
    $scope.submitted = false;

    $scope.connect = function() {
      $scope.submitted = true;
      $scope.error = false;

      if ($scope.form.$valid) {
        $scope.connecting = true;
        notifier.notify('verbose', 'Connecting to ' + $scope.host);
        var s = socket.connect($scope.host, $scope.port);
        s.onopen = function(e) {
          notifier.notify('success', 'Connection opened to ' + e.target.URL);
          $scope.$apply(function() { $scope.connecting = false; });
        };
        s.onerror = function(e) {
          notifier.notify('error', 'Cannot connect to ' + e.target.URL);
          $scope.$apply(function() { $scope.connecting = false; });
          $scope.error = true;
        };
        s.onclose = function(e) {
          notifier.notify('warning', 'Connection to ' + e.target.URL + ' closed');
          $scope.$apply(function() { $scope.connecting = false; });
        };
      }
    };
  });
