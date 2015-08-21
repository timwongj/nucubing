(function() {

  'use strict';

  function ContestFmcController($scope, $resource, $q) {

    $scope.solves = [];
    $scope.changed = false;
    $scope.valid = false;
    var dataLoaded = false, savedData = {solutions:['','',''], moves:[]};

    var User = $resource('/api/user');
    var Weeks = $resource('/api/weeks');
    var Results = $resource('/api/results');
    var Scrambles = $resource('/api/scrambles');

    $scope.user = User.get();
    var weeks = Weeks.query();

    var scrambles = weeks.$promise
      .then(function() {
        scrambles = Scrambles.query({
          'week':weeks[0],
          'event':'333fm'
        }, function() {
          angular.forEach(scrambles[0].scrambles, function(scramble, index) {
            $scope.solves[index] = {
              scramble: scramble
            };
          });
        });
      });

    $q.all([$scope.user.$promise, weeks.$promise, scrambles.$promise])
      .then(function() {
        var results = Results.query({
          'week':weeks[0],
          'event':'333fm',
          'facebook_id':$scope.user.facebook_id
        }, function() {
          if (results[0]) {
            savedData = JSON.parse(results[0].data);
            angular.forEach($scope.solves, function(solve, index) {
              solve.solution = savedData.solutions[index];
              solve.moves = savedData.moves[index];
            });
          }
          dataLoaded = true;
        });
      });

    $scope.update = function(solve) {
      solve.valid = solve.solution.length !== 0;
      solve.moves = solve.solution.split(' ').length;
      $scope.valid = true;
      angular.forEach($scope.solves, function(solve, index) {
        $scope.valid = (solve.valid) ? $scope.valid : false;
      });
    };

    $scope.$watch('solves', function() {
      if (dataLoaded) {
        $scope.changed = false;
        $scope.valid = true;
        angular.forEach($scope.solves, function(solve, index) {
          $scope.valid = (solve.solution === '') ? false : $scope.valid;
          $scope.changed = (solve.solution != savedData.solutions[index]) ? true : $scope.changed;
        });
      }
    }, true);

    $scope.back = function() {
      if ($scope.changed) {
        if (confirm('You have unsaved changes, are you sure you want to go back?')) {
          window.location = '#/contest';
        }
      } else {
        window.location = '#/contest';
      }
    };

    $scope.info = function() {
      alert('Info');
    };

    $scope.save = function() {
      var data = {solutions:[], moves:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = solve.moves;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'In Progress',
        'data':JSON.stringify(data)
      });
      result.$save(function() {
        angular.forEach($scope.solves, function(solve, index) {
          savedData.solutions[index] = solve.solution;
          savedData.moves[index] = solve.moves;
        });
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      var data = {solutions:[], moves:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = solve.moves;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'Completed',
        'data':JSON.stringify(data)
      });
      result.$save(function() {
        window.location = '#/contest';
      });
    };

  }

  angular.module('nuCubingApp').controller('ContestFmcController', ContestFmcController);

})();
