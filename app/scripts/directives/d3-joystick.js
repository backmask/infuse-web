angular.module('d3')
  .directive('d3Joystick', function(d3, $timeout, $window) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        width: '@',
        height: '@',
        nodes: '=',
      },
      link: function(scope, element, attrs) {
        var circleRadius = 0;
        var padding = 4;
        element[0].style.width = scope.width;
        element[0].style.height = scope.height;

        var buildMarker = function(name, container) {
          return container.append("path")
            .classed(name, true)
            .attr("d", "M0,-3L5,0L0,3");
        }

        var onUpdate = function() {
          var normalized = scope.nodes.map(function(d) {
            var len = Math.sqrt(d.x * d.x + d.y * d.y);
            return [d.x / len,]
          });
          values = values.data(scope.nodes);
          values.exit().remove();
          values.enter()
            .insert('circle', '.node')
            .classed('node', true)
            .style('fill', function(d) { return d.color; })
            .attr('r', 3);
          values.attr('cx', function(d) { return d.x * (circleRadius - 3); })
            .attr('cy', function(d) { return d.y * (circleRadius - 3); });
        }

        var onResize = function() {
          var width = $(svg[0]).width();
          var height = $(svg[0]).height();
          container.attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

          circleRadius = Math.min(width, height)/2 - padding;
          background.attr('width', circleRadius * 2 + 'px')
                    .attr('height', circleRadius * 2 + 'px')
                    .attr('transform', 'translate(-' + circleRadius + ',-' + circleRadius + ')');

          values.attr('cx', function(d) { return d.x * circleRadius; })
            .attr('cy', function(d) { return d.y * circleRadius; });

          yAxis.scale(d3.scale.linear()
            .domain([-1, 1])
            .range([-circleRadius, circleRadius]))
            .tickSize(5)
            .ticks(7);
          xAxis.scale(d3.scale.linear().domain([-1, 1])
            .range([-circleRadius, circleRadius]))
            .tickSize(5)
            .ticks(7);

          yAxisContainer.call(yAxis);
          xAxisContainer.call(xAxis);

          xMarker.attr('transform', 'translate(' + (circleRadius - 5) + ',0)');
          yMarker.attr('transform', 'translate(1,' + (circleRadius - 5) + ') rotate(90)');
        }

        var uid = 'rnd-' + Math.random();

        var svg = d3.select(element[0]).append("svg")
          .attr("width", scope.width)
          .attr("height", scope.height);

        var container = svg.append('g')
          .attr("width", '100%')
          .attr("height", '100%');

        var background = container.append('rect')
          .classed('background', true);

        var yAxis = d3.svg.axis().orient('right');
        var yAxisContainer = container.append('g')
          .attr('class', 'y-axis');
        var xAxis = d3.svg.axis().orient('top');
        var xAxisContainer = container.append('g')
          .attr('class', 'x-axis');

        var values = container.append('g').classed('nodes', true)
          .selectAll('.node');

        var xMarker = buildMarker('x-marker', xAxisContainer);
        var yMarker = buildMarker('y-marker', yAxisContainer);

        angular.element($window).bind('resize', onResize);
        $timeout(onResize);
        scope.$watch('nodes', onUpdate, true);
      }
    }
  });