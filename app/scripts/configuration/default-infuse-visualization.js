'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(infuseVisualizationFactory) {
    infuseVisualizationFactory.setViews([{
      name: "Clients overview",
      template: "views/infuse/overview.html",
      controller: "OverviewCtrl"
    }, {
      name: "Processing pipeline overview",
      template: "views/infuse/processing-pipeline.html",
      controller: "ProcessingPipelineCtrl"
    }, {
      name: "Client processing pipeline",
      template: "views/infuse/client-processing-pipeline.html",
      controller: "ClientProcessingPipelineCtrl"
    }]);
  });