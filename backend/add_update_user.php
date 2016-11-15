<?php
    include 'config.php';
    include 'db-config.php';

    // Access gate condition
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        exit();
    }
    
    // Read POST data
    $json     = file_get_contents('php://input');
    $data     = json_decode($json, true);
    
    $userInfo = $data['userInfo'];

    $response = array();

    // Logic block
    if($db_on) {
        $return_id          = addUpdateUser($userInfo);
        if($return_id) {
            $response['userId'] = $return_id;    
        }
    }
    
    echo json_encode($response);

    function addUpdateUser($userInfo) {
        global $db, $table_users;

        $first_name     = $userInfo['firstName'];
        $last_name      = $userInfo['lastName'];
        $address_line_1 = $userInfo['addressLine1'];
        $address_line_2 = $userInfo['addressLine2'];
        $postal_code    = $userInfo['postalCode'];
        $contact        = $userInfo['contact'];
        $email          = $userInfo['email'];


        /***************************************************************************
        This solution UPDATEs if exists, INSERTs only if row with email does not
        exist without increase the AUTO_INCREMENT value on each check as opposed to
        INSERT ON DUPLICATE KEY UPDATE which attempts an INSERT operation first
        causing unncecessary increase of the PRIMARY KEY.
        
        Notes:
            1. 'dual' is a default 1-row temporary table created on-the-fly in MySQL
            where col = value = SELECT-ed value.
            2. INSERT INTO SELECT depends on the SELECT-ed table having the exact 
            column order as specified
        ****************************************************************************/
        $update_string = "
        UPDATE $table_users 
            SET first_name = :first_name, last_name = :last_name, address_line_1 = :address_line_1, address_line_2 = :address_line_2, postal_code = :postal_code, contact = :contact
            WHERE email = :email;";

        $insert_string = "
        INSERT INTO $table_users (first_name, last_name, address_line_1, address_line_2, postal_code, contact, email) 
            SELECT :first_name, :last_name, :address_line_1, :address_line_2, :postal_code, :contact, :email FROM dual
                WHERE NOT EXISTS (
                    SELECT * FROM $table_users WHERE email = :email
                );"; 

        $update = $db->prepare($update_string);
        $insert = $db->prepare($insert_string);

        $db->beginTransaction();

        $update->bindParam(':first_name', $first_name, PDO::PARAM_STR);
        $update->bindParam(':last_name', $last_name, PDO::PARAM_STR);
        $update->bindParam(':address_line_1', $address_line_1, PDO::PARAM_STR);
        $update->bindParam(':address_line_2', $address_line_2, PDO::PARAM_STR);
        $update->bindParam(':postal_code', $postal_code, PDO::PARAM_INT);
        $update->bindParam(':contact', $contact, PDO::PARAM_STR);
        $update->bindParam(':email', $email, PDO::PARAM_STR);
        $update->execute();

        $insert->bindParam(':first_name', $first_name, PDO::PARAM_STR);
        $insert->bindParam(':last_name', $last_name, PDO::PARAM_STR);
        $insert->bindParam(':address_line_1', $address_line_1, PDO::PARAM_STR);
        $insert->bindParam(':address_line_2', $address_line_2, PDO::PARAM_STR);
        $insert->bindParam(':postal_code', $postal_code, PDO::PARAM_INT);
        $insert->bindParam(':contact', $contact, PDO::PARAM_STR);
        $insert->bindParam(':email', $email, PDO::PARAM_STR);
        $insert->execute();

        $last_insert_id = $db->lastInsertId();
        $db->commit();
        
        return $last_insert_id;
        // return user_id or 0
    }

?>