'use strict';

angular.module('infuseWebApp')
  .directive('measurementSelect', function(gatewayManager, devices) {
      return {
        restrict: 'E',
        scope: {
          multiple: '@',
          value: '=',
          devicesId: '=',
          maxLabels: '@'
        },
        link: function(scope, elt, attrs) {
          var isMultiple = angular.isDefined(attrs.multiple);
          scope.mode = isMultiple ? 'multiple' : 'single';
          scope.measurements = [];
          scope.selectedMeasurements = [];

          var refreshMeasurements = function() {
            var gw = gatewayManager.getConnection();
            gw.doRequest('/watch/timeseries/measurement/get', {
                deviceId: scope.devicesId
              })
              .then(function (d) {
                scope.measurements = d.data.map(function (m) {
                  return {
                    name: m.name,
                    id: m.id
                  }
                });
                refreshSelectedMeasurements();
              });
          };

          var refreshSelectedMeasurements = function() {
            var selected = angular.isArray(scope.value) ? scope.value : [scope.value];
            scope.measurements.forEach(function(m) {
              m.ticked = selected.indexOf(m.id) != -1;
            });
          };

          var refreshValue = function() {
            if (isMultiple) {
              scope.value = scope.selectedMeasurements
                .map(function(d) { return d.id });
            } else if (scope.selectedMeasurements.length > 0) {
              scope.value = scope.selectedMeasurements[0].id;
            } else {
              scope.value = false;
            }
          };

          scope.refreshValue = refreshValue;
          scope.$watch('devicesId', refreshMeasurements);
          scope.$watch('value', refreshSelectedMeasurements);
          devices.onDevices(refreshMeasurements, scope);
        },
        template: '' +
          '<isteven-multi-select ' +
          'input-model="measurements" ' +
          'output-model="selectedMeasurements" ' +
          'max-labels="{{maxLabels}}" ' +
          'button-label="name" ' +
          'item-label="name" ' +
          'tick-property="ticked" ' +
          'selection-mode="{{mode}}" ' +
          'on-item-click="refreshValue()" ' +
          'helper-elements="filter"></isteven-multi-select>'
      };
    }
  );
