angular.module('infuseWebAppVisualization')
  .controller('ClientProcessingPipelineCtrl', function ($scope, $interval) {
    $scope.pipeline = {
      nodes: [],
      links: []
    };

    var previousData = {};

    var rootColor = '#0085ff';
    var interpreterColor = '#24c980';
    var packerColor = '#b8ff00';
    var unpackerColor = '#ffb800';
    var outputColor = '#999';

    var addNode = function(node, nodes, links, color) {
      nodes.push({
        color: color,
        id: node.uid,
        info: {
          name: node.uid === node.type ? node.uid : (node.uid + '(' + node.type + ')'),
          hasActions: true,
          canPipe: true,
          pipe: function() {
            $scope.doSetLocalProcessorPipe($scope.sessionClientUuid, node.uid);
          }
        }
      });

      if (node.final) {
        links.push({ from: node.uid, to: 'final' });
      }

      if (node.initial) {
        links.push({ from: 'initial', to: node.uid });
      }

      node.to.forEach(function(t) { links.push({ from: node.uid, to: t }) });
      node.fallback.forEach(function(t) { links.push({ from: node.uid, to: t }) });
    }

    var refresh = function(wsData) {
      if (angular.equals(wsData.data, previousData)) {
        return;
      }

      previousData = wsData.data;
      var pipeline = wsData.data.pipeline;
      var nodes = [{
        id: 'initial',
        getX: function(w) { return w * .05; },
        getY: function(h) { return h * .5; },
        fixed: true,
        info: {
          name: 'Segmenter'
        }
      }, {
        id: 'final',
        getX: function(w) { return w * .95; },
        getY: function(h) { return h * .5; },
        fixed: true,
        info: {
          name: 'Responder'
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
    }

    var getData = function() {
      if ($scope.connected && $scope.sessionClientUuid) {
        $scope.doGetSessionClientPipeline($scope.sessionClientUuid).then(refresh);
      }
    }

    getData();
    var autoRefresh = $interval(getData, 2500);

    $scope.$on('$destroy', function() {
      $interval.cancel(autoRefresh);
    });
  });