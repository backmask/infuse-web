'use strict';

angular.module('infuseWebAppVisualization')
  .controller('ClientProcessingPipelineCtrl', function ($scope, $interval, visualizationManager) {
    $scope.title.name = 'Processing pipeline (client ' + $scope.sessionClientUuid.substr(0, 8) + ')';
    $scope.viewType = { selected: 'pipeline' };
    $scope.pipeline = {
      nodes: [],
      links: []
    };
    $scope.pipes = {};

    var previousData = {};

    var interpreterColor = '#24c980';
    var packerColor = '#b8ff00';
    var unpackerColor = '#ffb800';

    var addNode = function(node, nodes, links, color) {
      nodes.push({
        color: color,
        id: node.uid,
        info: {
          name: node.uid === node.type ? node.uid : (node.uid + ' (' + node.type + ')'),
          hasActions: true,
          canPipe: true,
          pipe: function() {
            visualizationManager.visualize(
              $scope.getView('Data view'),
              $scope,
              { nodeUid: node.uid }
            );
          },
          remove: function() {
            $scope.doRemoveNode(node.uid);
          }
        }
      });

      if (node.final) {
        links.push({ from: node.uid, to: 'final' });
      }

      if (node.initial) {
        links.push({ from: 'initial', to: node.uid });
      }

      if (node.danglingInitial) {
        links.push({ from: 'danglingInitial', to: node.uid });
      }

      if (node.danglingFinal) {
        links.push({ from: node.uid, to: 'danglingFinal' });
      }

      node.to.forEach(function(t) { links.push({ from: node.uid, to: t }); });
      node.fallback.forEach(function(t) { links.push({ from: node.uid, to: t }); });
    };

    var refresh = function(wsData) {
      if (angular.equals(wsData.data, previousData)) {
        return;
      }

      previousData = wsData.data;
      var pipeline = wsData.data.pipeline;
      var nodes = [{
        id: 'initial',
        color: '#0085ff',
        getX: function(w) { return w * 0.05; },
        getY: function(h) { return h * 0.5; },
        fixed: true,
        info: {
          name: 'Segmenter'
        }
      }, {
        id: 'final',
        color: '#999',
        getX: function(w) { return w * 0.95; },
        getY: function(h) { return h * 0.5; },
        fixed: true,
        info: {
          name: 'Responder'
        }
      }, {
        id: 'danglingInitial',
        color: '#1199ff',
        getX: function(w) { return w * 0.5; },
        getY: function(h) { return h * 0.05; },
        fixed: true,
        info: {
          name: 'From pipe'
        }
      }, {
        id: 'danglingFinal',
        color: '#bbb',
        getX: function(w) { return w * 0.5; },
        getY: function(h) { return h * 0.95; },
        fixed: true,
        info: {
          name: 'To pipe'
        }
      }];
      var links = [];

      pipeline.interpreters.forEach(function(node) {
        addNode(node, nodes, links, interpreterColor);
      });

      pipeline.unpackers.forEach(function(node) {
        addNode(node, nodes, links, unpackerColor);
      });

      pipeline.packers.forEach(function(node) {
        addNode(node, nodes, links, packerColor);
      });

      $scope.pipeline.nodes = nodes;
      $scope.pipeline.links = links;
      $scope.pipes = wsData.data.pipesOwned;
    };

    var getData = function() {
      if ($scope.connected && $scope.sessionClientUuid) {
        $scope.doGetSessionClientPipeline().then(refresh);
      }
    };

    $scope.removePipe = function(pipeUuid) {
      $scope.doRemovePipe(pipeUuid);
    };

    getData();
    var autoRefresh = $interval(getData, 2500);

    $scope.$on('$destroy', function() {
      $interval.cancel(autoRefresh);
    });
  });
