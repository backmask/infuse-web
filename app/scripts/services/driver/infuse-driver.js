'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseDriverFactory', function($q, notifier, $interval, $timeout, throttle) {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
      var onDataCallbacks = [];
      var onSendCallbacks = [];
      var responseCallbacks = {};
      var subConnections = {};
      var throttledApply = throttle(function() { scope.$apply(); }, 40);
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
        throttledApply();
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

      scope.setCallback = function(context, cb) {
        responseCallbacks[context] = cb;
      }

      scope.removeCallback = function(context) {
        delete responseCallbacks[context];
      }

      scope.doRequest = function(method, parameters) {
        var deferredResponse = $q.defer();
        var context = "infuse-webapp-" + Math.random();
        var json = {
          method: method,
          context: context,
          params: parameters
        };

        var responseTimeout = $timeout(function() {
          deferredResponse.reject(method + " timed out");
          delete responseCallbacks[context];
        }, 1000);

        responseCallbacks[context] = function(data) {
          $timeout.cancel(responseTimeout);
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

      scope.getClient = function(clientUuid) {
        if (subConnections[clientUuid]) {
          return subConnections[clientUuid];
        }

        var typeToIcon = {
          unknown: 'fa-question',
          terminal: 'fa-terminal',
          controller: 'fa-gamepad',
          camera: 'fa-video-camera',
          // should use a tree instead
          'flight.quadcopter': 'ico-quadcopter'
        };

        var childScope = scope.$new();
        childScope.sessionClientUuid = clientUuid;
        childScope.connected = true;
        childScope.subColor = randomColor({ luminosity: 'bright'});
        childScope.smallIcon = 'fa-circle-o-notch fa-spin';
        childScope.activeVisualizations = 0;

        var pollInterval = $interval(function() {
          scope.doRequest("session/client/ping", { uuid: clientUuid })
            .then(function() { childScope.connected = true; },
              function() { childScope.connected = false; $interval.cancel(pollInterval); });
        }, 1000);

        scope.doRequest("session/client/describe", { uuid: clientUuid })
          .then(function(d) {
            if (d.data.self) {
              childScope.deviceType = 'terminal';
            } else if (typeToIcon.hasOwnProperty(d.data.family)) {
              childScope.deviceType = d.data.family;
            } else {
              childScope.deviceType = 'unknown';
            }
            childScope.smallIcon = typeToIcon[childScope.deviceType];
          });

        childScope.doGetSessionClientPipeline = function() {
          return scope.doRequest("session/client/pipeline", { uuid: clientUuid });
        }

        childScope.doSetPipe = function(target, from, to, uuid) {
          return scope.doRequest("session/client/pipe/set", {
            owner: uuid || clientUuid,
            target: target,
            from: from,
            to: to
          });
        }

        childScope.doAddNode = function(node, uuid) {
          return scope.doRequest("session/client/pipeline/addnode", {
            uuid: uuid || clientUuid,
            node: node
          });
        }

        childScope.doRemovePipe = function(pipeUuid, uuid) {
          return scope.doRequest("session/client/pipe/remove", {
            uuid: uuid || clientUuid,
            pipeUuid: pipeUuid
          }).then(function(e) { notifier.verbose('Removed pipe ' + pipeUuid + ' from ' + clientUuid); });;
        }

        childScope.doRemoveNode = function(nodeUri, uuid) {
          return scope.doRequest("session/client/pipeline/removenode", {
            uuid: uuid || clientUuid,
            nodeUid: nodeUri
          }).then(function(e) { notifier.verbose('Removed ' + nodeUri + ' from ' + clientUuid); });;
        }

        childScope.addPipePacker = function(contextKey) {
          return childScope.doAddNode({
            instanceType: "packer",
            uid: contextKey,
            type: "json.response.packer",
            final: true,
            danglingInitial: true,
            config: { context: contextKey }
          }, "self");
        }

        childScope.$on('$destroy', function() {
          $interval.cancel(pollInterval);
        });

        childScope.$on('add-visualization', function() {
          ++childScope.activeVisualizations;
        });

        childScope.$on('remove-visualization', function() {
          --childScope.activeVisualizations;
          if (childScope.activeVisualizations <= 0) {
            scope.releaseClient(clientUuid);
          }
        });

        subConnections[clientUuid] = childScope;
        return childScope;
      }

      scope.releaseClient = function(clientUuid) {
        delete subConnections[clientUuid];
      }

      scope.getClients = function() {
        return subConnections;
      }

      return scope;
    }

    return r;
  })