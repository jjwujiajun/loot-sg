<?php
    include 'config.php';

    // Access gate condition
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        exit();
    }



    // Read POST data
    $json      = file_get_contents('php://input');
    
    $data      = json_decode($json, true);
    $userInfo  = $data['userInfo'];
    $items     = $data['items'];
    $total_usd = $data['orderInfo']['totalUsd'];
    $total_sgd = $data['orderInfo']['totalSgd'];
    $order_id  = $data['orderInfo']['orderId'];
    setlocale(LC_MONETARY, 'en_US');

    // Load and Configure PHPMailer
    require_once("./phpmailer/PHPMailerAutoload.php");

    // Prepare email HTML body
    $emailBody = '
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
        <style type="text/css">
            /*PB*/
            .put-bom-wrapper {
                position: relative;

                margin: 20 auto;

                max-width: 656px;
            }

            .put-bom-wrapper input {
                height: 60px;
            }
            .put-bom-output {
                background: white;

                position: absolute;
                left: 0;
                right: 0;
                z-index: 100;

                white-space: nowrap;

                opacity: 0;
            }
            .put-bom-output.fade{
                opacity: 1;
                transition: all linear 0.4s;
            }
            .pb-pic-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 20%;
                height: 100pt;
            }
            .pb-pic-col img {
                max-height: 100%;
                max-width: 100%;
            }

            .pb-middle-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 64%;
                height: 100pt;
            }
            .middle-col-row {
                height: 33%;
            }
            .pb-item .item-url {
                margin-top: -3px;
                overflow: hidden;

                font-size: 10px;
            }
            .pb-item .item-url a {
                color: gray;
            }
            .pb-item .key {
                display: inline-block;
                padding: 0;

                width: 60px;

                line-height: 30px;
            }
            .pb-item .item-colors {
                display: inline-block;
                width: 70%;
            }
            .pb-item .item-color {
                display: inline-block;

                margin: 0 3px;
                padding: 0;

                min-width: 60px;

                line-height: 30px;
            }
            .pb-item .item-color.selected {
                background: #EBEBEB;
            }
            .pb-item .item-qty {
                display: inline-block;
                width: 25%;
            }
            .pb-item .item-qty input {
                display: inline-block;

                height: 30px;
                width: 50px;
                padding: 0 5px;
                border: none;

                background-color: #EBEBEB;
            }
            .pb-item .item-size {
                display: inline-block;

                line-height: 30px;
                text-align: center;

            }
            .pb-item .circular {
                border-radius: 50%;
                height: 30px;
                width: 30px;

                margin: 0 5px;
            }
            .pb-item .rectangle {
                height: 30px;
                padding: 0 10px;
            }
            .pb-item .item-size.selected {
                background: #EBEBEB;
            }

            .pb-price-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 13%;

                text-align: right;
            }
            /*order form*/
            .orderForm {
                font-family: "Avenir";
                font-weight: 200;
            }

            .header {
                width: 100%;
                background: white;
                text-align: center;
                color: black;
                position: relative;
                padding-top: 15px;
            }

            .logo {
                max-height: 60px;
            }

            .header #header-graphic {
                position: absolute;
                left: 3vw;
                bottom: 0;
                height: 106px;
                width: 119px;
                background: url(../images/Loot%20bags.png) no-repeat
            }

            .header #header-circle {
                padding: 1px;
                vertical-align: middle
            }

            .header .step-num {
                margin: 40px auto 0 auto;

                height: 60px;
                width: 60px;
                background: #fff;
                border: 18px solid #fff;
                border-radius: 50%;
                color: #37cde9;
                font-weight: 400;
                vertical-align: middle;
                font-size: 38px;
                line-height: 27px
            }
            .header p {
                font-size: 23px;
                margin: 13px auto 0
            }

            .personal-message {
                font-family: "Avenir";
                font-weight: 500;
                color: #37cde9;
                font-size: 17px;
                margin-top: 10px;
                margin-bottom: 10px;
                margin-left: 10px;
            }

            .delivery-info {
                margin-left: 10px;
            }
            .delivery-name {
                font-size: 19px;
                font-weight: 500;
            }
            .delivery-contact {
                display: inline-block;
                padding: 0 5px;
            }

            .final-price-calcs table {
                float: right;
            }
            .final-price-calcs table td{
                padding: 0 10px;

            }
            .final-price-calcs table td.value{
                text-align: right;
            }
            .final-price-calcs .final {
                font-size: 30px;
            }
        </style>
    </head>';

    $emailBody .= '
    <body>
        <div class="orderForm">
            <div class="header">
                <div id="header-circle">
                    <img src="http://loot.sg/images/loot-logo-blue.png" class="logo"/>
                    <p>Receipt</p>
                </div>
            </div>
            <hr>

    <!-- User -->
            <div class="put-bom-wrapper">
                <div class="personal-message">Your orders will be delivered to</div>
                <div class="delivery-info delivery-name">' .
                    $userInfo['firstName'] . ' ' . $userInfo['lastName'] . '
                </div>
                <div class="delivery-info">' .
                    $userInfo['addressLine1'] . '<br />' .
                    $userInfo['addressLine2'] . '<br />' .
                    $userInfo['postalCode'] . '
                </div>
                <br />
                <div class="delivery-info">
                    <div class="delivery-contact">
                        <b>Contact </b>' . $userInfo['contact'] . '
                    </div>
                    <div class="delivery-contact">
                        <b>Email </b>' . $userInfo['email'] . '
                    </div>
                </div>
            </div>
    <!-- Items -->
            <div class="put-bom-wrapper">
                <div class="personal-message">Your orders</div>';

    foreach ($items as $item) {
        $emailBody .= '
                <div class="pb-item">
                    <div class="pb-pic-col">
                        <img src="' . $item['imageUrl'] . '" />
                    </div>
                    <div class="pb-middle-col">
                        <div class="middle-col-row row1">
                            <div class="">' . $item['name'] . '</div>
                            <div class="item-url"><a href="' . $item['url'] . '">' . $item['url'] . '</a></div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-colors">
                                <div class="key"><b>Color</b></div>
                                <div class="item-color confirmed-value">' .
                                    $item['color'] . '
                                </div>
                            </div>
                            <div class="item-qty">
                                <div class="key"><b>Quantity</b></div> 
                                <span class="confirmed-value">' .
                                    $item['quantity'] . '
                                </span>
                            </div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-sizes">
                                <div class="key"><b>Size</b></div>
                                <div class="item-size confirmed-value">' .
                                    $item['size'] . '
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pb-price-col">
                        US$ <span class="confirmed-value">' . number_format($item['unitPrice'] * $item['quantity'] / 100.00, 2, '.', ',') . '</span>
                    </div>

                    <!-- Item separator line -->
                    <hr>';
    }

    $emailBody .= '
                </div>

                <div class="final-price-calcs">
                    <table>
                        <tr>
                            <td>Subtotal</td>
                            <td>US$</td>
                            <td class="value">' . number_format($total_usd / 100.00, 2, '.', ',') . '</td>
                        </tr>
                        <tr>
                            <td><b>Total</b></td>
                            <td>S$</td>
                            <td class="value"><span class="final">' . number_format($total_sgd / 100.00, 2, '.', ',') . '</span></td>
                        </tr>
                    </table>
                </div>  
            </div>
        </div> 
    </body>';

    $mail = new PHPMailer();
    $mail->isSendmail();
    $mail->isHTML(true); // Set email format to HTML
    $mail->Body = $emailBody;

    // Set email parameters for user
    $mail->addReplyTo('help@loot.sg', 'Loot'); // Reply to Loot
    $mail->setFrom('help@loot.sg', 'Loot');
    
    // Import user email settings
    include 'email-user-config.php';
    
    $mail->Subject = 'Receipt for your Loot Order. #' . $order_id;
    

    $result = array();

    if($email_on) {
        if(!$mail->send()) {
           $result['error']     = '(C)Message could not be sent.';
           $result['errorBody'] = '(C)Mailer Error: ' . $mail->ErrorInfo;

        } else {
           $result['success']   = '(C)Message has been sent';
        }
    }

    // Initialize new mailer
    $mail = new PHPMailer();
    $mail->isSendmail();
    $mail->isHTML(true);   // Set email format to HTML
    $mail->Body = $emailBody;

    // Set email parameters for team
    $mail->addReplyTo($userInfo['email'], $userInfo['firstName'] + ' ' + $userInfo['lastName']); // Reply to client
    $mail->setFrom('server@loot.sg', 'Loot');

    // Import team email settings
    include 'email-team-config.php';

    $mail->Subject = 'Receipt for Loot Order #' . $order_id;

    if($email_on) {
        if(!$mail->send()) {
           $result['error']     .= ' (T)Message could not be sent.';
           $result['errorBody'] .= ' (T)Mailer Error: ' . $mail->ErrorInfo;

        } else {
           $result['success']   = ' (T)Message has been sent';
        }
    }

    echo json_encode($result);

    /*
    $Name = Trim(stripslashes($_POST['Name'])); 
    $Tel = Trim(stripslashes($_POST['Tel'])); 
    $Email = Trim(stripslashes($_POST['Email'])); 
    $Message = Trim(stripslashes($_POST['Message'])); 
    */
?>
