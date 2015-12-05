'use strict';

angular.module('infuseWebApp')
  .directive('deviceBadge', function(devices, devicesIcon) {
    return {
      restrict: 'E',
      scope: {
        id: '='
      },
      link: function (scope, elt) {
        scope.content = '<i class="fa fa-circle-o-notch fa-spin"></i>';

        var refreshContent = function(device) {
          scope.content = device.description.name.substr(0, 1);
          elt.find('.badge')[0].style.backgroundColor = window.randomColor({ luminosity: 'light'});
        };

        devices.onDevices(function(dev) {
          for (var i = 0; i < dev.length; ++i) {
            if (dev[i].deviceId === scope.id) {
              refreshContent(dev[i]);
              return;
            }
          }
        }, scope);
      },
      template: '' +
        '<span class="badge" ng-bind-html="content"></span>'
    }
  });
