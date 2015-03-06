'use strict';

angular.module('infuseWebAppVisualization')
  .controller('VisualizationCtrl', function($scope, visualizationManager) {
    $scope.visualizations = visualizationManager.getVisualizations();
  });
