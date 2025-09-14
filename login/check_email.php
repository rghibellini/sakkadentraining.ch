<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['available' => false, 'message' => 'Database connection failed']);
    exit;
}

$email = $_GET['email'] ?? '';
if (empty($email)) {
    echo json_encode(['available' => false, 'message' => 'Email is required']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
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