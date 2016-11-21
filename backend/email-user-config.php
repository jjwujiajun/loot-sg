<?php
	
	if($email_dev) {
        $mail->addAddress('will@loot.sg', $userInfo['firstName'] + ' ' + $userInfo['lastName']);
    } else {
        $mail->addAddress($userInfo['email'], $userInfo['firstName'] + ' ' + $userInfo['lastName']);
    }