'use strict';

angular.module('infuseWebApp')
  .controller('LogsCtrl', function ($scope, gatewayManager) {
    var gw = gatewayManager.getConnection();

  });
