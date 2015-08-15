(function() {

  'use strict';

  function ContestFmcController($scope, $http) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
    });

    $scope.solves = [];

    // get scrambles
    $http.get('/contest/scrambles/333fm').success(function(response) {
      for (var i = 0; i < response[0].scrambles.length; i++)
      {
        $scope.solves[i] = {};
        $scope.solves[i].scramble = response[0].scrambles[i];
        $scope.solves[i].solution = '';
        $scope.solves[i].moves = '';
        $scope.solves[i].valid = false;
        $scope.solves[i].dnf = '';
      }
    });

    // get results if they exist
    $http.get('/contest/results/333fm').success(function(results) {
      var data = JSON.parse(results.data);
      for (var i = 0; i < $scope.solves.length; i++) {
        $scope.solves[i].solution = data.solutions[i];
        $scope.solves[i].moves = data.moves[i];
        $scope.solves[i].valid = true;
        $scope.solves[i].dnf = '';
      }
    });

    $scope.update = function(index) {
      $scope.solves[index].valid = $scope.solves[index].solution.length != 0;
      $scope.solves[index].moves = $scope.solves[index].solution.split(' ').length;
    };

    // submit results for the given event for the current week
    $scope.submit = function() {
      var result = {'event':'333fm', 'data':{}};
      result.data.solutions = [];
      result.data.moves = [];
      for (var i = 0; i < $scope.solves.length; i++) {
        result.data.solutions[i] = $scope.solves[i].solution;
        result.data.moves[i] = $scope.solves[i].moves;
      }
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        window.location.replace('/contest');
      });
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestFmcController', ContestFmcController);

})();

// calculate best result from a list of results
function findBest(results) {
  var best = 'DNF';
  var unsplitTimes = [];
  for (var i = 0; i < results.length; i++) {
    var res = results[i].split(':');
    if (res.length > 1)
      unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
    else
      unsplitTimes[i] = parseFloat(res[0]);
  }
  for (var i = 0; i < results.length; i++) {
    if ((best == 'DNF') && (unsplitTimes[i] != 'DNF'))
      best = unsplitTimes[i];
    if (parseFloat(unsplitTimes[i]) < best)
      best = unsplitTimes[i];
  }
  return reformatTime(best);
}

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
  var DNFCount = 0, minIndex, maxIndex, minValue, maxValue;
  for (var i = 0; i < formattedTimes.length; i++) {
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
  for (var i = 0; i < formattedTimes.length; i++) {
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
  for (var i = 0; i < formattedTimes.length; i++) {
    if ((i != maxIndex) && (parseFloat(formattedTimes[i]) < minValue)) {
      minValue = parseFloat(formattedTimes[i]);
      minIndex = i;
    }
  }
  if ((minIndex == 0) && (maxIndex == 0)) {
    maxIndex = 1;
  }
  var sum = 0;
  for (var i = 0; i < formattedTimes.length; i++) {
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
  var DNFCount = 0;
  for (var i = 0; i < formattedTimes.length; i++) {
    if (formattedTimes[i] == 'DNF') {
      DNFCount++;
    }
  }
  if (DNFCount > 0) {
    return 'DNF';
  }
  var sum = 0;
  for (var i = 0; i < formattedTimes.length; i++) {
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

// prevent default behavior of enter key
function stopRKey(evt) {
  var evt = (evt) ? evt : ((event) ? event : null);
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

document.onkeypress = stopRKey;
