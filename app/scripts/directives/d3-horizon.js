angular.module('d3')
  .directive('d3Horizon', function(d3, $timeout, $window) {
    return {
      restrict: 'E',
      scope: {
        width: '@',
        height: '@',
        pitch: '=',
        roll: '='
      },
      link: function(scope, element, attrs) {
        var side = 0;
        var scale = 2;
        var width = 0, height = 0;
        element[0].style.width = scope.width;
        element[0].style.height = scope.height;
        scope.roll = 0;
        scope.pitch = 0;

        var onUpdate = function() {
          container.attr('transform', 'rotate(' + scope.roll + ' ' + width/2 + ' ' + height/2 + ') '
            + 'translate(-' + 0 + ',' + (-scope.pitch/180*side) + ')');
        }

        var onResize = function() {
          width = $(svg[0]).width();
          height = $(svg[0]).height();
          side = Math.max(width, height) * scale;
          var backgroundPaddingX = (side-width)/2;
          var backgroundPaddingY = (side-height)/2;

          ground.attr('width', side)
                .attr('height', side)
                .attr('transform', 'translate(-' + backgroundPaddingX + ',' + backgroundPaddingY + ')');
          sky.attr('width', side)
             .attr('height', side)
             .attr('transform', 'translate(-' + backgroundPaddingX + ',-' + (side-backgroundPaddingY) + ')');

          plane.attr('transform', 'translate(' + width/2 + ',' + height/2
            + ') scale(' + width/200 + ')');

          yAxis.scale(d3.scale.linear().domain([-180, 180]).range([-height*scale, height*scale]))
            .ticks(72);

          yAxisContainer
            .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')')
            .call(yAxis)
            .call(function(s) {
              s.select('path').remove();
              s.selectAll('line')
                .attr('x1', function(d) { return d%2 == 0 ? -width/5 : -width/16 })
                .attr('x2', function(d) { return d%2 == 0 ? width/5 : width/16 });
              s.selectAll('text').each(function(d) {
                var self = d3.select(this);
                if (d%2 != 0) self.remove();
                else {
                  self.attr('transform', 'translate(' + width/5 + ',0)');
                }
              });
            });

          onUpdate();
        }

        var svg = d3.select(element[0]).append("svg")
          .attr("width", "100%")
          .attr("height", "100%");

        var container = svg.append('g');
        var ground = container.append('rect').classed('ground', true);
        var sky = container.append('rect').classed('sky', true);
        var yAxis = d3.svg.axis().orient('right').tickFormat(function(d) { return Math.abs(d); });
        var yAxisContainer = container.append('g').classed('axis', true);

        var plane = svg.append('path')
          .attr('d', 'M-50,0H-25L-12.5,12.5L0,0L12.5,12.5L25,0H50')
          .classed('plane', true);

        angular.element($window).bind('resize', onResize);
        $timeout(onResize);
        scope.$watch('[pitch, roll]', onUpdate);
      }
    }
  });