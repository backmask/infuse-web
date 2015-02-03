'use strict';

angular.module('infuseWebAppVisualization')
  .factory('visualizationManager', function() {
    var r = {};
    var activeVisualizations = [];

    r.visualize = function(vis, scope, visParameters) {
      var visCopy = angular.copy(vis);
      visCopy.scope = scope.$new();
      visCopy.scope.$emit('add-visualization');
      visCopy.scope.title = {
        name: vis.name,
        description: scope.name + ' ' + scope.description
      };
      visCopy.stop = function() { r.stopVisualization(visCopy); }
      if (visParameters) {
        for (var key in visParameters) {
          visCopy.scope[key] = visParameters[key];
        }
      }
      if (visCopy.scope.onInit) {
        visCopy.scope.onInit(visCopy.scope);
      }
      activeVisualizations.push(visCopy);
    }

    r.stopVisualization = function(vis) {
      vis.scope.$emit('remove-visualization');
      vis.scope.$destroy();
      if (vis.scope.onStop) {
        vis.scope.onStop(vis.scope);
      }
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