'use strict';

angular.module('infuseWebAppRemote', [])
  .factory('socket', function() {
    var connections = {};

    var ConnectUrl = function(url) {
      var s = new WebSocket(url);
      connections[url] = s;
      return s;
    };

    var Connect = function(host, port) {
      return ConnectUrl('ws://' + host + ':' + port)
    };

    return {
      connect: Connect,
      connectUrl: ConnectUrl
    }
  });