<?php
    include 'config.php';

    // Access gate condition
    // if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    //     exit();
    // }



    // Read POST data
    // $json       = file_get_contents('php://input');
    $json = '{
      "userInfo": {
        "firstName": "first",
        "lastName": "last",
        "addressLine1": "addr1",
        "addressLine2": "#12-34",
        "postalCode": "poster",
        "contact": "91506620",
        "email": "jjwu.jiajun@gmail.com",
        "keepMeUpdated": "-"
      },
      "items": [
        {
          "number": 1,
          "name": "Let It Snow Holiday Sweater",
          "url": "http:\/\/www.forever21.com\/Product\/Product.aspx?BR=f21&Category=promo-holiday-shop-sweaters&ProductID=2000232287&VariantID=",
          "quantity": 1,
          "size": "S",
          "color": "Red\/cream",
          "instructions": "1stinstrsuction",
          "proceedOrder": true,
          "listPrice": 22.9,
          "imageUrl": "http:\/\/www.forever21.com\/images\/default_750\/00232287-01.jpg",
          "sizes": [
            "S",
            "M",
            "L"
          ],
          "colors": [
            "Red\/cream"
          ],
          "details": "A midweight knit sweater featuring a \"Let It Snow\" graphic on the chest, a mixed snowflake print along the front and sleeves, sequined snowflake appliques, a crew neckline, long sleeves, and ribbed trim.",
          "$$hashKey": "object:4"
        },
        {
          "number": 2,
          "name": "Happy Face Plush PJ Jumpsuit",
          "url": "http:\/\/www.forever21.com\/Product\/Product.aspx?BR=f21&Category=intimates_loungewear-sets&ProductID=2000230649&VariantID=",
          "quantity": 2,
          "size": "M",
          "color": "Red\/white",
          "instructions": "2instrcution",
          "proceedOrder": true,
          "listPrice": 24.9,
          "imageUrl": "http:\/\/www.forever21.com\/images\/default_750\/00230649-03.jpg",
          "sizes": [
            "XS",
            "S",
            "M",
            "L"
          ],
          "colors": [
            "Red\/white",
            "Black\/yellow"
          ],
          "details": "A plush PJ jumpsuit featuring an allover happy face print, a hoodie, zipper front, and a kangaroo pocket.",
          "$$hashKey": "object:6"
        }
      ],
      "orderInfo": {
        "coupon": "-",
        "deliveryOption": "Self Pickup",
        "deliveryCost": "-"
      }
    }';

    $formData   = json_decode($json, true);

    $userInfo   = $formData['userInfo'];
    $items      = $formData['items'];
    $orderInfo  = $formData['orderInfo'];
    $total_sum = 0;
    foreach ($items as $item) {
        $total_sum = $total_sum + $item['listPrice'];
    }

    // Load and Configure PHPMailer
    require_once("phpmailer/PHPMailerAutoload.php");

    $mail = new PHPMailer();

    $mail->IsSMTP();
    $mail->Host       = "smtp.gmail.com";      // sets GMAIL as the SMTP server
    $mail->SMTPAuth   = true;                  // enable SMTP authentication
    $mail->Username   = "spam2me2u@gmail.com"; // GMAIL username
    $mail->Password   = "!q2w3e4r%t";          // GMAIL password
    $mail->SMTPSecure = "tls";                 // sets the prefix to the servier
    $mail->Port       = 587;                   // set the SMTP port for the GMAIL server

    $mail->addReplyTo($userInfo['email'], 'User'); // Reply to User
    $mail->setFrom('spree.server@loot.sg', 'spree@Loot.sg');
    if($email_dev) {
        $mail->AddAddress('will@loot.sg', 'Will');
    } else {
        $mail->AddAddress('orders@loot.sg', 'Orders');    
    }

    $mail->SMTPDebug   = 0; // Change to 0 for production
    $mail->Debugoutput = 'html';
    $mail->isHTML(true);                                  // Set email format to HTML

    // prepare email body text
    // $emailBody = '
        // <head>
        //     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        //     <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
        //     <style type="text/css">
        //         .header p {
        //             font-family: "Avenir";
        //             font-size: 23px;
        //             margin: auto;
        //         }
        //         .header {
        //           width: 100%;
        //           display: table;
        //           background: #39cde9;
        //           text-align: center;
        //           color: white;
        //           margin-bottom: 60px;
        //         }
        //     </style>
        // </head>
    //     ';

    //     $emailBody .= '	<body>

    //                         <div class="header">
    //                             <p>Incoming Order!</p>
    //                         </div>

    //                         <h1>Particulars</h1>
    //                         <table class="table">';


    // foreach ($userInfo as $field => $value) {

    //     $emailBody .= '	<tr>
    //                         <td>' . $field . '</td>' . '
    //                         <td>' . $value . '</td>
    //                     </tr>';
    // }

    // $emailBody .= '	</table>
    //                 <h1>Orders</h1>';

    // foreach ($items as $item) {
    //     $emailBody .= '<h2>Order #' . $item['number'] . '</h2>'; 
    //     $emailBody .= '<table class="table">';
    //     foreach ($item as $key => $value) {
    //         $keyInForm = ucfirst($key);
    //         if ($key == 'proceedOrder') {
    //             $keyInForm = 'Proceed orders if out of stock?';
    //         }

    //         $emailBody .= '
    //                     <tr>
    //                         <td>' . $keyInForm . '</td>
    //                         <td>' . $value . '</td>
    //                     </tr>
    //                     ';
    //     }
    //     $emailBody .= '</table>';
    // }

    // $emailBody .= '<p>Coupon: ' . $orderInfo['coupon'] . '</p>';
    // $emailBody .= '<p>Delivery Option: ' . $orderInfo['deliveryOption'] . '</p>';
    // $emailBody .= '<p>Delivery Cost: $' . number_format((float)$orderInfo['deliveryCost'], 2) . '</p>';

    // $emailBody .= "* Reply to this email to respond to the client.";
    // $emailBody .= '</body></html>';

    $mail->Subject = 'Your Loot Receipt';
    $mail->Body    = $emailBody;

    $result = array();

    // if($email_on) {
    //     if(!$mail->send()) {
    //        $result['error']     = 'Message could not be sent.';
    //        $result['errorBody'] = 'Mailer Error: ' . $mail->ErrorInfo;

    //     } else {
    //        $result['success']   = 'Message has been sent';

    //     }

    //     echo json_encode($result);
    // } else {
    //     echo $json_encode(array());

    // }



    /*
    $Name = Trim(stripslashes($_POST['Name'])); 
    $Tel = Trim(stripslashes($_POST['Tel'])); 
    $Email = Trim(stripslashes($_POST['Email'])); 
    $Message = Trim(stripslashes($_POST['Message'])); 
    */
