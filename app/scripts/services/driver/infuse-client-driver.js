angular.module('infuseWebAppDevice')
  .factory('infuseClientDriverFactory', function($interval, notifier, infuseIconFactory) {
    var r = {};

    r.manage = function(scope) {
      var clients = {};

      var setupMatch = function(match) {
        match.disabled = true;
        scope.doRequest("session/client/pipe/set", {
          owner: 'self',
          target: "processor",
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

          var seek = d.outgoing
            ? reversed.description.to.target
            : reversed.description.from.target;

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
      }

      var consolidateMatch = function(match) {
        match.foreign = match.outgoing ? match.description.to : match.description.from;
        match.self = match.outgoing ? match.description.from : match.description.to;
        return match;
      };

      var build = function(clientUuid) {
        var childScope = scope.$new();
        childScope.sessionClientUuid = clientUuid;
        childScope.connected = true;
        childScope.subColor = randomColor({ luminosity: 'bright'});
        childScope.smallIcon = 'fa-circle-o-notch fa-spin';
        childScope.activeVisualizations = 0;
        childScope.matches = [];
        childScope.interface = { final: [], initial: [] };

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

        scope.doRequest("session/client/match", { uuid: clientUuid })
          .then(function(d) {
            refreshMatches(clientUuid, d.data.matches);
            childScope.interface = d.data.interface;
            childScope.matches = d.data.matches.map(consolidateMatch);
            console.log(d.data);
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
        setupMatch: setupMatch,
        get: get,
        release: release,
        getAll: getAll
      };
    };

    return r;
  });