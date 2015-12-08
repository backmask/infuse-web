'use strict';

angular.module('infuseWebApp')
  .directive('rowFill', function($window) {
    return {
      restrict: 'AE',
      scope: {
      },
      link: function (scope, element, attrs) {
        element.css('position', 'relative');
        element.css('overflow', 'auto');
      }
    }
  });
