'use strict';

angular.module('infuseWebApp')
  .directive('rowFill', function($window) {
    return {
      restrict: 'AE',
      scope: {},
      link: function (scope, element) {
        element.css('position', 'relative');
        element.css('overflow', 'auto');

        var onResize = function() {
          var eltRect = element[0].getBoundingClientRect();
          var eltHeight = $window.innerHeight - eltRect.top;
          eltHeight -= parseInt(getComputedStyle(element[0]).marginBottom);
          element.css('height', eltHeight + 'px');
        };

        angular.element($window).bind('resize', onResize);
        onResize();
      }
    }
  });
