'use strict';

angular.module('infuseWebApp')
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/main');

    $stateProvider
      .state('inspector', {
        url: '/inspector',
        templateUrl: 'views/inspector.html'
      })
      .state('main', {
        url: '/main',
        templateUrl: 'views/main.html'
      })
      .state('main.dashboard', {
        url: '/dashboard',
        templateUrl: 'views/dashboard/dashboard.html',
      })
      .state('main.devices', {
        url: '/devices',
        controller: 'DevicesCtrl',
        templateUrl: 'views/dashboard/devices.html',
      })
      .state('main.logs', {
        url: '/logs',
        controller: 'LogsCtrl',
        templateUrl: 'views/dashboard/logs.html',
      })
      .state('main.gatewayEdit', {
        url: '/gateway-edit',
        templateUrl: 'views/dashboard/gateway-edit.html'
      })
      .state('main.login', {
        url: '/login',
        templateUrl: 'views/dashboard/login.html'
      })
      .state('main.dashboard.device-edit', {
        views: {
          device: { templateUrl: 'views/dashboard/devices-edit.html' }
        }
      });
  });
