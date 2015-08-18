(function() {

  'use strict';

  function ContestController($scope, $http) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    // variables for ng-show
    $scope.showHome = 1;
    $scope.showManualEntry = 0;
    $scope.showFMC = 0;
    $scope.showMBLD = 0;

    // events list
    $scope.eventMap = {
      '333' : {name: 'Rubik\'s Cube', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 0},
      '444' : {name: '4x4 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 1},
      '555' : {name: '5x5 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 2},
      '222' : {name: '2x2 Cube', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 3},
      '333bf' : {name: '3x3 blindfolded', format: 'bo3', displayedFormat: 'best of 5', result : ' ', index: 4},
      '333oh' : {name: '3x3 one-handed', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 5},
      '333fm' : {name: '3x3 fewest moves', format: 'fmc', displayedFormat: 'mean of 3', result : ' ', index: 6},
      '333ft' : {name: '3x3 with feet', format: 'mo3', displayedFormat: 'mean of 3', result : ' ', index: 7},
      'minx' : {name: 'Megaminx', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 8},
      'pyram' : {name: 'Pyraminx', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 9},
      'sq1' : {name: 'Square-1', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 10},
      'clock' : {name: 'Rubik\'s Clock', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 11},
      'skewb' : {name: 'Skewb', format: 'avg5', displayedFormat: 'avg of 5', result : ' ', index: 12},
      '666' : {name: '6x6 Cube', format: 'mo3', displayedFormat: 'mean of 3', result : ' ', index: 13},
      '777' : {name: '7x7 Cube', format: 'mo3', displayedFormat: 'mean of 3', result : ' ', index: 14},
      '444bf' : {name: '4x4 blindfolded', format: 'bo3', displayedFormat: 'best of 3', result : ' ', index: 15},
      '555bf' : {name: '5x5 blindfolded', format: 'bo3', displayedFormat: 'best of 3', result : ' ', index: 16},
      '333mbf' : {name: '3x3 multi blind', format: 'mbld', displayedFormat: '',result : ' ', index: 17}
    };

    // get current week contest results for user
    $http.get('/contest/results/current').success(function(results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].status == 'Completed') {
          var data = JSON.parse(results[i].data);
          switch($scope.eventMap[results[i].event].format) {
            case 'avg5': $scope.eventMap[results[i].event].result = calculateAverage(data.times, data.penalties); break;
            case 'mo3' : $scope.eventMap[results[i].event].result = calculateMean(data.times, data.penalties); break;
            case 'bo3' : $scope.eventMap[results[i].event].result = calculateSingle(data.times, data.penalties); break;
            case 'fmc' : $scope.eventMap[results[i].event].result = calculateFMCMean(data.moves); break;
            case 'mbld' : $scope.eventMap[results[i].event].result = data.solved + '/' + data.attempted + ' in ' + data.time; break;
          }
          if ($scope.eventMap[results[i].event].result != 'DNF') {
            $scope.eventMap[results[i].event].result += ' ' + $scope.eventMap[results[i].event].displayedFormat;
          }
        } else if (results[i].status == 'In Progress') {
          $scope.eventMap[results[i].event].result = 'In Progress';
        }
      }
      for (var event in $scope.eventMap) {
        if (($scope.eventMap.hasOwnProperty(event)) && ($scope.eventMap[event].result == ' ')) {
          $scope.eventMap[event].result = 'Not Completed';
        }
      }
    });

    $scope.entry = function(eventId) {
      switch(eventId) {
        case '333fm': window.location = '/contest/333fm'; break;
        case '333mbf': window.location = '/contest/333mbf'; break;
        default: window.location = '/contest/' + eventId + '/entry'; break;
      }
    };

    $scope.timer = function(eventId) {
      window.location = '/contest/' + eventId + '/timer';
    };
  }

  function OrderObjectByFilter() {
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

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').filter('orderObjectBy', OrderObjectByFilter);

  angular.module('nuCubingApp').controller('ContestController', ContestController);

})();

// calculate the best single time from a single week
function calculateSingle(times, penalties) {
  var single = 'DNF', formattedTimes = formatTimes(times, penalties);
  for (var i = 0; i < formattedTimes.length; i++) {
    if (formattedTimes[i] != 'DNF') {
      if (single == 'DNF')
        single = formattedTimes[i];
      if (parseFloat(formattedTimes[i]) < single)
        single = formattedTimes[i];
    }
  }
  if (single == 'DNF') {
    return single;
  } else {
    return reformatTime(single);
  }
}

// calculate the trimmed average of 5 given the array of times and penalties
function calculateAverage(times, penalties) {
  var formattedTimes = formatTimes(times, penalties);
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
  return reformatTime(average);
}

// calculate FMC mean of 3
function calculateFMCMean(moves) {
  return ((moves[0] + moves[1] + moves[2]) / 3).toFixed(2);
}

// calculate the mean of 3 given the array of times and penalties
function calculateMean(times, penalties) {
  var formattedTimes = formatTimes(times, penalties);
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
  return reformatTime(mean);
}

// return an array of results in milliseconds taking penalties into account
function formatTimes(times, penalties) {
  var formattedTimes = [];
  var unsplitTimes = [];
  for (var i = 0; i < times.length; i++) {
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
}

// convert the time from milliseconds to minutes:seconds.milliseconds
function reformatTime(time) {
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
