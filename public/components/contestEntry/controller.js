(function() {

  'use strict';

  function ContestEntryController($scope, $http, $location) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
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
          $scope.valid = ($scope.solves[i].time == '') ? false : $scope.valid;
        } catch (e) {
          if ($scope.solves[i]) {
            $scope.changed = (($scope.solves[i].time != '') || ($scope.solves[i].penalty != '')) ? true : $scope.changed;
            $scope.valid = ($scope.solves[i].time == '') ? false : $scope.valid;
          }
        }
      }
    }, true);

    $scope.back = function() {
      if ($scope.changed) {
        if (confirm('You have unsaved changes, are you sure you want to go back?')) {
          window.location.replace('/contest');
        }
      } else {
        window.location.replace('/contest');
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
          window.location.replace('/contest');
        });
      }
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestEntryController', ContestEntryController);

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
