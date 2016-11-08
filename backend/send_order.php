<?php
    include 'config.php';

    // Access gate condition
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        exit();
    }

    // Read POST data
    $json       = file_get_contents('php://input');
    $formData   = json_decode($json, true);

    $userInfo   = $formData['userInfo'];
    $items      = $formData['items'];

    // Load and Configure PHPMailer
    require_once("./phpmailer/PHPMailerAutoload.php");

    $mail = new PHPMailer();

    $mail->IsSendmail();
    $mail->addReplyTo($userInfo['email'], $userInfo['firstName'] + ' ' + $userInfo['lastName']); // Reply to User
    $mail->setFrom('server@loot.sg', 'Loot');
    if($email_dev) {
        $mail->AddAddress('will@loot.sg', 'Will');
    } else {
        $mail->AddAddress('orders@loot.sg', 'Orders');    
    }

    $mail->isHTML(true);                                  // Set email format to HTML

    // prepare email body text
    $emailBody = '
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
            <style type="text/css">
                .header p {
                    font-family: "Avenir";
                    font-size: 23px;
                    margin: auto;
                }
                .header {
                  width: 100%;
                  display: table;
                  background: #39cde9;
                  text-align: center;
                  color: white;
                  margin-bottom: 60px;
                }
            </style>
        </head>
        ';

        $emailBody .= '	<body>

                            <div class="header">
                                <p>Incoming Order!</p>
                            </div>

                            <h1>Particulars</h1>
                            <table class="table">';


    foreach ($userInfo as $field => $value) {

        $emailBody .= '	<tr>
                            <td>' . $field . '</td>' . '
                            <td>' . $value . '</td>
                        </tr>';
    }

    $emailBody .= '	</table>
                    <h1>Orders</h1>';

    foreach ($items as $item) {
        $emailBody .= '<h2>Order #' . $item['number'] . '</h2>'; 
        $emailBody .= '<table class="table">';
        foreach ($item as $key => $value) {
            $keyInForm = ucfirst($key);
            if ($key == 'proceedOrder') {
                $keyInForm = 'Proceed orders if out of stock?';
            }

            $emailBody .= '
                        <tr>
                            <td>' . $keyInForm . '</td>
                            <td>' . $value . '</td>
                        </tr>
                        ';
        }
        $emailBody .= '</table>';
    }

    $emailBody .= "* Reply to this email to respond to the client.";
    $emailBody .= '</body></html>';

    $mail->Subject = 'Loot Order';
    $mail->Body    = $emailBody;

    $result = array();

    if($email_on) {
        if(!$mail->send()) {
           $result['error']     = 'Message could not be sent.';
           $result['errorBody'] = 'Mailer Error: ' . $mail->ErrorInfo;

        } else {
           $result['success']   = 'Message has been sent';

        }

        echo json_encode($result);
    } else {
        echo $json_encode(array());

    }



    /*
    $Name = Trim(stripslashes($_POST['Name'])); 
    $Tel = Trim(stripslashes($_POST['Tel'])); 
    $Email = Trim(stripslashes($_POST['Email'])); 
    $Message = Trim(stripslashes($_POST['Message'])); 
    */
?>