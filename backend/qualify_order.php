<?php
    include 'config.php';
    include 'db-config.php';

    // Access gate condition
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        exit();
    }
    
    // Read POST data
    $json      = file_get_contents('php://input');
    $data      = json_decode($json, true);
    
	$orders_id = $data['orderId'];
    
    $result    = array();

    // Logic block
    if($db_on) {
        $result['orderId'] = qualifyOrder($orders_id);
    } 

    echo json_encode($result);
    
    function qualifyOrder($orders_id) {
        global $db, $table_orders;
        $query_string = "UPDATE $table_orders SET paid = 1 WHERE orders_id = :orders_id;";
        $query = $db->prepare($query_string);
        $query->bindParam(':orders_id', $orders_id, PDO::PARAM_INT);
        $query->execute();

        return $db->lastInsertId();
        // return orders_id
    }

?>