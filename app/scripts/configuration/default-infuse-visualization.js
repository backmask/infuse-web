'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(infuseVisualizationFactory) {
    infuseVisualizationFactory.setViews([{
      name: 'Clients overview',
      template: 'views/infuse/overview.html',
      controller: 'OverviewCtrl'
    }, {
      name: 'Processing pipeline overview',
      template: 'views/infuse/processing-pipeline.html',
      controller: 'ProcessingPipelineCtrl'
    }, {
      name: 'Client processing pipeline',
      template: 'views/infuse/client-processing-pipeline.html',
      controller: 'ClientProcessingPipelineCtrl',
      hidden: true
    }, {
      name: 'Data view',
      template: 'views/infuse/data-view.html',
      controller: 'DataViewCtrl',
      hidden: true
    }, {
      name: 'Data graph',
      template: 'views/infuse/data-graph.html',
      controller: 'DataGraphCtrl',
      hidden: true
    }, {
      name: 'Controller display',
      template: 'views/infuse/controller.html',
      controller: 'ControllerCtrl',
      hidden: true
    }, {
      name: 'Flight instruments',
      template: 'views/infuse/flight-instruments.html',
      controller: 'FlightInstrumentsCtrl',
      hidden: true
    }]);
    infuseVisualizationFactory.setDeviceViews({
      'controller': ['Controller display'],
      'flight.quadcopter': ['Flight instruments']
    });
  });
