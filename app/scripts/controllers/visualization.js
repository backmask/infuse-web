'use strict';

angular.module('infuseWebAppVisualization')
  .factory('visualizationManager', function() {
    var r = {};
    var activeVisualizations = [];

    r.visualize = function(vis, scope) {
      var visCopy = {
        template: vis.template,
        controller: vis.controller,
        scope: scope
      };
      activeVisualizations.push(visCopy);
    }

    r.getVisualizations = function() {
      return activeVisualizations;
    }

    return r;
  })
  .controller('VisualizationCtrl', function($scope, visualizationManager) {
    $scope.visualizations = visualizationManager.getVisualizations();
  });