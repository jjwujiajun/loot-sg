<?php
    $json = '{
      "userInfo": {
        "firstName": "first",
        "lastName": "last",
        "addressLine1": "addr1",
        "addressLine2": "#12-34",
        "postalCode": "poster",
        "contact": "91506620",
        "email": "jjwu.jiajun@gmail.com",
        "keepMeUpdated": "-"
      },
      "items": [
        {
          "number": 1,
          "name": "Let It Snow Holiday Sweater",
          "url": "http:\/\/www.forever21.com\/Product\/Product.aspx?BR=f21&Category=promo-holiday-shop-sweaters&ProductID=2000232287&VariantID=",
          "quantity": 1,
          "size": "S",
          "color": "Red\/cream",
          "instructions": "1stinstrsuction",
          "proceedOrder": true,
          "unitPrice": 2290,
          "imageUrl": "http:\/\/www.forever21.com\/images\/default_750\/00232287-01.jpg",
          "sizes": [
            "S",
            "M",
            "L"
          ],
          "colors": [
            "Red\/cream"
          ],
          "details": "A midweight knit sweater featuring a \"Let It Snow\" graphic on the chest, a mixed snowflake print along the front and sleeves, sequined snowflake appliques, a crew neckline, long sleeves, and ribbed trim.",
          "$$hashKey": "object:4"
        },
        {
          "number": 2,
          "name": "Happy Face Plush PJ Jumpsuit",
          "url": "http:\/\/www.forever21.com\/Product\/Product.aspx?BR=f21&Category=intimates_loungewear-sets&ProductID=2000230649&VariantID=",
          "quantity": 2,
          "size": "M",
          "color": "Red\/white",
          "instructions": "2instrcution",
          "proceedOrder": true,
          "unitPrice": 2490,
          "imageUrl": "http:\/\/www.forever21.com\/images\/default_750\/00230649-03.jpg",
          "sizes": [
            "XS",
            "S",
            "M",
            "L"
          ],
          "colors": [
            "Red\/white",
            "Black\/yellow"
          ],
          "details": "A plush PJ jumpsuit featuring an allover happy face print, a hoodie, zipper front, and a kangaroo pocket.",
          "$$hashKey": "object:6"
        }
      ],
      "orderInfo": {
        "totalUsd": "7270"
      }
    }';

    $formData     = json_decode($json, true);
    $userInfo     = $formData['userInfo'];
    $items        = $formData['items'];
    $total_usd    = $formData['orderInfo']['totalUsd'];

    $emailBody = '
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
        <style type="text/css">
            /*PB*/
            .put-bom-wrapper {
                position: relative;

                margin: 20 auto;

                max-width: 656px;
            }

            .put-bom-wrapper input {
                height: 60px;
            }
            .put-bom-output {
                background: white;

                position: absolute;
                left: 0;
                right: 0;
                z-index: 100;

                white-space: nowrap;

                opacity: 0;
            }
            .put-bom-output.fade{
                opacity: 1;
                transition: all linear 0.4s;
            }
            .pb-pic-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 20%;
                height: 100pt;
            }
            .pb-pic-col img {
                max-height: 100%;
                max-width: 100%;
            }

            .pb-middle-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 64%;
                height: 100pt;
            }
            .middle-col-row {
                height: 33%;
            }
            .pb-item .item-url {
                margin-top: -3px;
                overflow: hidden;

                font-size: 10px;
            }
            .pb-item .item-url a {
                color: gray;
            }
            .pb-item .key {
                display: inline-block;
                padding: 0;

                width: 60px;

                line-height: 30px;
            }
            .pb-item .item-colors {
                display: inline-block;
                width: 70%;
            }
            .pb-item .item-color {
                display: inline-block;

                margin: 0 3px;
                padding: 0;

                min-width: 60px;

                line-height: 30px;
            }
            .pb-item .item-color.selected {
                background: #EBEBEB;
            }
            .pb-item .item-qty {
                display: inline-block;
                width: 25%;
            }
            .pb-item .item-qty input {
                display: inline-block;

                height: 30px;
                width: 50px;
                padding: 0 5px;
                border: none;

                background-color: #EBEBEB;
            }
            .pb-item .item-size {
                display: inline-block;

                line-height: 30px;
                text-align: center;

            }
            .pb-item .circular {
                border-radius: 50%;
                height: 30px;
                width: 30px;

                margin: 0 5px;
            }
            .pb-item .rectangle {
                height: 30px;
                padding: 0 10px;
            }
            .pb-item .item-size.selected {
                background: #EBEBEB;
            }

            .pb-price-col {
                display: inline-block;
                vertical-align: top;

                position: relative;
                width: 13%;

                text-align: right;
            }
            /*order form*/
            .orderForm {
                font-family: "Avenir";
                font-weight: 200;
            }

            .header {
                width: 100%;
                background: white;
                text-align: center;
                color: black;
                position: relative;
                padding-top: 15px;
            }

            .logo {
                max-height: 60px;
            }

            .header #header-graphic {
                position: absolute;
                left: 3vw;
                bottom: 0;
                height: 106px;
                width: 119px;
                background: url(../images/Loot%20bags.png) no-repeat
            }

            .header #header-circle {
                padding: 1px;
                vertical-align: middle
            }

            .header .step-num {
                margin: 40px auto 0 auto;

                height: 60px;
                width: 60px;
                background: #fff;
                border: 18px solid #fff;
                border-radius: 50%;
                color: #37cde9;
                font-weight: 400;
                vertical-align: middle;
                font-size: 38px;
                line-height: 27px
            }
            .header p {
                font-size: 23px;
                margin: 13px auto 0
            }

            .personal-message {
                font-family: "Avenir";
                font-weight: 500;
                color: #37cde9;
                font-size: 17px;
                margin-top: 10px;
                margin-bottom: 10px;
                margin-left: 10px;
            }

            .delivery-info {
                margin-left: 10px;
            }
            .delivery-name {
                font-size: 19px;
                font-weight: 500;
            }
            .delivery-contact {
                display: inline-block;
                padding: 0 5px;
            }

            .final-price-calcs table {
                float: right;
            }
            .final-price-calcs table td{
                padding: 0 10px;

            }
            .final-price-calcs table td.value{
                text-align: right;
            }
            .final-price-calcs .final {
                font-size: 30px;
            }
        </style>
    </head>';

    $emailBody .= '
    <body>
        <div class="orderForm">
            <div class="header">
                <div id="header-circle">
                    <img src="http://loot.sg/images/loot-logo-blue.png" class="logo"/>
                    <p>Receipt</p>
                </div>
            </div>
            <hr>

    <!-- User -->
            <div class="put-bom-wrapper">
                <div class="personal-message">Your orders will be delivered to</div>
                <div class="delivery-info delivery-name">' .
                    $userInfo['firstName'] . ' ' . $userInfo['lastName'] . '
                </div>
                <div class="delivery-info">' .
                    $userInfo['addressLine1'] . '<br />' .
                    $userInfo['addressLine2'] . '<br />' .
                    $userInfo['postalCode'] . '
                </div>
                <br />
                <div class="delivery-info">
                    <div class="delivery-contact">
                        <b>Contact </b>' . $userInfo['contact'] . '
                    </div>
                    <div class="delivery-contact">
                        <b>Email </b>' . $userInfo['email'] . '
                    </div>
                </div>
            </div>
    <!-- Items -->
            <div class="put-bom-wrapper">
                <div class="personal-message">Your orders</div>';

    foreach ($items as $item) {
        $emailBody .= '
                <div class="pb-item">
                    <div class="pb-pic-col">
                        <img src="' . $item['imageUrl'] . '" />
                    </div>
                    <div class="pb-middle-col">
                        <div class="middle-col-row row1">
                            <div class="">' . $item['name'] . '</div>
                            <div class="item-url"><a href="' . $item['url'] . '">' . $item['url'] . '</a></div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-colors">
                                <div class="key"><b>Color</b></div>
                                <div class="item-color confirmed-value">' .
                                    $item['color'] . '
                                </div>
                            </div>
                            <div class="item-qty">
                                <div class="key"><b>Quantity</b></div> 
                                <span class="confirmed-value">' .
                                    $item['quantity'] . '
                                </span>
                            </div>
                        </div>
                        <div class="middle-col-row row2">
                            <div class="item-sizes">
                                <div class="key"><b>Size</b></div>
                                <div class="item-size confirmed-value">' .
                                    $item['size'] . '
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pb-price-col">
                        US$ <span class="confirmed-value">' . number_format($item['unitPrice'] / 100.00, 2, '.', ',') . '</span>
                    </div>

                    <!-- Item separator line -->
                    <hr>';
    }

    $emailBody .= '
                </div>

                <div class="final-price-calcs">
                    <table>
                        <tr>
                            <td>Subtotal</td>
                            <td>US$</td>
                            <td class="value">' . number_format($total_usd / 100.00, 2, '.', ',') . '</td>
                        </tr>
                        <tr>
                            <td><b>Total</b></td>
                            <td>S$</td>
                            <td class="value"><span class="final">' . number_format($total_usd / 100.00, 2, '.', ',') . '</span></td>
                        </tr>
                    </table>
                </div>  
            </div>
        </div> 
    </body>';

    echo $emailBody;

?>