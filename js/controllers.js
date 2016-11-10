var mod = angular.module('loot-sg', ['ngRoute']);


mod.service('data', function() {
	// this.items    = [];

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


	this.items    = [
						{name: 'Loot.sg', number: 2, url: 'http://www.loot.sg', quantity: 3, sizes: ['S','M','XL'], size: 'M', colors: ['Black','Blue'], color: 'Black', unitPrice: '0', instructions: 'FRAGILE!', proceedOrder: true, imageUrl: 'test-img.jpg'},
						{name: 'Lootcommerce.com', number: 1, url: 'http://spree.loot.sg', quantity: 2, sizes: ['S','M','XL'], size: 'XL', unitPrice: '1990', colors: ['Black','Blue'], color: 'Rainbow', instructions: 'NOT FRAGILE!', proceedOrder: true,  imageUrl: 'test-img.jpg'}
					];
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
		email: '',
		keepMeUpdated: true
	};


	// this.userInfo = {
	// 	firstName: 'Will',
	// 	lastName: 'Ho',
	// 	addressLine1: '20 Heng Mui Keng Terrace',
	// 	addressLine2: 'D618',
	// 	postalCode: '119618',
	// 	contact: '+65 1234 1234',
	// 	email: 'will@loot.sg',
	// 	keepMeUpdated: true
	// };

	this.orderInfo = {
		totalUsd: 0,
		totalSgd: 0
	};
});


mod.service('utility', ['data', '$http', '$location', '$timeout', '$anchorScroll', function(data, $http, $location, $timeout, $anchorScroll) {
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
			unitPrice: '',
			imageUrl: '',
			sizes: [],
			colors: [],
			details: ''
		};
		data.items.unshift(this.newItem);
		console.log(this.newItem.number);
	};

	this.shouldShowPutBomOutput = true;

	this.scrapeF21 = function(url) {
		var urlString = "https://api.import.io/store/connector/7525a0ab-c857-4f60-8c23-73eb625083de/_query?input=webpage/url:" + encodeURIComponent(url) + "&&_apikey=b34ce8b353894e91b3ef33342f0c5ddb82cce3b3dd7be5b65977ed3fd532f3521d5f3c08c232bafdcc60a719fe799b1b03a95e181771f5bf511f85950dcb7c132b1575addd5fa8c5eeb70645857f693c";
		console.log('scrapeF21 GET: ' + urlString);
		return $http({
			method : 'GET',
			url    : urlString
		}).then(function (result) {
			resultData = result.data;
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
				data.items[0].unitPrice = result.price_sale * 100;
			} else if(result.price_normal) {
				data.items[0].unitPrice = result.price_normal * 100;
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
				console.log('db-user-success');
				return response.data;
			} else {
				console.log('db-user-failure');
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
			} else {
				console.log('db-order-failure');
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
		if(number != 1) {
			return 's';
		}
		return '';
	};

	this.updateTotal = function() {
		sum = 0;
		for (var i = 0; i < data.items.length; i++) {
			sum += data.items[i].unitPrice * data.items[i].quantity;
		}
		data.orderInfo.totalUsd = sum;
	}

	this.preprocessData = function() {
		// Replace blank fields with dashes
		replaceWithDash(data.userInfo);
		for(i = 0; i < data.items.length; i++) {
			replaceWithDash(data.items[i]);
		}
	}

	this.goPageAndAnchorScroll = function(page, anchor) {
		$location.path(page);

		this.shouldShowPutBomOutput = false;

		$timeout(function () {
			$anchorScroll(anchor);

		});

	}
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
	}).when('/faq', {
		controller: 'faqController',
		controllerAs: 'faq',
		templateUrl: 'faq.html'
	}).when('/contacts', {
		controller: 'contactsController',
		controllerAs: 'contacts',
		templateUrl: 'contacts.html'
	})
}
mod.config(routeConfig);

	

mod.controller('homeController', ['data', 'utility','$location', '$anchorScroll', function(data, utility, $location, $anchorScroll){
	var vm  = this;
	vm.data = data;

	vm.urlField = {'text': '', 'placeholder': 'Just copy and paste your item URL here'};
	var firstScrape = true;

	vm.shouldShowPutBomOutput = utility.shouldShowPutBomOutput;

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
		utility.updateTotal();
		$location.path('login');
	}

	vm.scroll = function(anchor){
		$anchorScroll(anchor);
	}

	vm.showPutBom = function(){
		vm.shouldShowPutBomOutput = true;
	}

	vm.hidePutBom = function(){
		vm.shouldShowPutBomOutput = false;
	}

}]);

mod.controller('loginController', ['data', 'utility', '$location', function(data, utility, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

	vm.back = function(){
		$location.path('');
	}

	vm.next = function(){
		utility.login().then(function(response){
			if(response){
				data.userInfo = response;
			}
			$location.path('delivery');
		});
	}

}]);

mod.controller('deliveryController', ['data', 'utility', '$location', function(data, utility, $location){
	var vm = this;
	vm.userInfo = data.userInfo;

	vm.back = function(){
		$location.path('login');
	}

	vm.next = function(){
		utility.addUpdateUser().then(function(response){
			if (data.userInfo.userId == -1){
				data.userInfo.userId = response.userId;	
			} 
			$location.path('confirm');	
		});
	}

}]);

