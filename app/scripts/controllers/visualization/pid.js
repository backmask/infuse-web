'use strict';

angular.module('infuseWebAppVisualization')
  .controller('PidCtrl', function ($scope) {
    $scope.data = {
      response: {
        p: [],
        i: [],
        d: [],
        sum: []
      },
      target: [],
      actual: [],
    };
    $scope.model = {
      kp: 0,
      ki: 0,
      kiMin: 0,
      kiMax: 0,
      kd: 0
    };
    $scope.previousModel = $scope.model;
    $scope.modelOrder = ['kp', 'ki', 'kd', 'kiMin', 'kiMax'];

    var receiveData = function(dd) {
      var data = dd.data;
      var p = data.model.kp * data.status.error;
      var i = data.model.ki * data.status.integral;
      var d = data.model.kd * data.status.derivative;

      for (var key in data.model) {
        if ($scope.previousModel[key] === $scope.model[key]) {
          $scope.model[key] = data.model[key];
        }
      }
      $scope.previousModel = data.model;

      $scope.data.response.p.push(p);
      $scope.data.response.i.push(i);
      $scope.data.response.d.push(d);
      $scope.data.response.sum.push(p + i + d);

      $scope.data.target.push(data.setPoint.target);
      $scope.data.actual.push(data.setPoint.target - data.status.error);
    };

    $scope.reset = function() {
      $scope.model = $scope.previousModel;
    };

    $scope.upload = function() {
      $scope.doConfigureNode($scope.nodeUid, { model: $scope.model });
    };

    $scope.doConfigureNode($scope.nodeUid, { debug: true });

    var pipe = $scope.pipeNode({
      target: $scope.sessionClientUuid,
      stream: 'out',
      uri: $scope.nodeUid
    }, ['pid'], receiveData);

    $scope.$on('$destroy', function() {
      pipe.then(function(p) { p.destroy(); });
      $scope.doConfigureNode($scope.nodeUid, { debug: false });
    });
  });
