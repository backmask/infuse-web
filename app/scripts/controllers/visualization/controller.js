angular.module('infuseWebAppVisualization')
  .controller('ControllerCtrl', function ($scope) {
    var contextKey = "controller-" + $scope.nodeUid + "-" + Math.random();
    var pipeUuid = false;
    var joysticksMap = {};

    $scope.joysticks = [];

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
      if (d.dataUid == 'joystick') {
        handleJoystick(d.data);
      }
    };

    var handleJoystick = function(d) {
      var jsp = joysticksMap[d.symbol];
      if (!jsp) {
        jsp = { x: 0, y: 0, color: 'black', symbol: d.symbol };
        joysticksMap[d.symbol] = jsp;
        $scope.joysticks.push(jsp);
      }

      jsp.x = d.x;
      jsp.y = d.y;
    }

    $scope.addPipePacker(contextKey).then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });