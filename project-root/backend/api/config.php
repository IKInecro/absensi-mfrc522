<?php
// config.php
// Konfigurasi global untuk API backend Absensi RFID
// - PHP 8+ recommended
// - Pastikan ext-pdo_mysql aktif
// - Timezone: Asia/Jakarta

// ---------- INSTRUKSI PENTING ----------
// 1. Letakkan file ini di backend/api/config.php
// 2. Buat file .env di folder backend/ (jika ingin), contoh format di bawah.
// 3. Pastikan folder ../logs/ dapat ditulis oleh webserver (chmod 775 atau 755 sesuai konfigurasi).
// 4. Jangan commit password ke VCS. Gunakan .env atau konfigurasi server.

// ---------- SAMPLE .env (optional) ----------
// DB_HOST=127.0.0.1
// DB_PORT=3306
// DB_NAME=absensi_rfid
// DB_USER=root
// DB_PASS=
// APP_DEBUG=true
// APP_TIMEZONE=Asia/Jakarta

// ---------- LOAD ENV (optional but recommended) ----------
// Jika ingin, install phpdotenv atau load manually. Berikut fallback simple yang membaca file .env jika ada.
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2) + [1 => null]);
        if ($k && !array_key_exists($k, $_ENV)) {
            putenv("$k=$v");
            $_ENV[$k] = $v;
        }
    }
}

// ---------- APP SETTINGS ----------
define('APP_DEBUG', getenv('APP_DEBUG') === 'true' || getenv('APP_DEBUG') === '1' || false);
define('APP_TIMEZONE', getenv('APP_TIMEZONE') ?: 'Asia/Jakarta');

// set timezone untuk PHP
date_default_timezone_set(APP_TIMEZONE);

// ---------- DB CONFIG ----------
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'absensi_rfid';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') ?: '';

// ---------- LOGGING ----------
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// simple logger helper
function app_log(string $level, string $message, array $meta = []) {
    global $logDir;
    $time = (new DateTime('now', new DateTimeZone(APP_TIMEZONE)))->format('Y-m-d H:i:s');
    $line = sprintf("[%s] %s: %s %s\n", $time, strtoupper($level), $message, json_encode($meta, JSON_UNESCAPED_UNICODE));
    file_put_contents($logDir . '/app.log', $line, FILE_APPEND | LOCK_EX);
}

// ---------- ERROR HANDLING & RESPONSE HELPERS ----------
// return JSON response with consistent shape: { success, message, data }
function json_response($data = null, string $message = '', bool $success = true, int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// central exception handler
set_exception_handler(function($e) {
    app_log('ERROR', 'Uncaught Exception: ' . $e->getMessage(), [
        'file' => $e->getFile(), 'line' => $e->getLine()
    ]);
    if (APP_DEBUG) {
        json_response(null, 'Server error: ' . $e->getMessage(), false, 500);
    }
    json_response(null, 'Server error', false, 500);
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    app_log('ERROR', "PHP Error: $errstr", ['errno'=>$errno,'file'=>$errfile,'line'=>$errline]);
    // Convert to exception to be handled by exception handler
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// CORS - adjust origin for production
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // allow requests from frontend host; in dev you can set to '*' but production should limit
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------- PDO CONNECTION (secure) ----------
$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName);
try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = '" . addslashes((new DateTimeZone(APP_TIMEZONE))->getName()) . "'"
    ]);
} catch (PDOException $e) {
    app_log('ERROR', 'DB Connection failed: ' . $e->getMessage());
    if (php_sapi_name() === 'cli') {
        throw $e;
    }
    json_response(null, 'Database connection error', false, 500);
}

// ---------- UTILITY: READ JSON BODY ----------
function body_json() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return null;
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) return null;
    return $data;
}

// ---------- UTILITY: require_auth (placeholder) ----------
// Implement token-based auth (JWT) or session auth here. For MVP this is a placeholder.
function require_auth() {
    // Example: check Authorization: Bearer <token>
    // If not authenticated -> json_response(null,'Unauthorized',false,401);
}

// ---------- UTILITY: fetch app setting ----------
function app_get_setting(PDO $pdo, string $key, $default = null) {
    $stmt = $pdo->prepare('SELECT v FROM app_settings WHERE k = :k LIMIT 1');
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch();
    return $row ? $row['v'] : $default;
}

// ---------- EXPOSED GLOBALS for other API files ----------
// $pdo (PDO instance)
// helper functions: json_response, app_log, body_json, app_get_setting

// Example usage in other API endpoints:
// require_once __DIR__ . '/config.php';
// $register_mode = (int) app_get_setting($pdo, 'register_mode_global', 0);

// End of config.php
