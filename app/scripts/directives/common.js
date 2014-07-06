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

        var pretty = function(val) {
          if (angular.isArray(val) || angular.isObject(val)) {
            var container = document.createElement('ul');
            for (var k in val) {
              if (ignoreNull && !k[val] && k[val] !== false) {
                continue;
              }

              var eltContainer = document.createElement('li');
              if (angular.isObject(val)) {
                eltContainer.appendChild(document.createTextNode(k + ": "));
              }
              eltContainer.appendChild(pretty(val[k]));
              container.appendChild(eltContainer);
            }

            if (container.children.length === 0) {
              return document.createComment('empty list');
            }

            return container;
          }

          return document.createTextNode(val);
        };

        var container = element.find('.format-object');

        scope.$watch('data', function(val) {
          container.empty();
          if (val) {
            container.append(pretty(val));
          }
        }, true);
      },
      template: '<div class="format-object"></div>'
    }
  });