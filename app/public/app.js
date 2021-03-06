(function() {

  'use strict';

  function Config($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl:'/dist/components/home/home.html'
      })
      .when('/profile', {
        templateUrl:'/dist/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/users', {
        templateUrl:'/dist/components/users/users.html',
        controller:'UsersController'
      })
      .when('/users/:facebook_id', {
        templateUrl:'/dist/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/contest', {
        templateUrl:'/dist/components/contest/contest.html',
        controller:'ContestController'
      })
      .when('/contest/:event/entry', {
        templateUrl:'/dist/components/contestEntry/contestEntry.html',
        controller:'ContestEntryController'
      })
      .when('/contest/:event/timer', {
        templateUrl:'/dist/components/contestTimer/contestTimer.html',
        controller:'ContestTimerController'
      })
      .when('/contest/333fm', {
        templateUrl:'/dist/components/contestFmc/contestFmc.html',
        controller:'ContestFmcController'
      })
      .when('/contest/333mbf', {
        templateUrl:'/dist/components/contestMbld/contestMbld.html',
        controller:'ContestMbldController'
      })
      .when('/results', {
        templateUrl:'/dist/components/results/results.html',
        controller:'ResultsController'
      })
      .when('/links', {
        templateUrl:'/dist/components/links/links.html'
      })
      .when('/admin', {
        templateUrl:'/dist/components/admin/admin.html',
        controller:'AdminController'
      })
      .otherwise({
        redirectTo:'/'
      });
  }

  function Run($rootScope, $resource, $location) {

    var User = $resource('/user');
    $rootScope.user = User.get();

    $rootScope.$on('$routeChangeStart', function (event, next) {
      if ((next.$$route.originalPath === '/profile') || (next.$$route.originalPath.substr(0, 8) === '/contest')) {
        $rootScope.user.$promise
          .then(function() {
            if (!$rootScope.user.facebook_id) {
              $location.path('/');
            }
          });
      }
      if (next.$$route.originalPath === '/admin') {
        $rootScope.user.$promise
          .then(function() {
            if ($rootScope.user.email != 'timothywong8@gmail.com') {
              $location.path('/');
            }
          });
      }
    });

  }

  angular.module('nuCubingApp', ['ui.bootstrap', 'ngRoute', 'ngResource', 'angularFileUpload']);

  angular.module('nuCubingApp').config(['$routeProvider', Config]).run(['$rootScope','$resource', '$location', Run]);

})();