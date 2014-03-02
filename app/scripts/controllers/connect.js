'use strict';

angular.module('infuseWebAppConnect', [
    'infuseWebAppRemote',
    'infuseWebAppNotification',
    'infuseWebAppCommon',
    'infuseWebAppDevice'
  ])
  .controller('DeviceCtrl', function ($scope, notifier, device) {
    $scope.devices = device.getAll();
  })
  .controller('ManualCtrl', function ($scope, socket, notifier) {
    $scope.submitted = false;

    $scope.connect = function() {
      $scope.submitted = true;
      $scope.error = false;

      if ($scope.form.$valid) {
        $scope.connecting = true;
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