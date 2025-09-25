<?php
/**
 * db.php
 * Koneksi PDO MySQL menggunakan config.php
 * - Dipanggil oleh semua endpoint API
 * - Menggunakan prepared statements secara default
 */

require_once __DIR__ . '/config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    log_error("DB Connection failed: " . $e->getMessage());
    send_json(false, "Database connection error");
}

// Fungsi helper untuk query cepat
defined('DB_QUERY') or define('DB_QUERY', function($sql, $params = []) use ($pdo) {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt;
});

// Contoh penggunaan di endpoint:
// $rows = DB_QUERY('SELECT * FROM students WHERE id=?', [$id])->fetchAll();
// send_json(true, 'Data fetched', $rows);
?>
