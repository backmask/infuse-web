angular.module('infuseWebAppCommon')
  .directive('showOnHoverParent', function() {
    return {
     link: function(scope, element, attrs) {
        element.hide();
        element.parent().bind('mouseenter', function() {
          element.show();
        });
        element.parent().bind('mouseleave', function() {
          element.hide();
        });
     }
   };
  })
  .directive('formatObject', function() {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var ignoreNull = angular.isDefined(attrs.ignoreNull);

        var hasToBeDisplayed = function(val) {
          if (!ignoreNull || val === false)
            return true;
          if (angular.isArray(val) || angular.isObject(val))
            return val.length > 0;
          return val;
        };

        var pretty = function(val) {
          if (angular.isArray(val) || angular.isObject(val)) {
            var container = document.createElement('ul');
            for (var k in val) {
              var prettyChild = pretty(val[k]);
              if (!prettyChild) {
                continue;
              }

              var eltContainer = document.createElement('li');
              if (!angular.isArray(val)) {
                eltContainer.appendChild(document.createTextNode(k + ": "));
              }
              eltContainer.appendChild(prettyChild);
              container.appendChild(eltContainer);
            }

            if (container.children.length === 0) {
              return null;
            }

            return container;
          }
          else if (hasToBeDisplayed(val)) {
            return document.createTextNode(val);
          }
          return null;
        };

        var container = element.find('.format-object');

        scope.$watch('data', function(val) {
          container.empty();
          var p = pretty(val);
          if (p) {
            container.append(pretty(val));
            container.css('display', 'block');
          } else {
            container.css('display', 'none');
          }
        }, true);
      },
      template: '<div class="format-object"></div>'
    }
  });