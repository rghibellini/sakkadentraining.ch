<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e->getMessage()]);
    exit;
}

// Expecting { profileId, mode, startTime, endTime, data }
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (
    !$data ||
    !isset($data['profileId']) ||
    !isset($data['mode']) ||
    !isset($data['startTime']) ||
    !isset($data['endTime']) ||
    !isset($data['data']) // now we're saving full session as JSON string
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO sessions (profile_id, mode, start_time, end_time, data)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $data['profileId'],
        $data['mode'],
        $data['startTime'],
        $data['endTime'],
        $data['data'] // already JSON string
    ]);

    echo json_encode(['success' => true, 'sessionId' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving session',
        'error' => $e->getMessage()
    ]);
}
