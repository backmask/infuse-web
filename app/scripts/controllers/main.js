'use strict';

angular.module('infuseWebApp')
  .controller('MainCtrl', function ($scope) {
  });

angular.module('infuseWebApp')
  .controller('LeapCtrl', function ($scope, Leap) {
    $scope.position = {x: 0, y:0, z:0};
    $scope.x = [];
    $scope.y = [];
    $scope.z = [];
    Leap.on('frame', function(frame) {
      if(frame.pointables.length > 0)
      {
        var pointable = frame.pointables[0];

        var interactionBox = frame.interactionBox;
        var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);

        $scope.$apply(function() {
          $scope.position.x = normalizedPosition[0] * 2 - 1;
          $scope.position.y = normalizedPosition[1] * 2 - 1;
          $scope.position.z = normalizedPosition[2] * 2 - 1;

          $scope.x.push($scope.position.x);
          $scope.y.push($scope.position.y);
          $scope.z.push($scope.position.z);
        });
      }
    });
    Leap.connect();
  });