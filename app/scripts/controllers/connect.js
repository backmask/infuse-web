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

    $scope.connect = function(dev) {
      dev.connecting = true;

      var s = dev.driverFactory($scope.$new(), dev);
      connectionManager.handleConnection(s);

      s.$watch('pristine == false', function() {
        dev.connecting = false;
      })
    }
  })
  .controller('ManualCtrl', function ($scope, socket, notifier) {
    $scope.submitted = false;

    $scope.connect = function() {
      $scope.submitted = true;
      $scope.error = false;

      if ($scope.form.$valid) {
        $scope.connecting = true;
        notifier.notify('verbose', 'Connecting to ' + e.target.URL);
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
        }
      }
    }
  });