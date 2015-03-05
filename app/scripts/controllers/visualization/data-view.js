'use strict';

angular.module('infuseWebAppVisualization')
  .controller('DataViewCtrl', function ($scope, instrumentConvert, visualizationManager) {
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

    var receiveData = function(d) {
      $scope.$broadcast('data-received', d.dataUid, d.data, ++$scope.receivedFrames);
      if ($scope.paused || !compiledFilter(d.dataUid, d.data, $scope.receivedFrames)) {
        return;
      }

      $scope.frames.unshift({
        index: $scope.receivedFrames,
        time: new Date(),
        type: d.dataUid,
        payload: d.data
      });

      if ($scope.frames.length > 100) {
        $scope.frames.pop();
      }
    };

    $scope.$watch('script.filter', function(f) {
      compiledFilter = eval('(function() {' + f + '})')(); // jshint ignore:line
    });

    $scope.$on('js-editor-saved', function(e, g) {
      if (e.targetScope.jsName !== 'filter') {
        return;
      }
      e.stopPropagation();

      var compiledGraph = eval('(function() {' + g + '})')(); // jshint ignore:line
      var listen = function(sc) {
        sc.$on('data-received', function(e, uid, data, frameIdx) {
          var res = compiledGraph(uid, data, frameIdx);
          if (!isNaN(res)) {
            sc.series[0].data.push(res);
          }
        });
      };

      visualizationManager.visualize(
        $scope.getView('Data graph'),
        $scope,
        {
          onInit: listen,
          series: [{
            label: g.substr(0, 10),
            color: window.randomColor({ luminosity: 'bright'}),
            data: []
          }]
        }
      );
    });

    var pipe = $scope.pipeNode({
      target: $scope.sessionClientUuid,
      stream: 'out',
      uri: $scope.nodeUid
    }, receiveData);

    $scope.$on('$destroy', function() {
      pipe.then(function(p) { p.destroy(); });
    });
  });
