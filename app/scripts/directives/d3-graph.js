'use strict';

angular.module('d3')
  .directive('d3Graph', function(d3) {
    return {
      restrict: 'E',
      scope: {
        width: '@',
        height: '@',
        nodes: '=',
        links: '='
      },
      controller: function($scope) {
        if (!angular.isDefined($scope.width)) { $scope.width = 200; }
        if (!angular.isDefined($scope.height)) { $scope.height = 100; }
      },
      link: function($scope, element, attrs, ctrl) {
        var width = $scope.width,
            height = $scope.height;

        var nodesMap = {};

        var tick = function() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

        var restart = function(newValue, oldValue) {
          newValue[0].forEach(function(node) {
            if (nodesMap[node.id])
              return;

            var newNode = {
              x: width / 2,
              y: height / 2,
              id: node.id,
              color: node.color
            };

            nodes.push(newNode);
            nodesMap[node.id] = newNode;
          });

          newValue[1].forEach(function(link) {
            links.push({
              source: nodesMap[link.from],
              target: nodesMap[link.to]
            });
          });

          link = link.data(links);

          link.enter().insert("line", ".node")
              .attr("class", "link");

          node = node.data(nodes);

          node.enter().insert("circle", ".cursor")
              .attr("class", "node")
              .style("fill", function(d) { return d.color; })
              .attr("r", 5)
              .call(force.drag);

          force.start();
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

        svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        var nodes = force.nodes(),
            links = force.links(),
            node = svg.selectAll(".node"),
            link = svg.selectAll(".link");

        $scope.$watchCollection('[nodes, links]', restart);
      }
    };
  });