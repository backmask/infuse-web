angular.module('infuseWebAppVisualization')
  .controller('ProcessingPipelineCtrl', function ($scope, $interval) {
    $scope.viewType = { selected: 'all' };
    $scope.overview = {
      nodes: [],
      links: []
    };

    var previousData = false;
    var endPointColor = '#0085ff';
    var segmenterColor = '#24c980';
    var interpreterColor = '#FFB800';
    var structureColor = '#999';

    var curryAddLink = function(links, a, isBtoA) {
      return function(b) {
        if (a !== b) {
          links.push({ from: (!isBtoA ? a : b), to: (isBtoA ? a : b)});
        }
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

    var getFinalStructures = function(links, structures) {
      var linksStart = {};
      links.forEach(function(l) {
        linksStart[l.from] = true;
      });
      return structures.filter(function(n) {
        return !linksStart[n];
      });
    }

    var viewAll = function(data, nodes, links) {
      nodes.push({
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
      });

      data.interpreters.forEach(curryPushActiveNode(nodes, links, interpreterColor, 'interpreter'));
      data.segmenters.forEach(curryPushActiveNode(nodes, links, segmenterColor, 'segmenter'));
      getFinalStructures(links, data.structures).forEach(curryAddLink(links, 'end-point', true));
    }

    var viewStructures = function(data, nodes, links) {
      nodes.push({
        color: endPointColor,
        id: 'bytes',
        key: 'view-structures',
        getX: function(w) { return w * .5; },
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
      });

      data.interpreters.forEach(function(interpreter) {
        interpreter.input.forEach(function(input) {
          interpreter.output.forEach(curryAddLink(links, input));
        });
      });

      data.segmenters.forEach(function(segmenter) {
        segmenter.output.forEach(curryAddLink(links, 'bytes'));
      });

      var structuresMap = {};
      nodes.forEach(function(n) { structuresMap[n.id] = n; });
      getFinalStructures(links, data.structures).forEach(function(n) {
        structuresMap[n].color = interpreterColor;
        structuresMap[n].key = 'view-structures';
      });
    }

    var refresh = function(wsData, forceRefresh) {
      if (!forceRefresh && angular.equals(wsData.data, previousData.data)) {
        return;
      }

      previousData = wsData;
      var nodes = [];
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

      if ($scope.viewType.selected === 'all') {
        viewAll(wsData.data, nodes, links);
      } else if ($scope.viewType.selected === 'structures') {
        viewStructures(wsData.data, nodes, links);
      }

      $scope.overview.nodes = nodes;
      $scope.overview.links = links;
    }

    $scope.doGetFactoryOverview().then(refresh);
    var autoRefresh = $interval(function() {
      if ($scope.connected) {
        $scope.doGetFactoryOverview().then(refresh);
      }
    }, 1000 * 60);

    $scope.$watch('viewType.selected', function() {
      previousData && refresh(previousData, true);
    })

    $scope.$on('$destroy', function() {
      $interval.cancel(autoRefresh);
    });
  });