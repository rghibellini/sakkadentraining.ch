<?php
session_start();

header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Datenbankverbindung fehlgeschlagen']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $user_type = $_POST['user_type'] ?? '';
    $purpose = $_POST['purpose'] ?? '';

    if (empty($username) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Benutzername und E-Mail sind erforderlich']);
        exit;
    }

    // Prüfen, ob Benutzername oder E-Mail bereits existieren
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Benutzername oder E-Mail bereits vergeben']);
        exit;
    }
    $stmt->close();

    // Neuen Benutzer einfügen
    $stmt = $conn->prepare("INSERT INTO users (username, email, user_type, purpose, invited) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssss", $username, $email, $user_type, $purpose);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registrierung fehlgeschlagen: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Ungültige Anfragemethode']);
}
$conn->close();
?>