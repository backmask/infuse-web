'use strict';

angular.module('infuseWebAppDevice')
  .factory('infuseIconFactory', function() {
    var r = {};
    var icons = {};

    r.setIcons = function(ic) {
      icons = ic;
    };

    r.getIcon = function(type) {
      var types = type.split('.');
      return recurGetIcon(icons, types, 0);
    };

    var recurGetIcon = function(icons, types, idx) {
      if (!angular.isObject(icons)) {
        return icons;
      }
      if (idx >= types.length || !icons.hasOwnProperty(types[idx])) {
        return icons.unknown;
      }
      return recurGetIcon(icons[types[idx]], types, ++idx);
    };

    return r;
  });
