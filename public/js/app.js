var app = angular.module('nuCubingApp', []);

app.controller('nuCubingController', function($scope, $http) {
    $scope.authStatus;
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
        pyra:'Not Completed',
        skewb:'Not Completed'
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

