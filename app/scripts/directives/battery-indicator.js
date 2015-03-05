'use strict';

angular.module('infuseWebAppCommon')
  .directive('batteryIndicator', function() {
    return {
      scope: {
        data: '='
      },
      link: function(scope, element) {
        element.addClass('battery');

        var updateValue = function(newValue) {
          if (!angular.isNumber(newValue)) {
            return;
          }
          var val = Math.floor(newValue * 100);
          element.text(val + '%');
          element.toggleClass('battery-high', val > 80);
          element.toggleClass('battery-low', val < 35 && val > 15);
          element.toggleClass('battery-critical', val <= 15);
        };

        scope.$watch('data', updateValue);
     }
   };
  });
