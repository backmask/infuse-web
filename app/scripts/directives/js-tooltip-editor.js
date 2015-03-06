'use strict';

angular.module('infuseWebAppCommon')
  .directive('jsTooltipEditor', function() {
    return {
      restrict: 'A',
      scope: {
        script: '=',
        pushMode: '@',
        jsName: '@',
        onToggle: '&'
      },
      templateUrl: 'views/directives/js-tooltip-editor.html',
      transclude: true,
      link: function(scope, element, attrs) {
        var isPushMode = attrs.hasOwnProperty('pushMode');
        scope.labelSave = isPushMode ? 'Add' : 'Save';
        scope.labelCancel = isPushMode ? 'Close' : 'Cancel';
        scope.editor = {
          currentScript: scope.script,
          show: false
        };

        scope.toggleEditor = function() {
          scope.$apply(function() {
            scope.editor.show = !scope.editor.show;
            scope.onToggle({ toggled: scope.editor.show });
          });
        };
        scope.save = function() {
          scope.editor.show = false;
          scope.script = scope.editor.currentScript;
          scope.$emit('js-editor-saved', scope.script);
          scope.onToggle({ toggled: scope.editor.show });
        };
        scope.reset = function() {
          scope.editor.show = false;
          scope.editor.currentScript = scope.script;
          scope.onToggle({ toggled: scope.editor.show });
        };

        element.click(scope.toggleEditor);
      }
    };
  });
