<?php
    
    if($email_dev) {
        $mail->addAddress('jj@loot.sg');
    } else {
        $mail->addAddress('orders@loot.sg');
    }

