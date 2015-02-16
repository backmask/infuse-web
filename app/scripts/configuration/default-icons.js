'use strict';

angular.module('infuseWebAppDevice')
  .run(function(infuseIconFactory) {
    infuseIconFactory.setIcons({
      unknown: 'fa-question',
      terminal: 'fa-terminal',
      controller: 'fa-gamepad',
      camera: 'fa-video-camera',
      flight: {
        unknown: 'ico-quadcopter',
        quadcopter: 'ico-quadcopter'
      }
    });
  });