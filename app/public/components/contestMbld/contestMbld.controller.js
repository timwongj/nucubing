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
      localStorage.setItem((new Date()).toString(), JSON.stringify({
        event: '333mbf',
        week: weeks[0],
        status: 'In Progress',
        data: result.data
      }));
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
      localStorage.setItem((new Date()).toString(), JSON.stringify({
        event: '333mbf',
        week: weeks[0],
        status: 'Completed',
        data: result.data
      }));
      result.$save(function() {
        window.location = '#/contest';
      });
    };

  }

  angular.module('nuCubingApp').controller('ContestMbldController', ['$scope', '$resource', '$q', ContestMbldController]);

})();
