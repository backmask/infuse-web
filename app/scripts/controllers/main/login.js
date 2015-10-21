'use strict';

angular.module('infuseWebApp')
  .controller('LoginCtrl', function ($scope, device, gatewayManager) {
    $scope.gateways = device.getRegisteredDevices()
      .filter(function(d) { return d.configurator === 'Infuse'; });

    $scope.gateway = $scope.gateways[0] || {
      name: 'No gateway selected'
    };

    $scope.doLogin = function(login, password, gateway) {
      $scope.connecting = true;
      $scope.connectionError = false;
      gatewayManager.connect(gateway, login, password)
        .catch(function(e) { $scope.connectionError = e; })
        .finally(function() { $scope.connecting = false; });
    };
  });
