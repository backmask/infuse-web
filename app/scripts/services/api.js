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

    r.plotStructures = function(subclient, structUids, filter, seriesMapper) {
      var pipe;
      seriesMapper = seriesMapper || function(uid, payload) {
        var label = uid;
        if (payload.symbol) {
          label += '[' + payload.symbol + ']';
        }
        return label;
      };

      var setupPipe = function(sc) {
        var idx = 0;
        var seriesMap = {};

        var getSeries = function(label) {
          var r = seriesMap[label];
          if (!r) {
            console.log(label);
            r = {
              color: window.randomColor({ luminosity: 'bright'}),
              label: label,
              data: []
            };
            seriesMap[label] = r;
            sc.series.push(r);
          }
          return r;
        };

        pipe = subclient.pipeStructures(structUids, function(d) {
          var label = seriesMapper(d.dataUid, d.data);
          var res = filter ? filter(d.dataUid, d.data, ++idx) : d.data.value;
          if (!isNaN(res)) {
            var s = getSeries(label);
            if (s) {
              s.data.push(res);
            }
          }
        });
      };

      visualizationManager.visualize(
        subclient.getView('plot'),
        subclient, {
          onInit: setupPipe,
          series: []
        });

      subclient.$on('$destroy', function() {
        pipe.then(function(p) { p.destroy(); });
      });
    };

    $window.api = r;
  });
