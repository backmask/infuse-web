'use strict';

angular.module('infuseWebAppDevice')
  .factory('Leap', function() {
    var leap = new Leap.Controller();
    return leap;
  });