mod.controller('confirmController', ['data', 'utility', '$location', '$window', '$http', function(data, utility, $location, $window, $http){
	var vm = this;
	vm.items        = data.items;
	vm.itemCount    = data.items.length;
	vm.getPlurality = utility.getPlurality;

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
				amount: data.orderInfo.totalUsd,
				token: token.id
			}

			// Send POST request to server
			$http({
				method  : 'POST',
				url     : './backend/stripe.php',
				data    : request,
				headers : {'Content-Type': 'application/json'}
			}).then(function(response){
				// console.log(response);
				if (response.data.success) { //success comes from the return json object
					console.log('charge-success');
					utility.submitOrder();
					utility.preprocessData();
					utility.sendOrderEmail();
					utility.sendReceipt();
					$location.path('done');
				} else {
					console.log('charge-failure');
					console.log(response.data.error);
				}
			});
		
		}
	});

	vm.back = function(){
		$location.path('delivery');
	}

	vm.confirmAndPay = function(){
		handler.open({
			amount: data.orderInfo.totalUsd
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
	vm.pbInputIsShown = false;

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
		utility.updateTotal();
		$location.path('confirm');
	}

	vm.togglePBInput = function () {
		vm.pbInputIsShown = !vm.pbInputIsShown;
	}

}]);

mod.controller('doneController', ['$window', function($window){
	var vm = this;
	
	vm.restart = function(){
		$window.location.href = "./";
	}

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
			'answer': 'If you don’t find an answer below, the Loot team is ready to help! Reach out to us at <a href="mailto:orders@loot.sg">orders@loot.sg</a> - we typically reply within hours ;)'
		},
		{
			'question': 'What stores are eligible for free shipping?',
			'answer': 'Currently, we offer free shipping from Forever21.com (USA) and Amazon.com (USA).'
		},
		{
			'question': 'How does ordering work?',
			'answer': '<p>Ordering is simple with Loot.</p><p>On the home page, paste the website link to the item you want from Amazon or Forever21. Follow our prompts if you’d like to add more items, or to checkout. Provide us with your delivery and billing address, and make payment to complete your checkout!</p>'
		},
		{
			'question': 'Are there any restrictions for items?',
			'answer': '<p>There is no restriction for Forever21.</p><p>There is however some restriction items from Amazon.</p>a) Price: Individual item price must be between US$20 and US$150. <br />b) Weight: The item must weigh below 3 KG i.e. 6.6 lbs - this can be found on the item page in “Shipping Weight”.<p><em>Scenario A:</em> Tom wants to buy 2 pair of shoes on Amazon using Loot. One pair costs $18, the other costs $35. Both pairs weigh 5.5 lbs (2.5 KG) each. In this scenario, only the $35 pair of shoes can be ordered using Loot. Tom should consider getting other pairs of shoes above $20!</p><p><em>Scenario B:</em> Sally wants to buy a chair (20 lbs/ 9 KG) and a handbag (4.4 lbs / 2 KG). Both items cost US$100 on Amazon. In this scenario, the handbag can be ordered using Loot; unfortunately, the chair is too heavy for us to ship for free! Sally should consider adding other items under 3 KG - more handbags perhaps? :)</p>'
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
			'question': 'Can I use a coupon code for Amazon or Forever21?',
			'answer': '<p>Loot’s coupon ninjas automatically find the best prices available - we proactively refund you any savings to your credit card.</p><p>Additionally, we may be able to accommodate coupon codes! Leave a comment under “Additional instructions” when making your order. If your items are eligible for the coupon, expect to see a refund to your credit card within 7 business days :)</p>'
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
			'answer': '<p>Loot helps shoppers save time and money. We make it easy to buy stuff from overseas! Using Loot, simply tell us what you want and we deliver it to you in Singapore for free (yes, free!).</p><p>Loot is a eCommerce startup funded by NUS Enterprise (www.loot.sg). We are currently offering free shipping to Singaporean shoppers ordering from Amazon.com (USA) and Forever21.com (USA). Loot is currently offered exclusively to Carousell and HWZ members.</p><p>With Loot, you’ll never have to worry about hidden charges such as handling or forex fees - prices are quoted upfront in SGD using the latest mid-market forex rates.</p>'
		},
		{
			'question': 'How do you make money?',
			'answer': '<p>Over the past year, our team has been working hard to source the best discounts for you. For the most part, getting stuff from overseas merchants has been a complex process involving freight forwarders or online "sprees" - hardly a simple process!</p><p>We simplify the process of ordering from overseas, and earn a small fee from merchants each time you place an order.</p>'
		}
		]
	}
	]
	
	vm.renderHtml = $sce.trustAsHtml;

	vm.goPageAndAnchorScroll = utility.goPageAndAnchorScroll;

	vm.expandSection = function (section) {
		section.isOpen = !section.isOpen;

		var sectionContent = angular.element('#' + section);
		sectionContent.slideToggle();

	}
}]);

mod.controller('contactsController', ['utility', function(utility) {
	var vm = this;

	vm.goPageAndAnchorScroll = utility.goPageAndAnchorScroll;
}]);
