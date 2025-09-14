<?php
header('Content-Type: application/json');

// DB connection (adjust path as needed)
require_once '../db/db.php';

$profileId = $_GET['profile_id'] ?? null;
$mode = $_GET['mode'] ?? null;
$dateFrom = $_GET['date_from'] ?? null;
$dateTo = $_GET['date_to'] ?? null;

if (!$profileId) {
    echo json_encode(['success' => false, 'message' => 'Missing profile_id']);
    exit;
}

$conditions = ["profile_id = ?"];
$params = [$profileId];
$types = "i";

if ($mode) {
    $conditions[] = "mode = ?";
    $params[] = $mode;
    $types .= "s";
}

if ($dateFrom) {
    $conditions[] = "DATE(start_time) >= ?";
    $params[] = $dateFrom;
    $types .= "s";
}

if ($dateTo) {
    $conditions[] = "DATE(start_time) <= ?";
    $params[] = $dateTo;
    $types .= "s";
}

$sql = "SELECT id, profile_id, mode, start_time, end_time, data
        FROM sessions
        WHERE " . implode(" AND ", $conditions) . "
        ORDER BY start_time ASC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param($types, ...$params);
$stmt->execute();

$result = $stmt->get_result();
$sessions = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'sessions' => $sessions]);
?>
