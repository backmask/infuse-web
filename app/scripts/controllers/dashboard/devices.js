'use strict';

angular.module('infuseWebApp')
  .controller('DevicesCtrl', function ($scope, devices, devicesIcon, gatewayManager) {
    $scope.devices = [];

    devices.onDevices(function(dev) {
      $scope.devices = dev;
    }, $scope);

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

    $scope.families = devicesIcon.familiesList;

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
      { id: 'humidity', name: 'Humidity', icon: '<i class="fa fa-tint"></i>' },
      { id: 'temperature', name: 'Temperature', icon: '<img class="icon" src="images/thermometer.png" />' },
      { msGroup: false }
    ];

    $scope.logLevels = [
      { id: 0, name: 'All' },
      { id: 1, name: 'Debug' },
      { id: 2, name: 'Verbose' },
      { id: 4, name: 'Info' },
      { id: 8, name: 'Warning' },
      { id: 16, name: 'Error' },
      { id: 32, name: 'None' }
    ];

    $scope.readers = [
      { id: 'flight.command', name: 'Flight command' }
    ];

    $scope.editDevice = function(device) {
      $scope.editingDevice = true;
      $scope.device = angular.copy(device);

      setCheckedValues([$scope.device.description.family], $scope.families);
      setCheckedValues($scope.device.description.sensors, $scope.sensors);
      setCheckedValues($scope.device.description.readers, $scope.readers);
      setCheckedValues([$scope.device.logging.logLevel], $scope.logLevels);
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
      savedDevice.logging.logLevel = savedDevice.logging.logLevel.length > 0 ? savedDevice.logging.logLevel[0].id : 0;

      var doneCb = function() {
        $scope.editingDevice = false;
        return devices.refreshDevices();
      };

      if (device.deviceId) {
        gatewayManager.getConnection().doUpdateDevice(savedDevice)
          .then(doneCb);
      } else {
        gatewayManager.getConnection().doAddDevice(savedDevice)
          .then(doneCb);
      }
    };

    $scope.deleteDevice = function(device) {
      gatewayManager.getConnection().doRemoveDevice(device.deviceId)
        .then(function() {
          $scope.editingDevice = false;
          return devices.refreshDevices();
        });
    };

    $scope.stopEdit = function() {
      $scope.editingDevice = false;
    };

    $scope.editApiKeys = function(device) {
      $scope.editingApiKeys = true;
      $scope.refreshingKeys = true;
      $scope.device = angular.copy(device);
      gatewayManager.getConnection().doGetDeviceApiKeys(device.deviceId)
        .then(function(d) { $scope.keys = d; })
        .finally(function() { $scope.refreshingKeys = false; });
    };

    $scope.newApiKey = function(device) {
      gatewayManager.getConnection().doCreateApiKey(device.deviceId)
        .then(function(d) { $scope.keys.push(d.data.apiKey); });
    };

    $scope.deleteApiKey = function(apiKey) {
      gatewayManager.getConnection().doRemoveApiKey(apiKey)
        .then(function() { $scope.keys.splice($scope.keys.indexOf(apiKey)); });
    };

    $scope.stopEditingApiKeys = function() {
      $scope.editingApiKeys = false;
    };

    $scope.editMeasurements = function(device) {
      $scope.editingMeasurements = true;
      $scope.refreshingMeasurements = true;
      $scope.device = angular.copy(device);
      gatewayManager.getConnection().doRequest('/watch/timeseries/measurement/get', { deviceId: device.deviceId })
        .then(function(d) {
          $scope.measurements = d.data.map(function(v) {
            return {
              val: angular.copy(v),
              original: angular.copy(v)
            };
          });
        })
        .finally(function() { $scope.refreshingMeasurements = false; });
    };

    $scope.newMeasurement = function() {
      $scope.measurements.push({
        val: {
          description: 'New measurement',
          table: 'Table',
          column: 'Column',
          deviceId: $scope.device.deviceId
        }
      });
    };

    $scope.saveMeasurement = function(measurement) {
      measurement.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/measurement/add', measurement.val)
        .then(function(d) {
          measurement.val = angular.copy(d.data[0]);
          measurement.original = angular.copy(measurement.val);
        })
        .finally(function() { measurement.loading = false; })
    };

    $scope.deleteMeasurement = function(measurement) {
      measurement.loading = true;
      gatewayManager.getConnection().doRequest('/watch/timeseries/measurement/remove', measurement.val)
        .then(function() {
          $scope.measurements.splice($scope.measurements.indexOf(measurement), 1);
        })
        .finally(function() { measurement.loading = false; })
    };

    $scope.isMeasurementModified = function(measurement) {
      return !angular.equals(measurement.val, measurement.original);
    };

    $scope.stopEditingMeasurements = function() {
      $scope.editingMeasurements = false;
    };

    $scope.getFamilyIcon = devicesIcon.getFamilyIcon;
  });
