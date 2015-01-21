'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseDriverFactory', function($q, notifier) {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
      var onDataCallbacks = [];
      var onSendCallbacks = [];
      var responseCallbacks = {};
      scope.name = configuration.name;
      scope.description = configuration.description;
      scope.icon = configuration.icon;
      scope.pristine = true;
      scope.connected = false;
      scope.error = false;
      scope.status = '';
      scope.download = 0;
      scope.upload = 0;
      scope.unit = 'B';
      scope.initialized = false;

      driver.onopen = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = true;
          scope.error = false;
          scope.status = '';

          if (configuration.init) {
            configuration.init(scope).then(
              function(d) {
                scope.initialized = true;
              },
              function(e) {
                scope.error = true;
                scope.status = e.error.message;
              }
            );
          } else {
            scope.initialized = true;
          }
        });
      }

      driver.onerror = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = true;
        });
      }

      driver.onclose = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = false;
        });
      }

      driver.onmessage = function(message) {
        var data = JSON.parse(message.data);
        scope.download += message.data.length;
        onDataCallbacks.forEach(function(cb) {
          cb(data);
        });

        if (data.context && responseCallbacks[data.context]) {
          responseCallbacks[data.context](data);
        }
      }

      scope.onData = function(callback) {
        onDataCallbacks.push(callback);
      }

      scope.onSend = function(callback) {
        onSendCallbacks.push(callback);
      }

      scope.send = function(data) {
        scope.upload += data.length;
        driver.send(data);
      }

      scope.doRequest = function(method, parameters) {
        var deferredResponse = $q.defer();
        var context = "infuse-webapp-" + Math.random();
        var json = {
          method: method,
          context: context,
          params: parameters
        };

        var responseTimeout = setTimeout(function() {
          deferredResponse.reject(method + " timed out");
          delete responseCallbacks[context];
        }, 1000);

        responseCallbacks[context] = function(data) {
          clearTimeout(responseTimeout);
          delete responseCallbacks[context];
          if (data.error) {
            notifier.error(method + ' failed', data.error.message);
            deferredResponse.reject(data);
          } else {
            deferredResponse.resolve(data);
          }
        };

        scope.send(JSON.stringify(json));
        return deferredResponse.promise;
      }

      scope.close = function() {
        driver.close();
      }

      scope.doLogin = function(user, password) {
        return scope.doRequest("login", { login: user, password: password })
          .then(function(e) { notifier.verbose('Logged as ' + e.data.logged_as); });
      }

      scope.doGetOverview = function() {
        return scope.doRequest("overview");
      }

      scope.doClientConnect = function(clientUuid) {
        return scope.doRequest("client/connect", { uuid: clientUuid })
          .then(function(e) { notifier.verbose('Client connected with id ' + e.data.connection_uuid); })
      }

      scope.doClientDisconnect = function(connectionUuid) {
        return scope.doRequest("client/disconnect", { uuid: connectionUuid })
          .then(function(e) { notifier.verbose('Disconnected client with connection-id ' + connectionUuid); })
      }

      scope.doGetFactoryOverview = function() {
        return scope.doRequest("overview/factory");
      }

      scope.doGetSessionClientPipeline = function(clientUuid) {
        return scope.doRequest("session/client/pipeline", { uuid: clientUuid });
      }

      scope.doSetLocalProcessorPipe = function(clientUuid, interpreterUri) {
        return scope.doRequest("session/client/pipeline/addnode", {
          node: {
            instanceType: "packer",
            uid: "packer-local-pipe-" + interpreterUri,
            type: "json.response.packer",
            final: true,
            config: {
              context: "local-pipe-" + interpreterUri
            }
          }
        }).then(function() {
          return scope.doRequest("session/client/pipe/set", {
            target: "processor",
            from: {
              target: clientUuid,
              stream: "out",
              uri: interpreterUri
            },
            to: {
              uri: "packer-local-pipe-" + interpreterUri,
              stream: "in"
            }
          });
        }).then(function(e) { notifier.verbose('Added local pipe ' + interpreterUri + ' from ' + clientUuid); });
      }

      scope.doRemoveNode = function(clientUuid, nodeUri) {
        return scope.doRequest("session/client/pipeline/removenode", {
          uuid: clientUuid,
          'node-uid': nodeUri
        }).then(function(e) { notifier.verbose('Removed ' + nodeUri + ' from ' + clientUuid); });;
      }

      return scope;
    }

    return r;
  })