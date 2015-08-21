(function() {

  'use strict';

  function ContestController($scope, $resource, $q, Events, Calculator) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');

    $scope.user = User.get();
    var weeks = Weeks.query();
    $scope.events = Events;

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
