<?php
/**
 * Server-Sent Events (SSE) untuk live feed absensi & status device
 *
 * Frontend akan subscribe ke:
 *    const sse = new EventSource('/api/events.php');
 *
 * Event:
 *    data: {
 *       type: "attendance" | "device",
 *       payload: {...}
 *    }
 *
 * Note:
 *  - Pastikan `ignore_user_abort(true)` agar koneksi tetap hidup walau client refresh.
 *  - Gunakan mekanisme polling DB sederhana untuk contoh ini.
 */

require_once 'config.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

ignore_user_abort(true);
set_time_limit(0);

// last id dari client (optional untuk event replay)
$lastId = isset($_SERVER['HTTP_LAST_EVENT_ID']) ? intval($_SERVER['HTTP_LAST_EVENT_ID']) : 0;

// waktu start
$start = time();

while (true) {
    // Tutup koneksi jika client memutuskan
    if (connection_aborted()) break;

    // Ambil absensi baru sejak lastId
    $stmt = $pdo->prepare("SELECT id, student_id, uid, device_id, status, created_at
                           FROM attendance
                           WHERE id > ?
                           ORDER BY id ASC");
    $stmt->execute([$lastId]);
    $rows = $stmt->fetchAll();

    foreach ($rows as $row) {
        $lastId = $row['id'];
        $payload = [
            'type'    => 'attendance',
            'payload' => $row
        ];
        echo "id: {$lastId}\n";
        echo "data: " . json_encode($payload) . "\n\n";
    }

    // Device heartbeat → status online/offline
    $stmt2 = $pdo->query("SELECT id, name, last_heartbeat,
                          IF(TIMESTAMPDIFF(SECOND,last_heartbeat,NOW())<30,'online','offline') as status
                          FROM devices");
    $devices = $stmt2->fetchAll();
    $payload2 = [
        'type'    => 'device',
        'payload' => $devices
    ];
    echo "event: device\n";
    echo "data: " . json_encode($payload2) . "\n\n";

    @ob_flush();
    @flush();

    // loop setiap 3 detik
    sleep(3);

    // timeout 60 detik untuk mencegah loop infinite di server
    if ((time() - $start) > 60) break;
}
