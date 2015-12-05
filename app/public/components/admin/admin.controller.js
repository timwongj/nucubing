(function() {

  'use strict';

  function AdminController($scope, $resource, Events, FileUploader) {

    var User = $resource('/user');
    var Scrambles = $resource('/scrambles');
    var Results = $resource('/results', null, {
      'update': {
        method: 'PUT',
        params: {
          week: '@week',
          event: '@event',
          facebook_id: '@facebook_id'
        }
      }
    });
    var Users = $resource('/users');

    $scope.user = User.get();
    $scope.users = Users.query(function(users) {
      angular.forEach(users, function(user) {
        user.updated_time = moment(new Date(user.updated_time)).format('MM/DD/YYYY h:mm:ss A');
        user.created_time = moment(new Date(user.created_time)).format('MM/DD/YYYY h:mm:ss A');
      });
    });
    $scope.events = Events;
    $scope.results = Results.query(function() {
      angular.forEach($scope.results, function(result) {
        result.index = $scope.events[result.event].index;
        result.data = JSON.parse(result.data);
      });
    });

    $scope.display = 'Results';
    $scope.order = ['-week', 'index', 'displayName'];

    $scope.sort = function(field) {
      switch(field) {
        case 'week': $scope.order = ($scope.order[0] === '-week') ? ['week', 'index', 'displayName'] : ['-week', 'index', 'displayName']; break;
        case 'event': $scope.order = ($scope.order[0] === 'index') ? ['-index', '-week', 'displayName'] : ['index', '-week', 'displayName']; break;
        case 'name': $scope.order = ($scope.order[0] === 'displayName') ? ['-displayName', '-week', 'index'] : ['displayName', '-week', 'index']; break;
        case 'date': $scope.order = ($scope.order[0] === '-date') ? ['date', 'index', 'displayName'] : ['-date', 'index', 'displayName']; break;
        case 'status': $scope.order = ($scope.order[0] === 'status') ? ['-status', '-week', 'index'] : ['status', '-week', 'index']; break;
      }
    };

    $scope.weeks = {};

    $scope.scrambles = Scrambles.query(function() {
      angular.forEach($scope.scrambles, function(scramble) {
        scramble.index = $scope.events[scramble.event].index;
        scramble.dateUploaded = moment(new Date(scramble.dateUploaded)).format('MM/DD/YYYY h:mm:ss A');
        if (!$scope.weeks[scramble.week]) {
          $scope.weeks[scramble.week] = {scrambles: [], expand: false};
        }
        $scope.weeks[scramble.week].scrambles.push(scramble);
      });
    });

    $scope.editResult = function(result) {
      var changedStatus = (result.status == 'Completed') ? 'In Progress' : 'Completed';
      if (confirm('Are you sure you would like to change the status of this result to ' + changedStatus)) {
        Results.update({week:result.week, event:result.event, facebook_id:result.facebook_id}, {$set: {status: changedStatus}}, function() {
          result.status = changedStatus;
        });
      }
    };

    $scope.removeResult = function(result) {
      console.log(result);
      if (confirm('Are you sure you would like to remove this result')) {
        Results.delete({_id: result._id}, function() {
          $scope.results.splice($scope.results.indexOf(result), 1);
        });
      }
    };

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
