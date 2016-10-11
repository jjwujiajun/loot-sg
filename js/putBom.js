var app = angular.module('putBom', []);

app.controller('putBomController', function($scope) {
    $scope.urlField = {
    	'text': ''
    };
	$scope.cartCount = 0;

	$scope.scrapeURL = function () {
		// Check if input is valid url
		if (isValidURL($scope.urlField.text)) { 
			// try scrape from import.io
			if (true) { //scrapped) {
				$scope.cartCount++;
				addItemToHoverCart();
			};
		}
	}

	$scope.minusCartCount = function () {
		if ($scope.cartCount > 0){
			$scope.cartCount--;
		}
	}
});

function addItemToHoverCart() {

}


function isValidURL(str) {
	console.log('test');
	if (str.indexOf('amazon.com') != -1) {
		console.log('true1');
		return true;
	} else if (str.indexOf('forever21.com') != -1) {
		console.log('true2');
		return true;
	};
	console.log('false');
	return false;
}