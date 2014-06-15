'use strict';

angular.module('infuseWebAppCommon', []);
angular.module('d3', []);
angular.module('infuseWebAppVisualization', []);
angular.module('infuseWebAppInstrument', []);
angular.module('infuseWebAppDevice', ['infuseWebAppVisualization']);
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
  'infuseWebAppInstrument',
  'infuseWebAppVisualization'
]).controller('blankCtrl', function() {});
