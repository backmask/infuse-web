'use strict';

angular.module('infuseWebApp')
  .controller('LoginCtrl', function ($scope, $state, gatewayManager) {
    $scope.gateways = gatewayManager.getGateways();
    if ($scope.gateways.length === 0) {
      $state.go('^.gatewayEdit');
    }

    $scope.gateway = $scope.gateways[0] || {
      name: 'No gateway selected'
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
