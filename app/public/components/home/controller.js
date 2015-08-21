(function() {

  'use strict';

  function HomeController($scope, $resource) {

    var User = $resource('/api/user');
    $scope.user = User.get();

  }

  angular.module('nuCubingApp', ['ngResource']);

  angular.module('nuCubingApp').controller('HomeController', HomeController);

})();
