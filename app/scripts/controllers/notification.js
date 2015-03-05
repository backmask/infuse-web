'use strict';

angular.module('infuseWebAppNotification', [])
  .factory('notifier', function() {
    var notifications = [];
    var r = {};

    r.notify = function(type, message, details) {
      notifications.unshift({ type: type, message: message, details: details });
      if (notifications.length > 100) {
        notifications.pop();
      }
    };

    r.error = r.notify.bind(null, 'error');
    r.warning = r.notify.bind(null, 'warning');
    r.info = r.notify.bind(null, 'info');
    r.success = r.notify.bind(null, 'success');
    r.verbose = r.notify.bind(null, 'verbose');


    r.getNotifications = function() {
      return notifications;
    };

    return r;
  })
  .controller('NotificationCtrl', function($scope, notifier) {
    $scope.notifications = notifier.getNotifications();

    notifier.notify('info', 'Notifications');
    notifier.notify('info', 'Connect to a remote server to start visualization');
  })
  .filter('convertTypeCss', function() {
    return function(type) {
      var css = ['alert'];
      if (type.indexOf('error') !== -1) {
        css.push('alert-danger');
      }
      if (type.indexOf('warning') !== -1) {
        css.push('alert-warning');
      }
      if (type.indexOf('info') !== -1) {
        css.push('alert-info');
      }
      if (type.indexOf('success') !== -1) {
        css.push('alert-success');
      }
      if (type.indexOf('verbose') !== -1) {
        css.push('alert-verbose');
      }
      if (type.indexOf('emphasize') !== -1) {
        css.push('alert-emphasize');
      }
      return css.join(' ');
    };
  });
