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

    $formData     = json_decode($json, true);
    $userInfo     = $formData['userInfo'];
    $items        = $formData['items'];
    $orderInfo    = $formData['orderInfo'];

    $total_sum = 0;
    foreach ($items as $item) {
        $total_sum = $total_sum + $item['listPrice'];
    }

    // Load and Configure PHPMailer
    require_once("./phpmailer/PHPMailerAutoload.php");

    $mail = new PHPMailer();

    $mail->IsSendmail();

    $mail->addReplyTo('help@loot.sg', 'Loot'); // Reply to Loot
    $mail->setFrom('help@loot.sg', 'Loot');
    if($email_dev) {
        $mail->AddAddress('will@loot.sg', 'Will');
    } else {
        $mail->AddAddress($userInfo['email'], $userInfo['firstName'] + ' ' + $userInfo['lastName']);    
    }

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
    <?php include 'receipt_template.php'; ?>
</html>