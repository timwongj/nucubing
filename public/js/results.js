var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('resultsController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

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

