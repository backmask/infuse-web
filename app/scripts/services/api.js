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

    r.plotNode = function(subclient, nodeUri, structUids, filter, seriesMapper) {
      plotGenerator(subclient, function(cb) {
        return subclient.pipeNode({
          stream: 'out',
          uri: nodeUri,
          target: subclient.sessionClientUuid
        }, structUids, cb);
      }, filter, seriesMapper);
    };

    r.plotStructures = function(subclient, structUids, filter, seriesMapper) {
      plotGenerator(subclient, function(cb) {
        return subclient.pipeStructures(structUids, cb);
      }, filter, seriesMapper);
    };

    var plotGenerator = function(subclient, pipeFactory, filter, seriesMapper) {
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

        pipe = pipeFactory(function(d) {
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
