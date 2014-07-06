'use strict';

angular.module('infuseWebAppVisualization')
  .factory('noVisualizationFactory', function() {
    return {
      build: function(scope) {
        scope.views = [];
        scope.defaultView = null;
        return scope;
      }
    };
  })
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
  })
  .factory('leapVisualizationFactory', function() {
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
  });;