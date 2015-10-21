'use strict';

angular.module('infuseWebApp')
  .factory('gatewayManager', function(connectionManager) {
      var r = {};
      var gatewayConnection = false;
      var isAuthenticated = false;

      r.connect = function(gateway, login, password) {
        var gw = angular.copy(gateway);
        gw.init = function(driver) {
          return driver.doLogin(login, password);
        };
        gatewayConnection = gw;
        return connectionManager.openConnection(gw)
          .then(function() { isAuthenticated = true; });
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

      return r;
    });