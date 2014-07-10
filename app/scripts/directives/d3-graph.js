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
        links: '='
      },
      link: function($scope, element, attrs, ctrl, transclude) {
        transclude($scope, function(content) {
          element.append(content);
        });
        var nodeRadius = 5;
        var width = $scope.width;
        var height = $scope.height;

        var nodesMap = {};
        var linksMap = {};

        var tick = function() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        var refreshNodes = function(newValue, oldValue) {
          newValue[0].forEach(function(node) {
            if (nodesMap[node.id])
              return;

            var newNode = angular.copy(node);
            newNode.x = width / 2;
            newNode.y = height / 2;

            nodes.push(newNode);
            nodesMap[node.id] = newNode;
          });

          newValue[1].forEach(function(link) {
            var linkId = link.from + ':' + link.to;
            if (linksMap[linkId])
              return;

            links.push({
              source: nodesMap[link.from],
              target: nodesMap[link.to]
            });
            linksMap[linkId] = true;
          });

          restart();
        }

        var restart = function() {
          link = link.data(links);

          link.enter().insert("line", ".node")
              .attr("class", "link");

          node = node.data(nodes);

          node.enter().insert("circle", ".cursor")
              .attr("class", "node")
              .style("fill", function(d) { return d.color; })
              .attr("r", nodeRadius)
              .on("mouseover", function(d) {
                $scope.$apply(function() {
                    $scope.nodeSelected = d;
                    $scope.nodeHovered = true;
                });

                if (!tooltip) return;
                var nPosition = $(this).position();
                tooltip
                  .style("position", "absolute")
                  .style("left", (nPosition.left + nodeRadius - $(tooltip[0]).width() / 2) + "px")
                  .style("top", (nPosition.top - nodeRadius - $(tooltip[0]).height()) + "px");
              })
              .on("mouseout", function(d) {
                $scope.$apply(function() {
                    $scope.nodeHovered = false;
                });
              })
              .call(force.drag);

          force.start();
        }

        var onResize = function() {
          width = $(svg[0]).width();
          height = $(svg[0]).height();
          force = force.size([width, height]).resume();
        }

        var fill = d3.scale.category20();
        var force = d3.layout.force()
          .size([width, height])
          .nodes([])
          .linkDistance(45)
          .charge(-40)
          .on("tick", tick);

        var svg = d3.select(element[0]).append("svg")
          .attr("width", width)
          .attr("height", height);
        var domTooltip = element.find('.tooltip')[0];
        var tooltip = domTooltip ? d3.select(domTooltip) : null;

        var nodes = force.nodes(),
            links = force.links(),
            node = svg.selectAll(".node"),
            link = svg.selectAll(".link");

        $scope.nodeSelected = false;
        $scope.nodeHovered = false;

        d3.select(window).on('resize', onResize);
        $scope.$watchCollection('[nodes, links]', refreshNodes);
        onResize();
      }
    };
  });