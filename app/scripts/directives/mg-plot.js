'use strict';

angular.module('infuseWebAppCommon')
  .directive('mgPlot', function($window, $timeout) {
    return {
      restrict: 'E',
      scope: {
        width: '@',
        height: '@',
        data: '='
      },
      link: function(scope, element, attrs) {
        element[0].style.display = 'inline-block';
        element[0].style.width = scope.width;
        element[0].style.height = scope.height;

        var graphic = {
          'data': scope.data,
          'target': element[0],
          //'area': false,
          'full_width': true,
          'full_height': true,
          'transition_on_update': false,
          'x_accessor': 'date',
          'y_accessor': 'value',
          'min_y_from_data': true,
          'buffer': 0,
          'left': 25,
          'top': 10
        };

        var repaint = function() {
          if (graphic.data && graphic.data.length > 0) {
            MG.data_graphic(graphic);
          }
        };

        scope.$watchCollection('data', function(val) {
          graphic.data = val;
          repaint();
        });
      }
    };
  });
