(function() {

  'use strict';

  function HomeController($scope, $http) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
    });

  }

  angular.module('nuCubingApp', []);

  angular.module('nuCubingApp').controller('HomeController', HomeController);

})();
