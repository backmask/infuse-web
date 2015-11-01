'use strict';

angular.module('infuseWebApp')
  .controller('LoginCtrl', function ($scope, $state, gatewayManager, localStorageService) {
    $scope.gateways = gatewayManager.getGateways();
    if ($scope.gateways.length === 0) {
      $state.go('^.gatewayEdit');
    }

    $scope.gateway = localStorageService.get('default_gw') || $scope.gateways[0];

    $scope.useGateway = function(gw) {
      $scope.gateway = gw;
      localStorageService.set('default_gw', gw);
    };

    $scope.doLogin = function(login, password, gateway) {
      $scope.connecting = true;
      $scope.connectionError = false;
      gatewayManager.connect(gateway, login, password)
        .then(function() {  $state.go('^.dashboard'); },
          function(e) { $scope.connectionError = e; })
        .finally(function() { $scope.connecting = false; });
    };
  });
