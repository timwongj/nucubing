(function() {

  'use strict';

  function ContestFmcController($scope, $resource, $q, Cub) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');
    var Scrambles = $resource('/scrambles');

    $scope.user = User.get();
    var weeks = Weeks.query();

    $scope.solves = [];
    $scope.changed = false;
    var dataLoaded = false;
    var savedData = {
      solutions:['','',''],
      moves:[],
      comments:['','','']
    };

    var scrambles = weeks.$promise
      .then(function() {
        scrambles = Scrambles.query({
          'week':weeks[0],
          'event':'333fm'
        }, function() {
          angular.forEach(scrambles[0].scrambles, function(scramble, index) {
            $scope.solves[index] = {
              scramble: scramble,
              solution: '',
              comments: ''
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
            savedData.comments = (savedData.comments) ? savedData.comments : ['','',''];
            angular.forEach($scope.solves, function(solve, index) {
              solve.solution = savedData.solutions[index] || '';
              solve.moves = savedData.moves[index] || '';
              solve.comments = savedData.comments[index];
            });
          }
          dataLoaded = true;
        });
      });

    $scope.$watch('solves', function() {
      if (dataLoaded) {
        $scope.valid = false;
        $scope.changed = false;
        var cubs = [];
        angular.forEach($scope.solves, function(solve, index) {
          if (solve.solution.length > 0) {
            $scope.valid = true;
            cubs[index] = new Cub();
            cubs[index].perform(solve.scramble);
            var moveCount = cubs[index].perform(solve.solution);
            solve.moves = (cubs[index].isSolved()) ? moveCount : 'DNF';
          } else {
            solve.moves = '';
          }
          $scope.changed = (solve.solution != savedData.solutions[index]) ? true : $scope.changed;
          $scope.changed = (solve.comments != savedData.comments[index]) ? true : $scope.changed;
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
      var data = {solutions:[], moves:[], comments:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = solve.moves;
        data.comments[index] = solve.comments;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'In Progress',
        'data':JSON.stringify(data)
      });
      localStorage.setItem((new Date()).toString(), JSON.stringify({
        event: '333fm',
        week: weeks[0],
        status: 'In Progress',
        data: data
      }));
      result.$save(function() {
        angular.forEach($scope.solves, function(solve, index) {
          savedData.solutions[index] = solve.solution;
          savedData.moves[index] = solve.moves;
          savedData.comments[index] = solve.comments;
        });
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      var data = {solutions:[], moves:[], comments:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = (solve.moves.length === 0) ? 'DNS' : solve.moves;
        data.comments[index] = solve.comments;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'Completed',
        'data':JSON.stringify(data)
      });
      localStorage.setItem((new Date()).toString(), JSON.stringify({
        event: '333fm',
        week: weeks[0],
        status: 'Completed',
        data: data
      }));
      result.$save(function() {
        window.location = '#/contest';
      });
    };

  }

  angular.module('nuCubingApp').controller('ContestFmcController', ['$scope', '$resource', '$q', 'Cub', ContestFmcController]);

})();
