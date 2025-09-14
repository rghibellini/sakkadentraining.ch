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
    echo json_encode(['success' => false, 'message' => 'DB connection failed', 'error' => $e->getMessage()]);
    exit;
}

$profileId = $_GET['profile_id'] ?? null;

if (!$profileId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing profileId']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM sessions WHERE profile_id = ? ORDER BY start_time DESC");
    $stmt->execute([$profileId]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode trial data and add as 'trials' array
    foreach ($sessions as &$session) {
        // Leave $session['data'] untouched
        $session['trials'] = []; // optional: add empty trials array for fallback
    } 

    echo json_encode(['success' => true, 'sessions' => $sessions]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error retrieving sessions', 'error' => $e->getMessage()]);
}
