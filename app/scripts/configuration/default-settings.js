angular.module('infuseWebApp')
  .run(function(settingsManager) {
    settingsManager.setDefaultSettings({
      autoWatch: false
    });
  });