'use strict';

angular.module('infuseWebApp')
  .controller('DashboardCtrl', function ($scope, gatewayManager, devices, dashboardConfig) {
    var connection = gatewayManager.getConnection();
    $scope.loading = true;
    $scope.dashboardLocked = true;
    $scope.dashboard = dashboardConfig.get();
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

    var bootstrapView = function(viewConfig) {
      var instance = angular.copy(dashboardTiles[viewConfig.name]);
      instance.scope = connection.$new();
      instance.scope.test = 'test';
      instance.scope.settings = angular.copy(viewConfig.settings);
      instance.name = viewConfig.name;
      return instance;
    };

    var bootstrapDashboard = function(config) {
      $scope.loading = false;
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

    $scope.saveDashboard = dashboardConfig.save;
    $scope.revertDashboard = dashboardConfig.revert;

    $scope.toggleDashboardLock = function() {
      $scope.dashboardLocked = !$scope.dashboardLocked;
    };

    $scope.addTile = function(id) {
      var view = { name: id };
      $scope.dashboard.modified = true;
      $scope.activeViews.push(bootstrapView(view));
      dashboardConfig.setViews(getViewsConfig());
    };

    $scope.shiftTile = function(index, direction) {
      var moved = $scope.activeViews.splice(index, 1);
      $scope.activeViews.splice(index + direction, 0, moved[0]);
      dashboardConfig.setViews(getViewsConfig());
    };

    $scope.removeTile = function(index) {
      $scope.activeViews.splice(index, 1);
      dashboardConfig.setViews(getViewsConfig());
    };

    if (connection) {
      dashboardConfig.onUpdate(bootstrapDashboard, $scope);
      connection.$on('settingsUpdated', function() {
        dashboardConfig.setViews(getViewsConfig());
      });
    } else {
      $scope.loadingError = 'Not connected to gateway';
    }
  });
