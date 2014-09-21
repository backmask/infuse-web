angular.module('infuseWebAppVisualization')
  .controller('ProcessingPipelineCtrl', function ($scope, $interval) {
    $scope.overview = {
      nodes: [],
      links: []
    };

    var previousData = {};
    var endPointColor = '#0085ff';
    var segmenterColor = '#24c980';
    var interpreterColor = '#FFB800';
    var structureColor = '#999';

    var curryAddLink = function(links, a, isBtoA) {
      return function(b) {
        links.push({ from: (!isBtoA ? a : b), to: (isBtoA ? a : b)});
      }
    }

    var curryPushActiveNode = function(nodes, links, color, uriPrefix) {
      return function(node) {
        var uri = uriPrefix + '-' + node.uri;
        nodes.push({
          color: color,
          id: uri,
          info: {
            name: node.uri,
            description: node.description
          }
        });

        if (node.input && node.input.length) {
          node.input.forEach(curryAddLink(links, uri, true));
        } else {
          links.push({from:"bytes", to:uri});
        }

        if (node.output && node.output.length) {
          node.output.forEach(curryAddLink(links, uri));
        } else {
          links.push({from:uri, to:"end-point"});
        }
      }
    }

    var refresh = function(wsData) {
      if (angular.equals(wsData.data, previousData)) {
        return;
      }

      previousData = wsData.data;
      var nodes = [{
        color: endPointColor,
        id: 'end-point',
        getX: function(w) { return w * .95; },
        getY: function(h) { return h * .5; },
        fixed: true,
        info: {
          name: 'Out only'
        }
      }, {
        color: endPointColor,
        id: 'bytes',
        getX: function(w) { return w * .05; },
        getY: function(h) { return h * .5; },
        fixed: true,
        info: {
          name: 'Bytes'
        }
      }, {
        color: structureColor,
        id: 'text',
        info: {
          name: 'Text'
        }
      }];
      var links = [];

      wsData.data.structures.forEach(function(structure) {
        nodes.push({
          color: structureColor,
          id: structure,
          info: {
            name: structure
          }
        });
      });

      wsData.data.interpreters.forEach(curryPushActiveNode(nodes, links, interpreterColor, 'interpreter'));
      wsData.data.segmenters.forEach(curryPushActiveNode(nodes, links, segmenterColor, 'segmenter'));

      // Link nodes never used as input to the end point
      // No further processing can be done on these structures
      var linksStart = links.map(function(l) { return l.from; });
      wsData.data.structures.forEach(function(n) {
        if (!linksStart[n]) {
          links.push({from: n, to: 'end-point'});
        }
      });

      $scope.overview.nodes = nodes;
      $scope.overview.links = links;
    }

    $scope.doGetFactoryOverview().then(refresh);
    var autoRefresh = $interval(function() {
      if ($scope.connected) {
        $scope.doGetFactoryOverview().then(refresh);
      }
    }, 1000 * 60);

    $scope.$on('$destroy', function() {
      $interval.cancel(autoRefresh);
    });
  });