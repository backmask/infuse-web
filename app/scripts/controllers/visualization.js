'use strict';

angular.module('infuseWebAppVisualization')
  .factory('visualizationManager', function() {
    var r = {};
    var activeVisualizations = [];

    r.visualize = function(vis) {
      activeVisualizations.push(vis);
    }

    r.getVisualizations = function() {
      return activeVisualizations;
    }

    return r;
  })
  .controller('VisualizationCtrl', function($scope, visualizationManager) {
    $scope.visualizations = visualizationManager.getVisualizations();
  });