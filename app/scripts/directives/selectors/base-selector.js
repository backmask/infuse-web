'use strict';

angular.module('infuseWebApp')
  .factory('baseSelector', function() {
    return {
      build: function(linkCb, extraScopeDefinition) {
        var scopeDefinition = {
          multiple: '@',
          value: '=',
          maxLabels: '@'
        };
        angular.extend(scopeDefinition, extraScopeDefinition);

        return {
          restrict: 'E',
          scope: scopeDefinition,
          link: function(scope, elt, attrs) {
            var isMultiple = angular.isDefined(attrs.multiple);
            scope.mode = isMultiple ? 'multiple' : 'single';
            scope.availableValues = [];
            scope.selectedValues = [];

            var refreshSelectedValues = function() {
              var selected = angular.isArray(scope.value) ? scope.value : [scope.value];
              scope.availableValues.forEach(function(val) {
                val.ticked = selected.indexOf(val.id) != -1
              });
            };

            var refreshValue = function() {
              if (isMultiple) {
                scope.value = scope.selectedValues
                  .map(function(d) { return d.id });
              } else if (scope.selectedValues.length > 0) {
                scope.value = scope.selectedValues[0].id;
              } else {
                scope.value = false;
              }
            };

            scope.refreshValue = refreshValue;
            scope.$watch('value', refreshSelectedValues);
            scope.$watch('availableValues', refreshSelectedValues);

            linkCb(scope);
          },
          template: '' +
            '<isteven-multi-select ' +
            'input-model="availableValues" ' +
            'output-model="selectedValues" ' +
            'max-labels="{{maxLabels}}" ' +
            'button-label="name" ' +
            'item-label="name" ' +
            'tick-property="ticked" ' +
            'selection-mode="{{mode}}" ' +
            'on-item-click="refreshValue()" ' +
            'helper-elements="filter"></isteven-multi-select>'
        };
      }
    }
  });
