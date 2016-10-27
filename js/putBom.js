var app = angular.module('putBom', []);

app.service('data', function() {
	this.items    = [{
		number: 1, // temp
        name: 'Contemporary Floral Print Dress',
        url: 'http://forever21.com/blah/?blah=1#hello',
        quantity: 1,
        size: '',
        color: '',
        instructions: '',
        proceedOrder: true,
        listPrice: '22.90',
        imageUrl: './test-img.jpg',
        sizes: ['S', 'M', 'L'],
        colors: ['Cream', 'Green'],
        details: '',
        shouldShowDeleteBtn: false,
        useCircleForSizes: true
	}];

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
			$scope.scrapeF21($scope.urlField.text);
		}
	}

	$scope.createEmptyItem = function() {
		this.newItem = {
	        number: data.items.length + 1,
	        name: '',
	        url: '',
	        quantity: '1',
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
	$scope.scrapeF21 = function(url) {
		var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
	    console.log('scrapeF21 GET: ' + urlString);
	    $http({
	        method : 'GET',
	        url    : urlString
	    }).then(function (result) {
	    	return result.data;
	    }).then(function (resultData) {
	    	// For multiple cart items. Remove this.
	    	data.items.shift();
	    	/********/

	    	$scope.createEmptyItem();

	    	var result = resultData.results[0];
	    	data.items[0].name = result.item_name;
	    	data.items[0].url = url;
	    	data.items[0].details = result.details;

	    	// Price
	    	if(result.price_sale) {
	            data.items[0].listPrice = result.price_sale;
	        } else if(result.price_normal) {
	            data.items[0].listPrice = result.price_normal;
	        }
	        
	        console.log(result.price_sale);
	        console.log(result.price_normal);

	        // Image
	        if(result.image1) {
	            data.items[0].imageUrl  = result.image1;
	        } else if(result.image2) {
	            data.items[0].imageUrl  = result.image2;
	        } else if(result.image3) {
	            data.items[0].imageUrl  = result.image3;
	        }

	        // Sizes
	        if(!Array.isArray(result.sizes_available)) {
	            data.items[0].sizes  = [result.sizes_available];
	        } else {
	            data.items[0].sizes = result.sizes_available;    
	        }
	        
	        // Colors
	        if(!Array.isArray(result["colors_available/_alt"])) {
	            data.items[0].colors = [result["colors_available/_alt"]];
	        } else {
	            data.items[0].colors = result["colors_available/_alt"];    
	        }

	        if (isNaN(data.items[0].sizes[0])) {
	        	data.items[0].useCircleForSizes = data.items[0].sizes[0].length <= 2;
	        } else {
	        	data.items[0].useCircleForSizes = data.items[0].sizes[0].toString().length <= 2;
	        }
	        console.log(data.items[0].useCircleForSizes);
	        

			$scope.urlField.text = '';
	    });
	};

	$scope.removeItem = function(itemNumber) {
		index = data.items.length - itemNumber;
		data.items.splice(index, 1);
	}

	$scope.selectColorForItem = function(color, item) {
		item.color = color;
	}

	$scope.selectSizeForItem = function(size, item) {
		item.size = size;
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