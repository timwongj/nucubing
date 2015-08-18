(function() {

  'use strict';

  function ContestFmcController($scope, $http) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    $scope.solves = [];
    var savedData = {solutions:['','',''], moves:[]};
    $scope.changed = false;
    $scope.valid = false;

    // get scrambles
    $http.get('/contest/scrambles/333fm').success(function(response) {
      $scope.week = response.week;
      for (var i = 0; i < response.data[0].scrambles.length; i++)
      {
        $scope.solves[i] = {};
        $scope.solves[i].scramble = response.data[0].scrambles[i];
        $scope.solves[i].solution = '';
        $scope.solves[i].moves = '';
        $scope.solves[i].valid = false;
        $scope.solves[i].dnf = '';
      }

      // get results if they exist
      $http.get('/contest/results/333fm').success(function(results) {
        savedData = JSON.parse(results.data);
        for (var i = 0; i < savedData.solutions.length; i++) {
          $scope.solves[i].solution = savedData.solutions[i];
          $scope.solves[i].moves = savedData.moves[i];
          $scope.solves[i].valid = true;
          $scope.solves[i].dnf = '';
          $scope.update($scope.solves[i]);
        }
      });
    });

    $scope.update = function(solve) {
      solve.valid = solve.solution.length !== 0;
      solve.moves = solve.solution.split(' ').length;
      $scope.valid = true;
      for (var i = 0; i < $scope.solves.length; i++) {
        $scope.valid = ($scope.solves[i].valid) ? $scope.solves[i].valid : false;
      }
    };

    $scope.$watch('solves', function() {
      $scope.changed = false;
      for (var i = 0; i < $scope.solves.length; i++) {
        $scope.changed = ($scope.solves[i].solution != savedData.solutions[i]) ? true : $scope.changed;
      }
    }, true);

    $scope.back = function() {
      if ($scope.changed) {
        if (confirm('You have unsaved changes, are you sure you want to go back?')) {
          window.location = '/contest';
        }
      } else {
        window.location = '/contest';
      }
    };

    $scope.info = function() {
      alert('Info');
    };

    // submit results for the given event for the current week
    $scope.save = function() {
      var result = {'event':'333fm', 'week':$scope.week, 'status':'In Progress', 'data':{}};
      result.data.solutions = [];
      result.data.moves = [];
      for (var i = 0; i < $scope.solves.length; i++) {
        result.data.solutions[i] = $scope.solves[i].solution;
        result.data.moves[i] = $scope.solves[i].moves;
      }
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        $scope.changed = false;
      });
    };

    // submit results for the given event for the current week
    $scope.submit = function() {
      var result = {'event':'333fm', 'week':$scope.week, 'status':'Completed', 'data':{}};
      result.data.solutions = [];
      result.data.moves = [];
      for (var i = 0; i < $scope.solves.length; i++) {
        result.data.solutions[i] = $scope.solves[i].solution;
        result.data.moves[i] = $scope.solves[i].moves;
      }
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        window.location = '/contest';
      });
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestFmcController', ContestFmcController);

})();
