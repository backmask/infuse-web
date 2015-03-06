'use strict';

angular.module('infuseWebApp')
  .factory('snippetsManager', function(localStorageService) {
    var r = {};
    var snippets = [];

    r.refreshSnippets = function() {
      snippets = localStorageService.get('snippets') || [];
    };

    r.get = function(key) {
      return snippets[key];
    };

    r.set = function(key, value) {
      snippets[key] = value;
      localStorageService.set('snippets', snippets);
    };

    r.saveAll = function(s) {
      snippets = s;
      localStorageService.set('snippets', snippets);
    };

    r.getAll = function() {
      return snippets;
    };

    r.refreshSnippets();
    return r;
  })
  .controller('SnippetsCtrl', function($scope, snippetsManager) {
    $scope.snippets = snippetsManager.getAll();

    $scope.add = function() {
      $scope.snippets.push({
        name: 'New snippet',
        script: '' +
'api.connect(api.devices[0]).then(function(d) {\n' +
'  d.client.onBuild(function(subclient) {\n' +
'    api.view(d.getView(\'client-pipeline\'), subclient);\n' +
'  });\n' +
'});\n'
      });
    };

    $scope.$watch('snippets', function() {
      snippetsManager.saveAll($scope.snippets);
    }, true);
  });
