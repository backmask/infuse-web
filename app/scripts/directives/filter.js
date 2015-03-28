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
  })
  .filter('time', function(numberFilter) {
    var ns = 1;
    var us = ns * 1000;
    var ms = us * 1000;
    var s = ms * 1000;
    var m = s * 60;
    var h = m * 60;
    var d = m * 24;

    var apply = function(input) {
      if (input < ns * 100) {
        return input + 'ns';
      } else if (input < us * 100) {
        return numberFilter(input / us, 1) + 'us';
      } else if (input < ms * 100) {
        return numberFilter(input / ms, 1) + 'ms';
      } else if (input < s * 100) {
        return numberFilter(input / s, 1) + 's';
      } else if (input < m * 100) {
        return numberFilter(input / m, 1) + 'm' + apply(input - m);
      } else if (input < h * 100) {
        return numberFilter(input / h, 1) + 'h' + apply(input - h);
      } else if (input < d * 100) {
        return numberFilter(input / d, 1) + 'd' + apply(input - d);
      }
    };

    return apply;
  });
