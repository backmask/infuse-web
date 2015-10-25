'use strict';

angular.module('infuseWebApp')
  .factory('gatewayManager', function(localStorageService, device, connectionManager) {
      var r = {};
      var gatewayConnection = false;
      var isAuthenticated = false;
      var gateways = localStorageService.get('gateways') || [];

      r.connect = function(gateway, login, password) {
        var gw = device.configure('Infuse', {
          name: 'Infuse',
          description: gateway.name,
          icon: 'images/infuse.png',
          url: 'ws://' + gateway.host + ':' + gateway.port
        });

        gw.init = function(driver) {
          return driver.doLogin(login, password);
        };

        return connectionManager.openConnection(gw)
          .then(function(driver) {
            gatewayConnection = driver;
            isAuthenticated = true;
          });
      };

      r.disconnect = function() {
        if (gatewayConnection) {
          gatewayConnection.close();
          gatewayConnection = false;
          isAuthenticated = false;
        }
      };

      r.isConnected = function() {
        return gatewayConnection && isAuthenticated;
      };

      r.getConnection = function() {
        return gatewayConnection;
      };

      r.getGateways = function() {
        return gateways;
      };

      r.setGateways = function(gws) {
        gateways = gws;
        localStorageService.set('gateways', gateways);
      };

      r.registerGateway = function(name, host, port) {
        gateways.push({ name: name, host: host, port: port });
        localStorageService.set('gateways', gateways);
      };

      return r;
    });
