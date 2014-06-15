'use strict';

angular.module('infuseWebAppDevice')
  // Infuse
  .run(function(device, infuseDriverFactory, infuseVisualizationFactory) {
    device.register({
      name: 'Infuse',
      description: 'ws://vm:2935',
      icon: 'images/infuse.png',
      driverFactory: infuseDriverFactory.build,
      visualizationFactory: infuseVisualizationFactory.build,
      init: function(driver) {
        return driver.doLogin('root', 'oh_you');
      },
      url: 'ws://vm:2935'
    });
  })
  // Leap motion
  .run(function(device, leapDriverFactory) {
    device.register({
      name: 'Leap motion',
      description: 'Local connection',
      icon: 'images/leap.png',
      driverFactory: leapDriverFactory.build,
      configuration: {}
    });
  })