'use strict';

angular.module('infuseWebApp')
  .factory('dashboardConfig', function(gatewayManager) {
    var r = {};
    var connection;
    var model = {
      modified: false,
      config: false
    };
    var originalConfig;
    var callbacks = [];

    var notifyCallbacks = function() {
      originalConfig = angular.copy(model.config);
      callbacks.forEach(function(cb) {
        cb(model.config);
      });
    };

    r.createNew = function() {
      model.modified = true;
      model.config = {
        devices: {},
        views: []
      };
    };

    r.save = function() {
      originalConfig = angular.copy(model.config);
      return connection.doSetDashboard(model.config)
        .then(function() { model.modified = false; });
    };

    r.revert = function() {
      return connection.doGetDashboard()
        .then(function(d) {
          model.modified = false;
          model.config = d;
          if (!model.config.devices) {
            model.config.devices = {};
          }
          notifyCallbacks();
        });
    };

    r.setViews = function(views) {
      debugger;
      model.config.views = views;
      model.modified = !angular.equals(model.config, originalConfig);
    };

    r.get = function() {
      return model;
    };

    r.onUpdate = function(cb, scope) {
      if (model.config) {
        cb(model.config);
      }
      callbacks.push(cb);
      scope.$on('$destroy', function() {
        callbacks.splice(callbacks.indexOf(cb), 1);
      });
    };

    gatewayManager.onConnection(function(c) {
      connection = c;
      r.revert()
        .catch(function(e) {
          if (e.error && e.error.message === 'Could not open dashboard.json') {
            r.createNew();
            notifyCallbacks();
          }
        });
    });

    return r;
  });
