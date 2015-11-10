'use strict';

angular.module('infuseWebApp')
  .controller('DashboardCtrl', function ($scope, gatewayManager) {
    var scope = gatewayManager.getConnection().$new();
    scope.deviceId = '6c5cefa7-a204-4ca1-b103-a9b61c15c1cf';
    $scope.views = [{
      controller: 'GraphCtrl',
      src: 'views/dashboard/graph.html',
      scope: scope
    }];
  });
