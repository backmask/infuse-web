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
  });