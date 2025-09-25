<?php
/**
 * API JSON untuk CRUD jadwal masuk/terlambat/pulang per hari
 * Endpoint:
 *   GET    /api/schedule.php        -> list semua jadwal
 *   POST   /api/schedule.php        -> tambah jadwal
 *   PUT    /api/schedule.php?id=ID  -> update jadwal
 *   DELETE /api/schedule.php?id=ID  -> hapus jadwal
 *
 * Format JSON:
 * { success: bool, message: string, data: mixed }
 */

require_once 'config.php';
header('Content-Type: application/json');

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // list semua jadwal
        $stmt = $pdo->query("SELECT * FROM schedule ORDER BY FIELD(day,
            'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')");
        echo json_encode(['success'=>true,'data'=>$stmt->fetchAll()]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['day'],$input['start_time'],$input['late_time'],$input['end_time']))
            throw new Exception("Data tidak lengkap");

        $stmt = $pdo->prepare("INSERT INTO schedule (day,start_time,late_time,end_time)
                               VALUES (?,?,?,?)");
        $stmt->execute([
            $input['day'],
            $input['start_time'],
            $input['late_time'],
            $input['end_time']
        ]);
        echo json_encode(['success'=>true,'message'=>'Jadwal berhasil ditambahkan']);
        exit;
    }

    if ($method === 'PUT') {
        if (!isset($_GET['id'])) throw new Exception("Parameter id wajib");
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['day'],$input['start_time'],$input['late_time'],$input['end_time']))
            throw new Exception("Data tidak lengkap");

        $stmt = $pdo->prepare("UPDATE schedule
                               SET day=?, start_time=?, late_time=?, end_time=?
                               WHERE id=?");
        $stmt->execute([
            $input['day'],
            $input['start_time'],
            $input['late_time'],
            $input['end_time'],
            $_GET['id']
        ]);
        echo json_encode(['success'=>true,'message'=>'Jadwal berhasil diperbarui']);
        exit;
    }

    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) throw new Exception("Parameter id wajib");
        $stmt = $pdo->prepare("DELETE FROM schedule WHERE id=?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(['success'=>true,'message'=>'Jadwal berhasil dihapus']);
        exit;
    }

    throw new Exception("Metode tidak didukung");
}
catch(Exception $e){
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
