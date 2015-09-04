"use strict";

angular
	.module('app',
		['ngResource',
		 'angular-jwt',
		 'angular-storage',
		 'ui.router',
		 'ngAnimate'
		])

.config(['$interpolateProvider', '$locationProvider', '$urlRouterProvider', '$resourceProvider', '$httpProvider', '$stateProvider', 'jwtInterceptorProvider',
            function($interpolateProvider, $locationProvider, $urlRouterProvider, $resourceProvider, $httpProvider, $stateProvider, jwtInterceptorProvider){
	$resourceProvider.defaults.stripTrailingSlashes = false;

	$interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');

	$httpProvider.defaults.xsrfCookieName = 'csrftoken';
	$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

	jwtInterceptorProvider.tokenGetter = ['store', function(store){
		return store.get('jwt');
	}];
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
		.state('addReminder', {
			url: "/reminders/add",
			controller: 'compose',
			templateUrl: "/static/partials/compose.html"
		})
		.state('editReminder', {
			url: "/reminders/:reminderId/edit",
			controller: 'compose',
			templateUrl: "/static/partials/compose.html"
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
    })
    .state('forgotPassword', {
			url: '/password/forgot',
			controller: 'password',
			templateUrl: '/static/partials/forgotpass.html'
		})
		.state('resetPassword', {
			url: '/password/reset/confirm/:uid/:token',
			controller: 'password',
			templateUrl: '/static/partials/resetpass.html'
		})
    .state('settings', {
      url: '/settings',
      controller: 'settings',
      templateUrl: '/static/partials/settings.html'
  });

}])

.run(['AuthService', '$rootScope', '$state', '$location',
		function(AuthService, $rootScope, $state, $location){

	// Fill AuthService's authentication with user info if authed
	AuthService.fillAuthData();

	// URLs that can only be accessed by authenticated users
	var PROTECTED_URLS = new Array('/reminders', '/settings', '/logout')

	function inArray(value, array){
		// Function takes a value and an array
		// -- Returns true if value is in array
		var exists = false;
		for(var i=0; i<array.length; i++){
			if (value === array[i]){
				return true;
			}
		}
		return false;
	}

	$rootScope.$on("$stateChangeStart", function(event, next, current) {
		if(!AuthService.authentication.isAuthenticated){
			// If user not authenticated, and URL is a protected,
			// URL redirect the user to the login page.
			if(inArray(next.url, PROTECTED_URLS)){
				$location.path('/login');
			}
		}
	});
}])
.factory('Reminder', ['$resource', function($resource) {
	return $resource('/api/reminders/:id/', null,
		{
			'update': {method: 'PUT'}
		}
	);
}])
.service('ReminderService', ['$resource', 'Reminder', function($resource, Reminder){
	var vm = this;
  vm.reminders = [];
  _setReminders();
  vm.setReminders = _setReminders;

	function _setReminders(){
      vm.reminders = Reminder.query();
	}

	vm.addReminder = function (newReminder){
		return Reminder.save(newReminder, function(res){
			vm.reminders.push(res);
			toastr.success('Successfully created reminder!');
		});
	};
	vm.updateReminder = function(updateReminder){
		return Reminder.update({id:updateReminder.id}, updateReminder, function(){
			angular.extend(_.find(vm.reminders, {'id': updateReminder.id}), updateReminder);
			toastr.success('Successfully saved reminder!');
		});
	};
	vm.deleteReminder = function(deleteReminder){
		Reminder.delete(deleteReminder, function(){
			_.remove(vm.reminders, deleteReminder);
		});
	};
	vm.getReminder = function(reminderId){
		return Reminder.get({id: reminderId});
	};
	vm.clear = function(){
		vm.reminders = [];
	};
	vm.init = function(){
		vm.setReminders();
	}
	return vm;
}]);

