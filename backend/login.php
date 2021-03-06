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
    $email    = $data['email'];
    $response = array();

    // Logic block
    if($db_on) {
        $user = getUser($email);

        if($user) {
            $response['userId']        = $user['users_id'];
            $response['firstName']     = $user['first_name'];
            $response['lastName']      = $user['last_name'];
            $response['addressLine1']  = $user['address_line_1'];
            $response['addressLine2']  = $user['address_line_2'];
            $response['postalCode']    = $user['postal_code'];
            $response['contact']       = $user['contact'];
            $response['email']         = $user['email'];
        }
    }

    echo json_encode($response);
    
    function getUser($email) {
        global $db, $table_users;
        $query_string = "SELECT * FROM $table_users WHERE email = :email;";
        $query = $db->prepare($query_string);
        $query->bindParam(':email', $email, PDO::PARAM_STR);
        $query->execute();
        $result = $query->fetch(PDO::FETCH_ASSOC); // Returns false if no results

        return $result;
        // return user_id or false
    }
?>