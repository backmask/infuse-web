'use strict';

angular.module('infuseWebApp')
  .factory('Leap', function() {
    var leap = new Leap.Controller({host: '192.168.0.49'});
    return leap;
  });