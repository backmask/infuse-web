'use strict';

angular.module('infuseWebApp')
  .controller('MainCtrl', function ($scope, gatewayManager) {
    $scope.isAuthenticated = gatewayManager.isConnected;
  });
