'use strict';

angular.module('infuseWebApp')
  .controller('GraphCtrl', function ($scope) {
    $scope.data = [];

    var rq = {
      deviceId: $scope.deviceId,
      startTime: new Date(new Date() - 24 * 3600 * 1000).toISOString(),
      endTime: new Date().toISOString(),
      name: 'temperature',
      tags: [],
      values: ['celcius'],
      timeResolution: '5m'
    };

    var convertData = function(data) {
      console.log('data', data);

      var r = data.data.results[0].series[0].values.map(function(v) {
        return {
          date: new Date(v[0]),
          value: v[1]
        };
      }).filter(function(v) { return v.value; });

      return r;
    };

    var displayData = function(data) {
      console.log('data-cleaned', data);
      $scope.data = data;
    };

    $scope.doRequest('/timeseries/get', rq)
      .then(convertData)
      .then(displayData);
  });
