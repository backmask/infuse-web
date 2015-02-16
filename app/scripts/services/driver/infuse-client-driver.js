angular.module('infuseWebAppDevice')
  .factory('infuseClientDriverFactory', function($interval, infuseIconFactory) {
    var r = {};

    r.manage = function(scope) {
      var clients = {};

      var build = function(clientUuid) {
        var childScope = scope.$new();
        childScope.sessionClientUuid = clientUuid;
        childScope.connected = true;
        childScope.subColor = randomColor({ luminosity: 'bright'});
        childScope.smallIcon = 'fa-circle-o-notch fa-spin';
        childScope.activeVisualizations = 0;

        var pollInterval = $interval(function() {
          scope.doRequest("session/client/ping", { uuid: clientUuid })
            .then(function() { childScope.connected = true; },
              function() {
                childScope.connected = false;
                $interval.cancel(pollInterval);
                autoReleaseClient();
              });
        }, 1000);

        scope.doRequest("session/client/describe", { uuid: clientUuid })
          .then(function(d) {
            var desc = d.data.description;
            if (d.data.self) {
              childScope.deviceType = 'terminal';
            } else {
              childScope.deviceType = desc.family;
            }
            childScope.smallIcon = infuseIconFactory.getIcon(childScope.deviceType);
            childScope.clientDescription = d.data;
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

        var autoReleaseClient = function() {
          if (childScope.activeVisualizations <= 0 && !childScope.manualWatch) {
            scope.releaseClient(clientUuid);
          }
        };

        childScope.$on('remove-visualization', function() {
          --childScope.activeVisualizations;
          autoReleaseClient();
        });

        return childScope;
      }

      var get = function(uuid) {
        if (!clients[uuid]) {
          clients[uuid] = build(uuid);
        }
        return clients[uuid];
      }

      var release = function(uuid) {
        delete clients[uuid];
      }

      var getAll = function() {
        return clients;
      }

      return {
        get: get,
        release: release,
        getAll: getAll
      };
    };

    return r;
  });