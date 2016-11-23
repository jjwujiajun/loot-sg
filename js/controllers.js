var mod = angular.module('loot-sg', ['ngRoute']);


mod.service('data', function() {

	this.items    = [];

	// this.items = {
	// 	number: 1,
	// 	name: '',
	// 	url: '',
	// 	quantity: '',
	// 	size: '',
	// 	color: '',
	// 	instructions: '',
	// 	proceedOrder: true,
	// 	unitPrice: '',
	// 	imageUrl: '',
	// 	sizes: [],
	// 	colors: [],
	// 	details: ''
	// }


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
		usdSgd: 1
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
			details: ''
		};
	};

	this.scrapeF21 = function(url) {
		var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
		console.log('scrapeF21 GET: ' + urlString);
		
		data.siteState.isScraping = true;

		return $http({
			method : 'GET',
			url    : urlString
		}).then(function (result) {
			data.siteState.isScraping = false;

			var resultData = result.data;
			newItem    = createEmptyItem();

			result     = resultData.results[0];
			newItem.name = result.item_name;
			newItem.url = url;
			newItem.details = result.details;

			newItem.quantity = 1;

			// Price
			if(result.price_sale) {
				newItem.unitPrice = result.price_sale * 100;
			} else if(result.price_normal) {
				newItem.unitPrice = result.price_normal * 100;
			}
			
			console.log(result.price_sale);
			console.log(result.price_normal);

			// Image
			if(result.image1) {
				newItem.imageUrl  = result.image1;
			} else if(result.image2) {
				newItem.imageUrl  = result.image2;
			} else if(result.image3) {
				newItem.imageUrl  = result.image3;
			} else {
				newItem.imageUrl = './images/no_image_avail-F21.png';
			}

			// Sizes
			if(!Array.isArray(result.sizes_available)) {
				newItem.sizes  = [result.sizes_available];
			} else {
				newItem.sizes = result.sizes_available;    
			}
			
			// Colors
			if(!Array.isArray(result["colors_available/_alt"])) {
				newItem.colors = [result["colors_available/_alt"]];
			} else {
				newItem.colors = result["colors_available/_alt"];    
			}

			if (isNaN(newItem.sizes[0])) {
				newItem.useCircleForSizes = newItem.sizes[0].length <= 2;
			} else {
				newItem.useCircleForSizes = newItem.sizes[0].toString().length <= 2;
			}
			console.log(newItem.useCircleForSizes);

			// Select first size and color
			if(typeof newItem.sizes[0] !== 'undefined') {
				newItem.size = newItem.sizes[0];    			
			}
			if(typeof newItem.colors[0] !== 'undefined') {
				newItem.color = newItem.colors[0];
			}

			data.items.push(newItem);
			data.siteState.isScraping = false;
		});
	};

	this.sendOrderEmail = function() {
		// Prepare Data
		var formData = {
			userInfo: data.userInfo,
			items: data.items,
			orderInfo: data.orderInfo
		};

		// Send POST request to email engine
		$http({
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
		$http({
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
				data.orderInfo.orderId = response.data.orderId;
				console.log('db-order-success');
				return response.data;
			} else {
				console.log('db-order-failure');
				return false;
			}
		});
	};

	// Should cache response if requests occur on multiple pages per user
	this.getForexRates = function(){
		// HTTPS from MAS
		// var apiurl = 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=95932927-c8bc-4e7a-b484-68a66a24edfe&limit=1&filters[end_of_day]=2016-11-11&fields=usd_sgd';
		var apiurl = 'http://api.fixer.io/latest?base=USD&symbols=SGD';

		return $http({
			method : 'GET',
			url    : apiurl,
		}).then(function(response){
			// MAS
			// rate = response.data.result.records[0].usd_sgd;
			// Fixer.io
			var rate = response.data.rates.SGD;
			console.log(rate);
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

mod.controller('homeController', ['data', 'utility','$location', '$anchorScroll', function(data, utility, $location, $anchorScroll){
	var vm  = this;
	vm.data = data;
	vm.siteState = data.siteState;

	vm.urlField = {'text': '', 'placeholder': 'Paste the link to the item you like here. eg. http://www.forever21.com/ProductID=225453'};
	var firstScrape = true;

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return true;
		} else if (str.indexOf('forever21.com') != -1) {
			return true;
		}
		return false;
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

	vm.scrapeURL = function () {
		// Check if input is valid url
		if (isValidURL(vm.urlField.text)) { 

			// try scrape from import.io
			utility.scrapeF21(vm.urlField.text).then(function(){
				vm.urlField.text = '';
				if(firstScrape){
					vm.urlField.placeholder = 'Paste your next item link here';
					firstScrape = false;
				}
			});
		}
	};
	

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

}]);

mod.controller('faqController', ['utility', '$sce', function(utility, $sce) {
	var vm = this;
	vm.questions = [
	{
		'header': 'Ordering',
		'isOpen': false,
		'items': [
		{
			'question': 'I have a question! How can I reach you?',
			'answer': 'If you don’t find an answer below, the Loot team is ready to help! Reach out to us at <a href="mailto:help@loot.sg">help@loot.sg</a> - we typically reply within hours ;)'
		},
		{
			'question': 'What stores are eligible for free shipping?',
			'answer': 'Currently, we offer free shipping from Forever21.com (USA). More merchants coming soon!' //and Amazon.com (USA).
		},
		{
			'question': 'How does ordering work?',
			'answer': '<p>Ordering is simple with Loot.</p><p>On the home page, paste the website link to the item you want Forever21. Follow our prompts if you’d like to add more items, or to checkout. Provide us with your delivery and billing address, and make payment to complete your checkout!</p>' //from Amazon or
		},
		{
			'question': 'Are there any restrictions for items?',
			'answer': '<p>There is no restriction for Forever21.</p>' //<p>There is however some restriction items from Amazon.</p>a) Price: Individual item price must be between US$20 and US$150. <br />b) Weight: The item must weigh below 3 KG i.e. 6.6 lbs - this can be found on the item page in “Shipping Weight”.<p><em>Scenario A:</em> Tom wants to buy 2 pair of shoes on Amazon using Loot. One pair costs $18, the other costs $35. Both pairs weigh 5.5 lbs (2.5 KG) each. In this scenario, only the $35 pair of shoes can be ordered using Loot. Tom should consider getting other pairs of shoes above $20!</p><p><em>Scenario B:</em> Sally wants to buy a chair (20 lbs/ 9 KG) and a handbag (4.4 lbs / 2 KG). Both items cost US$100 on Amazon. In this scenario, the handbag can be ordered using Loot; unfortunately, the chair is too heavy for us to ship for free! Sally should consider adding other items under 3 KG - more handbags perhaps? :)</p>'
		},
		{
			'question': 'How do you get free shipping?',
			'answer': 'We work with merchants to deliver the best shopping experience to our shoppers. Part of this includes free shipping from US merchants to Singapore! Eventually, this will extend to other shoppers in the Asian region.'
		},
		{
			'question': 'What if my items are out of stock, but I already paid for my order?',
			'answer': 'During the checkout process, you can specify (a) whether you would like to continue with the rest of the order if any of your items are out of stock, or (b) if you prefer to cancel the entire order if any items are out of stock. Either way, we will issue a refund for the items that are out of stock, or refund you for the entire order if you prefer.'
		}
		]
		
	},
	{
		'header': 'Paying',
		'isOpen': false,
		'items': [
		{
			'question': 'What forex rate will I be charged?',
			'answer': 'When shopping with Loot, you will only be charged the live mid-market rates that is found on Google (<a href="https://www.google.com/search?output=search&sclient=psy-ab&q=google+usd+sgd&btnG=&oq=&gs_l=&pbx=1#q=1+usd+to+sgd">click here for the latest rates</a>). Loot displays the forex rate (USD/SGD) upfront. What you see, is what you get :)'
		},
		{
			'question': 'Are there any hidden fees?',
			'answer': 'No! We don’t like to charge unnecessary handling fees, forex fees, nor GST. With Loot, prices are quoted upfront - overseas shopping, simplified!'
		},
		{
			'question': 'Can I use a coupon code from the merchants?',
 			'answer': '<p>You may! Leave it as a comment under “Additional instructions” when making your order. If your items are eligible for the coupon, expect to see a refund to your credit card within 7 business days :)</p>' //<p>Loot’s coupon ninjas automatically find the best prices available - we proactively refund you any savings to your credit card.</p>
		},
		{
			'question': 'Is your payment link secure?',
			'answer': 'Yes! Our payments link is handled by <a href="www.stripe.com">Stripe</a>, a payments processor that also handles payments for large tech companies such as Uber and Airbnb. The payment link is https encrypted and payment information is never stored on Loot servers!'
		},
		{
			'question': 'Can I pay via iBanking or Paypal?',
			'answer': 'No. At this time we accept payments only via credit and debit cards. Payment via iBanking and Paypal will be offered soon.'
		}
		]
	},
	{
		'header': 'Shipping',
		'isOpen': false,
		'items': [
		{
			'question': 'How soon will I get my items?',
			'answer': 'Less than 2 weeks!'
		},
		{
			'question': 'Can I expedite my order?',
			'answer': 'Not at the moment.'
		},
		{
			'question': 'Can I pickup my order instead?',
			'answer': 'We offer free delivery to anywhere in Singapore. Email us (<a href="mailto:orders@loot.sg">orders@loot.sg</a>) if you’d like to arrange a pickup from our facility located near Serangoon Stadium.'
		}
		]
	},
	{
		'header': 'Others',
		'isOpen': false,
		'items': [
		{
			'question': 'What is Loot?',
			'answer': '<p>Loot helps shoppers save time and money. We make it easy to buy stuff from overseas! Using Loot, simply tell us what you want and we deliver it to you in Singapore for free (yes, free!).</p><p>Loot is a eCommerce startup funded by NUS Enterprise (www.loot.sg). We are currently offering free shipping to Singaporean shoppers ordering from Forever21.com (USA). Loot is currently offered exclusively to Carousell and HWZ members.</p><p>With Loot, you’ll never have to worry about hidden charges such as handling or forex fees - prices are quoted upfront in SGD using the latest mid-market forex rates.</p>' //Amazon.com (USA) and 
		},
		{
			'question': 'How do you make money?',
			'answer': '<p>Over the past year, our team has been working hard to source the best discounts for you. For the most part, getting stuff from overseas merchants has been a complex process involving freight forwarders or online "sprees" - hardly a simple process!</p><p>We simplify the process of ordering from overseas, and earn a small fee from merchants each time you place an order.</p>'
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

mod.controller('contactsController', ['utility', function(utility) {
	var vm = this;

	vm.goPageAndAnchorScroll = utility.goPageAndAnchorScroll;
}]);

mod.controller('loginController', ['data', 'utility', '$location', function(data, utility, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

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

mod.controller('deliveryController', ['data', 'utility', '$location', function(data, utility, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

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

	// Get past day exchange rate
	utility.getForexRates().then(function(rate){
		data.orderInfo.usdSgd = rate;
		utility.configureMoneyJs(rate);
		utility.updateTotalUsd();
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
					utility.submitOrder().then(function(response){
						data.orderInfo.orderId = response.orderId;
						utility.preprocessForEmail();
						utility.sendOrderEmail();
						utility.sendReceipt();
						$window.location.href = 'done.html?orderId=' + data.orderInfo.orderId;
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
		utility.updateTotalUsd();
		handler.open({
			amount: data.orderInfo.totalSgd
		});

		$scope.$on('$routeChangeStart', handler.close);
	};

	vm.modify = function(){
		$location.path('modify');
	};

}]);

mod.controller('modifyController', ['data','utility','$location', function(data, utility, $location){
	var vm = this;
	vm.urlField = {'text': '', 'placeholder': 'Paste your next item URL here'};
	vm.data = data;
	vm.siteState = data.siteState;
	vm.pbInputIsShown = false;

	var isValidURL = function(str) {
		if (str.indexOf('amazon.com') != -1) {
			return true;
		} else if (str.indexOf('forever21.com') != -1) {
			return true;
		}
		return false;
	};

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
