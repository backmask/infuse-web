angular.module('infuseWebAppVisualization')
  .controller('FlightInstrumentsCtrl', function ($scope) {
    var contextKey = "flight-instruments-" + Math.random();
    var pipeUuid = false;

    $scope.gyroscope = {};

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
      }
    };


    $scope.addPipePacker(contextKey).then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });