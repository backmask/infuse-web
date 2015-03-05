'use strict';

angular.module('infuseWebAppDevice')
  // Infuse
  .run(function(device, infuseDriverFactory, infuseVisualizationFactory) {
    device.registerConfigurator('Infuse', {
      description: 'Generic data aggregator',
      defaultSettings: {
        name: 'Infuse',
        description: 'localhost',
        icon: 'images/infuse.png',
        url: 'ws://localhost:2935',
        login: '',
        password: ''
      },
      buildDevice: function(settings) {
        return {
          name: settings.name,
          description: settings.description,
          icon: settings.icon,
          driverFactory: infuseDriverFactory.build,
          visualizationFactory: infuseVisualizationFactory.build,
          init: function(driver) {
            return driver.doLogin(settings.login, settings.password);
          },
          url: settings.url
        };
      }
    });
  })
  // Leap motion
  .run(function(device, leapDriverFactory, leapVisualizationFactory) {
    device.registerConfigurator('Leap motion', {
      description: 'Finger motion controller',
      defaultSettings: {
        name: 'Leap motion',
        description: 'localhost',
        icon: 'images/leap.png'
      },
      buildDevice: function(settings) {
        return {
          name: settings.name,
          description: settings.description,
          icon: settings.icon,
          driverFactory: leapDriverFactory.build,
          visualizationFactory: leapVisualizationFactory.build
        };
      }
    });
  })
  .run(function(device, localStorageService) {
    var devices = localStorageService.get('devices');
    angular.forEach(devices, function(dev) {
      device.register(dev.configurator, dev.settings);
    });
  });
