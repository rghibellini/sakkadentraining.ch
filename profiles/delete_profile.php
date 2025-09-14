<?php
header('Content-Type: application/json');

// Accept only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit;
}

// Decode incoming JSON
$input = json_decode(file_get_contents('php://input'), true);
$profileId = isset($input['id']) ? intval($input['id']) : 0;

if ($profileId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing or invalid profile ID']);
    exit;
}

require_once __DIR__ . '/../db/db.php';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Delete associated sessions
    $stmt1 = $pdo->prepare("DELETE FROM sessions WHERE profile_id = ?");
    $stmt1->execute([$profileId]);

    // 2. Delete the profile itself
    $stmt2 = $pdo->prepare("DELETE FROM profiles WHERE id = ?");
    $stmt2->execute([$profileId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]);
}
?>
