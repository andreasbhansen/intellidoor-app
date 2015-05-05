// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'ionic.service.core', 'ionic.service.push', 'ionic.utils'])

	.config(['$ionicAppProvider', function ($ionicAppProvider)
	{
		// Identify app
		$ionicAppProvider.identify({
			// Your App ID
			app_id: 'ab72c49a',
			// The public API key services will use for this app
			api_key: 'a941b430b108e11d44524bfbe26a12df685f08800f759789',
			// Your GCM sender ID/project number (Uncomment if supporting Android)
			gcm_id: '655834120908'
		});

	}])

	.run(function ($ionicPlatform, $rootScope, $ionicPush, $cordovaPush)
	{
		$ionicPlatform.ready(function ()
		{
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
			if (window.cordova && window.cordova.plugins.Keyboard)
			{
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			}
			if (window.StatusBar)
			{
				StatusBar.styleDefault();
			}
		});
	})

	.config(function ($stateProvider, $urlRouterProvider)
	{

		// Ionic uses AngularUI Router which uses the concept of states
		// Learn more here: https://github.com/angular-ui/ui-router
		// Set up the various states which the app can be in.
		// Each state's controller can be found in controllers.js
		$stateProvider
			.state('sign-in', {
				url: "/sign-in",
				templateUrl: "templates/login.html",
				controller: 'LoginCtrl'
			})
			.state('home', {
				url: "/home",
				templateUrl: "templates/home.html",
				controller: 'AppCtrl'
			})
			.state('list', {
				url: "/list",
				templateUrl: "templates/list.html",
				controller: 'SearchAndListCtrl'
			})
			.state('door', {
				url: '/door/:_id',
				templateUrl: 'templates/door.html',
				controller: 'DoorCtrl',
				params: {obj: null}
			});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/sign-in');

	});

