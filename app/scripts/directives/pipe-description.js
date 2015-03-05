'use strict';

angular.module('infuseWebAppCommon')
  .directive('pipesDescription', function() {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        remove: '='
      },
      template: '<table class="table table-condensed pipes">' +
        '<thead><tr><th>uuid</th><th>target</th><th>from</th><th>to</th><th></th></tr></thead>' +
        '<tr pipe-description ng-repeat="pipe in data" data="pipe" remove="remove(pipe.uuid)"></tr>' +
        '</table>'
    };
  })
  .directive('pipeDescription', function() {
    return {
      restrict: 'A',
      templateUrl: 'views/directives/pipe-description.html',
      replace: true,
      scope: {
        data: '=',
        remove: '&'
      },
      link: function(scope) {
        scope.uuid = scope.data.uuid;
        scope.description = scope.data.description;
      }
    };
  });
