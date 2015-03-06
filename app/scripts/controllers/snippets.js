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
  .controller('SnippetsCtrl', function($scope, snippetsManager, notifier) {
    $scope.snippets = snippetsManager.getAll();
    $scope.toggledSnippets = $scope.snippets.map(function() { return false; });

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
      $scope.toggledSnippets.push(false);
    };

    $scope.toggle = function(snippet, toggled) {
      $scope.toggledSnippets[$scope.snippets.indexOf(snippet)] = toggled;
    };

    $scope.isEditModeOn = function(snippet) {
      return $scope.toggledSnippets[$scope.snippets.indexOf(snippet)];
    };

    $scope.execute = function(snippet) {
      notifier.info('Executing snippet ' + snippet.name);
      eval(snippet.script); // jshint ignore:line
    };

    $scope.remove = function(snippet) {
      var idx = $scope.snippets.indexOf(snippet);
      $scope.snippets.splice(idx, 1);
      $scope.toggledSnippets.splice(idx, 1);
    };

    $scope.$watch('snippets', function() {
      snippetsManager.saveAll($scope.snippets);
    }, true);
  });
