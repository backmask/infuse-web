angular.module('infuseWebAppCommon')
  .directive('smartTooltip', function() {
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

        var refreshPosition = function() {
          var nPosition = anchor.position();
          var xAnchor = nPosition.left + anchor.width() / 2;
          var yAnchor = nPosition.top;
          if (yAnchor - container.height() < 0) {
            container
              .removeClass('top')
              .addClass('bottom')
              .css('top', (yAnchor + anchor.height()) + 'px');
          } else {
            container
              .removeClass('bottom')
              .addClass('top')
              .css('top', (yAnchor - container.height()) + 'px');
          }

          var left = xAnchor - container.width() / 2;
          if (left < 0) {
            arrow.css('margin-left', (left - 11) + 'px');
            left = 0;
          } else {
            arrow.css('margin-left', '-11px');
          }

          container.css('left', left + 'px');
        }

        var setDisplay = function(show) {
          container.toggleClass('in', show === true);
          refreshPosition();
        };

        element.click(function(e) {
          e.cancelBubble = true;
          e.stopPropagation();
        });
        $(window).resize(refreshPosition);

        scope.$watch('show', setDisplay);
      },
      template: ''
        + '<div class="tooltip-container popover top">'
        + '  <h3 ng-if="title" class="popover-title">{{title}</h3>'
        + '  <div class="arrow"></div>'
        + '  <div class="popover-content tooltip-content" ng-transclude></div>'
        + '</div>'
    }
  });