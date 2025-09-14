<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db/db.php';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

function registerUser($conn, $username, $password) {
    $username = trim($username);
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    if (!$stmt) {
        return ['success' => false, 'message' => 'Database error: ' . $conn->error];
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $stmt->close();
        return ['success' => false, 'message' => 'Username already taken'];
    }
    $stmt->close();

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    if (!$stmt) {
        return ['success' => false, 'message' => 'Database error: ' . $conn->error];
    }
    $stmt->bind_param("ss", $username, $hashed_password);
    if ($stmt->execute()) {
        $stmt->close();
        return ['success' => true, 'message' => 'User registered successfully'];
    } else {
        $stmt->close();
        return ['success' => false, 'message' => 'Registration failed: ' . $stmt->error];
    }
}

function loginUser($conn, $username, $password) {
    $username = trim($username);
    $stmt = $conn->prepare("SELECT id, password, expires FROM users WHERE username = ?");
    if (!$stmt) {
        return ['success' => false, 'message' => 'Fehler in der Datenbank: ' . $conn->error];
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user) {
        // Check if the account has expired
        if ($user['expires'] !== null && time() > (int)$user['expires']) {
            return ['success' => false, 'message' => 'Zugang abgelaufen.'];
        }

        // Proceed with password verification
        if (strpos($user['password'], '$2y$') === 0) {
            if (password_verify($password, $user['password'])) {
                $_SESSION['loggedin'] = true;
                $_SESSION['username'] = $username;
                $_SESSION['user_id'] = $user['id'];

                // Generate token
                $token = bin2hex(random_bytes(16));
                $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $stmt = $conn->prepare("INSERT INTO login_tokens (token, user_id, expires_at) VALUES (?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("sis", $token, $user['id'], $expires_at);
                    $stmt->execute();
                    $stmt->close();
                    error_log("Generated token for user {$user['id']}: $token");
                } else {
                    error_log("Failed to prepare token insert: " . $conn->error);
                }

                return ['success' => true, 'message' => 'Login erfolgreich', 'token' => $token];
            } else {
                return ['success' => false, 'message' => 'Ungültiger Benutzername oder Passwort'];
            }
        } else {
            if ($password === $user['password']) {
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
                $update_stmt->bind_param("si", $hashed_password, $user['id']);
                $update_stmt->execute();
                $update_stmt->close();

                $_SESSION['loggedin'] = true;
                $_SESSION['username'] = $username;
                $_SESSION['user_id'] = $user['id'];

                $token = bin2hex(random_bytes(16));
                $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $stmt = $conn->prepare("INSERT INTO login_tokens (token, user_id, expires_at) VALUES (?, ?, ?)");
                if ($stmt) {
                    $stmt->bind_param("sis", $token, $user['id'], $expires_at);
                    $stmt->execute();
                    $stmt->close();
                    error_log("Generated token for user {$user['id']}: $token");
                } else {
                    error_log("Failed to prepare token insert: " . $conn->error);
                }

                return ['success' => true, 'message' => 'Login erfolgreich, Passwort aktualisiert', 'token' => $token];
            } else {
                return ['success' => false, 'message' => 'Ungültiger Benutzername oder Passwort'];
            }
        }
    } else {
        return ['success' => false, 'message' => 'Ungültiger Benutzername oder Passwort'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Benutzername oder Passwort fehlt']);
        exit;
    }

    if ($action === 'register') {
        $response = registerUser($conn, $username, $password);
        echo json_encode($response);
    } elseif ($action === 'login') {
        $response = loginUser($conn, $username, $password);
        echo json_encode($response);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ungültig']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$conn->close();
?>