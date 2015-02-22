angular.module('infuseWebAppVisualization')
  .controller('ControllerCtrl', function ($scope) {
    var contextKey = "controller-" + Math.random();
    var pipeUuid = false;

    $scope.joysticks = {};
    $scope.buttons = {};

    var addPipe = function() {
      return $scope.doSetPipe("processor", {
        target: $scope.sessionClientUuid,
        uri: "filter",
        stream: "out"
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
      } else if (d.dataUid == 'button') {
        handleButton(d.data);
      }
    };

    var handleJoystick = function(d) {
      $scope.joysticks[d.symbol] = {
        x: d.x,
        y: d.y,
        color: 'black'
      };
    }

    var handleButton = function(d) {
      $scope.buttons[d.symbol] = d.pressed;
    }

    $scope.addPipePacker(contextKey).then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });