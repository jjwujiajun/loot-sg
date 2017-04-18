var mod = angular.module('loot-sg', ['ngRoute']);

mod.service('data', function() {
	
	this.items    = []; 
	// Dummy Sephora Item
	// [{
	// 	"merchant": "sephora",
	// 	"quantity": 1,
	// 	"url": "sephora.com",
	//     "name": "Enamored Hi-Shine Nail Polish",
	//     "imageUrl": "http://sephora.com//productimages/sku/s1511344-main-Lhero.jpg",
	//     "unitPrice": 18,
	//     "colors": [
	//       {
	//         "option": "118 Oui!",
	//         "sku": "1510916"
	//       },
	//       {
	//         "option": "116 Shocking",
	//         "sku": "1510924"
	//       },
	//       {
	//         "option": "138 Jezebel",
	//         "sku": "1511351"
	//       },
	//       {
	//         "option": "136 Desire",
	//         "sku": "1511344",
	//       }
	//     ],
	//     "selectedOption": {},
	//     'color': '',
	//     'size':'',
	//     'isSupported': false,
	//     'notSupportedInfo': 'Sephora Play! subscription box is not supported.'
	// }];
	// this.items[0].selectedOption = this.items[0].colors[0];
	// this.items[0].color = this.items[0].selectedOption.option;
	// this.items[0].size = this.items[0].selectedOption.sku;

	// F21 Item
	// this.items    = [
	// 					{name: 'Loot.sg', number: 2, url: 'http://www.loot.sg', quantity: 3, sizes: ['S','M','XL'], size: 'M', colors: ['Black','Blue'], color: 'Black', unitPrice: '0', instructions: 'FRAGILE!', proceedOrder: true, imageUrl: 'test-img.jpg'},
	// 					{name: 'Lootcommerce.com', number: 1, url: 'http://spree.loot.sg', quantity: 2, sizes: ['S','M','XL'], size: 'XL', unitPrice: '1990', colors: ['Black','Blue'], color: 'Rainbow', instructions: 'NOT FRAGILE!', proceedOrder: true,  imageUrl: 'test-img.jpg'}
	// 				];
	// this.userInfo = {};
 
 	// DEBUG

	this.userInfo = {
		userId: -1, // DB variable
		firstName: '',
		lastName: '',
		addressLine1: '',
		addressLine2: '',
		postalCode: '',
		contact: '',
		email: ''
	};


	// this.userInfo = {
	// 	firstName: 'Will',
	// 	lastName: 'Ho',
	// 	addressLine1: '20 Heng Mui Keng Terrace',
	// 	addressLine2: 'D618',
	// 	postalCode: '119618',
	// 	contact: '+65 1234 1234',
	// 	email: 'will@loot.sg'
	// };

	this.orderInfo = {
		totalUsd: 0,
		totalSgd: 0,
		usdSgd: 1,
		orderId: 0
	};

	this.siteState = {
		showPBOutput: true,
		isScraping: false
	};
});


