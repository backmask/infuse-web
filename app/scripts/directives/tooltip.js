angular.module('infuseWebAppCommon')
  .directive('d3Tooltip', function($timeout) {
    return {
      restrict: 'E',
      scope: {
        show : '='
      },
      transclude: true,
      replace: true,
      link: function(scope, element, attrs) {
        var timeout = false;

        var onHover = function() {
          if (scope.show || element.hasClass('in')) {
            $timeout.cancel(timeout);
            element.toggleClass('in', true);
            element.css('pointer-events', 'all');
          }
        }

        var onOut = function() {
          $timeout.cancel(timeout);
          timeout = $timeout(function() {
            element.toggleClass('in', false);
            element.css('pointer-events', 'none');
          }, 25);
        }

        scope.$watch('show', function(newValue) {
          if (newValue) {
            onHover();
          } else {
            onOut();
          }
        });

        element.hover(onHover, onOut);
      },
      template: ''
        + '<div class="tooltip top">'
        + '  <div class="tooltip-arrow"></div>'
        + '  <div class="tooltip-inner" ng-transclude></div>'
        + '</div>'
    };
  }
);