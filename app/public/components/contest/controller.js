(function() {

  'use strict';

  function ContestController($scope, $resource, $q, Calculator) {

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

    var User = $resource('/api/user');
    var Weeks = $resource('/api/weeks');
    var Results = $resource('/api/results');

    $scope.user = User.get();
    var weeks = Weeks.query();

    $q.all([$scope.user.$promise, weeks.$promise])
      .then(function() {
        var results = Results.query({
          'week':weeks[0],
          'facebook_id':$scope.user.facebook_id
        }, function() {
          angular.forEach(results, function(result) {
            if (result.status == 'Completed') {
              var data = JSON.parse(result.data);
              switch ($scope.events[result.event].format) {
                case 'avg5':
                  $scope.events[result.event].result = Calculator.calculateAverage(data.times, data.penalties);
                  break;
                case 'mo3' :
                  $scope.events[result.event].result = Calculator.calculateMean(data.times, data.penalties);
                  break;
                case 'bo3' :
                  $scope.events[result.event].result = Calculator.calculateSingle(data.times, data.penalties);
                  break;
                case 'fmc' :
                  $scope.events[result.event].result = Calculator.calculateFMCMean(data.moves);
                  break;
                case 'mbld' :
                  $scope.events[result.event].result = (data.dnf == '(DNF)') ? 'DNF' : data.solved + '/' + data.attempted + ' in ' + data.time;
                  break;
              }
              if ($scope.events[result.event].result != 'DNF') {
                $scope.events[result.event].result += ' ' + $scope.events[result.event].displayedFormat;
              }
            } else if (result.status == 'In Progress') {
              $scope.events[result.event].result = 'In Progress';
            }
          });
          angular.forEach($scope.events, function(event) {
            if (event.result === '') {
              event.result = 'Not Completed';
            }
          });
        });
      });

    $scope.entry = function(eventId) {
      switch(eventId) {
        case '333fm': window.location = '#/contest/333fm'; break;
        case '333mbf': window.location = '#/contest/333mbf'; break;
        default: window.location = '#/contest/' + eventId + '/entry'; break;
      }
    };

    $scope.timer = function(eventId) {
      window.location = '#/contest/' + eventId + '/timer';
    };
  }

  angular.module('nuCubingApp').controller('ContestController', ContestController);

})();
