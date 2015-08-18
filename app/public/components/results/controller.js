(function() {

  'use strict';

  function ResultsController($scope, $http) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    // events list
    $scope.eventMap = {
      '333' : {name: 'Rubik\'s Cube', format: 'avg5', results : [], index: 0},
      '444' : {name: '4x4 Cube', format: 'avg5', results : [], index: 1},
      '555' : {name: '5x5 Cube', format: 'avg5', results : [], index: 2},
      '222' : {name: '2x2 Cube', format: 'avg5', results : [], index: 3},
      '333bf' : {name: '3x3 blindfolded', format: 'bo3', results : [], index: 4},
      '333oh' : {name: '3x3 one-handed', format: 'avg5', results : [], index: 5},
      '333fm' : {name: '3x3 fewest moves', format: 'fmc', results : [], index: 6},
      '333ft' : {name: '3x3 with feet', format: 'mo3', results : [], index: 7},
      'minx' : {name: 'Megaminx', format: 'avg5', results : [], index: 8},
      'pyram' : {name: 'Pyraminx', format: 'avg5', results : [], index: 9},
      'sq1' : {name: 'Square-1', format: 'avg5', results : [], index: 10},
      'clock' : {name: 'Rubik\'s Clock', format: 'avg5', results : [], index: 11},
      'skewb' : {name: 'Skewb', format: 'avg5', results : [], index: 12},
      '666' : {name: '6x6 Cube', format: 'mo3', results : [], index: 13},
      '777' : {name: '7x7 Cube', format: 'mo3', results : [], index: 14},
      '444bf' : {name: '4x4 blindfolded', format: 'bo3', results : [], index: 15},
      '555bf' : {name: '5x5 blindfolded', format: 'bo3', results : [], index: 16},
      '333mbf' : {name: '3x3 multi blind', format: 'mbld', results : [], index: 17}
    };

    $http.get('/results/weeks').success(function(weeks) {
      $scope.weeks = weeks.sort().reverse();
      $scope.weeks.unshift('All Weeks');
      $scope.selectedWeek = ($scope.weeks[1]) ? $scope.weeks[1] : $scope.weeks[0];
      $scope.events = ['All Events','333', '444', '555', '222', '333bf', '333oh', '333fm', '333ft', 'minx', 'pyram', 'sq1', 'clock', 'skewb', '666', '777', '444bf', '555bf', '333mbf'];
      $scope.selectedEvent = $scope.events[0];
    });

    $scope.$watch('selectedWeek', function() {
      getResults($scope.selectedWeek, $scope.selectedEvent);
    });

    $scope.$watch('selectedEvent', function() {
      getResults($scope.selectedWeek, $scope.selectedEvent);
    });

    function getResults(week, event) {
      $scope.displayedResults = [];
      var i, j;
      if (week == 'All Weeks') {
        if (event == 'All Events') {
          // get all results
          $http.get('/results/all').success(function(results) {
            var convertedResults = convertResults(results);
            var sections = [];
            for (i = 0; i < convertedResults.length; i++) {
              var exists = false;
              for (j = 0; j < sections.length; j++) {
                if ((results[i].week == sections[j].week) && (results[i].event == sections[j].event)) {
                  exists = true;
                  sections[j].results.push(convertedResults[i]);
                }
              }
              if (!exists) {
                sections.push({
                  'week':results[i].week,
                  'event':results[i].event,
                  'results':[convertedResults[i]],
                  'index':$scope.eventMap[convertedResults[i].event].index
                });
              }
            }
            $scope.displayedResults = sections;
          });
        } else {
          // get results by event
          $http.get('/results/event/' + event).success(function(results) {
            var convertedResults = convertResults(results);
            var sections = [];
            for (i = 0; i < convertedResults.length; i++) {
              var exists = false;
              for (j = 0; j < sections.length; j++) {
                if (results[i].week == sections[j].week) {
                  exists = true;
                  sections[j].results.push(convertedResults[i]);
                }
              }
              if (!exists) {
                sections.push({
                  'week':results[i].week,
                  'event':event,
                  'results':[convertedResults[i]],
                  'index': 0
                });
              }
            }
            $scope.displayedResults = sections;
          });
        }
      } else if (event == 'All Events') {
        // get results by week
        $http.get('/results/week/' + week).success(function(results) {
          var convertedResults = convertResults(results);
          var sections = [];
          for (i = 0; i < convertedResults.length; i++) {
            var exists = false;
            for (j = 0; j < sections.length; j++) {
              if (results[i].event == sections[j].event) {
                exists = true;
                sections[j].results.push(convertedResults[i]);
              }
            }
            if (!exists) {
              sections.push({
                'week':week,
                'event':results[i].event,
                'results':[convertedResults[i]],
                'index':$scope.eventMap[convertedResults[i].event].index
              });
            }
          }
          $scope.displayedResults = sections;
        });
      } else {
        // get results by week and event
        $http.get('/results/week/' + week + '/event/' + event).success(function(results) {
          var convertedResults = convertResults(results);
          var section = {
            'week':week,
            'event':event,
            'results':convertedResults,
            'index':($scope.eventMap[event]) ? $scope.eventMap[event].index : 0
          };
          $scope.displayedResults = [section];
        });
      }
    }

    function convertResults(results) {
      var i, j, res, formattedTimes, convertedResults = [];
      for (i = 0; i < results.length; i++) {
        var data = JSON.parse(results[i].data);
        var result = {
          'name': results[i].firstName + ' ' + results[i].lastName,
          'facebook_id': results[i].facebook_id,
          'week': results[i].week,
          'event': results[i].event,
          'index': $scope.eventMap[results[i].event].index
        };
        switch($scope.eventMap[results[i].event].format) {
          case 'avg5':
            result.best = calculateSingle(data.times, data.penalties);
            result.average = calculateAverage(data.times, data.penalties);
            result.details = '';
            formattedTimes = formatTimes(data.times, data.penalties);
            for (j = 0; j < data.times.length; j++) {
              result.details += (j == data.times.length - 1) ? reformatTime(formattedTimes[j]) : reformatTime(formattedTimes[j]) + ', ';
            }
            res = result.average.split(':');
            result.raw = (result.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'mo3':
            result.best = calculateSingle(data.times, data.penalties);
            result.average = ((results[i].event == '555bf') || (results[i].event == '444bf')) ? '' : calculateMean(data.times, data.penalties);
            result.details = '';
            formattedTimes = formatTimes(data.times, data.penalties);
            for (j = 0; j < data.times.length; j++) {
              result.details += (j == data.times.length - 1) ? reformatTime(formattedTimes[j]) : reformatTime(formattedTimes[j]) + ', ';
            }
            res = result.average.split(':');
            result.raw = (result.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'bo3':
            result.best = calculateSingle(data.times, data.penalties);
            result.average = ((results[i].event == '555bf') || (results[i].event == '444bf')) ? '' : calculateMean(data.times, data.penalties);
            result.details = '';
            formattedTimes = formatTimes(data.times, data.penalties);
            for (j = 0; j < data.times.length; j++) {
              result.details += (j == data.times.length - 1) ? reformatTime(formattedTimes[j]) : reformatTime(formattedTimes[j]) + ', ';
            }
            res = result.best.split(':');
            result.raw = (result.best == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'fmc':
            result.best = calculateFMCSingle(data.moves);
            result.average = calculateFMCMean(data.moves);
            result.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
            result.raw = result.result;
            break;
          case 'mbld':
            result.best = data.solved + '/' + data.attempted + ' in ' + data.time;
            result.details = result.best;
            var rawScore = parseFloat(data.solved) - (parseFloat(data.attempted) - parseFloat(data.solved));
            var rawTime = (parseFloat(data.time.split(':')[0]) * 60) + parseFloat(data.time.split(':')[1]);
            result.raw = rawScore.toString() + rawTime.toString();
            break;
        }
        convertedResults.push(result);
      }
      return convertedResults;
    }

    $scope.displayEvent = function(event) {
      return ((event === 'All Events') || (event === undefined)) ? event : $scope.eventMap[event].name;
    };

    $scope.displayWeek = function(week) {
      return ((week === 'All Weeks') || (week === undefined)) ? week : week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
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

  angular.module('nuCubingApp').controller('ResultsController', ResultsController);

})();

// calculate best result from a list of results
function findBest(results) {
  var i, best = 'DNF', unsplitTimes = [];
  for (i = 0; i < results.length; i++) {
    var res = results[i].split(':');
    if (res.length > 1)
      unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
    else
      unsplitTimes[i] = parseFloat(res[0]);
  }
  for (i = 0; i < results.length; i++) {
    if ((best == 'DNF') && (unsplitTimes[i] != 'DNF'))
      best = unsplitTimes[i];
    if (parseFloat(unsplitTimes[i]) < best)
      best = unsplitTimes[i];
  }
  return reformatTime(best);
}

// calculate the best fmc single
function calculateFMCSingle(moves) {
  var single = 'DNF';
  for (var i = 0; i < moves.length; i++) {
    if (moves[i] != 'DNF') {
      if (single == 'DNF')
        single = moves[i];
      if (parseFloat(moves[i]) < single)
        single = moves[i];
    }
  }
  return single;
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
