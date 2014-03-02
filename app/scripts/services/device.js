'use strict';

angular.module('infuseWebAppDevice')
  .provider('device', function() {
    this.devices = [];

    this.$get = function() {
      var devices = this.devices;
      return {
        register: function(device) {
          devices.push(device);
        },
        getAll: function() {
          return devices;
        }
      };
    }
  })
  .config(function(deviceProvider) {
    deviceProvider.devices.push({
      name: 'Infuse',
      description: 'tcp://localhost:2935',
      icon: 'images/infuse.png',
      factory: function() {
      }
    });
  });