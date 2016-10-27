var mod = angular.module('loot-sg', ['ngRoute']);


mod.service('data', function() {
	this.items    = [{
						number: 1,
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
					}];

/* DEBUG
	this.items    = [
						{name: 'Loot.sg', number: 1, url: 'http://www.loot.sg', quantity: 3, size: 'M', color: 'Black', listPrice: '0', instructions: 'FRAGILE!', proceedOrder: true},
						{name: 'Lootcommerce.com', number: 2, url: 'http://spree.loot.sg', quantity: 2, size: 'XL', listPrice: '10', color: 'Rainbow', instructions: 'NOT FRAGILE!', proceedOrder: true}
					];
*/
	this.userInfo = {
		firstName: '',
		lastName: '',
		address: '',
		postalCode: '',
		contact: '+65 ',
		email: '',
		keepMeUpdated: true
	};

/* DEBUG
	this.userInfo = {
		firstName: 'Will',
		lastName: 'Ho',
		address: '20 Heng Mui Keng Terrace',
		postalCode: '119618',
		contact: '+65 1234 1234',
		email: 'will@loot.sg',
		keepMeUpdated: true
	};
*/
	this.orderInfo = {
        coupon: '',
		deliveryOption: 'none',
		deliveryCost: 0,
	};

	this.orderId = '';
});


mod.service('utility', ['$http', function($http) {    
    this.scrapeF21 = function(url, item) {
        var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
        console.log('scrapeF21 GET: ' + urlString);
        $http({
            method : 'GET',
            url    : urlString
        }).success(function(data) {
            var result         = data.results[0];
            item.name          = result.item_name;
            if(result.price_sale) {
                item.listPrice = result.price_sale;
            } else if(result.price_normal) {
                item.listPrice = result.price_normal;
            }
            
            console.log(result.price_sale);
            console.log(result.price_normal);
            if(result.image1) {
                item.imageUrl  = result.image1;
            } else if(result.image2) {
                item.imageUrl  = result.image2;
            } else if(result.image3) {
                item.imageUrl  = result.image3;
            }
            
            item.details    = result.details;
            if(!Array.isArray(result.sizes_available)) {
                item.sizes  = [result.sizes_available];
            } else {
                item.sizes      = result.sizes_available;    
            }
            
            if(!Array.isArray(result["colors_available/_alt"])) {
                item.colors = [result["colors_available/_alt"]];
            } else {
                item.colors     = result["colors_available/_alt"];    
            }
            
        });
    };

	this.sendOrderEmail = function(data) {
		//console.log(data.userInfo);
        
        // Replace blank fields with dashes
        replaceWithDash(data.userInfo);
        replaceWithDash(data.orderInfo);
        for(i = 0; i < data.items.length; i++) {
            replaceWithDash(data.items[i]);
        };

        // Prepare Data
		var formData = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

        // Send POST request to email engine
		$http({
			method  : 'POST',
			url     : 'emailengine.php',
            data    : formData,  //param method from jQuery
            headers : {'Content-Type': 'application/json'}
        }).success(function(data){
            // console.log(data);
            if (data.success) { //success comes from the return json object
            	console.log('email-success');
            } else {
            	console.log('email-failure');
            	console.log(data.error);
            	console.log(data.errorBody);
            }
        });
	};

	this.sendOrderDB = function(data) {
		// Prepare Data
		var formData = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

		// Send POST request to DB return a promise
		return $http({
			method  : 'POST',
			url     : 'save.php',
            data    : formData,  //param method from jQuery
            headers : {'Content-Type': 'application/json'}
        }).success(function(data){
            // console.log(data);
            if (data.orders_id) { //success comes from the return json object
            	console.log('db-success');
            	return data.orders_id;
            } else {
            	console.log('db-failure');
            }
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
		if(number > 1) {
			return 's';
		}
		return '';
	};

	this.registerNavConfirm = function() {
		window.onbeforeunload = function() {
			return "You are not done looting!";
		}
	}

	this.deregisterNavConfirm = function() {
		window.onbeforeunload = function() {}
	}
}]);

function routeConfig($routeProvider) {
	$routeProvider.when('/', {
		controller: 'homeController',
		controllerAs: 'homeC',
		templateUrl: 'home.html'
	})
}
mod.config(routeConfig);

mod.controller('homeController', ['data', 'utility','$location', function(data, utility, $location){
	var vm  = this;
	
	vm.next = function() {
		$location.path(utility.findNext('cover'));
	}
}]);