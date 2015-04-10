var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('contestController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

    $scope.showHome = 1;
    $scope.showManualEntry = 0;
    $scope.showTimer = 0;

    $scope.events = [];
    $scope.events[0] = {name:"Rubik's Cube", result:'Not Completed'};
    $scope.events[1] = {name:"4x4 Cube", result:'Not Completed'};
    $scope.events[2] = {name:"5x5 Cube", result:'Not Completed'};
    $scope.events[3] = {name:"2x2 Cube", result:'Not Completed'};
    $scope.events[4] = {name:"3x3 Blindfolded", result:'Not Completed'};
    $scope.events[5] = {name:"3x3 One-Handed", result:'Not Completed'};
    $scope.events[6] = {name:"Pyraminx", result:'Not Completed'};

    $scope.week = '040715';
    $scope.event;
    $scope.eventId;
    $scope.solves = [];

    $scope.manualEntry = function(event) {
        if (event.name == "Rubik's Cube")
            $scope.eventId = 'x3Cube';
        if (event.name == "4x4 Cube")
            $scope.eventId = 'x4Cube';
        if (event.name == "5x5 Cube")
            $scope.eventId = 'x5Cube';
        if (event.name == "2x2 Cube")
            $scope.eventId = 'x2Cube';
        if (event.name == "3x3 Blindfolded")
            $scope.eventId = 'x3BLD';
        if (event.name == "3x3 One-Handed")
            $scope.eventId = 'x3OH';
        if (event.name == "Pyraminx")
            $scope.eventId = 'pyra';
        $http.get('/contest/' + $scope.week + '/' + $scope.eventId + '/scrambles').success(function(response) {
            for (var i = 0; i < response.length; i++)
            {
                $scope.solves[i] = {};
                $scope.solves[i].result = '';
                $scope.solves[i].penalty = '';
                $scope.solves[i].scramble = response[i];
            }
        });
        $scope.showHome = 0;
        $scope.showManualEntry = 1;
        $scope.showTimer = 0;
        $scope.event = event.name;
    };

    $scope.timer = function(event) {
        $scope.showHome = 0;
        $scope.showManualEntry = 0;
        $scope.showTimer = 1;
        $scope.event = event.name;
    };

    $scope.cancel = function() {
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
        $scope.showTimer = 0;
    };

    $scope.submit = function() {
        $http.post('/contest/' + $scope.week + '/' + $scope.eventID, $scope.solves).success(function (response) {
            var eventsIndex = -1;
            for (var i = 0; i < $scope.events.length; i++)
                if ($scope.events[i].name == $scope.event)
                    eventsIndex = i;
            $scope.events[eventsIndex].result = response;
        });
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
        $scope.showTimer = 0;
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

