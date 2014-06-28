angular.module('infuseWebAppVisualization')
  .controller('OverviewCtrl', function ($scope) {
    $scope.overview = {
      nodes: [],
      links: []
    };

    var rootColor = '#0085ff';
    var gatewayColor = '#24c980';
    var clientColor = '#999';

    var refresh = function(wsData) {
      var gw = wsData.data.gateway;
      var nodes = [{ color: rootColor, id: 'root' }];
      var links = [];

      gw.forEach(function(gwNode) {
        nodes.push({ color: gatewayColor, id: gwNode.port });
        links.push({ from: 'root', to: gwNode.port });
        gwNode.clients.forEach(function(client) {
          nodes.push({ color: clientColor, id: client.uuid });
          links.push({ from: gwNode.port, to: client.uuid });
        });
      });

      $scope.overview.nodes = nodes;
      $scope.overview.links = links;
    };

    $scope.doGetOverview().then(refresh);
  });