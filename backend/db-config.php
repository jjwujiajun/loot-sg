<?php
    // DB Constants
    if($db_dev) {
        $db_name  = 'loot_spree_dev';
        $hostname = '52.36.171.235';
        $username = 'loot_dev';
        $password = '0gwqV30rI84kzQlX';
        
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