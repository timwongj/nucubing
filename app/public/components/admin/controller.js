(function() {

  'use strict';

  function AdminController($scope, $http, FileUploader) {

    // get authorization status
    $scope.authStatus = '';
    $http.get('/auth/status').success(function(response) {
      if (response.status == 'connected')
        $scope.authStatus = 'Logout';
      else
        $scope.authStatus = 'Login';
    });

    $scope.weeks = getAllScrambles($http);

    $scope.uploader = new FileUploader({
      url:'/admin/scrambles'
    });

    $scope.uploader.onSuccessItem = function() {
      $scope.weeks = getAllScrambles($http);
    }

  }

  angular.module('nuCubingApp', ['angularFileUpload']);

  angular.module('nuCubingApp').controller('AdminController', AdminController);

})();

function getAllScrambles($http) {
  var weeks = [];
  $http.get('/admin/scrambles').success(function(response) {
    for (var i = 0; i < response.length; i++) {
      var index = -1;
      for (var j = 0; j < weeks.length; j++) {
        if (weeks[j].week == response[i].week) {
          index = j;
          break;
        }
      }
      if (index < 0) {
        weeks.push({week: response[i].week, events: []});
        index = weeks.length - 1;
      }
      weeks[index].events.push({
        event: response[i].event,
        scrambles: response[i].scrambles,
        extraScrambles: response[i].extraScrambles
      });
    }
  });
  return weeks;
}
