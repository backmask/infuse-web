angular.module('infuseWebAppVisualization')
  .controller('ControllerCtrl', function ($scope) {
    $scope.joysticks = {};
    $scope.buttons = {};

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

    var pipe = $scope.pipeStructures(['joystick', 'button'], receiveData);
    $scope.$on('$destroy', function() {
      pipe.then(function(p) { p.destroy(); });
    });
  });