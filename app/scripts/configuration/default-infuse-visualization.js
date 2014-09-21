'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(infuseVisualizationFactory) {
    infuseVisualizationFactory.setViews([{
      name: "Clients overview",
      template: "views/infuse/overview.html",
      controller: "OverviewCtrl"
    }, {
      name: "Processing pipeline",
      template: "view/infuse/processing-pipeline.html",
      controller: "ProcessingPipelineCtrl"
    }]);
  });