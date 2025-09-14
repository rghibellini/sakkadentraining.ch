<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['available' => false, 'message' => 'Database connection failed']);
    exit;
}

$username = $_GET['username'] ?? '';
if (empty($username)) {
    echo json_encode(['available' => false, 'message' => 'Username is required']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['available' => false]);
} else {
    echo json_encode(['available' => true]);
}
$stmt->close();
$conn->close();
?>