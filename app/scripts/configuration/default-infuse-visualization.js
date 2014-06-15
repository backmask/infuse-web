'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(infuseVisualizationFactory) {
    infuseVisualizationFactory.setViews([{
      name: "Clients overview",
      layout: "views/infuse/clients-overview.html",
      controller: "blankCtrl"
    }])
  });