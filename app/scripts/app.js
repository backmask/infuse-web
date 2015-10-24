'use strict';

angular.module('infuseWebAppCommon', []);
angular.module('d3', []);
angular.module('infuseWebAppVisualization', ['ui.codemirror', 'infuseWebAppCommon']);
angular.module('infuseWebAppInstrument', []);
angular.module('infuseWebAppDevice', ['infuseWebAppVisualization']);
angular.module('infuseWebApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'angularMoment',
  'd3',
  'ui.bootstrap',
  'ui.router',
  'LocalStorageModule',
  'infuseWebAppConnect',
  'infuseWebAppNotification',
  'infuseWebAppCommon',
  'infuseWebAppDevice',
  'infuseWebAppActiveConnections',
  'infuseWebAppInstrument',
  'infuseWebAppVisualization'
]).controller('blankCtrl', function() {});
