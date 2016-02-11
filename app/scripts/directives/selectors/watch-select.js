'use strict';

angular.module('infuseWebApp')
  .directive('watchSelect', function(baseSelector, gatewayManager) {
    return baseSelector.build(function(scope) {
      var refreshWatch = function(gw) {
        gw.doRequest('/watch/timeseries/get')
          .then(function(d) {
            scope.availableValues = d.data
              .filter(function(w) {
                if (angular.isNumber(scope.measurementsId)) {
                  return scope.measurementsId == w.measurementId;
                }
                if (angular.isArray(scope.measurementsId)) {
                  return scope.measurementsId.indexOf(w.measurementId) !== -1;
                }
                return true;
              })
              .map(function(w) {
                return {
                  name: w.name,
                  id: w.id,
                  ticked: false
                };
              });
          });
      };

      gatewayManager.onConnection(refreshWatch, null, scope);

    }, { measurementsId: '=' });
  });
