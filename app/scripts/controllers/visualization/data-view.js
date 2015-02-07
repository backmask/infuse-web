angular.module('infuseWebAppVisualization')
  .controller('DataViewCtrl', function ($scope, instrumentConvert, visualizationManager) {
    var contextKey = "data-view-" + $scope.nodeUid + "-" + Math.random();
    var pipeUuid = false;
    var compiledFilter = function() { return true; };

    $scope.title.name = 'Data view (' + $scope.nodeUid + ')';
    $scope.title.description = 'Client ' + $scope.sessionClientUuid.substr(0, 8);
    $scope.frames = [];
    $scope.receivedFrames = 0;
    $scope.framesSpeed = instrumentConvert.toSpeed($scope, 'receivedFrames');
    $scope.paused = false;
    $scope.script = {
      filter: 'return function(type, payload, index) {\n  return true;\n}',
      graph: 'return function(type, payload, index) {\n  return 1 - (index % 200) / 100;\n}'
    };

    $scope.clear = function() {
      $scope.frames = [];
      $scope.receivedFrames = 0;
    };
    $scope.toggle = function() {
      $scope.paused = !$scope.paused;
    };

    var addPipe = function() {
      return $scope.doSetPipe("processor", {
        target: $scope.sessionClientUuid,
        stream: "out",
        uri: $scope.nodeUid
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
    }

    var receiveData = function(d) {
      $scope.$broadcast('data-received', d.dataUid, d.data, ++$scope.receivedFrames);
      if ($scope.paused || !compiledFilter(d.dataUid, d.data, $scope.receivedFrames)) return;

      $scope.frames.unshift({
        index: $scope.receivedFrames,
        time: new Date(),
        type: d.dataUid,
        payload: d.data
      });

      if ($scope.frames.length > 100)
        $scope.frames.pop();
    }

    $scope.$watch('script.filter', function(f) {
      compiledFilter = eval('(function() {' + f + '})')();
    });

    $scope.$on('js-editor-saved', function(e, g, oldg) {
      if (e.targetScope.jsName != 'filter') {
        return;
      }
      e.stopPropagation();

      var compiledGraph = eval('(function() {' + g + '})')();
      var listen = function(sc) {
        sc.$on('data-received', function(e, uid, data, frameIdx) {
          var res = compiledGraph(uid, data, frameIdx);
          if (!isNaN(res)) {
            sc.series[0].data.push(res);
          }
        });
      }

      visualizationManager.visualize(
        $scope.getView('Data graph'),
        $scope,
        {
          onInit: listen,
          series: [{
            label: g.substr(0, 10),
            color: randomColor({ luminosity: 'bright'}),
            data: []
          }]
        }
      );
    });

    $scope.addPipePacker(contextKey).then(addPipe).then(setup);
    $scope.$on('$destroy', cleanup);
  });