mod.service('utility', ['data', '$http', '$location', '$timeout', '$anchorScroll', function(data, $http, $location, $timeout, $anchorScroll) {
	var createEmptyItem = function() {
		return {
			number: data.items.length + 1,
			name: '',
			url: '',
			quantity: '1',
			size: '',
			color: '',
			instructions: '',
			proceedOrder: true,
			unitPrice: '',
			imageUrl: '',
			sizes: [],
			colors: [],
			details: '',
			merchant: '',
			isSupported: true
		};
	};

	this.scrapeSephora = function(textField) {
		var url = textField.text;

		var getResult = function() {
			setTimeout(function() {
				$http({
					method	: 'GET',
					url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/sephora/lastExec/results?token=3HLoZbeYE3rzm4MdWNvau2ECG'
				}).then(function (response) {
					console.log(response);
					if (response.data.length == 0) {
						getResult();
					} else {
						var result = response.data[0].pageFunctionResult;
						console.log(result);

						data.siteState.isScraping = false;

						var newItem    = createEmptyItem();

						newItem.merchant = 'sephora';
						newItem.name = result.item_name;
						newItem.url = url;
						// newItem.details = result.description;


						// Unsupported items
						if (url.includes('/play-subscription')) {

							newItem.isSupported = false;
							newItem.notSupportedInfo = 'Sephora Play! subscription box is not supported.';
							newItem.quantity = 0;
							newItem.unitPrice = 0.00;

							console.log('is sub. price: '+ newItem.unitPrice+'isSupported: '+newItem.isSupported);

							data.items.push(newItem);
							data.siteState.isScraping = false;
							textField.text = '';
							return;
						}


						// Quantity
						newItem.quantity = 1;

						// Price
						if(result.prices.length == 0) {
							newItem.unitPrice = 0.00
						} else {
							newItem.unitPrice = Math.min.apply(null, result.prices)*100;
						}

						// Image
						if(result.item_image) {
							newItem.imageUrl  = result.item_image;
						}

						// Sizes
						newItem.sizes = [];

						// Options, using the Colors field
						newItem.colors = result.options;

						if (newItem.colors.length == 0) {
							newItem.size = result.sku;
						} else {
							newItem.selectedOption = newItem.colors[0];
							newItem.color = newItem.selectedOption.color;
							newItem.size = newItem.selectedOption.sku;
						}

						data.items.push(newItem);
						data.siteState.isScraping = false;
						textField.text = '';
					}
				});
			}, 3000);
		}

		data.siteState.isScraping = true;

		return $http({
			method	: 'PUT',
			url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/sephora?token=FdZzu9coKqgmzHWwryA9TfXnF',
			data 	: {
				'customId': 'sephora',
				'startUrls': [{
					"key": "start",
      				"value": url
				}]
			}
		}).then(function() {
			return $http({
				method	: 'POST',
				url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/sephora/execute?token=QawBiZJGBSqgs3nxqmRJaeJTw',
			});
		}).then(getResult());
	}

	this.scrapeF21 = function(textField) {

		var url = textField.text;

		var getResult = function() {
			setTimeout(function() {
				$http({
					method	: 'GET',
					url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/forever21.com/lastExec/results?token=6TGJZ44MXCgh5i8uFqcnmGwWy'
				}).then(function (response) {
					console.log(response);
					if (response.data.length == 0) {
						getResult();
					} else {
						var result = response.data[0].pageFunctionResult;
						console.log(result);

						data.siteState.isScraping = false;

						var newItem    = createEmptyItem();

						newItem.merchant = 'f21';
						newItem.name = result.item_name;
						newItem.url = url;
						newItem.details = result.description;

						newItem.quantity = 1;

						// Price
						if(result.price_sale) {
							newItem.unitPrice = parseFloat(result.price_sale)* 100;
						} else if(result.price_normal) {
							newItem.unitPrice = parseFloat(result.price_normal)*100;
						}
						
						// // console.log(result.price_sale);
						// // console.log(result.price_normal);

						// Image
						if(result.item_image) {
							newItem.imageUrl  = result.item_image;
						// } else if(result.image2) {
						// 	newItem.imageUrl  = result.image2[0].src;
						// } else if(result.image3) {
						// 	newItem.imageUrl  = result.image3[0].src;
						// } else {
						// 	newItem.imageUrl = './images/no_image_avail-F21.png';
						}

						// Sizes
						newItem.sizes = result.sizes_avail;
						// if(!Array.isArray(result.sizes_avail)) {
						// newItem.sizes = result.sizes_available.map(function(size) {
						// 	return size.text;
						// });

						
						// Colors
						newItem.colors = result.colors_avail;
						// // if(!Array.isArray(result.colors_available)) {
						// newItem.colors = result.colors_available.map(function(color) {
						// 	return color.alt;
						// });

						if (isNaN(newItem.sizes[0])) {
							newItem.useCircleForSizes = newItem.sizes[0].length <= 2;
						} else {
							newItem.useCircleForSizes = newItem.sizes[0].toString().length <= 2;
						}

						// Select first size and color
						if(typeof newItem.sizes[0] !== 'undefined') {
							newItem.size = newItem.sizes[0];    			
						}
						if(typeof newItem.colors[0] !== 'undefined') {
							newItem.color = newItem.colors[0];
						}

						data.items.push(newItem);
						data.siteState.isScraping = false;
						textField.text = '';
					}
				});
			}, 3000);
		}

		url = url.replace('/mobile/', '/');
		url = url.replace('/Mobile/', '/');

		// import.io API 1
		// var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
		
		// import.io API 2
		// var urlString = "https://extraction.import.io/query/extractor/af3afc53-967e-4ab7-913b-0ee1b9ad5a3a?_apikey=dc981c6f70dd4d2daa69a6e2a25fbf59093de59662cf20a0ae7e0a697d9d9311f72508d291a847a52aaff3a2bbc06604f729388ec7794353da8ab448f675afd3921f1bcf4484fc0d964e1435c52f3e7e&url=" + encodeURIComponent(url);
		
		data.siteState.isScraping = true;

		return $http({
			method	: 'PUT',
			url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/forever21.com?token=FdZzu9coKqgmzHWwryA9TfXnF',
			data 	: {
				'customId': 'forever21.com',
				'startUrls': [{
					"key": "start",
      				"value": url
				}]
			}
		}).then(function() {
			return $http({
				method	: 'POST',
				url 	: 'https://api.apifier.com/v1/e3yAFMJ4jvRj6GMYS/crawlers/forever21.com/execute?token=Crr68CRua6Wb5QZSXazTp6My6',
			});
		}).then(getResult());	
	};

	this.sendOrderEmail = function() {
		// Prepare Data
		var formData = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

		// Send POST request to email engine
		return $http({
			method  : 'POST',
			url     : './backend/send_order.php',
			data    : formData,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			// console.log(response);
			if (response.data.success) { //success comes from the return json object
				console.log('order-email-success');
			} else {
				console.log('order-email-failure');
				console.log(response.data.error);
				console.log(response.data.errorBody);
			}
		});
	};

	this.sendReceipt = function() {
		// Prepare Data
		var formData = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

		// Send POST request to email engine
		return $http({
			method  : 'POST',
			url     : './backend/send_receipt.php',
			data    : formData,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			console.log(response);
			if (response.data.success) { //success comes from the return json object
				console.log('client-receipt-success');
			} else {
				console.log('client-receipt-failure');
				console.log(response.data.error);
				console.log(response.data.errorBody);
			}
		});
	};

	this.login = function() {
		// Prepare Data
		var request = {
			email: data.userInfo.email
		};

		// Send POST request to DB return a promise
		return $http({
			method  : 'POST',
			url     : './backend/login.php',
			data    : request,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			if (response.data.userId) { //success comes from the return json object
				console.log('db-login-success');
				return response.data;
			} else {
				console.log('db-login-failure');
				return false;
			}
		});
	};

	this.addUpdateUser = function() {
		// Prepare Data
		var request = {
			userInfo: data.userInfo
		};

		// Send POST request to DB return a promise
		return $http({
			method  : 'POST',
			url     : './backend/add_update_user.php',
			data    : request,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			if (response.data.userId) { //success comes from the return json object
				console.log('db-user-update-success');
				return response.data;
			} else {
				console.log('db-user-update-failure');
				return false;
			}
		});
	};

	this.submitOrder = function() {
		// Prepare Data
		var request = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

		// Send POST request to DB return a promise
		return $http({
			method  : 'POST',
			url     : './backend/submit_order.php',
			data    : request,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			console.log(response);
			if (response.data.orderId) { //success comes from the return json object
				console.log('db-order-success');
				return response.data;
			} else {
				console.log('db-order-failure');
				return false;
			}
		});
	};

	this.qualifyOrder = function() {
		// Prepare Data
		var request = {
			orderId: data.orderInfo.orderId
		};

		// Send POST request to DB return a promise
		return $http({
			method  : 'POST',
			url     : './backend/qualify_order.php',
			data    : request,  //param method from jQuery
			headers : {'Content-Type': 'application/json'}
		}).then(function(response){
			console.log(response);
			if (response.data.orderId) { //success comes from the return json object
				console.log('db-qualify-order-success');
				return response.data;
			} else {
				console.log('db-qualify-order-failure');
				return false;
			}
		});
	}

	// Should cache response if requests occur on multiple pages per user
	this.getForexRates = function(){
		// HTTPS from MAS
		var apiurl = 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=95932927-c8bc-4e7a-b484-68a66a24edfe&limit=1&filters[end_of_day]=2016-11-11&fields=usd_sgd';
		// var apiurl = 'https://api.fixer.io/latest?base=USD&symbols=SGD';

		return $http({
			method : 'GET',
			url    : apiurl,
		}).then(function(response){
			// MAS
			var rate = response.data.result.records[0].usd_sgd;

			// Fixer.io
			// var rate = response.data.rates.SGD;
			console.log(rate);
			
			// exchange rate here
			// return 1.3971;

			return rate;
		});	
		

	};

	this.configureMoneyJs = function(usd_sgd) {
		fx.base = "USD";
		fx.rates = {
			SGD : usd_sgd
		};
		fx.settings = {
			from : "USD",
			to   : "SGD"
		};
	};

	var convertAndRound = function(amount){
		return parseInt(accounting.toFixed(fx.convert(amount), 0));
	};
	
	var replaceWithDash = function(obj){
		angular.forEach(obj, function(value, field){
			if(value === '') {
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

	this.updateTotalUsd = function() {
		var sum = 0;
		for (var i = 0; i < data.items.length; i++) {
			sum += data.items[i].unitPrice * data.items[i].quantity;
		}
		data.orderInfo.totalUsd = sum;
	};

	this.updateTotalSgd = function() {
		data.orderInfo.totalSgd = convertAndRound(data.orderInfo.totalUsd);
	};

	this.preprocessForEmail = function() {
		// Replace blank fields with dashes
		replaceWithDash(data.userInfo);
		for(var i = 0; i < data.items.length; i++) {
			replaceWithDash(data.items[i]);
		}
	};

	this.goPageAndAnchorScroll = function(page, anchor) {
		$location.path(page);

		data.siteState.showPBOutput = false;

		$timeout(function () {
			$anchorScroll(anchor);
		});
	};

	this.reverseItems = function() {
		var reversedItems = [];

		for (var i = data.items.length - 1; i >= 0 ; i--) {
			data.items[i].number = data.items.length - 1 - i + 1;
			reversedItems.push(data.items[i]);
		}

		data.items = reversedItems;
	};

}]);

function routeConfig($routeProvider) {
	$routeProvider.when('/', {
		controller: 'homeController',
		controllerAs: 'home',
		templateUrl: 'home.html'
	}).when('/faq', {
		controller: 'faqController',
		controllerAs: 'faq',
		templateUrl: 'faq.html'
	}).when('/contacts', {
		controller: 'contactsController',
		controllerAs: 'contacts',
		templateUrl: 'contacts.html'
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
	})
}
mod.config(routeConfig);

mod.controller('homeController', ['data', 'utility','$location', '$anchorScroll', '$scope', function(data, utility, $location, $anchorScroll, $scope){
	var vm  = this;
	vm.data = data;
	vm.siteState = data.siteState;

	// data.items[0].selectedOption = data.items[0].colors[1];
	// data.items[0].size = data.items[0].selectedOption.sku;
	// data.items[0].color = data.items[0].selectedOption.color;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	vm.urlField = {'text': '', 'placeholder': 'Paste the link to the item you like here. eg. http://www.forever21.com/ProductID=225453'};
	var firstScrape = true;

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return 'amazon';
		} else if (str.indexOf('forever21.com') != -1) {
			return 'f21';
		} else if (str.indexOf('sephora') != -1) {
			return 'sephora';
		}
		return -1;
	};

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

		var logoMenu = document.querySelector('#menu-logo');
		angular.element(logoMenu).click(function () {
			angular.element("body").animate({ scrollTop: '0'});
			angular.element(pbInput).focus();
		});

		var addItemsButton = document.querySelector('#add-items');
		angular.element(addItemsButton).click(function () {
			angular.element("body").animate({ scrollTop: '0'});
			angular.element(pbInput).focus();
		});

		var backToTopButton = document.querySelector('#back-to-top');
		angular.element(backToTopButton).click(function () {
			angular.element("body").animate({ scrollTop: '0'});
			angular.element(pbInput).focus();
		});
	});

	var insertFirstScrapePlaceHolderInPutbom = function() {
		if(firstScrape){
			vm.urlField.placeholder = 'Paste your next item link here';
			firstScrape = false;
		}
	}

	vm.scrapeURL = function () {
		// Check if input is valid url
		switch (isValidURL(vm.urlField.text)) { 
			case 'f21':
				utility.scrapeF21(vm.urlField).then(function(){
					insertFirstScrapePlaceHolderI();
				});
				break;
			case 'sephora':
				utility.scrapeSephora(vm.urlField).then(function(){
					if (firstScrape) {
						insertFirstScrapePlaceHolderInPutbom();
					};
				});
				break;
			default:
				console.log('URL not recognised');
				break;
		}
	};

	vm.updateDropdownItem = function(item, merchant) {
		switch (merchant) {
			case 'sephora':
				item.size = item.selectedOption.sku;
				item.color = item.selectedOption.option;
				break;
			default:
				break;
		}
	}
	

	vm.removeItem = function(itemNumber) {
		vm.data.items.splice(itemNumber - 1, 1);
	};

	vm.selectColorForItem = function(color, item) {
		item.color = color;
	};

	vm.selectSizeForItem = function(size, item) {
		item.size = size;
	};
	
	vm.checkOut = function(){
		utility.updateTotalUsd();
		$location.path('login');
	};

	vm.scroll = function(anchor){
		$anchorScroll(anchor);
	};

	vm.showPutBom = function(){
		vm.siteState.showPBOutput = true;
	};

	vm.hidePutBom = function(){
		vm.siteState.showPBOutput = false;
	};

	vm.helpEmailClicked = function() {
		ga('send', 'event', { 
			eventCategory: 'email', 
			eventAction: 'click',
			eventLabel: 'help'
		});
	};

	vm.merchantLinkClicked = function(merchant) {
		ga('send', 'event', { 
			eventCategory: 'merchantLink', 
			eventAction: 'click',
			eventLabel: merchant
		});
		console.log(merchant);
	};

}]);

