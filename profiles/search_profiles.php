<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['loggedin']) || !$_SESSION['loggedin']) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User ID not found in session']);
    exit;
}
require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$user_id = $_SESSION['user_id'];

if (isset($_GET['profileId'])) {
    $profileId = intval($_GET['profileId']);
    $stmt = $conn->prepare("SELECT id, name, settings FROM profiles WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $profileId, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $profile = $result->fetch_assoc();
    echo json_encode(['success' => true, 'settings' => $profile['settings'], 'profile' => $profile]);
} else {
    $query = $_GET['query'] ?? '';
    $likeQuery = '%' . $query . '%';
    $stmt = $conn->prepare("SELECT id, name FROM profiles WHERE user_id = ? AND name LIKE ?");
    $stmt->bind_param("is", $user_id, $likeQuery);
    $stmt->execute();
    $result = $stmt->get_result();
    $profiles = [];
    while ($row = $result->fetch_assoc()) {
        $profiles[] = $row;
    }
    echo json_encode(['success' => true, 'profiles' => $profiles]);
}

$conn->close();
