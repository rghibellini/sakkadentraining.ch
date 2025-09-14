<?php
session_start();
session_unset(); // Clear all session variables
session_destroy(); // End the session
header("Location: index.php"); // Redirect to login
exit;
?>