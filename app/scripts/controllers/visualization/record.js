'use strict';

angular.module('infuseWebAppVisualization')
  .controller('RecordCtrl', function ($scope) {
    $scope.clients = [];

    var update = function(data) {
      $scope.clients = data;
    };

    $scope.playback = function(client, record) {
      $scope.doPlayback(client.path, record);
    };

    $scope.doGetRecordList().then(update);
  });
