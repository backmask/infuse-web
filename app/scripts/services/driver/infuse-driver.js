'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseDriverFactory', function($q, notifier, $interval, $timeout, throttle, infuseClientDriverFactory) {
    var r = {};

    r.build = function(scope, configuration) {
      var deferred = $q.defer();
      var driver = new WebSocket(configuration.url);
      var onDataCallbacks = [];
      var onSendCallbacks = [];
      var pendingRequests = {};
      var clientDriver = infuseClientDriverFactory.manage(scope);
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
              function() {
                scope.initialized = true;
                deferred.resolve(scope);
              },
              function(e) {
                scope.error = true;
                scope.status = e.error.message;
                deferred.reject(e);
                scope.close();
              }
            );
          } else {
            deferred.resolve(scope);
            scope.initialized = true;
          }
        });
      };

      driver.onerror = function() {
        scope.$apply(function() {
          if (!scope.pristine) {
            deferred.reject();
          }
          scope.pristine = false;
          scope.connected = false;
          scope.error = true;
        });
      };

      driver.onclose = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
        });
      };

      driver.onmessage = function(message) {
        var data = JSON.parse(message.data);
        scope.download += message.data.length;
        onDataCallbacks.forEach(function(cb) {
          cb(data);
        });

        if (data.context && pendingRequests[data.context]) {
          pendingRequests[data.context].onResponse(data);
        }
        throttledApply();
      };

      scope.onData = function(callback) {
        onDataCallbacks.push(callback);
      };

      scope.onSend = function(callback) {
        onSendCallbacks.push(callback);
      };

      scope.send = function(data) {
        scope.upload += data.length;
        driver.send(data);
      };

      scope.setCallback = function(context, cb) {
        if (pendingRequests[context]) {
          pendingRequests[context].onResponse = cb;
        }
      };

      scope.removeCallback = function(context) {
        delete pendingRequests[context];
      };

      scope.doRequest = function(method, parameters) {
        var deferredResponse = $q.defer();
        var context = 'infuse-webapp-' + Math.random();
        var json = {
          method: method,
          context: context,
          params: parameters
        };

        var pendingRq = {};
        pendingRq.timeout = $timeout(function() {
          pendingRq.cleanUp();

          notifier.warning(method + ' timed out');
          deferredResponse.reject(method + ' timed out');
        }, 1000);

        pendingRq.cleanUp = function() {
          $timeout.cancel(pendingRq.timeout);
          delete pendingRequests[context];
        };

        pendingRq.onResponse = function(data) {
          pendingRq.cleanUp();

          if (data.error) {
            notifier.error(method + ' failed', data.error.message);
            deferredResponse.reject(data);
          } else {
            deferredResponse.resolve(data);
          }
        };

        pendingRequests[context] = pendingRq;

        deferredResponse.promise.overrides = function(overrideKey) {
          for (var ctx in pendingRequests) {
            if (angular.equals(pendingRequests[ctx].overrideKey, overrideKey)) {
              pendingRequests[ctx].cleanUp();
            }
          }
          pendingRequests[context].overrideKey = overrideKey;
          return deferredResponse.promise;
        };

        scope.send(JSON.stringify(json));
        return deferredResponse.promise;
      };

      scope.close = function() {
        driver.close();
      };

      scope.doLogin = function(user, password) {
        return scope.doRequest('login', { login: user, password: password })
          .then(function(e) { notifier.verbose('Logged as ' + e.data.loggedAs); });
      };

      scope.doGetOverview = function() {
        return scope.doRequest('overview');
      };

      scope.doClientConnect = function(clientUuid) {
        return scope.doRequest('client/connect', { uuid: clientUuid })
          .then(function(e) { notifier.verbose('Client connected with id ' + e.data.connectionUuid); });
      };

      scope.doClientDisconnect = function(connectionUuid) {
        return scope.doRequest('client/disconnect', { uuid: connectionUuid })
          .then(function() { notifier.verbose('Disconnected client with connection-id ' + connectionUuid); });
      };

      scope.doGetFactoryOverview = function() {
        return scope.doRequest('overview/factory');
      };

      scope.doGetRecordList = function() {
        return scope.doRequest('record/list')
          .then(function(d) { return d.data.clients; });
      };

      scope.doPlayback = function(path, record) {
        return scope.doRequest('play', { path: path, record: record })
          .then(function(d) {
            notifier.info('Started playback ' + path + ' ' + record + ' on ' + d.data.uuid);
            return d.data.uuid;
          });
      };

      scope.doGetPlaybackList = function() {
        return scope.doRequest('play/list')
          .then(function(d) { return d.data.playbacks; });
      };

      scope.doKillPlayback = function(uuid) {
        return scope.doRequest('play/kill', { uuid: uuid })
          .then(function() {
            notifier.info('Killed playback ' + uuid);
            return true;
          });
      };

      scope.doRewindPlayback = function(uuid, time) {
        return scope.doRequest('play/rewind', {
            uuid: uuid,
            time: time || 0
          })
          .then(function() {
            notifier.info('Rewound playback ' + uuid);
            return true;
          });
      };

      scope.doPausePlayback = function(uuid) {
        return scope.doRequest('play/pause', { uuid: uuid })
          .then(function() {
            notifier.info('Paused playback ' + uuid);
            return true;
          });
      };

      scope.doResumePlayback = function(uuid) {
        return scope.doRequest('play/resume', { uuid: uuid })
          .then(function() {
            notifier.info('Resumed playback ' + uuid);
            return true;
          });
      };

      scope.doGetAllDevices = function() {
        return scope.doRequest('device/all')
          .then(function(d) {
            scope.devices = d.data.devices;
            // sad fix for isteven-multi-select
            scope.devices.forEach(function(dev) {
              dev['description.name'] = true;
            });
            return d;
          });
      };

      scope.doAddDevice = function(device) {
        return scope.doRequest('device/add', device);
      };

      scope.doUpdateDevice = function(device) {
        return scope.doRequest('device/update', device);
      };

      scope.doRemoveDevice = function(deviceId) {
        return scope.doRequest('device/remove', { deviceId: deviceId });
      };

      scope.doGetDeviceApiKeys = function(deviceId) {
        return scope.doRequest('device/api/all')
          .then(function(d) {
            var r = [];
            for (var key in d.data) {
              if (d.data[key].deviceId === deviceId) {
                r.push(key);
              }
            }
            return r;
          });
      };

      scope.doCreateApiKey = function(deviceId) {
        return scope.doRequest('device/api/create', { deviceId: deviceId });
      };

      scope.doRemoveApiKey = function(apiKey) {
        return scope.doRequest('device/api/remove', { apiKey: apiKey});
      };

      scope.doGetDashboard = function() {
        return scope.doRequest('storage/read', { 'name': 'dashboard.json' })
          .then(function(d) { return d.data; });
      };

      scope.doSetDashboard = function(dashboardConfig) {
        return scope.doRequest('storage/write', { 'dashboard.json': dashboardConfig });
      };

      scope.client = clientDriver;
      return deferred.promise;
    };

    return r;
  });
