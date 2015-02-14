'use strict';

angular.module('d3')
  .directive('d3Plot', function(d3, $window, $timeout) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        width: '@',
        height: '@'
      },
      controller: function($scope) {
        $scope.top = 10;
        $scope.left = 0;
        $scope.right = 30;
        $scope.bottom = 10;
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        element[0].style.width = scope.width;
        element[0].style.height = scope.height;

        var onResize = function() {
          var width = $(svg[0]).width();
          var height = $(svg[0]).height();
          var graphWidth = width - scope.left - scope.right;
          var graphHeight = height - scope.top - scope.bottom;
          scope.$parent.$broadcast('graphResized', graphWidth, graphHeight);

          yAxis.scale(d3.scale.linear().domain([-1, 1]).range([graphHeight, 0]))
            .ticks(graphHeight / 10)
            .tickSize(-graphWidth);

          yAxisContainer
            .attr('transform', 'translate(' + graphWidth + ',' + scope.top + ')')
            .call(yAxis);

          graphBackground
            .attr('width', graphWidth)
            .attr('height', graphHeight)
            .attr('transform', 'translate(' + scope.left + ',' + scope.top + ')');

          seriesContainer
            .attr('transform', 'translate(' + scope.left + ',' + (scope.top+1) + ')');
        }

        var svg = d3.select(element[0]).append("svg")
          .attr("width", "100%")
          .attr("height", "100%");

        var yAxis = d3.svg.axis().orient('right');

        var yAxisContainer = svg.append('g')
          .attr('class', 'y axis');

        var graphBackground = svg.append('rect')
          .attr('class', 'graph-border');

        var seriesContainer = svg.append('g');

        transclude(scope.$parent, function(content) {
          $(seriesContainer[0]).append(content);
        });

        angular.element($window).bind('resize', onResize);
        $timeout(onResize);
      }
    };
  })
  .directive('d3Series', function(d3, $window) {
    return {
      restrict: 'E',
      require: '^d3Plot',
      scope: {
        color: '=',
        data: '='
      },
      link: function(scope, element, attrs, d3Plot) {
        scope.width = 0;
        scope.height = 0;

        var onResize = function(event, width, height) {
          scope.width = width;
          scope.height = height;

          x.domain([0, width])
            .range([0, width]);

          y.domain([-1, 1])
           .range([height, 0]);
        }

        var repaint = function(data) {
          path.attr("d", line(data));
        }

        var x = d3.scale.linear();
        var y = d3.scale.linear();

        var line = d3.svg.line()
          .x(function(d, i) { return x(i); })
          .y(function(d, i) { return y(d); });

        var path = d3.select(element[0].parentNode).append('path')
          .style('stroke', scope.color)
          .attr('class', 'line');

        scope.$watchCollection('data', function(val) {
          if (val.length > scope.width) {
            scope.data = val.slice(val.length - scope.width);
          }
          repaint(scope.data);
        });

        element[0].parentNode.removeChild(element[0]);
        onResize(0 ,0);
        scope.$on('graphResized', onResize);
        repaint(scope.data);
      }
    };
  });