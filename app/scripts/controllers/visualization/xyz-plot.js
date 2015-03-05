'use strict';

angular.module('infuseWebAppVisualization')
  .controller('XyzPlotCtrl', function ($scope) {
    $scope.position = {
      x: [],
      y: [],
      z: []
    };

    var refresh = function(data) {
      $scope.$apply(function() {
        $scope.position.x.push(data.x);
        $scope.position.y.push(data.y);
        $scope.position.z.push(data.z);
      });
    };

    var stream = $scope.stream.xyz.subscribe(refresh);
    $scope.$on('$destroy', stream.close);
  });
