'use strict';

angular.module('infuseWebAppDevice', []);
angular.module('infuseWebAppCommon', []);
angular.module('d3', []);
angular.module('infuseWebAppInstrument', []);
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
  'infuseWebAppDevice',
  'infuseWebAppActiveConnections',
  'infuseWebAppInstrument'
]);