mod.controller('faqController', ['utility', '$sce', '$scope', '$location', function(utility, $sce, $scope, $location) {
	var vm = this;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	vm.questions = [
	{
		'header': 'Ordering',
		'headerName': 'Ordering',
		'isOpen': false,
		'items': [
		{
			'question': 'How does ordering work?',
			'answer': '<p>Ordering is simple with Loot.</p><p>On the home page, paste the website link to the item you want Forever21. Follow our prompts if you’d like to add more items, or to checkout. Provide us with your delivery and billing address, and make payment to complete your checkout!</p>' //from Amazon or
		},
		{
			'question': 'What if my items are out of stock, but I have already paid for my order?',
			'answer': 'During the checkout process, you can specify<br/>(a) whether you would like to continue with the rest of the order if any of your items are out of stock, or<br/>(b) if you prefer to cancel the entire order if any items are out of stock. Either way, we will issue a refund for the items that are out of stock, or refund you for the entire order if you prefer.'
		}
		]
		
	},
	{
		'header': 'Merchants',
		'headerName': 'Merchants',
		'isOpen': false,
		'items': [
		{
			'question': 'Are there any restrictions for items?',
			'answer': '<p>Forever 21<br/>No restriction.</p><p>Sephora<br/>a) Sephora Play! subscription box is not supported.<br/>b) For security reasons, liquid items are not supported for now.<br/> Liquid items include facial washes, moistuizers, toners, oils, nail polish, perfumes, sprays, sanitizers.</p>' //<p>There is however some restriction items from Amazon.</p>a) Price: Individual item price must be between US$20 and US$150. <br />b) Weight: The item must weigh below 3 KG i.e. 6.6 lbs - this can be found on the item page in “Shipping Weight”.<p><em>Scenario A:</em> Tom wants to buy 2 pair of shoes on Amazon using Loot. One pair costs $18, the other costs $35. Both pairs weigh 5.5 lbs (2.5 KG) each. In this scenario, only the $35 pair of shoes can be ordered using Loot. Tom should consider getting other pairs of shoes above $20!</p><p><em>Scenario B:</em> Sally wants to buy a chair (20 lbs/ 9 KG) and a handbag (4.4 lbs / 2 KG). Both items cost US$100 on Amazon. In this scenario, the handbag can be ordered using Loot; unfortunately, the chair is too heavy for us to ship for free! Sally should consider adding other items under 3 KG - more handbags perhaps? :)</p>'
		}
		]
	},
	{
		'header': 'Paying',
		'headerName': 'Coupons / Payment / Fees',
		'isOpen': false,
		'items': [
		{
			'question': 'Can I use a coupon code from the merchants?',
 			'answer': '<p>You may! Leave it as a comment under “Additional instructions” when making your order. If your items are eligible for the coupon, expect to see a refund to your credit card within 7 business days :)</p>' //<p>Loot’s coupon ninjas automatically find the best prices available - we proactively refund you any savings to your credit card.</p>
		},
		{
			'question': 'What forex rate will I be charged?',
			'answer': 'When shopping with Loot, you will only be charged the live mid-market rates that is found on Google (<a href="https://www.google.com/search?output=search&sclient=psy-ab&q=google+usd+sgd&btnG=&oq=&gs_l=&pbx=1#q=1+usd+to+sgd">click here for the latest rates</a>). Loot displays the forex rate (USD/SGD) upfront. What you see, is what you get :)'
		},
		{
			'question': 'How secure is your payment link?',
			'answer': 'Our payments link is handled by <a href="www.stripe.com">Stripe</a>, a payments processor that also handles payments for large tech companies such as Uber and Airbnb. The payment link is https encrypted and payment information is never stored on Loot servers!'
		},
		{
			'question': 'Can I pay via iBanking or Paypal?',
			'answer': 'No. At this time we accept payments only via credit and debit cards. Payment via iBanking and Paypal will be offered soon.'
		},
		{
			'question': 'Are there any hidden fees?',
			'answer': 'No! We don’t like to charge unnecessary handling fees, forex fees, nor GST. With Loot, prices are quoted upfront - overseas shopping, simplified!'
		}
		]
	},
	{
		'header': 'Shipping',
		'headerName': 'Shipping',
		'isOpen': false,
		'items': [
		{
			'question': 'How soon will I get my items?',
			'answer': 'Around 4 weeks!'
		},
		{
			'question': 'How do I track order?',
			'answer': 'There isn\'t a webbie to track your order yet, but we will update you two times:<br/>1) when the order has been placed<br/>2) when we need to schedule a delivery time with you in Singapore'
		},
		{
			'question': 'Can I expedite my order?',
			'answer': 'Not at the moment.'
		},
		{
			'question': 'Can I pickup my order instead?',
			'answer': 'We offer free delivery to anywhere in Singapore. Email us (<a href="mailto:orders@loot.sg">orders@loot.sg</a>) if you’d like to arrange a special pickup.'
		}
		]
	},
	{
		'header': 'Others',
		'headerName': 'Others',
		'isOpen': false,
		'items': [
		{
			'question': 'What is Loot?',
			'answer': '<p>Loot helps shoppers save time and money. We make it easy to buy stuff from overseas! Using Loot, simply tell us what you want and we deliver it to you in Singapore for free (yes, free!).</p><p>Loot is a eCommerce startup funded by NUS Enterprise (www.loot.sg). We are currently offering free shipping to Singaporean shoppers ordering from Forever21.com (USA). Loot is currently offered exclusively to Carousell and HWZ members.</p><p>With Loot, you’ll never have to worry about hidden charges such as handling or forex fees - prices are quoted upfront in SGD using the latest mid-market forex rates.</p>' //Amazon.com (USA) and 
		},
		{
			'question': 'How do you get free shipping?',
			'answer': 'We work with merchants to deliver the best shopping experience to our shoppers. Part of this includes free shipping from US merchants to Singapore! Eventually, this will extend to other shoppers in the Asian region.'
		},
		{
			'question': 'How do you make money?',
			'answer': '<p>Over the past year, our team has been working hard to source the best discounts for you. For the most part, getting stuff from overseas merchants has been a complex process involving freight forwarders or online "sprees" - hardly a simple process!</p><p>We simplify the process of ordering from overseas, and earn a small fee from merchants each time you place an order.</p>'
		},
		{
			'question': 'I still have questions! How can I reach you?',
			'answer': 'If you don’t find an answer below, the Loot team is ready to help! Reach out to us at <a href="mailto:help@loot.sg">help@loot.sg</a> - we typically reply within hours ;)'
		}
		]
	}
	];
	
	vm.renderHtml = $sce.trustAsHtml;

	vm.goPageAndAnchorScroll = utility.goPageAndAnchorScroll;

	vm.expandSection = function (section) {
		section.isOpen = !section.isOpen;

		var sectionContent = angular.element('#' + section.header);
		sectionContent.slideToggle();

	};
}]);

