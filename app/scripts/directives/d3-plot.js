'use strict';

angular.module('d3')
  .directive('d3Plot', function(d3, $window, $timeout) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        width: '@',
        height: '@',
        scale: '='
      },
      controller: function($scope) {
        $scope.top = 10;
        $scope.left = 0;
        $scope.right = 30;
        $scope.bottom = 10;
        this.graphWidth = 0;
        this.graphHeight = 0;
        this.xScale = d3.scale.linear();
        this.yScale = d3.scale.linear();
        this.seriesCount = 0;

        if (angular.isArray($scope.scale)) {
          this.yScale.domain($scope.scale);
        } else if ($scope.scale !== 'auto') {
          this.yScale.domain([-1, 1]);
        }
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        element[0].style.width = scope.width;
        element[0].style.height = scope.height;

        if (scope.scale === 'auto') {
          var min = Number.MAX_VALUE;
          var max = Number.MIN_VALUE;
          ctrl.refreshScale = function(data) {
            data.forEach(function(d) {
              if (min > d) { min = d; }
              if (max < d) { max = d; }
            });
            if (ctrl.yScale.domain()[0] !== min || ctrl.yScale.domain()[1] !== max) {
              ctrl.yScale.domain([min, max]);
              updateScale(ctrl.graphWidth, ctrl.graphHeight);
            }
          };
        }

        var updateScale = function(w, h) {
          ctrl.xScale.domain([0, w/3]).range([0, w]);
          ctrl.yScale.range([h, 0]);
          yAxis.scale(ctrl.yScale)
            .ticks(h / 10)
            .tickSize(-w);
          yAxisContainer.call(yAxis);
        };

        var onResize = function() {
          var width = $(svg[0]).width();
          var height = $(svg[0]).height();
          if (width === 0 || height === 0) {
            return;
          }

          ctrl.graphWidth = width - scope.left - scope.right;
          ctrl.graphHeight = height - scope.top - scope.bottom;
          updateScale(ctrl.graphWidth, ctrl.graphHeight);

          yAxisContainer
            .attr('transform', 'translate(' + ctrl.graphWidth + ',' + scope.top + ')');

          graphBackground
            .attr('width', ctrl.graphWidth)
            .attr('height', ctrl.graphHeight)
            .attr('transform', 'translate(' + scope.left + ',' + scope.top + ')');

          seriesContainer
            .attr('transform', 'translate(' + scope.left + ',' + (scope.top+1) + ')');
        };

        var svg = d3.select(element[0]).append('svg')
          .attr('width', '100%')
          .attr('height', '100%');

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
  .directive('d3Series', function(d3) {
    return {
      restrict: 'E',
      require: '^d3Plot',
      scope: {
        color: '=',
        data: '=',
        label: '='
      },
      link: function(scope, element, attrs, d3Plot) {
        var repaint = function(data) {
          path.attr('d', line(data));
        };

        var x = d3Plot.xScale;
        var y = d3Plot.yScale;

        var line = d3.svg.line()
          .x(function(d, i) { return x(i); })
          .y(function(d)    { return y(d); });

        var path = d3.select(element[0].parentNode).append('path')
          .style('stroke', scope.color)
          .attr('class', 'line');

        var label = d3.select(element[0].parentNode).append('g')
          .attr('transform', 'translate(2, ' + ((d3Plot.seriesCount++) * 13 + 1) + ')');
        label.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .style('stoke', '1px solid black')
          .style('fill', scope.color);
        label.append('text')
          .attr('x', 14)
          .attr('y', 10)
          .text(scope.label);

        scope.$watchCollection('data', function(val) {
          if (d3Plot.refreshScale) {
            d3Plot.refreshScale(scope.data);
          }

          var xMax = d3Plot.xScale.domain()[d3Plot.xScale.domain().length - 1] + 1;
          if (val.length > xMax) {
            scope.data = val.slice(val.length - xMax);
          }
          repaint(scope.data);
        });

        element[0].parentNode.removeChild(element[0]);
        repaint(scope.data);
      }
    };
  });