?>
<html>
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
                font-family: 'Avenir';
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
                font-family: 'Avenir';
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
    </head>

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
                <div class="delivery-info delivery-name"><?php echo $userInfo['firstName'] . ' ' . $userInfo['lastName'] ;?></div>
                <div class="delivery-info">
                    <?php echo $userInfo['addressLine1'] ;?><br />
                    <?php echo $userInfo['addressLine2'] ;?><br />
                    <?php echo $userInfo['postalCode'] ;?>
                </div>
                <br />
                <div class="delivery-info">
                    <div class="delivery-contact">
                        <b>Contact</b> <?php echo $userInfo['contact'] ;?>
                    </div>
                    <div class="delivery-contact">
                        <b>Email</b> <?php echo $userInfo['email'] ;?>
                    </div>
                </div>
            </div>
<!-- Items -->
            <div class="put-bom-wrapper">
                <div class="personal-message">Your orders</div>

            <?php foreach ($items as $item) { ?>
                <div class="pb-item">
                    <div class="pb-pic-col">
                        <img src="<?php echo $item['imageUrl']; ?>" />
                    </div>
                    <div class="pb-middle-col">
                        <div class="middle-col-row row1">
                            <div class=""><?php echo $item['name']; ?></div>
                            <div class="item-url"><a href="<?php echo $item['url'] ?>"><?php echo $item['url']; ?></a></div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-colors">
                                <div class="key"><b>Color</b></div>
                                <div class="item-color confirmed-value">
                                    <?php echo $item['color']; ?>
                                </div>
                            </div>
                            <div class="item-qty">
                                <div class="key"><b>Quantity</b></div> 
                                <span class="confirmed-value">
                                    <?php echo $item['quantity']; ?>
                                </span>
                            </div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-sizes">
                                <div class="key"><b>Size</b></div>
                                <div class="item-size confirmed-value">
                                    <?php echo $item['size']; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pb-price-col">
                        $ <span class="confirmed-value"><?php echo $item['listPrice']; ?></span>
                    </div>

                    <!-- Item separator line -->
                    <hr>
                 <?php }; ?>
                </div>

                <div class="final-price-calcs">
                    <table>
                        <tr>
                            <td>Subtotal</td>
                            <td>US$</td>
                            <td class="value"><?php echo $total_sum; ?></td>
                        </tr>
                        <tr>
                            <td><b>Total</b></td>
                            <td>S$</td>
                            <td class="value"><span class="final"><?php echo $total_sum; ?></span></td>
                        </tr>
                    </table>

                </div>
                
            </div>
        </div>
            
    </body>
</html>