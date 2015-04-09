var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('nuCubingController', function($scope, $http, $modal) {
    $scope.authStatus = '';
    $scope.user = {};

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

    $http.get('userInfo').success(function(response) {
        $scope.user.firstName = response.firstName;
        $scope.user.lastName = response.lastName;
        $scope.user.email = response.email;
    });

    $scope.results = {
        x3Cube:'Not Completed',
        x4Cube:'Not Completed',
        x5Cube:'Not Completed',
        x2Cube:'Not Completed',
        x3BLD:'Not Completed',
        x3OH:'Not Completed',
        pyra:'Not Completed'
    };

    $scope.manualEntry = function(event) {
        var modalInstance = $modal.open({
            templateUrl: 'manualEntry.html',
            controller: 'manualEntryController',
            scope: $scope,
            size: "lg",
            windowClass: 'centerModal',
            resolve: {
                event: function () {
                    return event;
                },
                week: function () {
                    return '040715';
                }
            }
        }).result.then(function () {

            });
    };

    $scope.timer = function(event) {
        alert('Using Timer for ' + event);
    }

});

app.controller('manualEntryController', function($scope, $http, $modal, $modalInstance, event, week) {

    $scope.event = event;
    $scope.week = week;

    $scope.solves = [];

    for (var i = 0; i < 5; i++) {
        $scope.solves[i] = {};
        $scope.solves[i].result = '';
        $scope.solves[i].penalty = '';
    }

    $scope.solves[0].scramble = "B' R B' D2 F2 D2 L' R' B' R2 U2 L2 B' F2 U2 B' L2 F' R2 B2";
    $scope.solves[1].scramble = "R2 B' F2 R' L B2 D U' B' L2 F B' U' R2 F B R2 D2 L2 F'";
    $scope.solves[2].scramble = "U2 R2 F D2 R' F B2 R B' F2 R U2 F2 R2 L2 F2 D' R B R";
    $scope.solves[3].scramble = "L' F2 B' R' L2 F B' D R2 U' L R F U L' R2 D2 B' D F2";
    $scope.solves[4].scramble = "D' B L R2 U2 L B R' B R D' R U2 L2 R' D L2 D F D";

    $scope.ok = function () {

        $scope.eventID = '';
        if ($scope.event == 'Rubik\'s Cube')
            $scope.eventID = 'x3Cube';
        if ($scope.event == '4x4 Cube')
            $scope.eventID = 'x4Cube';
        if ($scope.event == '5x5 Cube')
            $scope.eventID = 'x5Cube';
        if ($scope.event == '2x2 Cube')
            $scope.eventID = 'x2Cube';
        if ($scope.event == '3x3 Blindfolded')
            $scope.eventID = 'x3BLD';
        if ($scope.event == '3x3 One-Handed')
            $scope.eventID = 'x3OH';
        if ($scope.event == 'Pyraminx')
            $scope.eventID = 'pyra';

        $http.post('/contest/' + $scope.week + '/' + $scope.eventID, $scope.solves).success(function (response) {
            console.log(response);
        });

        $modalInstance.close();
    }

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

window.fbAsyncInit = function() {
    FB.init({
        appId: '1397096627278092',
        cookies: true,
        xfbml: true,
        version: 'v2.3'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

