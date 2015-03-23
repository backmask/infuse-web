'use strict';

angular.module('d3')
  .directive('d3Graph', function(d3) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        width: '@',
        height: '@',
        nodes: '=',
        links: '=',
        nodeSelected: '=?'
      },
      link: function($scope, element, attrs, ctrl, transclude) {
        element[0].style.width = $scope.width;
        element[0].style.height = $scope.height;
        transclude($scope, function(content) {
          element.append(content);
        });

        var uid = 'rnd-' + Math.random();
        var svg = d3.select(element[0]).append('svg')
          .attr('width', $scope.width)
          .attr('height', $scope.height);

        var nodeRadius = 5;
        var width = $(svg[0]).width();
        var height = $(svg[0]).height();

        var nodesMap = {};

        var tick = function() {
          node.attr('cx', function(d) { return Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)); })
              .attr('cy', function(d) { return Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)); });

          link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });
        };

        var refreshNodes = function(newValue) {
          var newNodes = [];
          newValue[0].forEach(function(node) {
            if (nodesMap[node.id] && nodesMap[node.id].key === node.key) {
              newNodes.push(nodesMap[node.id]);
              return;
            }

            var newNode = angular.copy(node);
            newNode.x = newNode.getX ? newNode.getX(width) : width * Math.random();
            newNode.y = newNode.getY ? newNode.getY(height) : height * Math.random();

            newNodes.push(newNode);
            nodesMap[node.id] = newNode;
          });

          var newLinks = [];
          newValue[1].forEach(function(link) {
            newLinks.push({
              source: nodesMap[link.from],
              target: nodesMap[link.to]
            });
          });

          force.nodes(newNodes);
          force.links(newLinks);

          restart();
        };

        var restart = function() {
          var previousNodesCount = node.data().length;
          link = link.data(force.links());

          link.exit().remove();
          link.enter().insert('line', '.node')
              .attr('class', 'link')
              .attr('marker-end', 'url(#end' + uid + ')');

          node = node.data(force.nodes())
            .style('fill', function(d) { return d.color; });

          node.exit().remove();
          node.enter().insert('circle', '.cursor')
              .attr('class', 'node')
              .style('fill', function(d) { return d.color; })
              .attr('r', nodeRadius)
              .on('mouseover', function(d) {
                d.dom = $(this);
                $scope.$apply(function() {
                    $scope.nodeSelected = d;
                    $scope.nodeHovered = true;
                });
              })
              .on('mouseout', function() {
                $scope.$apply(function() {
                    $scope.nodeHovered = false;
                });
              })
              .call(force.drag);

          force.start();

          // Prestabilize if many nodes were added/removed
          if (Math.abs(previousNodesCount - force.nodes().length) > previousNodesCount / 3) {
            stabilize();
          }
        };

        var onResize = function() {
          width = $(svg[0]).width();
          height = $(svg[0]).height();
          force.nodes().forEach(function(node) {
            if (node.getX) {
              node.x = node.px = node.getX(width);
            }
            if (node.getY) {
              node.y = node.py = node.getY(height);
            }
          });
          force = force.size([width, height]).resume();
          stabilize();
        };

        var stabilize = function() {
          var iterations = 100;
          while ((force.alpha() > 1e-2) && --iterations) {
            force.tick();
          }
        };

        var force = d3.layout.force()
          .size([width, height])
          .nodes([])
          .linkDistance(45)
          .gravity(0.05)
          .charge(-50)
          .on('tick', tick);

        var node = svg.selectAll('.node'),
            link = svg.selectAll('.link');

        // Arrow
        svg.append('defs').append('marker')
            .attr('id', 'end' + uid)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 13 + nodeRadius)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
          .append('path')
            .attr('d', 'M0,-5L10,0L0,5');

        $scope.nodeSelected = false;
        $scope.nodeHovered = false;

        d3.select(window).on('resize', onResize);
        $scope.$watchCollection('[nodes, links]', refreshNodes);
        onResize();
      }
    };
  });
