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

