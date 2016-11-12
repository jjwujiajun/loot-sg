<?php
    // DB Constants
    if($db_dev) {
        $db_name  = 'loot-sg_dev';
        $hostname = 'ec2-52-34-201-146.us-west-2.compute.amazonaws.com';
        $username = 'loot-sg_dev';
        $password = '0EaX4SgkSAS0ZHng';
        
    } else {
        $db_name  = 'loot-sg';
        $hostname = '127.0.0.1';
        $username = 'loot-sg';
        $password = 'ijjvZLQHJ2yjdrAH';
        
    }

    // DB Constants
    $table_users     = 'users';
    $table_orders    = 'orders';
    $table_items     = 'items';
    
    // Connect to the DB
    $db = new PDO("mysql:host=$hostname;dbname=$db_name", $username, $password);
?>