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

  angular.module('nuCubingApp').controller('ResultsController', ResultsController);

})();
