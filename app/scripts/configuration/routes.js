'use strict';

angular.module('infuseWebApp')
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/inspector', {
      templateUrl: 'views/inspector.html'
    })
    .when('/home', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/home'
    });

    //$locationProvider.html5Mode(true);
  });
