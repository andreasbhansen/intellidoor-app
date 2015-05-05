angular.module('starter.controllers', [])

	.controller('AppCtrl', function ($scope, $rootScope, $ionicPush, $ionicUser, localstorage, $http, $ionicLoading, $timeout)
	{
		var user = localstorage.getObject('user');
		var username = localstorage.get('username');

		$http({
			method: 'GET',
			url: 'http://10.0.0.106:3000/api/get-doors-user-can-access/' + username
		}).success(function (data)
		{
			localstorage.setObject('doors', data.available_doors);
			$scope.listData = data.available_doors;
		});

		$scope.signOut = function ()
		{
			localstorage.setObject('user', {});
			$http({
				method: 'GET',
				url: 'http://10.0.0.106:3000/api/logout',
				headers: {
					'X-Auth-Token': user.data.authToken,
					'userId': user.data.userId
				}
			}).success(function (data, status)
			{
				console.log(data);
				$state.go('sign-in');
			})
		};

		$scope.BLE = {
			uuid: ""
		};

		$scope.saveUUID = function ()
		{
			$ionicLoading.show({
				template: 'Updating UUID...<br/><ion-spinner></ion-spinner>'
			});

			$http({
				method: 'POST',
				url: 'http://10.0.0.106:3000/api/update-UUID-for-user',
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				data: {
					UUID: $scope.BLE.uuid,
					userEmail: username
				}
			}).success(function (data)
			{
				console.log(data);
				$timeout(function ()
				{
					$ionicLoading.hide();
				}, 2500);
			}).error(function (err)
			{
				console.log(err);
				$timeout(function ()
				{
					$ionicLoading.hide();
				}, 2500);
			});

		};

		$scope.isDeviceTokenSet = !!localstorage.get('deviceToken');
		//alert('isDeviceTokenSet: ' + $scope.isDeviceTokenSet);


		/*
		 Related to push
		 */
		$rootScope.$on('$cordovaPush:tokenReceived', function (event, data)
		{
			alert('Got token', data.token, data.platform);
		});
		//Basic registration
		$scope.pushRegister = function ()
		{
			$ionicLoading.show({
				template: 'Registering for Push...<br/><ion-spinner></ion-spinner>'
			});

			$ionicPush.register({
				canShowAlert: true,
				onNotification: function (notification)
				{
					// Called for each notification for custom handling
					$scope.lastNotification = JSON.stringify(notification);
				}
			}).then(function (deviceToken)
			{
				localstorage.set('deviceToken', deviceToken);
				$scope.token = deviceToken;
				$scope.isDeviceTokenSet = true;
				$ionicLoading.hide();
			});
		};

		$scope.identifyUser = function ()
		{
			$ionicLoading.show({
				template: 'Identifying...<br/><ion-spinner></ion-spinner>'
			});

			var user = $ionicUser.get();
			if (!user.user_id)
			{
				// Set your user_id here, or generate a random one
				user.user_id = $ionicUser.generateGUID()
			}

			angular.extend(user, {
				name: 'Test User',
				message: 'I come from planet Ion'
			});

			$ionicUser.identify(user);
			$ionicLoading.hide();
		}
	})
	.controller('SearchAndListCtrl', function ($scope, $http)
	{
		console.log($scope.userEmail);
		$scope.searchForDoors = function (user)
		{
			$http
				.get('http://10.0.0.106:3000/api/get-doors-belonging-to-user/' + user.email)
				.success(function (data, status, headers, config)
				{
					$scope.listData = data.available_doors;
					console.log($scope.listData);
				});
		};
	})
	.controller('LoginCtrl', function ($scope, $http, localstorage, $state)
	{
		if (angular.equals({}, localstorage.getObject('user')))
		{
			$scope.signIn = function (user)
			{
				$http({
					method: 'POST',
					url: 'http://10.0.0.106:3000/api/login/',
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					transformRequest: function (obj)
					{
						var str = [];
						for (var p in obj)
						{
							str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
						}
						return str.join("&");
					},
					data: {password: user.password, user: user.username}
				}).success(function (data)
				{
					localstorage.set('username', user.username);
					localstorage.setObject('user', data);
					$state.go('home');
				});
			};
		}
		else
		{
			$state.go('home');
		}
	})
	.controller('DoorCtrl', function ($scope, $http, $stateParams, localstorage, $ionicLoading, $timeout, $ionicHistory, $mdToast)
	{
		var doorId = $stateParams._id;
		var doors = localstorage.getObject('doors');
		var door = doors[_.findIndex(doors, {'_id': doorId})];

		$scope.availableIntegrations = [
			{
				name: "TV",
				selected: false
			},
			{
				name: "Livingroom Light",
				selected: false
			},
			{
				name: "Coffee machine",
				selected: false
			},
			{
				name: "Bathroom Light",
				selected: false
			}
		];

		$scope.door = door;

		$scope.integrationsInUse = $scope.door.user_info_for_door.integrations.length;

		removeTakenIntegrationsFromAvailableIntegrationsList();


		$scope.goBack = function ()
		{
			console.log('Goaback');
			$ionicHistory.goBack();
		};

		$scope.toastPosition = {
			bottom: false,
			top: true,
			left: false,
			right: true
		};
		$scope.getToastPosition = function ()
		{
			return Object.keys($scope.toastPosition)
				.filter(function (pos)
				{
					return $scope.toastPosition[pos];
				})
				.join(' ');
		};

		$scope.alterIntegration = function (integration)
		{
			$ionicLoading.show({
				template: 'Saving...<br/><ion-spinner></ion-spinner>'
			});

			console.log('Integration', integration);

			$http({
				method: 'POST',
				url: 'http://10.0.0.106:3000/api/update-integration-for-user-at-door',
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				data: {
					integration: integration,
					door: $scope.door
				}
			}).success(function (data)
			{
				$scope.door = data.door;
				removeTakenIntegrationsFromAvailableIntegrationsList();
				$timeout(function ()
				{
					$ionicLoading.hide();
				}, 2500);
			}).error(function (err)
			{
				console.log(err);
				$timeout(function ()
				{
					$ionicLoading.hide();
				}, 2500);
			});

		};


		$scope.saveIntegration = function (i, integration)
		{

			$ionicLoading.show({
				template: 'Saving...<br/><ion-spinner></ion-spinner>'
			});

			$http({
				method: 'POST',
				url: 'http://10.0.0.106:3000/api/update-integration-state-for-user-at-door',
				headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				data: $scope.door
			}).success(function (data)
			{
				console.log(data);

				$timeout(function ()
				{
					$ionicLoading.hide();

					var toast = $mdToast.simple()
						.content('Integration saved!')
						.action('OK')
						.highlightAction(false)
						.position($scope.getToastPosition());
					$mdToast.show(toast).then(function ()
					{

					});
				}, 2500);

			}).error(function (err)
			{
				console.log(err);
			});
		};

		$scope.refresh = function ()
		{
			$ionicLoading.show({
				template: 'Refreshing...<br/><ion-spinner></ion-spinner>'
			});
			// To get a good screenshot of the refreshing
			$timeout(function ()
			{
				getUpdatedDoorInformation(function ()
				{
					$ionicLoading.hide();

					var toast = $mdToast.simple()
						.content('Refreshed list!')
						.action('OK')
						.highlightAction(false)
						.position($scope.getToastPosition());
					$mdToast.show(toast).then(function ()
					{

					});

				});
			}, 2500);
		};


		function getUpdatedDoorInformation(callback)
		{
			var username = localstorage.get('username');

			$http({
				method: 'GET',
				url: 'http://10.0.0.106:3000/api/get-doors-user-can-access/' + username
			}).success(function (data)
			{
				console.log(data);
				for (var i = 0; i < data.available_doors.length; i++)
				{
					var door = data.available_doors[i];

					if (door._id === doorId)
					{
						$scope.door = door;
					}
				}
				callback()

			});
		}

		function removeTakenIntegrationsFromAvailableIntegrationsList()
		{
			for (var i = 0; i < $scope.door.user_info_for_door.integrations.length; i++)
			{
				var integrationTaken = $scope.door.user_info_for_door.integrations[i];

				for (var j = 0; j < $scope.availableIntegrations.length; j++)
				{
					var integrationAvailable = $scope.availableIntegrations[j];

					console.log(integrationAvailable, integrationTaken.name);

					console.log(angular.equals(integrationAvailable.name, integrationTaken.name));
					if (angular.equals(integrationAvailable.name, integrationTaken.name))
					{
						$scope.availableIntegrations.splice(j, 1);
					}
				}
			}
		}
	});

