angular.module('infuseWebAppVisualization')
  .controller('FlightInstrumentsCtrl', function ($scope) {
    var contextKey = "flight-instruments-" + Math.random();
    var pipeUuid = false;

    $scope.gyroscope = {};
    $scope.thrust = {
      color: 'black',
      data: []
    };
    $scope.motors = {};

    var addPipe = function() {
      return $scope.doSetPipe("processor", {
        target: $scope.sessionClientUuid,
        uri: "__out"
      }, {
        uri: contextKey,
        stream: "in"
      }, "self");
    };

    var setup = function(d) {
      pipeUuid = d.data.uuid;
      $scope.setCallback(contextKey, receiveData);
    }

    var cleanup = function() {
      $scope.doRemoveNode(contextKey, 'self');
      $scope.doRemovePipe(pipeUuid, 'self');
      $scope.removeCallback(contextKey);
    };

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

    $scope.addPipePacker(contextKey).then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });