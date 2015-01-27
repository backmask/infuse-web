angular.module('infuseWebAppCommon')
  .directive('smartTooltip', function($interval) {
    return {
      restrict: 'E',
      scope: {
        show: '=',
        title: '='
      },
      transclude: true,
      link: function(scope, element, attrs) {
        var container = element.find('.tooltip-container');
        var arrow = element.find('.arrow');
        var anchor = element.parent();
        var autoRefresh = false;
        var previousSnapshot = false;

        var snapshotPosition = function() {
          var nPosition = anchor.position();
          var nOffset = anchor.offset();
          return {
            xAnchor: nOffset.left + anchor.width() / 2,
            yAnchor: nOffset.top,
            xOffset: nPosition.left - nOffset.left,
            yOffset: nPosition.top - nOffset.top,
            anchorHeight: anchor.height(),
            containerWidth: container.width(),
            containerHeight: container.height()
          };
        };

        var refreshPosition = function() {
          var p = snapshotPosition();
          if (angular.equals(p, previousSnapshot)) {
            return;
          }
          previousSnapshot = p;

          if (p.yAnchor - p.containerHeight < 0) {
            container
              .removeClass('top')
              .addClass('bottom')
              .css('top', (p.yAnchor + p.yOffset + p.anchorHeight) + 'px');
          } else {
            container
              .removeClass('bottom')
              .addClass('top')
              .css('top', (p.yAnchor + p.yOffset - p.containerHeight) + 'px');
          }

          var left = p.xAnchor - p.containerWidth / 2;
          if (left < 0) {
            arrow.css('margin-left', (left - 11) + 'px');
            left = 0;
          } else {
            arrow.css('margin-left', '-11px');
          }

          container.css('left', (left + p.xOffset) + 'px');
        }

        var setDisplay = function(show) {
          if (show) {
            autoRefresh = $interval(refreshPosition, 25);
            refreshPosition();
          } else {
            $interval.cancel(autoRefresh);
            autoRefresh = false;
          }
          container.toggleClass('in', show === true);
        };

        element.click(function(e) {
          e.cancelBubble = true;
          e.stopPropagation();
        });

        scope.$watch('show', setDisplay);
        scope.$on('$destroy', function() {
          if (autoRefresh)
            $interval.cancel(autoRefresh);
        });
      },
      template: ''
        + '<div class="tooltip-container popover top">'
        + '  <h3 ng-if="title" class="popover-title">{{title}</h3>'
        + '  <div class="arrow"></div>'
        + '  <div class="popover-content tooltip-content" ng-transclude></div>'
        + '</div>'
    }
  });