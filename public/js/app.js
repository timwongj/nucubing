var app = angular.module('nuCubingApp', []);

app.controller('nuCubingController', function($scope, $http) {
    $scope.authStatus = 'Login';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'logged-in')
            $scope.authStatus = 'Logout'
    });

    $scope.results = {
        x3Cube:'Not Completed',
        x4Cube:'Not Completed',
        x5Cube:'Not Completed',
        x2Cube:'Not Completed',
        x3BLD:'Not Completed',
        x3OH:'Not Completed',
        pyra:'Not Completed',
        skewb:'Not Completed'
    };

});

