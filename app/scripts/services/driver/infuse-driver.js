'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseDriverFactory', function($q, notifier, $interval, $timeout, throttle, infuseClientDriverFactory) {
    var r = {};

    r.build = function(scope, configuration) {
      var driver = new WebSocket(configuration.url);
      var onDataCallbacks = [];
      var onSendCallbacks = [];
      var responseCallbacks = {};
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
      };

      driver.onerror = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = true;
        });
      };

      driver.onclose = function() {
        scope.$apply(function() {
          scope.pristine = false;
          scope.connected = false;
          scope.error = false;
        });
      };

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
        responseCallbacks[context] = cb;
      };

      scope.removeCallback = function(context) {
        delete responseCallbacks[context];
      };

      scope.doRequest = function(method, parameters) {
        var deferredResponse = $q.defer();
        var context = 'infuse-webapp-' + Math.random();
        var json = {
          method: method,
          context: context,
          params: parameters
        };

        var responseTimeout = $timeout(function() {
          deferredResponse.reject(method + ' timed out');
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

      scope.client = clientDriver;
      return scope;
    };

    return r;
  });
