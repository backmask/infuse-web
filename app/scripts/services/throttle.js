angular.module('infuseWebApp')
  .factory('throttle', function() {
    return function (func, wait) {
      var context, args, timeout, result;
      var previous = 0;
      var later = function() {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
      };
      return function() {
        var now = new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    };
  });