var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('nuCubingController', function($scope, $http, $modal) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

});

app.controller('profileController', function($scope, $http) {

    $scope.user = {};

    $http.get('/userInfo').success(function(response) {
        $scope.user.firstName = response.firstName;
        $scope.user.lastName = response.lastName;
        $scope.user.email = response.email;
        $scope.user.id = response.facebook_id;
    });

    $scope.personalResults = [];
    $scope.personalResults[0] = {type:'Unofficial Personal Records'};
    $scope.personalResults[1] = {type:'Official Personal Records'};
    $scope.personalResults[2] = {type:'Contest Personal Records'};
    $scope.personalResults[3] = {type:'Current Week Results'};

    for (var i = 0; i < 3; i++)
        $scope.personalResults[i].results = [];

    $scope.personalResults[0].results[0] = {event:"Rubik's Cube", single:'5.79', average:'8.50'};
    $scope.personalResults[0].results[1] = {event:"4x4 Cube", single:'27.34', average:'32.51'};
    $scope.personalResults[0].results[2] = {event:"5x5 Cube", single:'1:08.65', average:'1:15.03'};

    $scope.personalResults[1].results[0] = {event:"Rubik's Cube", single:'8.48', average:'10.40'};
    $scope.personalResults[1].results[1] = {event:"4x4 Cube", single:'33.92', average:'38.80'};
    $scope.personalResults[1].results[2] = {event:"5x5 Cube", single:'1:11.38', average:'1:23.47'};

});

app.controller('resultsController', function($scope, $http) {

    $scope.events = [];
    $scope.events[0] = {id:0, name:"Rubik's Cube"};
    $scope.events[1] = {id:1, name:"4x4 Cube"};
    $scope.events[2] = {id:2, name:"5x5 Cube"};
    $scope.events[3] = {id:3, name:"2x2 Cube"};
    $scope.events[4] = {id:4, name:"3x3 Blindfolded"};
    $scope.events[5] = {id:5, name:"3x3 One-Handed"};
    $scope.events[6] = {id:6, name:"Pyraminx"};

    for (var i = 0; i < 7; i++)
        $scope.events[i].results = {};

    $scope.events[0].results[0] = {name:'Tim Wong', result:'10.40'};
    $scope.events[1].results[0] = {name:'Tim Wong', result:'38.80'};
    $scope.events[2].results[0] = {name:'Tim Wong', result:'1:23.47'};
    $scope.events[3].results[0] = {name:'Tim Wong', result:'4.11'};
    $scope.events[4].results[0] = {name:'Tim Wong', result:'32.44'};
    $scope.events[5].results[0] = {name:'Tim Wong', result:'17.44'};
    $scope.events[6].results[0] = {name:'Tim Wong', result:'7.14'};

    $scope.events[0].results[1] = {name:'Edward Lin', result:'8.80'};
    $scope.events[1].results[1] = {name:'Edward Lin', result:'36.25'};
    $scope.events[2].results[1] = {name:'Edward Lin', result:'1:12.41'};
    $scope.events[3].results[1] = {name:'Edward Lin', result:'2.48'};
    $scope.events[5].results[1] = {name:'Edward Lin', result:'15.21'};
    $scope.events[6].results[1] = {name:'Edward Lin', result:'6.66'};

    $scope.selectedEvent = $scope.events[0];
    $scope.selectEvent = function(event) {
        $scope.selectedEvent = event;
    };

});

app.controller('contestController', function($scope, $http, $modal) {

    $scope.events = [];
    $scope.events[0] = {name:"Rubik's Cube", result:'Not Completed'};
    $scope.events[1] = {name:"4x4 Cube", result:'Not Completed'};
    $scope.events[2] = {name:"5x5 Cube", result:'Not Completed'};
    $scope.events[3] = {name:"2x2 Cube", result:'Not Completed'};
    $scope.events[4] = {name:"3x3 Blindfolded", result:'Not Completed'};
    $scope.events[5] = {name:"3x3 One-Handed", result:'Not Completed'};
    $scope.events[6] = {name:"Pyraminx", result:'Not Completed'};

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
        alert('Open timer for ' + event.name);
    };

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

    $scope.eventId = 'x3Cube';
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

    $http.get('/contest/' + week + '/' + $scope.eventId + '/scrambles').success(function(response) {
        for (var i = 0; i < 5; i++)
            $scope.solves[i].scramble = response[i];
    });

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

