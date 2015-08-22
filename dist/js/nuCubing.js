(function() {

  'use strict';

  function Config($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl:'/dist/components/home/home.html'
      })
      .when('/profile', {
        templateUrl:'/dist/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/users', {
        templateUrl:'/dist/components/users/users.html',
        controller:'UsersController'
      })
      .when('/users/:facebook_id', {
        templateUrl:'/dist/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/contest', {
        templateUrl:'/dist/components/contest/contest.html',
        controller:'ContestController'
      })
      .when('/contest/:event/entry', {
        templateUrl:'/dist/components/contestEntry/contestEntry.html',
        controller:'ContestEntryController'
      })
      .when('/contest/:event/timer', {
        templateUrl:'/dist/components/contestTimer/contestTimer.html',
        controller:'ContestTimerController'
      })
      .when('/contest/333fm', {
        templateUrl:'/dist/components/contestFmc/contestFmc.html',
        controller:'ContestFmcController'
      })
      .when('/contest/333mbf', {
        templateUrl:'/dist/components/contestMbld/contestMbld.html',
        controller:'ContestMbldController'
      })
      .when('/results', {
        templateUrl:'/dist/components/results/results.html',
        controller:'ResultsController'
      })
      .when('/links', {
        templateUrl:'/dist/components/links/links.html'
      })
      .when('/admin', {
        templateUrl:'/dist/components/admin/admin.html',
        controller:'AdminController'
      })
      .otherwise({
        redirectTo:'/'
      });
  }

  function Run($rootScope, $resource) {

    var User = $resource('/user');
    $rootScope.user = User.get();

  }

  angular.module('nuCubingApp', ['ui.bootstrap', 'ngRoute', 'ngResource', 'angularFileUpload']);

  angular.module('nuCubingApp').config(['$routeProvider', Config]).run(['$rootScope','$resource', Run]);

})();
(function() {

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

  angular.module('nuCubingApp').filter('orderObjectBy', OrderObjectByFilter);

})();
(function() {

  'use strict';

  function Events() {

    return {
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

  }

  angular.module('nuCubingApp').factory('Events', Events);

})();

(function() {

  'use strict';

  function Calculator(Events) {

    return {

      /**
       * Converts raw results to displayable results
       * @param results
       * @returns {Array}
       */
      convertResults: function(results) {
        var res, formattedTimes, convertedResults = [];
        var calculator = this;
        angular.forEach(results, function(result) {
          var data = JSON.parse(result.data);
          var convertedResult = {
            'name': result.firstName + ' ' + result.lastName,
            'facebook_id': result.facebook_id,
            'week': result.week,
            'event': result.event,
            'index': Events[result.event].index
          };
          switch(Events[result.event].format) {
            case 'avg5':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = calculator.calculateAverage(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.average.split(':');
              convertedResult.raw = (convertedResult.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'mo3':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : calculator.calculateMean(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.average.split(':');
              convertedResult.raw = (convertedResult.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'bo3':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : calculator.calculateMean(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.best.split(':');
              convertedResult.raw = (convertedResult.best == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'fmc':
              convertedResult.best = calculator.calculateFMCSingle(data.moves);
              convertedResult.average = calculator.calculateFMCMean(data.moves);
              convertedResult.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
              convertedResult.raw = convertedResult.average;
              break;
            case 'mbld':
              if (data.dnf == '(DNF)') {
                convertedResult.best = 'DNF';
                convertedResult.details = 'DNF';
              } else {
                convertedResult.best = data.solved + '/' + data.attempted + ' in ' + data.time;
                convertedResult.details = convertedResult.best;
              }
              var rawScore = parseFloat(data.solved) - (parseFloat(data.attempted) - parseFloat(data.solved));
              var rawTime = (parseFloat(data.time.split(':')[0]) * 60) + parseFloat(data.time.split(':')[1]);
              convertedResult.raw = rawScore.toString() + rawTime.toString();
              break;
          }
          convertedResults.push(convertedResult);
        });
        return convertedResults;
      },

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

  angular.module('nuCubingApp').factory('Calculator', ['Events', Calculator]);

})();

(function() {

  'use strict';

  function NuCubingController($scope, $rootScope) {

    $scope.user = $rootScope.user;

    $scope.keydown = function(event) {
      $rootScope.$broadcast('keydown', event);
    };

    $scope.keyup = function(event) {
      $rootScope.$broadcast('keyup', event);
    };

  }

  angular.module('nuCubingApp').controller('NuCubingController', ['$scope', '$rootScope', NuCubingController]);

})();
(function() {

  'use strict';

  function ProfileController($scope, $resource, $routeParams, Events, Calculator) {

    var User = $resource('/user');
    var Users = $resource('/users/:facebook_id');
    var Results = $resource('/results');

    $scope.user = User.get();
    $scope.events = Events;

    if ($routeParams.facebook_id) {
      $scope.userProfile = Users.get({
        facebook_id:$routeParams.facebook_id
      });
    } else {
      $scope.userProfile = $scope.user;
    }

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

  angular.module('nuCubingApp').controller('ProfileController', ['$scope', '$resource', '$routeParams', 'Events', 'Calculator', ProfileController]);

})();

(function() {

  'use strict';

  function UsersController($scope, $resource) {

    var User = $resource('/user');
    var Users = $resource('/users/:facebook_id');

    $scope.user = User.get();
    $scope.users = Users.query();

  }

  angular.module('nuCubingApp').controller('UsersController', ['$scope', '$resource', UsersController]);

})();

(function() {

  'use strict';

  function ContestController($scope, $resource, $q, Events, Calculator) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');

    $scope.user = User.get();
    var weeks = Weeks.query();
    $scope.events = Events;

    $q.all([$scope.user.$promise, weeks.$promise])
      .then(function() {
        var results = Results.query({
          'week':weeks[0],
          'facebook_id':$scope.user.facebook_id
        }, function() {
          angular.forEach(results, function(result) {
            if (result.status == 'Completed') {
              var data = JSON.parse(result.data);
              switch ($scope.events[result.event].format) {
                case 'avg5':
                  $scope.events[result.event].result = Calculator.calculateAverage(data.times, data.penalties);
                  break;
                case 'mo3' :
                  $scope.events[result.event].result = Calculator.calculateMean(data.times, data.penalties);
                  break;
                case 'bo3' :
                  $scope.events[result.event].result = Calculator.calculateSingle(data.times, data.penalties);
                  break;
                case 'fmc' :
                  $scope.events[result.event].result = Calculator.calculateFMCMean(data.moves);
                  break;
                case 'mbld' :
                  $scope.events[result.event].result = (data.dnf == '(DNF)') ? 'DNF' : data.solved + '/' + data.attempted + ' in ' + data.time;
                  break;
              }
              if ($scope.events[result.event].result != 'DNF') {
                $scope.events[result.event].result += ' ' + $scope.events[result.event].displayedFormat;
              }
            } else if (result.status == 'In Progress') {
              $scope.events[result.event].result = 'In Progress';
            }
          });
          angular.forEach($scope.events, function(event) {
            if (event.result === '') {
              event.result = 'Not Completed';
            }
          });
        });
      });

    $scope.entry = function(eventId) {
      switch(eventId) {
        case '333fm': window.location = '#/contest/333fm'; break;
        case '333mbf': window.location = '#/contest/333mbf'; break;
        default: window.location = '#/contest/' + eventId + '/entry'; break;
      }
    };

    $scope.timer = function(eventId) {
      window.location = '#/contest/' + eventId + '/timer';
    };
  }

  angular.module('nuCubingApp').controller('ContestController', ['$scope', '$resource', '$q', 'Events', 'Calculator', ContestController]);

})();

(function() {

  'use strict';

  function ContestEntryController($scope, $resource, $q, $routeParams, Events) {

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
      if (($scope.valid) && $scope.contestForm.$valid) {
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

  }

  angular.module('nuCubingApp').controller('ContestEntryController', ['$scope', '$resource', '$q', '$routeParams', 'Events', ContestEntryController]);

})();

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


    $scope.$on('keydown', function(event, args) {
      if ((args.which === 32) && ($scope.isKeydown === 0) && (!$scope.done)) {
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
    });

    $scope.$on('keyup', function(event, args) {
      if ((args.which === 32) && ($scope.isKeydown === 1) && (!$scope.done)) {
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


(function() {

  'use strict';

  function ContestFmcController($scope, $resource, $q) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');
    var Scrambles = $resource('/scrambles');

    $scope.user = User.get();
    var weeks = Weeks.query();

    $scope.solves = [];
    $scope.changed = false;
    $scope.valid = false;
    var dataLoaded = false, savedData = {solutions:['','',''], moves:[]};

    var scrambles = weeks.$promise
      .then(function() {
        scrambles = Scrambles.query({
          'week':weeks[0],
          'event':'333fm'
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
          'event':'333fm',
          'facebook_id':$scope.user.facebook_id
        }, function() {
          if (results[0]) {
            savedData = JSON.parse(results[0].data);
            angular.forEach($scope.solves, function(solve, index) {
              solve.solution = savedData.solutions[index];
              solve.moves = savedData.moves[index];
            });
          }
          dataLoaded = true;
        });
      });

    $scope.update = function(solve) {
      solve.valid = solve.solution.length !== 0;
      solve.moves = solve.solution.split(' ').length;
      $scope.valid = true;
      angular.forEach($scope.solves, function(solve, index) {
        $scope.valid = (solve.valid) ? $scope.valid : false;
      });
    };

    $scope.$watch('solves', function() {
      if (dataLoaded) {
        $scope.changed = false;
        $scope.valid = true;
        angular.forEach($scope.solves, function(solve, index) {
          $scope.valid = (solve.solution === '') ? false : $scope.valid;
          $scope.changed = (solve.solution != savedData.solutions[index]) ? true : $scope.changed;
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
      var data = {solutions:[], moves:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = solve.moves;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'In Progress',
        'data':JSON.stringify(data)
      });
      result.$save(function() {
        angular.forEach($scope.solves, function(solve, index) {
          savedData.solutions[index] = solve.solution;
          savedData.moves[index] = solve.moves;
        });
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      var data = {solutions:[], moves:[]};
      angular.forEach($scope.solves, function(solve, index) {
        data.solutions[index] = solve.solution;
        data.moves[index] = solve.moves;
      });
      var result = new Results({
        'event':'333fm',
        'week':weeks[0],
        'status':'Completed',
        'data':JSON.stringify(data)
      });
      result.$save(function() {
        window.location = '#/contest';
      });
    };

  }

  angular.module('nuCubingApp').controller('ContestFmcController', ['$scope', '$resource', '$q', ContestFmcController]);

})();

(function() {

  'use strict';

  function ContestMbldController($scope, $resource, $q) {

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');
    var Scrambles = $resource('/scrambles');

    $scope.user = User.get();
    var weeks = Weeks.query();

    $scope.scrambles = [];
    $scope.displayed = 7;
    $scope.mbldResult = {'solved':'', 'attempted':'', 'time':'', 'dnf':''};
    $scope.valid = false;

    var dataLoaded = false, savedData = {'solved':'', 'attempted':'', 'time':'', 'dnf':''};
    $scope.changed = false;

    var scrambles = weeks.$promise
      .then(function() {
        scrambles = Scrambles.query({
          'week':weeks[0],
          'event':'333mbf'
        }, function() {
          angular.forEach(scrambles[0].scrambles, function(scramble, index) {
            $scope.scrambles[index] = scramble;
          });
        });
      });

    $q.all([$scope.user.$promise, weeks.$promise, scrambles.$promise])
      .then(function() {
        var results = Results.query({
          'week':weeks[0],
          'event':'333mbf',
          'facebook_id':$scope.user.facebook_id
        }, function() {
          if (results[0]) {
            savedData = JSON.parse(results[0].data);
            $scope.mbldResult = {
              'solved':savedData.solved,
              'attempted':savedData.attempted,
              'time':savedData.time
            };
          }
          dataLoaded = true;
        });
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
      var solved = parseInt($scope.mbldResult.solved), attempted = parseInt($scope.mbldResult.attempted);
      $scope.valid = ($scope.mbldContestForm.$valid && (solved <= attempted) && (attempted <= $scope.scrambles.length));
      if ($scope.valid) {
        var rawScore = solved - (attempted - solved);
        if (((rawScore >= 0) && (attempted > 2)) || ((rawScore > 0) && (attempted == 2))) {
          var time = $scope.mbldResult.time.split(':');
          if (time[0] && time[1]) {
            $scope.mbldResult.dnf = (((parseInt(time[0]) < 60) || (parseInt(time[0]) === 60) && parseInt(time[1]) === 0)) ? '' : '(DNF)';
          }
        } else {
          $scope.mbldResult.dnf = '(DNF)';
        }
      }
    };

    $scope.$watch('mbldResult', function() {
      if (dataLoaded) {
        $scope.mbldResult.solved =  ($scope.mbldResult.solved === undefined) ? '' : $scope.mbldResult.solved;
        $scope.mbldResult.attempted =  ($scope.mbldResult.attempted === undefined) ? '' : $scope.mbldResult.attempted;
        $scope.changed = (($scope.mbldResult.solved != savedData.solved) || ($scope.mbldResult.attempted != savedData.attempted) || ($scope.mbldResult.time != savedData.time));
        $scope.update();
      }
    }, true);

    $scope.$watch('mbldContestForm.$valid', function() {
      $scope.update();
    });
    
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
      var result = new Results({
        'event':'333mbf',
        'week':weeks[0],
        'status':'In Progress',
        'data':{}
      });
      result.data.solved = $scope.mbldResult.solved;
      result.data.attempted = $scope.mbldResult.attempted;
      result.data.time = $scope.mbldResult.time;
      result.data.dnf = $scope.mbldResult.dnf;
      result.data = JSON.stringify(result.data);
      result.$save(function() {
        savedData = {
          'solved':$scope.mbldResult.solved,
          'attempted':$scope.mbldResult.attempted,
          'time':$scope.mbldResult.time
        };
        $scope.changed = false;
      });
    };

    $scope.submit = function() {
      var result = new Results({
        'event':'333mbf',
        'week':weeks[0],
        'status':'Completed',
        'data':{}
      });
      result.data.solved = $scope.mbldResult.solved;
      result.data.attempted = $scope.mbldResult.attempted;
      result.data.time = $scope.mbldResult.time;
      result.data.dnf = $scope.mbldResult.dnf;
      result.data = JSON.stringify(result.data);
      result.$save(function() {
        window.location = '#/contest';
      });
    };

  }

  angular.module('nuCubingApp').controller('ContestMbldController', ['$scope', '$resource', '$q', ContestMbldController]);

})();

(function() {

  'use strict';

  function ResultsController($scope, $resource, Calculator, Events) {

    $scope.eventsList = ['All Events', '333', '444', '555', '222', '333bf', '333oh', '333fm', '333ft', 'minx', 'pyram', 'sq1', 'clock', 'skewb', '666', '777', '444bf', '555bf', '333mbf'];
    $scope.selectedEvent = $scope.eventsList[0];
    var dataLoaded = false;

    var User = $resource('/user');
    var Weeks = $resource('/weeks');
    var Results = $resource('/results');

    $scope.user = User.get();
    $scope.events = Events;
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
            var convertedResults = Calculator.convertResults(results);
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
            var convertedResults = Calculator.convertResults(results);
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
          var convertedResults = Calculator.convertResults(results);
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
          var convertedResults = Calculator.convertResults(results);
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

    $scope.displayEvent = function(event) {
      return ((event === 'All Events') || (event === undefined)) ? event : $scope.events[event].name;
    };

    $scope.displayWeek = function(week) {
      return ((week === 'All Weeks') || (week === undefined)) ? week : week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }

  angular.module('nuCubingApp').controller('ResultsController', ['$scope', '$resource', 'Calculator', 'Events', ResultsController]);

})();

(function() {

  'use strict';

  function AdminController($scope, $resource, Events, FileUploader) {

    var User = $resource('/user');
    var Scrambles = $resource('/scrambles');

    $scope.user = User.get();
    $scope.events = Events;

    $scope.scrambles = Scrambles.query(function() {
      angular.forEach($scope.scrambles, function(scramble) {
        scramble.index = $scope.events[scramble.event].index;
      });
    });

    $scope.uploader = new FileUploader({
      url:'/scrambles'
    });

    $scope.uploader.onSuccessItem = function(item, response) {
      $scope.scrambles = Scrambles.query(function() {
        angular.forEach($scope.scrambles, function(scramble) {
          scramble.index = $scope.events[scramble.event].index;
        });
      });
    };

    $scope.displayEvent = function(event) {
      return $scope.events[event].name;
    };

    $scope.displayWeek = function(week) {
      return week.substr(0, 2) + '-' + week.substr(2, 2) + '-20' + week.substr(4, 2);
    };

  }

  angular.module('nuCubingApp').controller('AdminController', ['$scope', '$resource', 'Events', 'FileUploader', AdminController]);

})();
