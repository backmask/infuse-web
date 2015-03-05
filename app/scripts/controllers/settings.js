'use strict';

angular.module('infuseWebApp')
  .factory('settingsManager', function(localStorageService) {
    var r = {};
    var settings = {};

    r.refreshSettings = function() {
      settings = localStorageService.get('settings') || {};
    };

    r.setDefaultSettings = function(v) {
      for (var key in v) {
        if (!settings.hasOwnProperty(key)) {
          settings[key] = v[key];
        }
      }
    };

    r.get = function(key) {
      return settings[key];
    };

    r.set = function(key, value) {
      settings[key] = value;
      localStorageService.set('settings', settings);
    };

    r.saveAll = function(s) {
      settings = s;
      localStorageService.set('settings', settings);
    };

    r.getAll = function() {
      return settings;
    };

    r.refreshSettings();
    return r;
  })
  .controller('SettingsCtrl', function($scope, settingsManager) {
    $scope.settings = settingsManager.getAll();
    $scope.$watch('settings', function() {
      settingsManager.saveAll($scope.settings);
    }, true);
  });
