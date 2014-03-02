'use strict';

angular.module('infuseWebAppDevice', []);
angular.module('infuseWebAppCommon', []);
angular.module('d3', []);
angular.module('infuseWebApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'd3',
  'ui.bootstrap',
  'infuseWebAppConnect',
  'infuseWebAppNotification',
  'infuseWebAppCommon',
  'infuseWebAppDevice'
]);
