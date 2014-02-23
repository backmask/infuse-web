'use strict';

angular.module('d3')
  .directive('d3Plot', function(d3) {
    return {
      restrict: 'E',
      scope: {
        width: '@',
        height: '@',
        data: '='
      },
      link: function(scope, element, attrs) {
        var width = angular.isDefined(attrs.width) ? attrs.width : 100;
        var height = angular.isDefined(attrs.height) ? attrs.height : 100;
        scope.data = angular.isDefined(scope.data) ? scope.data : d3.range(width).map(d3.functor(0));

        var x = d3.scale.linear()
          .domain([0, width])
          .range([0, width]);

        var y = d3.scale.linear()
          .domain([-1, 1])
          .range([height, 0]);

        var line = d3.svg.line()
          .x(function(d, i) { return x(i); })
          .y(function(d, i) { return y(d); });

        var svg = d3.select(element[0]).append('svg')
          .attr('width', width)
          .attr('height', height);

        var path = svg.append('path')
          .attr('class', 'line')
          .attr('d', line(scope.data));

        var repaint = function(data) {
          path.attr("d", line(data));
        }

        scope.$watchCollection('data', function(val) {
          if (val.length > width) {
            scope.data = val.slice(val.length - width);
          }
          repaint(scope.data);
        });

        repaint(scope.data);
      }
    };
  })
  .directive('d3Series', function(d3) {
    return {
      restrict: 'E',
      scope: {
        width: '&',
        height: '&',
        data: '='
      },
      link: function(scope, element, attrs) {

      }
    };
  });