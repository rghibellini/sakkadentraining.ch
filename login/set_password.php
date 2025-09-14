<?php
// profiles/set_password.php  (minimale, rückwärtskompatible Härtung)
require_once __DIR__ . '/../db/db.php';

/**
 * Debug nur bei Bedarf aktivieren:
 * mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
 * error_reporting(E_ALL); ini_set('display_errors', 1);
 */

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
error_reporting(E_ALL); ini_set('display_errors', 1);

// Kompatibilität: $db oder $conn zulassen
if (!isset($db) && isset($conn)) {
    $db = $conn;
}

$token = $_GET['token'] ?? $_POST['token'] ?? '';
if (!$token) {
    die('Ungültiger oder fehlender Link.');
}

$error = '';
$success = false;
$successMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm']  ?? '';
    $token    = $_POST['token']    ?? $token;

    if ($password !== $confirm) {
        $error = 'Passwörter stimmen nicht überein.';
    } elseif (strlen($password) < 6) {
        $error = 'Passwort muss mindestens 6 Zeichen lang sein.';
    } elseif (!$db) {
        $error = 'Keine Datenbankverbindung.';
    } else {
        // 1) Token -> User auflösen (LIMIT 1)
        $stmt = $db->prepare("SELECT id FROM users WHERE token = ? LIMIT 1");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        $user   = $result ? $result->fetch_assoc() : null;
        $stmt->close();

        if (!empty($user['id'])) {
            // 2) Passwort hashen (Spaltenlänge in DB: VARCHAR(255) empfohlen)
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // 3) Update + Token invalidieren
            $update = $db->prepare("UPDATE users SET password = ?, token = NULL WHERE id = ? LIMIT 1");
            $update->bind_param("si", $hashed_password, $user['id']);
            $update->execute();

            // 4) Erfolg nur bei tatsächlich veränderter Zeile melden
            if ($update->affected_rows < 1) {
                $error = 'Aktualisierung fehlgeschlagen.';
                // Fehler optional loggen:
                // error_log('Update affected_rows=0; id=' . $user['id'] . '; mysqli_error=' . $db->error);
            } else {
                $success = true;
                $successMessage = 'Passwort wurde erfolgreich gespeichert!';
            }
            $update->close();
        } else {
            $error = 'Ungültiger oder abgelaufener Link.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passwort setzen - Sakkaden Training</title>
    <link rel="stylesheet" href="/styles.css">
    <style>
        .centered-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
        }
        .login-btn {
            margin-top: 2vh;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .feedback-msg.success {
            color: #4caf50;
            font-weight: bold;
            text-align: center;
            font-size: 1.2vw;
            margin-top: 2vh;
        }
        .feedback-msg.error {
            color: #e57373;
            text-align: center;
            font-size: 1vw;
            margin-top: 1vh;
        }
        .login-form a.return-link {
            display: block;
            text-align: center;
            margin-top: 3vh;
            font-size: 1vw;
            color: #173C56;
            text-decoration: underline;
        }
	  .password-hint {
		display: block;
		font-size: 0.9em;
		color: #555;
		margin-top: 0.5vh;
		margin-bottom: 1vh;
	  }
    </style>
</head>
<body>
    <div class="centered-wrapper">
        <div class="login-form small-form">
            <h2>Passwort setzen</h2>
            <?php if (!empty($error)): ?>
                <p class="feedback-msg error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
            <?php endif; ?>

            <?php if (!empty($successMessage)): ?>
                <p class="feedback-msg success"><?= htmlspecialchars($successMessage, ENT_QUOTES, 'UTF-8') ?></p>
                <a href="/index.php" class="return-link">Zurück zum Login</a>
            <?php elseif (!$success): ?>
                <form method="POST" action="">
                    <label for="password">Passwort:</label>
                    <input type="password" name="password" id="password" autocomplete="new-password" required>
					<small class="password-hint">Das Passwort muss mindestens 6 Zeichen lang sein.</small>
				  
                    <label for="confirm">Passwort bestätigen:</label>
                    <input type="password" name="confirm" id="confirm" autocomplete="new-password" required>

                    <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
                    <button type="submit" class="login-btn">Passwort setzen</button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
