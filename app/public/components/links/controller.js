(function() {

  'use strict';

  function LinksController($scope, $resource) {

    var User = $resource('/api/user');
    $scope.user = User.get();

  }

  angular.module('nuCubingApp', ['ngResource']);

  angular.module('nuCubingApp').controller('LinksController', LinksController);

})();
