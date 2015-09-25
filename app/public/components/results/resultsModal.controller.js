(function() {

  'use strict';

  function ResultsModalController($scope, $resource, $modalInstance, Events, result, index) {

    var Scrambles = $resource('/scrambles');
    Scrambles.query({
      week: result.week,
      event: result.event
    }, function(scrambles) {
      $scope.scramble = scrambles[0].scrambles[index];
    });

    $scope.index = index;
    $scope.name = result.name;
    $scope.facebook_id = result.facebook_id;
    $scope.event = Events[result.event].name;
    $scope.week = result.week.substr(0, 2) + '-' + result.week.substr(2, 2) + '-20' + result.week.substr(4, 2);
    $scope.result = result.details[index];
    $scope.solution = result.solutions[index];
    $scope.comments = result.comments[index];


    $scope.close = function () {
      $modalInstance.dismiss();
    };

  }

  angular.module('nuCubingApp').controller('ResultsModalController', ['$scope', '$resource', '$modalInstance', 'Events', 'result', 'index', ResultsModalController]);

})();