(function() {

  'use strict';

  function UsersController($scope, $http) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
    });

    $scope.users = [];

    $http.get('/users/users/all').success(function(response) {
      for (var i = 0; i < response.length; i++) {
        $scope.users.push({name: response[i].firstName + ' ' + response[i].lastName, facebook_id: response[i].facebook_id});
      }
    });

  }

  angular.module('nuCubingApp', []);

  angular.module('nuCubingApp').controller('UsersController', UsersController);

})();
