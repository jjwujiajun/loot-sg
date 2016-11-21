<?php
    
    if($email_dev) {
        $mail->addAddress('will@loot.sg');
    } else {
        $mail->addAddress('orders@loot.sg');
    }

