var mod = angular.module('loot-sg', ['ngRoute']);


mod.service('data', function() {
	// this.items    = [];

	// {
	// 					number: 1,
 //                        name: '',
 //                        url: '',
 //                        quantity: '',
 //                        size: '',
 //                        color: '',
 //                        instructions: '',
	// 					proceedOrder: true,
 //                        listPrice: '',
 //                        imageUrl: '',
 //                        sizes: [],
 //                        colors: [],
 //                        details: ''
	// 				}


	this.items    = [
						{name: 'Loot.sg', number: 1, url: 'http://www.loot.sg', quantity: 3, sizes: ['S','M','XL'], size: 'M', colors: ['Black','Blue'], color: 'Black', listPrice: '0', instructions: 'FRAGILE!', proceedOrder: true, imageUrl: 'test-img.jpg'},
						{name: 'Lootcommerce.com', number: 2, url: 'http://spree.loot.sg', quantity: 2, sizes: ['S','M','XL'], size: 'XL', listPrice: '1990', colors: ['Black','Blue'], color: 'Rainbow', instructions: 'NOT FRAGILE!', proceedOrder: true,  imageUrl: 'test-img.jpg'}
					];
/* DEBUG
	this.userInfo = {
		firstName: '',
		lastName: '',
		addressLine1: '',
		addressLine2: '',
		postalCode: '',
		contact: '+65 ',
		email: '',
		keepMeUpdated: true
	};
*/

	this.userInfo = {
		firstName: 'Will',
		lastName: 'Ho',
		addressLine1: '20 Heng Mui Keng Terrace',
		addressLine2: 'D618',
		postalCode: '119618',
		contact: '+65 1234 1234',
		email: 'will@loot.sg',
		keepMeUpdated: true
	};
});


mod.service('utility', ['$http', 'data', function($http, data) {
	var createEmptyItem = function() {
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

    this.scrapeF21 = function(url) {
		var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
	    console.log('scrapeF21 GET: ' + urlString);
	    return $http({
	        method : 'GET',
	        url    : urlString
	    }).then(function (result) {
	    	return result.data;
	    }).then(function (resultData) {
	    	// For multiple cart items. Remove this.
	    	//data.items.shift();
	    	/********/

	    	createEmptyItem();

	    	var result = resultData.results[0];
	    	data.items[0].name = result.item_name;
	    	data.items[0].url = url;
	    	data.items[0].details = result.details;

	    	data.items[0].quantity = 1;

	    	// Price
	    	if(result.price_sale) {
	            data.items[0].listPrice = result.price_sale * 100;
	        } else if(result.price_normal) {
	            data.items[0].listPrice = result.price_normal * 100;
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

	        // Select first size and color
	        data.items[0].size = data.items[0].sizes[0]
	        data.items[0].color = data.items[0].colors[0]
	    });
	};
    
    var replaceWithDash = function(obj){
        angular.forEach(obj, function(value, field){
            if(value == '') {
                obj[field] = '-';
            } 
        });
    };

	this.getPlurality = function(number) {
		if(number != 1) {
			return 's';
		}
		return '';
	};
}]);

function routeConfig($routeProvider) {
	$routeProvider.when('/', {
		controller: 'homeController',
		controllerAs: 'home',
		templateUrl: 'home.html'
	}).when('/login', {
		controller: 'loginController',
		controllerAs: 'login',
		templateUrl: 'login.html'
	}).when('/delivery', {
		controller: 'deliveryController',
		controllerAs: 'delivery',
		templateUrl: 'delivery.html'
	}).when('/confirm', {
		controller: 'confirmController',
		controllerAs: 'confirm',
		templateUrl: 'confirm.html'
	}).when('/modify', {
		controller: 'modifyController',
		controllerAs: 'modify',
		templateUrl: 'modify.html'
	}).when('/done', {
		controller: 'doneController',
		controllerAs: 'done',
		templateUrl: 'done.html'
	})
}
mod.config(routeConfig);

	

mod.controller('homeController', ['data', 'utility','$location', function(data, utility, $location){
	var vm  = this;
	vm.urlField = {'text': '', 'placeholder': 'Just copy and paste your item URL here'};
	vm.data = data;
	var firstScrape = true;

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return true;
		} else if (str.indexOf('forever21.com') != -1) {
			return true;
		};
		return false;
	}

	// jQuery/jqLite DOM Manipulation
	angular.element(document).ready(function () {
		var pbInput = document.querySelector('input');
		angular.element(pbInput).focus();

		var howItWorksMenu = document.querySelector('#how-it-works-menu');
		angular.element(howItWorksMenu).click(function () {
			var howItWorksAnchor = angular.element('#how-it-works');
			angular.element("body").animate({ scrollTop: howItWorksAnchor.offset().top - 80});
		});		

		var whyLootMenu = document.querySelector('#why-loot-menu');
		angular.element(whyLootMenu).click(function () {
			var whyLootAnchor = angular.element('#why-loot');
			angular.element("body").animate({ scrollTop: whyLootAnchor.offset().top - 80});
		});	

		var backToTopButton = document.querySelector('#backToTop');
		angular.element(backToTopButton).click(function () {
			angular.element("body").animate({ scrollTop: '0'});
			angular.element(pbInput).focus();
		});
	});

	vm.scrapeURL = function () {
		// Check if input is valid url
		if (isValidURL(vm.urlField.text)) { 

			// try scrape from import.io
			utility.scrapeF21(vm.urlField.text).then(function(){
				vm.urlField.text = '';
				if(firstScrape){
					vm.urlField.placeholder = 'Paste your next item URL here'
					firstScrape = false
				}
			});
		}
	};
	

	vm.removeItem = function(itemNumber) {
		index = vm.data.items.length - itemNumber;
		vm.data.items.splice(index, 1);
	}

	vm.selectColorForItem = function(color, item) {
		item.color = color;
	}

	vm.selectSizeForItem = function(size, item) {
		item.size = size;
	}
	
	vm.checkOut = function(){
		$location.path('login');
	}

}]);