mod.controller('contactsController', ['utility', '$scope', function(utility, $scope) {
	var vm = this;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: '/about' });
	});

	vm.goPageAndAnchorScroll = utility.goPageAndAnchorScroll;
}]);

mod.controller('loginController', ['data', 'utility', '$location', '$scope', function(data, utility, $location, $scope){
	var vm = this;
	vm.userInfo = data.userInfo;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	vm.back = function(){
		$location.path('');
	};

	vm.next = function(){
		utility.login().then(function(response){
			if(response){
				data.userInfo = response;
			}
			$location.path('delivery');
		});
	};

}]);

mod.controller('deliveryController', ['data', 'utility', '$location', '$scope', function(data, utility, $location, $scope){
	var vm = this;
	vm.userInfo = data.userInfo;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	vm.back = function(){
		$location.path('login');
	};

	vm.next = function(){
		utility.addUpdateUser().then(function(response){
			if (data.userInfo.userId == -1){
				if(response){
					data.userInfo.userId = response.userId;	
					$location.path('confirm');
				} else {
					alert('An error occured when saving your info. Please contact help@loot.sg.');	
				}	
			} else {
				$location.path('confirm');
			}
		});
	};

}]);

mod.controller('confirmController', ['data', 'utility', '$location', '$window', '$http', '$scope', '$filter', function(data, utility, $location, $window, $http, $scope, $filter){
	var vm = this;
	vm.orderInfo       = data.orderInfo;
	vm.items           = data.items;
	vm.itemCount       = data.items.length;
	vm.getPlurality    = utility.getPlurality;
	var chargeCurrency = 'sgd';

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	// Get past day exchange rate
	utility.getForexRates().then(function(rate){
		// Exchange rate here
		// var rate = 1.3971;
		data.orderInfo.usdSgd = rate;
		console.log(rate);
		utility.configureMoneyJs(rate);
		utility.updateTotalUsd();
		console.log(data.orderInfo.totalUsd);
		utility.updateTotalSgd();
		var fxEquation = $filter('currency')(data.orderInfo.totalUsd / 100.00, 'US$') + ' &times; ' + '<span style="text-decoration: underline">' + data.orderInfo.usdSgd + '</span>' + ' = ' + $filter('currency')(data.orderInfo.totalSgd / 100.00, 'S$');
		$('#total-sgd').popover({
			title: 'Our exchange rate',
			content: fxEquation,
			html : true,
			placement: 'auto bottom',
			trigger: 'hover',
			container: 'body'
		});
	});

	// Configure Checkout.js
	var handler = $window.StripeCheckout.configure({
		key: 'pk_test_rlSGgE3saZE9iDvzNtKlc1Tb',
		image: 'https://s3.amazonaws.com/stripe-uploads/acct_17kbl6LmG6293IlZmerchant-icon-1456937740742-Loot_logo_128px.png',
		locale: 'auto',
		email: data.userInfo.email,
		name: 'Loot',
		description: 'Your order',
		zipCode: false,
		currency: chargeCurrency,
		token: function(token) {
			var request = {
				amount: data.orderInfo.totalSgd,
				currency: chargeCurrency,
				token: token.id
			};

			// Send POST request to server
			$http({
				method  : 'POST',
				url     : './backend/charge.php',
				data    : request,
				headers : {'Content-Type': 'application/json'}
			}).then(function(response){
				// console.log(response);
				if (response.data.success) { //success comes from the return json object
					console.log('charge-success');
					utility.reverseItems();
					utility.qualifyOrder().then(function(response){
						utility.preprocessForEmail();
						utility.sendOrderEmail();
						utility.sendReceipt().then(function(response){
							$window.location.href = 'done.html?orderId=' + data.orderInfo.orderId;
						});
					});
				} else {
					console.log('charge-failure');
					console.log(response.data.error);
				}
			});
		
		}
	});

	vm.back = function(){
		$location.path('delivery');
	};

	vm.confirmAndPay = function(){
		// As a safety net, recalculate total again and convert
		utility.updateTotalUsd();
		utility.updateTotalSgd();
		
		// Record order in DB
		if(data.orderInfo.orderId == 0){
			utility.submitOrder().then(function(response){
				data.orderInfo.orderId = response.orderId;
			});
		}
		
		handler.open({
			amount: data.orderInfo.totalSgd
		});

		$scope.$on('$routeChangeStart', handler.close);
	};

	vm.modify = function(){
		$location.path('modify');
	};

}]);

