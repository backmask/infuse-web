'use strict';

angular.module('infuseWebApp')
  .controller('DashboardCtrl', function ($scope, gatewayManager) {
    var connection = gatewayManager.getConnection();
    $scope.loading = true;
    $scope.dashboardConfig = {};
    $scope.loadingError = false;

    var createNewDashboard = function() {
      $scope.dashboardConfig = {
        views: [{
          name: 'devices'
        }]
      };
    };

    if (connection) {
      connection.doGetDashboard()
        .then(function(d) { $scope.loading = false; console.log(d); })
        .catch(function(e) {
          if (e.error.message === 'Could not open dashboard.json') {
            createNewDashboard();
            $scope.loading = false;
          } else {
            $scope.loadingError = e.error.message;
          }
        });
    } else {
      $scope.loadingError = 'Not connected to gateway';
    }

    // var scope = gatewayManager.getConnection().$new();
    // scope.deviceId = '6c5cefa7-a204-4ca1-b103-a9b61c15c1cf';
    // $scope.views = [{
    //   controller: 'GraphCtrl',
    //   src: 'views/dashboard/graph.html',
    //   scope: scope
    // }];
  });
