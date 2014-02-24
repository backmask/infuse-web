'use strict';

angular.module('infuseWebApp')
  .factory('Leap', function() {
    var leap = new Leap.Controller();
    return leap;
  });