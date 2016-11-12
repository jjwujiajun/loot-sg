<?php
	require_once('./stripe-php-4.1.1/init.php');

	// Set your secret key: remember to change this to your live secret key in production
	// See your keys here: https://dashboard.stripe.com/account/apikeys
	\Stripe\Stripe::setApiKey("sk_test_FnJ4cAEkJPjdjevU1pOnt0uf");

	// Get the credit card details submitted by the form
	$json     = file_get_contents('php://input');
    $request  = json_decode($json, true);
    $response = [];

	// Create a charge: this will charge the user's card
	try {
		$charge = \Stripe\Charge::create(array(
	    	"amount" => $request['amount'], // Amount in cents
	    	"currency" => "usd",
	    	"source" => $request['token']
	    ));
		$response['success'] = true;
	} catch(\Stripe\Error\Card $e) {
	  	// The card has been declined
		$response['success'] = false;
		$response['error']  = $e;
	}

	echo json_encode($response);