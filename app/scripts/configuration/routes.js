'use strict';

angular.module('infuseWebApp')
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/dashboard', {
      templateUrl: 'views/dashboard.html'
    })
    .when('/home', {
      templateUrl: 'views/main.html',
    })
    .otherwise({
      redirectTo: '/home'
    });

    //$locationProvider.html5Mode(true);
  });
