(function() {

  'use strict';

  function UsersController($scope, $resource) {

    var User = $resource('/user');
    var Users = $resource('/users/:facebook_id');

    $scope.user = User.get();
    $scope.users = Users.query();

  }

  angular.module('nuCubingApp').controller('UsersController', UsersController);

})();
