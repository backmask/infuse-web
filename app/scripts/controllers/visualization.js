'use strict';

angular.module('infuseWebAppVisualization')
  .factory('visualizationManager', function() {
    var r = {};
    var activeVisualizations = [];

    r.visualize = function(vis, scope, visParameters) {
      var visCopy = angular.copy(vis);
      visCopy.scope = scope.$new();
      visCopy.stop = function() { r.stopVisualization(visCopy); }
      if (visParameters) {
        for (var key in visParameters) {
          visCopy.scope[key] = visParameters[key];
        }
      }
      activeVisualizations.push(visCopy);
    }

    r.stopVisualization = function(vis) {
      vis.scope.$destroy();
      activeVisualizations.splice(activeVisualizations.indexOf(vis), 1);
    }

    r.getVisualizations = function() {
      return activeVisualizations;
    }

    return r;
  })
  .controller('VisualizationCtrl', function($scope, visualizationManager) {
    $scope.visualizations = visualizationManager.getVisualizations();
  });