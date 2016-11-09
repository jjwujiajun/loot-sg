<?php
    include 'config.php';
    include 'db-config.php';

    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        exit();
    }
    
    // Read POST data
    $json            = file_get_contents('php://input');
    $data            = json_decode($json, true);
    
    $userInfo        = $data['userInfo'];

    $response = array();

    // Logic block
    if($db_on) {
        $return_id = addUser($userInfo);

        $response['userId'] = $return_id;
    }
    
    echo json_encode($response);

    function addUpdateUser($userInfo) {
        global $db, $table_users;

        $users_id        = $userInfo['userId'];
        $first_name      = $userInfo['firstName'];
        $last_name       = $userInfo['lastName'];
        $address_line_1  = $userInfo['addressLine1'];
        $address_line_2  = $userInfo['addressLine2'];
        $postal_code     = $userInfo['postalCode'];
        $contact         = $userInfo['contact'];
        $email           = $userInfo['email'];
        $keep_updated    = $userInfo['keepMeUpdated'];

        $query_string = "INSERT INTO $table_users (users_id, first_name, last_name, address_line_1, address_line_2, postal_code, contact, email, keep_updated) VALUES (:users_id, :first_name, :last_name, :address_line_1, :address_line_2, :postal_code, :contact, :email, :keep_updated) 
        ON DUPLICATE KEY UPDATE first_name = :first_name, last_name = :last_name, address_line_1 = :address_line_1, address_line_2 = :address_line_2, postal_code = :postal_code, contact = :contact, keep_updated = :keep_updated";
        $query = $db->prepare($query_string);
        $query->bindParam(':users_id', $users_id, PDO::PARAM_INT);
        $query->bindParam(':first_name', $first_name, PDO::PARAM_STR);
        $query->bindParam(':last_name', $last_name, PDO::PARAM_STR);
        $query->bindParam(':address_line_1', $address_line_1, PDO::PARAM_STR);
        $query->bindParam(':address_line_2', $address_line_2, PDO::PARAM_STR);
        $query->bindParam(':postal_code', $postal_code, PDO::PARAM_INT);
        $query->bindParam(':contact', $contact, PDO::PARAM_STR);
        $query->bindParam(':email', $email, PDO::PARAM_STR);
        $query->bindParam(':keep_updated', $keep_updated, PDO::PARAM_BOOL);
        $query->execute();

        return $db->lastInsertId();
        // return user_id
    }

?>