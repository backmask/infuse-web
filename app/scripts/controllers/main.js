'use strict';

angular.module('infuseWebApp')
  .controller('MainCtrl', function ($scope, $state, gatewayManager) {
    $scope.gw = gatewayManager;

    if (gatewayManager.isConnected()) {
      $state.go('main.dashboard');
    } else {
      $state.go('main.login');
    }
  });
