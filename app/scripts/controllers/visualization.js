'use strict';

angular.module('infuseWebAppVisualization')
  .factory('visualizationManager', function() {
    var r = {};
    var activeVisualizations = [];

    r.visualize = function(vis, scope) {
      var visCopy = angular.copy(vis);
      visCopy.scope = scope;
      visCopy.stop = function() { r.stopVisualization(visCopy); }
      activeVisualizations.push(visCopy);
    }

    r.stopVisualization = function(vis) {
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