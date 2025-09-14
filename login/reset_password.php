<?php
session_start();

header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';

    if (empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit;
    }

    $stmt = $conn->prepare("SELECT username FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user) {
        $username = $user['username'];
        $token = bin2hex(random_bytes(32));
        $stmt = $conn->prepare("UPDATE users SET token = ? WHERE email = ?");
        $stmt->bind_param("ss", $token, $email);
        if ($stmt->execute()) {
            $to = $email;
		  $subject = "Sakkadentraining.ch - Passwort zurücksetzen";
            $link = "https://sakkadentraining.ch/set_password.php?token=$token";
		  $message = "Guten Tag $username,\n\nKlicken Sie auf den untenstehenden Link um Ihr Passwort zurückzusetzen:\n$link\n\nBeste Grüsse,\nSakkadentraining.ch";
            $headers = "From: info@sakkadentraining.ch\r\nReply-To: info@sakkadentraining.ch";
            if (mail($to, $subject, $message, $headers)) {
                echo json_encode(['success' => true, 'message' => 'Ein Link wurde an Ihre E-Mail Adresse gesendet!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'E-Mail konnte nicht gesendet werden...']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to generate reset token']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'E-Mail Adresse nicht gefunden!']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
$conn->close();
?>