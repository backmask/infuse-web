angular.module('infuseWebAppVisualization')
  .controller('DataViewCtrl', function ($scope) {
    var contextKey = "data-view-" + $scope.nodeUid + "-" + Math.random();
    var pipeUuid = false;

    $scope.title.name = 'Data view (' + $scope.nodeUid + ')';
    $scope.title.description = 'Client ' + $scope.sessionClientUuid.substr(0, 8);
    $scope.frames = [];

    var addPacker = function() {
      return $scope.doAddNode("self", {
        instanceType: "packer",
        uid: contextKey,
        type: "json.response.packer",
        final: true,
        config: { context: contextKey }
      });
    };

    var addPipe = function() {
      return $scope.doSetPipe("self", "processor", {
        target: $scope.sessionClientUuid,
        stream: "out",
        uri: $scope.nodeUid
      }, {
        uri: contextKey,
        stream: "in"
      });
    };

    var setup = function(d) {
      pipeUuid = d.data.uuid;
      $scope.setCallback(contextKey, receiveData);
    }

    var cleanup = function() {
      $scope.doRemoveNode($scope.sessionClientUuid, contextKey);
      $scope.doRemovePipe($scope.sessionClientUuid, pipeUuid);
      $scope.removeCallback(contextKey);
    }

    var receiveData = function(d) {
      $scope.frames.push(d);
    }

    addPacker().then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });