'use strict';

angular.module('infuseWebApp')
  .controller('DevicesCtrl', function ($scope, gatewayManager) {
    var gw = gatewayManager.getConnection();
    $scope.devices = [];

    gw.doGetAllDevices()
      .then(function(d) { $scope.devices = d.data.devices; });
  });
