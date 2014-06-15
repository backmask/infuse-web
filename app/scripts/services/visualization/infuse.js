'use strict';

angular.module('infuseWebAppVisualization')
  .factory('infuseVisualizationFactory', function() {
    var r = {};
    var views = [];
    r.build = function(scope) {
      scope.views = views;
      scope.defaultView = views[0];
      return scope;
    }
    r.setViews = function(v) {
      views = v;
    }
    return r;
  });