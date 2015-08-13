(function() {

    'use strict';

    function HomeController($scope, $http) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/auth/status').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

    }

    angular.module('nuCubingApp', []);

    angular.module('nuCubingApp').controller('HomeController', HomeController);

})();

// facebook
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

