(function() {

  'use strict';

  function ContestEntryController($scope, $resource, $q, $http, $location) {

    $scope.events = {
      '333' : {name: 'Rubik\'s Cube', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 0},
      '444' : {name: '4x4 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 1},
      '555' : {name: '5x5 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 2},
      '222' : {name: '2x2 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 3},
      '333bf' : {name: '3x3 blindfolded', format: 'bo3', displayedFormat: 'best of 3', result : '', index: 4},
      '333oh' : {name: '3x3 one-handed', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 5},
      '333fm' : {name: '3x3 fewest moves', format: 'fmc', displayedFormat: 'mean of 3', result : '', index: 6},
      '333ft' : {name: '3x3 with feet', format: 'mo3', displayedFormat: 'mean of 3', result : '', index: 7},
      'minx' : {name: 'Megaminx', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 8},
      'pyram' : {name: 'Pyraminx', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 9},
      'sq1' : {name: 'Square-1', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 10},
      'clock' : {name: 'Rubik\'s Clock', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 11},
      'skewb' : {name: 'Skewb', format: 'avg5', displayedFormat: 'avg of 5', result : '', index: 12},
      '666' : {name: '6x6 Cube', format: 'mo3', displayedFormat: 'mean of 3', result : '', index: 13},
      '777' : {name: '7x7 Cube', format: 'mo3', displayedFormat: 'mean of 3', result : '', index: 14},
      '444bf' : {name: '4x4 blindfolded', format: 'bo3', displayedFormat: 'best of 3', result : '', index: 15},
      '555bf' : {name: '5x5 blindfolded', format: 'bo3', displayedFormat: 'best of 3', result : '', index: 16},
      '333mbf' : {name: '3x3 multi blind', format: 'mbld', displayedFormat: '',result : '', index: 17}
    };

    $scope.solves = [];
    $scope.changed = false;
    var savedData = {times:['','','','',''], penalties:['','','','','']};

    var url = $location.$$absUrl.split('/');
    try {
      $scope.eventId = url[url.indexOf('contest') + 1];
      $scope.event = $scope.events[$scope.eventId].name;
    } catch(e) {
      $scope.event = 'Invalid Event';
    }

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
        });
      });

    $scope.$watch('solves', function() {
      $scope.changed = false;
      $scope.valid = true;
      for (var i = 0; i < savedData.times.length; i++) {
        try {
          $scope.changed = (($scope.solves[i].time != savedData.times[i]) || ($scope.solves[i].penalty != savedData.penalties[i])) ? true : $scope.changed;
          $scope.valid = ($scope.solves[i].time === '') ? false : $scope.valid;
        } catch (e) {
          if ($scope.solves[i]) {
            $scope.changed = (($scope.solves[i].time !== '') || ($scope.solves[i].penalty !== '')) ? true : $scope.changed;
            $scope.valid = ($scope.solves[i].time === '') ? false : $scope.valid;
          }
        }
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

    $scope.save = function() {
      var data = {
        times:[],
        penalties:[]
      };
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
      result.$save(function() {
        for (var i = 0; i < $scope.solves.length; i++) {
          savedData.times[i] = $scope.solves[i].time || '';
          savedData.penalties[i] = $scope.solves[i].penalty || '';
          $scope.changed = false;
        }
      });
    };

    $scope.submit = function() {
      if ($scope.contestForm.$valid) {
        var data = {
          times:[],
          penalties:[]
        };
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
        result.$save(function() {
          window.location = '/contest';
        });
      }
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap', 'ngResource']);

  angular.module('nuCubingApp').controller('ContestEntryController', ContestEntryController);

})();
