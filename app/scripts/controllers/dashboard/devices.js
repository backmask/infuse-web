'use strict';

angular.module('infuseWebApp')
  .controller('DevicesCtrl', function ($scope, gatewayManager) {
    var gw = gatewayManager.getConnection();
    $scope.devices = [];

    function fillDefaultIcon(d) {
      if (!d.icon && !d.hasOwnProperty('msGroup')) {
        d.icon = '<i class="fa fa-question"></i>';
      }
      return d;
    }

    function setCheckedValues(toCheck, detailedValues) {
      var map = {};
      toCheck.forEach(function(v) { map[v] = true; });

      for (var i = 0; i < detailedValues.length; ++i) {
        detailedValues[i].ticked = !!map[detailedValues[i].id];
      }
    }

    function mapId(expandedValue) {
      return expandedValue.id;
    }

    $scope.families = [
      { id: 'sensor', name: 'Sensor', icon: '<i class="fa fa-wifi"></i>' },
      { id: 'sensor.temperature', name: 'Thermometer', icon: '<img class="icon" src="images/thermometer.png" />' },
      { id: 'controller', name: 'Controller', icon: '<i class="fa fa-gamepad"></i>' }
    ].map(fillDefaultIcon);

    $scope.sensors = [
      { name: '<b>Controller</b>', msGroup: true },
      { id: 'button', name: 'Button', icon: '<i class="fa fa-circle"></i>' },
      { id: 'nav-cross', name: 'D-pad', icon: '<i class="fa fa-plus"></i>' },
      { id: 'joystick', name: 'Joystick', icon: '<i class="fa fa-gamepad"></i>' },
      { msGroup: false },
      { name: '<b>IMU</b>', msGroup: true },
      { id: 'acceleration', name: 'Accelerometer', icon: '<img class="icon" src="images/accelerometer.png" />' },
      { id: 'gyroscope', name: 'Gyroscope', icon: '<img class="icon" src="images/gyroscope.png" />' },
      { msGroup: false },
      { name: '<b>Telemetry</b>', msGroup: true },
      { id: 'battery', name: 'Battery', icon: '<i class="fa fa-battery-three-quarters"></i>' },
      { id: 'thrust', name: 'Thrust', icon: '<i class="fa fa-rocket"></i>' },
      { msGroup: false },
      { name: '<b>Weather</b>', msGroup: true },
      { id: 'barometer', name: 'Barometer', icon: '<img class="icon" src="images/barometer.png" />' },
      { id: 'temperature', name: 'Temperature', icon: '<img class="icon" src="images/thermometer.png" />' },
      { msGroup: false }
    ].map(fillDefaultIcon);

    $scope.readers = [
      { id: 'flight.command', name: 'Flight command' }
    ].map(fillDefaultIcon);

    var refreshDevices = function() {
      return gw.doGetAllDevices()
        .then(function(d) { $scope.devices = d.data.devices; });
    };

    $scope.editDevice = function(device) {
      $scope.editingDevice = true;
      $scope.device = angular.copy(device);

      setCheckedValues([$scope.device.description.family], $scope.families);
      setCheckedValues($scope.device.description.sensors, $scope.sensors);
      setCheckedValues($scope.device.description.readers, $scope.readers);
    };

    $scope.newDevice = function() {
      $scope.editDevice({
        deviceId: false,
        description: {
          family: '',
          sensors: [],
          readers: []
        }
      });
    };

    $scope.saveDevice = function(device) {
      var savedDevice = angular.copy(device);
      savedDevice.description.family = savedDevice.description.family.length > 0 ? savedDevice.description.family[0].id : '';
      savedDevice.description.sensors = savedDevice.description.sensors.map(mapId);
      savedDevice.description.readers = savedDevice.description.readers.map(mapId);

      gatewayManager.getConnection().doAddDevice(savedDevice)
        .then(function() {
          $scope.editingDevice = false;
          return refreshDevices();
        });
    };

    $scope.deleteDevice = function(device) {
      gatewayManager.getConnection().doRemoveDevice(device.deviceId)
        .then(function() {
          $scope.editingDevice = false;
          return refreshDevices();
        });
    };

    $scope.stopEdit = function() {
      $scope.editingDevice = false;
    };

    $scope.getFamilyIcon = function(familyId) {
      for (var i = 0; i < $scope.families.length; ++i) {
        if ($scope.families[i].id === familyId) {
          return $scope.families[i].icon;
        }
      }
      return '<i class="fa fa-question"></i>';
    };

    refreshDevices();
  });
