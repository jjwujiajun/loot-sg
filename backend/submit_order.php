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
    
    $users_id  = $data['userInfo']['userId'];
    $total_usd = $data['orderInfo']['totalUsd'];
    $total_sgd = $data['orderInfo']['totalSgd'];
    $usd_sgd   = $data['orderInfo']['usdSgd'];
    
    $items     = $data['items'];
    
    $result    = array();

    // Logic block
    if($db_on) {
        $orders_id = addOrder($users_id, $total_usd, $total_sgd);
        addItems($items, $orders_id);

        $result['orderId'] = $orders_id;    
    } 

    echo json_encode($result);
    
    function addOrder($users_id, $total_usd, $total_sgd) {
        global $db, $table_orders;
        $query_string = "INSERT INTO $table_orders (users_id, total_usd, total_sgd, usd_sgd) VALUES (:users_id, :total_usd, :total_sgd, :usd_sgd);";
        $query = $db->prepare($query_string);
        $query->bindParam(':users_id', $users_id, PDO::PARAM_INT);
        $query->bindParam(':total_usd', $total_usd, PDO::PARAM_INT);
        $query->bindParam(':total_sgd', $total_sgd, PDO::PARAM_INT);
        $query->bindParam(':usd_sgd', $usd_sgd, PDO::PARAM_INT);
        $query->execute();

        return $db->lastInsertId();
        // return orders_id
    }


    function addItems($items, $orders_id) {
        global $db, $table_items;
        $query_string = "INSERT INTO $table_items (orders_id, number, name, url, image_url, quantity, size, color, unit_price, instructions, proceed) VALUES (:orders_id, :number, :name, :url, :image_url, :quantity, :size, :color, :unit_price, :instructions, :proceed);";
        $db->beginTransaction();
        $query = $db->prepare($query_string);

        foreach ($items as $item) {
            $query->bindParam(':orders_id', $orders_id, PDO::PARAM_INT);
            $query->bindParam(':number', $item['number'], PDO::PARAM_INT);
            $query->bindParam(':name', $item['name'], PDO::PARAM_STR);
            $query->bindParam(':url', $item['url'], PDO::PARAM_STR);
            $query->bindParam(':image_url', $item['imageUrl'], PDO::PARAM_STR);
            $query->bindParam(':quantity', $item['quantity'], PDO::PARAM_INT);
            $query->bindParam(':size', $item['size'], PDO::PARAM_STR);
            $query->bindParam(':color', $item['color'], PDO::PARAM_STR);
            $query->bindParam(':unit_price', $item['unitPrice'], PDO::PARAM_INT);
            $query->bindParam(':instructions', $item['instructions'], PDO::PARAM_STR);
            $query->bindParam(':proceed', $item['proceedOrder'], PDO::PARAM_BOOL); // NOTE different naming
            $query->execute();
        }

        $db->commit();
    }

?>