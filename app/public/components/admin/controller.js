(function() {

  'use strict';

  function AdminController($scope, $resource, Events, FileUploader) {

    var User = $resource('/user');
    var Scrambles = $resource('/scrambles');
    var Results = $resource('/results');
    var Users = $resource('/users');

    $scope.user = User.get();
    $scope.results = Results.query();
    $scope.users = Users.query();
    $scope.events = Events;

    $scope.display = 'Scrambles';

    $scope.scrambles = Scrambles.query(function() {
      angular.forEach($scope.scrambles, function(scramble) {
        scramble.index = $scope.events[scramble.event].index;
      });
    });

    $scope.uploader = new FileUploader({
      url:'/scrambles'
    });

    $scope.uploader.onSuccessItem = function(item, response) {
      $scope.scrambles = Scrambles.query(function() {
        angular.forEach($scope.scrambles, function(scramble) {
          scramble.index = $scope.events[scramble.event].index;
        });
      });
    };

    $scope.displayEvent = function(event) {
      return $scope.events[event].name;
    };

    $scope.displayWeek = function(week) {
      return week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }

  angular.module('nuCubingApp').controller('AdminController', ['$scope', '$resource', 'Events', 'FileUploader', AdminController]);

})();
