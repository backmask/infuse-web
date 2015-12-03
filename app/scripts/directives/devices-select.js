'use strict';

angular.module('infuseWebApp')
  .directive('devicesSelect', function(devices) {
      return {
        restrict: 'E',
        scope: {
          multiple: '@',
          value: '='
        },
        link: function(scope, elt, attrs) {
          var isMultiple = angular.isDefined(attrs.multiple);
          scope.mode = isMultiple ? 'multiple' : 'single';
          scope.devices = [];
          scope.selectedDevices = [];

          var refreshDevices = function(devices) {
            scope.devices = devices.map(function(dev) {
              return {
                name: dev.description.name + ' (' + dev.description.location + ')',
                id: dev.deviceId,
                ticked: false
              };
            });
            refreshSelectedDevices();
          };

          var refreshSelectedDevices = function() {
            var selected = angular.isArray(scope.value) ? scope.value : [scope.value];
            scope.devices.forEach(function(dev) {
              dev.ticked = selected.indexOf(dev.id) != -1
            });
          };

          var refreshValue = function() {
            if (isMultiple) {
              scope.value = scope.selectedDevices
                .map(function(d) { return d.id });
            } else if (scope.selectedDevices.length > 0) {
              scope.value = scope.selectedDevices[0].id;
            } else {
              scope.value = false;
            }
          };

          scope.refreshValue = refreshValue;
          scope.$watch('value', refreshSelectedDevices);
          devices.onDevices(refreshDevices, scope);
        },
        template: '' +
          '<isteven-multi-select ' +
          'input-model="devices" ' +
          'output-model="selectedDevices" ' +
          'button-label="name" ' +
          'item-label="name" ' +
          'tick-property="ticked" ' +
          'selection-mode="{{mode}}" ' +
          'on-item-click="refreshValue()" ' +
          'helper-elements="filter"></isteven-multi-select>'
      };
    }
  );
