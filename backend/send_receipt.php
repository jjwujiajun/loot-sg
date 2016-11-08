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
    // Prepare email HTML body
    // $emailBody = file_get_contents('./receipt_template.php');

    $mail->Body    = $emailBody;
    $mail->addReplyTo('help@loot.sg', 'Loot'); // Reply to Loot
    $mail->setFrom('help@loot.sg', 'Loot');
    if($email_dev) {
        $mail->AddAddress('will@loot.sg', 'Will');
    } else {
        $mail->AddAddress($userInfo['email'], $userInfo['firstName'] + ' ' + $userInfo['lastName']);    
    }
    $mail->Subject = 'Your Loot Receipt';
    

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