angular.module('infuseWebAppCommon')
  .directive('dynamicInclude', function($compile) {
    return {
      restrict: 'E',
      scope: {
        src: '=',
        controller: '=',
        scope: '='
      },
      link: function(scope, elt, attrs, controller) {
        var tmpl = '<div class="dynamicIncluded" ng-include src="\'' + scope.src + '\'" ng-controller="' + scope.controller + '"></div>';
        var included =  $compile(tmpl)(scope.scope);
        elt.append(included);
      }
    };
  }
);