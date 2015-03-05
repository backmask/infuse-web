'use strict';

angular.module('infuseWebAppCommon')
  .filter('shortNumber', function(numberFilter) {
    return function(input, unit) {
      unit = unit || '';
      if (input >= 1000000000) {
        return numberFilter(input / 1000000000, 2) + 'G' + unit;
      } else if (input >= 1000000) {
        return numberFilter(input / 1000000, 2) + 'M' + unit;
      } else if (input >= 1000) {
        return numberFilter(input / 1000, 2) + 'K' + unit;
      } else {
        return numberFilter(input, 2) + unit;
      }
    };
  })
  .filter('shortUuid', function() {
    return function(input) {
      return (input || 'unknown').substr(0, 5);
    };
  });
