(function() {

  'use strict';

  function ContestTimerController($scope, $resource, $q, $location, $interval, Calculator) {

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
    $scope.valid = false;
    $scope.index = 0;
    $scope.result = '';
    $scope.eventFormat = '';
    $scope.done = false;
    var dataLoaded = false, savedData = {times:['','','','',''], penalties:['','','','','']};

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
          window.location = '/contest';
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

    $scope.keydown = function(event) {
      if ((event.which === 32) && ($scope.isKeydown === 0) && (!$scope.done)) {
        $scope.isKeydown = 1;
        if ($scope.isTiming === 0) {
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
    };

    $scope.keyup = function(event) {
      if ((event.which === 32) && ($scope.isKeydown === 1) && (!$scope.done)) {
        $scope.isKeydown = 0;
        if ($scope.isTiming === 0) {
          $scope.isTiming = 1;
          $scope.timerStyle = {'color': 'black'};
          $scope.startTimer();
        } else if ($scope.isTiming === 1) {
          $scope.isTiming = 0;
        }
      }
    };

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

  function Calculator() {

    return {

      /**
       * Compares two results
       * @param res1
       * @param res2
       * @returns {*}
       */
      compareResults: function(res1, res2) {
        if (!res1) {
          return res2;
        } else if (res1 == 'DNF') {
          return (res2 == 'DNF') ? '' : res2;
        } else if (res2 == 'DNF') {
          return res1;
        } else {
          var res1Arr = res1.toString().split(':'), res2Arr = res2.toString().split(':'), res1Formatted, res2Formatted;
          res1Formatted = (res1Arr.length > 1) ? (parseFloat(res1Arr[0]) * 60) + parseFloat(res1Arr[1]) : parseFloat(res1Arr[0]);
          res2Formatted = (res2Arr.length > 2) ? (parseFloat(res2Arr[0]) * 60) + parseFloat(res2Arr[2]) : parseFloat(res2Arr[0]);
          return (res1Formatted > res2Formatted) ? res2 : res1;
        }
      },

      /**
       * Compares two MBLD results
       * @param res1
       * @param res2
       * @returns {*}
       */
      compareMBLDResults: function(res1, res2) {
        if (!res1) {
          return res2;
        }
        var score1 = res1.solved - (res1.attempted - res1.solved), score2 = res2.solved - (res2.attempted - res2.solved);
        if (score1 > score2) {
          return res1;
        } else if (score1 < score2) {
          return res2;
        } else if (res1.time < res2.time) {
          return res1;
        } else if (res1.time > res2.time) {
          return res2;
        } else if (res1.attempted < res2.attempted) {
          return res1;
        } else {
          return res2;
        }
      },

      /**
       * Calculates FMC Single
       * @param moves
       * @returns {string}
       */
      calculateFMCSingle: function(moves) {
        var i, single = 'DNF';
        for (i = 0; i < moves.length; i++) {
          if (moves[i] != 'DNF') {
            if (single == 'DNF') {
              single = moves[i];
            }
            if (parseFloat(moves[i]) < single) {
              single = moves[i];
            }
          }
        }
        return single;
      },

      /**
       * Calculates the best single time
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateSingle: function(times, penalties) {
        var i, single = 'DNF', formattedTimes = this.formatTimes(times, penalties);
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] != 'DNF') {
            if (single == 'DNF') {
              single = formattedTimes[i];
            } else if (parseFloat(formattedTimes[i]) < single) {
              single = formattedTimes[i];
            }
          }
        }
        if (single == 'DNF') {
          return single;
        } else {
          return this.reformatTime(single);
        }
      },

      /**
       * Calculate the trimmed average of 5 given the array of times and penalties
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateAverage: function(times, penalties) {
        var formattedTimes = this.formatTimes(times, penalties);
        var i, DNFCount = 0, minIndex, maxIndex, minValue, maxValue;
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            DNFCount++;
          }
        }
        if (DNFCount > 1) {
          return 'DNF';
        }
        if (formattedTimes[0] != 'DNF') {
          minIndex = 0;
          maxIndex = 0;
          minValue = parseFloat(formattedTimes[0]);
          maxValue = parseFloat(formattedTimes[0]);
        } else {
          minIndex = 1;
          maxIndex = 1;
          minValue = parseFloat(formattedTimes[1]);
          maxValue = parseFloat(formattedTimes[1]);
        }
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            maxValue = formattedTimes[i];
            maxIndex = i;
            break;
          }
          if (parseFloat(formattedTimes[i]) > maxValue) {
            maxValue = parseFloat(formattedTimes[i]);
            maxIndex = i;
          }
        }
        for (i = 0; i < formattedTimes.length; i++) {
          if ((i != maxIndex) && (parseFloat(formattedTimes[i]) < minValue)) {
            minValue = parseFloat(formattedTimes[i]);
            minIndex = i;
          }
        }
        if ((minIndex === 0) && (maxIndex === 0)) {
          maxIndex = 1;
        }
        var sum = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          if ((i != minIndex) && (i != maxIndex)) {
            sum += parseFloat(formattedTimes[i]);
          }
        }
        var average = sum / (formattedTimes.length - 2);
        return this.reformatTime(average);
      },

      /**
       * Calculate FMC mean of 3
       * @param moves
       * @returns {string}
       */
      calculateFMCMean: function(moves) {
        return ((moves[0] + moves[1] + moves[2]) / 3).toFixed(2);
      },

      /**
       * Calculate the mean of 3 given the array of times and penalties
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateMean: function(times, penalties) {
        var formattedTimes = this.formatTimes(times, penalties);
        var i, DNFCount = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            DNFCount++;
          }
        }
        if (DNFCount > 0) {
          return 'DNF';
        }
        var sum = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          sum += parseFloat(formattedTimes[i]);
        }
        var mean = sum / formattedTimes.length;
        return this.reformatTime(mean);
      },

      /**
       * return an array of results in milliseconds taking penalties into account
       * @param times
       * @param penalties
       * @returns {Array}
       */
      formatTimes: function(times, penalties) {
        var formattedTimes = [];
        var i, unsplitTimes = [];
        for (i = 0; i < times.length; i++) {
          var res = times[i].split(':');
          if (res.length > 1) {
            unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
          } else {
            unsplitTimes[i] = parseFloat(res[0]);
          }
          if ((penalties[i] == '(DNF)') || (unsplitTimes[i] === '')) {
            formattedTimes[i] = 'DNF';
          } else if (penalties[i] == '(+2)') {
            formattedTimes[i] = parseFloat(unsplitTimes[i]) + 2;
          } else {
            formattedTimes[i] = unsplitTimes[i];
          }
        }
        return formattedTimes;
      },

      /**
       * Converts the time from milliseconds to minutes:seconds.milliseconds
       * @param time
       * @returns {*}
       */
      reformatTime: function(time) {
        if (isNaN(time)) {
          return 'DNF';
        }
        if (parseFloat(time) <  60) {
          return parseFloat(time).toFixed(2);
        } else {
          var min = Math.floor(parseFloat(time) / 60);
          var sec = (parseFloat(time) % 60).toFixed(2);
          if (sec < 10) {
            return min + ':0' + sec;
          } else {
            return min + ':' + sec;
          }
        }
      }

    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap', 'ngResource']);

  angular.module('nuCubingApp').factory('Calculator', Calculator);

  angular.module('nuCubingApp').controller('ContestTimerController', ContestTimerController);

})();
