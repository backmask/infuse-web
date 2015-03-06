'use strict';

angular.module('infuseWebApp')
  .run(function($window, $rootScope, $q, device, connectionManager, visualizationManager, notifier) {
    var r = {};

    r.device = device;
    r.connectionManager = connectionManager;
    r.visualizationManager = visualizationManager;

    r.devices = device.getRegisteredDevices();
    r.connect = connectionManager.openConnection;
    r.connections = connectionManager.getManagedConnections;
    r.view = visualizationManager.visualize;
    r.views = visualizationManager.getVisualizations;
    r.notify = notifier;

    r.connectOpt = function(device) {
      var managed = connectionManager.getManagedConnections();
      for (var i = 0; i < managed.length; ++i) {
        if (managed[i].device === device) {
          return $q.when(managed[i]);
        }
      }
      return connectionManager.openConnection(device);
    };

    r.plotStructures = function(subclient, structUids, filter) {
      var pipe;

      var setupPipe = function(sc) {
        var idx = 0;
        pipe = subclient.pipeStructures(structUids, function(d) {
          var res = filter ? filter(d.dataUid, d.data, ++idx) : d.data.value;
          if (!isNaN(res)) {
            sc.series[0].data.push(res);
          }
        });
      };

      visualizationManager.visualize(
        subclient.getView('plot'),
        subclient, {
          onInit: setupPipe,
          series: [{
            color: window.randomColor({ luminosity: 'bright'}),
            data: []
          }]
        });

      subclient.$on('$destroy', function() {
        pipe.then(function(p) { p.destroy(); });
      });
    };

    $window.api = r;
  });
