'use strict';

angular.module('infuseWebAppVisualization')
  .run(function(infuseVisualizationFactory) {
    infuseVisualizationFactory.setViews([{
      name: 'Clients overview',
      shortName: 'overview',
      template: 'views/infuse/overview.html',
      controller: 'OverviewCtrl'
    }, {
      name: 'Processing pipeline overview',
      shortName: 'pipeline-overview',
      template: 'views/infuse/processing-pipeline.html',
      controller: 'ProcessingPipelineCtrl'
    }, {
      name: 'Recorder/Playback',
      shortName: 'record',
      template: 'views/infuse/record.html',
      controller: 'RecordCtrl'
    }, {
      name: 'Client processing pipeline',
      shortName: 'client-pipeline',
      template: 'views/infuse/client-processing-pipeline.html',
      controller: 'ClientProcessingPipelineCtrl',
      hidden: true
    }, {
      name: 'Data view',
      shortName: 'view',
      template: 'views/infuse/data-view.html',
      controller: 'DataViewCtrl',
      hidden: true
    }, {
      name: 'Data graph',
      shortName: 'plot',
      template: 'views/infuse/data-graph.html',
      controller: 'DataGraphCtrl',
      hidden: true
    }, {
      name: 'Controller display',
      shortName: 'controller',
      template: 'views/infuse/controller.html',
      controller: 'ControllerCtrl',
      hidden: true
    }, {
      name: 'Flight instruments',
      shortName: 'flight',
      template: 'views/infuse/flight-instruments.html',
      controller: 'FlightInstrumentsCtrl',
      hidden: true
    }]);
    infuseVisualizationFactory.setDeviceViews({
      views: [],
      controller: ['controller'],
      flight : {
        quadcopter: ['flight']
      }
    });
  });
