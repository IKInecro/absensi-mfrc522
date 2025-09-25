<?php
/**
 * settings.php
 * API untuk mengambil dan memperbarui pengaturan global sistem absensi
 * Contoh pengaturan: jam_masuk, register_mode, dark_mode
 * 
 * METHOD:
 *   GET     -> ambil semua pengaturan
 *   PUT/PATCH -> update pengaturan tertentu { name, value }
 */

header('Content-Type: application/json');
date_default_timezone_set('Asia/Jakarta');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    // koneksi database (PDO)
    $pdo = DB::connect();

    if ($method === 'GET') {
        // --- Ambil semua pengaturan ---
        $stmt = $pdo->query("SELECT name, value FROM settings ORDER BY name ASC");
        $data = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit;
    }

    if (in_array($method, ['PUT','PATCH'])) {
        // --- Update pengaturan tertentu ---
        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['name'], $input['value'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Parameter name dan value harus disertakan'
            ]);
            exit;
        }

        $name  = trim($input['name']);
        $value = trim((string)$input['value']);

        // Validasi nama setting (opsional: batasi agar tidak sembarang key)
        $allowed = ['register_mode','jam_masuk','dark_mode'];
        if (!in_array($name, $allowed)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Nama setting tidak diizinkan'
            ]);
            exit;
        }

        // Upsert (insert jika belum ada, update jika sudah)
        $stmt = $pdo->prepare("
            INSERT INTO settings (name, value)
            VALUES (:name, :value)
            ON DUPLICATE KEY UPDATE value = :value
        ");
        $stmt->execute([
            ':name' => $name,
            ':value' => $value
        ]);

        echo json_encode([
            'success' => true,
            'message' => "Setting '$name' diperbarui",
            'data' => ['name'=>$name,'value'=>$value]
        ]);
        exit;
    }

    // Jika method lain dipanggil
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method tidak diizinkan'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error',
        'error'   => $e->getMessage()
    ]);
    // optional: tulis log ke backend/logs
}
