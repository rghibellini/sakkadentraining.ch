<?php
// Start the session (optional here, but included for completeness; not used for auth)
session_start();

// Set the response content type to JSON
header('Content-Type: application/json');

require_once __DIR__ . '/../db/db.php';

// Establish database connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Retrieve username and password from the POST request
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Benutzername und Passwort sind erforderlich']);
    exit;
}

// Fetch user data based on the provided username
$stmt = $conn->prepare("SELECT id, password, expires FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

// Check if the user exists
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Benutzername nicht gefunden']);
    exit;
}

// Verify the provided password against the stored hash
if (password_verify($password, $user['password'])) {
    $now = time();
    // Check if the account has expired
    if ($user['expires'] && $now > $user['expires']) {
        echo json_encode(['success' => false, 'message' => 'Account ist abgelaufen']);
    } else {
        // Begin a transaction to delete related data and the user
        $conn->begin_transaction();
        try {
            // Step 1: Delete from login_tokens (if this table exists)
            $stmt = $conn->prepare("DELETE FROM login_tokens WHERE user_id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->close();

            // Step 2: Delete from sessions using a JOIN with profiles
            $stmt = $conn->prepare("DELETE s FROM sessions s JOIN profiles p ON s.profile_id = p.id WHERE p.user_id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->close();

            // Step 3: Delete from profiles
            $stmt = $conn->prepare("DELETE FROM profiles WHERE user_id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->close();

            // Step 4: Delete from users
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->close();

            // Commit the transaction
            $conn->commit();

            // Since the user isn’t logged in, no session cleanup is needed
            echo json_encode(['success' => true, 'message' => 'Ihr Account wurde gelöscht!']);
        } catch (Exception $e) {
            // Roll back the transaction on error
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Fehler beim Löschen des Accounts: ' . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Ungültiges Passwort']);
}

// Close the database connection
$conn->close();
?>