mod.controller('loginController', ['data','$location', function(data, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

	vm.back = function(){
		$location.path('');
	}

	vm.next = function(){
		$location.path('delivery');
	}

}]);

mod.controller('deliveryController', ['data','$location', function(data, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

	vm.back = function(){
		$location.path('login');
	}

	vm.next = function(){
		$location.path('confirm');
	}

}]);

mod.controller('confirmController', ['data', 'utility', '$location', '$window', '$http', function(data, utility, $location, $window, $http){
	var vm = this;
	vm.items        = data.items;
	vm.itemCount    = data.items.length;
	vm.getPlurality = utility.getPlurality;
	vm.total		= 0;

	for (var i = 0; i < vm.items.length; i++) {
		vm.total += vm.items[i].listPrice * vm.items[i].quantity;
	}


	// Configure Checkout.js
	var handler = $window.StripeCheckout.configure({
		key: 'pk_test_rlSGgE3saZE9iDvzNtKlc1Tb',
		image: 'https://s3.amazonaws.com/stripe-uploads/acct_17kbl6LmG6293IlZmerchant-icon-1456937740742-Loot_logo_128px.png',
		locale: 'auto',
		email: data.userInfo.email,
		name: 'Loot',
		description: 'Order Info',
		zipCode: false,
		currency: 'USD',
		token: function(token) {
			var request = {
				amount: vm.total,
				token: token.id
			}

			// Send POST request to server
			$http({
				method  : 'POST',
				url     : './backend/stripe.php',
	            data    : request,
	            headers : {'Content-Type': 'application/json'}
	        }).success(function(data){
	            // console.log(data);
	            if (data.success) { //success comes from the return json object
	            	console.log('charge-success');
	            	$location.path('done');
	            } else {
	            	console.log('charge-failure');
	            	console.log(data.error);
	            }
	        });
		
		}
	});

	vm.back = function(){
		$location.path('delivery');
	}

	vm.confirmAndPay = function(){
		handler.open({
			amount: vm.total
		});

		// TODO: Close checkout page on navigation
	}

	vm.modify = function(){
		$location.path('modify');
	}

}]);

mod.controller('modifyController', ['data','utility','$location', function(data, utility, $location){
	var vm = this;
	vm.urlField = {'text': '', 'placeholder': 'Paste your next item URL here'};
	vm.data = data;

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return true;
		} else if (str.indexOf('forever21.com') != -1) {
			return true;
		};
		return false;
	}

	vm.scrapeURL = function () {
		// Check if input is valid url
		if (isValidURL(vm.urlField.text)) { 

			// try scrape from import.io
			utility.scrapeF21(vm.urlField.text).then(function(){
				vm.urlField.text = '';	
			});
			
		}
	};
	

	vm.removeItem = function(itemNumber) {
		index = vm.data.items.length - itemNumber;
		vm.data.items.splice(index, 1);
	}

	vm.selectColorForItem = function(color, item) {
		item.color = color;
	}

	vm.selectSizeForItem = function(size, item) {
		item.size = size;
	}

	vm.save = function(){
		$location.path('confirm');
	}

}]);

mod.controller('doneController', ['$window', function($window){
	var vm = this;
	
	vm.restart = function(){
		$window.location.href = "./";
	}

}]);

