(function() {

  'use strict';

  function ContestMbldController($scope, $http) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
    });

    $scope.scrambles = [];
    $scope.displayed = 7;
    $scope.mbldResult = {'solved':'', 'attempted':'', 'time':''};
    $scope.valid = false;
    $scope.dnf = '';

    // get scrambles
    $http.get('/contest/scrambles/333mbf').success(function(response) {
      for (var i = 0; i < response[0].scrambles.length; i++) {
        $scope.scrambles[i] = response[0].scrambles[i];
      }
    });

    // get results if they exist
    $http.get('/contest/results/333mbf').success(function(results) {
      var data = JSON.parse(results.data);
      if (data) {
        $scope.mbldResult = {'solved':data.solved, 'attempted':data.attempted, 'time':data.time, 'dnf':''};
        $scope.valid = true;
      }
    });

    $scope.display = function(option) {
      switch(option) {
        case 'more':
          if ($scope.displayed < $scope.scrambles.length) {
            $scope.displayed += 7;
          }
          break;
        case 'less':
          if ($scope.displayed > 7) {
            $scope.displayed -= 7;
          }
          break;
      }
    };

    $scope.update = function() {
      if ($scope.mbldContestForm.$valid && ($scope.mbldResult.solved <= $scope.mbldResult.attempted)) {
        $scope.valid = true;
        var rawScore = parseInt($scope.mbldResult.solved - ($scope.mbldResult.attempted - $scope.mbldResult.solved));
        if (((rawScore >= 0) && ($scope.mbldResult.attempted > 2)) || ((rawScore > 0) && ($scope.mbldResult.attempted == 2))) {
          var time = $scope.mbldResult.time.split(':');
          if (time[0] && time[1]) {
            if ((parseInt(time[0]) < 60) || (parseInt(time[0]) == 60) && parseInt(time[1]) == 0) {
              $scope.dnf = '';
            } else {
              $scope.dnf = '(DNF)';
            }
          }
        }
      } else {
        $scope.valid = false;
      }
    };

    // submit results for the given event for the current week
    $scope.submit = function() {
      var result = {'event':'333mbf', 'data':{}};
      result.data.solved = $scope.mbldResult.solved;
      result.data.attempted = $scope.mbldResult.attempted;
      result.data.time = $scope.mbldResult.time;
      result.data.dnf = $scope.mbldResult.dnf;
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        window.location.replace('/contest');
      });
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestMbldController', ContestMbldController);

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
