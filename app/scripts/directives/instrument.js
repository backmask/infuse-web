angular.module('infuseWebAppInstrument')
  .factory('instrumentConvert', function($interval) {
    var r = {};
    r.toSpeed = function(scope, field) {
      var intervalDelta = 250;
      var speed = 0;
      var previousDistance = scope[field];
      var previousSpeed = [];

      var average = function(arr) {
        var avg = 0;
        for (var i = 0; i < arr.length; ++i) {
          avg += arr[i] / arr.length;
        }
        return avg;
      }

      var refreshValue = function() {
        var distance = scope[field] - previousDistance;

        previousSpeed.unshift((distance / intervalDelta) * 1000);
        while (previousSpeed.length > 5) {
          previousSpeed.pop();
        }

        speed = average(previousSpeed);
        previousDistance = scope[field];
      }

      var removeInterval = $interval(refreshValue, intervalDelta, 0, false);
      scope.$on('$destroy', removeInterval);

      return function() {
        return speed;
      }
    };

    return r;
  });