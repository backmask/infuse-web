'use strict';

angular.module('infuseWebAppVisualization')
  .controller('RecordCtrl', function ($scope, $interval) {
    $scope.clients = [];
    $scope.playbacks = {};

    var updateRecordList = function(data) {
      $scope.clients = data;
    };

    var updatePlaybackList = function(data) {
      $scope.playbacks = {};
      data.forEach(function(d) {
        if (!$scope.playbacks[d.path]) {
          $scope.playbacks[d.path] = {
            running: 0,
            total: 0
          };
        }
        if (d.status.isRunning) {
          $scope.playbacks[d.path].running++;
        }
        if (!$scope.playbacks[d.path][d.record]) {
          $scope.playbacks[d.path][d.record] = [];
        }

        $scope.playbacks[d.path].total++;
        $scope.playbacks[d.path][d.record].push(d);
      });
    };

    $scope.playback = function(client, record) {
      $scope.doPlayback(client.path, record);
    };

    $scope.kill = $scope.doKillPlayback;
    $scope.rewind = $scope.doRewindPlayback;
    $scope.pause = $scope.doPausePlayback;
    $scope.resume = $scope.doResumePlayback;

    var updatePlaybackInterval = $interval(function() {
      $scope.doGetPlaybackList().then(updatePlaybackList);
    }, 1000);

    $scope.doGetRecordList().then(updateRecordList);

    $scope.$on('$destroy', function() {
      $interval.cancel(updatePlaybackInterval);
    });
  });
