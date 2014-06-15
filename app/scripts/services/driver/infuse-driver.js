'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseDriverFactory', function($q) {
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

          if (configuration.init)
            configuration.init(scope).then(function() { scope.initialized = true; });
          else scope.initialized = true;
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

      driver.onmessage = function(data) {
        scope.download += data.length;
        angular.forEach(onDataCallbacks, function(cb) {
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
        return scope.doRequest("/login", { user: user, password: password });
      }

      scope.doGetOverview = function() {
        return scope.doRequest("/overview");
      }

      return scope;
    }

    return r;
  })