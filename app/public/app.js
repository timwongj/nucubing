(function() {

  'use strict';

  function Config($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl:'/public/components/home/home.html'
      })
      .when('/profile', {
        templateUrl:'/public/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/users', {
        templateUrl:'/public/components/users/users.html',
        controller:'UsersController'
      })
      .when('/users/:facebook_id', {
        templateUrl:'/public/components/profile/profile.html',
        controller:'ProfileController'
      })
      .when('/contest', {
        templateUrl:'/public/components/contest/contest.html',
        controller:'ContestController'
      })
      .when('/contest/:event/entry', {
        templateUrl:'/public/components/contestEntry/contestEntry.html',
        controller:'ContestEntryController'
      })
      .when('/contest/:event/timer', {
        templateUrl:'/public/components/contestTimer/contestTimer.html',
        controller:'ContestTimerController'
      })
      .when('/contest/333fm', {
        templateUrl:'/public/components/contestFmc/contestFmc.html',
        controller:'ContestFmcController'
      })
      .when('/contest/333mbf', {
        templateUrl:'/public/components/contestMbld/contestMbld.html',
        controller:'ContestMbldController'
      })
      .when('/results', {
        templateUrl:'/public/components/results/results.html',
        controller:'ResultsController'
      })
      .when('/links', {
        templateUrl:'/public/components/links/links.html'
      })
      .when('/admin', {
        templateUrl:'/public/components/admin/admin.html',
        controller:'AdminController'
      })
      .otherwise({
        redirectTo:'/'
      });
  }

  function Run($rootScope, $resource) {

    var User = $resource('/user');
    $rootScope.user = User.get();

  }

  angular.module('nuCubingApp', ['ui.bootstrap', 'ngRoute', 'ngResource', 'angularFileUpload']);

  angular.module('nuCubingApp').config(['$routeProvider', Config]).run(['$rootScope','$resource', Run]);

})();