mod.controller('modifyController', ['data','utility','$location', '$scope', function(data, utility, $location, $scope){
	var vm = this;
	vm.urlField = {'text': '', 'placeholder': 'Paste your next item URL here'};
	vm.data = data;
	vm.siteState = data.siteState;
	vm.pbInputIsShown = false;

	$scope.$on('$viewContentLoaded', function(event){
		ga('send', 'pageview', { page: $location.url() });
	});

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return 'amazon';
		} else if (str.indexOf('forever21.com') != -1) {
			return 'f21';
		} else if (str.indexOf('sephora') != -1) {
			return 'sephora';
		}
		return -1;
	};

	vm.scrapeURL = function () {
		// Check if input is valid url
		switch (isValidURL(vm.urlField.text)) { 
			case 'f21':
				utility.scrapeF21(vm.urlField).then(function(){
					insertFirstScrapePlaceHolderI();
				});
				break;
			case 'sephora':
				utility.scrapeSephora(vm.urlField).then(function(){
					if (firstScrape) {
						insertFirstScrapePlaceHolderInPutbom();
					};
				});
				break;
			default:
				console.log('URL not recognised');
				break;
		}
	};

	vm.updateDropdownItem = function(item, merchant) {
		switch (merchant) {
			case 'sephora':
				item.size = item.selectedOption.sku;
				item.color = item.selectedOption.option;
				break;
			default:
				break;
		}
	}
	
	vm.removeItem = function(itemNumber) {
		vm.data.items.splice(itemNumber - 1, 1);
	};

	vm.selectColorForItem = function(color, item) {
		item.color = color;
	};

	vm.selectSizeForItem = function(size, item) {
		item.size = size;
	};

	vm.save = function(){
		utility.updateTotalUsd();
		$location.path('confirm');
	};

	vm.togglePBInput = function () {
		vm.pbInputIsShown = !vm.pbInputIsShown;
	};

}]);

mod.directive('countdown', ['Util', '$interval', function (Util, $interval) {
    return {
        restrict: 'A',
        scope: { date: '@' },
        link: function (scope, element) {
            var future;
            future = new Date(scope.date);
            $interval(function () {
                var diff;
                diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
                return element.text(Util.dhms(diff));
            }, 1000);
        }
    };
}]).factory('Util', [function () {
    return {
        dhms: function (t) {
            var days, hours, minutes, seconds;
            days = Math.floor(t / 86400);
            t -= days * 86400;
            hours = Math.floor(t / 3600) % 24;
            t -= hours * 3600;
            minutes = Math.floor(t / 60) % 60;
            t -= minutes * 60;
            seconds = t % 60;
            return days<0? '': days + ' days ' + hours + ' h ' + minutes + ' m ' + seconds + ' s';
        }
    };
}]);
