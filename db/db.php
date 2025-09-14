<?php
$db_host = 'localhost';
$db_name = 'a190yu_saccade_users';
$db_user = 'root';
$db_pass = '';

//$db_host = 'a190yu.myd.infomaniak.com';
//$db_name = 'a190yu_saccade_users';
//$db_user = 'a190yu_admin';
//$db_pass = 'x8pLjp2js@wbbp5qBHJz';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'DB connection failed: ' . $conn->connect_error]));
}
?>
