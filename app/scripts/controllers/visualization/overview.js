angular.module('infuseWebAppVisualization')
  .controller('OverviewCtrl', function ($scope, $interval) {
    $scope.overview = {
      nodes: [],
      links: []
    };
    $scope.tooltip = { x: 1, y: 1};

    var rootColor = '#0085ff';
    var gatewayColor = '#24c980';
    var clientColor = '#999';

    var refresh = function(wsData) {
      var gw = wsData.data.gateway;
      var nodes = [{ color: rootColor, id: 'root', tooltip: $scope.name }];
      var links = [];

      gw.forEach(function(gwNode) {
        nodes.push({ color: gatewayColor, id: gwNode.port, tooltip: "Gateway " + gwNode.port });
        links.push({ from: 'root', to: gwNode.port });
        gwNode.clients.forEach(function(client) {
          nodes.push({ color: clientColor, id: client.uuid, tooltip: "Client " + client.uuid });
          links.push({ from: gwNode.port, to: client.uuid });
        });
      });

      $scope.overview.nodes = nodes;
      $scope.overview.links = links;
    };

    $scope.doGetOverview().then(refresh);
    var autoRefresh = $interval(function() {
      $scope.doGetOverview().then(refresh);
    }, 1000);

    $scope.$on('$destroy', $interval.cancel.bind(null, autoRefresh));
  });