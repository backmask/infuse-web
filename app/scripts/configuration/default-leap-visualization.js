'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(leapVisualizationFactory) {
    leapVisualizationFactory.setViews([{
      name: "XYZ plot",
      template: "views/leap/xyz-plot.html",
      controller: "XyzPlotCtrl"
    }])
  });