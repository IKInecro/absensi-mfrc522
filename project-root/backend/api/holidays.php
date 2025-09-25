<?php
/**
 * API JSON untuk CRUD hari libur / half-day
 * Endpoint:
 *   GET    /api/holidays.php            -> list semua libur
 *   POST   /api/holidays.php            -> tambah libur
 *   PUT    /api/holidays.php?id=ID      -> update libur
 *   DELETE /api/holidays.php?id=ID      -> hapus libur
 *
 * Format JSON:
 * { success: bool, message: string, data: mixed }
 */

require_once 'config.php';
header('Content-Type: application/json');

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // list semua hari libur, urut berdasarkan tanggal terbaru
        $stmt = $pdo->query("SELECT * FROM holidays ORDER BY date ASC");
        echo json_encode(['success'=>true,'data'=>$stmt->fetchAll()]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['date'],$input['type'],$input['description']))
            throw new Exception("Data tidak lengkap");

        $stmt = $pdo->prepare("INSERT INTO holidays (date,type,description) VALUES (?,?,?)");
        $stmt->execute([
            $input['date'],
            $input['type'],       // full / half
            $input['description']
        ]);
        echo json_encode(['success'=>true,'message'=>'Hari libur berhasil ditambahkan']);
        exit;
    }

    if ($method === 'PUT') {
        if (!isset($_GET['id'])) throw new Exception("Parameter id wajib");
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['date'],$input['type'],$input['description']))
            throw new Exception("Data tidak lengkap");

        $stmt = $pdo->prepare("UPDATE holidays
                               SET date=?, type=?, description=?
                               WHERE id=?");
        $stmt->execute([
            $input['date'],
            $input['type'],
            $input['description'],
            $_GET['id']
        ]);
        echo json_encode(['success'=>true,'message'=>'Hari libur berhasil diperbarui']);
        exit;
    }

    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) throw new Exception("Parameter id wajib");
        $stmt = $pdo->prepare("DELETE FROM holidays WHERE id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success'=>true,'message'=>'Hari libur berhasil dihapus']);
        exit;
    }

    throw new Exception("Metode tidak didukung");
}
catch(Exception $e){
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
