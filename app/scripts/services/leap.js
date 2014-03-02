'use strict';

angular.module('infuseWebAppDevice')
  .config(function(deviceProvider, leapProvider) {
    deviceProvider.devices.push({
      name: 'Leap motion',
      description: 'Local connection',
      icon: 'images/leap.png',
      driverFactory: leapProvider,
      configuration: {}
    });
  })
  .provider('leap', function() {
    this.controller = false;
    this.configuration = {};
    this.$get = function() {
      var controller = this.controller;
      var cfg = this.configuration;

      return {
        setConfiguration:
        connect: function() {
          devices.push(device);
        },
        getAll: function() {
          return devices;
        }
      };
    }
  });
  .factory('Leap', function() {
    var leap = new Leap.Controller();
    return leap;
  });