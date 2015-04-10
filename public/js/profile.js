var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('profileController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

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

