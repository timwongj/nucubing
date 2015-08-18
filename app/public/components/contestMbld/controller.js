(function() {

  'use strict';

  function ContestMbldController($scope, $http) {

    // get authorization status
    $http.get('/auth/status').success(function(response) {
      $scope.authStatus = (response.status == 'connected') ? 'Logout' : 'Login';
    });

    $scope.scrambles = [];
    $scope.displayed = 7;
    $scope.mbldResult = {'solved':'', 'attempted':'', 'time':'', 'dnf':''};
    $scope.valid = false;
    $scope.dnf = '';

    var savedData = {'solved':'', 'attempted':'', 'time':'', 'dnf':''};
    $scope.changed = false;

    // get scrambles
    $http.get('/contest/scrambles/333mbf').success(function(response) {
      $scope.week = response.week;
      for (var i = 0; i < response.data[0].scrambles.length; i++) {
        $scope.scrambles[i] = response.data[0].scrambles[i];
      }

      // get results if they exist
      $http.get('/contest/results/333mbf').success(function(results) {
        savedData = JSON.parse(results.data);
        if (savedData) {
          $scope.mbldResult = {'solved':savedData.solved, 'attempted':savedData.attempted, 'time':savedData.time};
        }
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
      if ($scope.mbldContestForm.$valid && ($scope.mbldResult.solved <= $scope.mbldResult.attempted) && ($scope.mbldResult.attempted <= $scope.scrambles.length)) {
        $scope.valid = true;
        var rawScore = parseInt($scope.mbldResult.solved - ($scope.mbldResult.attempted - $scope.mbldResult.solved));
        if (((rawScore >= 0) && ($scope.mbldResult.attempted > 2)) || ((rawScore > 0) && ($scope.mbldResult.attempted == 2))) {
          var time = $scope.mbldResult.time.split(':');
          if (time[0] && time[1]) {
            if ((parseInt(time[0]) < 60) || (parseInt(time[0]) === 60) && parseInt(time[1]) === 0) {
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

    $scope.$watch('mbldResult', function() {
      $scope.mbldResult.solved =  ($scope.mbldResult.solved === undefined) ? '' : $scope.mbldResult.solved;
      $scope.mbldResult.attempted =  ($scope.mbldResult.attempted === undefined) ? '' : $scope.mbldResult.attempted;
      $scope.changed = (($scope.mbldResult.solved != savedData.solved) || ($scope.mbldResult.attempted != savedData.attempted) || ($scope.mbldResult.time != savedData.time));
      $scope.update();
    }, true);

    $scope.$watch('mbldContestForm.$valid', function() {
      $scope.update();
    });
    
    $scope.back = function() {
      if ($scope.changed) {
        if (confirm('You have unsaved changes, are you sure you want to go back?')) {
          window.location = '/contest';
        }
      } else {
        window.location = '/contest';
      }
    };

    $scope.info = function() {
      alert('Info');
    };

    // submit results for the given event for the current week
    $scope.save = function() {
      var result = {'event':'333mbf', 'week':$scope.week, 'status':'In Progress', 'data':{}};
      result.data.solved = $scope.mbldResult.solved;
      result.data.attempted = $scope.mbldResult.attempted;
      result.data.time = $scope.mbldResult.time;
      result.data.dnf = $scope.mbldResult.dnf;
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        savedData = {'solved':$scope.mbldResult.solved, 'attempted':$scope.mbldResult.attempted, 'time':$scope.mbldResult.time};
        $scope.changed = false;
      });
    };

    // submit results for the given event for the current week
    $scope.submit = function() {
      var result = {'event':'333mbf', 'week':$scope.week, 'status':'Completed', 'data':{}};
      result.data.solved = $scope.mbldResult.solved;
      result.data.attempted = $scope.mbldResult.attempted;
      result.data.time = $scope.mbldResult.time;
      result.data.dnf = $scope.mbldResult.dnf;
      result.data = JSON.stringify(result.data);
      $http.post('/contest/submit', result).success(function (response) {
        window.location = '/contest';
      });
    };

  }

  angular.module('nuCubingApp', ['ui.bootstrap']);

  angular.module('nuCubingApp').controller('ContestMbldController', ContestMbldController);

})();
