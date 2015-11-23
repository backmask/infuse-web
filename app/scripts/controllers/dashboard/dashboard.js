'use strict';

angular.module('infuseWebApp')
  .controller('DashboardCtrl', function ($scope, gatewayManager) {
    var connection = gatewayManager.getConnection();
    $scope.loading = true;
    $scope.dashboardModified = false;
    $scope.dashboardLocked = true;
    $scope.dashboardConfig = {};
    $scope.loadingError = false;
    $scope.activeViews = [];

    var dashboardTiles = {
      'devices': {
        prettyName: 'Devices',
        icon: '<i class="fa fa-rss"></i>',
        controller: 'DevicesCtrl',
        src: 'views/dashboard/devices.html'
      },
      'graph': {
        prettyName: 'Graph',
        icon: '<i class="fa fa-area-chart"></i>',
        controller: 'GraphCtrl',
        src: 'views/dashboard/graph.html'
      }
    };

    $scope.availableTiles = Object.keys(dashboardTiles).map(function(k) {
      return {
        name: dashboardTiles[k].prettyName,
        icon: dashboardTiles[k].icon,
        id: k,
        ticked: k === 'devices'
      };
    });

    var createNewDashboard = function() {
      $scope.dashboardModified = true;
      $scope.dashboardConfig = {
        views: []
      };
    };

    var bootstrapView = function(viewConfig) {
      var instance = angular.copy(dashboardTiles[viewConfig.name]);
      instance.scope = connection.$new();
      instance.scope.test = 'test';
      instance.scope.settings = angular.copy(viewConfig.settings);
      instance.name = viewConfig.name;
      return instance;
    };

    var bootstrapDashboard = function(config) {
      $scope.activeViews = config.views.map(bootstrapView);
    };

    var getViewsConfig = function() {
      return $scope.activeViews.map(function(v) {
        return {
          name: v.name,
          settings: v.scope.$$childHead.settings
        };
      });
    };

    $scope.saveDashboard = function() {
      $scope.dashboardConfig.views = getViewsConfig();
      connection.doSetDashboard($scope.dashboardConfig)
        .then(function() { $scope.dashboardModified = false; });
    };

    $scope.revertDashboard = function() {
      return connection.doGetDashboard()
        .then(function(d) {
          $scope.dashboardModified = false;
          $scope.dashboardConfig = d;
          bootstrapDashboard(d);
        });
    };

    $scope.toggleDashboardLock = function() {
      $scope.dashboardLocked = !$scope.dashboardLocked;
    };

    $scope.addTile = function(id) {
      var view = { name: id };
      $scope.dashboardModified = true;
      $scope.activeViews.push(bootstrapView(view));
    };

    $scope.shiftTile = function(index, direction) {
      var moved = $scope.activeViews.splice(index, 1);
      $scope.activeViews.splice(index + direction, 0, moved[0]);
      $scope.dashboardModified = true;
    };

    $scope.removeTile = function(index) {
      $scope.activeViews.splice(index, 1);
      $scope.dashboardModified = true;
    };

    if (connection) {
      $scope.revertDashboard()
        .then(function() { $scope.loading = false; })
        .catch(function(e) {
          if (e.error.message === 'Could not open dashboard.json') {
            createNewDashboard();
            bootstrapDashboard($scope.dashboardConfig);
            $scope.loading = false;
          } else {
            $scope.loadingError = e.error.message;
          }
        });

      connection.$on('settingsUpdated', function() {
        var viewsConfig = getViewsConfig();
        console.log($scope.dashboardConfig.views, viewsConfig);
        $scope.dashboardModified = !angular.equals($scope.dashboardConfig.views, viewsConfig);
      });
    } else {
      $scope.loadingError = 'Not connected to gateway';
    }
  });
