'use strict';

angular.module('infuseWebApp')
  .controller('MainCtrl', function ($state, gatewayManager) {
    if (gatewayManager.isConnected()) {
      $state.go('main.dashboard');
    } else {
      $state.go('main.login');
    }
  });
