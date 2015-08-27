(function() {

  'use strict';

  function ContestTimerController($scope, $resource, $q, $routeParams, $interval, Events, Calculator) {

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
    $scope.valid = false;
    $scope.index = 0;
    $scope.result = '';
    $scope.eventFormat = '';
    $scope.done = false;
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
          $scope.scramble = $scope.solves[$scope.index].scramble;
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
              solve.displayedResult = solve.time + ' ' + solve.penalty;
              solve.completed = (solve.time !== '');
              if (solve.completed && ($scope.index == index)) {
                if ($scope.index < $scope.solves.length - 1) {
                  $scope.index++;
                  $scope.scramble = $scope.solves[$scope.index].scramble;
                } else {
                  $scope.done = true;
                  var times = [], penalties = [];
                  for (var j = 0; j < $scope.solves.length; j++) {
                    times[j] = $scope.solves[j].time;
                    penalties[j] = $scope.solves[j].penalty;
                  }
                  switch($scope.events[$scope.eventId].format) {
                    case 'avg5': $scope.result = Calculator.calculateAverage(times, penalties); $scope.eventFormat = 'Average of 5'; break;
                    case 'mo3' : $scope.result = Calculator.calculateMean(times, penalties); $scope.eventFormat = 'Mean of 3'; break;
                    case 'bo3' : $scope.result = Calculator.calculateSingle(times, penalties); $scope.eventFormat = 'Best of 3'; break;
                  }
                }
              }
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
      result.$save(function() {
        angular.forEach($scope.solves, function(solve, index) {
          savedData.times[index] = solve.time || '';
          savedData.penalties[index] = solve.penalty || '';
        });
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      if ($scope.valid) {
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
        result.$save(function() {
          window.location = '#/contest';
        });
      }
    };

    // timer
    $scope.now = 0;
    $scope.time = 0;
    $scope.timer_display = '0.00';
    $scope.timerDelay = 10;
    $scope.interval = null;

    $scope.isTiming = 0;
    $scope.isKeydown = 0;

    $scope.touchStart = function() {
      $scope.$broadcast('keydown', {keyCode: 32});
    };

    $scope.touchEnd = function() {
      $scope.$broadcast('keyup', {keyCode: 32});
    };

    $scope.$on('keydown', function(event, args) {
      if (($scope.isKeydown === 0) && (!$scope.done)) {
        $scope.isKeydown = 1;
        if ((args.keyCode === 32) && ($scope.isTiming === 0)) {
          $scope.timer_display = '0.00';
          $scope.timerStyle = {'color':'#33CC00'};
        } else if ($scope.isTiming === 1) {
          $scope.stopTimer();
          $scope.solves[$scope.index].time = Calculator.reformatTime($scope.time / 1000);
          $scope.solves[$scope.index].displayedResult = $scope.solves[$scope.index].time;
          $scope.solves[$scope.index].completed = true;
          if ($scope.index < $scope.solves.length - 1) {
            while (($scope.solves[$scope.index].completed === true) && ($scope.index < $scope.solves.length - 1)) {
              $scope.index++;
              $scope.scramble = $scope.solves[$scope.index].scramble;
            }
          } else {
            $scope.done = true;
            var times = [], penalties = [];
            for (var i = 0; i < $scope.solves.length; i++) {
              times[i] = $scope.solves[i].time;
              penalties[i] = $scope.solves[i].penalty;
            }
            switch($scope.events[$scope.eventId].format) {
              case 'avg5': $scope.result = Calculator.calculateAverage(times, penalties); $scope.eventFormat = 'Average of 5'; break;
              case 'mo3' : $scope.result = Calculator.calculateMean(times, penalties); $scope.eventFormat = 'Mean of 3'; break;
              case 'bo3' : $scope.result = Calculator.calculateSingle(times, penalties); $scope.eventFormat = 'Best of 3'; break;
            }
          }
          $scope.now = 0;
          $scope.time = 0;
          $scope.interval = null;
        }
      }
    });

    $scope.$on('keyup', function(event, args) {
      if ((args.keyCode === 32) && ($scope.isKeydown === 1) && (!$scope.done)) {
        $scope.isKeydown = 0;
        if ($scope.isTiming === 0) {
          $scope.isTiming = 1;
          $scope.timerStyle = {'color': 'black'};
          $scope.startTimer();
        } else if ($scope.isTiming === 1) {
          $scope.isTiming = 0;
        }
      }
    });

    $scope.startTimer = function() {
      $scope.now = Date.now();

      $scope.interval = $interval(function() {
        var tmp = Date.now();
        var offset = tmp - $scope.now;
        $scope.time += (offset);
        $scope.timer_display = Calculator.reformatTime($scope.time / 1000);
        $scope.now = tmp;
      }, $scope.timerDelay);
    };

    $scope.stopTimer = function() {
      $interval.cancel($scope.interval);
    };

    $scope.updateResultWithPenalty = function(solve, penalty) {
      solve.penalty = penalty;
      solve.displayedResult = solve.time + ' ' + penalty;
    };

  }

  angular.module('nuCubingApp').controller('ContestTimerController', ['$scope', '$resource', '$q', '$routeParams', '$interval', 'Events', 'Calculator', ContestTimerController]);

})();
