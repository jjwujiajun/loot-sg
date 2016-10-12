var app = angular.module('putBom', []);

app.service('data', function() {
	this.items    = [];

	this.userInfo = {
		firstName: '',
		lastName: '',
		address: '',
		postalCode: '',
		contact: '+65 ',
		email: '',
		keepMeUpdated: true
	};

	this.orderInfo = {
        coupon: '',
		deliveryOption: 'none',
		deliveryCost: 0,
	};

	this.orderId = '';
});

app.controller('putBomController', ['data', '$scope', '$http', function(data, $scope, $http) {
    $scope.urlField = {'text': ''};
	$scope.data = data;

	$scope.scrapeURL = function () {
		// Check if input is valid url
		if (isValidURL($scope.urlField.text)) { 

			// try scrape from import.io
			$scope.createEmptyItem();
			$scope.scrapeF21($scope.urlField.text, data.items[0]);
		}
	}

	$scope.createEmptyItem = function() {
		this.newItem = {
	        number: data.items.length + 1,
	        name: '',
	        url: '',
	        quantity: '',
	        size: '',
	        color: '',
	        instructions: '',
	        proceedOrder: true,
	        listPrice: '',
	        imageUrl: '',
	        sizes: [],
	        colors: [],
	        details: ''
	    };
	    data.items.unshift(this.newItem);
	    console.log(this.newItem.number);
	};

	// Parameters: 
	// - url to be passed
	// - item whos data is to be updated by url
	$scope.scrapeF21 = function(url, item) {
		var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
	    console.log('scrapeF21 GET: ' + urlString);
	    $http({
	        method : 'GET',
	        url    : urlString
	    }).then(function (result) {
	    	return result.data;
	    }).then(function (data) {
	    	var result = data.results[0];
	    	item.name = result.item_name;

	    	// Price
	    	if(result.price_sale) {
	            item.listPrice = result.price_sale;
	        } else if(result.price_normal) {
	            item.listPrice = result.price_normal;
	        }
	        
	        console.log(result.price_sale);
	        console.log(result.price_normal);

	        // Image
	        if(result.image1) {
	            item.imageUrl  = result.image1;
	        } else if(result.image2) {
	            item.imageUrl  = result.image2;
	        } else if(result.image3) {
	            item.imageUrl  = result.image3;
	        }
	        
	        // Sizes
	        item.details    = result.details;
	        if(!Array.isArray(result.sizes_available)) {
	            item.sizes  = [result.sizes_available];
	        } else {
	            item.sizes      = result.sizes_available;    
	        }
	        
	        // Colors
	        if(!Array.isArray(result["colors_available/_alt"])) {
	            item.colors = [result["colors_available/_alt"]];
	        } else {
	            item.colors     = result["colors_available/_alt"];    
	        }

	        // Add to cart
	        $scope.cartCount++;
			$scope.urlField.text = '';
	    });
	};

	$scope.removeItem = function(itemNumber) {
		index = items.length - itemNumber;
		data.items.splice(index, 1);
	}

}]);

function isValidURL(str) {
	if (str.indexOf('amazon.com') != -1) {
		return true;
	} else if (str.indexOf('forever21.com') != -1) {
		return true;
	};
	return false;
}