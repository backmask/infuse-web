'use strict';

angular.module('infuseWebAppRemote', [])
  .factory('socket', function() {
    var connections = {};

    var connectUrl = function(url) {
      var s = new WebSocket(url);
      connections[url] = s;
      return s;
    };

    var connect = function(host, port) {
      return connectUrl('ws://' + host + ':' + port);
    };

    return {
      connect: connect,
      connectUrl: connectUrl
    };
  });
