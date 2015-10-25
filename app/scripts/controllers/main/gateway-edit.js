'use strict';

angular.module('infuseWebApp')
  .controller('GatewayEditCtrl', function ($scope, $state, gatewayManager) {
    $scope.gateways = gatewayManager.getGateways();

    $scope.addFirst = function(host, port) {
      gatewayManager.registerGateway(host, host, port);
      $state.go('main.login');
    };

    $scope.deleteGateway = function(gw) {
      $scope.gateways.splice($scope.gateways.indexOf(gw));
    };

    $scope.addNewGateway = function() {
      $scope.gateways.push({ name: 'New gateway', host: 'localhost', port: 2935 });
    };

    $scope.updateAndLeave = function() {
      gatewayManager.setGateways($scope.gateways);
      $state.go('main.login');
    };
  });
