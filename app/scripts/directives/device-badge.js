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
          elt.find('.badge')[0].style.backgroundColor = device.color;

          scope.deviceIcon = devicesIcon.getFamilyIcon(device.description.family);
          scope.deviceDescription = device.description;
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
        '<span class="badge">' +
        '  <span ng-bind-html="content"></span>' +
        '  <smart-tooltip show-on-hover class="deviceTooltip">' +
        '    <span class="pull-left" ng-bind-html="deviceIcon"></span>' +
        '    <span class="deviceName">{{deviceDescription.name}}</span>' +
        '    <span class="deviceLocation">@{{deviceDescription.location}}</span><br/>' +
        '    <span class="deviceId">{{id}}</span>' +
        '  </smart-tooltip>' +
        '</span>'
    }
  });
