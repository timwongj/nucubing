(function() {

  'use strict';

  function ContestEntryController($scope, $http, $location) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    $scope.eventMap = {
      '333' : {name: 'Rubik\'s Cube', format: 'avg5', result : ' ', index: 0},
      '444' : {name: '4x4 Cube', format: 'avg5', result : ' ', index: 1},
      '555' : {name: '5x5 Cube', format: 'avg5', result : ' ', index: 2},
      '222' : {name: '2x2 Cube', format: 'avg5', result : ' ', index: 3},
      '333bf' : {name: '3x3 blindfolded', format: 'bo3', result : ' ', index: 4},
      '333oh' : {name: '3x3 one-handed', format: 'avg5', result : ' ', index: 5},
      '333fm' : {name: '3x3 fewest moves', format: 'fmc', result : ' ', index: 6},
      '333ft' : {name: '3x3 with feet', format: 'mo3', result : ' ', index: 7},
      'minx' : {name: 'Megaminx', format: 'avg5', result : ' ', index: 8},
      'pyram' : {name: 'Pyraminx', format: 'avg5', result : ' ', index: 9},
      'sq1' : {name: 'Square-1', format: 'avg5', result : ' ', index: 10},
      'clock' : {name: 'Rubik\'s Clock', format: 'avg5', result : ' ', index: 11},
      'skewb' : {name: 'Skewb', format: 'avg5', result : ' ', index: 12},
      '666' : {name: '6x6 Cube', format: 'mo3', result : ' ', index: 13},
      '777' : {name: '7x7 Cube', format: 'mo3', result : ' ', index: 14},
      '444bf' : {name: '4x4 blindfolded', format: 'bo3', result : ' ', index: 15},
      '555bf' : {name: '5x5 blindfolded', format: 'bo3', result : ' ', index: 16},
      '333mbf' : {name: '3x3 multi blind', format: 'mbld', result : ' ', index: 17}
    };

    $scope.event = '';
    $scope.solves = [];

    var url = $location.$$absUrl.split('/');
    try {
      $scope.eventId = url[url.indexOf('contest') + 1];
      $scope.event = $scope.eventMap[$scope.eventId].name;
    } catch(e) {
      $scope.event = 'Invalid Event';
    }

    var savedData = {times:['','','','',''], penalties:['','','','','']};
    $scope.changed = false;

    // get scrambles
    $http.get('/contest/scrambles/' + $scope.eventId).success(function(response) {
      $scope.week = response.week;
      for (var i = 0; i < response.data[0].scrambles.length; i++)
      {
        $scope.solves[i] = {};
        $scope.solves[i].time = '';
        $scope.solves[i].penalty = '';
        $scope.solves[i].scramble = response.data[0].scrambles[i];
      }

      // get results if they exist
      $http.get('/contest/results/' + $scope.eventId).success(function(results) {
        savedData = JSON.parse(results.data);
        for (var i = 0; i < savedData.times.length; i++) {
          $scope.solves[i].time = savedData.times[i];
          $scope.solves[i].penalty = savedData.penalties[i];
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
      var result = {'event':$scope.eventId, 'week':$scope.week, 'status':'In Progress', 'data':{}};
      result.data.times = [];
      result.data.penalties = [];
      for (var i = 0; i < $scope.solves.length; i++) {
        result.data.times[i] = $scope.solves[i].time || '';
        result.data.penalties[i] = $scope.solves[i].penalty || '';
      }
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function(response) {
        for (var i = 0; i < $scope.solves.length; i++) {
          savedData.times[i] = $scope.solves[i].time || '';
          savedData.penalties[i] = $scope.solves[i].penalty || '';
          $scope.changed = false;
        }
      });

    };

    // submit results for the given event for the current week
    $scope.submit = function() {
      if ($scope.contestForm.$valid) {
        var result = {'event':$scope.eventId, 'week':$scope.week, 'status':'Completed', 'data':{}};
        result.data.times = [];
        result.data.penalties = [];
        for (var i = 0; i < $scope.solves.length; i++) {
          result.data.times[i] = $scope.solves[i].time;
          result.data.penalties[i] = $scope.solves[i].penalty;
        }
        result.data = JSON.stringify(result.data);
        $http.post('/contest/submit', result).success(function(response) {
          window.location = '/contest';
        });
      }
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestEntryController', ContestEntryController);

})();
