'use strict';

angular.module('d3')
  .directive('d3Plot', function(d3) {
    return {
      restrict: 'A',
      transclude: true,
      scope: {
        width: '@',
        height: '@'
      },
      controller: function($scope) {
        if (!angular.isDefined($scope.width)) { $scope.width = 200; }
        if (!angular.isDefined($scope.height)) { $scope.height = 100; }
        $scope.top = 20;
        $scope.left = 0;
        $scope.right = 30;
        $scope.bottom = 20;
        $scope.graphWidth = $scope.width - $scope.left - $scope.right;
        $scope.graphHeight = $scope.height - $scope.top - $scope.bottom;

        this.width = $scope.graphWidth;
        this.height = $scope.graphHeight - 1;
      },
      link: function(scope, element, attrs, ctrl, transclude) {
        var yAxis = d3.svg.axis()
          .scale(d3.scale.linear().domain([-1, 1]).range([scope.graphHeight, 0]))
          .ticks(scope.graphHeight / 10)
          .tickSize(-scope.graphWidth)
          .orient('right');

        d3.select(element[0]).append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + scope.graphWidth + ',' + scope.top + ')')
          .call(yAxis);

        d3.select(element[0]).append('rect')
          .attr('width', scope.graphWidth)
          .attr('height', scope.graphHeight)
          .attr('class', 'graph-border')
          .attr('transform', 'translate(' + scope.left + ',' + scope.top + ')')

        transclude(scope.$parent, function(content) {
          element.find('g[name=graph]').append(content);
        });
      },
      template: '<g name="graph" transform="translate({{left}}, {{top+1}})"></g>'
    };
  })
  .directive('d3Series', function(d3) {
    return {
      restrict: 'E',
      require: '^d3Plot',
      scope: {
        color: '@',
        data: '='
      },
      link: function(scope, element, attrs, d3Plot) {
        scope.width = d3Plot.width;
        scope.height = d3Plot.height;
        scope.data = angular.isDefined(scope.data) ? scope.data : d3.range(scope.width).map(d3.functor(0));

        var x = d3.scale.linear()
          .domain([0, scope.width])
          .range([0, scope.width]);

        var y = d3.scale.linear()
          .domain([-1, 1])
          .range([scope.height, 0]);

        var line = d3.svg.line()
          .x(function(d, i) { return x(i); })
          .y(function(d, i) { return y(d); });

        var path = d3.select(element[0].parentNode).append('path')
          .style('stroke', scope.color)
          .attr('class', 'line');

        var repaint = function(data) {
          path.attr("d", line(data));
        }

        scope.$watchCollection('data', function(val) {
          if (val.length > scope.width) {
            scope.data = val.slice(val.length - scope.width);
          }
          repaint(scope.data);
        });

        element[0].parentNode.removeChild(element[0]);
        repaint(scope.data);
      }
    };
  });