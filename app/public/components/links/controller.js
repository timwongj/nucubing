(function() {

  'use strict';

  function LinksController($scope, $http) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

  }

  angular.module('nuCubingApp', []);

  angular.module('nuCubingApp').controller('LinksController', LinksController);

})();
