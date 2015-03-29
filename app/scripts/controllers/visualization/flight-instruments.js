'use strict';

angular.module('infuseWebAppVisualization')
  .controller('FlightInstrumentsCtrl', function ($scope) {
    $scope.gyroscope = {};
    $scope.thrust = {
      color: 'black',
      data: []
    };
    $scope.motors = {};
    $scope.altitude = {
      color: 'blue',
      data: []
    };

    var receiveData = function(d) {
      if (d.dataUid === 'gyroscope') {
        $scope.gyroscope = d.data;
      } else if (d.dataUid === 'thrust') {
        handleThrust(d.data);
      } else if (d.dataUid === 'barometer.asl') {
        handleAsl(d.data);
      }
    };

    var handleThrust = function(d) {
      if (d.symbol === 'avg') {
        $scope.thrust.data.push(d.value);
        return;
      }

      if (!$scope.motors.hasOwnProperty(d.symbol)) {
        $scope.motors[d.symbol] = {
          color: window.randomColor(),
          data: []
        };
      }
      $scope.motors[d.symbol].data.push(d.value);
    };

    var handleAsl = function(d) {
      $scope.altitude.data.push(d.value);
    };

    var thrustPipe = $scope.pipeStructures(['thrust'], receiveData);
    var gyroscopePipe = $scope.pipeStructures(['gyroscope'], receiveData);
    $scope.$on('$destroy', function() {
      thrustPipe.then(function(p) { p.destroy(); });
      gyroscopePipe.then(function(p) { p.destroy(); });
    });
  });
