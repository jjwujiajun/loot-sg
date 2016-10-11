var app = angular.module('putBom', []);

app.controller('putBomController', function($scope) {
	$scope.urlField = '';
	$scope.cartCount = 0;

	$scope.scrapeURL = function () {
		// Check if input is valid url
		if ($scope.urlField.length > 0) { 
			// try scrape from import.io
			if (true) { //scrapped) {
				$scope.cartCount++;;
			};
		}
	}
});