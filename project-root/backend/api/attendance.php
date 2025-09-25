<?php
/**
 * attendance.php
 * Endpoint input dan riwayat absensi
 * Method: GET (riwayat/filter), POST (input absen)
 * Status: hadir, terlambat, libur, tidak dikenal
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Filter: ?date=YYYY-MM-DD&class=X&device_id=Y
        $params = [];
        $sql = "SELECT a.*, s.name AS student_name, s.class, d.name AS device_name
                FROM attendance a
                LEFT JOIN students s ON a.student_id=s.id
                LEFT JOIN devices d ON a.device_id=d.id
                WHERE 1=1";
        if (!empty($_GET['date'])) {
            $sql .= " AND DATE(a.timestamp)=?";
            $params[] = $_GET['date'];
        }
        if (!empty($_GET['class'])) {
            $sql .= " AND s.class=?";
            $params[] = $_GET['class'];
        }
        if (!empty($_GET['device_id'])) {
            $sql .= " AND a.device_id=?";
            $params[] = intval($_GET['device_id']);
        }
        $sql .= " ORDER BY a.timestamp DESC";
        $rows = DB_QUERY($sql, $params)->fetchAll();
        send_json(true, "Attendance fetched", $rows);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['device_id']) || empty($input['uid'])) {
            send_json(false, "device_id and uid required");
        }
        $device_id = intval($input['device_id']);
        $uid = htmlspecialchars($input['uid']);

        // Cek jadwal & libur
        $now = new DateTime('now', new DateTimeZone('Asia/Jakarta'));
        $day = strtolower($now->format('l')); // monday, tuesday...
        $time = $now->format('H:i:s');

        // cek libur
        $isHoliday = DB_QUERY("SELECT * FROM holidays WHERE date=?", [$now->format('Y-m-d')])->fetch();

        $status = 'hadir';
        if ($isHoliday) {
            $status = 'libur';
        } else {
            $sched = DB_QUERY("SELECT * FROM schedule WHERE day=?", [$day])->fetch();
            if ($sched && $time > $sched['late_time']) {
                $status = 'terlambat';
            }
        }

        // cari kartu
        $card = DB_QUERY("SELECT * FROM cards WHERE uid=? AND active=1", [$uid])->fetch();
        if (!$card) {
            $status = 'tidak dikenal';
            $student_id = null;
        } else {
            $student_id = $card['student_id'];
        }

        // simpan absensi
        DB_QUERY("INSERT INTO attendance(student_id, device_id, uid, status) VALUES(?,?,?,?)", [
            $student_id,
            $device_id,
            $uid,
            $status
        ]);

        // kirim event SSE (lihat events.php untuk implementasi SSE)
        // catatan: untuk trigger manual SSE bisa pakai pusher atau redis jika perlu

        send_json(true, "Attendance recorded", [
            'student_id' => $student_id,
            'status' => $status,
            'timestamp' => $now->format('Y-m-d H:i:s')
        ]);
        break;

    default:
        send_json(false, "Invalid method");
}
?>