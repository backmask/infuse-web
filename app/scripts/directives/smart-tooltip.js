'use strict';

angular.module('infuseWebAppCommon')
  .directive('smartTooltip', function($window, $interval, $timeout) {
    return {
      restrict: 'E',
      scope: {
        show: '=',
        title: '=',
        subtitle: '=',
        anchor: '=?',
        showOnHover: '@'
      },
      transclude: true,
      link: function(scope, element) {
        var container = element.find('.tooltip-container');
        var arrow = element.find('.arrow');
        var anchor = scope.hasOwnProperty('anchor') ? false : element.parent();
        var autoRefresh = false;
        var previousSnapshot = false;
        var enterMousePosition = false;
        var enterMouseDistance = 0;

        var snapshotPosition = function() {
          var nPosition = anchor.position();
          var nOffset = anchor.offset();
          return {
            xAnchor: nOffset.left + anchor.width() / 2,
            yAnchor: nOffset.top,
            xOffset: nPosition.left - nOffset.left + 2,
            yOffset: nPosition.top - nOffset.top,
            anchorHeight: anchor.height(),
            containerWidth: container.width(),
            containerHeight: container.height()
          };
        };

        var arePositionsEquivalent = function(a, b) {
          if (!a || !b) {
            return false;
          }

          for (var key in a) {
            if (Math.abs(a[key] - b[key]) > 2) {
              return false;
            }
          }
          return true;
        };

        var refreshPosition = function() {
          var p = snapshotPosition();
          if (arePositionsEquivalent(p, previousSnapshot)) {
            return;
          }
          previousSnapshot = p;

          if (enterMousePosition) {
            enterMouseDistance = getDistance(enterMousePosition, container);
          }

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
          var right = $window.innerWidth - p.xAnchor - p.containerWidth/2;
          if (right < 0) {
            arrow.css('margin-left', -right + 'px');
            left = $window.innerWidth - p.containerWidth - 10;
          } else if (left < 0) {
            arrow.css('margin-left', (left - 11) + 'px');
            left = 0;
          } else {
            arrow.css('margin-left', '-11px');
          }

          container.css('left', (left + p.xOffset) + 'px');
          container.css('right', '');
        };

        var setDisplay = function(show) {
          if (show) {
            $interval.cancel(autoRefresh);
            autoRefresh = $interval(refreshPosition, 25);
            $timeout(function() {
              refreshPosition();
              container.toggleClass('in', true);
              if (enterMousePosition) {
                enterMouseDistance = getDistance(enterMousePosition, container);
              }
            });
          } else {
            $interval.cancel(autoRefresh);
            $(window).off('mousemove', trackMouse);
            autoRefresh = false;
            container.toggleClass('in', false);
          }
        };

        var onHoverAnchor = function(e) {
          setDisplay(true);
          enterMousePosition = {x: e.clientX, y: e.clientY};
          $(window).off('mousemove', trackMouse);
          $(window).on('mousemove', trackMouse);
        };

        var getDistance = function(point, container) {
          var offset = container.offset();

          var c = {
            x: offset.left + container.width() / 2,
            y: offset.top + container.height() / 2,
            w: container.width(),
            h: container.height()
          };

          var dx = Math.max(Math.abs(point.x - c.x) - c.w / 2, 0);
          var dy = Math.max(Math.abs(point.y - c.y) - c.h / 2, 0);
          return dx * dx + dy * dy;
        };

        var trackMouse = function(e) {
          var mousePosition = {x: e.pageX, y: e.pageY};
          var d1 = getDistance(mousePosition, container);
          if (d1 > 100 && d1 - enterMouseDistance > 100) {
            setDisplay(false);
          }
          enterMouseDistance = Math.min(enterMouseDistance, d1);
        };

        var refreshAnchor = function(newAnchor) {
          if (newAnchor && newAnchor !== anchor) {
            if (scope.showOnHover) {
              if (anchor) {
                anchor.off('mousemove', onHoverAnchor);
              }
              newAnchor.on('mousemove', onHoverAnchor);
            }
            anchor = newAnchor;
            refreshPosition();
          }
        };

        element.click(function(e) {
          e.cancelBubble = true;
          e.stopPropagation();
        });

        scope.$watch('show', setDisplay);
        scope.$watch('anchor', refreshAnchor);
        scope.$on('$destroy', function() {
          if (autoRefresh) {
            $interval.cancel(autoRefresh);
          }
        });
      },
      template: '' +
        '<div class="tooltip-container popover top">' +
        '  <h3 ng-if="title" class="popover-title">{{title}} <span class="verbose">{{subtitle}}</span></h3>' +
        '  <div class="arrow"></div>' +
        '  <div class="popover-content tooltip-content" ng-transclude></div>' +
        '</div>'
    };
  });
