(function() {

  'use strict';

  function ProfileController($scope, $http, $location, Calculator) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    // get user information
    $scope.user = {};
    var url = $location.$$absUrl.split('/');
    if (url.indexOf('users') < 0) {
      $scope.profileClass = 'active';
      $scope.usersClass = '';
      $http.get('/profile/userInfo').success(function(response) {
        $scope.user.firstName = response.firstName;
        $scope.user.lastName = response.lastName;
        $scope.user.facebook_id = response.facebook_id;
      });
    } else {
      var facebook_id = url[url.indexOf('users') + 1];
      $scope.profileClass = '';
      $scope.usersClass = 'active';
      $http.get('/profile/userInfo/' + facebook_id).success(function(response) {
        $scope.user.firstName = response.firstName;
        $scope.user.lastName = response.lastName;
        $scope.user.facebook_id = response.facebook_id;
      });
    }

    // events list
    $scope.eventMap = {
      '333' : {name : 'Rubik\'s Cube', format: 'avg5', index: 0},
      '444' : {name: '4x4 Cube', format: 'avg5', index: 1},
      '555' : {name: '5x5 Cube', format: 'avg5', index: 2},
      '222' : {name: '2x2 Cube', format: 'avg5', index: 3},
      '333bf' : {name: '3x3 blindfolded', format: 'bo3', index: 4},
      '333oh' : {name: '3x3 one-handed', format: 'avg5', index: 5},
      '333fm' : {name: '3x3 fewest moves', format: 'fmc', index: 6},
      '333ft' : {name: '3x3 with feet', format: 'mo3', index: 7},
      'minx' : {name: 'Megaminx', format: 'avg5', index: 8},
      'pyram' : {name: 'Pyraminx', format: 'avg5', index: 9},
      'sq1' : {name: 'Square-1', format: 'avg5', index: 10},
      'clock' : {name: 'Rubik\'s Clock', format: 'avg5', index: 11},
      'skewb' : {name: 'Skewb', format: 'avg5', index: 12},
      '666' : {name: '6x6 Cube', format: 'mo3', index: 13},
      '777' : {name: '7x7 Cube', format: 'mo3', index: 14},
      '444bf' : {name: '4x4 blindfolded', format: 'bo3', index: 15},
      '555bf' : {name: '5x5 blindfolded', format: 'bo3', index: 16},
      '333mbf' : {name: '3x3 multi blind', format: 'mbld', index: 17}
    };

    $scope.personalBestsMap = $scope.eventMap;
    $scope.personalBests = [];

    for (var event in $scope.personalBestsMap) {
      if ($scope.personalBestsMap.hasOwnProperty(event)) {
        $scope.personalBestsMap[event].single = '';
        $scope.personalBestsMap[event].average = '';
      }
    }

    $scope.displayFormat = 'Week';
    $scope.resultsByWeek = {};
    $scope.resultsByEvent = {};

    var i, j, data, formattedTimes;

    // get personal results
    var api_route = (url.indexOf('users') < 0) ? '/profile/results/all' : '/profile/results/all/' + url[url.indexOf('users') + 1];
    $http.get(api_route).success(function(results) {
      // Personal Bests
      for (i = 0; i < results.length; i++) {
        data = JSON.parse(results[i].data);
        switch($scope.personalBestsMap[results[i].event].format) {
          case 'avg5':
            $scope.personalBestsMap[results[i].event].single = Calculator.compareResults($scope.personalBestsMap[results[i].event].single, Calculator.calculateSingle(data.times, data.penalties));
            $scope.personalBestsMap[results[i].event].average = Calculator.compareResults($scope.personalBestsMap[results[i].event].average, Calculator.calculateAverage(data.times, data.penalties));
            break;
          case 'mo3':
          case 'bo3':
            $scope.personalBestsMap[results[i].event].single = Calculator.compareResults($scope.personalBestsMap[results[i].event].single, Calculator.calculateSingle(data.times, data.penalties));
            $scope.personalBestsMap[results[i].event].average = ((results[i].event == '555bf') || (results[i].event == '444bf')) ? '' : Calculator.compareResults($scope.personalBestsMap[results[i].event].average, Calculator.calculateMean(data.times, data.penalties));
            break;
          case 'fmc':
            $scope.personalBestsMap[results[i].event].single = Calculator.compareResults($scope.personalBestsMap[results[i].event].single, Calculator.calculateFMCSingle(data.moves));
            $scope.personalBestsMap[results[i].event].average = Calculator.compareResults($scope.personalBestsMap[results[i].event].average, Calculator.calculateFMCMean(data.moves));
            break;
          case 'mbld':
            var mbldResult = Calculator.compareMBLDResults($scope.personalBestsMap[results[i].event].single, data);
            $scope.personalBestsMap[results[i].event].single = mbldResult.solved + '/' + mbldResult.attempted + ' in ' + mbldResult.time;
            break;
        }
      }
      for (var event in $scope.personalBestsMap) {
        if ($scope.personalBestsMap.hasOwnProperty(event)) {
          if (($scope.personalBestsMap[event].single) || ($scope.personalBestsMap[event].average)) {
            $scope.personalBests.push({
              name: $scope.personalBestsMap[event].name,
              single: $scope.personalBestsMap[event].single,
              average: ($scope.personalBestsMap[event].average == 'DNF') ? '' : $scope.personalBestsMap[event].average,
              index: $scope.personalBestsMap[event].index
            });
          }
        }
      }

      // Results by Week and Event
      for (i = 0; i < results.length; i++) {
        if (!$scope.resultsByWeek[results[i].week]) {
          $scope.resultsByWeek[results[i].week] = [];
        }
        if (!$scope.resultsByEvent[results[i].event]) {
          $scope.resultsByEvent[results[i].event] = {'name':$scope.eventMap[results[i].event].name, 'index':$scope.eventMap[results[i].event].index, 'results':[]};
        }
        data = JSON.parse(results[i].data);
        var result = {'event':$scope.eventMap[results[i].event].name, 'week':results[i].week, 'index':$scope.eventMap[results[i].event].index};
        switch($scope.eventMap[results[i].event].format) {
          case 'avg5':
            result.best = Calculator.calculateSingle(data.times, data.penalties);
            result.average = Calculator.calculateAverage(data.times, data.penalties);
            result.details = '';
            formattedTimes = Calculator.formatTimes(data.times, data.penalties);
            for (j = 0; j < data.times.length; j++) {
              result.details += (j == data.times.length - 1) ? Calculator.reformatTime(formattedTimes[j]) : Calculator.reformatTime(formattedTimes[j]) + ', ';
            }
            break;
          case 'mo3':
          case 'bo3':
            result.best = Calculator.calculateSingle(data.times, data.penalties);
            result.average = ((results[i].event == '555bf') || (results[i].event == '444bf')) ? '' : Calculator.calculateMean(data.times, data.penalties);
            result.details = '';
            formattedTimes = Calculator.formatTimes(data.times, data.penalties);
            for (j = 0; j < data.times.length; j++) {
              result.details += (j == data.times.length - 1) ? Calculator.reformatTime(formattedTimes[j]) : Calculator.reformatTime(formattedTimes[j]) + ', ';
            }
            break;
          case 'fmc':
            result.best = Calculator.calculateFMCSingle(data.moves);
            result.average = Calculator.calculateFMCMean(data.moves);
            result.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
            break;
          case 'mbld':
            result.best = data.solved + '/' + data.attempted + ' in ' + data.time;
            result.details = result.best;
            break;
        }
        $scope.resultsByWeek[results[i].week].push(result);
        $scope.resultsByEvent[results[i].event].results.push(result);
      }

    });

    $scope.displayWeek = function(week) {
      return week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }


  function orderObjectBy() {

    return function(items, field) {

      var filtered = [];
      angular.forEach(items, function(item, key) {
        item.key = key;
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return (a[field] > b[field] ? 1 : -1);
      });
      return filtered;

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

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').filter('orderObjectBy', orderObjectBy);

  angular.module('nuCubingApp').factory('Calculator', Calculator);

  angular.module('nuCubingApp').controller('ProfileController', ProfileController);

})();
