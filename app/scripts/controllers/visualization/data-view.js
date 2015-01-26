angular.module('infuseWebAppVisualization')
  .controller('DataViewCtrl', function ($scope, instrumentConvert) {
    var contextKey = "data-view-" + $scope.nodeUid + "-" + Math.random();
    var pipeUuid = false;
    var previousFilterValue = false;
    var filter = function() { return true; };

    $scope.title.name = 'Data view (' + $scope.nodeUid + ')';
    $scope.title.description = 'Client ' + $scope.sessionClientUuid.substr(0, 8);
    $scope.frames = [];
    $scope.receivedFrames = 0;
    $scope.framesSpeed = instrumentConvert.toSpeed($scope, 'receivedFrames');
    $scope.paused = false;
    $scope.filterScript = 'return function(type, payload, index) {\n  return true;\n}';
    $scope.showFilterEditor = false;

    $scope.clear = function() {
      $scope.frames = [];
      $scope.receivedFrames = 0;
    };
    $scope.toggle = function() {
      $scope.paused = !$scope.paused;
    };
    $scope.toggleFilterEditor = function() {
      $scope.showFilterEditor = !$scope.showFilterEditor;
    };
    $scope.saveFilter = function() {
      $scope.showFilterEditor = false;
      previousFilterValue = $scope.filterScript;
      filter = eval('(function() {' + $scope.filterScript + '})')();
    };
    $scope.resetFilter = function() {
      $scope.showFilterEditor = false;
      $scope.filterScript = previousFilterValue;
    };

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
      if ($scope.paused || !filter(d.dataUid, d.data, $scope.receivedFrames)) return;
      $scope.receivedFrames++;

      $scope.frames.unshift({
        index: $scope.receivedFrames,
        time: new Date(),
        type: d.dataUid,
        payload: d.data
      });

      if ($scope.frames.length > 100)
        $scope.frames.pop();
    }

    addPacker().then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });