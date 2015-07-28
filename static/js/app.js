"use strict";

var app = angular.module('app', ['ngResource','angular-jwt', 'angular-storage', 'ui.router', 'ui.bootstrap.datetimepicker']);

app.config(['$interpolateProvider', '$locationProvider', '$urlRouterProvider', '$resourceProvider', '$httpProvider', '$stateProvider', 'jwtInterceptorProvider',
            function($interpolateProvider, $locationProvider, $urlRouterProvider, $resourceProvider, $httpProvider, $stateProvider, jwtInterceptorProvider){
	$resourceProvider.defaults.stripTrailingSlashes = false;

	$interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

	jwtInterceptorProvider.tokenGetter = function(store){
		return store.get('jwt');	
	};
	$httpProvider.interceptors.push('jwtInterceptor');
	$locationProvider.html5Mode(true);
	$urlRouterProvider.otherwise('/');
	$stateProvider
        .state('home', {
            url: "/",
            templateUrl: "/static/partials/home.html"
        })
		.state('reminders', {
			url: "/reminders",
			controller: 'reminder',
			templateUrl: "/static/partials/reminders.html"
		})
		.state('register', {
			url: "/register",
			controller: 'registration',
			templateUrl: "/static/partials/register.html"
		})
        .state('login', {
            url: '/login',
            controller: 'login',
            templateUrl: "/static/partials/login.html"
        });
}]);

app.run(['AuthService', '$rootScope', '$state', '$location', 
		function(AuthService, $rootScope, $state, $location){

	// Fill AuthService's authentication with user info if authed
	AuthService.fillAuthData();

	$rootScope.$on("$stateChangeStart", function(event, next, current) {
		if(!AuthService.authentication().isAuthenticated){
			if(next.url == "/register"){
				// if going to register do not redirect to login	
			} else {
				// if not authenticated redirect to login
				$location.path('/login');
			}
		}
	});	
}]);

app.factory('Reminder', ['$resource', function($resource) {
	return $resource('/api/reminders/:id/', null,
		{
			'update': {method: 'PUT'}
		}			
	);
}]);
