(function() {

  'use strict';

  function ContestEntryController($scope, $resource, $q, $routeParams, Events) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');
    var Scrambles = $resource('/scrambles');

    $scope.user = User.get();
    var weeks = Weeks.query();
    $scope.events = Events;

    if ($scope.events[$routeParams.event]) {
      $scope.eventId = $routeParams.event;
      $scope.event = $scope.events[$routeParams.event].name;
    } else {
      window.location = '#/contest';
    }

    $scope.solves = [];
    $scope.changed = false;
    var dataLoaded = false, savedData = {times:['','','','',''], penalties:['','','','','']};

    var scrambles = weeks.$promise
      .then(function() {
        scrambles = Scrambles.query({
          'week':weeks[0],
          'event':$scope.eventId
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
          'event':$scope.eventId,
          'facebook_id':$scope.user.facebook_id
        }, function() {
          if (results[0]) {
            savedData = JSON.parse(results[0].data);
            angular.forEach($scope.solves, function(solve, index) {
              solve.time = savedData.times[index];
              solve.penalty = savedData.penalties[index];
            });
          }
          dataLoaded = true;
        });
      });

    $scope.$watch('solves', function() {
      if (dataLoaded) {
        $scope.changed = false;
        $scope.valid = true;
        angular.forEach($scope.solves, function(solve, index) {
          $scope.valid = (solve.time === '') ? false : $scope.valid;
          $scope.changed = ((solve.time != savedData.times[index]) || (solve.penalty != savedData.penalties[index])) ? true : $scope.changed;
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
      var data = {times:[], penalties:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.times[index] = solve.time || '';
        data.penalties[index] = solve.penalty || '';
      });
      var result = new Results({
        'event':$scope.eventId,
        'week':weeks[0],
        'status':'In Progress',
        'data':JSON.stringify(data)
      });
      localStorage.setItem((new Date()).toString(), JSON.stringify({
        event: $scope.eventId,
        week: weeks[0],
        status: 'In Progress',
        data: data
      }));
      result.$save(function() {
        angular.forEach($scope.solves, function(solve, index) {
          savedData.times[index] = solve.time || '';
          savedData.penalties[index] = solve.penalty || '';
        });
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      if (($scope.valid) && $scope.contestForm.$valid) {
        var data = {times:[], penalties:[]};
        angular.forEach($scope.solves, function(solve, index) {
          data.times[index] = solve.time || '';
          data.penalties[index] = solve.penalty || '';
        });
        var result = new Results({
          'event':$scope.eventId,
          'week':weeks[0],
          'status':'Completed',
          'data':JSON.stringify(data)
        });
        localStorage.setItem((new Date()).toString(), JSON.stringify({
          event: $scope.eventId,
          week: weeks[0],
          status: 'Completed',
          data: data
        }));
        result.$save(function() {
          window.location = '#/contest';
        });
      }
    };

  }

  angular.module('nuCubingApp').controller('ContestEntryController', ['$scope', '$resource', '$q', '$routeParams', 'Events', ContestEntryController]);

})();
