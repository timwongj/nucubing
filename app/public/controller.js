(function() {

  'use strict';

  function NuCubingController($scope, $rootScope) {

    $scope.user = $rootScope.user;

    $scope.keydown = function(event) {
      $rootScope.$broadcast('keydown', event);
    };

    $scope.keyup = function(event) {
      $rootScope.$broadcast('keyup', event);
    };

  }

  angular.module('nuCubingApp').controller('NuCubingController', ['$scope', '$rootScope', NuCubingController]);

})();