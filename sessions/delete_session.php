<?php
// delete_session.php

// Always return JSON
header('Content-Type: application/json');

try {
    // Allow only POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Nur POST-Requests erlaubt.');
    }

    // Check if session_id is provided
    if (!isset($_POST['session_id'])) {
        throw new Exception('Session-ID fehlt.');
    }

    $sessionId = intval($_POST['session_id']);

require_once __DIR__ . '/../db/db.php';

    // Create database connection
    $db = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($db->connect_error) {
        throw new Exception('Datenbankverbindung fehlgeschlagen: ' . $db->connect_error);
    }

    // Prepare and execute delete
    $stmt = $db->prepare('DELETE FROM sessions WHERE id = ?');
    if (!$stmt) {
        throw new Exception('Fehler beim Vorbereiten der Anfrage: ' . $db->error);
    }

    $stmt->bind_param('i', $sessionId);

    if (!$stmt->execute()) {
        throw new Exception('Fehler beim Löschen: ' . $stmt->error);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
