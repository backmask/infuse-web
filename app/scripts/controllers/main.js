'use strict';

angular.module('infuseWebApp')
  .controller('MainCtrl', function ($scope, $state, gatewayManager) {
    $scope.isConnected = false;

    var onAlive = function() {
      $scope.reconnecting = false;
      $scope.isConnected = gatewayManager.isConnected();
      if ($scope.isConnected) {
        $state.go('main.dashboard');
      } else {
        $state.go('main.login');
      }
    };

    var onDead = function() {
      $scope.reconnecting = $scope.isConnected;
      gatewayManager.reconnect();
    };

    var gwCb = gatewayManager.onConnection(onAlive, onDead);

    if (gatewayManager.isConnected()) {
      $state.go('main.dashboard');
    } else {
      $state.go('main.login');
    }

    $scope.$on('$destroy', gwCb.unsubscribe);
  });
