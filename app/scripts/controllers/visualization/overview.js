angular.module('infuseWebAppVisualization')
  .controller('OverviewCtrl', function ($scope, $interval) {
    $scope.overview = {
      nodes: [],
      links: []
    };
    $scope.tooltip = { x: 1, y: 1};

    var rootColor = '#0085ff';
    var gatewayColor = '#24c980';
    var clientColor = '#FFB800';
    var clientInstanceColor = '#FFECBB';
    var nodeClientColor = '#999';
    var previousData = {};

    var refresh = function(wsData) {
      if (angular.equals(wsData, previousData)) {
        return;
      }

      previousData = wsData;
      var gw = wsData.data.gateway;
      var nodes = [{
        color: rootColor,
        id: 'root',
        info: {
          title: 'Infuse',
          description: $scope.description.replace('ws://', '').split(':')[0]
        }}];
      var links = [];

      gw.nodes.forEach(function(gwNode) {
        nodes.push({
          color: gatewayColor,
          id: gwNode.port,
          info: {
            title: 'Gateway',
            description: gwNode.protocol + " @" + gwNode.port
          }});
        links.push({ from: 'root', to: gwNode.port });
        gwNode.clients.forEach(function(client) {
          nodes.push({
            color: nodeClientColor,
            id: client.uuid,
            info: {
              title: 'Client',
              description: client.uuid,
              details: client.description
            }});
          links.push({ from: gwNode.port, to: client.uuid });
        });
      });

      gw.clients.forEach(function(client) {
        nodes.push({
          color: clientColor,
          id: client.uuid,
          info: {
            title: client.name,
            description: client.adapterName,
            hasActions: true,
            isClient: true,
            connect: function() {
              $scope.doClientConnect(client.uuid);
            },
            details: {
              uuid: client.uuid,
              input: client.input,
              output: client.output
            }
          }});

        client.connected.forEach(function(clientInstance) {
          nodes.push({
          color: clientInstanceColor,
          id: clientInstance,
          info: {
            title: 'Active instance',
            description: clientInstance,
            hasActions: true,
            isClientInstance: true,
            disconnect: function() {
              $scope.doClientDisconnect(clientInstance);
            }
          }});
          links.push({ from: client.uuid, to: clientInstance });
        });

        links.push({ from: 'root', to: client.uuid });
      });

      $scope.overview.nodes = nodes;
      $scope.overview.links = links;
    };

    $scope.doGetOverview().then(refresh);
    var autoRefresh = $interval(function() {
      if ($scope.connected) {
        $scope.doGetOverview().then(refresh);
      }
    }, 1000);

    $scope.$on('$destroy', $interval.cancel.bind(null, autoRefresh));
  });