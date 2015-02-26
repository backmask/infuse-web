angular.module('infuseWebAppVisualization')
  .controller('FlightInstrumentsCtrl', function ($scope) {
    $scope.gyroscope = {};
    $scope.thrust = {
      color: 'black',
      data: []
    };
    $scope.motors = {};

    var receiveData = function(d) {
      if (d.dataUid == "gyroscope") {
        $scope.gyroscope = d.data;
      } else if (d.dataUid == "thrust") {
        handleThrust(d.data);
      }
    };

    var handleThrust = function(d) {
      if (d.symbol == 'avg') {
        $scope.thrust.data.push(d.value);
        return;
      }

      if (!$scope.motors.hasOwnProperty(d.symbol)) {
        $scope.motors[d.symbol] = {
          color: randomColor(),
          data: []
        }
      }
      $scope.motors[d.symbol].data.push(d.value);
    };

    var pipe = $scope.pipeStructures(['gyroscope', 'thrust'], receiveData);
    $scope.$on('$destroy', function() {
      pipe.then(function(p) { p.destroy(); });
    });
  });