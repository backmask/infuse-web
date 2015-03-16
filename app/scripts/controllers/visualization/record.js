'use strict';

angular.module('infuseWebAppVisualization')
  .controller('RecordCtrl', function ($scope) {
    $scope.clients = [];

    var update = function(data) {
      $scope.clients = data;
    };

    $scope.doGetRecordList().then(update);
  });
