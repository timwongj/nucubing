(function() {

  'use strict';

  function ProfileController($scope, $resource, $location, Calculator) {

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

    $scope.displayFormat = 'Week';
    $scope.resultsByWeek = {};
    $scope.resultsByEvent = {};

    $scope.personalBestsMap = $scope.events;
    $scope.personalBests = [];

    for (var event in $scope.personalBestsMap) {
      if ($scope.personalBestsMap.hasOwnProperty(event)) {
        $scope.personalBestsMap[event].single = '';
        $scope.personalBestsMap[event].average = '';
      }
    }

    var User = $resource('/user');
    var Users = $resource('/users/:facebook_id');
    var Results = $resource('/results');

    $scope.user = User.get();

    var url = $location.$$absUrl.split('/');
    if (url.indexOf('users') < 0) {
      $scope.profileClass = 'active';
      $scope.usersClass = '';
      $scope.userProfile = $scope.user;
    } else {
      $scope.profileClass = '';
      $scope.usersClass = 'active';
      $scope.userProfile = Users.get({
        facebook_id:url[url.indexOf('users') + 1]
      });
    }

    $scope.userProfile.$promise
      .then(function() {
        var results = Results.query({
          'facebook_id':$scope.userProfile.facebook_id,
          'status':'Completed'
        }, function() {
          angular.forEach(results, function(result) {
            var data = JSON.parse(result.data);
            switch($scope.personalBestsMap[result.event].format) {
              case 'avg5':
                $scope.personalBestsMap[result.event].single = Calculator.compareResults($scope.personalBestsMap[result.event].single, Calculator.calculateSingle(data.times, data.penalties));
                $scope.personalBestsMap[result.event].average = Calculator.compareResults($scope.personalBestsMap[result.event].average, Calculator.calculateAverage(data.times, data.penalties));
                break;
              case 'mo3':
              case 'bo3':
                $scope.personalBestsMap[result.event].single = Calculator.compareResults($scope.personalBestsMap[result.event].single, Calculator.calculateSingle(data.times, data.penalties));
                $scope.personalBestsMap[result.event].average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : Calculator.compareResults($scope.personalBestsMap[result.event].average, Calculator.calculateMean(data.times, data.penalties));
                break;
              case 'fmc':
                $scope.personalBestsMap[result.event].single = Calculator.compareResults($scope.personalBestsMap[result.event].single, Calculator.calculateFMCSingle(data.moves));
                $scope.personalBestsMap[result.event].average = Calculator.compareResults($scope.personalBestsMap[result.event].average, Calculator.calculateFMCMean(data.moves));
                break;
              case 'mbld':
                if (data.dnf != '(DNF)') {
                  var mbldResult = Calculator.compareMBLDResults($scope.personalBestsMap[result.event].single, data);
                  $scope.personalBestsMap[result.event].single = mbldResult.solved + '/' + mbldResult.attempted + ' in ' + mbldResult.time;
                }
                break;
            }
            if (!$scope.resultsByWeek[result.week]) {
              $scope.resultsByWeek[result.week] = [];
            }
            if (!$scope.resultsByEvent[result.event]) {
              $scope.resultsByEvent[result.event] = {'name':$scope.events[result.event].name, 'index':$scope.events[result.event].index, 'results':[]};
            }
            var res = {
              'event':$scope.events[result.event].name,
              'week':result.week,
              'index':$scope.events[result.event].index
            };
            var formattedTimes;
            switch($scope.events[result.event].format) {
              case 'avg5':
                res.best = Calculator.calculateSingle(data.times, data.penalties);
                res.average = Calculator.calculateAverage(data.times, data.penalties);
                res.details = '';
                formattedTimes = Calculator.formatTimes(data.times, data.penalties);
                angular.forEach(data.times, function(time, index) {
                  res.details += (index == data.times.length - 1) ? Calculator.reformatTime(formattedTimes[index]) : Calculator.reformatTime(formattedTimes[index]) + ', ';
                });
                break;
              case 'mo3':
              case 'bo3':
                res.best = Calculator.calculateSingle(data.times, data.penalties);
                res.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : Calculator.calculateMean(data.times, data.penalties);
                res.details = '';
                formattedTimes = Calculator.formatTimes(data.times, data.penalties);
                angular.forEach(data.times, function(time, index) {
                  res.details += (index == data.times.length - 1) ? Calculator.reformatTime(formattedTimes[index]) : Calculator.reformatTime(formattedTimes[index]) + ', ';
                });
                break;
              case 'fmc':
                res.best = Calculator.calculateFMCSingle(data.moves);
                res.average = Calculator.calculateFMCMean(data.moves);
                res.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
                break;
              case 'mbld':
                if (data.dnf == '(DNF)') {
                  res.best = 'DNF';
                  res.details = 'DNF';
                } else {
                  res.best = data.solved + '/' + data.attempted + ' in ' + data.time;
                  res.details = res.best;
                }
                break;
            }
            $scope.resultsByWeek[result.week].push(res);
            $scope.resultsByEvent[result.event].results.push(res);
          });
          angular.forEach($scope.personalBestsMap, function(event) {
            if (event.single || event.average) {
              $scope.personalBests.push({
                name: event.name,
                single: event.single,
                average: (event.average == 'DNF') ? '' : event.average,
                index: event.index
              });
            }
          });
        });
      });

    $scope.displayWeek = function(week) {
      return week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }

  angular.module('nuCubingApp').controller('ProfileController', ProfileController);

})();
