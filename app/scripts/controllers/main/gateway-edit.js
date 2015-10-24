'use strict';

angular.module('infuseWebApp')
  .controller('GatewayEditCtrl', function ($scope, $state, gatewayManager) {
    $scope.gateways = gatewayManager.getGateways();

    $scope.addFirst = function(host, port) {
      gatewayManager.registerGateway(host, host, port);
      $state.go('main.login');
    };
  });
