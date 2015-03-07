'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseClientDriverFactory', function($interval, notifier, infuseIconFactory, $q) {
    var r = {};

    r.manage = function(scope) {
      var clients = {};
      var buildCallbacks = [];
      var releaseCallbacks = [];

      var setupMatch = function(match) {
        match.disabled = true;
        scope.doRequest('session/client/pipe/set', {
          owner: 'self',
          target: 'processor',
          from: match.description.from,
          to: match.description.to
        }).then(function (d) {
          match.pipeUuid = d.data.uuid;
          match.alive = true;
        });
      };

      var refreshMatches = function(uuidRefreshed, newData) {
        newData.forEach(function(d) {
          var reversed = angular.copy(d);
          var tmpFrom = reversed.description.from;
          reversed.description.from = reversed.description.to;
          reversed.description.to = tmpFrom;
          reversed.outgoing = !reversed.outgoing;

          var seek = d.outgoing ? reversed.description.to.target : reversed.description.from.target;
          pushMatch(seek, reversed);
        });
      };

      var pushMatch = function(uuid, match) {
        var cl = clients[uuid];
        if (!cl) {
          return;
        }

        for (var i = 0; i < cl.matches.length; ++i) {
          if (angular.equals(cl.matches[i].description, match.description)) {
            return;
          }
        }

        cl.matches.push(consolidateMatch(match));
      };

      var consolidateMatch = function(match) {
        match.foreign = match.outgoing ? match.description.to : match.description.from;
        match.self = match.outgoing ? match.description.from : match.description.to;
        return match;
      };

      var build = function(clientUuid) {
        var childScope = scope.$new();
        var pipes = [];
        childScope.sessionClientUuid = clientUuid;
        childScope.connected = true;
        childScope.subColor = window.randomColor({ luminosity: 'bright'});
        childScope.smallIcon = 'fa-circle-o-notch fa-spin';
        childScope.activeVisualizations = 0;
        childScope.matches = [];
        childScope.interface = { final: [], initial: [] };
        childScope.battery = false;

        var pollInterval = $interval(function() {
          scope.doRequest('session/client/ping', { uuid: clientUuid })
            .then(function() { childScope.connected = true; },
              function() {
                childScope.connected = false;
                $interval.cancel(pollInterval);
                autoReleaseClient();
              });
        }, 1000);

        var refreshClient = function() {
          return $q.all([
            scope.doRequest('session/client/describe', { uuid: clientUuid })
              .then(function(d) {
                var desc = d.data.description;
                if (d.data.self) {
                  childScope.deviceType = 'terminal';
                } else {
                  childScope.deviceType = desc.family;
                }
                childScope.smallIcon = infuseIconFactory.getIcon(childScope.deviceType);
                childScope.clientDescription = d.data;
              }),

            scope.doRequest('match/client', { uuid: clientUuid })
              .then(function(d) {
                refreshMatches(clientUuid, d.data.matches);
                childScope.interface = d.data.interface;
                childScope.matches = d.data.matches.map(consolidateMatch);
              }),

            childScope.matchStructures(['battery'])
              .then(function(d) {
                if (d.data.length > 0) {
                  childScope.pipeNode(d.data[0].endPoint, function(d) {
                    childScope.battery = d.data.value;
                  });
                }
              })
          ]);
        };

        childScope.doGetSessionClientPipeline = function() {
          return scope.doRequest('session/client/pipeline', { uuid: clientUuid });
        };

        childScope.doSetPipe = function(target, from, to, uuid) {
          return scope.doRequest('session/client/pipe/set', {
            owner: uuid || clientUuid,
            target: target,
            from: from,
            to: to
          });
        };

        childScope.doAddNode = function(node, uuid) {
          return scope.doRequest('session/client/pipeline/addnode', {
            uuid: uuid || clientUuid,
            node: node
          });
        };

        childScope.doRemovePipe = function(pipeUuid, uuid) {
          return scope.doRequest('session/client/pipe/remove', {
            uuid: uuid || clientUuid,
            pipeUuid: pipeUuid
          }).then(function() { notifier.verbose('Removed pipe ' + pipeUuid + ' from ' + clientUuid); });
        };

        childScope.doRemoveNode = function(nodeUri, uuid) {
          return scope.doRequest('session/client/pipeline/removenode', {
            uuid: uuid || clientUuid,
            nodeUid: nodeUri
          }).then(function() { notifier.verbose('Removed ' + nodeUri + ' from ' + clientUuid); });
        };

        childScope.addPipePacker = function(contextKey) {
          return childScope.doAddNode({
            instanceType: 'packer',
            uid: contextKey,
            type: 'json.response.packer',
            final: true,
            danglingInitial: true,
            config: { context: contextKey }
          }, 'self');
        };

        childScope.matchStructures = function(uids) {
          return scope.doRequest('match/client/node', { uid: uids, uuid: clientUuid });
        };

        childScope.pipeNode = function(pipeableNode, callback) {
          var packerUri = 'packer:' +
            pipeableNode.uri + ':' +
            pipeableNode.stream + ':' +
            pipeableNode.target.substr(0, 5) + ':' +
            Math.floor(Math.random() * 1000);
          return childScope.addPipePacker(packerUri)
            .then(function() {
              return childScope.doSetPipe(
                'processor',
                pipeableNode,
                { uri: packerUri, stream: 'in' },
                'self'
              );
            })
            .then(function(p) {
              childScope.setCallback(packerUri, callback);
              var pipe = {
                pipeUuid: p.data.uuid,
                packerUri: packerUri,
                destroy: function() {
                  childScope.doRemoveNode(packerUri, 'self');
                  childScope.doRemovePipe(p.data.uuid, 'self');
                  childScope.removeCallback(packerUri);
                  pipes.splice(pipes.indexOf(pipe), 1);
                }
              };
              pipes.push(pipe);
              return pipe;
            });
        };

        childScope.pipeStructures = function(uids, callback, matchFirst) {
          return childScope.matchStructures(uids)
            .then(function(d) {
              if (d.data.length === 0) {
                var err = 'Failed to match ' + uids.join(', ');
                notifier.error(err + ' on ' + clientUuid);
                return $q.reject(err);
              }
              else if (d.data.length === 1 || matchFirst) {
                return childScope.pipeNode(d.data[0].endPoint, callback);
              } else {
                var pipes = [];
                d.data.forEach(function(endPoint) {
                  pipes.push(childScope.pipeNode(endPoint.endPoint, callback));
                });
                return $q.all(pipes).then(function(p) {
                  return {
                    pipes: p,
                    destroy: function() {
                      p.forEach(function(pp) { pp.destroy(); });
                    }
                  };
                });
              }
            });
        };

        childScope.$on('$destroy', function() {
          $interval.cancel(pollInterval);
          pipes.forEach(function(p) { p.destroy(); });
        });

        childScope.$on('add-visualization', function() {
          ++childScope.activeVisualizations;
        });

        var autoReleaseClient = function() {
          if (childScope.activeVisualizations <= 0 && !childScope.manualWatch) {
            release(clientUuid);
          }
        };

        childScope.$on('remove-visualization', function() {
          --childScope.activeVisualizations;
          autoReleaseClient();
        });

        childScope.refresh = refreshClient();
        return childScope;
      };

      var get = function(uuid, lazyBuild) {
        if (!clients[uuid] && lazyBuild) {
          clients[uuid] = build(uuid);
          buildCallbacks.forEach(function(cb) {
            cb(clients[uuid]);
          });
        }
        return clients[uuid];
      };

      var release = function(uuid) {
        if (!clients[uuid]) { return; }
        releaseCallbacks.forEach(function(cb) {
          cb(clients[uuid]);
        });
        clients[uuid].$destroy();
        delete clients[uuid];
      };

      var getAll = function() {
        return clients;
      };

      return {
        setupMatch: setupMatch,
        get: get,
        release: release,
        getAll: getAll,
        onRelease: function(cb) { releaseCallbacks.push(cb); },
        onBuild: function(cb) {
          buildCallbacks.push(cb);
          angular.forEach(clients, function(d) { cb(d); });
        }
      };
    };

    return r;
  });
