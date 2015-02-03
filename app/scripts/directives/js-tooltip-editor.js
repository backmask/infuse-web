angular.module('infuseWebAppCommon')
  .directive('jsTooltipEditor', function($interval) {
    return {
      restrict: 'A',
      scope: {
        script: '=',
        pushMode: '@',
        jsName: '@'
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
          scope.editor.show = !scope.editor.show;
        };
        scope.save = function() {
          scope.editor.show = false;
          scope.script = scope.editor.currentScript;
          scope.$emit('js-editor-saved', scope.script);
        };
        scope.reset = function() {
          scope.editor.show = false;
          scope.editor.currentScript = scope.script;
        }

        element.click(scope.toggleEditor);
      }
    }
  });