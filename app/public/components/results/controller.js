(function() {

  'use strict';

  function ResultsController($scope, $resource, Calculator) {

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

    $scope.eventsList = ['All Events', '333', '444', '555', '222', '333bf', '333oh', '333fm', '333ft', 'minx', 'pyram', 'sq1', 'clock', 'skewb', '666', '777', '444bf', '555bf', '333mbf'];
    $scope.selectedEvent = $scope.eventsList[0];
    var dataLoaded = false;

    var User = $resource('/api/user');
    var Weeks = $resource('/api/weeks');
    var Results = $resource('/api/results');

    $scope.user = User.get();
    $scope.weeksList = Weeks.query(function() {
      $scope.weeksList.unshift('All Weeks');
      $scope.selectedWeek = ($scope.weeksList[1]) ? $scope.weeksList[1] : $scope.weeksList[0];
      dataLoaded = true;
    });

    $scope.$watchGroup(['selectedWeek', 'selectedEvent'], function() {
      if (dataLoaded) {
        getResults($scope.selectedWeek, $scope.selectedEvent);
      }
    });

    function getResults(week, event) {
      if (week == 'All Weeks') {
        if (event == 'All Events') {
          Results.query({
            'status':'Completed'
          }, function(results) {
            var convertedResults = convertResults(results);
            var sections = [];
            angular.forEach(convertedResults, function(convertedResult, index) {
              var exists = false;
              angular.forEach(sections, function(section) {
                if ((results[index].week == section.week) && (results[index].event == section.event)) {
                  exists = true;
                  section.results.push(convertedResult);
                }
              });
              if (!exists) {
                sections.push({
                  'week':results[index].week,
                  'event':results[index].event,
                  'results':[convertedResult],
                  'index':$scope.events[convertedResult.event].index
                });
              }
            });
            $scope.displayedResults = sections;
          });
        } else {
          Results.query({
            'event':event,
            'status':'Completed'
          }, function(results) {
            var convertedResults = convertResults(results);
            var sections = [];
            angular.forEach(convertedResults, function(convertedResult, index) {
              var exists = false;
              angular.forEach(sections, function(section) {
                if (results[index].week == section.week) {
                  exists = true;
                  section.results.push(convertedResult);
                }
              });
              if (!exists) {
                sections.push({
                  'week':results[index].week,
                  'event':event,
                  'results':[convertedResult],
                  'index':0
                });
              }
            });
            $scope.displayedResults = sections;
          });
        }
      } else if (event == 'All Events') {
        Results.query({
          'week':week,
          'status':'Completed'
        }, function(results) {
          var convertedResults = convertResults(results);
          var sections = [];
          angular.forEach(convertedResults, function(convertedResult, index) {
            var exists = false;
            angular.forEach(sections, function(section) {
              if (results[index].event == section.event) {
                exists = true;
                section.results.push(convertedResult);
              }
            });
            if (!exists) {
              sections.push({
                'week':week,
                'event':results[index].event,
                'results':[convertedResult],
                'index':$scope.events[convertedResult.event].index
              });
            }
          });
          $scope.displayedResults = sections;
        });
      } else {
        Results.query({
          'week':week,
          'event':event,
          'status':'Completed'
        }, function(results) {
          var convertedResults = convertResults(results);
          var section = {
            'week':week,
            'event':event,
            'results':convertedResults,
            'index':($scope.events[event]) ? $scope.events[event].index : 0
          };
          $scope.displayedResults = [section];
        });
      }
    }

    function convertResults(results) {
      var res, formattedTimes, convertedResults = [];
      angular.forEach(results, function(result) {
        var data = JSON.parse(result.data);
        var result = {
          'name': result.firstName + ' ' + result.lastName,
          'facebook_id': result.facebook_id,
          'week': result.week,
          'event': result.event,
          'index': $scope.events[result.event].index
        };
        switch($scope.events[result.event].format) {
          case 'avg5':
            result.best = Calculator.calculateSingle(data.times, data.penalties);
            result.average = Calculator.calculateAverage(data.times, data.penalties);
            result.details = '';
            formattedTimes = Calculator.formatTimes(data.times, data.penalties);
            angular.forEach(formattedTimes, function(formattedTime, index) {
              result.details += (index == data.times.length - 1) ? Calculator.reformatTime(formattedTime) : Calculator.reformatTime(formattedTime) + ', ';
            });
            res = result.average.split(':');
            result.raw = (result.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'mo3':
            result.best = Calculator.calculateSingle(data.times, data.penalties);
            result.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : Calculator.calculateMean(data.times, data.penalties);
            result.details = '';
            formattedTimes = Calculator.formatTimes(data.times, data.penalties);
            angular.forEach(formattedTimes, function(formattedTime, index) {
              result.details += (index == data.times.length - 1) ? Calculator.reformatTime(formattedTime) : Calculator.reformatTime(formattedTime) + ', ';
            });
            res = result.average.split(':');
            result.raw = (result.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'bo3':
            result.best = Calculator.calculateSingle(data.times, data.penalties);
            result.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : Calculator.calculateMean(data.times, data.penalties);
            result.details = '';
            formattedTimes = Calculator.formatTimes(data.times, data.penalties);
            angular.forEach(formattedTimes, function(formattedTime, index) {
              result.details += (index == data.times.length - 1) ? Calculator.reformatTime(formattedTime) : Calculator.reformatTime(formattedTime) + ', ';
            });
            res = result.best.split(':');
            result.raw = (result.best == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
            break;
          case 'fmc':
            result.best = Calculator.calculateFMCSingle(data.moves);
            result.average = Calculator.calculateFMCMean(data.moves);
            result.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
            result.raw = result.result;
            break;
          case 'mbld':
            if (data.dnf == '(DNF)') {
              result.best = 'DNF';
              result.details = 'DNF';
            } else {
              result.best = data.solved + '/' + data.attempted + ' in ' + data.time;
              result.details = result.best;
            }
            var rawScore = parseFloat(data.solved) - (parseFloat(data.attempted) - parseFloat(data.solved));
            var rawTime = (parseFloat(data.time.split(':')[0]) * 60) + parseFloat(data.time.split(':')[1]);
            result.raw = rawScore.toString() + rawTime.toString();
            break;
        }
        convertedResults.push(result);
      });
      return convertedResults;
    }

    $scope.displayEvent = function(event) {
      return ((event === 'All Events') || (event === undefined)) ? event : $scope.events[event].name;
    };

    $scope.displayWeek = function(week) {
      return ((week === 'All Weeks') || (week === undefined)) ? week : week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }

  angular.module('nuCubingApp').controller('ResultsController', ResultsController);

})();
