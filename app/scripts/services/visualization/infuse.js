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
    var indexedViews = {};
    var deviceViews = {};
    r.build = function(scope) {
      scope.views = views;
      scope.defaultView = views[0];

      scope.getView = function(name) {
        for (var i = 0; i < views.length; ++i) {
          if (views[i].name === name || views[i].shortName === name) {
            return views[i];
          }
        }
      };

      scope.getDeviceViews = function(name) {
        var nameParts = name.split('.');
        var matchedViews = recurGetViews(deviceViews, nameParts, 0);
        return matchedViews.map(function(val) { return indexedViews[val]; });
      };

      var recurGetViews = function(views, types, idx) {
        if (!angular.isObject(views)) {
          return views || [];
        }
        return (views.views || []).concat(recurGetViews(views[types[idx]], types, ++idx));
      };

      return scope;
    };

    r.setViews = function(v) {
      views = v;
      views.forEach(function(val) { indexedViews[val.shortName] = val; });
    };

    r.setDeviceViews = function(v) {
      deviceViews = v;
    };
    return r;
  })
  .factory('leapVisualizationFactory', function() {
    var r = {};
    var views = [];
    r.build = function(scope) {
      scope.views = views;
      scope.defaultView = views[0];
      return scope;
    };
    r.setViews = function(v) {
      views = v;
    };
    return r;
  });
