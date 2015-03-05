'use strict';

angular.module('infuseWebAppCommon')
  .directive('dynamicInclude', function($compile) {
    return {
      restrict: 'E',
      scope: {
        src: '=',
        controller: '=',
        scope: '='
      },
      link: function(scope, elt) {
        var tmpl = '<div class="dynamicIncluded" ng-include src="\'' + scope.src + '\'" ng-controller="' + scope.controller + '"></div>';
        var included =  $compile(tmpl)(scope.scope);
        elt.append(included);
      }
    };
  }
);
