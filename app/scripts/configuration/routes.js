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
        templateUrl: 'views/dashboard/dashboard.html'
      })
      .state('main.gatewayEdit', {
        url: '/gateway-edit',
        templateUrl: 'views/dashboard/gateway-edit.html'
      })
      .state('main.login', {
        url: '/login',
        templateUrl: 'views/dashboard/login.html'
      });
  });
