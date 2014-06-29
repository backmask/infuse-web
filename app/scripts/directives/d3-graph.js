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
        var linksMap = {};

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
              color: node.color,
              tooltip: node.tooltip
            };

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

          link = link.data(links);

          link.enter().insert("line", ".node")
              .attr("class", "link");

          node = node.data(nodes);

          node.enter().insert("circle", ".cursor")
              .attr("class", "node")
              .style("fill", function(d) { return d.color; })
              .attr("r", 5)
              .on("mouseover", function(d) {
                if (!d.tooltip) return;
                var nPosition = this.getScreenCTM()
                  .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
                tooltipText.html(d.tooltip);
                tooltip
                  .style("opacity", 1)
                  .style("position", "absolute")
                  .style("left", (nPosition.e - $(tooltip[0]).width() / 2) + "px")
                  .style("top", (nPosition.f - $(tooltip[0]).height() - 10) + "px");
              })
              .on("mouseout", function(d) {
                tooltip
                  .style("opacity", 0);
              })
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

        var tooltip = d3.select(element[0]).append("div")
          .attr("class", "tooltip top")
          .style("pointer-events", "none")
          .style("opacity", 0);
        tooltip.append("div").attr("class", "tooltip-arrow");
        var tooltipText = tooltip.append("div").attr("class", "tooltip-inner");


        var nodes = force.nodes(),
            links = force.links(),
            node = svg.selectAll(".node"),
            link = svg.selectAll(".link");

        $scope.$watchCollection('[nodes, links]', restart);
      }
    };
  });