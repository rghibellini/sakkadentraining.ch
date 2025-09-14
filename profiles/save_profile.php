<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

// === DB CONNECTION ===
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed', 'error' => $e->getMessage()]);
    exit;
}

// === VALIDATE SESSION USER ===
if (!isset($_SESSION['loggedin']) || !$_SESSION['loggedin'] || !isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// === READ REQUEST DATA ===
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['name']) || !isset($data['settings'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing name or settings']);
    exit;
}

$name = trim($data['name']);
$settings = json_encode($data['settings'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// === CHECK IF PROFILE EXISTS ===
try {
    $stmt = $pdo->prepare("SELECT id FROM profiles WHERE name = ? AND user_id = ?");
    $stmt->execute([$name, $user_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // === UPDATE EXISTING PROFILE ===
        $stmt = $pdo->prepare("UPDATE profiles SET settings = ? WHERE id = ?");
        $stmt->execute([$settings, $existing['id']]);
        $profileId = $existing['id'];
    } else {
        // === INSERT NEW PROFILE ===
        $stmt = $pdo->prepare("INSERT INTO profiles (name, settings, user_id) VALUES (?, ?, ?)");
        $stmt->execute([$name, $settings, $user_id]);
        $profileId = $pdo->lastInsertId();
    }

    echo json_encode(['success' => true, 'profile' => ['id' => $profileId, 'name' => $name]]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Saving failed', 'error' => $e->getMessage()]);
}
